import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { getClientesAction, getClienteDetallesAction } from '../actions'

export function useProfiles() {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedProfileId, setSelectedProfileId] = useState<string | null>(null)

  // 1. Obtener la lista de clientes (con búsqueda reactiva)
  const {
    data: clientes = [],
    isLoading: isLoadingClientes,
    error: clientesError,
    refetch: refetchClientes,
  } = useQuery({
    queryKey: ['profiles', searchQuery],
    queryFn: async () => {
      const result = await getClientesAction(searchQuery)
      if (!result.success) {
        throw new Error(result.error)
      }
      return result.data || []
    },
  })

  // 2. Obtener los detalles completos del cliente seleccionado
  const {
    data: detalles = null,
    isLoading: isLoadingDetalles,
    error: detallesError,
    refetch: refetchDetalles,
  } = useQuery({
    queryKey: ['profile-details', selectedProfileId],
    queryFn: async () => {
      if (!selectedProfileId) return null
      const result = await getClienteDetallesAction(selectedProfileId)
      if (!result.success) {
        throw new Error(result.error)
      }
      return result.data
    },
    enabled: !!selectedProfileId, // Solo se ejecuta si hay un ID seleccionado
  })

  return {
    // Listado
    clientes,
    searchQuery,
    setSearchQuery,
    isLoadingClientes,
    clientesError: clientesError ? clientesError.message : null,
    refetchClientes,

    // Previsualización / Ficha
    selectedProfileId,
    setSelectedProfileId,
    detalles,
    isLoadingDetalles,
    detallesError: detallesError ? detallesError.message : null,
    refetchDetalles,
  }
}
