# INTEGRACIÓN TELEGRAM → OPENAI → WEB: ESTADO Y CONTINUACIÓN

## Estado actual del proyecto (30 de abril de 2025)

Hemos implementado con éxito una integración directa entre Telegram, OpenAI y nuestra aplicación web, eliminando la dependencia de n8n que estaba causando problemas. El flujo actual es:

```
Usuario → Bot Telegram → API (Next.js) → OpenAI Assistants API v2 → Supabase → Sitio Web
```

### Componentes implementados:

1. **Bot de Telegram** (`/telegram/bot-minimal.js`):
   - Recibe URLs de noticias de usuarios autorizados
   - Envía las URLs al endpoint de nuestra API
   - Muestra enlaces a los artículos publicados

2. **API Endpoint** (`/pages/api/telegram-news.ts`):
   - Recibe solicitudes del bot de Telegram
   - Utiliza OpenAI Assistants API v2 para generar artículos
   - Guarda los artículos en Supabase usando el service role key (bypass RLS)
   - Devuelve información sobre el artículo publicado

3. **Configuración**:
   - Variables de entorno del bot en `/telegram/.env`
   - Variables de entorno de Vercel para la API y servicios

## Configuración necesaria

### 1. Variables de entorno para el Bot (archivo `.env` en carpeta `telegram`):

```
TELEGRAM_BOT_TOKEN=8164384647:AAEYrQIJeWf__fXdFKiqZRqfCjhHG5kGdJA
TELEGRAM_API_TOKEN=telegram-api-token-secreto-2025
API_ENDPOINT=https://un-canal-sobre-ia.vercel.app/api/telegram-news
AUTHORIZED_TELEGRAM_USERS=474426118
```

### 2. Variables de entorno en Vercel:

```
OPENAI_API_KEY=tu-api-key-de-openai
SUPABASE_URL=https://jicyrqayowgaepkvalno.supabase.co
SUPABASE_SERVICE_ROLE_KEY=tu-service-role-key-de-supabase
TELEGRAM_API_TOKEN=telegram-api-token-secreto-2025
OPENAI_ASSISTANT_ID=asst_abc123 (opcional, si tienes un asistente específico)
```

## Cómo probar la integración

1. **Ejecutar el bot localmente**:
   ```bash
   cd telegram
   node bot-minimal.js
   ```

2. **Interactuar con el bot en Telegram**:
   - Busca el bot por su nombre de usuario
   - Envía `/start` para iniciar
   - Envía una URL de noticia sobre tecnología o IA
   - El bot procesará la URL y responderá con un enlace al artículo publicado

3. **Verificar el resultado**:
   - Visita el enlace proporcionado por el bot
   - El artículo debería estar disponible en tu sitio web

## Posibles problemas y soluciones

1. **El bot no responde**:
   - Verifica que el bot esté en ejecución
   - Comprueba que el token de Telegram sea correcto
   - Asegúrate de que tu ID esté en la lista de usuarios autorizados

2. **Error al procesar URLs**:
   - Revisa los logs de Vercel para ver errores específicos
   - Verifica que todas las variables de entorno estén configuradas en Vercel
   - Comprueba que la URL esté accesible públicamente

3. **Errores de OpenAI**:
   - Verifica que tu API key de OpenAI sea válida
   - Comprueba los límites de tu cuenta de OpenAI
   - Revisa los logs para ver errores específicos de OpenAI

4. **Errores al guardar en Supabase**:
   - Verifica que las credenciales de Supabase sean correctas
   - Comprueba que la tabla 'news' exista y tenga la estructura correcta
   - Asegúrate de estar usando la service role key para bypass RLS

## Próximos pasos

1. **Desplegar el bot en un servidor**:
   Para un uso continuo, el bot debería estar ejecutándose en un servidor siempre activo, no localmente. Opciones:
   - Heroku
   - Railway
   - DigitalOcean
   - Servidor propio

2. **Mejorar el manejo de errores**:
   - Implementar reintentos para errores temporales
   - Agregar notificaciones para errores críticos
   - Mejorar los mensajes de error para el usuario

3. **Ampliar funcionalidades**:
   - Añadir comando para ver estadísticas de artículos publicados
   - Implementar verificación de URLs duplicadas
   - Añadir opción para seleccionar categoría o destacar artículos

4. **Documentación**:
   - Actualizar README.md principal con la nueva arquitectura
   - Añadir diagrama de flujo de la integración
   - Documentar estructura de la tabla news en Supabase

## Conclusión

La integración directa Telegram → OpenAI → Web está funcionando correctamente y es más robusta que la solución anterior basada en n8n. Ahora tienes un flujo completo de automatización de publicación de noticias a partir de URLs compartidas en Telegram.

Para continuar el desarrollo, enfócate en desplegar el bot en un servidor para uso permanente y expandir sus funcionalidades según tus necesidades específicas.
