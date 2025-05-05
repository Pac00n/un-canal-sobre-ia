import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"

export default function TendenciasPage() {
  return (
    <main className="flex min-h-screen flex-col">
      <Navbar />
      <div className="pt-16">
        {/* Hero Section */}
        <section className="relative overflow-hidden py-12 md:py-16 bg-gradient-to-b from-zinc-900 to-background">
          <div className="container px-4 md:px-6 mx-auto">
            <div className="flex flex-col gap-4 text-center">
              <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
                Tendencias en <span className="gradient-text">Inteligencia Artificial</span>
              </h1>
              <p className="max-w-[700px] text-muted-foreground mx-auto">
                Descubre las últimas tendencias y avances en el mundo de la inteligencia artificial, 
                analizado por expertos en el campo.
              </p>
            </div>
          </div>
        </section>

        {/* Tendencias Content */}
        <section className="py-12">
          <div className="container px-4 md:px-6 mx-auto">
            <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
              {[
                {
                  title: "Arquitecturas Transformer en Visión",
                  description: "Las arquitecturas transformer están revolucionando el campo de la visión por computadora, superando a las redes convolucionales tradicionales.",
                  category: "Deep Learning",
                  date: "4 Mayo, 2025"
                },
                {
                  title: "Aprendizaje por Refuerzo Multimodal",
                  description: "Nuevos avances en aprendizaje por refuerzo permiten a los agentes aprender de múltiples fuentes de datos simultáneamente.",
                  category: "Machine Learning",
                  date: "3 Mayo, 2025"
                },
                {
                  title: "IA Generativa para Diseño",
                  description: "Los diseñadores están adoptando herramientas de IA generativa para potenciar su creatividad y acelerar flujos de trabajo.",
                  category: "IA Aplicada",
                  date: "2 Mayo, 2025"
                },
                {
                  title: "Modelos Foundation Self-Supervised",
                  description: "La tendencia hacia modelos foundation que pueden aprender sin supervisión humana está creciendo rápidamente.",
                  category: "Modelos de IA",
                  date: "1 Mayo, 2025"
                },
                {
                  title: "Sistemas de IA Multiagente",
                  description: "Los sistemas donde múltiples agentes de IA colaboran están demostrando capacidades superiores en resolución de problemas complejos.",
                  category: "Sistemas Inteligentes",
                  date: "30 Abril, 2025"
                },
                {
                  title: "Detección de Contenido Generado por IA",
                  description: "Las herramientas para detectar contenido creado por IA están evolucionando junto con las capacidades generativas.",
                  category: "Ética en IA",
                  date: "29 Abril, 2025"
                }
              ].map((trend, index) => (
                <div key={index} className="group relative overflow-hidden rounded-lg border bg-background p-6 shadow-sm transition-shadow hover:shadow-md">
                  <div className="mb-4 flex items-center gap-2">
                    <span className="inline-block rounded-full bg-primary/10 px-2 py-1 text-xs font-medium text-primary">
                      {trend.category}
                    </span>
                    <span className="text-xs text-muted-foreground">{trend.date}</span>
                  </div>
                  <h3 className="text-xl font-bold">{trend.title}</h3>
                  <p className="mt-2 text-muted-foreground">{trend.description}</p>
                  <div className="mt-4">
                    <a href="#" className="text-sm font-medium text-primary hover:underline">
                      Leer análisis completo →
                    </a>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      </div>
      <Footer />
    </main>
  )
}
