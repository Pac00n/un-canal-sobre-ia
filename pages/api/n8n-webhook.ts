import { NextApiRequest, NextApiResponse } from 'next';
import { addNewsItem } from '@/lib/news-data';

// Este endpoint está diseñado específicamente para n8n
// Acepta cualquier método HTTP para evitar problemas de CORS/405
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  console.log(`[n8n-webhook] Recibida solicitud con método: ${req.method}`);
  console.log('[n8n-webhook] Headers:', req.headers);
  
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
    let body = req.body;
    
    // Si el cuerpo es una cadena, intentar parsearlo como JSON
    if (typeof body === 'string') {
      try {
        body = JSON.parse(body);
      } catch (e) {
        console.log('[n8n-webhook] Error al parsear cuerpo como JSON:', e);
      }
    }
    
    // Si no hay cuerpo, intentar obtenerlo de la URL query
    if (!body || Object.keys(body).length === 0) {
      body = req.query;
    }
    
    console.log('[n8n-webhook] Tipo de cuerpo:', typeof body);
    console.log('[n8n-webhook] Cuerpo de la solicitud:', body);
    
    // Extraer datos necesarios
    const { title, excerpt, category, imageUrl, content, featured } = body;
    
    // Validar campos requeridos
    if (!title || !excerpt || !category || !imageUrl || !content) {
      return res.status(400).json({
        success: false,
        message: 'Faltan campos requeridos',
        receivedData: body
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
      stack: error.stack
    });
  }
}
