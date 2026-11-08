import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { teacherService } from '@/services/api/teacherService'

export function useTeachers() {
  return useQuery({ queryKey: ['teachers'], queryFn: () => teacherService.list() })
}

export function useTeacher(id) {
  return useQuery({
    queryKey: ['teachers', id],
    queryFn: () => teacherService.get(id),
    enabled: Boolean(id),
  })
}

export function useTeacherMutations() {
  const queryClient = useQueryClient()
  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: ['teachers'] })
    queryClient.invalidateQueries({ queryKey: ['classes'] })
    queryClient.invalidateQueries({ queryKey: ['courses'] })
  }
  return {
    create: useMutation({
      mutationFn: (payload) => teacherService.create(payload),
      onSuccess: invalidate,
    }),
    update: useMutation({
      mutationFn: ({ id, payload }) => teacherService.update(id, payload),
      onSuccess: invalidate,
    }),
    remove: useMutation({
      mutationFn: (id) => teacherService.remove(id),
      onSuccess: invalidate,
    }),
  }
}
