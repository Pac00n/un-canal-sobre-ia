import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { createClient } from '@supabase/supabase-js'
import Image from 'next/image'
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

// Force revalidation on each request
export const revalidate = 0;

// Función para obtener las últimas noticias
async function getLatestArticles() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL || '';
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
  
  if (!supabaseUrl) {
    console.error('Error: NEXT_PUBLIC_SUPABASE_URL or SUPABASE_URL is required');
    return [];
  }
  
  const supabase = createClient(supabaseUrl, supabaseServiceKey);
  
  const { data, error } = await supabase
    .from('news')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(2);
  
  if (error) {
    console.error('Error fetching latest articles:', error);
    return [];
  }
  
  return data || [];
}

export default async function Home() {
  // Obtener las dos últimas noticias
  const latestArticles = await getLatestArticles();

  return (
    <main className="flex min-h-screen flex-col">
      <Navbar />
      <div className="pt-16">
        {/* Hero Section */}
        <section className="relative overflow-hidden py-20 md:py-32">
          <div className="absolute inset-0 gradient-bg opacity-50" />
          <div className="container relative px-4 md:px-6">
            <div className="flex flex-col items-center gap-4 text-center">
              <div className="relative h-28 w-28 animate-float">
                <div className="absolute inset-0 animate-pulse-slow">
                  <div className="h-full w-full rounded-full bg-primary/20 blur-xl" />
                </div>
                <div className="relative h-full w-full">
                  <div className="logo-spin h-full w-full">
                    <img
                      src="/images/logo.png"
                      alt="Un Canal Sobre IA Logo"
                      className="h-full w-full object-contain invert dark:invert-0"
                    />
                  </div>
                </div>
              </div>
              <h1 className="text-4xl font-bold tracking-tighter sm:text-5xl md:text-6xl lg:text-7xl">
                Un Canal Sobre <span className="gradient-text">IA</span>
              </h1>
              <p className="max-w-[700px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                Tu fuente de información sobre inteligencia artificial en español. Noticias, tendencias, opiniones y
                recursos actualizados diariamente.
              </p>

              <div className="mt-8">
                <a 
                  href="/api/view-articles" 
                  className="bg-primary text-primary-foreground hover:bg-primary/90 px-6 py-3 rounded-md font-medium"
                >
                  Ver Todas las Noticias
                </a>
              </div>
            </div>
          </div>
        </section>
        
        {/* Últimas Noticias */}
        <section className="py-16 bg-zinc-900 text-white">
          <div className="container px-4 md:px-6">
            <h2 className="text-3xl font-bold mb-8 text-center">Noticias Recientes</h2>
            
            {latestArticles.length > 0 ? (
              <div className="grid gap-6 grid-cols-1 md:grid-cols-2 max-w-4xl mx-auto">
                {latestArticles.map((article) => (
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
                          href={`/api/view-articles?id=${article.id}`} 
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
  )
}
