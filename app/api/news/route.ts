// app/api/news/route.ts
import { addNewsItem, NewsItem } from '@/lib/news-data';
import { NextResponse } from 'next/server';

// Omitir 'id' y 'date' porque se generan automáticamente
type NewNewsItem = Omit<NewsItem, 'id' | 'created_at' | 'featured'> & {
  title: string;
  excerpt: string;
  category: string;
  imageUrl: string;
  content: string;
  featured?: boolean;
};

export async function POST(request: Request) {
  try {
    const data: NewNewsItem = await request.json();

    // Validar que los datos contengan los campos obligatorios
    if (!data.title || !data.excerpt || !data.category || !data.imageUrl || !data.content ) {
      return NextResponse.json({ message: 'Missing required fields' }, { status: 400 });
    }

    const newNewsItem = await addNewsItem(data);

    return NextResponse.json({ message: 'News item added successfully', newsItem: newNewsItem }, { status: 201 });

  } catch (error) {
    console.error('Error adding news item:', error);
    return NextResponse.json({ message: 'Error adding news item' }, { status: 500 });
  }
}