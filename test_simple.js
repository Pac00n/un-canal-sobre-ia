// Test simplificado para verificar integración
import fetch from 'node-fetch';

// Datos de prueba simplificados (simulando respuesta de OpenAI)
const testData = {
  title: "TEST-VERIFICACIÓN: Integración n8n-Next.js funcional",
  excerpt: "Prueba final para confirmar la correcta integración entre n8n y Un Canal Sobre IA",
  category: "tecnología",
  imageUrl: "https://picsum.photos/800/600?random=final-test",
  content: "Este es un contenido de prueba para verificar que el flujo completo funciona correctamente. Si puedes ver esta noticia en el sitio web, la integración está funcionando según lo esperado.",
  featured: false
};

// Ejecutar test simplificado
(async () => {
  console.log("▶️ Iniciando test de integración");
  console.log("📦 Enviando datos a /api/n8n-test...");
  
  try {
    const response = await fetch('https://un-canal-sobre-ia.vercel.app/api/n8n-test', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(testData)
    });
    
    const result = await response.json();
    
    console.log(`📊 Respuesta: ${response.status}`);
    console.log("📊 Datos:", JSON.stringify(result, null, 2));
    
    if (result.success && result.newsItem?.id) {
      console.log("✅ TEST EXITOSO");
      console.log(`🔗 Ver noticia en: https://un-canal-sobre-ia.vercel.app/noticias/${result.newsItem.id}`);
    } else {
      console.log("❌ PRUEBA FALLIDA");
    }
  } catch (error) {
    console.log("❌ ERROR:", error.message);
  }
})();
