"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ArrowRight } from "lucide-react"

export function HeroNewsletter() {
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
    <div className="w-full max-w-md mx-auto mt-8">
      {isSuccess ? (
        <div className="rounded-lg border border-primary/20 bg-primary/10 p-4 text-primary text-center">
          <p>¡Gracias por suscribirte! Pronto recibirás nuestras actualizaciones.</p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-2">
          <div className="flex-1">
            <Input
              type="email"
              placeholder="tu@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="h-10 sm:h-11"
              aria-label="Correo electrónico"
            />
          </div>
          <Button type="submit" className="h-10 sm:h-11 group" disabled={isSubmitting}>
            {isSubmitting ? (
              <span className="mx-2">...</span>
            ) : (
              <>
                Suscribirse
                <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
              </>
            )}
          </Button>
        </form>
      )}
      {error && <p className="text-xs text-destructive mt-2 text-center">{error}</p>}
    </div>
  )
}
