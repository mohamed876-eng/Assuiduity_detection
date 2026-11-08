import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { faceService } from '@/services/api/faceService'

export function useFaces() {
  return useQuery({ queryKey: ['faces'], queryFn: () => faceService.list() })
}

export function useStudentFace(studentId) {
  return useQuery({
    queryKey: ['faces', 'student', studentId],
    queryFn: () => faceService.getForStudent(studentId),
    enabled: Boolean(studentId),
  })
}

export function useFaceMutations() {
  const queryClient = useQueryClient()
  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: ['faces'] })
    queryClient.invalidateQueries({ queryKey: ['students'] })
  }
  return {
    submit: useMutation({
      mutationFn: ({ studentId, meta }) => faceService.submitForRegistration(studentId, meta),
      onSuccess: invalidate,
    }),
    retry: useMutation({
      mutationFn: (studentId) => faceService.markForRetry(studentId),
      onSuccess: invalidate,
    }),
  }
}
