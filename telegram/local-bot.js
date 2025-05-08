// Bot de Telegram local para Un Canal Sobre IA
// No requiere webhook - funciona directamente en tu máquina
require('dotenv').config();
const { Telegraf } = require('telegraf');
const { createClient } = require('@supabase/supabase-js');
const { OpenAI } = require('openai');
const axios = require('axios');
const fs = require('fs');

// Configuración y variables de entorno
const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const AUTHORIZED_USERS = process.env.AUTHORIZED_TELEGRAM_USERS 
  ? process.env.AUTHORIZED_TELEGRAM_USERS.split(',').map(id => parseInt(id.trim()))
  : [474426118]; // Por defecto tu ID

// Inicializar clientes
const bot = new Telegraf(TELEGRAM_BOT_TOKEN);
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);
const openai = new OpenAI({ apiKey: OPENAI_API_KEY });

// Verificar configuración
console.log("Iniciando bot con configuración:");
console.log(`- Supabase URL: ${SUPABASE_URL ? "Configurado" : "FALTA"}`);
console.log(`- Supabase Key: ${SUPABASE_KEY ? "Configurado" : "FALTA"}`);
console.log(`- OpenAI API Key: ${OPENAI_API_KEY ? "Configurado" : "FALTA"}`);
console.log(`- Usuarios autorizados: ${AUTHORIZED_USERS.join(', ')}`);

// Middleware para verificar usuarios autorizados
bot.use((ctx, next) => {
  const userId = ctx.from?.id;
  
  if (!userId || !AUTHORIZED_USERS.includes(userId)) {
    console.log(`Usuario no autorizado: ${userId}`);
    return ctx.reply("⛔ No tienes permiso para usar este bot.");
  }
  
  return next();
});

// Comando de inicio
bot.start((ctx) => {
  ctx.reply(
    `👋 ¡Hola ${ctx.from.first_name}!\n\n` +
    `Soy el bot de Un Canal Sobre IA. Puedes enviarme URLs para generar artículos automáticamente.\n\n` +
    `📌 *Comandos disponibles:*\n` +
    `/testarticulo - Prueba la conexión con Supabase\n` +
    `/status - Verifica el estado de los servicios\n` +
    `/help - Muestra este mensaje de ayuda`,
    { parse_mode: 'Markdown' }
  );
});

// Comando de ayuda
bot.help((ctx) => {
  ctx.reply(
    `ℹ️ *Cómo usar este bot:*\n\n` +
    `1. Envíame una URL de un artículo interesante\n` +
    `2. Esperaré mientras OpenAI genera el contenido\n` +
    `3. Guardaré el artículo en Supabase automáticamente\n\n` +
    `*Comandos disponibles:*\n` +
    `/testarticulo - Prueba la conexión con Supabase\n` +
    `/status - Verifica el estado de los servicios\n` +
    `/help - Muestra este mensaje de ayuda`,
    { parse_mode: 'Markdown' }
  );
});

// Comando para probar Supabase
bot.command(['testarticulo', 'probar'], async (ctx) => {
  ctx.reply('🔄 Probando conexión con Supabase...');
  
  try {
    // Datos de prueba
    const testData = {
      title: 'Artículo de prueba local',
      content: 'Este es un artículo de prueba generado desde el bot local para verificar la conexión con Supabase.',
      excerpt: 'Prueba de conexión a Supabase desde bot local',
      source_url: 'https://test-local-bot.com',
      image_url: 'https://picsum.photos/800/600',
      category: 'prueba',
      is_featured: false,
      created_at: new Date().toISOString()
    };
    
    // Insertar en Supabase
    const { data, error } = await supabase
      .from('news')
      .insert(testData)
      .select()
      .single();
    
    if (error) throw new Error(`Error de Supabase: ${error.message}`);
    
    await ctx.reply(
      `✅ *¡Conexión exitosa!*\n\n` +
      `Se ha insertado un artículo de prueba en la base de datos.\n` +
      `ID: ${data.id}\n` +
      `Título: ${data.title}`,
      { parse_mode: 'Markdown' }
    );
  } catch (error) {
    console.error('Error en prueba:', error);
    await ctx.reply(`❌ *Error:* ${error.message}`, { parse_mode: 'Markdown' });
  }
});

// Verificar estado de servicios
bot.command('status', async (ctx) => {
  await ctx.reply('🔄 Verificando estado de los servicios...');
  
  const results = {
    supabase: false,
    openai: false
  };
  
  // Verificar Supabase
  try {
    const { count, error } = await supabase
      .from('news')
      .select('*', { count: 'exact', head: true });
    
    if (error) throw error;
    results.supabase = true;
    await ctx.reply(`✅ *Supabase:* Conectado (${count || 'N/A'} artículos en la tabla)`, { parse_mode: 'Markdown' });
  } catch (error) {
    await ctx.reply(`❌ *Supabase:* Error: ${error.message}`, { parse_mode: 'Markdown' });
  }
  
  // Verificar OpenAI
  try {
    if (!OPENAI_API_KEY) throw new Error('API key no configurada');
    const response = await openai.models.list();
    results.openai = true;
    await ctx.reply(`✅ *OpenAI:* Conectado (${response.data.length} modelos disponibles)`, { parse_mode: 'Markdown' });
  } catch (error) {
    await ctx.reply(`❌ *OpenAI:* Error: ${error.message}`, { parse_mode: 'Markdown' });
  }
  
  // Resumen
  const overallStatus = Object.values(results).every(Boolean) 
    ? '✅ *Todos los servicios funcionan correctamente*' 
    : '⚠️ *Algunos servicios tienen problemas*';
  
  await ctx.reply(overallStatus, { parse_mode: 'Markdown' });
});

// Función para generar artículos con OpenAI
async function generateArticle(url) {
  try {
    if (!OPENAI_API_KEY) throw new Error('OpenAI API key no configurada');
    
    console.log(`Generando artículo para URL: ${url}`);
    
    const response = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content: "Eres un asistente especializado en generar artículos en español sobre tecnología e IA. Debes crear contenido original basado en URLs."
        },
        {
          role: "user",
          content: `Genera un artículo completo a partir de esta URL: ${url}\n\nEl artículo debe tener un título atractivo, contenido informativo y estar escrito en un tono profesional pero accesible.\n\nFormato requerido (JSON):\n{\n  "title": "Título del artículo",\n  "content": "Contenido completo del artículo",\n  "excerpt": "Resumen breve, máximo 150 caracteres",\n  "category": "Categoría del artículo"\n}`
        }
      ],
      temperature: 0.7,
      response_format: { type: "json_object" }
    });
    
    const result = JSON.parse(response.choices[0].message.content);
    console.log("Artículo generado correctamente:", result.title);
    return result;
  } catch (error) {
    console.error("Error generando artículo:", error);
    throw error;
  }
}

// Función para guardar artículo en Supabase
async function saveArticleToSupabase(article, sourceUrl) {
  try {
    // Preparar datos
    const newsData = {
      title: article.title,
      content: article.content,
      excerpt: article.excerpt,
      source_url: sourceUrl,
      image_url: article.image_url || 'https://picsum.photos/800/600',
      category: article.category || 'tecnología',
      is_featured: false,
      created_at: new Date().toISOString()
    };
    
    // Insertar en Supabase
    const { data, error } = await supabase
      .from('news')
      .insert(newsData)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  } catch (error) {
    console.error("Error guardando en Supabase:", error);
    throw error;
  }
}

// Manejar URLs
bot.hears(/https?:\/\/\S+/g, async (ctx) => {
  const message = ctx.message.text;
  const urlMatch = message.match(/https?:\/\/\S+/g);
  
  if (!urlMatch || urlMatch.length === 0) return;
  
  // Tomar la primera URL
  const url = urlMatch[0];
  
  await ctx.reply(`🔍 He detectado esta URL: ${url}\n\nVoy a generar un artículo basado en ella. Esto puede tardar hasta 1 minuto...`);
  
  try {
    // Indicador de actividad
    ctx.replyWithChatAction('typing');
    
    // Generar artículo
    const article = await generateArticle(url);
    await ctx.reply(`✅ Artículo generado: "${article.title}"\n\nProcediendo a guardar en la base de datos...`);
    
    // Guardar en Supabase
    const savedArticle = await saveArticleToSupabase(article, url);
    
    await ctx.reply(
      `🎉 *¡Artículo guardado con éxito!*\n\n` +
      `*Título:* ${savedArticle.title}\n\n` +
      `*Resumen:* ${savedArticle.excerpt}\n\n` +
      `*ID:* ${savedArticle.id}`,
      { parse_mode: 'Markdown' }
    );
    
  } catch (error) {
    console.error("Error en el proceso:", error);
    await ctx.reply(`❌ *Error:* ${error.message}`, { parse_mode: 'Markdown' });
  }
});

// Iniciar el bot
bot.launch()
  .then(() => {
    console.log('✅ Bot iniciado correctamente');
    console.log('🤖 Envía comandos al bot en Telegram');
  })
  .catch(err => {
    console.error('❌ Error iniciando el bot:', err);
  });

// Gestión de cierre
process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));
