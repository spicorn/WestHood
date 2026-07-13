import { useMemo } from 'react'
import { DisciplinePage } from '@/pages/admin/discipline'
import { useAppStore } from '@/stores/app-store'
import { useCurrentStaff } from '@/hooks/use-current-staff'
import { PageHeader, EmptyState } from '@/components/shared/empty-state'
import { Users } from 'lucide-react'

export default function StaffDiscipline() {
  const { teacher } = useCurrentStaff()
  const students = useAppStore((s) => s.students)

  const studentIds = useMemo(() => {
    if (!teacher) return []
    return students
      .filter((s) => s.status === 'active' && teacher.classIds.includes(s.classId))
      .map((s) => s.id)
  }, [teacher, students])

  if (!teacher) {
    return <PageHeader title="Discipline" description="Loading your staff profile…" />
  }

  if (teacher.classIds.length === 0) {
    return (
      <div>
        <PageHeader title="Discipline" description="Conduct follow-up for your classes." />
        <EmptyState
          icon={Users}
          title="No classes assigned"
          description="You need assigned classes to view student discipline records."
        />
      </div>
    )
  }

  return (
    <DisciplinePage
      scope={{
        studentIds,
        title: 'Discipline',
        description: 'Conduct follow-up for students in your assigned classes.',
      }}
    />
  )
}
