import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { classService } from '@/services/api/classService'

export function useClasses() {
  return useQuery({ queryKey: ['classes'], queryFn: () => classService.list() })
}

export function useClass(id) {
  return useQuery({
    queryKey: ['classes', id],
    queryFn: () => classService.get(id),
    enabled: Boolean(id),
  })
}

export function useClassMutations() {
  const queryClient = useQueryClient()
  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: ['classes'] })
    queryClient.invalidateQueries({ queryKey: ['students'] })
    queryClient.invalidateQueries({ queryKey: ['courses'] })
    queryClient.invalidateQueries({ queryKey: ['analytics'] })
  }
  return {
    create: useMutation({
      mutationFn: (payload) => classService.create(payload),
      onSuccess: invalidate,
    }),
    update: useMutation({
      mutationFn: ({ id, payload }) => classService.update(id, payload),
      onSuccess: invalidate,
    }),
    remove: useMutation({
      mutationFn: (id) => classService.remove(id),
      onSuccess: invalidate,
    }),
  }
}
