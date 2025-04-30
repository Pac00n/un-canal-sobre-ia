import fetch from 'node-fetch';

// Test automático para integración n8n -> /api/news en producción
(async () => {
  const url = 'https://un-canal-sobre-ia.vercel.app/api/news';
  const payload = {
    title: 'Noticia automática de prueba (OpenAI/n8n)',
    excerpt: 'Esta noticia fue generada automáticamente para comprobar la integración producción.',
    category: 'automatizacion',
    imageUrl: 'https://picsum.photos/800/600?auto=test',
    content: 'Contenido completo generado para testear la publicación automática en la web pública. Si ves esto, ¡la integración funciona!',
    featured: false
  };

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    const result = await response.json();
    console.log('Status:', response.status);
    console.log('Respuesta:', result);
  } catch (error) {
    console.error('Error en test automático:', error);
  }
})();
