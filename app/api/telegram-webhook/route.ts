import { NextRequest, NextResponse } from 'next/server';

// Este endpoint recibe peticiones POST desde Telegram
default async function handler(req: NextRequest) {
  if (req.method !== 'POST') {
    return NextResponse.json({ error: 'Método no permitido' }, { status: 405 });
  }

  try {
    const data = await req.json();
    // Telegram envía el mensaje en data.message.text
    const message = data.message?.text || '';
    const chatId = data.message?.chat?.id;

    // Aquí puedes filtrar solo mensajes que sean URLs
    const urlRegex = /(https?:\/\/[^\s]+)/g;
    const urls = message.match(urlRegex);

    if (!urls || urls.length === 0) {
      // Opcional: responder a Telegram que no se detectó URL
      return NextResponse.json({ ok: true, message: 'No URL detected' });
    }

    // Por simplicidad, tomamos la primera URL
    const url = urls[0];

    // Aquí puedes llamar a tu endpoint interno para generar la noticia
    // Por ejemplo: /api/generate-article
    const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/generate-article`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ url }),
    });
    const articleResult = await res.json();

    // Opcional: puedes responder a Telegram usando sendMessage, si quieres
    // await fetch(`https://api.telegram.org/bot<YOUR_BOT_TOKEN>/sendMessage`, {
    //   method: 'POST',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify({ chat_id: chatId, text: 'Noticia procesada correctamente.' }),
    // });

    return NextResponse.json({ ok: true, article: articleResult });
  } catch (error) {
    return NextResponse.json({ error: 'Error procesando el webhook', details: error }, { status: 500 });
  }
}

export { handler as POST };
