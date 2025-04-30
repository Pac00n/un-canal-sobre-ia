import { NextApiRequest, NextApiResponse } from 'next';
import { addNewsItem } from '@/lib/news-data';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Manejar solicitudes OPTIONS para CORS
  if (req.method === 'OPTIONS') {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    return res.status(200).end();
  }
  
  // Manejar solicitudes POST
  if (req.method === 'POST') {
    console.log('Received POST request to /pages/api/news');
    
    try {
      // Obtener datos del cuerpo de la solicitud
      const { title, excerpt, category, imageUrl, content, featured } = req.body;
      console.log('Request body:', { title, excerpt, category, imageUrl, content, featured });
      
      // Validar campos requeridos
      if (!title || !excerpt || !category || !imageUrl || !content) {
        return res.status(400).json({ message: 'Faltan campos requeridos' });
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
      return res.status(500).json({ message: 'Error adding news item', error: error.message });
    }
  } else {
    // Método no permitido
    return res.status(405).json({ message: 'Method not allowed' });
  }
}
