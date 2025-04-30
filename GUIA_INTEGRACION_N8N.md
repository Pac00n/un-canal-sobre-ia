# Guía de Integración: n8n → Un Canal Sobre IA

Esta guía detalla cómo configurar correctamente n8n para enviar noticias automáticas a la web "Un Canal Sobre IA", basado en la solución a los problemas de integración documentados.

## Resumen de la Solución

Según los informes en `problemas-integracion-n8n.md` y `PROGRESS_LOG_2025-04-30.md`, hemos identificado que:

1. **El problema principal** era las restricciones de Row Level Security (RLS) en Supabase para el rol `anon`.
2. **La solución** implementada fue usar el endpoint `/api/n8n-test` que utiliza la `SUPABASE_SERVICE_ROLE_KEY` para bypasear RLS.
3. **Las páginas dinámicas** ahora funcionan gracias a `dynamicParams = true`, permitiendo ver noticias nuevas.

## Configuración Correcta en n8n

### 1. Configuración del Nodo "Set" o "Code"

Utiliza un nodo "Set" o "Code" para estructurar los datos de la noticia:

```javascript
// Si usas el nodo Code
const newsItem = {
  title: "Título generado por IA",
  excerpt: "Resumen generado por IA", // Debe ser conciso
  category: "tecnología", // Opciones: tecnología, ia, negocios, ciencia, etc.
  imageUrl: "https://picsum.photos/800/600", // URL a una imagen relevante
  content: "Contenido generado por IA. Este debe ser el texto completo de la noticia.",
  featured: false // true para noticias destacadas
};

return {
  json: newsItem
};
```

### 2. Configuración del Nodo HTTP Request

Este es el nodo crucial que debe configurarse exactamente así:

```
- Método: POST
- URL: https://un-canal-sobre-ia.vercel.app/api/n8n-test
- Authentication: None
- Headers:
  - Content-Type: application/json
- Query Parameters: [dejar vacío]
- Request Format: JSON
- Body: {{$json}}
- Response Format: JSON
- Array Format: indices
```

> ⚠️ **IMPORTANTE**: Usa específicamente el endpoint `/api/n8n-test` (no `/api/news` ni `/api/n8n-webhook`) ya que este endpoint utiliza la clave de servicio que bypasea RLS.

### 3. Flujo Completo con OpenAI

Para un flujo automatizado Telegram → OpenAI → Sitio Web:

1. **Trigger**: Utiliza un Webhook de Telegram o cualquier otra fuente.
2. **Procesamiento**: 
   - Envía la URL o contenido a OpenAI para generar el artículo estructurado.
   - Configura OpenAI para que devuelva un JSON con la estructura esperada.
3. **Transformación**: Usa el nodo "Set" o "Code" para asegurar la estructura del JSON.
4. **Envío**: Utiliza HTTP Request configurado como se indicó anteriormente.
5. **Validación**: Verifica la respuesta HTTP 201 y el ID generado.

## Ejemplo de Prompt para OpenAI

```
Genera un artículo sobre la siguiente URL: [URL]. 
Debe ser una noticia sobre tecnología o IA.

Devuelve ÚNICAMENTE un objeto JSON con la siguiente estructura, sin texto adicional:
{
  "title": "Título atractivo y conciso",
  "excerpt": "Resumen de 1-2 frases que capture la esencia",
  "category": "tecnología",
  "imageUrl": "https://picsum.photos/800/600",
  "content": "Contenido completo del artículo, de 3-4 párrafos",
  "featured": false
}
```

## Verificación de Éxito

Después de ejecutar el flujo:

1. La respuesta debería tener código HTTP 201.
2. El JSON debe incluir `"success": true` y un ID generado.
3. Visita la URL `https://un-canal-sobre-ia.vercel.app/noticias/[ID]` usando el ID devuelto.
4. La noticia debería aparecer también en la página principal en la sección "Últimas Noticias".

---

*Generado con Cascade en 2025-04-30*
