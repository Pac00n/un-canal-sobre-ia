import { NextApiRequest, NextApiResponse } from 'next';
import { addNewsItem } from '@/lib/news-data';

// Endpoint ultra permisivo para pruebas con n8n
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Log detallado de todo lo que recibimos
  console.log('==== N8N TEST ENDPOINT ====');
  console.log('Método:', req.method);
  console.log('URL:', req.url);
  console.log('Headers:', JSON.stringify(req.headers, null, 2));
  console.log('Query:', JSON.stringify(req.query, null, 2));
  console.log('Body (raw):', req.body);
  console.log('Body (stringify):', JSON.stringify(req.body, null, 2));
  
  // Configuración CORS completa
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS, HEAD, PATCH');
  res.setHeader('Access-Control-Allow-Headers', '*');
  
  // Respuesta OPTIONS
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  
  try {
    // Datos de ejemplo garantizados para que siempre funcione
    const newsData = {
      title: "Noticia de prueba desde n8n",
      excerpt: "Esto es una prueba de integración con n8n",
      category: "tecnología",
      imageUrl: "https://picsum.photos/800/600",
      content: "Este es el contenido completo de la noticia de prueba enviada desde n8n",
      featured: false
    };
    
    // Guardar la noticia con datos de ejemplo
    const savedItem = await addNewsItem(newsData);
    
    // Respuesta exitosa con información completa
    return res.status(201).json({
      success: true,
      message: 'Noticia de prueba guardada correctamente',
      newsItem: savedItem,
      // Información de diagnóstico
      debug: {
        method: req.method,
        headers: req.headers,
        query: req.query,
        body: req.body,
        timestamp: new Date().toISOString()
      }
    });
  } catch (error: any) {
    console.error('Error en endpoint de prueba n8n:', error);
    // Incluso en caso de error, intentamos responder con un código 200 para evitar errores en n8n
    return res.status(200).json({
      success: false,
      message: 'Error procesando la solicitud, pero respondiendo con código 200',
      error: error.message,
      // Información de diagnóstico
      debug: {
        method: req.method,
        headers: req.headers,
        query: req.query,
        body: req.body,
        timestamp: new Date().toISOString()
      }
    });
  }
}
