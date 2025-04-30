// Test final con los datos JSON correctos directamente al nuevo endpoint mejorado
import fetch from 'node-fetch';

// Crear un objeto de datos de prueba con una marca de tiempo única
const testNewsItem = {
  title: `TEST FINAL: Integración n8n con Next.js (${new Date().toISOString()})`,
  excerpt: "Este es un test final para verificar la integración completa",
  category: "tecnología",
  imageUrl: "https://picsum.photos/800/600?id=final-test",
  content: "Contenido de prueba para verificación final de la integración. Si puedes ver esta noticia en Supabase, significa que la integración está funcionando correctamente.",
  featured: true
};

// Función de prueba mejorada con diagnósticos
async function runFinalTest() {
  console.log('=== TEST FINAL INTEGRACIÓN N8N ===');
  console.log('Enviando datos de prueba:', testNewsItem);
  
  try {
    // Enviar datos al endpoint mejorado
    const response = await fetch('https://un-canal-sobre-ia.vercel.app/api/n8n-test', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(testNewsItem)
    });
    
    // Verificar status HTTP
    console.log(`Status HTTP: ${response.status}`);
    
    // Intentar leer el cuerpo de la respuesta
    const result = await response.json();
    console.log('Respuesta completa:', result);
    
    // Verificar si la inserción fue exitosa
    if (result.success && result.newsItem?.id) {
      console.log('\n✅ TEST EXITOSO');
      console.log('ID generado:', result.newsItem.id);
      console.log('URL para ver la noticia:', `https://un-canal-sobre-ia.vercel.app/noticias/${result.newsItem.id}`);
      console.log('\nIMPORTANTE: Si ves la noticia en Supabase pero no en la web, probablemente necesites:');
      console.log('1. Desplegar el cambio de dynamicParams = true en Vercel');
      console.log('2. Verificar que getLatestNewsItems en lib/news-data.ts no filtre por rango de IDs');
    } else {
      console.log('\n❌ TEST FALLIDO: La noticia no se insertó correctamente');
      console.log('Detalles de la respuesta:', result);
    }
  } catch (error) {
    console.error('\n❌ ERROR DE COMUNICACIÓN:', error);
  }
}

// Ejecutar el test
runFinalTest();
