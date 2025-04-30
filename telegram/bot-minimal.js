// Script minimalista para el bot de Telegram (enfoque sin n8n)
// Basado en el ejemplo de chat-interface-portable
require('dotenv').config();
const { Telegraf } = require('telegraf');
const axios = require('axios');

// Configuración del bot
const bot = new Telegraf(process.env.TELEGRAM_BOT_TOKEN);
const API_TOKEN = process.env.TELEGRAM_API_TOKEN || 'token-secreto';
const API_ENDPOINT = process.env.API_ENDPOINT || 'https://un-canal-sobre-ia.vercel.app/api/telegram-news';

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
    // Mostrar status escribiendo...
    await ctx.telegram.sendChatAction(ctx.chat.id, 'typing');
    
    // Llamar al endpoint
    const response = await axios.post(API_ENDPOINT, {
      url: messageText,
      token: API_TOKEN,
      source: 'telegram',
      user_id: ctx.from.id
    });
    
    if (response.data.success) {
      const articleId = response.data.article?.id;
      const articleUrl = `https://un-canal-sobre-ia.vercel.app/noticias/${articleId}`;
      
      await ctx.reply(
        `✅ *¡Noticia publicada con éxito!*\n\n` +
        `📰 *${response.data.article?.title}*\n\n` +
        `🔗 [Ver noticia](${articleUrl})`,
        { 
          parse_mode: 'Markdown',
          disable_web_page_preview: false 
        }
      );
    } else {
      await ctx.reply(`❌ Error: ${response.data.message || 'Respuesta inesperada del servidor'}`);
    }
  } catch (error) {
    console.error('Error procesando URL:', error);
    await ctx.reply(
      `❌ *Error procesando la URL*\n\n` +
      `Detalles: ${error.response?.data?.error || error.message}`,
      { parse_mode: 'Markdown' }
    );
  }
});

// Iniciar el bot
bot.launch()
  .then(() => console.log('🤖 Bot iniciado correctamente'))
  .catch(err => console.error('Error iniciando el bot:', err));

// Manejar cierre
process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));
