import { useMemo, useState } from 'react'
import { useAppStore } from '@/stores/app-store'
import { useCurrentStudent } from '@/hooks/use-current-student'
import { PageHeader } from '@/components/shared/empty-state'
import { NoticeCalendar } from '@/components/shared/notice-calendar'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

type FilterKey = 'all' | 'students'

const filters: { key: FilterKey; label: string }[] = [
  { key: 'all', label: 'All' },
  { key: 'students', label: 'Students' },
]

export default function StudentNoticesPage() {
  const student = useCurrentStudent()
  const notices = useAppStore((s) => s.notices)
  const [filter, setFilter] = useState<FilterKey>('all')

  const relevant = useMemo(
    () => notices.filter((n) => n.audience === 'All' || n.audience === 'Students' || n.audience === student.classId),
    [notices, student.classId],
  )

  const filtered = useMemo(() => {
    if (filter === 'students') return relevant.filter((n) => n.audience === 'Students' || n.audience === student.classId)
    return relevant
  }, [relevant, filter, student.classId])

  return (
    <div>
      <PageHeader title="Notices & Calendar" description="School notices addressed to all students." />
      <div className="mb-4 flex gap-2">
        {filters.map((f) => (
          <Button
            key={f.key}
            size="sm"
            variant={filter === f.key ? 'default' : 'outline'}
            className={cn(filter === f.key && 'shadow-sm')}
            onClick={() => setFilter(f.key)}
          >
            {f.label}
          </Button>
        ))}
      </div>
      <NoticeCalendar notices={filtered} />
    </div>
  )
}
