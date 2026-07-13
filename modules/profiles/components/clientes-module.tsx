'use client'

import { useProfiles } from '../hooks/use-profiles'
import { ClientePreview } from './cliente-preview'
import { Input } from '@/components/ui/input'
import { Card, CardContent } from '@/components/ui/card'
import { 
  Search, 
  User, 
  ChevronRight, 
  ArrowLeft,
  Users,
  AlertCircle
} from 'lucide-react'
import { cn } from '@/lib/utils'

export function ClientesModule({ userRole }: { userRole?: string }) {
  const {
    clientes,
    searchQuery,
    setSearchQuery,
    isLoadingClientes,
    clientesError,
    
    selectedProfileId,
    setSelectedProfileId,
    detalles,
    isLoadingDetalles,
    detallesError,
    refetchClientes,
  } = useProfiles()

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
      
      {/* Columna de Búsqueda y Lista (Oculta en móvil si hay un cliente seleccionado) */}
      <div 
        className={cn(
          "lg:col-span-2 space-y-4 transition-all duration-300",
          selectedProfileId ? "hidden lg:block animate-fade-in" : "block animate-fade-in"
        )}
      >
        {/* Input de Búsqueda */}
        <div className="relative">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Buscar cliente por nombre o número de cédula..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 pr-4 h-10 border-input bg-card focus:border-ring focus:ring-ring w-full shadow-xs"
          />
        </div>

        {/* Alerta de Error de Lista */}
        {clientesError && (
          <div className="flex items-start gap-2 p-4 text-xs rounded-xl border border-brand-error/25 bg-brand-error/10 text-brand-error">
            <AlertCircle className="h-4.5 w-4.5 shrink-0" />
            <div>
              <p className="font-semibold">Error al obtener clientes</p>
              <p className="text-[11px] mt-0.5">{clientesError}</p>
            </div>
          </div>
        )}

        {/* Listado de Clientes */}
        {isLoadingClientes ? (
          <div className="space-y-3">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-16 rounded-xl bg-card border border-border animate-pulse flex items-center justify-between px-4">
                <div className="flex items-center gap-3 w-full">
                  <div className="h-9 w-9 rounded-full bg-muted" />
                  <div className="space-y-2 w-1/3">
                    <div className="h-4 bg-muted rounded w-full" />
                    <div className="h-3 bg-muted rounded w-2/3" />
                  </div>
                </div>
                <div className="h-5 w-5 bg-muted rounded" />
              </div>
            ))}
          </div>
        ) : clientes.length > 0 ? (
          <div className="border border-border rounded-xl bg-card divide-y divide-border overflow-hidden shadow-xs">
            {clientes.map((cliente: any) => {
              const isSelected = selectedProfileId === cliente.id
              return (
                <div
                  key={cliente.id}
                  onClick={() => setSelectedProfileId(cliente.id)}
                  className={cn(
                    "flex items-center justify-between p-4 cursor-pointer transition-all duration-200 hover:bg-muted/50",
                    isSelected ? "bg-brand-primary/5 border-l-4 border-l-brand-primary" : "border-l-4 border-l-transparent"
                  )}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className={cn(
                      "h-9 w-9 rounded-full flex items-center justify-center font-bold text-sm shrink-0 border",
                      isSelected 
                        ? "bg-brand-primary text-white border-brand-primary" 
                        : "bg-brand-primary/10 text-brand-primary border-brand-primary/20"
                    )}>
                      {cliente.nombre_completo.charAt(0).toUpperCase()}
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-foreground truncate">
                        {cliente.nombre_completo}
                      </p>
                      <p className="text-xs text-muted-foreground font-mono mt-0.5">
                        {cliente.tipo_documento || 'CC'}: {cliente.numero_documento || 'N/A'}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    {cliente.telefono && (
                      <span className="hidden sm:inline text-xs text-muted-foreground font-medium mr-2">
                        {cliente.telefono}
                      </span>
                    )}
                    <ChevronRight className={cn(
                      "h-4 w-4 transition-transform", 
                      isSelected ? "text-brand-primary translate-x-0.5" : "text-muted-foreground"
                    )} />
                  </div>
                </div>
              )
            })}
          </div>
        ) : (
          /* Empty State */
          <div className="flex flex-col items-center justify-center p-12 text-center border-2 border-dashed border-border rounded-2xl bg-card min-h-[300px]">
            <Users className="h-12 w-12 text-muted-foreground stroke-1 mb-3" />
            <h3 className="text-sm font-bold text-foreground">No se encontraron clientes</h3>
            <p className="text-xs text-muted-foreground max-w-xs mt-1">
              {searchQuery 
                ? 'Intenta buscar con otros términos o números de identificación.' 
                : 'No hay perfiles de clientes registrados en el sistema.'}
            </p>
          </div>
        )}
      </div>

      {/* Columna de Previsualización (Ocupa toda la pantalla en móvil si está seleccionada) */}
      <div 
        className={cn(
          "lg:col-span-1 h-full transition-all duration-300",
          selectedProfileId ? "block animate-fade-in" : "hidden lg:block animate-fade-in"
        )}
      >
        {/* Botón de retorno móvil */}
        {selectedProfileId && (
          <button
            onClick={() => setSelectedProfileId(null)}
            className="lg:hidden flex items-center gap-1.5 text-xs text-brand-primary font-semibold mb-4 hover:underline"
          >
            <ArrowLeft className="h-4 w-4" />
            Volver al listado
          </button>
        )}

        <ClientePreview
          detalles={detalles}
          onClose={() => setSelectedProfileId(null)}
          isLoading={isLoadingDetalles}
          error={detallesError}
          userRole={userRole}
          onDeleteSuccess={() => {
            setSelectedProfileId(null)
            refetchClientes()
          }}
        />
      </div>

    </div>
  )
}
