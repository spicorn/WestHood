import { useAppStore } from '@/stores/app-store'
import { useAuthStore } from '@/stores/auth-store'
import { parents } from '@/data/mock-data'

/** Demo MVP has a single parent login (Rudo Mutasa). Resolves the signed-in parent/guardian record. */
export function useCurrentParent() {
  const session = useAuthStore((s) => s.session)
  const byName = session ? parents.find((p) => p.name === session.name) : undefined
  return byName ?? parents.find((p) => p.id === 'par-rudo') ?? parents[0]
}

/** The parent's children, as full Student records from the store. */
export function useParentChildren() {
  const parent = useCurrentParent()
  const students = useAppStore((s) => s.students)
  return students.filter((s) => parent.studentIds.includes(s.id))
}

/** The currently switched-to child, defaulting to the first child if nothing is selected. */
export function useSelectedChild() {
  const children = useParentChildren()
  const selectedChildId = useAppStore((s) => s.selectedChildId)
  return children.find((c) => c.id === selectedChildId) ?? children[0]
}
