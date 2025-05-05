import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";

export default function CursosPage() {
  return (
    <main className="flex min-h-screen flex-col">
      <Navbar />
      <div className="pt-16">
        <section className="relative overflow-hidden py-12 md:py-16 bg-gradient-to-b from-zinc-900 to-background">
          <div className="container px-4 md:px-6 mx-auto text-center">
            <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
              Cursos de Inteligencia Artificial
            </h1>
            <p className="max-w-[700px] text-muted-foreground mx-auto mt-4">
              Formación recomendada en IA, desde cursos introductorios hasta especializaciones avanzadas.
            </p>
          </div>
        </section>
        <section className="py-12">
          <div className="container px-4 md:px-6 mx-auto">
            <h2 className="text-2xl font-bold mb-8">Cursos destacados</h2>
            <ul className="space-y-6">
              <li className="bg-background border rounded-lg p-6 shadow-sm">
                <h3 className="text-xl font-bold mb-2">Machine Learning by Stanford (Coursera)</h3>
                <p className="text-muted-foreground">El curso clásico de Andrew Ng sobre los fundamentos del aprendizaje automático.</p>
              </li>
              <li className="bg-background border rounded-lg p-6 shadow-sm">
                <h3 className="text-xl font-bold mb-2">Deep Learning Specialization</h3>
                <p className="text-muted-foreground">Especialización avanzada en deep learning, redes neuronales y NLP.</p>
              </li>
              <li className="bg-background border rounded-lg p-6 shadow-sm">
                <h3 className="text-xl font-bold mb-2">IA para Todos (edX)</h3>
                <p className="text-muted-foreground">Curso introductorio sobre el impacto de la IA en la sociedad.</p>
              </li>
            </ul>
          </div>
        </section>
      </div>
      <Footer />
    </main>
  );
}
