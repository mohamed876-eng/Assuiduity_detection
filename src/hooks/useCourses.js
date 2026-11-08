import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { courseService } from '@/services/api/courseService'

export function useCourses() {
  return useQuery({ queryKey: ['courses'], queryFn: () => courseService.list() })
}

export function useCourse(id) {
  return useQuery({
    queryKey: ['courses', id],
    queryFn: () => courseService.get(id),
    enabled: Boolean(id),
  })
}

export function useCourseMutations() {
  const queryClient = useQueryClient()
  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: ['courses'] })
    queryClient.invalidateQueries({ queryKey: ['classes'] })
  }
  return {
    create: useMutation({
      mutationFn: (payload) => courseService.create(payload),
      onSuccess: invalidate,
    }),
    update: useMutation({
      mutationFn: ({ id, payload }) => courseService.update(id, payload),
      onSuccess: invalidate,
    }),
    remove: useMutation({
      mutationFn: (id) => courseService.remove(id),
      onSuccess: invalidate,
    }),
  }
}
