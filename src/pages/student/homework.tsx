import { useMemo } from 'react'
import { BookOpenCheck } from 'lucide-react'
import { useAppStore } from '@/stores/app-store'
import { useCurrentStudent } from '@/hooks/use-current-student'
import { PageHeader, EmptyState } from '@/components/shared/empty-state'
import { DataTable, type Column } from '@/components/shared/data-table'
import { Badge } from '@/components/ui/card'
import { formatDate } from '@/lib/utils'
import type { Homework, HomeworkStatus } from '@/data/types'

const statusVariant: Record<HomeworkStatus, 'outline' | 'success' | 'warning' | 'danger'> = {
  assigned: 'outline',
  submitted: 'success',
  late: 'warning',
  missing: 'danger',
}

interface HomeworkRow extends Homework {
  myStatus: HomeworkStatus
}

export default function StudentHomeworkPage() {
  const student = useCurrentStudent()
  const homework = useAppStore((s) => s.homework)
  const subjects = useAppStore((s) => s.subjects)

  const rows: HomeworkRow[] = useMemo(
    () =>
      homework
        .filter((h) => h.classId === student.classId)
        .map((h) => ({ ...h, myStatus: h.submissions.find((s) => s.studentId === student.id)?.status ?? 'assigned' }))
        .sort((a, b) => b.dueDate.localeCompare(a.dueDate)),
    [homework, student.classId, student.id],
  )

  const columns: Column<HomeworkRow>[] = [
    { key: 'title', header: 'Homework', render: (r) => <span className="font-medium">{r.title}</span> },
    { key: 'subject', header: 'Subject', render: (r) => subjects.find((s) => s.id === r.subjectId)?.name ?? r.subjectId },
    { key: 'dueDate', header: 'Due Date', sortable: true, render: (r) => formatDate(r.dueDate) },
    { key: 'status', header: 'Status', render: (r) => <Badge variant={statusVariant[r.myStatus]}>{r.myStatus}</Badge> },
  ]

  return (
    <div>
      <PageHeader title="Homework" description="Assignments for your class and your submission status." />
      {rows.length === 0 ? (
        <EmptyState icon={BookOpenCheck} title="No homework" description="No homework has been assigned to your class yet." />
      ) : (
        <DataTable data={rows} columns={columns} searchKeys={['title']} searchPlaceholder="Search homework…" />
      )}
    </div>
  )
}
