'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { 
  Dumbbell, 
  Users, 
  Layers, 
  Home, 
  LogOut, 
  Menu, 
  X, 
  User,
  Shield,
  LayoutDashboard,
  Sun,
  Moon,
  UserCheck
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface DashboardShellProps {
  children: React.ReactNode
  profile: {
    nombre_completo: string
    rol: string
  }
}

export default function DashboardShell({ children, profile }: DashboardShellProps) {
  const pathname = usePathname()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  
  // Estado para el tema claro/oscuro
  const [theme, setTheme] = useState<'light' | 'dark'>('light')

  // Cargar tema inicial desde localStorage o preferencia del sistema
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme')
    if (savedTheme === 'light' || savedTheme === 'dark') {
      setTheme(savedTheme)
    } else {
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
      setTheme(prefersDark ? 'dark' : 'light')
    }
  }, [])

  // Sincronizar clase .dark en el documentElement
  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark')
      localStorage.setItem('theme', 'dark')
    } else {
      document.documentElement.classList.remove('dark')
      localStorage.setItem('theme', 'light')
    }
  }, [theme])

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'light' ? 'dark' : 'light'))
  }

  const menuItems = [
    {
      name: 'Resumen',
      href: '/dashboard',
      icon: LayoutDashboard,
    },
    {
      name: 'Recepción',
      href: '/dashboard/recepcion',
      icon: UserCheck,
    },
    {
      name: 'Clientes',
      href: '/dashboard/clientes',
      icon: Users,
    },
    {
      name: 'Planes',
      href: '/dashboard/planes',
      icon: Layers,
    },
  ]

  const toggleSidebar = () => setSidebarOpen(!sidebarOpen)

  // Traducir rol de base de datos
  const getRoleLabel = (rol: string) => {
    switch (rol) {
      case 'admin':
        return 'Administrador'
      case 'recepcionista':
        return 'Recepcionista'
      case 'cliente':
        return 'Cliente'
      default:
        return rol
    }
  }

  return (
    <div className="flex h-screen overflow-hidden bg-background text-foreground transition-colors duration-200">
      {/* Sidebar para pantallas grandes (Desktop) */}
      <aside className="hidden lg:flex lg:flex-col lg:w-64 lg:flex-shrink-0 border-r border-border bg-card">
        {/* Header del Sidebar */}
        <div className="flex h-16 items-center px-6 border-b border-border bg-card">
          <Link href="/dashboard" className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand-primary text-white">
              <Dumbbell className="h-5 w-5" />
            </div>
            <span className="font-heading text-xl font-black tracking-tight">
              GES<span className="text-brand-primary">BOX</span>
            </span>
          </Link>
        </div>

        {/* Links de Navegación */}
        <nav className="flex-1 overflow-y-auto px-4 py-6 space-y-1">
          <div className="px-3 mb-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            Administración
          </div>
          {menuItems.map((item) => {
            const isActive = pathname === item.href
            const Icon = item.icon
            return (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 group",
                  isActive
                    ? "bg-brand-primary text-white shadow-sm"
                    : "text-muted-foreground hover:bg-accent hover:text-foreground"
                )}
              >
                <Icon className={cn("h-4 w-4 shrink-0 transition-transform group-hover:scale-110", isActive ? "text-white" : "text-muted-foreground group-hover:text-foreground")} />
                {item.name}
              </Link>
            )
          })}
        </nav>

        {/* Footer del Sidebar (Usuario e Info) */}
        <div className="p-4 border-t border-border bg-card">
          <div className="flex items-center gap-3 p-2 rounded-lg bg-muted/50 mb-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-brand-primary/10 text-brand-primary font-bold text-sm">
              {profile.nombre_completo.charAt(0).toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-foreground truncate">
                {profile.nombre_completo}
              </p>
              <span className="inline-flex items-center gap-1 text-[10px] uppercase font-bold tracking-wider text-brand-primary">
                <Shield className="h-2.5 w-2.5" />
                {getRoleLabel(profile.rol)}
              </span>
            </div>
          </div>

          <Link
            href="/auth/signout"
            className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-destructive hover:bg-destructive/10 transition-colors w-full"
          >
            <LogOut className="h-4 w-4 shrink-0" />
            Cerrar Sesión
          </Link>
        </div>
      </aside>

      {/* Sidebar Móvil (Drawer) */}
      <div
        className={cn(
          "fixed inset-0 z-40 lg:hidden transition-opacity duration-300 ease-in-out bg-black/60",
          sidebarOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        )}
        onClick={toggleSidebar}
      />

      <aside
        className={cn(
          "fixed top-0 bottom-0 left-0 z-50 flex flex-col w-64 bg-card border-r border-border transition-transform duration-300 ease-in-out lg:hidden",
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="flex h-16 items-center justify-between px-6 border-b border-border">
          <Link href="/dashboard" className="flex items-center gap-2" onClick={toggleSidebar}>
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand-primary text-white">
              <Dumbbell className="h-5 w-5" />
            </div>
            <span className="font-heading text-xl font-black tracking-tight">
              GES<span className="text-brand-primary">BOX</span>
            </span>
          </Link>
          <button
            onClick={toggleSidebar}
            className="p-1 rounded-md hover:bg-accent text-muted-foreground"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto px-4 py-6 space-y-1">
          <div className="px-3 mb-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            Administración
          </div>
          {menuItems.map((item) => {
            const isActive = pathname === item.href
            const Icon = item.icon
            return (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200",
                  isActive
                    ? "bg-brand-primary text-white shadow-sm"
                    : "text-muted-foreground hover:bg-accent hover:text-foreground"
                )}
                onClick={toggleSidebar}
              >
                <Icon className="h-4 w-4 shrink-0" />
                {item.name}
              </Link>
            )
          })}
        </nav>

        <div className="p-4 border-t border-border">
          <div className="flex items-center gap-3 p-2 rounded-lg bg-muted/50 mb-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-brand-primary/10 text-brand-primary font-bold text-sm">
              {profile.nombre_completo.charAt(0).toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-foreground truncate">
                {profile.nombre_completo}
              </p>
              <span className="inline-flex items-center gap-1 text-[10px] uppercase font-bold tracking-wider text-brand-primary">
                <Shield className="h-2.5 w-2.5" />
                {getRoleLabel(profile.rol)}
              </span>
            </div>
          </div>

          <Link
            href="/auth/signout"
            className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-destructive hover:bg-destructive/10 transition-colors w-full"
            onClick={toggleSidebar}
          >
            <LogOut className="h-4 w-4 shrink-0" />
            Cerrar Sesión
          </Link>
        </div>
      </aside>

      {/* Contenido Principal */}
      <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
        {/* Header Superior Móvil / Desktop Title */}
        <header className="flex h-16 items-center justify-between px-6 border-b border-border bg-card lg:bg-background/80 lg:backdrop-blur-sm lg:sticky lg:top-0 lg:z-30">
          <div className="flex items-center gap-4">
            <button
              onClick={toggleSidebar}
              className="lg:hidden p-2 -ml-2 rounded-md hover:bg-accent text-muted-foreground"
            >
              <Menu className="h-5 w-5" />
            </button>
            <h1 className="text-lg font-bold font-heading text-foreground capitalize">
              {pathname === '/dashboard' ? 'Resumen Operativo' : pathname.split('/').pop()}
            </h1>
          </div>
          
          <div className="flex items-center gap-4">
            {/* Botón de Cambio de Tema */}
            <button
              onClick={toggleTheme}
              className="p-2 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground transition-all duration-200"
              title={theme === 'light' ? 'Cambiar a modo oscuro' : 'Cambiar a modo claro'}
            >
              {theme === 'light' ? (
                <Moon className="h-4.5 w-4.5" />
              ) : (
                <Sun className="h-4.5 w-4.5" />
              )}
            </button>

            <div className="hidden sm:flex flex-col items-end text-xs">
              <span className="font-semibold text-foreground">{profile.nombre_completo}</span>
              <span className="text-[10px] uppercase font-bold tracking-wider text-brand-primary">
                {getRoleLabel(profile.rol)}
              </span>
            </div>
            <div className="h-8 w-8 rounded-full bg-brand-primary/10 text-brand-primary flex items-center justify-center font-bold text-sm border border-brand-primary/20">
              {profile.nombre_completo.charAt(0).toUpperCase()}
            </div>
          </div>
        </header>

        {/* Vista del Panel */}
        <main className="flex-1 overflow-y-auto p-4 md:p-6 bg-surface-container-low">
          {children}
        </main>
      </div>
    </div>
  )
}
