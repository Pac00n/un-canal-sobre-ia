// Ejemplo de configuración de n8n para integraciones automáticas con Un Canal Sobre IA
// Basado en los informes: problemas-integracion-n8n.md y PROGRESS_LOG_2025-04-30.md

/**
 * FLUJO COMPLETO: TELEGRAM → OPENAI → SITIO WEB
 * 
 * 1. WEBHOOK TELEGRAM (recibe URL de noticia)
 * 2. OPENAI (genera artículo estructurado)
 * 3. HTTP REQUEST (envía a la API)
 * 4. VERIFICACIÓN (comprueba éxito)
 */

// CONFIGURACIÓN DEL NODO CODE EN N8N
// Este código debe colocarse en un nodo "Code" después del procesamiento con OpenAI

function processOpenAIResponse(items) {
  // Extraer datos de OpenAI o cualquier fuente
  const openaiResponse = items[0].json; // Ajustar según estructura de tu flujo
  
  // Si ya tienes un JSON estructurado de OpenAI, puedes usarlo directamente
  // o validarlo/formatearlo aquí
  
  const newsItem = {
    title: openaiResponse.title || "Título generado automáticamente",
    excerpt: openaiResponse.excerpt || "Resumen automático de la noticia",
    category: openaiResponse.category || "tecnología",
    imageUrl: openaiResponse.imageUrl || "https://picsum.photos/800/600",
    content: openaiResponse.content || "Contenido de la noticia generado automáticamente.",
    featured: openaiResponse.featured || false
  };
  
  // Validar que todos los campos requeridos estén presentes
  const required = ["title", "excerpt", "category", "imageUrl", "content"];
  for (const field of required) {
    if (!newsItem[field]) {
      throw new Error(`El campo ${field} es requerido`);
    }
  }
  
  // Puedes agregar más validación aquí (longitud, formato, etc.)
  
  return {
    json: newsItem
  };
}

// Esta es la función principal que n8n ejecutará
return processOpenAIResponse($input.all());

/**
 * CONFIGURACIÓN DEL NODO HTTP REQUEST EN N8N
 * 
 * - Método: POST
 * - URL: https://un-canal-sobre-ia.vercel.app/api/n8n-test  <-- ¡IMPORTANTE! Usa este endpoint específico
 * - Authentication: None
 * - Headers:
 *   - Content-Type: application/json
 * - Body: {{$json}}
 * - Response Format: JSON
 */

// VALIDACIÓN DE RESPUESTA EN N8N (nodo "IF")
// Condición: {{$node["HTTP Request"].json["success"] === true}}

/**
 * VERIFICACIÓN FINAL (nodo "Set")
 * 
 * const newsId = $node["HTTP Request"].json.newsItem?.id;
 * const newsUrl = `https://un-canal-sobre-ia.vercel.app/noticias/${newsId}`;
 * 
 * return {
 *   json: {
 *     success: true,
 *     message: "Noticia creada exitosamente",
 *     newsId: newsId,
 *     viewUrl: newsUrl
 *   }
 * };
 */
