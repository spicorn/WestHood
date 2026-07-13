import { Navigate, Outlet } from 'react-router-dom'
import { roleHome, useAuthStore } from '@/stores/auth-store'
import type { Role } from '@/data/types'

export function RequireAuth({ role }: { role?: Role }) {
  const session = useAuthStore((s) => s.session)
  if (!session) return <Navigate to="/login" replace />
  if (role && session.role !== role) return <Navigate to={roleHome(session.role)} replace />
  return <Outlet />
}

export function RedirectHome() {
  const session = useAuthStore((s) => s.session)
  if (!session) return <Navigate to="/login" replace />
  return <Navigate to={roleHome(session.role)} replace />
}
