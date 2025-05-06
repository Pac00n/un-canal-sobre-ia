// Bot de Telegram para el Canal Sobre IA
// Flujo: Telegram → OpenAI → API Web → Supabase → Sitio Web
require('dotenv').config();
const { Telegraf } = require('telegraf');
const { message } = require('telegraf/filters');
const axios = require('axios');
const { OpenAI } = require('openai');

// Configuración del bot 
const bot = new Telegraf(process.env.TELEGRAM_BOT_TOKEN);

// Cliente OpenAI
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

// URL del endpoint (usamos el endpoint mejorado que ya hemos probado)
const API_ENDPOINT = process.env.API_ENDPOINT || 'https://un-canal-sobre-ia.vercel.app/api/n8n-test';

// Middleware para restringir acceso solo a administradores autorizados
const AUTHORIZED_USERS = process.env.AUTHORIZED_TELEGRAM_USERS 
  ? process.env.AUTHORIZED_TELEGRAM_USERS.split(',') 
  : [];

bot.use(async (ctx, next) => {
  if (ctx.from && AUTHORIZED_USERS.includes(String(ctx.from.id))) {
    return next();
  }
  await ctx.reply('⛔ No tienes permiso para usar este bot. Contacta al administrador.');
});

// Comando de inicio
bot.start((ctx) => ctx.reply(
  `👋 Bienvenido al Bot de Un Canal Sobre IA!\n\n` +
  `Para generar una noticia, simplemente envíame una URL o describe un tema.\n` +
  `Yo me encargaré de crear el contenido y publicarlo en el sitio web.`
));

// Comando de ayuda
bot.help((ctx) => ctx.reply(
  `🔍 *Cómo usar este bot:*\n\n` +
  `1. Envía una URL de un artículo interesante\n` +
  `2. O describe un tema para generar una noticia\n` +
  `3. Espera mientras OpenAI genera el contenido\n` +
  `4. Recibe una vista previa y confirma la publicación\n\n` +
  `*Comandos disponibles:*\n` +
  `/start - Inicia el bot\n` +
  `/help - Muestra este mensaje de ayuda\n` +
  `/status - Verifica el estado de los servicios\n` +
  `/cancel - Cancela la operación actual`,
  { parse_mode: 'Markdown' }
));

// Verificar estado de los servicios
bot.command('status', async (ctx) => {
  await ctx.reply('🔄 Verificando estado de los servicios...');
  
  try {
    // Probar conexión con la API
    const apiCheck = await axios.get(API_ENDPOINT.replace('/api/n8n-test', '/api/health') || 'https://un-canal-sobre-ia.vercel.app/api/health', { timeout: 5000 });
    const apiStatus = apiCheck.status === 200 ? '✅ Conectado' : '❌ Error';
    
    // Probar conexión con OpenAI
    let openaiStatus = '❌ Error';
    try {
      await openai.models.list();
      openaiStatus = '✅ Conectado';
    } catch (e) {
      openaiStatus = '❌ Error: ' + e.message.substring(0, 50);
    }
    
    await ctx.reply(
      `📊 *Estado de los servicios:*\n\n` +
      `🌐 API Web: ${apiStatus}\n` +
      `🤖 OpenAI: ${openaiStatus}\n` +
      `🤳 Telegram Bot: ✅ Funcionando\n\n` +
      `Endpoint configurado: \`${API_ENDPOINT}\``,
      { parse_mode: 'Markdown' }
    );
  } catch (error) {
    await ctx.reply(`❌ Error verificando servicios: ${error.message}`);
  }
});

// Cancelar operación actual
bot.command('cancel', (ctx) => {
  // Aquí podríamos implementar lógica para cancelar operaciones en curso
  ctx.reply('✅ Operación cancelada.');
});

// Función para generar contenido con OpenAI
async function generateNewsWithOpenAI(input) {
  const prompt = `
Genera un artículo periodístico basado en esta URL o tema: "${input}"

Debe ser sobre tecnología o inteligencia artificial. 
Formatea la respuesta EXCLUSIVAMENTE como un objeto JSON con esta estructura:

{
  "title": "Título atractivo y conciso",
  "excerpt": "Resumen breve de 1-2 frases",
  "category": "tecnología",
  "imageUrl": "https://picsum.photos/800/600",
  "content": "Contenido completo del artículo, 3-4 párrafos",
  "featured": false
}

NO incluyas comentarios ni texto fuera del objeto JSON.
`;

  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4-turbo-preview", // o el modelo que prefieras usar
      messages: [
        { role: "system", content: "Eres un periodista especializado en tecnología e IA" },
        { role: "user", content: prompt }
      ],
      response_format: { type: "json_object" }
    });

    const responseText = completion.choices[0].message.content.trim();
    
    try {
      // Intentar parsear el JSON
      const jsonResponse = JSON.parse(responseText);
      return { success: true, data: jsonResponse };
    } catch (e) {
      return { 
        success: false, 
        error: "Error parsing JSON from OpenAI", 
        rawResponse: responseText 
      };
    }
  } catch (error) {
    console.error('Error calling OpenAI:', error);
    return { 
      success: false, 
      error: `Error with OpenAI: ${error.message}`,
    };
  }
}

// Función para publicar en la web a través de la API
async function publishToWebsite(newsData) {
  try {
    const response = await axios.post(API_ENDPOINT, newsData, {
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    return {
      success: response.status === 201 || response.status === 200,
      data: response.data,
      id: response.data.newsItem?.id || null
    };
  } catch (error) {
    console.error('Error publishing to website:', error);
    return {
      success: false,
      error: `Error publicando: ${error.message}`,
      response: error.response?.data || null
    };
  }
}

// Manejador principal para URLs o temas de noticias
bot.on(message('text'), async (ctx) => {
  const userInput = ctx.message.text;
  
  // Ignorar comandos
  if (userInput.startsWith('/')) return;
  
  // Verificar si es una URL o un tema
  const isUrl = userInput.match(/https?:\/\//i);
  
  await ctx.reply(`🔄 ${isUrl ? 'Analizando la URL' : 'Generando artículo sobre el tema'}... Esto puede tomar hasta 30 segundos.`);
  
  try {
    // Status "typing" mientras procesamos
    await ctx.telegram.sendChatAction(ctx.chat.id, 'typing');
    
    // Paso 1: Generar contenido con OpenAI
    const generatedContent = await generateNewsWithOpenAI(userInput);
    
    if (!generatedContent.success) {
      return await ctx.reply(`❌ Error generando el contenido: ${generatedContent.error}`);
    }
    
    const newsData = generatedContent.data;
    
    // Paso 2: Mostrar vista previa al usuario
    await ctx.reply(
      `📰 *Vista previa de la noticia generada:*\n\n` +
      `*Título:* ${newsData.title}\n\n` +
      `*Resumen:* ${newsData.excerpt}\n\n` +
      `*Categoría:* ${newsData.category}\n\n` +
      `*¿Publicar esta noticia?* Responde con /publicar para confirmar o /cancel para cancelar.`,
      { parse_mode: 'Markdown' }
    );
    
    // Guardar los datos temporalmente (en un contexto real usaríamos una base de datos o Redis)
    ctx.session = ctx.session || {};
    ctx.session.pendingNews = newsData;
    
  } catch (error) {
    console.error('Error en el flujo principal:', error);
    await ctx.reply(`❌ Error procesando tu solicitud: ${error.message}`);
  }
});

// Comando para confirmar la publicación
bot.command('publicar', async (ctx) => {
  if (!ctx.session || !ctx.session.pendingNews) {
    return await ctx.reply('❌ No hay ninguna noticia pendiente de publicar. Envía primero una URL o tema.');
  }
  
  await ctx.reply('🔄 Publicando la noticia...');
  
  try {
    // Publicar a través de la API
    const publishResult = await publishToWebsite(ctx.session.pendingNews);
    
    if (publishResult.success) {
      const newsId = publishResult.id || 'ID no disponible';
      const newsUrl = `https://un-canal-sobre-ia.vercel.app/noticias/${newsId}`;
      
      await ctx.reply(
        `✅ *¡Noticia publicada con éxito!*\n\n` +
        `*Título:* ${ctx.session.pendingNews.title}\n\n` +
        `*ID:* \`${newsId}\`\n\n` +
        `*Ver en la web:* [Abrir noticia](${newsUrl})`,
        { 
          parse_mode: 'Markdown',
          disable_web_page_preview: false
        }
      );
      
      // Limpiar datos de sesión
      delete ctx.session.pendingNews;
    } else {
      await ctx.reply(
        `❌ *Error al publicar la noticia:*\n\n` +
        `${publishResult.error}\n\n` +
        `Puedes intentar nuevamente con /publicar`,
        { parse_mode: 'Markdown' }
      );
    }
  } catch (error) {
    console.error('Error publicando:', error);
    await ctx.reply(`❌ Error: ${error.message}`);
  }
});

// Gestión de errores
bot.catch((err, ctx) => {
  console.error(`Error en el bot de Telegram: ${err}`);
  ctx.reply(`❌ Ha ocurrido un error inesperado. Por favor, intenta más tarde.`);
});

// Iniciar el bot
bot.launch()
  .then(() => console.log('🤖 Bot iniciado correctamente!'))
  .catch(err => console.error('Error iniciando el bot:', err));

// Gestión de cierre
process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));
