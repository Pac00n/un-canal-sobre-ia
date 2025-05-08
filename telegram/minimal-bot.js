// Bot mínimo para verificar funcionamiento básico
const { Telegraf } = require('telegraf');

// Token directo para evitar problemas de variables de entorno
const bot = new Telegraf('8164384647:AAEYrQIJeWf__fXdFKiqZRqfCjhHG5kGdJA');

// Mostrar cada evento recibido
bot.use((ctx, next) => {
  console.log('Evento recibido:', ctx.updateType);
  console.log('De usuario:', ctx.from?.id, ctx.from?.username);
  if (ctx.message) console.log('Mensaje:', ctx.message.text);
  return next();
});

// Comandos básicos sin lógica compleja
bot.start((ctx) => {
  console.log('Comando /start recibido');
  return ctx.reply('Bot iniciado correctamente');
});

bot.command('test', (ctx) => {
  console.log('Comando /test recibido');
  return ctx.reply('Prueba exitosa');
});

// Capturar cualquier texto
bot.on('text', (ctx) => {
  console.log('Texto recibido:', ctx.message.text);
  return ctx.reply(`Recibí tu mensaje: ${ctx.message.text}`);
});

// Activar bot en modo polling (no webhook)
console.log('Iniciando bot minimalista...');
bot.launch()
  .then(() => {
    console.log('Bot iniciado. Envía /start o /test en Telegram');
  })
  .catch(err => {
    console.error('ERROR AL INICIAR BOT:', err);
  });

// Manejo de señales
process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));
