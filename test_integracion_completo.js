// Test completo simulando flujo n8n para verificar integración
import fetch from 'node-fetch';

// Simula la respuesta de OpenAI (que sería procesada en n8n)
const simulatedOpenAIResponse = {
  title: "NOTICIA IA VERIFICACIÓN: Nuevos avances en la integración entre n8n y Next.js",
  excerpt: "Un equipo de desarrolladores logra solucionar los problemas de integración entre automatizaciones n8n y aplicaciones Next.js con Supabase.",
  category: "tecnología",
  imageUrl: "https://picsum.photos/800/600?random=integration",
  content: `
    Un equipo de desarrolladores ha logrado resolver con éxito los problemas de integración entre la plataforma de automatización n8n y aplicaciones Next.js que utilizan Supabase como backend.
    
    El principal desafío era la transmisión correcta de datos a través de API endpoints seguros con políticas RLS (Row Level Security) activadas en Supabase. La solución implementada permite ahora la creación automática de contenido mediante OpenAI y su publicación directa en portales de noticias.
    
    "Esta integración abre enormes posibilidades para la automatización de contenido con IA", explica uno de los desarrolladores. La solución utiliza un enfoque innovador que combina claves de servicio y endpoints especializados para garantizar la correcta inserción de datos.
    
    Los próximos pasos incluyen ampliar esta integración para soportar más fuentes de datos y mejorar la generación de contenido mediante técnicas avanzadas de procesamiento de lenguaje natural.
  `,
  featured: true
};

// Función principal que ejecuta el test completo
async function testFullIntegration() {
  console.log("=== INICIANDO TEST DE INTEGRACIÓN COMPLETA ===");
  console.log("1. Datos simulados de OpenAI:", simulatedOpenAIResponse);
  
  try {
    // Simular el envío HTTP desde n8n al endpoint correcto
    console.log("\n2. Enviando datos al endpoint n8n-test...");
    const response = await fetch('https://un-canal-sobre-ia.vercel.app/api/n8n-test', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(simulatedOpenAIResponse)
    });
    
    // Procesar la respuesta
    const result = await response.json();
    console.log(`3. Respuesta recibida (${response.status}):`, result);
    
    if (response.status === 201 || response.status === 200) {
      console.log("\n✅ TEST EXITOSO: La noticia fue insertada correctamente");
      
      // Obtener información para verificación
      const newsId = result.newsItem?.id || "ID no disponible";
      const newsUrl = `https://un-canal-sobre-ia.vercel.app/noticias/${newsId}`;
      
      console.log("\n=== INFORMACIÓN PARA VERIFICACIÓN MANUAL ===");
      console.log(`ID de la noticia: ${newsId}`);
      console.log(`URL para ver la noticia: ${newsUrl}`);
      console.log(`Para ver la noticia, visita: ${newsUrl}`);
      console.log("La noticia también debería aparecer en la sección 'Últimas Noticias' de la página principal");
      console.log("(una vez que el nuevo despliegue con dynamicParams=true se complete en Vercel)");
    } else {
      console.log("\n❌ TEST FALLIDO: La noticia no pudo ser insertada");
      console.log("Respuesta detallada:", result);
    }
  } catch (error) {
    console.error("\n❌ ERROR EN EL TEST:", error);
  }
}

// Ejecutar el test
testFullIntegration();
