import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"

export default function EticaIAPage() {
  return (
    <main className="flex min-h-screen flex-col">
      <Navbar />
      <div className="pt-16">
        <section className="relative overflow-hidden py-12 md:py-16 bg-gradient-to-b from-zinc-900 to-background">
          <div className="container px-4 md:px-6 mx-auto text-center">
            <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
              Ética en IA
            </h1>
            <p className="max-w-[700px] text-muted-foreground mx-auto mt-4">
              Reflexiones y debates sobre los desafíos éticos que plantea la inteligencia artificial en la sociedad actual.
            </p>
          </div>
        </section>
        <section className="py-12">
          <div className="container px-4 md:px-6 mx-auto">
            <h2 className="text-2xl font-bold mb-8">Temas Éticos</h2>
            <ul className="space-y-6">
              <li className="bg-background border rounded-lg p-6 shadow-sm">
                <h3 className="text-xl font-bold mb-2">Sesgo algorítmico</h3>
                <p className="text-muted-foreground">Cómo identificar y mitigar el sesgo en los sistemas de IA.</p>
              </li>
              <li className="bg-background border rounded-lg p-6 shadow-sm">
                <h3 className="text-xl font-bold mb-2">Transparencia y explicabilidad</h3>
                <p className="text-muted-foreground">La importancia de comprender las decisiones tomadas por modelos complejos.</p>
              </li>
              <li className="bg-background border rounded-lg p-6 shadow-sm">
                <h3 className="text-xl font-bold mb-2">Impacto social y laboral</h3>
                <p className="text-muted-foreground">El efecto de la automatización en el empleo y la economía.</p>
              </li>
            </ul>
          </div>
        </section>
      </div>
      <Footer />
    </main>
  )
}
