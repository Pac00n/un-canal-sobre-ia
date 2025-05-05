import { NextApiRequest, NextApiResponse } from 'next';
import { createClient } from '@supabase/supabase-js';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Configuración CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  // Solo aceptamos GET
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Método no permitido' });
  }

  try {
    // Inicializar cliente Supabase con clave de servicio para bypasear RLS
    const supabaseUrl = process.env.SUPABASE_URL;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    
    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error('Configuración de Supabase incompleta');
    }
    
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);
    
    // Ver si tenemos un ID específico para mostrar
    const { id } = req.query;
    
    // Consulta base
    let query = supabaseAdmin
      .from('news')
      .select('*')
      .order('created_at', { ascending: false });
    
    // Filtrar por ID si se proporciona
    if (id) {
      query = query.eq('id', id);
    }
    
    // Limitar a 20 artículos si no hay ID específico
    if (!id) {
      query = query.limit(20);
    }
    
    const { data, error } = await query;
    
    if (error) {
      throw new Error(`Error al consultar Supabase: ${error.message}`);
    }
    
    // Si tenemos ID pero no hay datos, es un 404
    if (id && (!data || data.length === 0)) {
      return res.status(404).json({ 
        error: 'Artículo no encontrado',
        id 
      });
    }

    // Generar HTML simple para visualización directa
    if (req.headers.accept?.includes('text/html')) {
      const html = generateHtml(id ? data[0] : data);
      res.setHeader('Content-Type', 'text/html');
      return res.status(200).send(html);
    }
    
    // O devolver JSON si es lo que se prefiere
    return res.status(200).json({
      success: true,
      count: data.length,
      articles: data
    });
    
  } catch (error: any) {
    console.error('Error en view-articles API:', error);
    return res.status(500).json({
      success: false,
      error: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
}

// Función para generar HTML para visualización directa
function generateHtml(data: any): string {
  if (Array.isArray(data)) {
    // Vista de lista para múltiples artículos
    return `
      <!DOCTYPE html>
      <html lang="es">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Artículos en Un Canal Sobre IA</title>
        <style>
          body { font-family: system-ui, -apple-system, sans-serif; margin: 0; padding: 20px; line-height: 1.6; }
          .container { max-width: 1200px; margin: 0 auto; }
          h1 { color: #333; border-bottom: 1px solid #eee; padding-bottom: 10px; }
          .articles { display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: 20px; }
          .article { border: 1px solid #eee; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 5px rgba(0,0,0,0.1); }
          .article img { width: 100%; height: 200px; object-fit: cover; }
          .content { padding: 15px; }
          .title { margin-top: 0; font-size: 1.2rem; }
          .meta { color: #666; font-size: 0.9rem; margin-bottom: 8px; }
          .category { display: inline-block; background: #f0f0f0; padding: 3px 8px; border-radius: 4px; font-size: 0.8rem; }
          .excerpt { color: #444; }
          .view-link { display: block; text-align: right; color: #0070f3; text-decoration: none; }
          .view-link:hover { text-decoration: underline; }
        </style>
      </head>
      <body>
        <div class="container">
          <h1>Artículos en Un Canal Sobre IA</h1>
          <p>Mostrando ${data.length} artículos más recientes.</p>
          <div class="articles">
            ${data.map((article: any) => `
              <div class="article">
                <img src="${article.imageUrl || '/placeholder.svg'}" alt="${article.title}">
                <div class="content">
                  <h2 class="title">${article.title}</h2>
                  <div class="meta">
                    <span class="category">${article.category}</span>
                    <span class="date">${new Date(article.created_at).toLocaleDateString()}</span>
                  </div>
                  <p class="excerpt">${article.excerpt.substring(0, 120)}...</p>
                  <a class="view-link" href="/api/view-articles?id=${article.id}">Ver artículo</a>
                </div>
              </div>
            `).join('')}
          </div>
        </div>
      </body>
      </html>
    `;
  } else {
    // Vista detallada para un solo artículo
    const article = data;
    return `
      <!DOCTYPE html>
      <html lang="es">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>${article.title} | Un Canal Sobre IA</title>
        <style>
          body { font-family: system-ui, -apple-system, sans-serif; margin: 0; padding: 20px; line-height: 1.6; color: #333; }
          .container { max-width: 800px; margin: 0 auto; }
          .back { display: inline-block; margin-bottom: 20px; color: #0070f3; text-decoration: none; }
          .back:hover { text-decoration: underline; }
          h1 { margin-top: 0; color: #333; }
          .header { position: relative; }
          .header img { width: 100%; height: 300px; object-fit: cover; border-radius: 8px; }
          .meta { display: flex; justify-content: space-between; margin: 15px 0; color: #666; }
          .category { display: inline-block; background: #f0f0f0; padding: 3px 8px; border-radius: 4px; font-size: 0.9rem; }
          .content { line-height: 1.8; }
          .source { margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee; font-size: 0.9rem; color: #666; }
        </style>
      </head>
      <body>
        <div class="container">
          <a href="/api/view-articles" class="back">← Volver a todos los artículos</a>
          
          <div class="header">
            <h1>${article.title}</h1>
            <img src="${article.imageUrl || '/placeholder.svg'}" alt="${article.title}">
          </div>
          
          <div class="meta">
            <span class="category">${article.category}</span>
            <span class="date">${new Date(article.created_at).toLocaleDateString()}</span>
          </div>
          
          <div class="content">
            ${article.content || article.excerpt}
          </div>
          
          ${article.source_url ? `
            <div class="source">
              <p>Fuente original: <a href="${article.source_url}" target="_blank">${article.source_url}</a></p>
            </div>
          ` : ''}
        </div>
      </body>
      </html>
    `;
  }
}
