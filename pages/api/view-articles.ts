import { NextApiRequest, NextApiResponse } from 'next';
import { createClient } from '@supabase/supabase-js';
import { marked } from 'marked'; // Importar marked

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Método no permitido' });
  }

  try {
    const supabaseUrl = process.env.SUPABASE_URL;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    
    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error('Configuración de Supabase incompleta');
    }
    
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);
    const { id } = req.query;
    let query = supabaseAdmin
      .from('news')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (id) {
      query = query.eq('id', id as string);
    }
    if (!id) {
      query = query.limit(20);
    }
    
    const { data, error } = await query;
    
    if (error) {
      throw new Error(`Error al consultar Supabase: ${error.message}`);
    }
    
    if (id && (!data || data.length === 0)) {
      return res.status(404).json({ 
        error: 'Artículo no encontrado',
        id 
      });
    }

    if (req.headers.accept?.includes('text/html')) {
      const html = generateHtml(id ? data[0] : data, !!id); // Pasamos si es vista individual
      res.setHeader('Content-Type', 'text/html; charset=utf-8');
      return res.status(200).send(html);
    }
    
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
function generateHtml(data: any, isSingleView: boolean): string {
  const themeStyles = `
    body { 
      font-family: ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, "Noto Sans", sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol", "Noto Color Emoji";
      margin: 0; 
      padding: 20px; 
      line-height: 1.6; 
      background-color: #18181b; /* zinc-900 */
      color: #e4e4e7; /* zinc-200 */
    }
    .container { max-width: ${isSingleView ? '800px' : '1200px'}; margin: 0 auto; }
    .button-link {
      display: inline-block;
      padding: 8px 16px;
      background-color: #3f3f46; /* zinc-700 */
      color: #ffffff;
      text-decoration: none;
      border-radius: 6px;
      margin-bottom: 20px;
      transition: background-color 0.2s;
    }
    .button-link:hover {
      background-color: #52525b; /* zinc-600 */
    }
    .gradient-button {
      display: inline-block;
      padding: 6px 12px; /* Reduced padding */
      border-radius: 6px;
      text-decoration: none;
      color: #a1a1aa; /* zinc-400 */ /* Softer text color */
      background-color: #27272a; /* zinc-800 */ /* Subtle dark background */
      border: 1px solid #3f3f46; /* zinc-700 */ /* Thin light border */
      transition: background-color 0.2s ease-in-out, border-color 0.2s ease-in-out;
      margin-bottom: 20px;
    }
    .gradient-button:hover {
      background-color: #3f3f46; /* zinc-700 */ /* Slightly lighter background on hover */
    }
    h1 { 
      color: #fafafa; /* zinc-50 */ 
      border-bottom: 1px solid #3f3f46; /* zinc-700 */ 
      padding-bottom: 10px; 
      margin-top: 0;
    }
    .articles { display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: 20px; }
    .article { 
      border: 1px solid #3f3f46; /* zinc-700 */ 
      border-radius: 8px; 
      overflow: hidden; 
      background-color: #27272a; /* zinc-800 */
      box-shadow: 0 2px 5px rgba(0,0,0,0.2); 
      transition: transform 0.3s ease-in-out, box-shadow 0.3s ease-in-out;
    }
    .article:hover {
      transform: translateY(-5px);
      box-shadow: 0 5px 15px rgba(0,0,0,0.3), 0 0 15px rgba(14, 165, 233, 0.6), 0 0 25px rgba(99, 102, 241, 0.6); /* Blue to purple gradient glow */
    }
    .article img { width: 100%; height: 200px; object-fit: cover; border-bottom: 1px solid #3f3f46; /* zinc-700 */ }
    .article .content { padding: 15px; }
    .article .title { margin-top: 0; font-size: 1.2rem; color: #fafafa; /* zinc-50 */ }
    .meta { color: #a1a1aa; /* zinc-400 */ font-size: 0.9rem; margin-bottom: 8px; }
    .category { display: inline-block; background: #0975e6; color: white; padding: 3px 8px; border-radius: 4px; font-size: 0.8rem; }
    .excerpt { color: #d4d4d8; /* zinc-300 */ }
    .view-link { display: block; text-align: right; color: #60a5fa; /* blue-400 */ text-decoration: none; }
    .view-link:hover { text-decoration: underline; }

    /* Estilos para la vista individual */
    .single-article-header { position: relative; margin-bottom: 20px; }
    .single-article-header img { width: 100%; max-height: 400px; object-fit: cover; border-radius: 8px; }
    .single-article-meta { display: flex; justify-content: space-between; margin: 15px 0; color: #a1a1aa; /* zinc-400 */ }
    .single-article-content { line-height: 1.8; color: #e4e4e7; /* zinc-200 */ }
    /* Estilo para el contenido procesado de Markdown */
    .single-article-content h1, .single-article-content h2, .single-article-content h3 { color: #fafafa; /* zinc-50 */ margin-top: 1.5em; margin-bottom: 0.5em; }
    .single-article-content p { margin-bottom: 1em; }
    .single-article-content ul, .single-article-content ol { margin-left: 1.5em; margin-bottom: 1em; }
    .single-article-content li { margin-bottom: 0.5em; }
    .single-article-content a { color: #60a5fa; /* blue-400 */ text-decoration: underline; }
    .single-article-content pre { background-color: #27272a; /* zinc-800 */ border: 1px solid #3f3f46; /* zinc-700 */ border-radius: 6px; padding: 1em; overflow-x: auto; }
    .single-article-content code { font-family: monospace; background-color: #3f3f46; /* zinc-700 */ padding: 0.2em 0.4em; border-radius: 3px; }
    .single-article-content pre code { background-color: transparent; padding: 0; border: none; }
    .single-article-content blockquote { border-left: 4px solid #52525b; /* zinc-600 */ padding-left: 1em; margin-left: 0; font-style: italic; color: #a1a1aa; /* zinc-400 */ }

    .single-article-source { margin-top: 30px; padding-top: 20px; border-top: 1px solid #3f3f46; /* zinc-700 */ font-size: 0.9rem; color: #a1a1aa; }
    .single-article-source a { color: #60a5fa; }
  `;

  const homeButton = `<a href="/" class="button-link" style="margin-right: 10px;">← Volver a Inicio</a>`;
  const allArticlesButton = `<a href="/api/view-articles" class="button-link">← Volver a todos los artículos</a>`;

  if (Array.isArray(data)) {
    // Código para la lista de artículos (no se modifica el contenido Markdown aquí)
    return `
      <!DOCTYPE html>
      <html lang="es">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Artículos en Un Canal Sobre IA</title>
        <style>${themeStyles}</style>
      </head>
      <body>
        <div class="container">
          ${homeButton}
          <h1>Artículos en Un Canal Sobre IA</h1>
          <p style="color: #a1a1aa;">Mostrando ${data.length} artículos más recientes.</p>
          <div class="articles">
            ${data.map((article: any) => `
              <div class="article">
                ${article.imageUrl ? `<img src="${article.imageUrl}" alt="${article.title || ''}">` : ''}
                <div class="content">
                  <h2 class="title">${article.title}</h2>
                  <div class="meta">
                    <span class="category">${article.category}</span>
                    <span class="date">${new Date(article.created_at).toLocaleDateString('es-ES')}</span>
                  </div>
                  <p class="excerpt">${(article.excerpt || '').substring(0, 120)}...</p>
                  <a class="view-link" href="/api/view-articles?id=${article.id}">Ver artículo completo</a>
                </div>
              </div>
            `).join('')}
          </div>
        </div>
      </body>
      </html>
    `;
  } else {
    const article = data;
    // Procesar el contenido Markdown con marked
    const rawContent = article.content || article.excerpt || '';
    let processedContent = '';
    try {
      processedContent = marked(rawContent) as string;
    } catch (e) {
      console.error("Error al procesar con marked en API:", e);
      processedContent = rawContent; // Fallback al contenido raw si marked falla
    }

    return `
      <!DOCTYPE html>
      <html lang="es">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>${article.title} | Un Canal Sobre IA</title>
        <style>
          ${themeStyles}
          /* Estilos adicionales para Tailwind Typography (prose) si fueran necesarios, 
             aunque aquí se están aplicando estilos básicos directamente. */
        </style>
      </head>
      <body>
        <div class="container">
          ${homeButton}
          ${allArticlesButton}
          
          <div class="single-article-header">
            <h1>${article.title}</h1>
            ${article.imageUrl ? `<img src="${article.imageUrl}" alt="${article.title || ''}">` : ''}
          </div>
          
          <div class="single-article-meta">
            <span class="category">${article.category}</span>
            <span class="date">${new Date(article.created_at).toLocaleDateString('es-ES')}</span>
          </div>
          
          <div class="single-article-content">
            ${processedContent}
          </div>

        </div>
      </body>
      </html>
    `;
  }
}
