import { useMemo, useState } from 'react'
import {
  AlertTriangle,
  Award,
  Bell,
  BookOpenCheck,
  CalendarClock,
  CalendarOff,
  ClipboardCheck,
  ClipboardList,
  Compass,
  Eye,
  GraduationCap,
  type LucideIcon,
  MessageSquare,
  ShieldAlert,
  Users,
  Wallet,
} from 'lucide-react'
import { useAppStore } from '@/stores/app-store'
import { useSelectedChild } from '@/hooks/use-parent'
import { ChildSwitcher } from '@/components/parent/child-switcher'
import { PageHeader, StatCard, EmptyState } from '@/components/shared/empty-state'
import { Card, CardContent, CardHeader, CardTitle, Badge } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { formatCurrency, formatDate, cn } from '@/lib/utils'
import type { ActivityType } from '@/data/types'

type ChipKey = 'all' | ActivityType

const chips: { key: ChipKey; label: string }[] = [
  { key: 'all', label: 'All' },
  { key: 'attendance', label: 'Attendance' },
  { key: 'pickup', label: 'Pickup' },
  { key: 'reading', label: 'Reading' },
  { key: 'homework', label: 'Homework' },
  { key: 'observation', label: 'Observations' },
  { key: 'exam', label: 'Exam Scores' },
  { key: 'discipline', label: 'Discipline' },
  { key: 'detention', label: 'Detention' },
  { key: 'club', label: 'Club' },
  { key: 'guidance', label: 'Guidance' },
]

const typeIcon: Record<ActivityType, LucideIcon> = {
  attendance: ClipboardCheck,
  pickup: Users,
  reading: BookOpenCheck,
  homework: ClipboardList,
  observation: Eye,
  exam: ClipboardList,
  merit: Award,
  alert: AlertTriangle,
  payment: Wallet,
  fee_reminder: Bell,
  discipline: ShieldAlert,
  detention: CalendarClock,
  club: Users,
  guidance: Compass,
  absence: CalendarOff,
  message: MessageSquare,
  admission: GraduationCap,
}

export default function ParentHomePage() {
  const child = useSelectedChild()
  const classes = useAppStore((s) => s.classes)
  const activities = useAppStore((s) => s.activities)
  const invoices = useAppStore((s) => s.invoices)
  const [chip, setChip] = useState<ChipKey>('all')

  const classRoom = child ? classes.find((c) => c.id === child.classId) : undefined

  const childInvoices = useMemo(() => invoices.filter((i) => child && i.studentId === child.id), [invoices, child])
  const balance = childInvoices.reduce((sum, i) => sum + (i.amount - i.paid), 0)

  const feed = useMemo(() => {
    const mine = (child ? activities.filter((a) => a.studentId === child.id) : [])
      .slice()
      .sort((a, b) => (b.date + b.time).localeCompare(a.date + a.time))
    if (chip === 'all') return mine
    return mine.filter((a) => a.type === chip)
  }, [activities, child, chip])

  if (!child) {
    return <EmptyState title="No children linked" description="No students are linked to your account yet. Contact the school office." />
  }

  return (
    <div>
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <PageHeader title="Parent Dashboard" description="A snapshot of your child's day and recent activity." />
        <ChildSwitcher />
      </div>

      <div className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Attendance" value={`${child.attendancePct}%`} icon={ClipboardCheck} accent="bg-navy-50 text-navy-700" hint={classRoom?.name} />
        <StatCard
          label="Current average"
          value={`${child.currentAvg}%`}
          icon={ClipboardList}
          accent="bg-forest-50 text-forest-700"
          hint={child.currentAvg >= child.previousAvg ? `Up from ${child.previousAvg}%` : `Down from ${child.previousAvg}%`}
        />
        <StatCard label="Outstanding fees" value={formatCurrency(balance)} icon={Wallet} accent={balance > 0 ? 'bg-red-50 text-red-700' : 'bg-forest-50 text-forest-700'} />
        <StatCard label="Recent activity" value={activities.filter((a) => a.studentId === child.id).length} icon={Users} accent="bg-gold-50 text-gold-700" hint="Logged entries" />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Activity feed</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="mb-4 flex flex-wrap gap-2">
            {chips.map((c) => (
              <Button
                key={c.key}
                size="sm"
                variant={chip === c.key ? 'default' : 'outline'}
                onClick={() => setChip(c.key)}
              >
                {c.label}
              </Button>
            ))}
          </div>

          {feed.length === 0 ? (
            <EmptyState title="No activity" description="Nothing logged for this filter yet." />
          ) : (
            <ul className="space-y-2.5">
              {feed.map((a) => {
                const Icon = typeIcon[a.type]
                return (
                  <li
                    key={a.id}
                    className={cn(
                      'flex items-start gap-3 rounded-md border p-3',
                      a.flagged && 'border-red-300 bg-red-50',
                    )}
                  >
                    <div className={cn('mt-0.5 rounded-md p-1.5', a.flagged ? 'bg-red-100 text-red-700' : 'bg-navy-50 text-navy-700')}>
                      <Icon className="h-4 w-4" />
                    </div>
                    <div className="flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="text-sm font-medium">{a.title}</p>
                        {a.flagged && (
                          <Badge variant="danger" className="gap-1">
                            <AlertTriangle className="h-3 w-3" /> Needs attention
                          </Badge>
                        )}
                        {a.status && !a.flagged && <Badge variant="outline">{a.status}</Badge>}
                      </div>
                      <p className={cn('mt-0.5 text-sm', a.flagged ? 'text-red-800' : 'text-muted-foreground')}>{a.description}</p>
                      <p className="mt-1 text-xs text-muted-foreground">
                        {formatDate(a.date)} · {a.time}
                      </p>
                    </div>
                  </li>
                )
              })}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
