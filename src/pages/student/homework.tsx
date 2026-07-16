import { AssignmentsInbox } from '@/components/shared/assignments-inbox'
import { useCurrentStudent } from '@/hooks/use-current-student'
import { EmptyState } from '@/components/shared/empty-state'

export default function StudentHomeworkPage() {
  const student = useCurrentStudent()

  if (!student) {
    return <EmptyState title="Student not found" description="Unable to resolve your student record." />
  }

  return (
    <AssignmentsInbox
      student={student}
      title="Assignments"
      description="Homework and study materials for your class — track what is due and what is missing."
    />
  )
}
