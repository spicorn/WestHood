import { useMemo } from 'react'
import { useAppStore } from '@/stores/app-store'
import { useAuthStore } from '@/stores/auth-store'

export function useCurrentStaff() {
  const session = useAuthStore((s) => s.session)
  const staff = useAppStore((s) => s.staff)
  const teacher = useMemo(
    () => staff.find((s) => s.userId === session?.userId) ?? staff.find((s) => s.email === session?.email),
    [staff, session],
  )
  return { session, teacher }
}
