import { useState, useEffect, useRef } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { checkInSchema, type CheckInInput } from '../schemas'
import { checkInClienteAction, getRecentAsistenciasAction } from '../actions'

// Helper para sintetizar sonidos en el navegador (sin archivos estáticos)
const playAudioBeep = (type: 'success' | 'error') => {
  if (typeof window === 'undefined') return
  try {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext
    if (!AudioContextClass) return
    const audioCtx = new AudioContextClass()
    
    if (type === 'success') {
      // Pitido doble alegre y agudo (D5 y A5)
      const osc1 = audioCtx.createOscillator()
      const gain1 = audioCtx.createGain()
      osc1.connect(gain1)
      gain1.connect(audioCtx.destination)
      osc1.frequency.setValueAtTime(587.33, audioCtx.currentTime) // D5
      gain1.gain.setValueAtTime(0.08, audioCtx.currentTime)
      osc1.start()
      gain1.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.15)
      osc1.stop(audioCtx.currentTime + 0.15)
      
      setTimeout(() => {
        if (audioCtx.state === 'closed') return
        const osc2 = audioCtx.createOscillator()
        const gain2 = audioCtx.createGain()
        osc2.connect(gain2)
        gain2.connect(audioCtx.destination)
        osc2.frequency.setValueAtTime(880, audioCtx.currentTime) // A5
        gain2.gain.setValueAtTime(0.08, audioCtx.currentTime)
        osc2.start()
        gain2.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.2)
        osc2.stop(audioCtx.currentTime + 0.2)
      }, 120)
    } else {
      // Zumbido grave y de advertencia (Sawtooth wave)
      const osc = audioCtx.createOscillator()
      const gain = audioCtx.createGain()
      osc.type = 'sawtooth'
      osc.connect(gain)
      gain.connect(audioCtx.destination)
      osc.frequency.setValueAtTime(140, audioCtx.currentTime)
      gain.gain.setValueAtTime(0.12, audioCtx.currentTime)
      osc.start()
      gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.45)
      osc.stop(audioCtx.currentTime + 0.45)
    }
  } catch (e) {
    console.warn('AudioContext no soportado o bloqueado por el navegador:', e)
  }
}

export function useCheckIn() {
  const queryClient = useQueryClient()
  const [lastResult, setLastResult] = useState<{
    status: 'success' | 'error' | 'idle'
    message: string
    code?: string
    data?: any
  } | null>(null)
  
  const timerRef = useRef<NodeJS.Timeout | null>(null)
  const inputRef = useRef<HTMLInputElement | null>(null)

  // 1. react-hook-form para el input del documento
  const form = useForm<CheckInInput>({
    resolver: zodResolver(checkInSchema as any),
    defaultValues: {
      numero_documento: '',
    },
  })

  // 2. Consulta de ingresos recientes
  const {
    data: asistencias = [],
    isLoading: isLoadingAsistencias,
    error: asistenciasError,
  } = useQuery({
    queryKey: ['asistencias-recientes'],
    queryFn: async () => {
      const res = await getRecentAsistenciasAction()
      if (!res.success) {
        throw new Error(res.error)
      }
      return res.data || []
    },
  })

  // Limpiar temporizador al desmontar
  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current)
    }
  }, [])

  // 3. Mutación para hacer check-in
  const { mutate: doCheckIn, isPending } = useMutation({
    mutationFn: async (numeroDocumento: string) => {
      // Limpiar temporizador anterior de desvanecimiento
      if (timerRef.current) {
        clearTimeout(timerRef.current)
        timerRef.current = null
      }
      return await checkInClienteAction(numeroDocumento)
    },
    onSuccess: (res) => {
      // Limpiar el formulario
      form.reset({ numero_documento: '' })
      
      // Re-enfocar el input de inmediato
      setTimeout(() => {
        inputRef.current?.focus()
      }, 50)

      if (res.success) {
        // Sonido de éxito
        playAudioBeep('success')
        
        // Guardar resultado exitoso
        setLastResult({
          status: 'success',
          message: '¡Acceso Autorizado!',
          data: res.data,
        })

        // Invalidar consulta para recargar la lista
        queryClient.invalidateQueries({ queryKey: ['asistencias-recientes'] })
      } else {
        // Sonido de fallo
        playAudioBeep('error')

        setLastResult({
          status: 'error',
          message: res.error || 'Acceso Denegado',
          code: res.code,
          data: res.data,
        })
      }

      // Iniciar temporizador de 8 segundos para limpiar la pantalla si está inactivo
      timerRef.current = setTimeout(() => {
        setLastResult(null)
      }, 8000)
    },
    onError: (err: any) => {
      playAudioBeep('error')
      setLastResult({
        status: 'error',
        message: err.message || 'Error de comunicación con el servidor.',
        code: 'NETWORK_ERROR',
      })
      
      timerRef.current = setTimeout(() => {
        setLastResult(null)
      }, 8000)
    },
  })

  const onSubmit = (data: CheckInInput) => {
    doCheckIn(data.numero_documento)
  }

  const clearLastResult = () => {
    if (timerRef.current) {
      clearTimeout(timerRef.current)
      timerRef.current = null
    }
    setLastResult(null)
    inputRef.current?.focus()
  }

  return {
    form,
    onSubmit,
    isPending,
    lastResult,
    clearLastResult,
    asistencias,
    isLoadingAsistencias,
    asistenciasError: asistenciasError ? asistenciasError.message : null,
    inputRef,
  }
}
