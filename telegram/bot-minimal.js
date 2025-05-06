// Script minimalista para el bot de Telegram (enfoque sin n8n)
// Basado en el ejemplo de chat-interface-portable
require('dotenv').config();
const { Telegraf } = require('telegraf');
const axios = require('axios');
const { createClient } = require('@supabase/supabase-js');

// Función para imprimir objetos completos para debugging
const debug = (obj) => console.log(JSON.stringify(obj, null, 2));

// Configuración del bot
const bot = new Telegraf(process.env.TELEGRAM_BOT_TOKEN);
const API_TOKEN = process.env.TELEGRAM_API_TOKEN || 'token-secreto';
const API_ENDPOINT = process.env.API_ENDPOINT || 'https://un-canal-sobre-ia.vercel.app/api/telegram-news';

// Configuración de Supabase
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

// Sistema simple de estados de usuario (en memoria, se pierde al reiniciar)
const userStates = {};

// Funciones para manejar estados de usuario
const setUserState = (userId, state) => {
  userStates[userId] = {
    ...state,
    timestamp: Date.now()
  };
  return userStates[userId];
};

const getUserState = (userId) => {
  return userStates[userId] || null;
};

const clearUserState = (userId) => {
  delete userStates[userId];
};

// LISTA DE USUARIOS AUTORIZADOS (IDs de Telegram)
const AUTHORIZED_USERS = process.env.AUTHORIZED_TELEGRAM_USERS
  ? process.env.AUTHORIZED_TELEGRAM_USERS.split(',')
  : [];

// Middleware para restringir acceso
bot.use(async (ctx, next) => {
  console.log('Usuario intentando acceder:', ctx.from?.id, 'Usuarios autorizados:', AUTHORIZED_USERS);
  
  // Si la lista está vacía o contiene el ID del usuario, permitir acceso
  if (!AUTHORIZED_USERS.length || (ctx.from && AUTHORIZED_USERS.includes(String(ctx.from.id)))) {
    return next();
  }
  
  await ctx.reply(`⛔ No tienes permiso para usar este bot. Tu ID es: ${ctx.from?.id}`);
});

// Comando de inicio
bot.start((ctx) => ctx.reply(
  `👋 ¡Bienvenido al Bot de Un Canal Sobre IA!\n\n` +
  `Para generar una noticia, simplemente envíame una URL de un artículo interesante.\n` +
  `Yo usaré OpenAI para crear una versión para nuestro sitio web y la publicaré automáticamente.`
));

// Comando de ayuda
bot.help((ctx) => ctx.reply(
  `📱 *Instrucciones:*\n\n` +
  `- Envía una URL de un artículo\n` +
  `- Espera mientras se procesa (30-60 segundos)\n` +
  `- Recibirás el enlace a la noticia publicada\n\n` +
  `📍 *Comandos:*\n` +
  `/start - Inicia el bot\n` +
  `/help - Muestra ayuda\n` +
  `/status - Verifica conexión`,
  { parse_mode: 'Markdown' }
));

// Verificar estado 
bot.command('status', async (ctx) => {
  await ctx.reply('🔄 Verificando conexión...');
  
  try {
    const response = await axios.post(API_ENDPOINT, 
      { url: 'https://example.com', token: API_TOKEN }, 
      { timeout: 5000 }
    );
    
    await ctx.reply(
      `✅ *Conexión establecida*\n\n` +
      `API configurada en: \`${API_ENDPOINT}\`\n` +
      `Status: ${response.status}`,
      { parse_mode: 'Markdown' }
    );
  } catch (error) {
    await ctx.reply(
      `❌ *Error de conexión*\n\n` +
      `API endpoint: \`${API_ENDPOINT}\`\n` +
      `Error: ${error.message}`,
      { parse_mode: 'Markdown' }
    );
  }
});

// Manejador para URLs
bot.on('text', async (ctx) => {
  const messageText = ctx.message.text;
  
  // Ignorar comandos
  if (messageText.startsWith('/')) return;
  
  // Verificar que sea una URL válida
  if (!messageText.match(/^https?:\/\//i)) {
    return ctx.reply('⚠️ Por favor, envía una URL válida que comience con http:// o https://');
  }
  
  await ctx.reply(`🔄 Procesando URL... Esto puede tomar hasta un minuto.`);
  
  try {
    // Mostrar más información para debugging
    console.log(`Procesando URL: ${messageText}`);
    console.log(`API Endpoint: ${API_ENDPOINT}`);
    console.log(`Token disponible: ${API_TOKEN ? 'Sí' : 'No'}`);
    
    // Mostrar status escribiendo...
    await ctx.telegram.sendChatAction(ctx.chat.id, 'typing');
    
    // Preparar los datos para enviar
    const postData = {
      url: messageText,
      token: API_TOKEN,
      source: 'telegram',
      user_id: ctx.from.id.toString()
    };
    
    console.log('Datos a enviar:', postData);
    
    // Llamar al endpoint con timeout extendido y más información
    const response = await axios.post(API_ENDPOINT, postData, {
      timeout: 60000, // 60 segundos
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    console.log('Respuesta recibida, status:', response.status);
    // Mejor log de la respuesta
    try {
      console.log('Datos de respuesta:', JSON.stringify(response.data, null, 2));
    } catch (e) {
      console.log('Error al formatear respuesta:', e.message);
      console.log('Datos brutos:', response.data);
    }
    
    // Extraer y validar los datos del artículo
    const success = response.data.success === true;
    const article = response.data.article;
    
    console.log('Success:', success);
    console.log('Artículo:', article ? JSON.stringify(article, null, 2) : 'No disponible');
    
    if (success && article) {
      const articleId = article.id || '999';
      const articleUrl = `https://un-canal-sobre-ia.vercel.app/noticias/${articleId}`;
      const title = article.title || 'Artículo de prueba';
      
      // Escapar caracteres especiales en el título para evitar problemas con Markdown
      const safeTitle = title.replace(/[_*[\]()~`>#+-=|{}.!]/g, '\\$&');
      
      // Usar MarkdownV2 que es más seguro para controlar el formato
      await ctx.reply(
        `✅ Conexión exitosa\!\n\n` +
        `📰 ${safeTitle}\n\n` +
        `🔗 Ver noticia: ${articleUrl}`,
        { 
          disable_web_page_preview: false 
        }
      );
      
      // Guardar estado del usuario esperando imagen
      setUserState(ctx.from.id, {
        waitingForImage: true,
        articleId: articleId,
        articleTitle: title
      });
      
      // Pedir al usuario que envíe una imagen para la noticia
      await ctx.reply('Ahora, por favor envíame una imagen para asociar a esta noticia. La imagen se usará como cabecera.');
    } else {
      console.error('Error en respuesta:', response.data);
      await ctx.reply(`❌ Error: ${response.data.message || 'Respuesta inesperada del servidor'}`);
    }
  } catch (error) {
    console.error('Error procesando URL:');
    
    if (error.response) {
      // La solicitud fue realizada y el servidor respondió con un código de error
      console.log('=============================================');
      console.log('ERROR DETALLADO:');
      console.log('Status:', error.response.status);
      console.log('Datos:', JSON.stringify(error.response.data, null, 2));
      console.log('Headers:', JSON.stringify(error.response.headers, null, 2));
      console.log('=============================================');
      
      // Simplificar el mensaje de error para evitar problemas de formato en Telegram
      let errorMessage = 'Error desconocido';
      try {
        if (error.response.data.error) {
          errorMessage = error.response.data.error;
        }
      } catch (e) {
        console.log('Error al extraer mensaje de error:', e);
      }
      
      await ctx.reply(
        `\u274c Error del servidor (${error.response.status})\n\n${errorMessage}`,
        { parse_mode: undefined }
      );
    } else if (error.request) {
      // La solicitud fue realizada pero no se recibió respuesta
      console.error('Sin respuesta del servidor:', error.request);
      await ctx.reply(
        `❌ *No hubo respuesta del servidor*\n\n` +
        `Comprueba que el servidor esté en funcionamiento y que ${API_ENDPOINT} sea accesible.`,
        { parse_mode: 'Markdown' }
      );
    } else {
      // Ocurrió un error al configurar la solicitud
      console.error('Error en la configuración de la solicitud:', error.message);
      await ctx.reply(
        `❌ *Error en la solicitud*\n\n` +
        `Mensaje: ${error.message}`,
        { parse_mode: 'Markdown' }
      );
    }
  }
});

// Iniciar el bot
bot.launch()
  .then(() => console.log('🤖 Bot iniciado correctamente'))
  .catch(err => console.error('Error iniciando el bot:', err));

// Manejador para recibir fotos/imágenes
bot.on('photo', async (ctx) => {
  const userId = ctx.from.id;
  const userState = getUserState(userId);
  
  // Si no está esperando una imagen, ignorar
  if (!userState || !userState.waitingForImage || !userState.articleId) {
    return ctx.reply('No hay ninguna noticia pendiente de imagen. Primero envía una URL para generar una noticia.');
  }
  
  await ctx.reply('🔄 Procesando imagen... Por favor espera.');
  
  try {
    // Obtener la versión de mayor calidad de la foto
    const fileId = ctx.message.photo[ctx.message.photo.length - 1].file_id;
    const fileLink = await ctx.telegram.getFileLink(fileId);
    
    console.log(`Imagen recibida: ${fileLink.href}`);
    
    // Descargar la imagen como buffer
    const imageResponse = await axios.get(fileLink.href, { responseType: 'arraybuffer' });
    const buffer = Buffer.from(imageResponse.data, 'binary');
    
    console.log(`Imagen descargada, tamaño: ${buffer.length} bytes`);
    
    // Nombre de archivo único basado en ID del artículo y timestamp
    const fileName = `${userState.articleId}-${Date.now()}.jpg`;
    
    // Subir a Supabase Storage
    const { data, error } = await supabase.storage
      .from('news-images')
      .upload(`noticias/${fileName}`, buffer, {
        contentType: 'image/jpeg',
        upsert: true
      });
      
    if (error) {
      console.error('Error al subir imagen a Supabase:', error);
      await ctx.reply(`❌ Error al subir la imagen: ${error.message}`);
      return;
    }
    
    console.log('Imagen subida correctamente:', data);
    
    // Obtener la URL pública de la imagen
    const { data: urlData } = supabase.storage
      .from('news-images')
      .getPublicUrl(`noticias/${fileName}`);
      
    const imageUrl = urlData.publicUrl;
    console.log('URL pública de la imagen:', imageUrl);
    
    // Actualizar la noticia con la URL de la imagen
    const { data: updateData, error: updateError } = await supabase
      .from('news')
      .update({ imageUrl: imageUrl })
      .eq('id', userState.articleId);
      
    if (updateError) {
      console.error('Error al actualizar noticia con imagen:', updateError);
      await ctx.reply(`❌ Error al asociar la imagen a la noticia: ${updateError.message}`);
      return;
    }
    
    // Limpiar el estado del usuario
    clearUserState(userId);
    
    // Confirmar al usuario
    await ctx.reply(
      `✅ ¡Imagen asociada correctamente a la noticia!\n\n` +
      `Título: ${userState.articleTitle}\n` +
      `Ver noticia: https://un-canal-sobre-ia.vercel.app/noticias/${userState.articleId}`,
      { disable_web_page_preview: false }
    );
    
  } catch (error) {
    console.error('Error procesando la imagen:', error);
    await ctx.reply(`❌ Error al procesar la imagen: ${error.message}`);
  }
});

// Manejar cierre
process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));
