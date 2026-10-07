import { lazy } from 'react'
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { AuthProvider } from './auth/AuthProvider'
import { RequireAuth } from './auth/RequireAuth'
import { AdminLayout } from './components/AdminLayout'
import { LoginPage } from './pages/LoginPage'
import './App.css'

const DashboardPage = lazy(async () => ({
  default: (await import('./pages/DashboardPage')).DashboardPage,
}))
const TeamMembersPage = lazy(async () => ({
  default: (await import('./pages/TeamMembersPage')).TeamMembersPage,
}))
const EventsPage = lazy(async () => ({ default: (await import('./pages/EventsPage')).EventsPage }))
const SettingsPage = lazy(async () => ({
  default: (await import('./pages/SettingsPage')).SettingsPage,
}))

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route element={<RequireAuth />}>
            <Route element={<AdminLayout />}>
              <Route index element={<DashboardPage />} />
              <Route path="team" element={<TeamMembersPage />} />
              <Route path="events" element={<EventsPage />} />
              <Route path="settings" element={<SettingsPage />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Route>
          </Route>
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  )
}
