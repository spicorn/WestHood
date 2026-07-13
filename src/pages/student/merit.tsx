import { useMemo } from 'react'
import { Award, Minus, Plus } from 'lucide-react'
import { useAppStore } from '@/stores/app-store'
import { useCurrentStudent } from '@/hooks/use-current-student'
import { PageHeader, StatCard, EmptyState } from '@/components/shared/empty-state'
import { Badge } from '@/components/ui/card'
import { formatDate, cn } from '@/lib/utils'

export default function StudentMeritPage() {
  const student = useCurrentStudent()
  const meritRecords = useAppStore((s) => s.meritRecords)
  const staff = useAppStore((s) => s.staff)

  const timeline = useMemo(() => {
    const mine = meritRecords.filter((m) => m.studentId === student.id).sort((a, b) => a.date.localeCompare(b.date))
    const withTotals = mine.reduce<Array<(typeof mine)[number] & { runningTotal: number }>>((acc, m) => {
      const previousTotal = acc.length > 0 ? acc[acc.length - 1].runningTotal : 0
      acc.push({ ...m, runningTotal: previousTotal + m.points })
      return acc
    }, [])
    return withTotals.reverse()
  }, [meritRecords, student.id])

  const total = timeline[0]?.runningTotal ?? 0

  return (
    <div>
      <PageHeader title="Merit Record" description="Your merit and demerit history with a running total." />

      <div className="mb-6 grid gap-4 sm:grid-cols-2">
        <StatCard label="Total points" value={total} icon={Award} accent={total >= 0 ? 'bg-forest-50 text-forest-700' : 'bg-red-50 text-red-700'} />
        <StatCard label="Total entries" value={timeline.length} icon={Award} accent="bg-navy-50 text-navy-700" />
      </div>

      {timeline.length === 0 ? (
        <EmptyState icon={Award} title="No merit records" description="Merit and demerit entries will appear here as they're logged." />
      ) : (
        <ol className="relative space-y-4 border-l pl-6">
          {timeline.map((m) => {
            const teacher = staff.find((s) => s.id === m.loggedBy)
            const isMerit = m.type === 'merit'
            return (
              <li key={m.id} className="relative">
                <span
                  className={cn(
                    'absolute -left-[31px] flex h-6 w-6 items-center justify-center rounded-full border-2 border-card',
                    isMerit ? 'bg-forest-500 text-white' : 'bg-red-500 text-white',
                  )}
                >
                  {isMerit ? <Plus className="h-3.5 w-3.5" /> : <Minus className="h-3.5 w-3.5" />}
                </span>
                <div className="rounded-lg border bg-card p-3 shadow-soft">
                  <div className="flex items-center justify-between gap-2">
                    <Badge variant={isMerit ? 'success' : 'danger'}>
                      {isMerit ? '+' : ''}
                      {m.points} {isMerit ? 'Merit' : 'Demerit'}
                    </Badge>
                    <span className="text-xs text-muted-foreground">{formatDate(m.date)}</span>
                  </div>
                  <p className="mt-1.5 text-sm">{m.reason}</p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    Logged by {teacher?.name ?? m.loggedBy} · Running total: {m.runningTotal}
                  </p>
                </div>
              </li>
            )
          })}
        </ol>
      )}
    </div>
  )
}
