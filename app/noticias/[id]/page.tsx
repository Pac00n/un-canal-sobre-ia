// Solución temporal para evitar errores de tipo en Next.js 15

export default function NewsPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-4">
      <div className="bg-card p-8 rounded-lg shadow-lg max-w-md w-full text-center">
        <h1 className="text-2xl font-bold mb-4">Visualizador de Noticias</h1>
        <p className="mb-6">Para ver las noticias, usa nuestro visor de API:</p>
        <a 
          href="/api/view-articles" 
          className="bg-primary text-primary-foreground hover:bg-primary/90 px-4 py-2 rounded-md"
        >
          Ver Todas las Noticias
        </a>
      </div>
      <div className="mt-8">
        <p className="text-muted-foreground text-sm">Esta es una página simplificada mientras resolvemos problemas en el visor de noticias principal.</p>
      </div>
    </div>
  )
}