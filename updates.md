# 🛠️ Reparar endpoint API `/api/news` para recibir publicaciones desde n8n

## 🧩 ¿Qué está pasando?

Actualmente, n8n intenta enviar una solicitud HTTP `POST` al endpoint:

```
https://un-canal-sobre-ia.vercel.app/api/news
```

Pero el servidor devuelve un error `405 - Method Not Allowed`.  
Esto significa que el archivo `/pages/api/news.ts` **no tiene soporte para el método POST**, o bien el código no está correctamente implementado.

Además, n8n está enviando un **JSON con la siguiente estructura**, y la API debe ser capaz de leerlo y guardarlo en Supabase:

```json
{
  "title": "Título de la noticia",
  "excerpt": "Resumen breve",
  "category": "tecnología",
  "imageUrl": "https://example.com/imagen.jpg",
  "content": "Texto completo",
  "featured": false
}
```

---

## ✅ Objetivo

Implementar correctamente el archivo `/pages/api/news.ts` en Next.js para que:

1. **Permita solicitudes `POST`**
2. **Valide los campos requeridos**
3. **Use Supabase para guardar la noticia**
4. **Responda con el estado apropiado**

---

## ✅ Tareas para el archivo `/pages/api/news.ts`

1. Verifica que exista el archivo:
```
/pages/api/news.ts
```

2. Sustituye su contenido por el siguiente:

```ts
import { NextApiRequest, NextApiResponse } from 'next'
import { addNewsItem } from '@/lib/news-data' // Asegúrate de que este archivo y función existen

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'POST') {
    const { title, excerpt, category, imageUrl, content, featured } = req.body

    if (!title || !excerpt || !category || !imageUrl || !content) {
      return res.status(400).json({ message: 'Faltan campos requeridos' })
    }

    try {
      const data = await addNewsItem({
        title,
        excerpt,
        category,
        imageUrl,
        content,
        featured: featured ?? false,
      })

      return res.status(201).json({ message: 'News created', data })
    } catch (error) {
      return res.status(500).json({ message: 'Error al guardar en Supabase', error: error.message })
    }
  } else {
    // Método no permitido
    return res.status(405).json({ message: 'Method not allowed' })
  }
}
```

---

## 📦 Sobre `addNewsItem`

- Esta función debe estar en `lib/news-data.ts`.
- Debe insertar la noticia en la tabla `news` de Supabase.
- Supabase ya debe estar configurado en `lib/supabaseClient.ts` con variables `NEXT_PUBLIC_SUPABASE_URL` y `NEXT_PUBLIC_SUPABASE_ANON_KEY`.

---

## 📌 Resultado esperado

Una vez corregido, este endpoint:

- Permitirá que n8n envíe un JSON con una noticia.
- Guardará la noticia en Supabase.
- Responderá con `201 Created` y la noticia creada.

**Prueba usando `curl`, Postman o directamente desde n8n para verificar que todo funcione.**