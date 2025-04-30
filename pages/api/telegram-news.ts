// Actualizado el 30/04/2025 para test de conexión simple
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
    console.log('==== PRUEBA DE CONEXIÓN TELEGRAM → API ====');
    console.log('Headers:', JSON.stringify(req.headers, null, 2));
    console.log('Body:', JSON.stringify(req.body, null, 2));

    // Extraer la URL del body
    const { url, token } = req.body;

    // Validación básica
    if (!url) {
      return res.status(400).json({ error: 'URL requerida' });
    }

    // Token simple de seguridad (debe coincidir con el configurado en el bot)
    const expectedToken = process.env.TELEGRAM_API_TOKEN;
    if (expectedToken && token !== expectedToken) {
      return res.status(401).json({ 
        error: 'Token inválido', 
        expected: expectedToken ? 'Configurado' : 'No configurado',
        received: token
      });
    }

    console.log('Token validado correctamente');
    console.log('Usando URL de prueba:', url);
    
    // Generar contenido de prueba sin usar OpenAI ni Supabase
    const result = {
      id: '999',
      title: 'Artículo de prueba para integración de Telegram',
      excerpt: 'Esta es una prueba de la integración directa entre Telegram y la API.',
      category: 'tecnología',
      imageUrl: 'https://picsum.photos/800/600',
      content: `<p>Este es un artículo de prueba generado para verificar la correcta integración entre el bot de Telegram y la API.</p><p>La URL recibida fue: ${url}</p>`,
      featured: false,
      created_at: new Date().toISOString()
    };
    
    // Responder con éxito
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

// Función para generar contenido con OpenAI
async function generateArticleWithOpenAI(url: string) {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) throw new Error('OPENAI_API_KEY no configurada');

  try {
    // Usar fetch para la API de OpenAI
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
              Genera un artículo periodístico basado en esta URL: "${url}"
              
              Debe ser sobre tecnología o inteligencia artificial. 
              Formatea la respuesta EXCLUSIVAMENTE como un objeto JSON con esta estructura:
              
              {
                "title": "Título atractivo y conciso",
                "excerpt": "Resumen breve de 1-2 frases",
                "category": "tecnología",
                "imageUrl": "https://picsum.photos/800/600",
                "content": "Contenido completo del artículo, 3-4 párrafos",
                "featured": false
              }
              
              NO incluyas comentarios ni texto fuera del objeto JSON.
            `
          }
        ],
        response_format: { type: "json_object" }
      })
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(`Error de OpenAI: ${error.error?.message || 'Desconocido'}`);
    }

    const data = await response.json();
    const content = data.choices[0]?.message?.content;
    
    if (!content) {
      throw new Error('OpenAI no generó contenido');
    }

    // Parsear el JSON generado
    try {
      return JSON.parse(content);
    } catch (e) {
      throw new Error(`Error al parsear JSON de OpenAI: ${e.message}\nContenido: ${content}`);
    }
  } catch (error: any) {
    console.error('Error llamando a OpenAI:', error);
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
