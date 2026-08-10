'use client'

import * as React from 'react'

interface LandingNavProps {
  className?: string
}

export function LandingNav({ className }: LandingNavProps) {
  const handleScroll = (e: React.MouseEvent<HTMLAnchorElement>, targetId: string) => {
    e.preventDefault()
    const element = document.getElementById(targetId)
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' })
      // Reemplazamos el hash en la URL sin crear una nueva entrada en el historial del navegador
      window.history.replaceState(null, '', `#${targetId}`)
    }
  }

  return (
    <nav className={className || "hidden md:flex items-center gap-6 text-sm font-medium text-muted-foreground"}>
      <a
        href="#features"
        onClick={(e) => handleScroll(e, 'features')}
        className="hover:text-foreground transition-colors"
      >
        Características
      </a>
      <a
        href="#pricing"
        onClick={(e) => handleScroll(e, 'pricing')}
        className="hover:text-foreground transition-colors"
      >
        Planes
      </a>
      <a
        href="#about"
        onClick={(e) => handleScroll(e, 'about')}
        className="hover:text-foreground transition-colors"
      >
        Nosotros
      </a>
    </nav>
  )
}
