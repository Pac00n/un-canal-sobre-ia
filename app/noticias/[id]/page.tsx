import { createClient } from "@supabase/supabase-js"
import { notFound } from "next/navigation"
import Image from "next/image"
import { Badge } from "@/components/ui/badge"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import Link from "next/link"

// Allow generating pages on demand for IDs not known at build time
export const dynamicParams = true;

// Force revalidation on each request
export const revalidate = 0;

async function getNewsItemById(id: string) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
  const supabase = createClient(supabaseUrl, supabaseServiceKey);
  
  const { data, error } = await supabase
    .from('news')
    .select('*')
    .eq('id', id)
    .single();
  
  if (error) {
    console.error('Error fetching news item:', error);
    return null;
  }
  
  return data;
}

type Props = {
  params: {
    id: string
  }
}

export default async function NewsPage(props: Props) {
  const { id } = props.params;
  const newsItem = await getNewsItemById(id);
  
  if (!newsItem) {
    notFound(); // Show 404 page if news item not found
  }

  const formattedDate = newsItem.created_at ? new Date(newsItem.created_at).toLocaleDateString('es-ES', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }) : '';

  return (
    <div className="flex min-h-screen flex-col dark:bg-gray-950">
      <Navbar />
      <main className="flex-1 pt-16">
        <article className="container mx-auto max-w-4xl px-4 py-12 md:px-6 md:py-16">
          <Card className="overflow-hidden border-none dark:bg-gray-900">
            <CardHeader className="p-0">
              <div className="relative h-[300px] w-full md:h-[450px]">
                <Image
                  src={newsItem?.imageUrl || "/placeholder.svg"}
                  alt={newsItem?.title || "News Image"}
                  fill
                  className="object-cover"
                  priority // Prioritize loading the main image
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
                <div className="absolute bottom-0 left-0 z-10 w-full p-6 md:p-8">
                  <Badge className="mb-2 bg-primary hover:bg-primary/90">{newsItem?.category}</Badge>
                  <CardTitle className="mb-2 text-3xl font-bold leading-tight text-white drop-shadow-lg md:text-4xl lg:text-5xl">
                    {newsItem?.title}
                  </CardTitle>
                  <p className="text-sm text-white/80">{formattedDate}</p>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-6 md:p-8 dark:text-gray-100">
              <div className="prose max-w-none dark:prose-invert">
                <p className="whitespace-pre-line">{newsItem?.content || newsItem?.excerpt}</p>
                
                {newsItem?.source_url && (
                  <div className="mt-12 rounded-lg border border-gray-200 bg-gray-50 p-4 shadow-sm transition-all hover:shadow-md dark:border-gray-700 dark:bg-gray-800">
                    <p className="mb-2 text-sm font-semibold text-gray-700 dark:text-gray-300">Fuente original:</p>
                    <Link 
                      href={newsItem.source_url} 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      className="inline-flex items-center gap-1 text-primary hover:underline"
                    >
                      <span>{newsItem.source_url}</span>
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4">
                        <path d="M7 17L17 7"/>
                        <path d="M7 7h10v10"/>
                      </svg>
                    </Link>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </article>
      </main>
      <Footer />
    </div>
  )
}