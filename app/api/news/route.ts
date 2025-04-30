import { NextResponse, NextRequest } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { addNewsItem } from '@/lib/news-data';

// Inicializar client con service role (bypass RLS)
const supabaseUrl = process.env.SUPABASE_URL || '';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

// Define OPTIONS handler to support preflight requests
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization, API-KEY'
    },
  });
}

// También permitimos GET temporalmente para depuración y compatibilidad con n8n
export async function GET(req: NextRequest) {
  // Redirigir a la función POST para manejar la solicitud
  return POST(req);
}

export async function POST(req: NextRequest) {
  try {
    console.log('Received request to /api/news with method:', req.method);
    console.log('Headers:', Object.fromEntries(req.headers.entries()));
    
    // Intentar obtener el cuerpo de diferentes maneras
    let body;
    try {
      // Intentar como JSON primero
      body = await req.json();
    } catch (e) {
      console.log('No es JSON, intentando como FormData');
      try {
        // Intentar como FormData
        const formData = await req.formData();
        body = Object.fromEntries(formData);
      } catch (e2) {
        console.log('No es FormData, intentando como texto');
        try {
          // Intentar como texto
          const text = await req.text();
          try {
            body = JSON.parse(text);
          } catch (e3) {
            console.log('No se pudo parsear el texto como JSON');
            body = { text };
          }
        } catch (e4) {
          console.log('No se pudo obtener el cuerpo de ninguna forma');
          body = {};
        }
      }
    }
    
    console.log('Request body type:', typeof body);
    console.log('Request body:', body);
    
    const { title, excerpt, category, imageUrl, content, featured } = body || {};

    if (!title || !excerpt || !category || !imageUrl || !content) {
      return NextResponse.json({ 
        message: 'Faltan campos requeridos', 
        receivedData: body 
      }, { status: 400 });
    }

    // Insertar directamente con supabaseAdmin para evitar RLS
    const { data: newNewsItem, error } = await supabaseAdmin
      .from('news')
      .insert([
        {
          title,
          excerpt,
          category,
          imageUrl,
          content,
          featured: featured ?? false,
        },
      ])
      .select()
      .single();
    
    if (error) {
      console.error('Error inserting in Supabase:', error);
      return NextResponse.json({ 
        message: 'Error adding news item to database', 
        error: error,
        body: body
      }, { 
        status: 500,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Content-Type': 'application/json'
        }
      });
    }

    console.log('News item inserted successfully with ID:', newNewsItem?.id);
    return NextResponse.json({ 
      message: 'News item added successfully', 
      newsItem: newNewsItem 
    }, { 
      status: 201,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Content-Type': 'application/json'
      }
    });

  } catch (error) {
    console.error('Error in /api/news:', error);
    return NextResponse.json({ 
      message: 'Error adding news item', 
      error: String(error),
      stack: error instanceof Error ? error.stack : undefined 
    }, { 
      status: 500,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Content-Type': 'application/json'
      }
    });
  }
}