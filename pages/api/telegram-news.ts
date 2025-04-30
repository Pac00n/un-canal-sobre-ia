// Actualizado el 30/04/2025 - Implementación con OpenAI API v2 (Assistants)
import { NextApiRequest, NextApiResponse } from 'next';
import { createClient } from '@supabase/supabase-js';

// Endpoint para procesar solicitudes desde Telegram - MODO DEBUG
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Configuración CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', '*');
  
  // Respuesta OPTIONS
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // Solo aceptamos POST
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método no permitido' });
  }

  try {
    // Log detallado de la solicitud
    console.log('==== TELEGRAM → OPENAI → WEB ENDPOINT ====');
    console.log('Iniciando procesamiento a las:', new Date().toISOString());
    console.log('Headers:', JSON.stringify(req.headers, null, 2));
    console.log('Body:', JSON.stringify(req.body, null, 2));

    // Extraer la URL del body
    const { url, token, source = 'telegram', user_id } = req.body;
    console.log('URL a procesar:', url);
    console.log('Fuente:', source);
    console.log('Usuario:', user_id || 'No especificado');

    // Validación básica
    if (!url) {
      return res.status(400).json({ error: 'URL requerida' });
    }

    // Token simple de seguridad (debe coincidir con el configurado en el bot)
    const expectedToken = process.env.TELEGRAM_API_TOKEN;
    if (expectedToken && token !== expectedToken) {
      console.error('Token inválido:', { 
        expected: expectedToken ? expectedToken.substring(0, 3) + '...' : 'No configurado',
        received: token ? token.substring(0, 3) + '...' : 'No proporcionado'
      });
      
      return res.status(401).json({ 
        error: 'Token inválido'
      });
    }

    console.log('Token validado correctamente');
    
    // Generar artículo con OpenAI usando Assistants API v2
    console.log('Iniciando generación de contenido con OpenAI...');
    const articleData = await generateArticleWithOpenAI(url);
    
    // Asegurarse de que los metadatos estén incluidos
    articleData.source_url = url;
    articleData.created_at = new Date().toISOString();
    articleData.updated_at = new Date().toISOString();
    
    // Guardar en Supabase con service role (bypass RLS)
    console.log('Guardando artículo en Supabase...');
    const result = await saveArticleToSupabase(articleData);
    
    // Responder con éxito
    console.log('Procesamiento completado, enviando respuesta...');
    return res.status(201).json({
      success: true,
      message: 'Artículo generado y guardado con éxito',
      article: result
    });

  } catch (error: any) {
    console.error('Error en endpoint Telegram → OpenAI → Web:', error);
    return res.status(500).json({ 
      error: `Error: ${error.message}`,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
}

// Función para generar contenido con OpenAI API v2 (Assistants)
async function generateArticleWithOpenAI(url: string) {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) throw new Error('OPENAI_API_KEY no configurada');

  try {
    // Configurar los encabezados para la API v2 de Assistants
    const baseUrl = 'https://api.openai.com/v1';
    const headers = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
      'OpenAI-Beta': 'assistants=v2'
    };

    console.log('Procesando URL con OpenAI Assistants API v2:', url);

    // 1. Crear un nuevo thread
    console.log('1. Creando thread...');
    const threadRes = await fetch(`${baseUrl}/threads`, { method: 'POST', headers });
    if (!threadRes.ok) {
      const err = await threadRes.json().catch(() => null);
      throw new Error(`Error creando thread: ${err?.error?.message || threadRes.statusText}`);
    }
    const threadData = await threadRes.json();
    const threadId = threadData.id;
    console.log('Thread creado:', threadId);

    // 2. Añadir mensaje al thread con la URL y las instrucciones
    console.log('2. Añadiendo mensaje al thread...');
    const msgBody = { 
      role: 'user', 
      content: `
        Genera un artículo periodístico completo basado en esta URL: "${url}"
        
        Debes crear un artículo original sobre tecnología o inteligencia artificial.
        El formato de respuesta DEBE ser EXCLUSIVAMENTE un objeto JSON válido con esta estructura:
        
        {
          "title": "Título atractivo y conciso",
          "excerpt": "Resumen breve de 1-2 frases",
          "category": "tecnología",
          "imageUrl": "https://picsum.photos/800/600",
          "content": "Contenido completo del artículo con 3-4 párrafos en formato HTML con etiquetas <p></p>",
          "featured": false,
          "source_url": "${url}"
        }

        NO incluyas ningún otro texto fuera del objeto JSON.
      `
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
    console.log('Mensaje añadido al thread');

    // 3. Ejecutar asistente con instrucciones para generar JSON
    console.log('3. Ejecutando asistente...');
    const runBody = {
      assistant_id: process.env.OPENAI_ASSISTANT_ID || 'asst_abc123', // Usar un ID genérico si no está configurado
      tools: [{ type: "code_interpreter" }],
      instructions: `Eres un periodista especializado en tecnología e inteligencia artificial. 
Analiza la URL y crea un artículo completo en formato JSON según la estructura solicitada.`
    };
    
    const runRes = await fetch(`${baseUrl}/threads/${threadId}/runs`, {
      method: 'POST', 
      headers, 
      body: JSON.stringify(runBody)
    });
    
    if (!runRes.ok) {
      const err = await runRes.json().catch(() => null);
      throw new Error(`Error ejecutando asistente: ${err?.error?.message || runRes.statusText}`);
    }
    
    const runData = await runRes.json();
    const runId = runData.id;
    console.log('Asistente ejecutado, run ID:', runId);

    // 4. Polling para esperar el resultado
    console.log('4. Esperando respuesta (polling)...');
    let status = runData.status;
    const start = Date.now();
    
    while (status === 'queued' || status === 'in_progress') {
      // Timeout de 2 minutos
      if (Date.now() - start > 120000) throw new Error('Timeout en ejecución del asistente');
      
      // Esperar 2 segundos entre cada consulta
      await new Promise(r => setTimeout(r, 2000));
      
      // Verificar el estado
      const statusRes = await fetch(`${baseUrl}/threads/${threadId}/runs/${runId}`, { headers });
      
      if (!statusRes.ok) {
        console.log('Error al verificar estado:', statusRes.status, statusRes.statusText);
        break;
      }
      
      const statusData = await statusRes.json();
      status = statusData.status;
      console.log('Estado actual:', status);
    }
    
    if (status !== 'completed') {
      throw new Error(`El asistente no completó la tarea correctamente. Estado final: ${status}`);
    }

    // 5. Obtener mensajes con la respuesta
    console.log('5. Obteniendo respuesta final...');
    const messagesRes = await fetch(`${baseUrl}/threads/${threadId}/messages`, { headers });
    
    if (!messagesRes.ok) {
      const err = await messagesRes.json().catch(() => null);
      throw new Error(`Error obteniendo mensajes: ${err?.error?.message || messagesRes.statusText}`);
    }
    
    const messagesData = await messagesRes.json();
    const assistantMsg = messagesData.data.find((m: any) => m.role === 'assistant');
    
    if (!assistantMsg) {
      throw new Error('No se encontró respuesta del asistente');
    }
    
    // Extraer el texto de la respuesta (formato v2)
    const content = assistantMsg.content?.[0]?.text?.value;
    if (!content) {
      throw new Error('El asistente no generó contenido válido');
    }
    
    console.log('Contenido obtenido, parseando JSON...');
    
    // Parsear el JSON generado
    try {
      // Limpiar el contenido para asegurar que sea JSON válido
      const cleanContent = content
        .trim()
        .replace(/```json|```/g, '') // Eliminar bloques de código markdown si existen
        .trim();
      
      const articleData = JSON.parse(cleanContent);
      console.log('Artículo generado correctamente');
      
      // Asegurarse de que la URL original esté incluida
      articleData.source_url = url;
      
      return articleData;
    } catch (e: any) {
      console.error('Error al parsear JSON:', e);
      console.error('Contenido recibido:', content);
      throw new Error(`Error al parsear JSON: ${e.message}`);
    }
  } catch (error: any) {
    console.error('Error generando artículo con OpenAI:', error);
    throw new Error(`Error con OpenAI: ${error.message}`);
  }
}

// Función para guardar en Supabase usando service role
async function saveArticleToSupabase(articleData: any) {
  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseServiceKey) {
    throw new Error('Configuración de Supabase incompleta');
  }

  // Crear cliente con clave de servicio para bypasear RLS
  const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

  console.log('Guardando artículo en Supabase:', articleData);
  
  // Insertar en la tabla news
  const { data, error } = await supabaseAdmin
    .from('news')
    .insert([
      {
        title: articleData.title,
        excerpt: articleData.excerpt,
        category: articleData.category,
        imageUrl: articleData.imageUrl,
        content: articleData.content,
        featured: articleData.featured || false,
        source_url: articleData.source_url || null, // URL original
        created_at: new Date().toISOString()
      }
    ])
    .select()
    .single();

  if (error) {
    console.error('Error al guardar en Supabase:', error);
    throw new Error(`Error al guardar en base de datos: ${error.message}`);
  }

  return data;
}
