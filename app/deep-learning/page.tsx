import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"

export default function DeepLearningPage() {
  return (
    <main className="flex min-h-screen flex-col">
      <Navbar />
      <div className="pt-16">
        <section className="relative overflow-hidden py-12 md:py-16 bg-gradient-to-b from-zinc-900 to-background">
          <div className="container px-4 md:px-6 mx-auto text-center">
            <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
              Deep Learning
            </h1>
            <p className="max-w-[700px] text-muted-foreground mx-auto mt-4">
              Descubre el mundo de las redes neuronales profundas, arquitecturas modernas y casos de uso reales.
            </p>
          </div>
        </section>
        <section className="py-12">
          <div className="container px-4 md:px-6 mx-auto">
            <h2 className="text-2xl font-bold mb-8">Recursos Populares</h2>
            <ul className="space-y-6">
              <li className="bg-background border rounded-lg p-6 shadow-sm">
                <h3 className="text-xl font-bold mb-2">Redes Convolucionales (CNN)</h3>
                <p className="text-muted-foreground">Cómo funcionan y para qué sirven las CNN en visión por computadora.</p>
              </li>
              <li className="bg-background border rounded-lg p-6 shadow-sm">
                <h3 className="text-xl font-bold mb-2">Redes Recurrentes (RNN)</h3>
                <p className="text-muted-foreground">Aplicaciones de las RNN en procesamiento de secuencias y texto.</p>
              </li>
              <li className="bg-background border rounded-lg p-6 shadow-sm">
                <h3 className="text-xl font-bold mb-2">Transformers y atención</h3>
                <p className="text-muted-foreground">La revolución de los transformers en NLP y visión.</p>
              </li>
            </ul>
          </div>
        </section>
      </div>
      <Footer />
    </main>
  )
}
