import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import Image from "next/image"

export default function OpinionesPage() {
  return (
    <main className="flex min-h-screen flex-col">
      <Navbar />
      <div className="pt-16">
        {/* Hero Section */}
        <section className="relative overflow-hidden py-12 md:py-16 bg-gradient-to-b from-zinc-900 to-background">
          <div className="container px-4 md:px-6 mx-auto">
            <div className="flex flex-col gap-4 text-center">
              <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
                Opiniones sobre <span className="gradient-text">IA</span>
              </h1>
              <p className="max-w-[700px] text-muted-foreground mx-auto">
                Análisis críticos y perspectivas de expertos sobre el impacto y desarrollo de la inteligencia artificial en nuestra sociedad.
              </p>
            </div>
          </div>
        </section>

        {/* Featured Opinion */}
        <section className="py-12 bg-muted/30">
          <div className="container px-4 md:px-6 mx-auto">
            <div className="rounded-lg overflow-hidden bg-background shadow-lg">
              <div className="grid md:grid-cols-2">
                <div className="relative aspect-video md:aspect-auto md:h-full">
                  <Image 
                    src="https://source.unsplash.com/random/800x600/?ai,robot" 
                    alt="IA y sociedad" 
                    fill 
                    className="object-cover"
                  />
                </div>
                <div className="p-6 md:p-8 flex flex-col">
                  <span className="text-primary font-medium mb-2">Opinión destacada</span>
                  <h2 className="text-2xl font-bold mb-4">El futuro de la regulación de IA en Europa</h2>
                  <p className="text-muted-foreground mb-6">
                    La nueva regulación europea sobre inteligencia artificial marca un precedente mundial, pero ¿logra el equilibrio entre innovación y protección? Analizamos sus implicaciones para desarrolladores y empresas.
                  </p>
                  <div className="flex items-center mt-auto">
                    <div className="relative h-10 w-10 rounded-full overflow-hidden mr-4">
                      <Image 
                        src="https://source.unsplash.com/random/100x100/?portrait" 
                        alt="Ana Martínez" 
                        fill 
                        className="object-cover"
                      />
                    </div>
                    <div>
                      <p className="font-medium">Ana Martínez</p>
                      <p className="text-xs text-muted-foreground">Especialista en legislación tecnológica</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* More Opinions */}
        <section className="py-12">
          <div className="container px-4 md:px-6 mx-auto">
            <h2 className="text-2xl font-bold mb-8">Más Opiniones</h2>
            <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
              {[
                {
                  title: "La falacia de la IA consciente",
                  excerpt: "Las afirmaciones sobre IA consciente tienen más de sensacionalismo que de ciencia. Un análisis crítico sobre la diferencia entre simulación e inteligencia real.",
                  author: "Dr. Carlos Vega",
                  role: "Filósofo de la computación",
                  date: "3 Mayo, 2025"
                },
                {
                  title: "Democratizando el acceso a modelos de IA",
                  excerpt: "¿Deberían ser los modelos más avanzados accesibles para todos? Las implicaciones de los modelos de código abierto frente a los propietarios.",
                  author: "Sofía Hernández",
                  role: "Investigadora en IA ética",
                  date: "1 Mayo, 2025"
                },
                {
                  title: "El arte generativo y el futuro de la creatividad humana",
                  excerpt: "El auge de herramientas de generación de imágenes plantea preguntas profundas sobre la naturaleza de la creatividad y el valor del trabajo artístico.",
                  author: "Miguel Ángel Torres",
                  role: "Artista digital",
                  date: "29 Abril, 2025"
                }
              ].map((opinion, index) => (
                <div key={index} className="border rounded-lg overflow-hidden flex flex-col">
                  <div className="p-6 flex flex-col flex-grow">
                    <h3 className="text-xl font-bold mb-2">{opinion.title}</h3>
                    <p className="text-muted-foreground flex-grow mb-4">{opinion.excerpt}</p>
                    <div className="flex items-center mt-auto">
                      <div>
                        <p className="font-medium">{opinion.author}</p>
                        <p className="text-xs text-muted-foreground">{opinion.role}</p>
                        <p className="text-xs text-muted-foreground mt-1">{opinion.date}</p>
                      </div>
                    </div>
                  </div>
                  <div className="p-4 bg-muted/30 flex justify-end">
                    <a href="#" className="text-sm font-medium text-primary hover:underline">
                      Leer opinión completa →
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
