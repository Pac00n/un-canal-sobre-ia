import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"

export default function PLNPage() {
  return (
    <main className="flex min-h-screen flex-col">
      <Navbar />
      <div className="pt-16">
        <section className="relative overflow-hidden py-12 md:py-16 bg-gradient-to-b from-zinc-900 to-background">
          <div className="container px-4 md:px-6 mx-auto text-center">
            <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
              Procesamiento de Lenguaje Natural
            </h1>
            <p className="max-w-[700px] text-muted-foreground mx-auto mt-4">
              Todo sobre NLP: modelos de lenguaje, análisis de sentimiento, traducción automática y más.
            </p>
          </div>
        </section>
        <section className="py-12">
          <div className="container px-4 md:px-6 mx-auto">
            <h2 className="text-2xl font-bold mb-8">Modelos y Aplicaciones</h2>
            <ul className="space-y-6">
              <li className="bg-background border rounded-lg p-6 shadow-sm">
                <h3 className="text-xl font-bold mb-2">GPT y modelos generativos</h3>
                <p className="text-muted-foreground">Cómo funcionan los modelos generativos de texto y sus aplicaciones prácticas.</p>
              </li>
              <li className="bg-background border rounded-lg p-6 shadow-sm">
                <h3 className="text-xl font-bold mb-2">Análisis de sentimiento</h3>
                <p className="text-muted-foreground">Técnicas y librerías para analizar opiniones en redes sociales.</p>
              </li>
              <li className="bg-background border rounded-lg p-6 shadow-sm">
                <h3 className="text-xl font-bold mb-2">Traducción automática</h3>
                <p className="text-muted-foreground">El estado del arte en traducción automática basada en IA.</p>
              </li>
            </ul>
          </div>
        </section>
      </div>
      <Footer />
    </main>
  )
}
