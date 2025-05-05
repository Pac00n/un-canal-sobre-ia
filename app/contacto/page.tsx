import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";

export default function ContactoPage() {
  return (
    <main className="flex min-h-screen flex-col">
      <Navbar />
      <div className="pt-16">
        <section className="relative overflow-hidden py-12 md:py-16 bg-gradient-to-b from-zinc-900 to-background">
          <div className="container px-4 md:px-6 mx-auto text-center">
            <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
              Contacto
            </h1>
            <p className="max-w-[700px] text-muted-foreground mx-auto mt-4">
              ¿Tienes alguna pregunta o sugerencia? No dudes en contactarnos.
            </p>
          </div>
        </section>
        <section className="py-12">
          <div className="container px-4 md:px-6 mx-auto">
            <div className="max-w-xl mx-auto bg-background border rounded-lg p-8 shadow">
              <form className="flex flex-col gap-4">
                <input type="text" placeholder="Nombre" className="border rounded px-4 py-2 bg-muted" />
                <input type="email" placeholder="Correo electrónico" className="border rounded px-4 py-2 bg-muted" />
                <textarea placeholder="Tu mensaje" rows={5} className="border rounded px-4 py-2 bg-muted" />
                <button type="submit" className="bg-primary text-primary-foreground rounded px-4 py-2 font-bold hover:bg-primary/90 transition">Enviar mensaje</button>
              </form>
              <div className="mt-8 text-center text-muted-foreground">
                También puedes escribirnos a <a href="mailto:contacto@uncanalsobreia.com" className="text-primary hover:underline">contacto@uncanalsobreia.com</a>
              </div>
            </div>
          </div>
        </section>
      </div>
      <Footer />
    </main>
  );
}
