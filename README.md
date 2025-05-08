# Proyecto: Canal sobre IA – Integración Telegram + OpenAI + Supabase

## Descripción
Este proyecto automatiza la generación y publicación de artículos en una web usando un bot de Telegram, OpenAI (Assistants API) y Supabase como backend. El flujo permite que un usuario envíe una URL al bot, se genere un artículo con IA, se solicite una imagen y finalmente se publique automáticamente en la web.

---

## Flujo de trabajo
1. El usuario envía una URL al bot de Telegram.
2. El bot valida la URL y la envía a una API interna (Next.js).
3. La API genera el artículo usando OpenAI Assistants API.
4. El bot solicita al usuario una imagen o permite saltar este paso con `/skip_image`.
5. El artículo se guarda en Supabase y se intenta revalidar la web.
6. El artículo aparece automáticamente en la web.

---

## Configuración rápida
1. **Clona el repositorio:**
   ```sh
   git clone <url-del-repo>
   cd un-canal-sobre-ia
   ```
2. **Instala las dependencias:**
   ```sh
   npm install
   ```
3. **Configura las variables de entorno:**
   - Copia el archivo de ejemplo y edítalo:
     ```sh
     cp .env.example .env
     # Edita .env y añade tus claves reales
     ```
   - Variables necesarias:
     - `TELEGRAM_BOT_TOKEN`
     - `NEXT_PUBLIC_SUPABASE_URL`
     - `SUPABASE_SERVICE_ROLE_KEY`
     - `OPENAI_API_KEY`
     - `OPENAI_ASSISTANT_ID`
     - `AUTHORIZED_TELEGRAM_USERS`

4. **Inicia el entorno de desarrollo:**
   ```sh
   npm run dev
   ```

---

## Buenas prácticas
- **Nunca subas archivos `.env` reales** ni claves privadas al repositorio.
- Usa siempre archivos `.env.example` para compartir la estructura de configuración.
- Documenta cualquier cambio relevante en `recursos/`.
- Haz commits descriptivos y sincroniza frecuentemente con GitHub.

---

## Recuperar archivos ignorados
Si clonas el repo y faltan archivos de configuración (por ejemplo `.env`), copia y renombra `.env.example` y añade tus claves manualmente. Consulta este README y la documentación en `app/recursos/` para más detalles.

---

## Documentación
- Consulta `app/recursos/DOCUMENTACION_FLUJO_TELEGRAM_OPENAI_SUPABASE.md` para una explicación detallada del flujo y componentes.

---

## Backup y checkpoint
Para crear un backup manual del proyecto:
1. Haz commit de todos los cambios:
   ```sh
   git add .
   git commit -m "Checkpoint antes de backup"
   git push
   ```
2. Haz una copia comprimida de la carpeta del proyecto:
   - En Windows: botón derecho → "Enviar a → Carpeta comprimida (zip)"
   - O usa PowerShell:
     ```sh
     Compress-Archive -Path . -DestinationPath backup_un-canal-sobre-ia.zip
     ```

---

## Contacto
Proyecto gestionado por LPA-PUESTO6. Para dudas, revisa la documentación o contacta directamente.
