import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";

export default function HerramientasPage() {
  return (
    <main className="flex min-h-screen flex-col">
      <Navbar />
      <div className="pt-16">
        <section className="relative overflow-hidden py-12 md:py-16 bg-gradient-to-b from-zinc-900 to-background">
          <div className="container px-4 md:px-6 mx-auto text-center">
            <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
              Herramientas de IA
            </h1>
            <p className="max-w-[700px] text-muted-foreground mx-auto mt-4">
              Descubre las mejores herramientas, librerías y plataformas para desarrollar proyectos de inteligencia artificial.
            </p>
          </div>
        </section>
        <section className="py-12">
          <div className="container px-4 md:px-6 mx-auto">
            <h2 className="text-2xl font-bold mb-8">Herramientas recomendadas</h2>
            <ul className="space-y-6">
              <li className="bg-background border rounded-lg p-6 shadow-sm">
                <h3 className="text-xl font-bold mb-2">TensorFlow</h3>
                <p className="text-muted-foreground">Framework de código abierto para machine learning y deep learning.</p>
              </li>
              <li className="bg-background border rounded-lg p-6 shadow-sm">
                <h3 className="text-xl font-bold mb-2">PyTorch</h3>
                <p className="text-muted-foreground">Biblioteca flexible y potente para investigación y producción en IA.</p>
              </li>
              <li className="bg-background border rounded-lg p-6 shadow-sm">
                <h3 className="text-xl font-bold mb-2">Hugging Face Transformers</h3>
                <p className="text-muted-foreground">Modelos preentrenados para NLP y visión por computadora.</p>
              </li>
            </ul>
          </div>
        </section>
      </div>
      <Footer />
    </main>
  );
}
