// Bot de Telegram completo para Un Canal Sobre IA
// Archivo independiente en formato CommonJS
const { Telegraf } = require('telegraf');
const { createClient } = require('@supabase/supabase-js');
const { OpenAI } = require('openai');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '.env') });

// Configuración
const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN || '8164384647:AAEYrQIJeWf__fXdFKiqZRqfCjhHG5kGdJA';
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const AUTHORIZED_USERS = (process.env.AUTHORIZED_TELEGRAM_USERS || '474426118').split(',').map(id => parseInt(id.trim()));
const DEFAULT_IMAGE_URL = 'https://picsum.photos/800/600'; // Imagen por defecto

// Estado para artículos pendientes de imagen
const pendingArticles = {}; // userId -> { articleData, sourceUrl }

// Función para logs avanzados
function log(level, message, data = null) {
  const timestamp = new Date().toISOString();
  const prefix = { 'INFO': '📘', 'SUCCESS': '✅', 'ERROR': '❌', 'WARN': '⚠️', 'DEBUG': '🔍' }[level] || '📋';
  console.log(`${prefix} ${timestamp} [${level}] ${message}`);
  if (data && Object.keys(data).length > 0) console.log(JSON.stringify(data, null, 2));
}

log('INFO', 'Iniciando bot con configuración:', {
  botTokenConfigured: !!BOT_TOKEN,
  supabaseUrlConfigured: !!SUPABASE_URL,
  supabaseKeyConfigured: !!SUPABASE_KEY,
  openaiKeyConfigured: !!OPENAI_API_KEY,
  authorizedUsers: AUTHORIZED_USERS
});

let bot, supabase, openai;
try {
  bot = new Telegraf(BOT_TOKEN);
  log('SUCCESS', 'Bot de Telegram inicializado');
  if (SUPABASE_URL && SUPABASE_KEY) {
    supabase = createClient(SUPABASE_URL, SUPABASE_KEY);
    log('SUCCESS', 'Cliente Supabase inicializado');
  } else { log('WARN', 'Supabase no configurado - funcionalidad limitada'); }
  if (OPENAI_API_KEY) {
    openai = new OpenAI({ apiKey: OPENAI_API_KEY });
    log('SUCCESS', 'Cliente OpenAI inicializado');
  } else { log('WARN', 'OpenAI no configurado - funcionalidad limitada'); }
} catch (error) {
  log('ERROR', 'Error en inicialización de servicios', { message: error.message });
  process.exit(1);
}

bot.use(async (ctx, next) => {
  const userId = ctx.from?.id;
  if (!userId || !AUTHORIZED_USERS.includes(userId)) {
    log('WARN', `Usuario no autorizado intentó acceso: ${userId}`);
    return ctx.reply('⛔ No tienes permiso para usar este bot.');
  }
  log('INFO', `Mensaje de @${ctx.from?.username} (${userId}):`, { text: ctx.message?.text });
  return next();
});

bot.start((ctx) => ctx.reply(
  `! Soy el bot de Un Canal Sobre IA.\n` +
  `Envíame una URL para generar un artículo. Luego te pediré una imagen.\n\n` +
  `*Comandos:*\n` +
  `/test - Prueba Supabase\n` +
  `/status - Verifica servicios\n` +
  `/help - Ayuda`, { parse_mode: 'Markdown' }
));

bot.help((ctx) => ctx.reply(
  `*Instrucciones:*\n` +
  `1. Envíame una URL de un artículo.\n` +
  `2. OpenAI generará el contenido.\n` +
  `3. Te pediré una URL para la imagen (o usa /skip_image).\n` +
  `4. El artículo se guardará en Supabase.\n\n` +
  `*Comandos durante el proceso:*\n` +
  `/skip_image - Usa imagen por defecto\n` +
  `/cancel_article - Cancela el artículo actual`, { parse_mode: 'Markdown' }
));

bot.command('test', async (ctx) => {
  log('INFO', 'Comando /test ejecutado');
  if (!supabase) return ctx.reply('❌ Supabase no configurado.');
  await ctx.reply('🔄 Probando Supabase...');
  try {
    const testData = { 
      title: 'Artículo de prueba', 
      content: 'Contenido de prueba.', 
      excerpt: 'Prueba Supabase', 
      source_url: 'https://test.com', 
      imageUrl: DEFAULT_IMAGE_URL, 
      category: 'prueba', 
      created_at: new Date().toISOString() 
    };
    log('DEBUG', 'Insertando datos de prueba:', testData);
    const { data, error } = await supabase.from('news').insert(testData).select().single();
    if (error) throw error;
    log('SUCCESS', 'Inserción de prueba exitosa:', { id: data.id });
    return ctx.reply(`*!* ID: ${data.id}`, { parse_mode: 'Markdown' });
  } catch (error) {
    log('ERROR', 'Error en prueba Supabase:', { message: error.message, details: error });
    return ctx.reply(`*Error Supabase:* ${error.message}`, { parse_mode: 'Markdown' });
  }
});

bot.command('status', async (ctx) => {
  log('INFO', 'Comando /status ejecutado');
  await ctx.reply("📊 Verificando servicios...");
  await ctx.reply(`✅ *Telegram Bot:* Conectado (@${ctx.botInfo.username})`, { parse_mode: 'Markdown' });
  try {
    if (!supabase) throw new Error('No configurado');
    const { count, error } = await supabase.from('news').select('*', { count: 'exact', head: true });
    if (error) throw error;
    await ctx.reply(`✅ *Supabase:* Conectado (${count || 0} artículos)`, { parse_mode: 'Markdown' });
  } catch (e) { await ctx.reply(`*Supabase:* ${e.message}`, { parse_mode: 'Markdown' }); }
  try {
    if (!openai) throw new Error('No configurado');
    await openai.models.list(); // Simple check
    await ctx.reply(`✅ *OpenAI:* Conectado`, { parse_mode: 'Markdown' });
  } catch (e) { await ctx.reply(`*OpenAI:* ${e.message}`, { parse_mode: 'Markdown' }); }
});

async function generateArticleOpenAI(url) {
  const apiKey = process.env.OPENAI_API_KEY;
  const assistantId = process.env.OPENAI_ASSISTANT_ID;
  
  if (!apiKey) throw new Error('OPENAI_API_KEY no está configurado');
  if (!assistantId) throw new Error('OPENAI_ASSISTANT_ID no está configurado');
  
  log('INFO', `Generando artículo para URL: ${url} usando Assistants API con asistente ${assistantId}`);
  
  const baseUrl = 'https://api.openai.com/v1';
  const headers = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${apiKey}`,
    'OpenAI-Beta': 'assistants=v2'
  };

  try {
    // 1. Crear thread
    log('DEBUG', 'Creando thread');
    const threadRes = await fetch(`${baseUrl}/threads`, { method: 'POST', headers });
    if (!threadRes.ok) {
      const err = await threadRes.json().catch(() => null);
      throw new Error(`Error creando thread: ${err?.error?.message || threadRes.statusText}`);
    }
    const threadData = await threadRes.json();
    const threadId = threadData.id;
    log('DEBUG', `Thread creado: ${threadId}`);

    // 2. Añadir mensaje
    log('DEBUG', 'Enviando mensaje al thread');
    const msgBody = {
      role: 'user', 
      content: `Genera un artículo completo en español basado en esta URL: ${url}\n\nAsegúrate de incluir:\n- Título atractivo\n- Resumen breve (máximo 150 caracteres)\n- Categoría apropiada\n- Contenido completo y bien estructurado`
    };
    const msgRes = await fetch(`${baseUrl}/threads/${threadId}/messages`, {
      method: 'POST', headers, body: JSON.stringify(msgBody)
    });
    if (!msgRes.ok) {
      const err = await msgRes.json().catch(() => null);
      throw new Error(`Error enviando mensaje: ${err?.error?.message || msgRes.statusText}`);
    }
    log('DEBUG', 'Mensaje enviado correctamente');

    // 3. Ejecutar asistente
    log('DEBUG', `Ejecutando asistente ${assistantId}`);
    const runRes = await fetch(`${baseUrl}/threads/${threadId}/runs`, {
      method: 'POST', headers, body: JSON.stringify({ assistant_id: assistantId })
    });
    if (!runRes.ok) {
      const err = await runRes.json().catch(() => null);
      throw new Error(`Error ejecutando asistente: ${err?.error?.message || runRes.statusText}`);
    }
    const runData = await runRes.json();
    const runId = runData.id;
    log('DEBUG', `Run iniciado: ${runId}`);

    // 4. Polling estado
    log('DEBUG', 'Esperando respuesta del asistente...');
    let status = runData.status;
    const start = Date.now();
    while (status === 'queued' || status === 'in_progress') {
      if (Date.now() - start > 60000) throw new Error('Timeout en ejecución del asistente');
      await new Promise(r => setTimeout(r, 1000)); // Esperar 1 segundo
      const statusRes = await fetch(`${baseUrl}/threads/${threadId}/runs/${runId}`, { headers });
      if (!statusRes.ok) break;
      const statusData = await statusRes.json();
      status = statusData.status;
      log('DEBUG', `Estado actual: ${status}`);
    }
    if (status !== 'completed') throw new Error(`El asistente falló al generar el artículo. Estado final: ${status}`);

    // 5. Obtener mensajes
    log('DEBUG', 'Obteniendo respuesta del asistente');
    const messagesRes = await fetch(`${baseUrl}/threads/${threadId}/messages`, { headers });
    if (!messagesRes.ok) {
      const err = await messagesRes.json().catch(() => null);
      throw new Error(`Error obteniendo mensajes: ${err?.error?.message || messagesRes.statusText}`);
    }
    const messagesData = await messagesRes.json();
    const assistantMsg = messagesData.data.find(m => m.role === 'assistant');
    if (!assistantMsg) throw new Error('No se encontró respuesta del asistente');
    
    // Extraer el texto de la respuesta
    const content = assistantMsg.content?.[0]?.text?.value || JSON.stringify(assistantMsg.content);
    log('DEBUG', 'Respuesta del asistente recibida', { length: content.length });
    
    // Procesar la respuesta del asistente según el esquema definido
    let result;
    try {
      // Eliminar cualquier texto antes o después del JSON
      let jsonContent = content;
      
      // Si hay texto antes o después del JSON, extraer solo la parte JSON
      const jsonMatch = content.match(/\{[\s\S]*\}/); 
      if (jsonMatch) {
        jsonContent = jsonMatch[0];
      }
      
      // Intentar parsear el JSON
      const jsonData = JSON.parse(jsonContent);
      log('DEBUG', 'JSON parseado correctamente', { keys: Object.keys(jsonData) });
      
      // Validar que el JSON tiene los campos requeridos
      const requiredFields = ['title', 'excerpt', 'category', 'content'];
      const missingFields = requiredFields.filter(field => !jsonData[field]);
      
      if (missingFields.length > 0) {
        log('WARN', 'JSON incompleto, faltan campos', { missingFields });
      }
      
      // Validar la categoría
      const validCategories = [
        "Machine Learning",
        "Deep Learning", 
        "Procesamiento de Lenguaje Natural", 
        "Robótica", 
        "Ética en IA"
      ];
      
      let category = jsonData.category || "Machine Learning";
      if (!validCategories.includes(category)) {
        log('WARN', 'Categoría no válida, usando predeterminada', { invalid: category });
        category = "Machine Learning";
      }
      
      // Construir el resultado con los campos validados
      result = {
        title: jsonData.title || 'Artículo sobre inteligencia artificial',
        excerpt: jsonData.excerpt || 'Resumen del artículo sobre IA',
        category: category,
        imageUrl: jsonData.imageUrl || DEFAULT_IMAGE_URL,
        content: jsonData.content || content,
        featured: jsonData.featured !== undefined ? jsonData.featured : false
      };
      
    } catch (parseError) {
      log('WARN', 'Error parseando JSON del asistente', { error: parseError.message });
      
      // Plan B: Intentar extraer mediante expresiones regulares
      try {
        const titleMatch = content.match(/"title"\s*:\s*"([^"]+)"/i);
        const excerptMatch = content.match(/"excerpt"\s*:\s*"([^"]+)"/i);
        const categoryMatch = content.match(/"category"\s*:\s*"([^"]+)"/i);
        const contentMatch = content.match(/"content"\s*:\s*"([^"]+)"/i);
        const imageMatch = content.match(/"imageUrl"\s*:\s*"([^"]+)"/i);
        const featuredMatch = content.match(/"featured"\s*:\s*(true|false)/i);
        
        result = {
          title: titleMatch ? titleMatch[1].trim() : 'Artículo sobre IA',
          excerpt: excerptMatch ? excerptMatch[1].trim() : 'Resumen del artículo',
          category: categoryMatch ? categoryMatch[1].trim() : 'Machine Learning',
          imageUrl: imageMatch ? imageMatch[1].trim() : DEFAULT_IMAGE_URL,
          content: contentMatch ? contentMatch[1].trim().replace(/\\n/g, '\n').replace(/\\"/g, '"') : content,
          featured: featuredMatch ? featuredMatch[1].toLowerCase() === 'true' : false
        };
        
        log('INFO', 'Datos extraídos mediante regex', { title: result.title });
      } catch (regexError) {
        // Plan C: Crear un objeto predeterminado
        log('ERROR', 'No se pudo extraer información mediante regex', { error: regexError.message });
        result = {
          title: 'Avance en inteligencia artificial',
          excerpt: 'Resumen de un avance importante en el campo de la IA',
          category: 'Machine Learning',
          imageUrl: DEFAULT_IMAGE_URL,
          content: content,
          featured: false
        };
      }
    }
    
    // Validación final para asegurar que no haya JSON en el título o excerpt
    if (typeof result.title === 'string' && (result.title.includes('{') || result.title.includes('"title"'))) {
      result.title = 'Avance en inteligencia artificial';
    }
    
    if (typeof result.excerpt === 'string' && (result.excerpt.includes('{') || result.excerpt.includes('"excerpt"'))) {
      result.excerpt = 'Resumen de un avance importante en el campo de la IA';
    }
    
    log('SUCCESS', 'Artículo generado con Assistants API:', { title: result.title });
    return result;
  } catch (error) {
    log('ERROR', 'Error generando artículo con OpenAI Assistants API', { 
      message: error.message, 
      details: error.response ? JSON.stringify(error.response) : 'No detalles adicionales'
    });
    throw new Error(`Error generando artículo: ${error.message}`);
  }
}

async function finalizeAndSaveArticle(ctx, userId, articleData, sourceUrl, imageUrl) {
  log('INFO', 'Finalizando y guardando artículo', { userId, title: articleData.title, imageUrl });
  await ctx.replyWithChatAction('typing');
  try {
    await ctx.reply('💾 Guardando artículo en Supabase...');
    const newsEntry = {
      ...articleData,
      source_url: sourceUrl,
      imageUrl: imageUrl || DEFAULT_IMAGE_URL,
      created_at: new Date().toISOString()
    };
    const { data: savedData, error: saveError } = await supabase.from('news').insert(newsEntry).select().single();
    if (saveError) throw saveError;
    log('SUCCESS', 'Artículo guardado en Supabase', { id: savedData.id });
    await ctx.reply(`*Artículo guardado con ID: ${savedData.id}`);

    await ctx.reply('🔄 Revalidando página web...');
    try {
      const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
      const revalidateUrl = `${baseUrl}/api/revalidate?path=/noticias`;
      const revalResponse = await fetch(revalidateUrl, { timeout: 5000 }).catch(e => {
        log('WARN', 'Error de conexión al endpoint de revalidación', { error: e.message });
        return { ok: false, statusText: 'Error de conexión' };
      });
      
      if (!revalResponse.ok) {
        log('WARN', 'Error en revalidación', { status: revalResponse.status });
        await ctx.reply('⚠️ La página web no pudo ser revalidada automáticamente. El artículo se guardó, pero puede que no aparezca en la web hasta que se refresque el caché.');
      } else {
        log('SUCCESS', 'Página revalidada');
        await ctx.reply('✅ Página revalidada.');
      }
    } catch (revalError) {
      log('WARN', 'Error inesperado en revalidación', { error: revalError.message });
      await ctx.reply('⚠️ Error al revalidar página, pero el artículo se guardó correctamente.');
    }

    await ctx.reply(`🎉 *¡Proceso completado!*\n*Título:* ${savedData.title}`, { parse_mode: 'Markdown' });
  } catch (error) {
    log('ERROR', 'Error en finalizeAndSaveArticle', { message: error.message, details: error });
    await ctx.reply(`*Error finalizando: ${error.message}`);
  } finally {
    delete pendingArticles[userId];
  }
}

bot.hears(/https?:\/\/\S+/g, async (ctx) => {
  const userId = ctx.from.id;
  if (pendingArticles[userId]) {
    return ctx.reply('⚠️ Ya tienes un artículo pendiente. Envía una URL para la imagen, o usa /skip_image o /cancel_article.');
  }
  const url = ctx.message.text.match(/https?:\/\/\S+/g)[0];
  log('INFO', `URL detectada: ${url}`);
  await ctx.reply(`🔍 URL detectada: ${url}
🤖 Generando contenido con OpenAI... (puede tardar ~1 min)`);
  ctx.replyWithChatAction('typing');
  try {
    const articleFromAI = await generateArticleOpenAI(url);
    pendingArticles[userId] = { articleData: articleFromAI, sourceUrl: url };
    log('SUCCESS', 'Contenido AI generado, esperando imagen', { userId, title: articleFromAI.title });
    await ctx.reply(
      `✅ Contenido generado: *${articleFromAI.title}*\n\n` +
      `🖼 Por favor, envía la URL de la imagen para este artículo.\n` +
      `☑ O escribe /skip_image para usar una imagen por defecto.\n` +
      `❌ O escribe /cancel_article para cancelar.`, { parse_mode: 'Markdown' }
    );
  } catch (error) {
    log('ERROR', 'Error generando artículo con OpenAI:', { message: error.message, details: error });
    await ctx.reply(`*Error con OpenAI: ${error.message}`);
    delete pendingArticles[userId];
  }
});

bot.command('skip_image', async (ctx) => {
  const userId = ctx.from.id;
  log('INFO', '/skip_image comando recibido', { userId });
  if (!pendingArticles[userId]) return ctx.reply('🤷 No hay ningún artículo pendiente de imagen.');
  const { articleData, sourceUrl } = pendingArticles[userId];
  await ctx.reply('⏭️ Omitiendo imagen, se usará la imagen por defecto.');
  await finalizeAndSaveArticle(ctx, userId, articleData, sourceUrl, DEFAULT_IMAGE_URL);
});

bot.command('cancel_article', (ctx) => {
  const userId = ctx.from.id;
  log('INFO', '/cancel_article comando recibido', { userId });
  if (!pendingArticles[userId]) return ctx.reply('🤷 No hay ningún artículo para cancelar.');
  delete pendingArticles[userId];
  return ctx.reply('👍 Artículo cancelado.');
});

// Manejador para texto general (potencialmente URLs de imagen)
bot.on('text', async (ctx) => {
  const userId = ctx.from.id;
  const text = ctx.message.text;
  
  // Si hay un artículo pendiente y el texto es una URL, asumimos que es la imagen
  if (pendingArticles[userId] && text.match(/^https?:\/\/\S+\.(jpeg|jpg|gif|png|webp)$/i)) {
    log('INFO', 'URL de imagen recibida para artículo pendiente', { userId, imageUrl: text });
    const { articleData, sourceUrl } = pendingArticles[userId];
    await finalizeAndSaveArticle(ctx, userId, articleData, sourceUrl, text);
  } else if (pendingArticles[userId]) {
    // Si hay un artículo pendiente pero no es una URL de imagen válida ni un comando conocido
    log('INFO', 'Texto recibido mientras se esperaba imagen, no es URL válida', { userId, text });
    ctx.reply('🖼️ Por favor, envía una URL de imagen válida (jpg, png, gif, webp), o usa /skip_image o /cancel_article.');
  } else if (!text.startsWith('/')) {
    // Si no hay artículo pendiente y no es un comando, y no es una URL (ya manejada por hears)
    log('INFO', 'Texto genérico recibido, sin acción pendiente', { userId, text });
    ctx.reply('🤖 Para generar un nuevo artículo, envíame una URL. Para ayuda, escribe /help.');
  }
  // Los comandos son manejados por sus propios handlers, no es necesario hacer nada más aquí
});

bot.catch((err, ctx) => {
  log('ERROR', `Error no manejado en bot para @${ctx.update.message?.from?.username}`, { error: err, update: ctx.update });
  try {
    ctx.reply('❌ Ocurrió un error inesperado. El desarrollador ha sido notificado.');
  } catch (e) {
    log('ERROR', 'Error enviando mensaje de error al usuario', { error: e });
  }
});

(async () => {
  try {
    log('INFO', 'Iniciando bot (polling)...');
    await bot.launch();
    log('SUCCESS', '🤖 Bot iniciado y escuchando! Abre Telegram.');
  } catch (error) {
    log('ERROR', 'Fallo catastrófico al iniciar bot', { message: error.message, details: error });
    process.exit(1);
  }
})();

process.once('SIGINT', () => { log('INFO', 'SIGINT recibido, deteniendo bot...'); bot.stop('SIGINT'); process.exit(0); });
process.once('SIGTERM', () => { log('INFO', 'SIGTERM recibido, deteniendo bot...'); bot.stop('SIGTERM'); process.exit(0); });
