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

// Función para generar contenido con OpenAI Chat API - Sin necesidad de asistente
async function generateArticleWithOpenAI(url: string) {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) throw new Error('OPENAI_API_KEY no configurada');

  try {
    console.log('Procesando URL con OpenAI Chat API:', url);
    
    // Usar la API de Chat directamente (no requiere un asistente)
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: 'gpt-4-turbo-preview',
        messages: [
          {
            role: 'system',
            content: 'Eres un periodista especializado en tecnología e inteligencia artificial.'
          },
          {
            role: 'user',
            content: `
              Genera un artículo periodístico completo basado en esta URL: "${url}"
              
              Debes crear un artículo sobre tecnología o inteligencia artificial.
              Formatea la respuesta EXCLUSIVAMENTE como un objeto JSON con esta estructura:
              
              {
                "title": "Título atractivo y conciso",
                "excerpt": "Resumen breve de 1-2 frases",
                "category": "tecnología",
                "imageUrl": "https://picsum.photos/800/600",
                "content": "Contenido completo del artículo con 3-4 párrafos en formato HTML con etiquetas <p></p>",
                "featured": false,
                "source_url": "${url}"
              }
              
              NO incluyas ningún texto fuera del objeto JSON. El contenido debe estar en formato HTML simple.
            `
          }
        ],
        response_format: { type: "json_object" },
        temperature: 0.7,
        max_tokens: 2000
      })
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(`Error de OpenAI: ${error.error?.message || 'Desconocido'}`);
    }

    console.log('Respuesta recibida de OpenAI');
    const data = await response.json();
    const content = data.choices[0]?.message?.content;
    
    if (!content) {
      throw new Error('OpenAI no generó contenido');
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
      
      // Almacenar la URL en el objeto para nuestra referencia, pero no se guardará en la BD
      // No usar source_url ya que esa columna no existe en la tabla
      articleData._originalUrl = url;
      
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
