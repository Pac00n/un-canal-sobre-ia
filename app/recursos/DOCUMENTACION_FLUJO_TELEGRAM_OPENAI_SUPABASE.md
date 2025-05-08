# Documentación: Flujo de Integración Telegram + OpenAI + Supabase

## Resumen General
Este documento describe el flujo completo implementado para automatizar la generación y publicación de artículos en una web mediante la integración de un bot de Telegram, la API de OpenAI (Assistants), y Supabase como backend. El objetivo es que los usuarios puedan enviar una URL al bot de Telegram y, tras la intervención de OpenAI, el artículo generado se publique automáticamente en la web.

---

## 1. Flujo General

1. **El usuario envía una URL al bot de Telegram.**
2. **El bot valida la URL** y la envía a una API interna en Next.js.
3. **La API utiliza OpenAI Assistants API** para generar un artículo completo (título, extracto, categoría, imagen, contenido, destacado).
4. **El bot solicita una imagen** al usuario o permite usar una imagen por defecto (`/skip_image`).
5. **El artículo se inserta en Supabase** con todos los campos validados y formateados.
6. **Se intenta revalidar la web** para mostrar el nuevo contenido (si la web está activa).

---

## 2. Puntos Clave y Soluciones Implementadas

- **Validación de Campos:**
  - Se asegura que los campos `title`, `excerpt`, `category`, `imageUrl`, `content`, y `featured` estén presentes y correctamente formateados.
  - El campo `category` se valida contra una lista de categorías permitidas.
  - El campo `is_featured` se corrigió en la base de datos y en el código para evitar errores de inserción.

- **Manejo de Estados y Comandos:**
  - El bot mantiene el estado de artículos pendientes de imagen.
  - Comandos `/skip_image` y `/cancel_article` permiten al usuario controlar el flujo.

- **Robustez ante Errores:**
  - Mejoras en el manejo de errores y logs detallados para facilitar la depuración.
  - Si la revalidación de la web falla, el artículo se guarda igualmente y se informa del error.

- **Seguridad:**
  - Uso de variables de entorno para todas las claves sensibles (`.env`).
  - Solo usuarios autorizados pueden interactuar con el bot.

---

## 3. Estructura de Archivos y Componentes Clave

- `telegram/bot.cjs`: Lógica principal del bot de Telegram.
- `app/api/news/route.ts`: API interna que integra OpenAI y Supabase.
- `.env`: Variables de entorno necesarias para la integración.
- `recursos/`: Carpeta con documentación y reportes de problemas.

---

## 4. Consideraciones para el Futuro
- Mantener actualizado el schema del asistente de OpenAI si se modifican los campos de los artículos.
- Mejorar la gestión de imágenes y categorías si se amplía la funcionalidad.
- Automatizar aún más el flujo para reducir la intervención manual.

---

## 5. Ejemplo de Uso
1. El usuario envía una URL de noticia al bot.
2. El bot responde con el artículo generado y solicita una imagen.
3. El usuario responde con una URL de imagen o usa `/skip_image`.
4. El artículo se publica automáticamente en la web.

---

## 6. Logs y Depuración
- Todos los eventos importantes quedan registrados en la terminal para facilitar el seguimiento de errores y el flujo de datos.

---

**Estado Actual:**
- El flujo está funcionando correctamente en producción, con artículos publicados y formateados correctamente tras la última revisión (08/05/2025).

---

**Responsable:**
- Proyecto gestionado y supervisado por el usuario LPA-PUESTO6.

---

Para cualquier modificación futura, revisar este documento y los reportes en la carpeta `recursos`.
