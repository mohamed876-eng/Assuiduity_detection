import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { attendanceService } from '@/services/api/attendanceService'

export function useAttendance(filters = {}) {
  return useQuery({
    queryKey: ['attendance', filters],
    queryFn: () => attendanceService.list(filters),
  })
}

export function useAttendanceMutations() {
  const queryClient = useQueryClient()
  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: ['attendance'] })
    queryClient.invalidateQueries({ queryKey: ['analytics'] })
    queryClient.invalidateQueries({ queryKey: ['sessions'] })
  }
  return {
    updateStatus: useMutation({
      mutationFn: ({ id, status, note }) => attendanceService.updateStatus(id, status, note),
      onSuccess: invalidate,
    }),
  }
}
