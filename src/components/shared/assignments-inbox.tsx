import { useMemo, useState, type ReactNode } from 'react'
import { BookOpenCheck, FileText } from 'lucide-react'
import { useAppStore } from '@/stores/app-store'
import { PageHeader, EmptyState } from '@/components/shared/empty-state'
import { DataTable, type Column } from '@/components/shared/data-table'
import { Badge } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { buildStudentAssignments, type UnifiedAssignment } from '@/lib/assignments'
import { formatDate, cn } from '@/lib/utils'
import type { Student } from '@/data/types'

type TabKey = 'all' | 'homework' | 'materials' | 'missing'

const statusVariant: Record<string, 'outline' | 'success' | 'warning' | 'danger' | 'secondary'> = {
  assigned: 'outline',
  submitted: 'success',
  late: 'warning',
  missing: 'danger',
  available: 'secondary',
}

interface AssignmentsInboxProps {
  student: Student
  title: string
  description: string
  /** Parent view is read-only with stronger missing/overdue highlight */
  highlightMissing?: boolean
  headerExtra?: ReactNode
}

export function AssignmentsInbox({
  student,
  title,
  description,
  highlightMissing = false,
  headerExtra,
}: AssignmentsInboxProps) {
  const homework = useAppStore((s) => s.homework)
  const studyMaterials = useAppStore((s) => s.studyMaterials)
  const subjects = useAppStore((s) => s.subjects)
  const [tab, setTab] = useState<TabKey>('all')

  const all = useMemo(
    () =>
      buildStudentAssignments(
        student.id,
        student.classId,
        homework,
        studyMaterials,
        subjects,
      ),
    [student.id, student.classId, homework, studyMaterials, subjects],
  )

  const filtered = useMemo(() => {
    if (tab === 'homework') return all.filter((a) => a.kind === 'homework')
    if (tab === 'materials') return all.filter((a) => a.kind === 'material')
    if (tab === 'missing') return all.filter((a) => a.status === 'missing' || a.overdue)
    return all
  }, [all, tab])

  const missingCount = all.filter((a) => a.status === 'missing' || a.overdue).length

  const columns: Column<UnifiedAssignment>[] = [
    {
      key: 'title',
      header: 'Assignment',
      render: (r) => (
        <div className="flex items-start gap-2">
          {r.kind === 'homework' ? (
            <BookOpenCheck className="mt-0.5 h-4 w-4 shrink-0 text-navy-600" />
          ) : (
            <FileText className="mt-0.5 h-4 w-4 shrink-0 text-forest-600" />
          )}
          <div>
            <p className="font-medium">{r.title}</p>
            {r.meta && <p className="text-xs text-muted-foreground line-clamp-1">{r.meta}</p>}
          </div>
        </div>
      ),
    },
    { key: 'subject', header: 'Subject', render: (r) => r.subjectName },
    {
      key: 'kind',
      header: 'Type',
      render: (r) => (
        <Badge variant="outline">{r.kind === 'homework' ? 'Homework' : 'Material'}</Badge>
      ),
    },
    {
      key: 'dueDate',
      header: 'Due / Date',
      sortable: true,
      render: (r) => (r.dueDate ? formatDate(r.dueDate) : formatDate(r.createdAt)),
    },
    {
      key: 'status',
      header: 'Status',
      render: (r) => (
        <Badge variant={statusVariant[r.status ?? 'assigned'] ?? 'outline'}>
          {r.status ?? 'assigned'}
          {r.overdue && r.status !== 'missing' ? ' · overdue' : ''}
        </Badge>
      ),
    },
  ]

  return (
    <div>
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <PageHeader title={title} description={description} />
        {headerExtra}
      </div>

      <Tabs value={tab} onValueChange={(v) => setTab(v as TabKey)}>
        <TabsList>
          <TabsTrigger value="all">All ({all.length})</TabsTrigger>
          <TabsTrigger value="homework">
            Homework ({all.filter((a) => a.kind === 'homework').length})
          </TabsTrigger>
          <TabsTrigger value="materials">
            Materials ({all.filter((a) => a.kind === 'material').length})
          </TabsTrigger>
          <TabsTrigger value="missing">Missing ({missingCount})</TabsTrigger>
        </TabsList>
        <TabsContent value={tab}>
          {filtered.length === 0 ? (
            <EmptyState
              icon={BookOpenCheck}
              title="Nothing here"
              description={
                tab === 'missing'
                  ? 'No missing or overdue assignments — well done.'
                  : 'No assignments match this tab.'
              }
            />
          ) : (
            <div
              className={cn(
                highlightMissing && missingCount > 0 && tab === 'missing' && 'rounded-lg ring-1 ring-red-200',
              )}
            >
              <DataTable
                data={filtered}
                columns={columns}
                searchKeys={['title', 'subjectName']}
                searchPlaceholder="Search assignments…"
                rowClassName={(r) =>
                  highlightMissing && (r.status === 'missing' || r.overdue)
                    ? 'bg-red-50/80'
                    : undefined
                }
              />
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}
