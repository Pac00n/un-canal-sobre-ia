import { NextApiRequest, NextApiResponse } from 'next';
import { addNewsItem } from '@/lib/news-data';

// Configuración CORS para permitir solicitudes desde cualquier origen
const allowCors = (fn: any) => async (req: NextApiRequest, res: NextApiResponse) => {
  // Configurar encabezados CORS
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization, API-KEY');

  // Manejar solicitud OPTIONS (preflight)
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // Procesar la solicitud normal
  return await fn(req, res);
};

async function handler(req: NextApiRequest, res: NextApiResponse) {
  console.log(`Received ${req.method} request to /pages/api/news`);
  console.log('Headers:', req.headers);
  
  // Forzar el método a POST para n8n (solución temporal)
  const method = req.method || 'GET';
  
  // Manejar solicitudes POST
  if (method === 'POST' || method === 'GET') { // Aceptar GET temporalmente para depuración
    try {
      // Obtener datos del cuerpo de la solicitud
      let body = req.body;
      
      // Manejar diferentes formatos de cuerpo
      if (typeof body === 'string') {
        try {
          body = JSON.parse(body);
        } catch (e) {
          console.log('Error parsing body as JSON, treating as is');
        }
      }
      
      console.log('Request body type:', typeof body);
      console.log('Request body:', body);
      
      const { title, excerpt, category, imageUrl, content, featured } = body || {};
      
      // Validar campos requeridos
      if (!title || !excerpt || !category || !imageUrl || !content) {
        return res.status(400).json({ message: 'Faltan campos requeridos', receivedData: body });
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
      return res.status(201).json({ message: 'News item added successfully', newsItem: data });
    } catch (error: any) {
      console.error('Error in /pages/api/news:', error);
      return res.status(500).json({ 
        message: 'Error adding news item', 
        error: error.message,
        stack: error.stack
      });
    }
  } else {
    // Método no permitido
    return res.status(405).json({ 
      message: 'Method not allowed', 
      allowedMethods: ['POST', 'OPTIONS'],
      receivedMethod: req.method
    });
  }
}

// Exportar el handler con el middleware CORS
export default allowCors(handler);
