'use client'

import { useCheckIn } from '../hooks/use-checkin'
import { PanelCheckIn } from './panel-checkin'
import { RecentCheckIns } from './recent-checkins'

export function RecepcionDashboard() {
  const {
    form,
    onSubmit,
    isPending,
    lastResult,
    clearLastResult,
    asistencias,
    isLoadingAsistencias,
    asistenciasError,
    inputRef,
  } = useCheckIn()

  return (
    <div className="space-y-6">
      {/* Cabecera del Dashboard */}
      <div>
        <h2 className="text-xl font-black font-heading text-foreground">
          Recepción y Check-In
        </h2>
        <p className="text-xs text-muted-foreground">
          Verifica las membresías de los clientes e ingresa asistencias en mostrador en tiempo real.
        </p>
      </div>

      {/* Grilla principal de Recepción */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* Panel de Check-In (Toma 2 columnas) */}
        <div className="lg:col-span-2">
          <PanelCheckIn
            form={form}
            onSubmit={onSubmit}
            isPending={isPending}
            lastResult={lastResult}
            clearLastResult={clearLastResult}
            inputRef={inputRef}
          />
        </div>

        {/* Historial de Ingresos Recientes (Toma 1 columna) */}
        <div className="lg:col-span-1 h-full">
          <RecentCheckIns
            asistencias={asistencias}
            isLoading={isLoadingAsistencias}
            error={asistenciasError}
          />
        </div>
      </div>
    </div>
  )
}
