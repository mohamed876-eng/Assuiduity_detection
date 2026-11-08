import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { sessionService } from '@/services/api/sessionService'

export function useSessions() {
  return useQuery({ queryKey: ['sessions'], queryFn: () => sessionService.list() })
}

export function useSession(id) {
  return useQuery({
    queryKey: ['sessions', id],
    queryFn: () => sessionService.get(id),
    enabled: Boolean(id),
  })
}

export function useSessionMutations() {
  const queryClient = useQueryClient()
  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: ['sessions'] })
    queryClient.invalidateQueries({ queryKey: ['attendance'] })
    queryClient.invalidateQueries({ queryKey: ['analytics'] })
    queryClient.invalidateQueries({ queryKey: ['notifications'] })
  }
  return {
    create: useMutation({
      mutationFn: (payload) => sessionService.create(payload),
      onSuccess: invalidate,
    }),
    start: useMutation({
      mutationFn: (id) => sessionService.start(id),
      onSuccess: invalidate,
    }),
    stop: useMutation({
      mutationFn: (id) => sessionService.stop(id),
      onSuccess: invalidate,
    }),
    remove: useMutation({
      mutationFn: (id) => sessionService.remove(id),
      onSuccess: invalidate,
    }),
  }
}
