import { useMemo } from 'react'
import { AbsenceReviewPage } from '@/components/shared/absence-review'
import { useCurrentStaff } from '@/hooks/use-current-staff'
import { useAppStore } from '@/stores/app-store'
import { EmptyState } from '@/components/shared/empty-state'

export default function StaffAbsenceRequestsPage() {
  const { teacher } = useCurrentStaff()
  const students = useAppStore((s) => s.students)

  const studentIds = useMemo(() => {
    if (!teacher) return []
    return students.filter((s) => teacher.classIds.includes(s.classId)).map((s) => s.id)
  }, [teacher, students])

  if (!teacher) {
    return (
      <EmptyState
        title="Staff profile not found"
        description="Your account is not linked to a teaching staff record."
      />
    )
  }

  return (
    <AbsenceReviewPage
      title="Absence Requests"
      description={`Absence notes for students in your classes (${teacher.classIds.length} class${teacher.classIds.length === 1 ? '' : 'es'}).`}
      studentIds={studentIds}
    />
  )
}
