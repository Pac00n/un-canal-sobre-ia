import { NextRequest, NextResponse } from 'next/server';

// Función auxiliar para registrar logs
const logToConsole = (message: string, data?: any) => {
  const timestamp = new Date().toISOString();
  console.log(`[TELEGRAM WEBHOOK] ${timestamp} - ${message}`, data ? JSON.stringify(data).substring(0, 1000) : '');
};


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
    logToConsole('Mensaje extraido', { message, chatId });

    // Aquí puedes filtrar solo mensajes que sean URLs
    const urlRegex = /(https?:\/\/[^\s]+)/g;
    const urls = message.match(urlRegex);
    logToConsole('URLs encontradas', { urls });

    if (!urls || urls.length === 0) {
      logToConsole('No se detectaron URLs en el mensaje');
      // Opcional: responder a Telegram que no se detectó URL
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
          // Descomenta y configura esto si quieres enviar confirmación al usuario
          // const botToken = process.env.TELEGRAM_BOT_TOKEN;
          // if (botToken) {
          //   await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
          //     method: 'POST',
          //     headers: { 'Content-Type': 'application/json' },
          //     body: JSON.stringify({ 
          //       chat_id: chatId, 
          //       text: `Artículo generado: ${articleResult.title}` 
          //     }),
          //   });
          //   logToConsole('Notificación enviada a Telegram');
          // }
        } catch (notifyError) {
          logToConsole('Error al notificar a Telegram', notifyError);
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


