import { NextRequest, NextResponse } from 'next/server';
import { isAuthorizedUser } from './config';
import { createClient } from '../../../utils/supabase/server';

// Variable de entorno para el token del bot
const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN || '8164384647:AAEYrQIJeWf__fXdFKiqZRqfCjhHG5kGdJA';

// Función auxiliar para registrar logs
const logToConsole = (message: string, data?: any) => {
  const timestamp = new Date().toISOString();
  console.log(`[TELEGRAM WEBHOOK] ${timestamp} - ${message}`, data ? JSON.stringify(data).substring(0, 1000) : '');
};

// Función para probar la inserción en Supabase
async function testSupabaseInsertion() {
  logToConsole('Ejecutando prueba directa de inserción en Supabase');
  try {
    // Inicializar cliente
    const supabase = createClient();
    
    // Datos de prueba
    const testData = {
      title: 'Artículo de prueba desde webhook',
      content: 'Este es un artículo de prueba para verificar la conexión con Supabase desde el webhook.',
      excerpt: 'Prueba de webhook a Supabase',
      source_url: 'https://webhook-test.com',
      image_url: 'https://picsum.photos/800/600',
      category: 'prueba',
      is_featured: false,
      created_at: new Date().toISOString()
    };
    
    logToConsole('Datos a insertar', testData);
    
    // Verificar configuración
    const configInfo = {
      hasServiceKey: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
      supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL,
      hasAnonKey: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    };
    logToConsole('Configuración actual', configInfo);
    
    // Insertar en tabla news
    const { data, error } = await supabase
      .from('news')
      .insert(testData)
      .select()
      .single();
    
    if (error) {
      logToConsole('ERROR en prueba de inserción', { error });
      return { success: false, error: { message: error.message, code: error.code, details: error.details } };
    }
    
    logToConsole('Inserción exitosa', { id: data.id });
    return { success: true, data };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
    logToConsole('EXCEPCIÓN en prueba de inserción', { errorMessage });
    return { success: false, error: { message: errorMessage } };
  }
}


// Este endpoint recibe peticiones POST desde Telegram
export async function POST(req: NextRequest) {
  logToConsole('Webhook recibido - Iniciando procesamiento');
  
  if (req.method !== 'POST') {
    logToConsole('Método no permitido', { method: req.method });
    return NextResponse.json({ error: 'Método no permitido' }, { status: 405 });
  }

  try {
    logToConsole('Parseando datos de la solicitud...');
    const data = await req.json();
    logToConsole('Datos recibidos de Telegram', data);
    
    // Telegram envía el mensaje en data.message.text
    const message = data.message?.text || '';
    const chatId = data.message?.chat?.id;
    const userId = data.message?.from?.id;
    logToConsole('Mensaje extraido', { message, chatId, userId });
    
    // Verificar si el usuario está autorizado
    if (userId && !isAuthorizedUser(userId)) {
      logToConsole('Usuario no autorizado', { userId });
      // Aun así respondemos con 200 para que Telegram no siga reintentando
      // pero podemos enviar un mensaje al usuario
      try {
        await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            chat_id: chatId,
            text: 'Lo siento, no tienes autorización para usar este bot.'
          }),
        });
      } catch (e) {
        logToConsole('Error al enviar mensaje de rechazo', e);
      }
      return NextResponse.json({ ok: true, authorized: false });
    }

    // Comando especial para probar inserción en Supabase
    if (message === '/testarticulo' || message === '/probar') {
      logToConsole('Comando de prueba detectado, iniciando test de Supabase');
      const testResult = await testSupabaseInsertion();
      
      // Notificar al usuario del resultado
      if (chatId) {
        try {
          let responseText = testResult.success
            ? `✅ Prueba exitosa! Se insertó un artículo de prueba con ID: ${testResult.data.id}`
            : `❌ Error en prueba de Supabase: ${testResult.error?.message || 'Error desconocido'}`;
            
          await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ chat_id: chatId, text: responseText }),
          });
        } catch (e) {
          logToConsole('Error enviando resultado de prueba', e);
        }
      }
      
      return NextResponse.json({ ok: true, test: testResult });
    }
    
    // Aquí puedes filtrar solo mensajes que sean URLs
    const urlRegex = /(https?:\/\/[^\s]+)/g;
    const urls = message.match(urlRegex);
    logToConsole('URLs encontradas', { urls });

    if (!urls || urls.length === 0) {
      logToConsole('No se detectaron URLs en el mensaje');
      // Opcional: responder a Telegram que no se detectó URL
      
      // Enviar ayuda al usuario
      if (chatId) {
        try {
          await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
              chat_id: chatId, 
              text: `Por favor envía una URL para generar un artículo.

Comandos disponibles:
/testarticulo - Prueba la conexión con Supabase
/probar - Igual que /testarticulo` 
            }),
          });
        } catch (e) {
          logToConsole('Error enviando mensaje de ayuda', e);
        }
      }
      
      return NextResponse.json({ ok: true, message: 'No URL detected' });
    }

    // Por simplicidad, tomamos la primera URL
    const url = urls[0];
    logToConsole('URL seleccionada para procesar', { url });

    // Variable para construir la URL base
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
    const generateArticleUrl = `${baseUrl}/api/generate-article`;
    logToConsole('Llamando al endpoint de generación de artículos', { generateArticleUrl });

    // Aquí puedes llamar a tu endpoint interno para generar la noticia
    try {
      logToConsole('Enviando solicitud a generate-article');
      const res = await fetch(generateArticleUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url }),
      });
      
      if (!res.ok) {
        const errorText = await res.text().catch(() => 'No error text');
        logToConsole('Error en la respuesta del endpoint generate-article', { status: res.status, statusText: res.statusText, errorText });
        throw new Error(`Error en generate-article: ${res.status} ${res.statusText}`);
      }
      
      const articleResult = await res.json();
      logToConsole('Artículo generado con éxito', { title: articleResult.title });
      
      // Notificar al usuario de Telegram que el proceso fue exitoso
      if (chatId) {
        logToConsole('Enviando notificación a Telegram', { chatId });
        try {
          // Enviar respuesta al usuario con el resumen del artículo generado
          await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
              chat_id: chatId, 
              text: `✅ Artículo generado: "${articleResult.title}"

${articleResult.excerpt || ''}

Guardado correctamente en la base de datos.`
            }),
          });
          logToConsole('Notificación enviada a Telegram');
        } catch (notifyError) {
          const errorMsg = notifyError instanceof Error ? notifyError.message : 'Error desconocido';
          logToConsole('Error al notificar a Telegram', { error: errorMsg });
          // Continuar aunque falle la notificación
        }
      }
      
      logToConsole('Proceso completado con éxito');
      return NextResponse.json({ ok: true, article: articleResult });
    } catch (apiError) {
      const errorMessage = apiError instanceof Error ? apiError.message : 'Error desconocido';
      logToConsole('Error llamando al API generate-article', { message: errorMessage });
      throw apiError; // Re-throw para capturarlo en el try/catch exterior
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
    const errorStack = error instanceof Error ? error.stack : 'No stack trace';
    logToConsole('Error en el webhook', { message: errorMessage, stack: errorStack });
    return NextResponse.json({ error: 'Error procesando el webhook', details: errorMessage }, { status: 500 });
  }
}


