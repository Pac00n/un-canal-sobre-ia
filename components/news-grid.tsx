import Image from "next/image"
import Link from "next/link"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"

import { NewsItem } from "@/lib/news-data";

interface NewsGridProps {
  title: string
  items: NewsItem[]
}

export function NewsGrid({ title, items }: NewsGridProps) {
  return (
    <section className="py-12">
      <div className="container px-4 md:px-6">
        <div className="flex flex-col gap-8">
          <h2 className="text-3xl font-bold tracking-tight">{title}</h2>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {items.map((item) => (
              <Card key={item?.id} className="overflow-hidden border-0 shadow-none card-hover">
                <CardContent className="p-0">
                  <Link href={`/noticias/${item?.id}`}>
                    <div className="flex flex-col gap-4">
                      <div className="relative aspect-video overflow-hidden rounded-lg">
                        <Image
                          src={item.imageUrl || "/placeholder.svg"}
                          alt={item.title}
                          fill
                          className="object-cover transition-transform duration-500 hover:scale-105"
                        />
                      </div>
                      <div className="flex flex-col gap-2 p-2">
                        <Badge className="w-fit bg-primary/10 text-primary hover:bg-primary/20">{item.category}</Badge>
                        <h3 className="line-clamp-2 text-xl font-bold">{item.title}</h3>
                        <p className="line-clamp-3 text-sm text-muted-foreground">{item.excerpt}</p>
                        <div className="text-xs text-muted-foreground">{item.created_at}</div>
                      </div>
                    </div>
                  </Link>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
