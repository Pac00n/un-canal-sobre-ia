import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '../../../utils/supabase/server';

// Función auxiliar para registrar logs
function logToConsole(message: string, data?: any) {
  const timestamp = new Date().toISOString();
  console.log(`[GENERATE ARTICLE] ${timestamp} - ${message}`, data ? JSON.stringify(data).substring(0, 1000) : '');
}

export async function POST(req: NextRequest) {
  logToConsole('Iniciando generación de artículo');
  
  const { url } = await req.json();
  if (!url) {
    logToConsole('Error: URL requerida');
    return NextResponse.json({ error: 'URL requerida' }, { status: 400 });
  }
  
  try {
    // 1. Generar artículo con OpenAI
    logToConsole('Generando artículo para URL', { url });
    const article = await generateArticleWithAssistant(url);
    logToConsole('Artículo generado exitosamente', { title: article.title });
    
    // 2. Guardar en Supabase
    logToConsole('Guardando artículo en Supabase');
    try {
      // Inicializar cliente de Supabase
      const supabase = createClient();
      
      // Preparar datos para insertar
      const newsData = {
        title: article.title,
        content: article.content,
        excerpt: article.excerpt,
        source_url: url,
        image_url: article.image_url || 'https://picsum.photos/800/600', // URL de imagen por defecto
        category: article.category || 'tecnología',
        is_featured: false,
        created_at: new Date().toISOString()
      };
      
      logToConsole('Datos preparados para insertar', newsData);
      
      // Insertar en la tabla news
      const { data, error } = await supabase
        .from('news')
        .insert(newsData)
        .select()
        .single();
      
      if (error) {
        logToConsole('Error guardando en Supabase', { error: error.message });
        throw new Error(`Error guardando en Supabase: ${error.message}`);
      }
      
      logToConsole('Artículo guardado exitosamente', { id: data.id });
      
      // Intentar revalidar la página de noticias
      try {
        await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/revalidate?path=/noticias`, { method: 'GET' });
        logToConsole('Página de noticias revalidada');
      } catch (revalidateError) {
        logToConsole('Error al revalidar página', { error: revalidateError });
        // Continuar aunque falle la revalidación
      }
      
      // Devolver datos del artículo + id generado
      return NextResponse.json({
        ...article,
        id: data.id,
        stored: true
      });
      
    } catch (dbError: any) {
      logToConsole('Error en operación de base de datos', { message: dbError.message });
      // Aun si falla el guardado, devolver el artículo generado
      return NextResponse.json({
        ...article,
        stored: false,
        error: dbError.message
      });
    }
  } catch (error: any) {
    logToConsole('Error general en generación de artículo', { message: error.message });
    return NextResponse.json({ error: error.message || 'Error al generar artículo' }, { status: 500 });
  }
}

async function generateArticleWithAssistant(url: string): Promise<any> {
  const apiKey = process.env.OPENAI_API_KEY;
  const assistantId = process.env.OPENAI_ASSISTANT_ID; // ID del asistente configurado para generar artículos
  
  if (!apiKey || !assistantId) throw new Error('Faltan credenciales de OpenAI');
  
  const baseUrl = 'https://api.openai.com/v1';
  const headers = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${apiKey}`,
    'OpenAI-Beta': 'assistants=v2'
  };
  
  // 1. Crear thread
  const threadRes = await fetch(`${baseUrl}/threads`, { method: 'POST', headers });
  if (!threadRes.ok) {
    const err = await threadRes.json().catch(() => null);
    throw new Error(`Error creando thread: ${err?.error?.message || threadRes.statusText}`);
  }
  
  const threadData = await threadRes.json();
  const threadId = threadData.id;
  
  // 2. Añadir mensaje con la URL del artículo
  const msgBody = { 
    role: 'user', 
    content: `Genera un artículo completo en español a partir de esta URL: ${url}\n\nEl artículo debe tener un título atractivo, contenido informativo y estar escrito en un tono profesional pero accesible.\n\nDevuelve un JSON con la siguiente estructura:\n{\n  "title": "Título del artículo",\n  "content": "Contenido completo del artículo",\n  "excerpt": "Resumen breve, máximo 150 caracteres",\n  "category": "Categoría del artículo"\n}`
  };
  
  const msgRes = await fetch(`${baseUrl}/threads/${threadId}/messages`, {
    method: 'POST', 
    headers, 
    body: JSON.stringify(msgBody)
  });
  
  if (!msgRes.ok) {
    const err = await msgRes.json().catch(() => null);
    throw new Error(`Error enviando mensaje: ${err?.error?.message || msgRes.statusText}`);
  }
  
  // 3. Ejecutar asistente
  const runRes = await fetch(`${baseUrl}/threads/${threadId}/runs`, {
    method: 'POST',
    headers,
    body: JSON.stringify({ assistant_id: assistantId })
  });
  
  if (!runRes.ok) {
    const err = await runRes.json().catch(() => null);
    throw new Error(`Error ejecutando asistente: ${err?.error?.message || runRes.statusText}`);
  }
  
  const runData = await runRes.json();
  const runId = runData.id;
  
  // 4. Polling estado
  let status = runData.status;
  const start = Date.now();
  
  while (status === 'queued' || status === 'in_progress') {
    if (Date.now() - start > 120000) throw new Error('Timeout en generación del artículo');
    await new Promise(r => setTimeout(r, 2000));
    
    const statusRes = await fetch(`${baseUrl}/threads/${threadId}/runs/${runId}`, { headers });
    if (!statusRes.ok) break;
    
    const statusData = await statusRes.json();
    status = statusData.status;
  }
  
  if (status !== 'completed') throw new Error('El asistente falló al generar el artículo');
  
  // 5. Obtener mensajes
  const messagesRes = await fetch(`${baseUrl}/threads/${threadId}/messages`, { headers });
  
  if (!messagesRes.ok) {
    const err = await messagesRes.json().catch(() => null);
    throw new Error(`Error obteniendo mensajes: ${err?.error?.message || messagesRes.statusText}`);
  }
  
  const messagesData = await messagesRes.json();
  const assistantMsg = messagesData.data.find((m: any) => m.role === 'assistant');
  
  if (!assistantMsg) throw new Error('No se encontró respuesta del asistente');
  
  // Extraer el texto según el formato de v2
  const content = assistantMsg.content?.[0]?.text?.value || JSON.stringify(assistantMsg.content);
  
  try {
    // Intentar parsear el JSON devuelto por el asistente
    const articleData = JSON.parse(content.includes('{') ? content.substring(content.indexOf('{'), content.lastIndexOf('}')+1) : '{}');
    return articleData;
  } catch (error) {
    console.error('Error parsing assistant response:', error);
    return {
      title: 'Error al formatear respuesta',
      content: content,
      excerpt: 'Contenido generado por IA, pero en formato incorrecto',
      category: 'IA'
    };
  }
}