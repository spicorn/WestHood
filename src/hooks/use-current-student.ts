import { useAppStore } from '@/stores/app-store'
import { useAuthStore } from '@/stores/auth-store'
import { studentFullName } from '@/data/mock-data'

/** Demo MVP has a single student login (Kelvin Mutasa). Resolves the signed-in student record. */
export function useCurrentStudent() {
  const session = useAuthStore((s) => s.session)
  const students = useAppStore((s) => s.students)
  const byName = session ? students.find((s) => studentFullName(s) === session.name) : undefined
  return byName ?? students.find((s) => s.id === 'stu-kelvin') ?? students[0]
}
