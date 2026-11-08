import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { settingsService } from '@/services/api/settingsService'

export function useSettings() {
  return useQuery({ queryKey: ['settings'], queryFn: () => settingsService.get() })
}

export function useSettingsMutations() {
  const queryClient = useQueryClient()
  return {
    saveSection: useMutation({
      mutationFn: ({ section, values }) => settingsService.saveSection(section, values),
      onSuccess: () => queryClient.invalidateQueries({ queryKey: ['settings'] }),
    }),
    saveAll: useMutation({
      mutationFn: (values) => settingsService.saveAll(values),
      onSuccess: () => queryClient.invalidateQueries({ queryKey: ['settings'] }),
    }),
    reset: useMutation({
      mutationFn: () => settingsService.reset(),
      onSuccess: () => queryClient.invalidateQueries({ queryKey: ['settings'] }),
    }),
  }
}
