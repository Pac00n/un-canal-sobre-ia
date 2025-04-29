import { Navbar } from "@/components/navbar"
import { FeaturedNews } from "@/components/featured-news"
import { NewsGrid } from "@/components/news-grid"
import { Newsletter } from "@/components/newsletter"
import { Footer } from "@/components/footer"
import { HeroNewsletter } from "@/components/hero-newsletter"
import { getFeaturedNewsItems, getTrendingNewsItems, getLatestNewsItems } from "@/lib/news-data"

export default function Home() {
  // Fetch data for the homepage sections
  const featuredNewsItems = getFeaturedNewsItems()
  const trendingNewsItems = getTrendingNewsItems()
  const latestNewsItems = getLatestNewsItems()

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

              {/* Newsletter subscription form in hero section */}
              <HeroNewsletter />
            </div>
          </div>
        </section>

        {/* Featured News */}
        <FeaturedNews items={featuredNewsItems} />

        {/* Trending News */}
        <NewsGrid title="Tendencias en IA" items={trendingNewsItems} />

        {/* Newsletter */}
        <Newsletter />

        {/* Latest News */}
        <NewsGrid title="Últimas Noticias" items={latestNewsItems} />
      </div>
      <Footer />
    </main>
  )
}
