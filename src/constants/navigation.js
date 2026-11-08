import {
  LayoutDashboard,
  Users,
  GraduationCap,
  School,
  BookOpen,
  ScanFace,
  Camera,
  ClipboardCheck,
  CalendarClock,
  BarChart3,
  Bell,
  Settings,
} from 'lucide-react'

export const NAV_SECTIONS = [
  {
    label: 'Overview',
    items: [
      { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard, roles: ['admin', 'teacher'] },
    ],
  },
  {
    label: 'Management',
    items: [
      { to: '/students', label: 'Students', icon: Users, roles: ['admin', 'teacher'] },
      { to: '/teachers', label: 'Teachers', icon: GraduationCap, roles: ['admin'] },
      { to: '/classes', label: 'Classes', icon: School, roles: ['admin', 'teacher'] },
      { to: '/courses', label: 'Courses', icon: BookOpen, roles: ['admin', 'teacher'] },
      { to: '/face-recognition', label: 'Face Registry', icon: ScanFace, roles: ['admin'] },
    ],
  },
  {
    label: 'Operations',
    items: [
      { to: '/detection', label: 'Live Detection', icon: Camera, roles: ['admin', 'teacher'] },
      { to: '/attendance', label: 'Attendance', icon: ClipboardCheck, roles: ['admin', 'teacher'] },
      { to: '/sessions', label: 'Sessions', icon: CalendarClock, roles: ['admin', 'teacher'] },
    ],
  },
  {
    label: 'Insights',
    items: [
      { to: '/reports', label: 'Reports', icon: BarChart3, roles: ['admin', 'teacher'] },
      { to: '/notifications', label: 'Notifications', icon: Bell, roles: ['admin', 'teacher'] },
      { to: '/settings', label: 'Settings', icon: Settings, roles: ['admin', 'teacher'] },
    ],
  },
]

export function getNavForRole(role) {
  return NAV_SECTIONS.map((section) => ({
    ...section,
    items: section.items.filter((item) => item.roles.includes(role)),
  })).filter((section) => section.items.length > 0)
}

export const ROUTE_LABELS = {
  dashboard: 'Dashboard',
  students: 'Students',
  teachers: 'Teachers',
  classes: 'Classes',
  courses: 'Courses',
  'face-recognition': 'Face Registry',
  detection: 'Live Detection',
  attendance: 'Attendance',
  sessions: 'Sessions',
  reports: 'Reports',
  notifications: 'Notifications',
  settings: 'Settings',
}
