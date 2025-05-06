import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { createClient } from '@supabase/supabase-js';
import Image from 'next/image';
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export const revalidate = 0;

async function getAllArticles() {
  const supabaseUrl = process.env.SUPABASE_URL || '';
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
  const supabase = createClient(supabaseUrl, supabaseServiceKey);
  const { data, error } = await supabase
    .from('news')
    .select('*')
    .order('created_at', { ascending: false });
  if (error) {
    console.error('Error fetching articles:', error);
    return [];
  }
  return data || [];
}

export default async function NoticiasPage() {
  const articles = await getAllArticles();
  return (
    <main className="flex min-h-screen flex-col">
      <Navbar />
      <div className="pt-16">
        <section className="relative overflow-hidden py-12 md:py-16 bg-zinc-900 text-white">
          <div className="container px-4 md:px-6 mx-auto">
            <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl text-center mb-8">
              Noticias
            </h1>
            {articles.length > 0 ? (
              <div className="grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3 max-w-6xl mx-auto">
                {articles.map((article) => (
                  <Card key={article.id} className="overflow-hidden hover:shadow-lg transition-shadow bg-zinc-800 border-zinc-700">
                    <div className="relative h-48 w-full">
                      <Image 
                        src={article.imageUrl || '/placeholder.svg'}
                        alt={article.title}
                        fill
                        className="object-cover"
                      />
                    </div>
                    <CardContent className="p-4">
                      <Badge className="mb-2 bg-primary text-primary-foreground">{article.category}</Badge>
                      <h3 className="text-xl font-bold line-clamp-2 mb-2">{article.title}</h3>
                      <p className="text-zinc-300 text-sm line-clamp-2 mb-4">{article.excerpt}</p>
                      <div className="flex justify-between items-center">
                        <span className="text-xs text-zinc-400">
                          {new Date(article.created_at).toLocaleDateString()}
                        </span>
                        <a 
                          href={`/noticias/${article.id}`} 
                          className="text-primary hover:underline text-sm font-medium"
                        >
                          Leer más
                        </a>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <p className="text-center text-zinc-300">No hay noticias disponibles en este momento.</p>
            )}
          </div>
        </section>
      </div>
      <Footer />
    </main>
  );
}
