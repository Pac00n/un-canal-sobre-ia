// lib/news-data.ts
import { createClient } from '@supabase/supabase-js';

export interface NewsItem {
  id: string;
  created_at: string; // Supabase también gestiona la fecha de creación
  title: string;
  excerpt: string;
  category: string;
  imageUrl: string;
  featured?: boolean;
  content?: string;
}

// Inicializa el cliente Supabase
const supabaseUrl = process.env.SUPABASE_URL || '';
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY || '';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// --- Funciones para interactuar con Supabase ---

export async function getAllNewsItems(): Promise<NewsItem[]> {
  const { data, error } = await supabase
    .from('news')
    .select('*')
    .order('created_at', { ascending: false }); // Ordenar por fecha de creación

  if (error) {
    console.error('Error fetching all news items:', error);
    return [];
  }

  return data || [];
}

export async function getFeaturedNewsItems(): Promise<NewsItem[]> {
  const allNewsData = await getAllNewsItems();
  const featured = allNewsData.find((item) => item.featured) || allNewsData[0];
  const others = allNewsData.filter((item) => item.id !== featured?.id).slice(0, 3);
  return featured ? [featured, ...others] : others;
}

export async function getTrendingNewsItems(): Promise<NewsItem[]> {
  const allNewsData = await getAllNewsItems();
  // Manteniendo la lógica de ejemplo, ajusta según necesites
  return allNewsData.filter((item) => ["5", "6", "7"].includes(item.id));
}

export async function getLatestNewsItems(): Promise<NewsItem[]> {
  const allNewsData = await getAllNewsItems();
   // Manteniendo la lógica de ejemplo, ajusta según necesites
  return allNewsData.filter((item) => parseInt(item.id) >= 8 && parseInt(item.id) <= 13);
}

export async function getNewsItemById(id: string): Promise<NewsItem | undefined> {
  const { data, error } = await supabase
    .from('news')
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    console.error('Error fetching news item by ID:', error);
    return undefined;
  }

  return data || undefined;
}

// --- Función para añadir noticias a Supabase ---

interface NewNewsItem { // Interfaz para los datos que se envían a la API
  title: string;
  excerpt: string;
  category: string;
  imageUrl: string;
  content: string;
  featured?: boolean;
}

export async function addNewsItem(newItemData: NewNewsItem): Promise<NewsItem | null> {
  const { data, error } = await supabase
    .from('news')
    .insert([
      {
        title: newItemData.title,
        excerpt: newItemData.excerpt,
        category: newItemData.category,
        imageUrl: newItemData.imageUrl,
        content: newItemData.content,
        featured: newItemData.featured || false,
      },
    ])
    .select() // Para que devuelva la noticia recién creada
    .single();

  if (error) {
    console.error('Error adding news item:', error);
    return null;
  }

  return data || null;
}