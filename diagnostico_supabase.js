// Diagnóstico directo de Supabase con service role key
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import { randomUUID } from 'crypto';

// Cargar variables de entorno (requiere archivo .env)
dotenv.config();

// Información de diagnóstico para verificación
console.log("=== DIAGNÓSTICO DE CONEXIÓN SUPABASE ===");

// 1. Verificar variables de entorno
const supabaseUrl = process.env.SUPABASE_URL || '';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

console.log(`URL de Supabase: ${supabaseUrl ? '✅ Configurada' : '❌ No configurada'}`);
console.log(`Service Role Key: ${supabaseServiceKey ? '✅ Configurada' : '❌ No configurada'}`);

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('\n❌ ERROR: Variables de entorno faltantes.');
  console.log('Por favor, crea un archivo .env con:');
  console.log('SUPABASE_URL=https://jicyrqayowgaepkvalno.supabase.co');
  console.log('SUPABASE_SERVICE_ROLE_KEY=tu-service-role-key');
  process.exit(1);
}

// 2. Crear cliente Supabase con service role key
console.log("\nCreando cliente Supabase con service role key...");
const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

// 3. Intentar insertar un registro de prueba
async function testInsertion() {
  try {
    console.log("\nIntentando insertar un registro de prueba en 'news'...");
    
    const testData = {
      title: `Test directo Supabase ${new Date().toISOString()}`,
      excerpt: "Prueba directa para verificar la inserción en Supabase",
      category: "test",
      imageUrl: "https://picsum.photos/800/600?test=direct",
      content: "Esto es una prueba directa con la SDK de Supabase para verificar la conexión e inserción",
      featured: false,
      test_id: randomUUID() // Para identificar fácilmente este registro
    };
    
    console.log("Datos a insertar:", testData);
    
    const { data, error } = await supabaseAdmin
      .from('news')
      .insert([testData])
      .select()
      .single();
    
    if (error) {
      console.error("\n❌ ERROR AL INSERTAR:", error);
      
      // Intentar diagnosticar el problema
      if (error.code === "42501") {
        console.error("Este es un error de permisos. La service role key no tiene permisos suficientes.");
      } else if (error.code === "42P01") {
        console.error("La tabla 'news' no existe en esta base de datos.");
      }
      
      return;
    }
    
    console.log("\n✅ INSERCIÓN EXITOSA:");
    console.log("ID generado:", data.id);
    console.log("Datos insertados:", data);
    
    // 4. Verificar que podemos recuperar el registro
    console.log("\nVerificando que podemos recuperar el registro...");
    const { data: fetchedData, error: fetchError } = await supabaseAdmin
      .from('news')
      .select('*')
      .eq('id', data.id)
      .single();
    
    if (fetchError) {
      console.error("\n❌ ERROR AL RECUPERAR:", fetchError);
      return;
    }
    
    console.log("\n✅ RECUPERACIÓN EXITOSA:");
    console.log("Datos recuperados:", fetchedData);
    
    console.log("\n=== DIAGNÓSTICO COMPLETO ===");
    console.log("Supabase está configurado correctamente y puede insertar/recuperar datos.");
    console.log("Si los endpoints API no funcionan, el problema está en el código Next.js o en las variables de entorno de Vercel.");
  } catch (error) {
    console.error("\n❌ ERROR INESPERADO:", error);
  }
}

// Ejecutar el test
testInsertion();
