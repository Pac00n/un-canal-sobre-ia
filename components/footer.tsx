import Link from "next/link"
import Image from "next/image"
import { Facebook, Twitter, Instagram, Linkedin, Github } from "lucide-react"

export function Footer() {
  return (
    <footer className="border-t bg-background">
      <div className="container px-4 py-12 md:px-6">
        <div className="grid gap-8 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-5">
          <div className="flex flex-col gap-2">
            <Link href="/" className="flex items-center gap-2">
              <div className="relative h-8 w-8">
                <Image
                  src="/images/logo.png"
                  alt="Un Canal Sobre IA Logo"
                  fill
                  className="object-contain invert dark:invert-0"
                />
              </div>
              <span className="text-lg font-bold">Un Canal Sobre IA</span>
            </Link>
            <p className="text-sm text-muted-foreground">
              Tu fuente de información sobre inteligencia artificial en español.
            </p>
            <div className="mt-4 flex gap-4">
              <Link href="#" className="text-muted-foreground hover:text-foreground">
                <Twitter className="h-5 w-5" />
                <span className="sr-only">Twitter</span>
              </Link>
              <Link href="#" className="text-muted-foreground hover:text-foreground">
                <Facebook className="h-5 w-5" />
                <span className="sr-only">Facebook</span>
              </Link>
              <Link href="#" className="text-muted-foreground hover:text-foreground">
                <Instagram className="h-5 w-5" />
                <span className="sr-only">Instagram</span>
              </Link>
              <Link href="#" className="text-muted-foreground hover:text-foreground">
                <Linkedin className="h-5 w-5" />
                <span className="sr-only">LinkedIn</span>
              </Link>
              <Link href="#" className="text-muted-foreground hover:text-foreground">
                <Github className="h-5 w-5" />
                <span className="sr-only">GitHub</span>
              </Link>
            </div>
          </div>
          <div className="flex flex-col gap-2">
            <h3 className="text-lg font-medium">Navegación</h3>
            <nav className="flex flex-col gap-2">
              <Link href="/" className="text-sm text-muted-foreground hover:text-foreground">
                Inicio
              </Link>
              <Link href="/noticias" className="text-sm text-muted-foreground hover:text-foreground">
                Noticias
              </Link>
              <Link href="/tendencias" className="text-sm text-muted-foreground hover:text-foreground">
                Tendencias
              </Link>
              <Link href="/opiniones" className="text-sm text-muted-foreground hover:text-foreground">
                Opiniones
              </Link>
              <Link href="/recursos" className="text-sm text-muted-foreground hover:text-foreground">
                Recursos
              </Link>
            </nav>
          </div>
          <div className="flex flex-col gap-2">
            <h3 className="text-lg font-medium">Categorías</h3>
            <nav className="flex flex-col gap-2">
              <Link href="/categoria/machine-learning" className="text-sm text-muted-foreground hover:text-foreground">
                Machine Learning
              </Link>
              <Link href="/categoria/deep-learning" className="text-sm text-muted-foreground hover:text-foreground">
                Deep Learning
              </Link>
              <Link href="/categoria/nlp" className="text-sm text-muted-foreground hover:text-foreground">
                Procesamiento de Lenguaje Natural
              </Link>
              <Link href="/categoria/robotica" className="text-sm text-muted-foreground hover:text-foreground">
                Robótica
              </Link>
              <Link href="/categoria/etica-ia" className="text-sm text-muted-foreground hover:text-foreground">
                Ética en IA
              </Link>
            </nav>
          </div>
          <div className="flex flex-col gap-2">
            <h3 className="text-lg font-medium">Recursos</h3>
            <nav className="flex flex-col gap-2">
              <Link href="/recursos/tutoriales" className="text-sm text-muted-foreground hover:text-foreground">
                Tutoriales
              </Link>
              <Link href="/recursos/herramientas" className="text-sm text-muted-foreground hover:text-foreground">
                Herramientas
              </Link>
              <Link href="/recursos/cursos" className="text-sm text-muted-foreground hover:text-foreground">
                Cursos
              </Link>
              <Link href="/recursos/libros" className="text-sm text-muted-foreground hover:text-foreground">
                Libros
              </Link>
              <Link href="/recursos/podcasts" className="text-sm text-muted-foreground hover:text-foreground">
                Podcasts
              </Link>
            </nav>
          </div>
          <div className="flex flex-col gap-2 sm:col-span-2 md:col-span-1">
            <h3 className="text-lg font-medium">Contacto</h3>
            <p className="text-sm text-muted-foreground">
              ¿Tienes alguna pregunta o sugerencia? No dudes en contactarnos.
            </p>
            <Link href="/contacto" className="text-sm text-primary hover:underline">
              Formulario de contacto
            </Link>
            <p className="text-sm text-muted-foreground">contacto@uncanalsobreia.com</p>
          </div>
        </div>
        <div className="mt-8 border-t pt-8">
          <p className="text-center text-sm text-muted-foreground">
            © {new Date().getFullYear()} Un Canal Sobre IA. Todos los derechos reservados.
          </p>
        </div>
      </div>
    </footer>
  )
}
