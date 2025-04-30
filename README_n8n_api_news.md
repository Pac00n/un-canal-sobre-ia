# Ejemplo de configuración para enviar una noticia desde n8n a `/api/news`

## 1. Nodo HTTP Request (n8n)
- **Método:** POST
- **URL:** https://<TU_DOMINIO_VERCELO>/api/news
- **Headers:**
  - Content-Type: application/json
- **Body:**
  - Tipo: JSON
  - Contenido:
```json
{
  "title": "Título generado por IA",
  "excerpt": "Resumen generado por IA",
  "category": "tecnología",
  "imageUrl": "https://picsum.photos/800/600",
  "content": "Contenido generado por IA",
  "featured": false
}
```

## 2. Notas importantes
- El body debe ser JSON, no form-data ni texto plano.
- El endpoint `/api/news` acepta CORS y responde con errores claros si faltan campos.
- Si recibes errores 400, revisa que todos los campos requeridos estén presentes.
- Si recibes errores 500, revisa los logs de Vercel y la consola de Supabase.

## 3. Debug
- Puedes probar el endpoint con Postman/cURL para aislar si el problema es de n8n o del backend.
- Si usas `/pages/api/n8n-test.ts`, recuerda que ignora RLS y siempre inserta una noticia de ejemplo.

---

Este README garantiza que cualquier usuario pueda conectar n8n con tu API Next.js de forma robusta y reproducible.
