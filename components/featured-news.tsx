import Image from "next/image";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { NewsItem } from "@/lib/news-data";

interface FeaturedNewsProps {
  items: NewsItem[];
}

export function FeaturedNews({ items }: FeaturedNewsProps) {
  // Get the first featured item
  const featuredItem = items.find((item) => item.featured) || items[0];
  // Get the rest of the items (excluding the featured one)
  const otherItems = items.filter((item) => item.id !== featuredItem.id).slice(0, 3);

  return (
    <section className="py-12">
      <div className="container px-4 md:px-6">
        <div className="flex flex-col gap-12">
          <div className="grid gap-6 lg:grid-cols-2">
            <Card className="overflow-hidden border-0 bg-background shadow-none card-hover h-full">
              <CardContent className="p-0 h-full">
                <Link href={`/noticias/${featuredItem.id}`} className="block h-full">
                  <div className="relative w-full overflow-hidden rounded-lg flex items-end h-full">
                    <Image
                      src={featuredItem.imageUrl || "/placeholder.svg"}
                      alt={featuredItem.title}
                      fill
                      className="object-cover transition-transform duration-500 hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/60 to-black/20 z-10" />
                    <div className="relative z-20 w-full p-4 md:p-8 bg-black/40 backdrop-blur-sm rounded-b-lg">
                      <Badge className="mb-2 bg-primary hover:bg-primary/90">{featuredItem.category}</Badge>
                      <h2 className="mb-2 text-2xl font-bold leading-tight text-white drop-shadow-lg md:text-3xl lg:text-4xl">
                        {featuredItem.title}
                      </h2>
                      <p className="mb-4 max-w-2xl text-base text-white/90 md:text-lg">{featuredItem.excerpt}</p>
                      <div className="text-xs text-white/70">{featuredItem.created_at}</div>
                    </div>
                  </div>
                </Link>
              </CardContent>
            </Card>
            <div className="grid gap-6">
              <h3 className="text-2xl font-bold tracking-tight">Últimas Noticias</h3>
              <div className="grid gap-6">
                {otherItems.map((item) => (
                  <Card key={item.id} className="overflow-hidden border-0 shadow-none card-hover">
                    <CardContent className="p-0">
                      <Link href={`/noticias/${item.id}`}>
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
                            <div className="mt-2 text-xs text-muted-foreground">{item.created_at}</div>
                          </div>
                        </div>
                      </Link>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
