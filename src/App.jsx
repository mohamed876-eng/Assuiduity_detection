import { Navigate, Route, Routes } from 'react-router-dom'
import { AppLayout } from '@/components/layout/AppLayout'
import { ProtectedRoute, PublicOnlyRoute, RoleRoute } from '@/routes/ProtectedRoute'
import { LandingPage } from '@/pages/landing/LandingPage'
import { SignInPage } from '@/pages/auth/SignInPage'
import { SignUpPage } from '@/pages/auth/SignUpPage'
import { ForgotPasswordPage } from '@/pages/auth/ForgotPasswordPage'
import { AboutPage } from '@/pages/about/AboutPage'
import { DashboardPage } from '@/pages/dashboard/DashboardPage'
import { StudentsPage } from '@/pages/students/StudentsPage'
import { StudentDetailPage } from '@/pages/students/StudentDetailPage'
import { TeachersPage } from '@/pages/teachers/TeachersPage'
import { TeacherDetailPage } from '@/pages/teachers/TeacherDetailPage'
import { ClassesPage } from '@/pages/classes/ClassesPage'
import { ClassDetailPage } from '@/pages/classes/ClassDetailPage'
import { CoursesPage } from '@/pages/courses/CoursesPage'
import { FaceRecognitionPage } from '@/pages/detection/FaceRecognitionPage'
import { LiveDetectionPage } from '@/pages/detection/LiveDetectionPage'
import { AttendancePage } from '@/pages/attendance/AttendancePage'
import { SessionsPage } from '@/pages/sessions/SessionsPage'
import { ReportsPage } from '@/pages/reports/ReportsPage'
import { NotificationsPage } from '@/pages/notifications/NotificationsPage'
import { SettingsPage } from '@/pages/settings/SettingsPage'
import { NotFoundPage } from '@/pages/NotFoundPage'

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/about" element={<AboutPage />} />
      <Route
        path="/signin"
        element={
          <PublicOnlyRoute>
            <SignInPage />
          </PublicOnlyRoute>
        }
      />
      <Route
        path="/signup"
        element={
          <PublicOnlyRoute>
            <SignUpPage />
          </PublicOnlyRoute>
        }
      />
      <Route
        path="/forgot-password"
        element={
          <PublicOnlyRoute>
            <ForgotPasswordPage />
          </PublicOnlyRoute>
        }
      />

      <Route element={<ProtectedRoute />}>
        <Route element={<AppLayout />}>
          <Route path="dashboard" element={<DashboardPage />} />
          <Route path="students" element={<StudentsPage />} />
          <Route path="students/:id" element={<StudentDetailPage />} />
          <Route
            path="teachers"
            element={
              <RoleRoute roles={['admin']}>
                <TeachersPage />
              </RoleRoute>
            }
          />
          <Route
            path="teachers/:id"
            element={
              <RoleRoute roles={['admin']}>
                <TeacherDetailPage />
              </RoleRoute>
            }
          />
          <Route path="classes" element={<ClassesPage />} />
          <Route path="classes/:id" element={<ClassDetailPage />} />
          <Route path="courses" element={<CoursesPage />} />
          <Route
            path="face-recognition"
            element={
              <RoleRoute roles={['admin']}>
                <FaceRecognitionPage />
              </RoleRoute>
            }
          />
          <Route path="detection" element={<LiveDetectionPage />} />
          <Route path="attendance" element={<AttendancePage />} />
          <Route path="sessions" element={<SessionsPage />} />
          <Route path="reports" element={<ReportsPage />} />
          <Route path="notifications" element={<NotificationsPage />} />
          <Route path="settings" element={<SettingsPage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Route>
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
