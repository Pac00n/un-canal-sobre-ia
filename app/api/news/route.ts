import { NextResponse, NextRequest } from 'next/server';
import { addNewsItem } from '@/lib/news-data';

export async function POST(req: NextRequest) {
  try {
    console.log('Received request to /api/news');
    const { title, excerpt, category, imageUrl, content, featured } = await req.json();
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
    return NextResponse.json({ message: 'Error adding news item' }, { status: 500 });
  }
}