import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '../../../utils/supabase/server';

export async function GET(request: NextRequest) {
  console.log('[TEST-SUPABASE] Iniciando prueba de conexión a Supabase');
  
  try {
    // Inicializar cliente de Supabase
    const supabase = createClient();
    
    // Datos de prueba
    const testData = {
      title: 'Artículo de prueba',
      content: 'Este es un artículo de prueba generado automáticamente para depurar la conexión con Supabase.',
      excerpt: 'Artículo de prueba para depuración',
      source_url: 'https://test-url.com',
      image_url: 'https://picsum.photos/800/600',
      category: 'prueba',
      is_featured: false,
      created_at: new Date().toISOString()
    };
    
    console.log('[TEST-SUPABASE] Intentando insertar datos de prueba', JSON.stringify(testData));
    
    // Insertar en la tabla news
    const { data, error } = await supabase
      .from('news')
      .insert(testData)
      .select()
      .single();
    
    if (error) {
      console.error('[TEST-SUPABASE] Error insertando datos:', error);
      return NextResponse.json({ 
        success: false, 
        error: error.message,
        errorDetails: error,
        // Incluir información sobre configuración
        config: {
          hasServiceKey: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
          supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL ? 'configurado' : 'falta',
          anonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? 'configurado' : 'falta',
        }
      }, { status: 500 });
    }
    
    console.log('[TEST-SUPABASE] Inserción exitosa, ID:', data.id);
    
    return NextResponse.json({ 
      success: true, 
      data,
      message: '¡Prueba exitosa! Se insertó un artículo de prueba en Supabase.'
    });
    
  } catch (error: any) {
    console.error('[TEST-SUPABASE] Error en la prueba:', error);
    return NextResponse.json({ 
      success: false, 
      error: error.message,
      stack: error.stack
    }, { status: 500 });
  }
}
