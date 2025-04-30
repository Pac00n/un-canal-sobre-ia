# Problema de integración entre n8n y Next.js (Un Canal Sobre IA)

## Contexto del proyecto

El proyecto "Un Canal Sobre IA" es una aplicación web desarrollada con las siguientes tecnologías:

- **Frontend y Backend**: Next.js (usando tanto App Router como Pages Router)
- **Base de datos**: Supabase (PostgreSQL)
- **Despliegue**: Vercel con CI/CD desde GitHub
- **Automatización**: n8n para la generación y publicación de contenido

La aplicación muestra noticias sobre inteligencia artificial categorizadas y con diferentes secciones como "Destacadas", "Tendencias" y "Últimas noticias". El contenido se almacena en una base de datos Supabase y se accede a él a través de APIs creadas en Next.js.

### Arquitectura actual

1. **Estructura de la aplicación**:
   - `app/`: Contiene las rutas y componentes utilizando App Router de Next.js
   - `pages/`: Contiene las rutas y componentes utilizando Pages Router de Next.js
   - `components/`: Componentes React reutilizables
   - `lib/`: Funciones de utilidad, incluyendo `news-data.ts` para interactuar con Supabase

2. **API Endpoints**:
   - `/api/news/` (App Router): Endpoint principal para gestionar noticias
   - `/api/n8n-webhook` (Pages Router): Endpoint específico para recibir datos de n8n
   - `/api/n8n-test` (Pages Router): Endpoint para pruebas con permisividad total

3. **Flujo de datos**:
   - n8n genera contenido (potencialmente usando OpenAI u otro servicio)
   - n8n envía el contenido a nuestra API mediante una solicitud HTTP POST
   - La API procesa los datos y los guarda en Supabase
   - El frontend muestra las noticias almacenadas en Supabase

## Problema actual

Estamos intentando integrar n8n Cloud para automatizar la creación de noticias, pero estamos enfrentando problemas al enviar datos desde n8n a nuestra API. A pesar de haber creado múltiples endpoints y configurado correctamente la API en Next.js, n8n envía un cuerpo vacío en las solicitudes HTTP.

### Síntomas específicos

1. **Solicitudes con cuerpo vacío**: A pesar de configurar n8n para enviar un objeto JSON con datos de noticia, nuestros logs muestran que el cuerpo de la solicitud está vacío (`"body": { "": "" }`).

2. **Respuestas correctas de la API**: Nuestro endpoint responde con `success: true` porque hemos configurado los endpoints de prueba para devolver respuestas exitosas incluso con datos incorrectos o vacíos.

3. **Headers correctos**: Las solicitudes tienen correctamente configurados los headers como `Content-Type: application/json`.

4. **No hay errores HTTP**: Las solicitudes se completan con código 200, pero no se guardan datos en Supabase.

### Soluciones intentadas

1. **Crear endpoints específicos para n8n**:
   - Creamos `/api/n8n-webhook` y `/api/n8n-test` específicamente para n8n

2. **Manejar múltiples formatos de datos**:
   - Implementamos lógica para procesar JSON, FormData y URL-encoded data

3. **CORS y preflight**:
   - Configuramos correctamente CORS y manejo de solicitudes OPTIONS

4. **Diferentes configuraciones en n8n**:
   - Probamos con nodo HTTP Request con diferentes configuraciones
   - Intentamos usar directamente JSON en el cuerpo
   - Probamos con el nodo Code para generar el objeto correcto

5. **Endpoints ultra-permisivos**:
   - Creamos un endpoint que acepta cualquier método HTTP y cualquier formato de datos

### Estructura de datos esperada

```json
{
  "title": "Título de la noticia",
  "excerpt": "Resumen breve de la noticia",
  "category": "tecnología", 
  "imageUrl": "https://example.com/image.jpg",
  "content": "Contenido completo de la noticia",
  "featured": false
}
```

## Código relevante

### Endpoint para n8n (/pages/api/n8n-webhook.ts)

```typescript
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Configuración CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  console.log('Recibida solicitud en /api/n8n-webhook');
  console.log('Método:', req.method);
  console.log('Headers:', req.headers);
  console.log('Query:', req.query);
  console.log('Body:', req.body);

  try {
    // Intentar extraer datos de varias fuentes
    let newsItemData;
    
    if (req.body && Object.keys(req.body).length > 0) {
      newsItemData = req.body;
    } else {
      // Datos de ejemplo para pruebas
      newsItemData = {
        title: "Noticia de prueba automática",
        excerpt: "Este es un resumen de prueba",
        category: "tecnología",
        imageUrl: "https://picsum.photos/800/600",
        content: "Este es el contenido completo de la noticia de prueba",
        featured: false
      };
    }

    // Guardar en Supabase
    const result = await addNewsItem(newsItemData);
    
    return res.status(200).json({
      success: true,
      message: "Noticia guardada correctamente",
      newsItem: result
    });
  } catch (error) {
    console.error('Error procesando solicitud:', error);
    return res.status(500).json({ 
      success: false, 
      message: "Error al guardar la noticia",
      error: error instanceof Error ? error.message : 'Error desconocido'
    });
  }
}
```

### Función para guardar noticias (lib/news-data.ts)

```typescript
export async function addNewsItem(newItemData: NewNewsItem): Promise<NewsItem | null> {
  console.log('Adding news item:', newItemData);
  const { data, error } = await supabase
    .from('news')
    .insert([
      {
        title: newItemData.title,
        excerpt: newItemData.excerpt,
        category: newItemData.category,
        imageUrl: newItemData.imageUrl,
        content: newItemData.content,
        featured: newItemData.featured || false,
      },
    ])
    .select()
    .single();

  if (error) {
    console.error('Error adding news item to Supabase:', error);
    return null;
  }

  console.log('News item added successfully:', data);
  return data || null;
}
```

## Configuración de n8n

En n8n estamos utilizando:

1. Un nodo de OpenAI para generar contenido
2. Un nodo Code para formatear el JSON:
   ```javascript
   const newsItem = {
     title: "Título generado por IA",
     excerpt: "Resumen generado por IA",
     category: "tecnología",
     imageUrl: "https://picsum.photos/800/600",
     content: "Contenido generado por IA",
     featured: false
   };
   
   return {
     json: newsItem
   };
   ```
3. Un nodo HTTP Request para enviar los datos a nuestra API:
   - URL: `https://un-canal-sobre-ia.vercel.app/api/n8n-test`
   - Método: `POST`
   - Headers: `Content-Type: application/json`
   - Body: `{{ $json }}`

## Posibles causas y próximos pasos

1. **Problema con el formato de los datos en n8n**:
   - n8n podría estar serializado incorrectamente el JSON
   - La versión de axios que utiliza n8n podría tener algún problema

2. **Incompatibilidad entre Next.js y n8n**:
   - El body parser de Next.js podría no estar interpretando correctamente los datos

3. **Próximos pasos recomendados**:
   - Probar con Postman o cURL para confirmar que la API funciona correctamente
   - Intentar usar un nodo webhook en n8n en lugar de HTTP Request
   - Consultar la documentación específica de n8n sobre integración con Next.js
   - Considerar implementar un middleware personalizado en Next.js para depurar las solicitudes entrantes
   - Verificar si hay actualizaciones disponibles para n8n o limitaciones conocidas

## Referencias relevantes

- [Documentación de Next.js API Routes](https://nextjs.org/docs/api-routes/introduction)
- [n8n HTTP Request Node](https://docs.n8n.io/integrations/builtin/app-nodes/n8n-nodes-base.httprequest/)
- [Supabase JavaScript Client](https://supabase.com/docs/reference/javascript/introduction)

## Detalles de entorno

- Next.js: 14.x
- Supabase JS Client: la versión del package.json
- Vercel: Última versión
- n8n: Versión Cloud
