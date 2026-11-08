import { useQuery } from '@tanstack/react-query'
import { analyticsService } from '@/services/api/analyticsService'

export function useDashboard() {
  return useQuery({
    queryKey: ['analytics', 'dashboard'],
    queryFn: () => analyticsService.dashboard(),
    refetchInterval: 60000,
  })
}

export function useStudentSummaries() {
  return useQuery({
    queryKey: ['analytics', 'student-summaries'],
    queryFn: () => analyticsService.studentSummaries(),
  })
}

export function useReport(range) {
  return useQuery({
    queryKey: ['analytics', 'report', range],
    queryFn: () => analyticsService.report(range),
    enabled: Boolean(range?.from && range?.to),
  })
}
