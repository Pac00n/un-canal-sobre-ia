"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Sparkles, ArrowRight } from "lucide-react"

export function Newsletter() {
  const [email, setEmail] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const [error, setError] = useState("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setError("")

    // Simulate API call
    try {
      await new Promise((resolve) => setTimeout(resolve, 1500))
      setIsSuccess(true)
      setEmail("")
    } catch (err) {
      setError("Hubo un error al suscribirte. Por favor, inténtalo de nuevo.")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <section className="py-16 bg-secondary">
      <div className="container px-4 md:px-6">
        <div className="flex flex-col items-center justify-center space-y-6 text-center">
          <div className="space-y-3 max-w-[700px]">
            <div className="inline-block rounded-full bg-primary/10 p-2 text-primary">
              <Sparkles className="h-6 w-6 animate-pulse-slow" />
            </div>
            <h2 className="text-3xl font-bold tracking-tight md:text-4xl">
              Mantente al día con las últimas noticias de IA
            </h2>
            <p className="text-muted-foreground md:text-lg">
              Suscríbete a nuestro boletín para recibir las noticias más relevantes sobre inteligencia artificial
              directamente en tu bandeja de entrada.
            </p>
          </div>

          <div className="w-full max-w-md">
            {isSuccess ? (
              <div className="rounded-lg border border-primary/20 bg-primary/10 p-6 text-primary">
                <h3 className="text-lg font-medium mb-2">¡Gracias por suscribirte!</h3>
                <p>Pronto recibirás nuestras actualizaciones en tu correo electrónico.</p>
              </div>
            ) : (
              <div className="rounded-lg border border-border p-6 bg-background shadow-sm">
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <label htmlFor="email" className="text-sm font-medium text-left block">
                      Correo electrónico
                    </label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="tu@email.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      className="h-12"
                    />
                  </div>
                  <Button type="submit" className="w-full h-12 group" disabled={isSubmitting}>
                    {isSubmitting ? (
                      "Suscribiendo..."
                    ) : (
                      <>
                        Suscribirse
                        <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                      </>
                    )}
                  </Button>
                  {error && <p className="text-sm text-destructive mt-2">{error}</p>}
                </form>
              </div>
            )}
          </div>

          <p className="text-xs text-muted-foreground">
            Respetamos tu privacidad. Puedes darte de baja en cualquier momento.
          </p>
        </div>
      </div>
    </section>
  )
}
