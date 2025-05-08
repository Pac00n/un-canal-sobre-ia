# Guía de Instalación y Uso: Un Canal Sobre IA

Este documento proporciona instrucciones detalladas para configurar y utilizar la integración automática de Telegram, OpenAI y Supabase para generar y publicar artículos sobre IA.

## Requisitos Previos

Antes de comenzar, asegúrate de tener instalado:

- [Node.js](https://nodejs.org/) (v14 o superior)
- [npm](https://www.npmjs.com/) (viene con Node.js)
- Un bot de Telegram creado a través de [BotFather](https://t.me/botfather)
- Una cuenta en [OpenAI](https://platform.openai.com/) con API key
- Una cuenta en [Supabase](https://supabase.com/) con una base de datos configurada
- Un entorno de desarrollo (como VS Code) para editar los archivos

## Estructura del Proyecto

El proyecto consta de tres componentes principales:

1. **Bot de Telegram** (carpeta `/telegram`): Recibe URLs de usuarios y se comunica con OpenAI y Supabase
2. **API de Next.js** (carpeta `/app/api`): Endpoints para la integración con servicios externos
3. **Sitio Web** (carpeta principal): Muestra los artículos generados

## Guía de Configuración Paso a Paso

### 1. Clonar el Repositorio

```bash
git clone https://github.com/Pac00n/un-canal-sobre-ia.git
cd un-canal-sobre-ia
```

### 2. Instalar Dependencias

Instala las dependencias para el proyecto principal:

```bash
npm install
```

Y para el bot de Telegram:

```bash
cd telegram
npm install
cd ..
```

### 3. Configurar Variables de Entorno

#### Para el proyecto principal
Crea un archivo `.env` en la raíz del proyecto con las siguientes variables:

```
OPENAI_API_KEY=tu_api_key_de_openai
OPENAI_ASSISTANT_ID=tu_assistant_id_de_openai
SUPABASE_URL=https://tu-proyecto.supabase.co
SUPABASE_SERVICE_ROLE_KEY=tu_service_role_key_de_supabase
SUPABASE_ANON_KEY=tu_anon_key_de_supabase
NEXT_PUBLIC_SUPABASE_URL=https://tu-proyecto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=tu_anon_key_de_supabase
```

#### Para el bot de Telegram
Crea un archivo `.env` en la carpeta `/telegram` con estas variables:

```
TELEGRAM_BOT_TOKEN=tu_token_de_telegram
TELEGRAM_API_TOKEN=token_secreto_para_apis
OPENAI_API_KEY=tu_api_key_de_openai
OPENAI_ASSISTANT_ID=tu_assistant_id_de_openai
SUPABASE_URL=https://tu-proyecto.supabase.co
SUPABASE_SERVICE_ROLE_KEY=tu_service_role_key_de_supabase
NEXT_PUBLIC_BASE_URL=https://tu-sitio-web.vercel.app
AUTHORIZED_TELEGRAM_USERS=id1,id2,id3
```

> **¡IMPORTANTE!** Asegúrate de usar `SUPABASE_URL` (no solo `NEXT_PUBLIC_SUPABASE_URL`) en el archivo `.env` de la carpeta `telegram`.

### 4. Configuración de Supabase

Asegúrate de que tu base de datos en Supabase tiene una tabla llamada `news` con la siguiente estructura:

- `id` (generado automáticamente)
- `title` (texto)
- `excerpt` (texto)
- `content` (texto)
- `source_url` (texto)
- `imageUrl` (texto)
- `category` (texto)
- `created_at` (timestamp)
- `featured` (booleano)

### 5. Preparación del Asistente de OpenAI

1. Crea un asistente en la [plataforma de OpenAI](https://platform.openai.com/assistants)
2. Configúralo para que genere artículos estructurados con los campos necesarios (título, extracto, categoría, contenido)
3. Copia el ID del asistente y úsalo en la variable `OPENAI_ASSISTANT_ID`

## Ejecutando el Proyecto

### 1. Iniciar el Sitio Web (Desarrollo)

```bash
npm run dev
```

Esto iniciará el sitio web en `http://localhost:3000`.

### 2. Ejecutar el Bot de Telegram

```bash
cd telegram
node bot.cjs
```

Verás logs indicando que el bot se ha iniciado correctamente.

## Pruebas y Verificación

### Verificar la Configuración

Puedes usar estos scripts para verificar diferentes partes de la configuración:

```bash
# Verificar token de Telegram
cd telegram
node test-token.js

# Verificar conexión a Supabase
node test-supabase.js

# Verificar el bot en modo debug
node debug-bot.js
```

### Prueba del Flujo Completo

1. Abre Telegram y busca tu bot por su nombre de usuario
2. Envía `/start` para iniciar la conversación
3. Envía `/status` para verificar que todos los servicios estén conectados
4. Envía una URL de un artículo sobre IA (por ejemplo: https://openai.com/blog/new-models-and-developer-products-announced-at-devday)
5. Espera mientras OpenAI genera el artículo (aproximadamente 1 minuto)
6. Cuando el bot te pida una imagen:
   - Envía una URL de imagen (debe terminar en .jpg, .png, .gif, .webp)
   - O usa `/skip_image` para usar una imagen predeterminada
7. El bot guardará el artículo en Supabase y actualizará el sitio web
8. Abre tu sitio web para ver el artículo publicado

## Comandos del Bot

- `/start` - Inicia el bot
- `/help` - Muestra instrucciones de uso
- `/status` - Verifica la conexión con Telegram, OpenAI y Supabase
- `/test` - Realiza una prueba de inserción en Supabase
- `/skip_image` - Usa una imagen predeterminada cuando se está creando un artículo
- `/cancel_article` - Cancela la creación del artículo actual

## Solución de Problemas Comunes

### El bot no responde
- Verifica que el bot esté en ejecución (`node bot.cjs`)
- Confirma que el token de Telegram es correcto (`node test-token.js`)
- Asegúrate de que tu ID de Telegram esté en la lista de `AUTHORIZED_TELEGRAM_USERS`

### Error al conectar con Supabase
- Verifica que la URL de Supabase sea correcta y esté en la variable `SUPABASE_URL`
- Confirma que las claves de Supabase son correctas (`SUPABASE_SERVICE_ROLE_KEY`)
- Ejecuta `node test-supabase.js` para diagnóstico detallado

### Error al generar artículos con OpenAI
- Verifica que la API key de OpenAI sea válida
- Confirma que el ID del asistente de OpenAI existe y está configurado correctamente
- Revisa los límites de tu cuenta de OpenAI

### Errores "Cannot read properties of undefined"
- Estos suelen ocurrir cuando hay problemas con el contexto en los manejadores de mensajes
- Verifica que todas las variables de entorno estén configuradas correctamente
- Reinicia el bot después de hacer cambios en las variables de entorno

## Despliegue en Producción

Para un uso continuo, se recomienda:

1. Desplegar el sitio web en [Vercel](https://vercel.com)
2. Configurar las variables de entorno en Vercel
3. Ejecutar el bot de Telegram en un servidor siempre activo (como DigitalOcean, Heroku, o Railway)

## Recursos Adicionales

- [Documentación de Telegraf](https://telegraf.js.org/)
- [Documentación de OpenAI Assistants API](https://platform.openai.com/docs/assistants/overview)
- [Documentación de Supabase](https://supabase.com/docs)
- [Documentación de Next.js](https://nextjs.org/docs)

---

Última actualización: 8 de mayo de 2025
