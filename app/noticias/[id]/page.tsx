// app/noticias/[id]/page.tsx
import { getNewsItemById, getAllNewsItems } from "@/lib/news-data"
import { notFound } from "next/navigation"
import Image from "next/image"
import { Badge } from "@/components/ui/badge"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

// Define params type
interface NewsPageParams {
  id: string
}

// Generate static paths for all news items (optional but good for performance)
export async function generateStaticParams() {
  const newsItems = getAllNewsItems()
  return newsItems.map((item) => ({
    id: item.id,
  }))
}

export default function NewsPage({ params }: { params: NewsPageParams }) {
  const newsItem = getNewsItemById(params.id)

  if (!newsItem) {
    notFound() // Show 404 page if news item not found
  }

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="flex-1 pt-16">
        <article className="container mx-auto max-w-4xl px-4 py-12 md:px-6 md:py-16">
          <Card className="overflow-hidden">
            <CardHeader className="p-0">
              <div className="relative h-[300px] w-full md:h-[450px]">
                <Image
                  src={newsItem.imageUrl || "/placeholder.svg"}
                  alt={newsItem.title}
                  fill
                  className="object-cover"
                  priority // Prioritize loading the main image
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
                <div className="absolute bottom-0 left-0 z-10 w-full p-6 md:p-8">
                  <Badge className="mb-2 bg-primary hover:bg-primary/90">{newsItem.category}</Badge>
                  <CardTitle className="mb-2 text-3xl font-bold leading-tight text-white drop-shadow-lg md:text-4xl lg:text-5xl">
                    {newsItem.title}
                  </CardTitle>
                  <p className="text-sm text-white/80">{newsItem.date}</p>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-6 md:p-8">
              {/* Render the full content here. Using excerpt for now. */}
              {/* Replace newsItem.excerpt with newsItem.content when available */}
              <div className="prose max-w-none dark:prose-invert">
                <p>{newsItem.content || newsItem.excerpt}</p>
                {/* Add more detailed content rendering here if needed */}
              </div>
            </CardContent>
          </Card>
        </article>
      </main>
      <Footer />
    </div>
  )
}