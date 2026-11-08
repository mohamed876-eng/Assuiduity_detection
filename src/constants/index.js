export const ATTENDANCE_STATUSES = ['present', 'absent', 'late', 'excused']

export const ATTENDANCE_STATUS_META = {
  present: { label: 'Present', tone: 'success' },
  absent: { label: 'Absent', tone: 'danger' },
  late: { label: 'Late', tone: 'warning' },
  excused: { label: 'Excused', tone: 'neutral' },
}

export const STUDENT_STATUSES = ['active', 'inactive', 'suspended']

export const STAFF_STATUSES = ['active', 'on-leave', 'inactive']

export const SESSION_STATUSES = ['scheduled', 'active', 'completed', 'cancelled']

export const FACE_STATUS_META = {
  registered: { label: 'Registered', tone: 'success' },
  pending: { label: 'Pending review', tone: 'warning' },
  not_registered: { label: 'Not registered', tone: 'neutral' },
  failed: { label: 'Needs retry', tone: 'danger' },
}

export const DAYS_OF_WEEK = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday']

export const PAGE_SIZE = 10

export const CHART_COLORS = {
  present: '#343338',
  absent: '#b4b3b9',
  late: '#6e6d73',
  excused: '#dedee2',
  grid: '#ececef',
  axis: '#909096',
  ink: '#101014',
  gradientFrom: '#57565b',
  gradientTo: '#d9d9dd',
}

export const DETECTION_MODE = import.meta.env.VITE_DETECTION_MODE || 'mock'
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api'
