import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"

export default function MachineLearningPage() {
  return (
    <main className="flex min-h-screen flex-col">
      <Navbar />
      <div className="pt-16">
        <section className="relative overflow-hidden py-12 md:py-16 bg-gradient-to-b from-zinc-900 to-background">
          <div className="container px-4 md:px-6 mx-auto text-center">
            <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
              Machine Learning
            </h1>
            <p className="max-w-[700px] text-muted-foreground mx-auto mt-4">
              Explora artículos, tutoriales y recursos sobre aprendizaje automático, desde conceptos básicos hasta modelos avanzados.
            </p>
          </div>
        </section>
        <section className="py-12">
          <div className="container px-4 md:px-6 mx-auto">
            <h2 className="text-2xl font-bold mb-8">Artículos Destacados</h2>
            <ul className="space-y-6">
              <li className="bg-background border rounded-lg p-6 shadow-sm">
                <h3 className="text-xl font-bold mb-2">¿Qué es el aprendizaje supervisado?</h3>
                <p className="text-muted-foreground">Una introducción sencilla a los métodos supervisados y sus aplicaciones prácticas.</p>
              </li>
              <li className="bg-background border rounded-lg p-6 shadow-sm">
                <h3 className="text-xl font-bold mb-2">Regresión vs. Clasificación</h3>
                <p className="text-muted-foreground">Diferencias clave entre tareas de regresión y clasificación en machine learning.</p>
              </li>
              <li className="bg-background border rounded-lg p-6 shadow-sm">
                <h3 className="text-xl font-bold mb-2">Cómo empezar con scikit-learn</h3>
                <p className="text-muted-foreground">Guía paso a paso para crear tu primer modelo con scikit-learn en Python.</p>
              </li>
            </ul>
          </div>
        </section>
      </div>
      <Footer />
    </main>
  )
}
