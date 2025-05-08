// Bot de Telegram con logs detallados para depuración
require('dotenv').config();
const { Telegraf } = require('telegraf');
const { createClient } = require('@supabase/supabase-js');

// Función de log mejorada
function log(level, message, data = null) {
  const timestamp = new Date().toISOString();
  const prefix = {
    'INFO': '📘',
    'SUCCESS': '✅',
    'ERROR': '❌',
    'WARN': '⚠️',
    'DEBUG': '🔍'
  }[level] || '📋';
  
  console.log(`${prefix} ${timestamp} [${level}] ${message}`);
  if (data) console.log(JSON.stringify(data, null, 2));
}

// Configuración
log('INFO', 'Cargando configuración...');
const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const AUTHORIZED_USERS = [474426118]; // Tu ID

// Verificar variables necesarias
if (!TELEGRAM_BOT_TOKEN) {
  log('ERROR', 'TELEGRAM_BOT_TOKEN no configurado en .env');
  process.exit(1);
}
if (!SUPABASE_URL) {
  log('ERROR', 'NEXT_PUBLIC_SUPABASE_URL no configurado en .env');
  process.exit(1);
}
if (!SUPABASE_KEY) {
  log('ERROR', 'SUPABASE_SERVICE_ROLE_KEY o NEXT_PUBLIC_SUPABASE_ANON_KEY no configurado en .env');
  process.exit(1);
}

log('INFO', 'Configuración cargada correctamente:', {
  TELEGRAM_BOT_TOKEN: TELEGRAM_BOT_TOKEN ? TELEGRAM_BOT_TOKEN.substring(0, 10) + '...' : 'NO CONFIGURADO',
  SUPABASE_URL: SUPABASE_URL || 'NO CONFIGURADO',
  SUPABASE_KEY: SUPABASE_KEY ? SUPABASE_KEY.substring(0, 5) + '...' : 'NO CONFIGURADO',
  AUTHORIZED_USERS: AUTHORIZED_USERS
});

// Inicializar bot y Supabase
log('INFO', 'Inicializando bot y conexión con Supabase...');
let bot;
let supabase;

try {
  bot = new Telegraf(TELEGRAM_BOT_TOKEN);
  log('SUCCESS', 'Bot inicializado');
} catch (error) {
  log('ERROR', 'Error al inicializar el bot:', error);
  process.exit(1);
}

try {
  supabase = createClient(SUPABASE_URL, SUPABASE_KEY);
  log('SUCCESS', 'Cliente Supabase inicializado');
} catch (error) {
  log('ERROR', 'Error al inicializar Supabase:', error);
  process.exit(1);
}

// Middleware para registrar todas las interacciones
bot.use((ctx, next) => {
  const userId = ctx.from?.id;
  const username = ctx.from?.username;
  const messageText = ctx.message?.text;
  
  log('INFO', `Mensaje recibido de usuario ${userId} (@${username}):`, { text: messageText });
  
  // Verificar si el usuario está autorizado
  if (!AUTHORIZED_USERS.includes(userId)) {
    log('WARN', `Usuario no autorizado: ${userId}`);
    ctx.reply("⛔ No tienes permiso para usar este bot.");
    return;
  }
  
  return next();
});

// Comandos básicos
bot.start((ctx) => {
  log('INFO', 'Comando /start ejecutado');
  return ctx.reply("🤖 Bot iniciado. Usa /test para probar la conexión con Supabase.");
});

bot.help((ctx) => {
  log('INFO', 'Comando /help ejecutado');
  return ctx.reply(
    "📚 Comandos disponibles:\n" +
    "/start - Inicia el bot\n" +
    "/help - Muestra este mensaje\n" +
    "/test - Prueba la conexión con Supabase\n" +
    "/status - Verifica el estado de los servicios"
  );
});

// Comando para probar Supabase
bot.command('test', async (ctx) => {
  log('INFO', 'Comando /test ejecutado. Probando conexión con Supabase...');
  
  // Notificar inicio
  await ctx.reply("🔄 Probando conexión con Supabase...");
  
  try {
    // Paso 1: Verificar conexión básica
    log('DEBUG', 'Verificando conexión básica a Supabase...');
    await ctx.reply("1️⃣ Verificando conexión básica...");
    
    const { data: healthCheck, error: healthError } = await supabase.rpc('get_service_status');
    if (healthError) throw new Error(`Error de conexión: ${healthError.message}`);
    
    await ctx.reply("✅ Conexión básica establecida");
    log('SUCCESS', 'Conexión básica establecida');
    
    // Paso 2: Contar registros existentes
    log('DEBUG', 'Contando registros existentes...');
    await ctx.reply("2️⃣ Contando registros existentes...");
    
    const { count, error: countError } = await supabase
      .from('news')
      .select('*', { count: 'exact', head: true });
    
    if (countError) throw new Error(`Error al contar registros: ${countError.message}`);
    
    await ctx.reply(`✅ Tabla 'news' accesible. Contiene ${count || 0} registros.`);
    log('SUCCESS', `Tabla 'news' contiene ${count || 0} registros`);
    
    // Paso 3: Insertar registro de prueba
    log('DEBUG', 'Insertando registro de prueba...');
    await ctx.reply("3️⃣ Insertando registro de prueba...");
    
    const testData = {
      title: 'Artículo de prueba',
      content: 'Este es un artículo de prueba generado para verificar la conexión.',
      excerpt: 'Prueba de conexión',
      source_url: 'https://test.com',
      image_url: 'https://picsum.photos/800/600',
      category: 'prueba',
      is_featured: false,
      created_at: new Date().toISOString()
    };
    
    log('DEBUG', 'Datos a insertar:', testData);
    
    const { data, error } = await supabase
      .from('news')
      .insert(testData)
      .select()
      .single();
    
    if (error) throw new Error(`Error insertando datos: ${error.message}`);
    
    log('SUCCESS', 'Registro insertado correctamente:', { id: data.id });
    await ctx.reply(`✅ Registro insertado correctamente con ID: ${data.id}`);
    
    // Resumen final
    await ctx.reply("🎉 Todas las pruebas completadas con éxito. La conexión funciona correctamente!");
    log('SUCCESS', 'Todas las pruebas completadas con éxito');
    
  } catch (error) {
    log('ERROR', 'Error en prueba de Supabase:', error);
    await ctx.reply(`❌ ERROR: ${error.message}`);
    
    // Dar recomendaciones específicas
    if (error.message.includes('connection')) {
      await ctx.reply("⚠️ Parece ser un problema de conexión. Verifica la URL de Supabase.");
    } else if (error.message.includes('permission') || error.message.includes('auth')) {
      await ctx.reply("⚠️ Problema de autenticación. Verifica tu SUPABASE_SERVICE_ROLE_KEY.");
    } else if (error.message.includes('not found') || error.message.includes('doesn\'t exist')) {
      await ctx.reply("⚠️ La tabla 'news' no existe. Asegúrate de que esté creada en Supabase.");
    }
  }
});

// Comando de estado
bot.command('status', async (ctx) => {
  log('INFO', 'Comando /status ejecutado');
  await ctx.reply("📊 Verificando estado de servicios...");
  
  // Estado de Supabase
  try {
    log('DEBUG', 'Verificando conexión a Supabase...');
    await ctx.reply("🔄 Verificando Supabase...");
    
    const { count, error } = await supabase
      .from('news')
      .select('*', { count: 'exact', head: true });
    
    if (error) throw error;
    await ctx.reply(`✅ Supabase: Conectado (${count || 0} artículos)`);
    log('SUCCESS', 'Conexión a Supabase verificada');
  } catch (error) {
    log('ERROR', 'Error con Supabase:', error);
    await ctx.reply(`❌ Supabase: ${error.message}`);
  }
  
  // Resumen
  await ctx.reply("✅ Verificación completada");
});

// Manejo de textos (para cuando se envíen URLs)
bot.on('text', (ctx) => {
  const text = ctx.message.text;
  log('INFO', 'Mensaje de texto recibido:', { text });
  
  // Ignorar comandos
  if (text.startsWith('/')) return;
  
  // Detectar URLs
  const urlRegex = /(https?:\/\/[^\s]+)/g;
  const urls = text.match(urlRegex);
  
  if (urls && urls.length > 0) {
    log('INFO', 'URLs detectadas:', { urls });
    ctx.reply(`Detecté estas URLs: ${urls.join(', ')}\n\nEsta funcionalidad estará disponible pronto.`);
  } else {
    ctx.reply("No detecto ninguna URL en tu mensaje. Envía una URL para procesar un artículo o usa /help para ver los comandos disponibles.");
  }
});

// Manejar errores
bot.catch((err, ctx) => {
  log('ERROR', 'Error no manejado en el bot:', err);
  ctx.reply('❌ Ocurrió un error inesperado. Por favor, inténtalo de nuevo.');
});

// Iniciar el bot
log('INFO', 'Iniciando bot...');

bot.launch()
  .then(() => {
    log('SUCCESS', '¡Bot iniciado correctamente! Esperando mensajes...');
    console.log('\n');
    console.log('🤖 BOT ACTIVO Y LISTO PARA RECIBIR COMANDOS');
    console.log('📱 Abre Telegram y envía mensajes a tu bot');
    console.log('📋 Logs detallados aparecerán aquí');
    console.log('\n');
  })
  .catch(err => {
    log('ERROR', 'Error al iniciar el bot:', err);
    process.exit(1);
  });

// Manejo de cierre elegante
process.once('SIGINT', () => {
  log('INFO', 'Cerrando bot (SIGINT)...');
  bot.stop('SIGINT');
});
process.once('SIGTERM', () => {
  log('INFO', 'Cerrando bot (SIGTERM)...');
  bot.stop('SIGTERM');
});
