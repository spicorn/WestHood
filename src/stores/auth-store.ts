import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { AuthSession, Role } from '@/data/types'
import { demoAccounts } from '@/data/mock-data'

interface AuthState {
  session: AuthSession | null
  login: (identifier: string, password: string) => { ok: true } | { ok: false; error: string }
  logout: () => void
}

function normalizeId(value: string) {
  return value.trim().toLowerCase()
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      session: null,
      login: (identifier, password) => {
        const id = normalizeId(identifier)
        const account = demoAccounts.find(
          (a) => a.username === id || a.email.toLowerCase() === id || a.email.split('@')[0] === id,
        )
        if (!account) return { ok: false, error: 'No account found for that email or username.' }
        if (account.password !== password) return { ok: false, error: 'Incorrect password. Please try again.' }
        set({
          session: {
            userId: account.id,
            role: account.role,
            name: account.name,
            email: account.email,
            avatar: account.avatar,
          },
        })
        return { ok: true }
      },
      logout: () => set({ session: null }),
    }),
    { name: 'westwood-auth' },
  ),
)

export function roleHome(role: Role) {
  return `/${role}`
}

export const roleLabels: Record<Role, string> = {
  admin: 'Administrator',
  staff: 'Staff / Teacher',
  parent: 'Parent',
  student: 'Student',
}

export const roleAccentClass: Record<Role, string> = {
  admin: 'role-accent-admin border-l-navy-600',
  staff: 'role-accent-staff border-l-forest-600',
  parent: 'role-accent-parent border-l-gold-500',
  student: 'role-accent-student border-l-sky-600',
}
