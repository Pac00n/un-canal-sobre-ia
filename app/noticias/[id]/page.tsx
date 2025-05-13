import { createClient } from "@supabase/supabase-js";
import { notFound } from "next/navigation";
import Image from "next/image";
import { Badge } from "@/components/ui/badge";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { marked } from 'marked'; // Importar marked

export const dynamicParams = true;
export const revalidate = 0;

async function getNewsItemById(id: string) {
  const supabaseUrl = process.env.SUPABASE_URL || '';
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

  if (!supabaseUrl || !supabaseServiceKey) {
    console.error('Supabase URL or Service Key is missing for getNewsItemById');
    return null;
  }
  const supabase = createClient(supabaseUrl, supabaseServiceKey);

  const { data, error } = await supabase
    .from('news')
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    console.error('Error fetching news item:', error.message);
    return null;
  }

  return data;
}

interface PageProps {
  params: { id: string }
  searchParams?: { [key: string]: string | string[] | undefined }
}

export default async function NewsPage({ params }: PageProps) {
  const { id } = params;
  const newsItem = await getNewsItemById(id);

  if (!newsItem) {
    notFound();
  }

  const formattedDate = newsItem.created_at ? new Date(newsItem.created_at).toLocaleDateString('es-ES', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }) : '';

  // VERIFICACIÓN: Log del contenido original y del procesado
  console.log("Contenido Original (newsItem.content):", newsItem.content);
  const rawContent = newsItem.content || newsItem.excerpt || '';
  let processedContent = '';
  if (rawContent) {
    try {
      processedContent = marked(rawContent) as string;
    } catch (e) {
      console.error("Error al procesar con marked:", e);
      processedContent = rawContent; // Fallback al contenido raw si marked falla
    }
  }
  console.log("Contenido Procesado por marked (processedContent):", processedContent);

  return (
    <div className="flex min-h-screen flex-col bg-zinc-950 text-zinc-100">
      <Navbar />
      <main className="flex-1 pt-16">
        <div className="container mx-auto max-w-4xl px-4 pt-8 md:px-6">
          <Link href="/noticias" passHref>
            <Button variant="outline" className="mb-6 bg-zinc-800 hover:bg-zinc-700 border-zinc-700 text-white transition-colors duration-200 ease-in-out group">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2 h-4 w-4 transition-transform duration-200 ease-in-out group-hover:-translate-x-1"><path d="m12 19-7-7 7-7"/><path d="M19 12H5"/></svg>
              Volver a Noticias
            </Button>
          </Link>
        </div>

        <article className="container mx-auto max-w-4xl px-4 pb-12 md:px-6 md:pb-16">
          <Card className="overflow-hidden rounded-xl border-zinc-800 bg-zinc-900 shadow-xl">
            <CardHeader className="p-0">
              <div className="relative h-[350px] w-full md:h-[500px]">
                <Image
                  src={newsItem?.imageUrl || "/placeholder.svg"}
                  alt={newsItem?.title || "News Image"}
                  fill
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 75vw, 50vw"
                  className="object-cover"
                  priority
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent" />
                <div className="absolute bottom-0 left-0 z-10 w-full p-6 md:p-8">
                  <Badge className="mb-3 bg-primary text-primary-foreground hover:bg-primary/80 transition-colors duration-200 text-sm px-3 py-1">{newsItem?.category}</Badge>
                  <CardTitle className="mb-2 text-3xl font-bold leading-tight text-white drop-shadow-lg md:text-4xl lg:text-5xl">
                    {newsItem?.title}
                  </CardTitle>
                  <p className="text-sm text-zinc-300">{formattedDate}</p>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-6 md:p-8 lg:p-10">
              <div
                className="prose prose-lg max-w-none dark:prose-invert prose-p:text-zinc-200 prose-headings:text-zinc-100 prose-strong:text-zinc-100 prose-a:text-primary hover:prose-a:text-primary/80"
                dangerouslySetInnerHTML={{ __html: processedContent }}
              />

              {newsItem?.source_url && (
                <div className="mt-10 pt-6 border-t border-zinc-800">
                  <p className="mb-3 text-base font-semibold text-zinc-300">Fuente original:</p>
                  <Link
                    href={newsItem.source_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-md bg-primary text-primary-foreground hover:bg-primary/90 transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 text-sm"
                  >
                    <span>Ver fuente original</span>
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path><polyline points="15 3 21 3 21 9"></polyline><line x1="10" y1="14" x2="21" y2="3"></line></svg>
                  </Link>
                </div>
              )}
            </CardContent>
          </Card>
        </article>
      </main>
      <Footer />
    </div>
  )
}
