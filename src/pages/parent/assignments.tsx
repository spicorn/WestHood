import { AssignmentsInbox } from '@/components/shared/assignments-inbox'
import { useSelectedChild } from '@/hooks/use-parent'
import { ChildSwitcher } from '@/components/parent/child-switcher'
import { EmptyState } from '@/components/shared/empty-state'

export default function ParentAssignmentsPage() {
  const child = useSelectedChild()

  if (!child) {
    return <EmptyState title="No children linked" description="No students are linked to your account yet." />
  }

  return (
    <AssignmentsInbox
      student={child}
      title="Assignments"
      description={`Homework and materials for ${child.firstName} — missing or overdue items are highlighted.`}
      highlightMissing
      headerExtra={<ChildSwitcher />}
    />
  )
}
