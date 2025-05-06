# Telegram → OpenAI → Web: Guía de Configuración

Este documento explica cómo configurar la integración directa entre Telegram, OpenAI y el sitio web "Un Canal Sobre IA", reemplazando la dependencia de n8n por una solución más directa.

## Estructura de la solución

1. **Bot de Telegram** (`/telegram/bot.js`)
   - Recibe URLs o temas de artículos
   - Conecta directamente con OpenAI
   - Publica en el sitio web a través del endpoint API

2. **Endpoint API** (`/pages/api/n8n-test.ts`)
   - Procesa los datos estructurados
   - Guarda en Supabase usando la clave de servicio (bypassa RLS)
   - Devuelve el ID de la noticia y confirma la inserción

3. **Sitio Web**
   - Muestra las noticias publicadas automáticamente 
   - Usa `dynamicParams = true` para generar páginas dinámicamente

## Pasos para configurar

### 1. Requisitos previos

- Crear un bot de Telegram con BotFather
- Obtener una API Key de OpenAI
- Tener desplegada la app en Vercel con las variables de entorno correctas

### 2. Variables de Entorno

Crea un archivo `.env` en la carpeta del bot con:

```
TELEGRAM_BOT_TOKEN=tu_token_de_telegram
OPENAI_API_KEY=tu_api_key_de_openai
API_ENDPOINT=https://un-canal-sobre-ia.vercel.app/api/n8n-test
AUTHORIZED_TELEGRAM_USERS=id1,id2,id3
```

### 3. Instalación de dependencias

```bash
cd telegram
npm init -y
npm install telegraf openai axios dotenv
```

### 4. Iniciar el bot

```bash
node bot.js
```

### 5. Usando el bot

1. Inicia una conversación con tu bot en Telegram
2. Envía una URL o describe un tema
3. El bot generará un artículo usando OpenAI
4. Te mostrará una vista previa
5. Confirma con `/publicar` para que aparezca en el sitio

## Flujo de uso

```
USUARIO --[URL]--> BOT TELEGRAM --[Prompt]--> OPENAI --[JSON]--> API WEB --[Insert]--> SUPABASE --[Display]--> SITIO WEB
```

## Ventajas sobre n8n

- **Mayor Control**: Flujo directo sin dependencias adicionales
- **Revisión Humana**: Aprueba cada artículo antes de publicar
- **Más Rápido**: Menos intermediarios significa menos latencia
- **Menos Problemas**: Evita los problemas documentados con n8n sending empty bodies

## Solución a problemas anteriores

Este enfoque resuelve directamente los problemas mencionados en:
- `problemas-integracion-n8n.md`: Elimina la dependencia de n8n
- `PROGRESS_LOG_2025-04-30.md`: Usa la misma solución de service role key + dynamicParams

---

*Basado en el análisis realizado el 30 de abril de 2025*
