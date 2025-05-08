# Seguridad del Proyecto

## Claves y Tokens

**⚠️ IMPORTANTE: Nunca subas claves API o tokens a GitHub ⚠️**

### Manejo Correcto de Secretos

1. **Claves en archivos `.env`**
   - Todos los archivos `.env` están incluidos en `.gitignore`
   - Nunca coloques claves directamente en el código de la aplicación
   - Usa `process.env.NOMBRE_VARIABLE` para acceder a las claves

2. **Plantilla de ejemplo**
   - Usa archivos `.env.example` para mostrar qué variables se necesitan
   - En estos archivos de ejemplo, usa valores como `tu_clave_aqui` en lugar de claves reales

3. **En producción**
   - Almacena las claves como variables de entorno en Vercel/Netlify
   - Revisa periódicamente las claves y rota las credenciales

### Si Se Expone una Clave

Si una clave se expone accidentalmente:

1. **Regenera inmediatamente** la clave o token en el servicio correspondiente
2. **Actualiza** la nueva clave en todos los entornos donde se use
3. **Considera usar** herramientas como `git-filter-branch` o BFG Repo-Cleaner para eliminar datos sensibles del historial (consulta la [documentación de GitHub](https://docs.github.com/en/authentication/keeping-your-account-and-data-secure/removing-sensitive-data-from-a-repository))

## Buenas Prácticas de Seguridad

1. **Principio del menor privilegio**:
   - Las claves de API deben tener solo los permisos mínimos necesarios
   - Para Supabase, considera usar las claves anónimas en lugar de service_role cuando sea posible

2. **Monitorización**:
   - Activa las alertas de seguridad en GitHub
   - Revisa periódicamente los logs de acceso en tus servicios

3. **Actualiza dependencias**:
   - Mantén todas las dependencias actualizadas
   - Usa `npm audit` regularmente para detectar vulnerabilidades

## Recursos

- [GitHub: Eliminar datos sensibles](https://docs.github.com/es/authentication/keeping-your-account-and-data-secure/removing-sensitive-data-from-a-repository)
- [Vercel: Variables de Entorno](https://vercel.com/docs/environment-variables)
- [Supabase: Manejo de Seguridad](https://supabase.com/docs/guides/platform/security)
- [Telegram: Seguridad de Bots](https://core.telegram.org/bots/security)
