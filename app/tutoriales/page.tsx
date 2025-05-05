import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";

export default function TutorialesPage() {
  return (
    <main className="flex min-h-screen flex-col">
      <Navbar />
      <div className="pt-16">
        <section className="relative overflow-hidden py-12 md:py-16 bg-gradient-to-b from-zinc-900 to-background">
          <div className="container px-4 md:px-6 mx-auto text-center">
            <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
              Tutoriales de Inteligencia Artificial
            </h1>
            <p className="max-w-[700px] text-muted-foreground mx-auto mt-4">
              Guías prácticas paso a paso para aprender IA, desde lo más básico hasta proyectos avanzados.
            </p>
          </div>
        </section>
        <section className="py-12">
          <div className="container px-4 md:px-6 mx-auto">
            <h2 className="text-2xl font-bold mb-8">Tutoriales destacados</h2>
            <ul className="space-y-6">
              <li className="bg-background border rounded-lg p-6 shadow-sm">
                <h3 className="text-xl font-bold mb-2">Primer modelo de clasificación con scikit-learn</h3>
                <p className="text-muted-foreground">Aprende a construir y evaluar un modelo de clasificación básico en Python.</p>
              </li>
              <li className="bg-background border rounded-lg p-6 shadow-sm">
                <h3 className="text-xl font-bold mb-2">Red neuronal simple con TensorFlow</h3>
                <p className="text-muted-foreground">Tutorial paso a paso para crear una red neuronal desde cero.</p>
              </li>
              <li className="bg-background border rounded-lg p-6 shadow-sm">
                <h3 className="text-xl font-bold mb-2">Procesamiento de texto con spaCy</h3>
                <p className="text-muted-foreground">Cómo usar spaCy para analizar y extraer información de textos en español.</p>
              </li>
            </ul>
          </div>
        </section>
      </div>
      <Footer />
    </main>
  );
}
