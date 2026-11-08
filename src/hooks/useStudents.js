import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { studentService } from '@/services/api/studentService'

export function useStudents() {
  return useQuery({ queryKey: ['students'], queryFn: () => studentService.list() })
}

export function useStudent(id) {
  return useQuery({
    queryKey: ['students', id],
    queryFn: () => studentService.get(id),
    enabled: Boolean(id),
  })
}

export function useStudentMutations() {
  const queryClient = useQueryClient()
  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: ['students'] })
    queryClient.invalidateQueries({ queryKey: ['faces'] })
    queryClient.invalidateQueries({ queryKey: ['analytics'] })
  }

  const create = useMutation({
    mutationFn: (payload) => studentService.create(payload),
    onSuccess: invalidate,
  })
  const update = useMutation({
    mutationFn: ({ id, payload }) => studentService.update(id, payload),
    onSuccess: invalidate,
  })
  const remove = useMutation({
    mutationFn: (id) => studentService.remove(id),
    onSuccess: invalidate,
  })

  return { create, update, remove }
}
