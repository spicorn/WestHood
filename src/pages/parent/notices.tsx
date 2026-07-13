import { useMemo, useState } from 'react'
import { useAppStore } from '@/stores/app-store'
import { useSelectedChild } from '@/hooks/use-parent'
import { PageHeader } from '@/components/shared/empty-state'
import { NoticeCalendar } from '@/components/shared/notice-calendar'
import { Button } from '@/components/ui/button'

type FilterKey = 'all' | 'parents'

const filters: { key: FilterKey; label: string }[] = [
  { key: 'all', label: 'All' },
  { key: 'parents', label: 'Parents' },
]

export default function ParentNoticesPage() {
  const child = useSelectedChild()
  const notices = useAppStore((s) => s.notices)
  const [filter, setFilter] = useState<FilterKey>('all')

  const relevant = useMemo(
    () => notices.filter((n) => n.audience === 'All' || n.audience === 'Parents' || (child && n.audience === child.classId)),
    [notices, child],
  )

  const filtered = useMemo(() => {
    if (filter === 'parents') return relevant.filter((n) => n.audience === 'Parents')
    return relevant
  }, [relevant, filter])

  return (
    <div>
      <PageHeader title="Notices & Calendar" description="School notices addressed to parents and guardians." />
      <div className="mb-4 flex gap-2">
        {filters.map((f) => (
          <Button key={f.key} size="sm" variant={filter === f.key ? 'default' : 'outline'} onClick={() => setFilter(f.key)}>
            {f.label}
          </Button>
        ))}
      </div>
      <NoticeCalendar notices={filtered} />
    </div>
  )
}
