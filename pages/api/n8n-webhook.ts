import { NextApiRequest, NextApiResponse } from 'next';
import { addNewsItem } from '@/lib/news-data';

// Este endpoint está diseñado específicamente para n8n
// Acepta cualquier método HTTP para evitar problemas de CORS/405
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  console.log(`[n8n-webhook] Recibida solicitud con método: ${req.method}`);
  console.log('[n8n-webhook] Headers:', JSON.stringify(req.headers, null, 2));
  console.log('[n8n-webhook] URL:', req.url);
  console.log('[n8n-webhook] Query:', JSON.stringify(req.query, null, 2));
  
  // Configurar CORS para permitir solicitudes desde n8n
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS, HEAD, PATCH');
  res.setHeader('Access-Control-Allow-Headers', '*');
  
  // Manejar solicitud OPTIONS (preflight)
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  
  try {
    // Intentar procesar el cuerpo de la solicitud de diferentes maneras
    console.log('[n8n-webhook] Tipo de req.body:', typeof req.body);
    console.log('[n8n-webhook] req.body:', JSON.stringify(req.body, null, 2));
    
    // Datos de ejemplo para pruebas (usar solo si no hay datos reales)
    const exampleData = {
      title: "Título de ejemplo para pruebas",
      excerpt: "Este es un resumen de ejemplo para pruebas",
      category: "prueba",
      imageUrl: "https://picsum.photos/800/600",
      content: "Este es el contenido completo del artículo de ejemplo para pruebas.",
      featured: false
    };
    
    // Estrategias de extracción de datos
    let extractedData: any = null;
    
    // Estrategia 1: Intentar obtener de req.body directamente
    if (req.body && typeof req.body === 'object' && Object.keys(req.body).length > 0) {
      console.log('[n8n-webhook] Usando datos de req.body');
      extractedData = req.body;
    } 
    // Estrategia 2: Intentar parsear req.body si es string
    else if (typeof req.body === 'string' && req.body.trim().length > 0) {
      try {
        console.log('[n8n-webhook] Intentando parsear req.body como JSON');
        extractedData = JSON.parse(req.body);
      } catch (e) {
        console.log('[n8n-webhook] Error al parsear req.body como JSON');
      }
    }
    // Estrategia 3: Intentar obtener de los parámetros de query
    else if (req.query && Object.keys(req.query).length > 0) {
      console.log('[n8n-webhook] Usando datos de req.query');
      extractedData = req.query;
    }
    
    // Buscar campos JSON anidados (n8n a veces anida los datos)
    if (extractedData && typeof extractedData === 'object') {
      // Buscar en propiedades de primer nivel si hay JSON anidado
      for (const key in extractedData) {
        if (typeof extractedData[key] === 'string' && extractedData[key].startsWith('{') && extractedData[key].endsWith('}')) {
          try {
            console.log(`[n8n-webhook] Intentando parsear JSON anidado en propiedad ${key}`);
            const parsedValue = JSON.parse(extractedData[key]);
            if (parsedValue && typeof parsedValue === 'object' && Object.keys(parsedValue).length > 0) {
              console.log(`[n8n-webhook] Encontrado JSON válido en propiedad ${key}`);
              extractedData = parsedValue;
              break;
            }
          } catch (e) {
            console.log(`[n8n-webhook] Error al parsear JSON anidado en propiedad ${key}`);
          }
        }
      }
    }
    
    // Si aún no hay datos extraídos, usar datos de ejemplo (solo para pruebas)
    if (!extractedData || Object.keys(extractedData).length === 0) {
      console.log('[n8n-webhook] No se pudieron extraer datos válidos, usando datos de ejemplo');
      console.log('[n8n-webhook] ATENCIÓN: Esto es solo para pruebas - no usar en producción');
      extractedData = exampleData;
    }
    
    console.log('[n8n-webhook] Datos extraídos finales:', JSON.stringify(extractedData, null, 2));
    
    // Extraer campos específicos
    const { title, excerpt, category, imageUrl, content, featured } = extractedData;
    
    // Validar campos requeridos
    if (!title || !excerpt || !category || !imageUrl || !content) {
      return res.status(400).json({
        success: false,
        message: 'Faltan campos requeridos',
        receivedData: extractedData,
        rawBody: typeof req.body === 'string' ? req.body : JSON.stringify(req.body),
        requiredFields: ['title', 'excerpt', 'category', 'imageUrl', 'content']
      });
    }
    
    // Guardar la noticia en Supabase
    const data = await addNewsItem({
      title,
      excerpt,
      category,
      imageUrl,
      content,
      featured: featured ?? false,
    });
    
    // Responder con éxito
    return res.status(201).json({
      success: true,
      message: 'Noticia añadida correctamente',
      newsItem: data
    });
  } catch (error: any) {
    console.error('[n8n-webhook] Error:', error);
    return res.status(500).json({
      success: false,
      message: 'Error al procesar la solicitud',
      error: error.message,
      stack: error.stack,
      rawBody: typeof req.body === 'string' ? req.body : JSON.stringify(req.body)
    });
  }
}
