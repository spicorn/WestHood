import { useMemo, useState } from 'react'
import {
  addMonths,
  eachDayOfInterval,
  endOfMonth,
  endOfWeek,
  format,
  isSameDay,
  isSameMonth,
  parseISO,
  startOfMonth,
  startOfWeek,
  subMonths,
} from 'date-fns'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import type { Notice } from '@/data/types'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/card'
import { cn } from '@/lib/utils'

const categoryColor: Record<string, string> = {
  General: 'bg-navy-500',
  Sports: 'bg-forest-500',
  Exams: 'bg-gold-500',
  Holiday: 'bg-sky-500',
  Urgent: 'bg-red-500',
}

export function NoticeCalendar({
  notices,
  onDayClick,
}: {
  notices: Notice[]
  onDayClick?: (date: Date, items: Notice[]) => void
}) {
  const [month, setMonth] = useState(new Date(2026, 6, 1))
  const [selected, setSelected] = useState<Date | null>(new Date(2026, 6, 13))

  const days = useMemo(() => {
    const start = startOfWeek(startOfMonth(month), { weekStartsOn: 1 })
    const end = endOfWeek(endOfMonth(month), { weekStartsOn: 1 })
    return eachDayOfInterval({ start, end })
  }, [month])

  const selectedItems = selected
    ? notices.filter((n) => isSameDay(parseISO(n.date), selected))
    : []

  return (
    <div className="grid gap-4 lg:grid-cols-[1.4fr_1fr]">
      <div className="rounded-lg border bg-card p-4 shadow-soft">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="font-display text-xl font-semibold">{format(month, 'MMMM yyyy')}</h3>
          <div className="flex gap-1">
            <Button variant="outline" size="icon" onClick={() => setMonth((m) => subMonths(m, 1))}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="icon" onClick={() => setMonth((m) => addMonths(m, 1))}>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
        <div className="grid grid-cols-7 gap-1 text-center text-xs font-medium text-muted-foreground mb-2">
          {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((d) => (
            <div key={d} className="py-1">
              {d}
            </div>
          ))}
        </div>
        <div className="grid grid-cols-7 gap-1">
          {days.map((day) => {
            const items = notices.filter((n) => isSameDay(parseISO(n.date), day))
            const isSel = selected && isSameDay(day, selected)
            return (
              <button
                key={day.toISOString()}
                type="button"
                onClick={() => {
                  setSelected(day)
                  onDayClick?.(day, items)
                }}
                className={cn(
                  'min-h-[64px] rounded-md border p-1 text-left transition-colors hover:bg-muted/60',
                  !isSameMonth(day, month) && 'opacity-40',
                  isSel && 'border-gold-500 bg-gold-50 ring-1 ring-gold-400',
                )}
              >
                <span className="text-xs font-medium">{format(day, 'd')}</span>
                <div className="mt-1 flex flex-wrap gap-0.5">
                  {items.slice(0, 3).map((n) => (
                    <span key={n.id} className={cn('h-1.5 w-1.5 rounded-full', categoryColor[n.category] ?? 'bg-gray-400')} />
                  ))}
                </div>
              </button>
            )
          })}
        </div>
      </div>
      <div className="rounded-lg border bg-card p-4 shadow-soft">
        <h4 className="font-display text-lg font-semibold mb-3">
          {selected ? format(selected, 'EEEE, d MMMM') : 'Select a day'}
        </h4>
        {selectedItems.length === 0 ? (
          <p className="text-sm text-muted-foreground">No events or notices on this day.</p>
        ) : (
          <ul className="space-y-3">
            {selectedItems.map((n) => (
              <li key={n.id} className="rounded-md border p-3">
                <div className="flex items-center gap-2 mb-1">
                  <Badge variant="outline">{n.category}</Badge>
                  {n.pinned && <Badge variant="gold">Pinned</Badge>}
                </div>
                <p className="font-medium text-sm">{n.title}</p>
                <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{n.body}</p>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}
