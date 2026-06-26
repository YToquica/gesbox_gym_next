import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { 
  getPlanesAction, 
  createPlanAction, 
  updatePlanAction, 
  deletePlanAction 
} from '../actions'
import { type PlanInput } from '../schemas'

export function usePlanes() {
  const queryClient = useQueryClient()

  // 1. Query para listar planes
  const { 
    data: planes = [], 
    isLoading, 
    error, 
    refetch 
  } = useQuery({
    queryKey: ['planes'],
    queryFn: async () => {
      const result = await getPlanesAction()
      if (!result.success) {
        throw new Error(result.error)
      }
      return result.data || []
    },
  })

  // 2. Mutation para crear
  const createMutation = useMutation({
    mutationFn: createPlanAction,
    onSuccess: (result) => {
      if (result.success) {
        queryClient.invalidateQueries({ queryKey: ['planes'] })
      }
    },
  })

  // 3. Mutation para actualizar
  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: PlanInput }) => {
      return updatePlanAction(id, data)
    },
    onSuccess: (result) => {
      if (result.success) {
        queryClient.invalidateQueries({ queryKey: ['planes'] })
      }
    },
  })

  // 4. Mutation para eliminar
  const deleteMutation = useMutation({
    mutationFn: deletePlanAction,
    onSuccess: (result) => {
      if (result.success) {
        queryClient.invalidateQueries({ queryKey: ['planes'] })
      }
    },
  })

  return {
    planes,
    isLoading,
    error: error ? error.message : null,
    refetch,
    
    // Mutaciones
    createPlan: createMutation.mutateAsync,
    isCreating: createMutation.isPending,
    createError: createMutation.error ? createMutation.error.message : null,

    updatePlan: updateMutation.mutateAsync,
    isUpdating: updateMutation.isPending,
    updateError: updateMutation.error ? updateMutation.error.message : null,

    deletePlan: deleteMutation.mutateAsync,
    isDeleting: deleteMutation.isPending,
    deleteError: deleteMutation.error ? deleteMutation.error.message : null,
  }
}
