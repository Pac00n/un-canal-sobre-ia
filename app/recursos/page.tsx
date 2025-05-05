import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"

export default function RecursosPage() {
  return (
    <main className="flex min-h-screen flex-col">
      <Navbar />
      <div className="pt-16">
        {/* Hero Section */}
        <section className="relative overflow-hidden py-12 md:py-16 bg-gradient-to-b from-zinc-900 to-background">
          <div className="container px-4 md:px-6 mx-auto">
            <div className="flex flex-col gap-4 text-center">
              <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
                Recursos de <span className="gradient-text">Inteligencia Artificial</span>
              </h1>
              <p className="max-w-[700px] text-muted-foreground mx-auto">
                Herramientas, tutoriales, cursos y más para aprender y mantenerse actualizado en el campo de la IA.
              </p>
            </div>
          </div>
        </section>

        {/* Resources Categories */}
        <section className="py-12">
          <div className="container px-4 md:px-6 mx-auto">
            <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
              {[
                {
                  title: "Tutoriales",
                  description: "Guías paso a paso para aprender conceptos de IA y desarrollar tus propios proyectos.",
                  count: 42,
                  icon: "📝",
                  link: "/tutoriales"
                },
                {
                  title: "Herramientas",
                  description: "Las mejores herramientas para desarrollar, experimentar y aplicar inteligencia artificial.",
                  count: 38,
                  icon: "🛠️",
                  link: "/herramientas"
                },
                {
                  title: "Cursos",
                  description: "Cursos recomendados, tanto gratuitos como de pago, para dominar la IA.",
                  count: 25,
                  icon: "🎓",
                  link: "/cursos"
                },
                {
                  title: "Libros",
                  description: "Selección de los mejores libros sobre IA para principiantes y expertos.",
                  count: 31,
                  icon: "📚",
                  link: "/libros"
                },
                {
                  title: "Podcasts",
                  description: "Podcasts sobre IA para mantenerse al día mientras te desplazas o realizas otras actividades.",
                  count: 18,
                  icon: "🎧",
                  link: "/podcasts"
                },
                {
                  title: "Datasets",
                  description: "Conjuntos de datos para entrenar y probar tus modelos de machine learning.",
                  count: 29,
                  icon: "📊",
                  link: "/datasets"
                }
              ].map((category, index) => (
                <a 
                  key={index} 
                  href={category.link}
                  className="group relative overflow-hidden rounded-lg bg-gradient-to-br from-background to-muted border p-6 shadow hover:shadow-md transition-all"
                >
                  <div className="mb-4 text-4xl">{category.icon}</div>
                  <div className="flex items-baseline justify-between">
                    <h3 className="text-xl font-bold">{category.title}</h3>
                    <span className="text-sm text-muted-foreground">{category.count} recursos</span>
                  </div>
                  <p className="mt-2 text-muted-foreground">{category.description}</p>
                  <div className="mt-4 text-sm font-medium text-primary group-hover:underline">
                    Explorar recursos
                  </div>
                </a>
              ))}
            </div>
          </div>
        </section>

        {/* Featured Resources */}
        <section className="py-12 bg-muted/30">
          <div className="container px-4 md:px-6 mx-auto">
            <h2 className="text-2xl font-bold mb-8">Recursos Destacados</h2>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              <Card>
                <CardHeader>
                  <CardTitle>Curso: Fundamentos de Deep Learning</CardTitle>
                  <CardDescription>Por Universidad de Stanford</CardDescription>
                </CardHeader>
                <CardContent>
                  <p>Un curso completo que cubre los fundamentos matemáticos y prácticos del deep learning, con ejemplos en PyTorch.</p>
                </CardContent>
                <CardFooter className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Curso · 8 semanas</span>
                  <a href="#" className="text-sm font-medium text-primary hover:underline">Más información →</a>
                </CardFooter>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Libro: Deep Learning</CardTitle>
                  <CardDescription>Por Ian Goodfellow, Yoshua Bengio y Aaron Courville</CardDescription>
                </CardHeader>
                <CardContent>
                  <p>El libro de referencia en deep learning, que cubre desde los conceptos básicos hasta las técnicas más avanzadas.</p>
                </CardContent>
                <CardFooter className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Libro · Avanzado</span>
                  <a href="#" className="text-sm font-medium text-primary hover:underline">Más información →</a>
                </CardFooter>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Herramienta: Hugging Face Transformers</CardTitle>
                  <CardDescription>Biblioteca de código abierto para modelos NLP</CardDescription>
                </CardHeader>
                <CardContent>
                  <p>Una biblioteca que facilita el uso de modelos transformer pre-entrenados para tareas de procesamiento de lenguaje natural.</p>
                </CardContent>
                <CardFooter className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Herramienta · Python</span>
                  <a href="#" className="text-sm font-medium text-primary hover:underline">Más información →</a>
                </CardFooter>
              </Card>
            </div>
          </div>
        </section>
      </div>
      <Footer />
    </main>
  )
}
