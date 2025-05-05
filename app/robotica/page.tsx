import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"

export default function RoboticaPage() {
  return (
    <main className="flex min-h-screen flex-col">
      <Navbar />
      <div className="pt-16">
        <section className="relative overflow-hidden py-12 md:py-16 bg-gradient-to-b from-zinc-900 to-background">
          <div className="container px-4 md:px-6 mx-auto text-center">
            <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
              Robótica
            </h1>
            <p className="max-w-[700px] text-muted-foreground mx-auto mt-4">
              Explora cómo la IA está revolucionando la robótica, desde robots industriales hasta asistentes personales.
            </p>
          </div>
        </section>
        <section className="py-12">
          <div className="container px-4 md:px-6 mx-auto">
            <h2 className="text-2xl font-bold mb-8">Proyectos y Casos de Uso</h2>
            <ul className="space-y-6">
              <li className="bg-background border rounded-lg p-6 shadow-sm">
                <h3 className="text-xl font-bold mb-2">Robots colaborativos (cobots)</h3>
                <p className="text-muted-foreground">Aplicaciones de cobots en la industria 4.0 y su impacto en la productividad.</p>
              </li>
              <li className="bg-background border rounded-lg p-6 shadow-sm">
                <h3 className="text-xl font-bold mb-2">Robótica móvil autónoma</h3>
                <p className="text-muted-foreground">Cómo los robots autónomos navegan y toman decisiones en entornos complejos.</p>
              </li>
              <li className="bg-background border rounded-lg p-6 shadow-sm">
                <h3 className="text-xl font-bold mb-2">IA en prótesis inteligentes</h3>
                <p className="text-muted-foreground">El papel de la IA en el desarrollo de prótesis avanzadas y personalizadas.</p>
              </li>
            </ul>
          </div>
        </section>
      </div>
      <Footer />
    </main>
  )
}
