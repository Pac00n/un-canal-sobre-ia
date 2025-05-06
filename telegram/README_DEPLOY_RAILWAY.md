# Despliegue del bot de Telegram en Railway

## Pasos rápidos

1. **Sube la carpeta `telegram/` como un proyecto nuevo en Railway.**
2. Railway detectará automáticamente el `package.json` y el `Procfile`.
3. Configura las variables de entorno en Railway:
   - `TELEGRAM_BOT_TOKEN`
   - `TELEGRAM_API_TOKEN`
   - `SUPABASE_URL`
   - `SUPABASE_SERVICE_ROLE_KEY`
   - `AUTHORIZED_TELEGRAM_USERS`
   - `API_ENDPOINT`
4. Haz deploy. Railway ejecutará el bot como proceso persistente (`worker`).

## Notas importantes
- El bot estará siempre activo y escuchando mensajes.
- Puedes ver logs y reiniciar el bot desde el panel de Railway.
- Si actualizas el código, Railway redeployará automáticamente.
- Si necesitas instalar más dependencias, actualiza `package.json` y haz push.

## Comando útil para desarrollo local
```bash
npm install
node bot-minimal.js
```
