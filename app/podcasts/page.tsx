import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";

export default function PodcastsPage() {
  return (
    <main className="flex min-h-screen flex-col">
      <Navbar />
      <div className="pt-16">
        <section className="relative overflow-hidden py-12 md:py-16 bg-gradient-to-b from-zinc-900 to-background">
          <div className="container px-4 md:px-6 mx-auto text-center">
            <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
              Podcasts sobre IA
            </h1>
            <p className="max-w-[700px] text-muted-foreground mx-auto mt-4">
              Escucha los mejores podcasts para mantenerte al día sobre inteligencia artificial, machine learning y tecnología.
            </p>
          </div>
        </section>
        <section className="py-12">
          <div className="container px-4 md:px-6 mx-auto">
            <h2 className="text-2xl font-bold mb-8">Podcasts recomendados</h2>
            <ul className="space-y-6">
              <li className="bg-background border rounded-lg p-6 shadow-sm">
                <h3 className="text-xl font-bold mb-2">Lex Fridman Podcast</h3>
                <p className="text-muted-foreground">Conversaciones profundas sobre IA, ciencia y tecnología con expertos de todo el mundo.</p>
              </li>
              <li className="bg-background border rounded-lg p-6 shadow-sm">
                <h3 className="text-xl font-bold mb-2">Data Skeptic</h3>
                <p className="text-muted-foreground">Podcast sobre ciencia de datos, machine learning y estadística aplicada.</p>
              </li>
              <li className="bg-background border rounded-lg p-6 shadow-sm">
                <h3 className="text-xl font-bold mb-2">Artificial Intelligence Podcast (by MIT)</h3>
                <p className="text-muted-foreground">Entrevistas con grandes figuras de la IA y la robótica.</p>
              </li>
            </ul>
          </div>
        </section>
      </div>
      <Footer />
    </main>
  );
}
