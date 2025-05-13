import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { createClient } from '@supabase/supabase-js';
import Image from 'next/image';
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button"; // Importación añadida
import Link from "next/link"; // Importación añadida

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
    <main className="flex min-h-screen flex-col bg-zinc-950"> {/* Fondo general oscuro */}
      <Navbar />
      <div className="pt-16 flex-1"> {/* flex-1 para ocupar espacio disponible */}
        <section className="relative overflow-hidden py-16 md:py-20 text-white">
          <div className="container px-4 md:px-6 mx-auto">
            <h1 className="text-4xl font-bold tracking-tighter sm:text-5xl md:text-6xl text-center mb-4">
              Noticias
            </h1>
            <div className="text-center mb-10"> {/* Aumentado margen inferior para el botón */}
              <Link href="/" passHref>
                <Button variant="outline" className="bg-zinc-800 hover:bg-zinc-700 border-zinc-700 text-white transition-colors duration-200 ease-in-out group">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2 h-4 w-4 transition-transform duration-200 ease-in-out group-hover:-translate-x-1"><path d="m12 19-7-7 7-7"/><path d="M19 12H5"/></svg>
                  Volver a Inicio
                </Button>
              </Link>
            </div>
            {articles.length > 0 ? (
              <div className="grid gap-6 sm:gap-8 grid-cols-1 md:grid-cols-2 lg:grid-cols-3 max-w-6xl mx-auto">
                {articles.map((article) => (
                  <Card key={article.id} className="overflow-hidden bg-zinc-900 border-zinc-800 rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 ease-in-out hover:-translate-y-1 flex flex-col"> {/* Mejoras en Card */}
                    <div className="relative h-52 w-full"> {/* Ligeramente más alta la imagen */}
                      <Image 
                        src={article.imageUrl || '/placeholder.svg'}
                        alt={article.title}
                        fill
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                        className="object-cover"
                      />
                       <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent"></div> {/* Gradiente sutil */}
                    </div>
                    <CardContent className="p-5 flex flex-col flex-1"> {/* Ajuste de padding y flex */}
                      <div className="mb-3"> {/* Contenedor para badge y fecha */}
                        <Badge className="mb-2 bg-primary text-primary-foreground hover:bg-primary/80 transition-colors duration-200">{article.category}</Badge>
                         <p className="text-xs text-zinc-400 mt-1"> 
                          {new Date(article.created_at).toLocaleDateString('es-ES', { year: 'numeric', month: 'long', day: 'numeric' })}
                        </p>
                      </div>
                      <h3 className="text-lg font-semibold line-clamp-3 mb-2 text-zinc-100 flex-1">{article.title}</h3> {/* Título ligeramente más pequeño, flex-1 */}
                      <p className="text-zinc-300 text-sm line-clamp-3 mb-4 flex-1">{article.excerpt}</p> {/* flex-1 para empujar botón abajo */}
                      <div className="mt-auto pt-3 border-t border-zinc-800"> {/* Separador y mt-auto para empujar al final */}
                        <Link 
                          href={`/noticias/${article.id}`} 
                          className="inline-flex items-center justify-center w-full px-4 py-2 rounded-md text-sm font-medium bg-primary text-primary-foreground hover:bg-primary/90 transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                        >
                          Leer más
                          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="ml-2 h-4 w-4"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
                        </Link>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="text-center py-10">
                 <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                  <path vectorEffect="non-scaling-stroke" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <h3 className="mt-2 text-sm font-medium text-gray-300">No hay noticias</h3>
                <p className="mt-1 text-sm text-gray-500">No hay noticias disponibles en este momento.</p>
              </div>
            )}
          </div>
        </section>
      </div>
      <Footer />
    </main>
  );
}
