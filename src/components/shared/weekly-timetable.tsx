import { useMemo } from 'react'
import { useAppStore } from '@/stores/app-store'
import { cn } from '@/lib/utils'
import { EmptyState } from '@/components/shared/empty-state'
import { CalendarX2 } from 'lucide-react'

const DAY_LABELS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday']

export function WeeklyTimetable({ classId }: { classId: string | undefined }) {
  const timetable = useAppStore((s) => s.timetable)
  const subjects = useAppStore((s) => s.subjects)
  const staff = useAppStore((s) => s.staff)

  const slots = useMemo(() => timetable.filter((t) => t.classId === classId), [timetable, classId])

  const periods = useMemo(() => {
    const map = new Map<number, { period: number; startTime: string; endTime: string }>()
    for (const slot of slots) {
      if (!map.has(slot.period)) map.set(slot.period, { period: slot.period, startTime: slot.startTime, endTime: slot.endTime })
    }
    return Array.from(map.values()).sort((a, b) => a.period - b.period)
  }, [slots])

  if (periods.length === 0) {
    return (
      <EmptyState
        icon={CalendarX2}
        title="No timetable available"
        description="No scheduled periods have been published for this class yet."
      />
    )
  }

  return (
    <div className="overflow-x-auto rounded-lg border bg-card shadow-soft">
      <table className="w-full min-w-[720px] border-collapse text-sm">
        <thead>
          <tr className="border-b bg-muted/50">
            <th className="w-32 px-3 py-3 text-left font-semibold text-muted-foreground">Period</th>
            {DAY_LABELS.map((label) => (
              <th key={label} className="px-3 py-3 text-left font-semibold text-muted-foreground">
                {label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {periods.map((p) => (
            <tr key={p.period} className="border-b last:border-0">
              <td className="px-3 py-3 align-top">
                <p className="font-medium">Period {p.period}</p>
                <p className="text-xs text-muted-foreground">
                  {p.startTime}–{p.endTime}
                </p>
              </td>
              {DAY_LABELS.map((_, dayIdx) => {
                const slot = slots.find((s) => s.day === dayIdx && s.period === p.period)
                if (!slot) {
                  return <td key={dayIdx} className="px-3 py-3 align-top text-muted-foreground/50">—</td>
                }
                const subject = subjects.find((s) => s.id === slot.subjectId)
                const teacher = staff.find((s) => s.id === slot.teacherId)
                return (
                  <td key={dayIdx} className={cn('px-3 py-3 align-top')}>
                    <p className="font-medium text-navy-800">{subject?.name ?? 'Subject'}</p>
                    <p className="text-xs text-muted-foreground">{teacher?.name ?? 'TBA'}</p>
                    <p className="text-xs text-muted-foreground">Room {slot.room}</p>
                  </td>
                )
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
