// Script de diagnóstico para probar la conexión con Supabase
require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

// Imprimir las variables disponibles (sin revelar contenido completo)
console.log('Variables de entorno disponibles:');
console.log('TELEGRAM_BOT_TOKEN:', process.env.TELEGRAM_BOT_TOKEN ? 'Configurado ✅' : 'No configurado ❌');
console.log('NEXT_PUBLIC_SUPABASE_URL:', process.env.NEXT_PUBLIC_SUPABASE_URL ? 'Configurado ✅' : 'No configurado ❌');
console.log('SUPABASE_URL:', process.env.SUPABASE_URL ? 'Configurado ✅' : 'No configurado ❌');
console.log('SUPABASE_SERVICE_ROLE_KEY:', process.env.SUPABASE_SERVICE_ROLE_KEY ? 'Configurado ✅' : 'No configurado ❌');
console.log('SUPABASE_ANON_KEY:', process.env.SUPABASE_ANON_KEY ? 'Configurado ✅' : 'No configurado ❌');
console.log('NEXT_PUBLIC_SUPABASE_ANON_KEY:', process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? 'Configurado ✅' : 'No configurado ❌');
console.log('OPENAI_API_KEY:', process.env.OPENAI_API_KEY ? 'Configurado ✅' : 'No configurado ❌');
console.log('OPENAI_ASSISTANT_ID:', process.env.OPENAI_ASSISTANT_ID ? 'Configurado ✅' : 'No configurado ❌');

// Configuración utilizando solo variables de entorno
const SUPABASE_URL = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

// Verificar que las variables necesarias existen
if (!SUPABASE_URL || !SUPABASE_KEY) {
    console.error('❌ ERROR: Variables de entorno SUPABASE_URL y SUPABASE_SERVICE_ROLE_KEY son requeridas.');
    console.error('Por favor, crea un archivo .env con las variables necesarias.');
    process.exit(1);
}

console.log('\nIniciando prueba con:');
console.log('URL:', SUPABASE_URL);
console.log('KEY:', SUPABASE_KEY ? SUPABASE_KEY.substring(0, 10) + '...' : 'No disponible');

// Crear cliente Supabase
try {
    console.log('\nCreando cliente Supabase...');
    const supabase = createClient(SUPABASE_URL, SUPABASE_KEY, {
        auth: { persistSession: false }
    });
    console.log('Cliente creado correctamente ✅');

    // Intentar una consulta simple
    console.log('\nConsultando tabla news...');
    supabase
        .from('news')
        .select('id', { count: 'exact', head: true })
        .then(({ count, error }) => {
            if (error) {
                console.error('❌ Error al consultar tabla news:', error.message);
                console.error('Detalles:', error);
            } else {
                console.log(`✅ Conexión exitosa! Tabla news tiene ${count || 0} registros.`);
                
                // Intentar insertar un registro de prueba
                console.log('\nInsertando registro de prueba...');
                const testData = {
                    title: 'Artículo de prueba',
                    content: 'Contenido de prueba generado ' + new Date().toISOString(),
                    excerpt: 'Resumen de prueba',
                    source_url: 'https://test-source.com',
                    imageUrl: 'https://picsum.photos/800/600',
                    category: 'Machine Learning',
                    created_at: new Date().toISOString(),
                    featured: false
                };
                
                supabase
                    .from('news')
                    .insert(testData)
                    .select()
                    .then(({ data, error }) => {
                        if (error) {
                            console.error('❌ Error al insertar:', error.message);
                            console.error('Detalles:', error);
                            
                            // Verificar nombres de columnas
                            console.log('\nVerificando estructura de la tabla...');
                            supabase
                                .from('news')
                                .select('*')
                                .limit(1)
                                .then(({ data, error }) => {
                                    if (error) {
                                        console.error('❌ Error al verificar estructura:', error.message);
                                    } else if (data && data.length > 0) {
                                        console.log('Columnas disponibles:', Object.keys(data[0]).join(', '));
                                    } else {
                                        console.log('No hay datos en la tabla para verificar estructura');
                                    }
                                });
                        } else {
                            console.log('✅ Registro insertado correctamente con ID:', data.id);
                        }
                    });
            }
        })
        .catch(err => {
            console.error('❌ Error en la consulta:', err.message);
        });

} catch (error) {
    console.error('❌ Error creando cliente Supabase:', error.message);
    console.error('Detalles:', error);
}

console.log('\nLa prueba está en ejecución. Espera a ver todos los resultados...');
