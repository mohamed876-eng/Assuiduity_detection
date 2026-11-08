import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { notificationService } from '@/services/api/notificationService'

export function useNotifications() {
  return useQuery({
    queryKey: ['notifications'],
    queryFn: () => notificationService.list(),
    refetchInterval: 30000,
  })
}

export function useNotificationMutations() {
  const queryClient = useQueryClient()
  const invalidate = () => queryClient.invalidateQueries({ queryKey: ['notifications'] })
  return {
    markRead: useMutation({
      mutationFn: (id) => notificationService.markRead(id),
      onSuccess: invalidate,
    }),
    markAllRead: useMutation({
      mutationFn: () => notificationService.markAllRead(),
      onSuccess: invalidate,
    }),
    remove: useMutation({
      mutationFn: (id) => notificationService.remove(id),
      onSuccess: invalidate,
    }),
  }
}
