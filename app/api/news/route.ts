import { NextResponse, NextRequest } from 'next/server';
import { addNewsItem } from '@/lib/news-data';

// Define OPTIONS handler to support preflight requests
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization'
    },
  });
}

export async function POST(req: NextRequest) {
  try {
    console.log('Received POST request to /api/news');
    
    // Get content type to handle different formats
    const contentType = req.headers.get('content-type') || '';
    
    let body;
    if (contentType.includes('application/json')) {
      body = await req.json();
    } else {
      // Handle form data or other content types if needed
      const formData = await req.formData();
      body = Object.fromEntries(formData);
    }
    
    const { title, excerpt, category, imageUrl, content, featured } = body;
    console.log('Request body:', { title, excerpt, category, imageUrl, content, featured });

    if (!title || !excerpt || !category || !imageUrl || !content) {
      return NextResponse.json({ message: 'Faltan campos requeridos' }, { status: 400 });
    }

    const newNewsItem = await addNewsItem({
      title,
      excerpt,
      category,
      imageUrl,
      content,
      featured: featured ?? false,
    });

    return NextResponse.json({ message: 'News item added successfully', newsItem: newNewsItem }, { status: 201 });

  } catch (error) {
    console.error('Error in /api/news:', error);
    return NextResponse.json({ message: 'Error adding news item', error: String(error) }, { status: 500 });
  }
}