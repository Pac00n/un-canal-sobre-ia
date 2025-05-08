// Bot compatible con ESM
import { Telegraf } from 'telegraf';
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import fs from 'fs';

// Configurar dotenv
dotenv.config();

// Configuración directa para evitar problemas con variables de entorno
const BOT_TOKEN = '8164384647:AAEYrQIJeWf__fXdFKiqZRqfCjhHG5kGdJA';
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// Logs
console.log('Iniciando bot ESM...');
console.log(`- Token: ${BOT_TOKEN ? BOT_TOKEN.substring(0, 10) + '...' : 'NO CONFIGURADO'}`);
console.log(`- Supabase URL: ${SUPABASE_URL || 'NO CONFIGURADO'}`);
console.log(`- Supabase Key: ${SUPABASE_KEY ? 'CONFIGURADO' : 'NO CONFIGURADO'}`);

// Inicializar bot
const bot = new Telegraf(BOT_TOKEN);

// Middleware para mostrar eventos
bot.use((ctx, next) => {
  console.log(`[${new Date().toISOString()}] Evento recibido:`, ctx.updateType);
  if (ctx.from) console.log(`De: ${ctx.from.id} (@${ctx.from.username || 'sin_username'})`);
  if (ctx.message?.text) console.log(`Mensaje: ${ctx.message.text}`);
  return next();
});

// Comandos básicos
bot.start((ctx) => {
  console.log('Comando /start recibido');
  ctx.reply('🤖 Bot iniciado. Envía /test para probar Supabase.');
});

bot.command('test', async (ctx) => {
  console.log('Comando /test recibido');
  
  // Verificar si Supabase está configurado
  if (!SUPABASE_URL || !SUPABASE_KEY) {
    return ctx.reply('❌ Error: Supabase no está configurado. Verifica las variables de entorno.');
  }
  
  try {
    // Inicializar Supabase
    console.log('Inicializando Supabase...');
    const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);
    
    // Probar inserción
    const testData = {
      title: 'Artículo de prueba ESM',
      content: 'Este es un artículo de prueba desde el bot ESM.',
      excerpt: 'Prueba ESM',
      source_url: 'https://test-esm.com',
      image_url: 'https://picsum.photos/800/600',
      category: 'prueba',
      is_featured: false,
      created_at: new Date().toISOString()
    };
    
    console.log('Insertando datos en Supabase...');
    await ctx.reply('🔄 Probando conexión con Supabase...');
    
    const { data, error } = await supabase
      .from('news')
      .insert(testData)
      .select()
      .single();
    
    if (error) throw new Error(`Error Supabase: ${error.message}`);
    
    console.log('Inserción exitosa:', data.id);
    await ctx.reply(`✅ Inserción exitosa! ID: ${data.id}`);
  } catch (error) {
    console.error('Error:', error);
    await ctx.reply(`❌ Error: ${error.message}`);
  }
});

// Manejar textos
bot.on('text', (ctx) => {
  console.log('Texto recibido');
  ctx.reply(`Recibí tu mensaje: ${ctx.message.text}`);
});

// Iniciar bot
console.log('Iniciando bot...');
bot.launch()
  .then(() => {
    console.log('✅ Bot iniciado correctamente');
    console.log('Envía /start o /test en Telegram');
  })
  .catch(err => {
    console.error('❌ Error iniciando bot:', err);
  });

// Manejar señales
process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));
