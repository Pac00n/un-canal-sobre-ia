import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";

export default function LibrosPage() {
  return (
    <main className="flex min-h-screen flex-col">
      <Navbar />
      <div className="pt-16">
        <section className="relative overflow-hidden py-12 md:py-16 bg-gradient-to-b from-zinc-900 to-background">
          <div className="container px-4 md:px-6 mx-auto text-center">
            <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
              Libros recomendados de IA
            </h1>
            <p className="max-w-[700px] text-muted-foreground mx-auto mt-4">
              Una selección de los mejores libros para aprender y profundizar en inteligencia artificial.
            </p>
          </div>
        </section>
        <section className="py-12">
          <div className="container px-4 md:px-6 mx-auto">
            <h2 className="text-2xl font-bold mb-8">Libros destacados</h2>
            <ul className="space-y-6">
              <li className="bg-background border rounded-lg p-6 shadow-sm">
                <h3 className="text-xl font-bold mb-2">Deep Learning (Goodfellow, Bengio, Courville)</h3>
                <p className="text-muted-foreground">El libro de referencia para estudiantes y profesionales del deep learning.</p>
              </li>
              <li className="bg-background border rounded-lg p-6 shadow-sm">
                <h3 className="text-xl font-bold mb-2">Artificial Intelligence: A Modern Approach</h3>
                <p className="text-muted-foreground">El manual clásico de Russell y Norvig sobre IA general.</p>
              </li>
              <li className="bg-background border rounded-lg p-6 shadow-sm">
                <h3 className="text-xl font-bold mb-2">Hands-On Machine Learning with Scikit-Learn, Keras, and TensorFlow</h3>
                <p className="text-muted-foreground">Guía práctica para construir modelos de machine learning y deep learning en Python.</p>
              </li>
            </ul>
          </div>
        </section>
      </div>
      <Footer />
    </main>
  );
}
