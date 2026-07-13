import { useMemo, useState } from 'react'
import { toast } from 'sonner'
import { CalendarClock, ShieldAlert } from 'lucide-react'
import { PageHeader } from '@/components/shared/empty-state'
import { EscalationBadge } from '@/components/shared/leadership-badge'
import { Card, CardContent, CardHeader, CardTitle, Badge } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input, Label, Textarea } from '@/components/ui/input'
import { Select } from '@/components/ui/tabs'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { useAppStore } from '@/stores/app-store'
import { studentFullName } from '@/data/mock-data'
import type { ConsequenceStatus, DisciplineSeverity, MeritRecord } from '@/data/types'
import { formatDate } from '@/lib/utils'

const SEVERITY_VARIANT: Record<DisciplineSeverity, 'warning' | 'danger' | 'secondary'> = {
  minor: 'warning',
  major: 'danger',
  serious: 'danger',
}

type ScopeFilter = { studentIds?: string[]; title?: string; description?: string }

function DisciplinePage({ scope }: { scope?: ScopeFilter }) {
  const students = useAppStore((s) => s.students)
  const classes = useAppStore((s) => s.classes)
  const meritRecords = useAppStore((s) => s.meritRecords)
  const detentionRecords = useAppStore((s) => s.detentionRecords)
  const upsertDetention = useAppStore((s) => s.upsertDetention)
  const updateDetentionStatus = useAppStore((s) => s.updateDetentionStatus)

  const [severity, setSeverity] = useState<DisciplineSeverity | 'all'>('all')
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')

  const [detentionOpen, setDetentionOpen] = useState(false)
  const [detentionMerit, setDetentionMerit] = useState<MeritRecord | null>(null)
  const [scheduledAt, setScheduledAt] = useState('2026-07-16T15:30')
  const [location, setLocation] = useState('Library Room B')
  const [detentionNotes, setDetentionNotes] = useState('')

  const disciplineEntries = useMemo(() => {
    return meritRecords
      .filter((m) => m.type === 'demerit' || !!m.severity)
      .filter((m) => !scope?.studentIds || scope.studentIds.includes(m.studentId))
      .filter((m) => (severity === 'all' ? true : m.severity === severity))
      .filter((m) => (!dateFrom || m.date >= dateFrom) && (!dateTo || m.date <= dateTo))
      .sort((a, b) => b.date.localeCompare(a.date))
  }, [meritRecords, scope, severity, dateFrom, dateTo])

  const detentions = useMemo(() => {
    return detentionRecords
      .filter((d) => !scope?.studentIds || scope.studentIds.includes(d.studentId))
      .sort((a, b) => b.scheduledAt.localeCompare(a.scheduledAt))
  }, [detentionRecords, scope])

  const openDetention = (m: MeritRecord) => {
    setDetentionMerit(m)
    setScheduledAt('2026-07-16T15:30')
    setLocation('Library Room B')
    setDetentionNotes('')
    setDetentionOpen(true)
  }

  const assignDetention = () => {
    if (!detentionMerit) return
    if (!scheduledAt || !location.trim()) {
      toast.error('Schedule time and location are required.')
      return
    }
    upsertDetention({
      id: `det-${Date.now()}`,
      studentId: detentionMerit.studentId,
      meritId: detentionMerit.id,
      scheduledAt: scheduledAt.length === 16 ? `${scheduledAt}:00` : scheduledAt,
      location: location.trim(),
      status: 'scheduled',
      assignedBy: 'u-admin',
      notes: detentionNotes.trim() || undefined,
    })
    toast.success('Detention scheduled.')
    setDetentionOpen(false)
  }

  const setStatus = (id: string, status: ConsequenceStatus) => {
    updateDetentionStatus(id, status)
    toast.success(`Detention marked ${status}.`)
  }

  return (
    <div>
      <PageHeader
        title={scope?.title ?? 'Discipline'}
        description={
          scope?.description ??
          'School-wide conduct follow-up. Entries are flagged constructively for pastoral support.'
        }
      />

      <div className="mb-4 grid gap-3 sm:grid-cols-3">
        <div className="space-y-1.5">
          <Label>Severity</Label>
          <Select value={severity} onChange={(e) => setSeverity(e.target.value as DisciplineSeverity | 'all')}>
            <option value="all">All severities</option>
            <option value="minor">Minor</option>
            <option value="major">Major</option>
            <option value="serious">Serious</option>
          </Select>
        </div>
        <div className="space-y-1.5">
          <Label>From date</Label>
          <Input type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} />
        </div>
        <div className="space-y-1.5">
          <Label>To date</Label>
          <Input type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)} />
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ShieldAlert className="h-4 w-4 text-navy-700" /> Flagged for follow-up
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto rounded-lg border">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b bg-muted/50 text-left">
                    <th className="px-3 py-2 font-semibold text-muted-foreground">Student</th>
                    <th className="px-3 py-2 font-semibold text-muted-foreground">Reason</th>
                    <th className="px-3 py-2 font-semibold text-muted-foreground">Severity</th>
                    <th className="px-3 py-2 font-semibold text-muted-foreground">Date</th>
                    <th className="px-3 py-2" />
                  </tr>
                </thead>
                <tbody>
                  {disciplineEntries.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="px-3 py-8 text-center text-muted-foreground">
                        No discipline entries match these filters.
                      </td>
                    </tr>
                  ) : (
                    disciplineEntries.map((m) => {
                      const student = students.find((s) => s.id === m.studentId)
                      return (
                        <tr key={m.id} className="border-b last:border-0">
                          <td className="px-3 py-2">
                            <div className="space-y-1">
                              <p className="font-medium">{student ? studentFullName(student) : m.studentId}</p>
                              <p className="text-xs text-muted-foreground">
                                {classes.find((c) => c.id === student?.classId)?.name}
                              </p>
                              <EscalationBadge show={m.escalated || student?.disciplineEscalated} />
                            </div>
                          </td>
                          <td className="px-3 py-2">{m.reason}</td>
                          <td className="px-3 py-2">
                            {m.severity ? (
                              <Badge variant={SEVERITY_VARIANT[m.severity]} className="capitalize">
                                {m.severity}
                              </Badge>
                            ) : (
                              <Badge variant="outline">Demerit</Badge>
                            )}
                          </td>
                          <td className="px-3 py-2 text-muted-foreground">{formatDate(m.date)}</td>
                          <td className="px-3 py-2 text-right">
                            <Button size="sm" variant="outline" onClick={() => openDetention(m)}>
                              Assign detention
                            </Button>
                          </td>
                        </tr>
                      )
                    })
                  )}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CalendarClock className="h-4 w-4" /> Detentions
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {detentions.length === 0 ? (
              <p className="text-sm text-muted-foreground">No detentions recorded.</p>
            ) : (
              detentions.map((d) => {
                const student = students.find((s) => s.id === d.studentId)
                return (
                  <div key={d.id} className="rounded-md border p-3 text-sm">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div>
                        <p className="font-medium">{student ? studentFullName(student) : d.studentId}</p>
                        <p className="text-xs text-muted-foreground">
                          {d.scheduledAt.slice(0, 16).replace('T', ' ')} · {d.location}
                        </p>
                        {d.notes && <p className="mt-1 text-xs text-muted-foreground">{d.notes}</p>}
                      </div>
                      <div className="flex flex-wrap items-center gap-2">
                        <Badge
                          variant={
                            d.status === 'completed' ? 'success' : d.status === 'missed' ? 'danger' : 'warning'
                          }
                          className="capitalize"
                        >
                          {d.status}
                        </Badge>
                        {d.status === 'scheduled' && (
                          <>
                            <Button size="sm" variant="outline" onClick={() => setStatus(d.id, 'completed')}>
                              Completed
                            </Button>
                            <Button size="sm" variant="ghost" onClick={() => setStatus(d.id, 'missed')}>
                              Missed
                            </Button>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                )
              })
            )}
          </CardContent>
        </Card>
      </div>

      <Dialog open={detentionOpen} onOpenChange={setDetentionOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Assign detention</DialogTitle>
            <DialogDescription>
              Schedule constructive follow-up for{' '}
              {detentionMerit
                ? (() => {
                    const st = students.find((s) => s.id === detentionMerit.studentId)
                    return st ? studentFullName(st) : 'student'
                  })()
                : 'student'}
              .
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-1.5">
              <Label>Scheduled at</Label>
              <Input type="datetime-local" value={scheduledAt} onChange={(e) => setScheduledAt(e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label>Location</Label>
              <Input value={location} onChange={(e) => setLocation(e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label>Notes</Label>
              <Textarea rows={3} value={detentionNotes} onChange={(e) => setDetentionNotes(e.target.value)} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDetentionOpen(false)}>
              Cancel
            </Button>
            <Button onClick={assignDetention}>Schedule</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default function AdminDiscipline() {
  return <DisciplinePage />
}

export { DisciplinePage }
