import { useMemo, useState } from 'react'
import { toast } from 'sonner'
import { AlertOctagon, CheckCircle2, Clock3, StickyNote, UserCog } from 'lucide-react'
import { PageHeader } from '@/components/shared/empty-state'
import { Card, CardContent, CardHeader, CardTitle, Badge } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Avatar, Select } from '@/components/ui/tabs'
import { useAppStore } from '@/stores/app-store'
import { DEMO_TODAY } from '@/data/mock-data'
import type { StaffPeriodAttendance } from '@/data/types'
import { formatDate } from '@/lib/utils'

const statusVariant: Record<StaffPeriodAttendance['status'], 'success' | 'warning' | 'danger' | 'secondary' | 'outline'> = {
  pending: 'outline',
  on_time: 'success',
  late: 'warning',
  missed: 'danger',
  substituted: 'secondary',
}

function weekdayIndex(dateStr: string) {
  const jsDay = new Date(`${dateStr}T00:00:00`).getDay()
  return jsDay === 0 ? 6 : jsDay - 1
}

export default function AdminStaffAttendance() {
  const staff = useAppStore((s) => s.staff)
  const classes = useAppStore((s) => s.classes)
  const subjects = useAppStore((s) => s.subjects)
  const timetable = useAppStore((s) => s.timetable)
  const staffAttendance = useAppStore((s) => s.staffAttendance)
  const updateStaffAttendance = useAppStore((s) => s.updateStaffAttendance)

  const [substituteChoice, setSubstituteChoice] = useState<Record<string, string>>({})
  const [noteDrafts, setNoteDrafts] = useState<Record<string, string>>({})

  const todayDay = weekdayIndex(DEMO_TODAY)
  const todaySlots = useMemo(() => timetable.filter((t) => t.day === todayDay), [timetable, todayDay])

  const todayRows = useMemo(
    () =>
      todaySlots
        .map((slot) => ({
          slot,
          record: staffAttendance.find((a) => a.date === DEMO_TODAY && a.slotId === slot.id),
          teacher: staff.find((s) => s.id === slot.teacherId),
        }))
        .filter((r) => r.teacher)
        .sort((a, b) => a.slot.period - b.slot.period),
    [todaySlots, staffAttendance, staff],
  )

  const missedThisWeek = useMemo(
    () =>
      staffAttendance
        .filter((a) => a.status === 'missed')
        .map((a) => ({
          record: a,
          slot: timetable.find((t) => t.id === a.slotId),
          teacher: staff.find((s) => s.id === a.teacherId),
        }))
        .sort((a, b) => b.record.date.localeCompare(a.record.date)),
    [staffAttendance, timetable, staff],
  )

  const missedByTeacher = useMemo(() => {
    const map = new Map<string, number>()
    for (const m of missedThisWeek) {
      if (!m.teacher) continue
      map.set(m.teacher.id, (map.get(m.teacher.id) ?? 0) + 1)
    }
    return Array.from(map.entries())
      .map(([teacherId, count]) => ({ teacher: staff.find((s) => s.id === teacherId), count }))
      .sort((a, b) => b.count - a.count)
  }, [missedThisWeek, staff])

  const freeTeachersFor = (day: number, period: number, excludeTeacherId: string) => {
    const busy = new Set(timetable.filter((t) => t.day === day && t.period === period).map((t) => t.teacherId))
    return staff.filter((s) => s.status === 'active' && s.id !== excludeTeacherId && !busy.has(s.id))
  }

  const assignSubstitute = (record: StaffPeriodAttendance) => {
    const subId = substituteChoice[record.id]
    if (!subId) {
      toast.error('Choose a substitute teacher first.')
      return
    }
    const subName = staff.find((s) => s.id === subId)?.name
    updateStaffAttendance(record.id, {
      status: 'substituted',
      substituteTeacherId: subId,
      note: record.note ? `${record.note} — substituted by ${subName}` : `Substituted by ${subName}`,
    })
    toast.success(`${subName} assigned as substitute.`)
  }

  const saveNote = (record: StaffPeriodAttendance) => {
    const note = noteDrafts[record.id]
    if (note === undefined) return
    updateStaffAttendance(record.id, { note })
    toast.success('Note saved.')
  }

  return (
    <div>
      <PageHeader
        title="Staff Attendance"
        description={`Period-by-period teacher check-in for ${formatDate(DEMO_TODAY, 'EEEE, d MMMM yyyy')}.`}
      />

      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Today&rsquo;s Periods</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {todayRows.map(({ slot, record, teacher }) => {
              const isMissed = record?.status === 'missed'
              const free = isMissed ? freeTeachersFor(slot.day, slot.period, slot.teacherId) : []
              return (
                <div key={slot.id} className="rounded-md border p-3">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <Avatar name={teacher?.name ?? ''} size="sm" />
                      <div>
                        <p className="text-sm font-medium">{teacher?.name}</p>
                        <p className="text-xs text-muted-foreground">
                          Period {slot.period} · {slot.startTime}–{slot.endTime} ·{' '}
                          {subjects.find((s) => s.id === slot.subjectId)?.name} ·{' '}
                          {classes.find((c) => c.id === slot.classId)?.name} · Room {slot.room}
                        </p>
                      </div>
                    </div>
                    <Badge variant={statusVariant[record?.status ?? 'pending']}>{record?.status ?? 'pending'}</Badge>
                  </div>

                  <div className="mt-2 flex items-center gap-2">
                    <StickyNote className="h-3.5 w-3.5 text-muted-foreground" />
                    <Input
                      className="h-8 text-xs"
                      placeholder="Add a note…"
                      defaultValue={record?.note ?? ''}
                      onChange={(e) => setNoteDrafts((prev) => ({ ...prev, [record?.id ?? slot.id]: e.target.value }))}
                    />
                    {record && (
                      <Button size="sm" variant="outline" onClick={() => saveNote(record)}>
                        Save
                      </Button>
                    )}
                  </div>

                  {isMissed && record && (
                    <div className="mt-3 rounded-md border border-gold-300 bg-gold-50/60 p-2.5">
                      <p className="mb-1.5 flex items-center gap-1.5 text-xs font-semibold text-gold-800">
                        <UserCog className="h-3.5 w-3.5" /> Substitute suggestion — free teachers this period
                      </p>
                      {free.length === 0 ? (
                        <p className="text-xs text-muted-foreground">No teachers are free this period.</p>
                      ) : (
                        <div className="flex flex-wrap items-center gap-2">
                          <Select
                            className="h-8 w-52 text-xs"
                            value={substituteChoice[record.id] ?? ''}
                            onChange={(e) => setSubstituteChoice((prev) => ({ ...prev, [record.id]: e.target.value }))}
                          >
                            <option value="">Select a free teacher…</option>
                            {free.map((t) => (
                              <option key={t.id} value={t.id}>
                                {t.name}
                              </option>
                            ))}
                          </Select>
                          <Button size="sm" onClick={() => assignSubstitute(record)}>
                            <CheckCircle2 className="h-3.5 w-3.5" /> Assign substitute
                          </Button>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )
            })}
          </CardContent>
        </Card>

        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-red-700">
                <AlertOctagon className="h-5 w-5" /> Missed Periods This Week
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {missedByTeacher.length === 0 ? (
                <p className="text-sm text-muted-foreground">No missed periods recorded.</p>
              ) : (
                missedByTeacher.map(({ teacher, count }) => (
                  <div key={teacher?.id} className="flex items-center justify-between rounded-md border px-3 py-2 text-sm">
                    <span className="font-medium">{teacher?.name}</span>
                    <Badge variant="danger">{count} missed</Badge>
                  </div>
                ))
              )}
              <div className="mt-2 space-y-1.5 border-t pt-2">
                {missedThisWeek.slice(0, 6).map((m) => (
                  <div key={m.record.id} className="flex items-center justify-between text-xs text-muted-foreground">
                    <span>
                      {m.teacher?.name} · {formatDate(m.record.date, 'EEE d MMM')}
                    </span>
                    <span>{m.slot ? `Period ${m.slot.period}` : ''}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock3 className="h-4 w-4" /> Today at a Glance
              </CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-2 gap-3 text-center">
              <div className="rounded-md border p-3">
                <p className="font-display text-2xl font-semibold text-forest-700">
                  {todayRows.filter((r) => r.record && ['on_time', 'late', 'substituted'].includes(r.record.status)).length}
                </p>
                <p className="text-xs text-muted-foreground">Checked in</p>
              </div>
              <div className="rounded-md border p-3">
                <p className="font-display text-2xl font-semibold text-red-700">
                  {todayRows.filter((r) => r.record?.status === 'missed').length}
                </p>
                <p className="text-xs text-muted-foreground">Missed</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
