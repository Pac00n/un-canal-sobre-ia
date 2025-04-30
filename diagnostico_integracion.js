// Herramienta de diagnóstico para la integración n8n - Un Canal Sobre IA
import fetch from 'node-fetch';

// Test con endpoint de diagnóstico temporal
(async () => {
  // Test 1: Datos básicos (producción)
  console.log("==== TEST 1: Producción con datos básicos ====");
  const url = 'https://un-canal-sobre-ia.vercel.app/api/n8n-test';
  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title: "Test diagnóstico n8n - Datos Básicos",
        excerpt: "Prueba con datos mínimos para diagnóstico",
        category: "test",
        imageUrl: "https://picsum.photos/800/600?test=basic",
        content: "Contenido de prueba",
        featured: false
      })
    });
    const result = await response.json();
    console.log('Status:', response.status);
    console.log('Respuesta:', result);
  } catch (error) {
    console.error('Error:', error);
  }

  // Test 2: Datos completos (producción)
  console.log("\n==== TEST 2: Producción con datos completos ====");
  try {
    const response = await fetch('https://un-canal-sobre-ia.vercel.app/api/n8n-test', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title: "Test diagnóstico completo n8n (Service Role)",
        excerpt: "Prueba con todos los datos para diagnóstico",
        category: "diagnostico",
        imageUrl: "https://picsum.photos/800/600?test=full",
        content: "Contenido extendido de prueba con diagnóstico completo para validar la integración entre n8n y Next.js.",
        featured: true
      })
    });
    const result = await response.json();
    console.log('Status:', response.status);
    console.log('Respuesta:', result);
  } catch (error) {
    console.error('Error:', error);
  }
})();
