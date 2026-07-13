import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import {
  BookOpen,
  CalendarClock,
  CheckCircle2,
  ChevronRight,
  Clock,
  FileText,
  GraduationCap,
  LogIn,
  LogOut,
  Sparkles,
  Users,
} from 'lucide-react'
import type { PeriodClockStatus, TimetableSlot } from '@/data/types'
import { DEMO_TODAY } from '@/data/mock-data'
import { useAppStore } from '@/stores/app-store'
import { useCurrentStaff } from '@/hooks/use-current-staff'
import { PageHeader, StatCard } from '@/components/shared/empty-state'
import { Card, CardContent, CardHeader, CardTitle, Badge } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/tabs'
import { cn, format, parseISO } from '@/lib/utils'

function slotStart(slot: TimetableSlot) {
  return new Date(`${DEMO_TODAY}T${slot.startTime}:00`)
}

function withinClockWindow(slot: TimetableSlot, now: Date) {
  const diffMin = (now.getTime() - slotStart(slot).getTime()) / 60000
  return diffMin >= -5 && diffMin <= 10
}

const statusMeta: Record<PeriodClockStatus, { label: string; badge: 'success' | 'warning' | 'danger' | 'secondary' | 'outline' }> = {
  pending: { label: 'Pending', badge: 'outline' },
  on_time: { label: 'Clocked In', badge: 'success' },
  late: { label: 'Late Clock-In', badge: 'warning' },
  missed: { label: 'Missed', badge: 'danger' },
  substituted: { label: 'Substituted', badge: 'secondary' },
}

export default function StaffHomePage() {
  const navigate = useNavigate()
  const { session, teacher } = useCurrentStaff()
  const timetable = useAppStore((s) => s.timetable)
  const staffAttendance = useAppStore((s) => s.staffAttendance)
  const classes = useAppStore((s) => s.classes)
  const students = useAppStore((s) => s.students)
  const subjects = useAppStore((s) => s.subjects)
  const homework = useAppStore((s) => s.homework)
  const studyMaterials = useAppStore((s) => s.studyMaterials)
  const addStaffAttendance = useAppStore((s) => s.addStaffAttendance)
  const updateStaffAttendance = useAppStore((s) => s.updateStaffAttendance)

  const [now, setNow] = useState(() => new Date())
  const [forceOpen, setForceOpen] = useState(true)

  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 30000)
    return () => clearInterval(id)
  }, [])

  const todayDayIndex = useMemo(() => {
    const day = parseISO(DEMO_TODAY).getDay()
    return (day + 6) % 7
  }, [])

  const todaySlots = useMemo(() => {
    if (!teacher) return []
    return timetable
      .filter((s) => s.teacherId === teacher.id && s.day === todayDayIndex)
      .sort((a, b) => a.period - b.period)
  }, [timetable, teacher, todayDayIndex])

  if (!teacher) {
    return (
      <PageHeader title="Welcome" description="We couldn't find a staff profile for your account." />
    )
  }

  const myClasses = classes.filter((c) => teacher.classIds.includes(c.id))
  const homeroom = teacher.classTeacherOf ? classes.find((c) => c.id === teacher.classTeacherOf) : undefined

  const myHomework = homework
    .filter((h) => h.assignedBy === teacher.id)
    .map((h) => {
      const missing = h.submissions.filter((s) => s.status === 'missing').length
      const needsReview = h.submissions.filter((s) => s.status === 'submitted' || s.status === 'late').length
      const outstanding = h.submissions.filter((s) => s.status === 'assigned').length
      return { hw: h, missing, needsReview, outstanding }
    })
    .sort((a, b) => a.hw.dueDate.localeCompare(b.hw.dueDate))

  const pendingReviewTotal = myHomework.reduce((sum, x) => sum + x.needsReview, 0)
  const missingTotal = myHomework.reduce((sum, x) => sum + x.missing, 0)

  const myMaterials = studyMaterials.filter((m) => m.uploadedBy === teacher.id).sort((a, b) => b.date.localeCompare(a.date))

  function recordFor(slot: TimetableSlot) {
    return staffAttendance.find((r) => r.teacherId === teacher!.id && r.date === DEMO_TODAY && r.slotId === slot.id)
  }

  function handleClockIn(slot: TimetableSlot) {
    const record = recordFor(slot)
    const lateByMin = (now.getTime() - slotStart(slot).getTime()) / 60000
    const status: PeriodClockStatus = lateByMin > 5 ? 'late' : 'on_time'
    const clockInAt = new Date().toISOString()
    if (record) {
      updateStaffAttendance(record.id, { status, clockInAt })
    } else {
      addStaffAttendance({
        id: `spa-${slot.id}-${Date.now()}`,
        teacherId: teacher!.id,
        date: DEMO_TODAY,
        slotId: slot.id,
        status,
        clockInAt,
      })
    }
    const subject = subjects.find((s) => s.id === slot.subjectId)
    toast.success(`Clocked in — Period ${slot.period} ${subject?.name ?? ''}`, {
      description: status === 'late' ? 'Recorded as a late clock-in.' : 'Recorded on time.',
    })
  }

  function handleClockOut(slot: TimetableSlot) {
    const record = recordFor(slot)
    if (!record) return
    updateStaffAttendance(record.id, { clockOutAt: new Date().toISOString() })
    toast.success(`Clocked out — Period ${slot.period}`)
  }

  return (
    <div>
      <PageHeader
        title={`Welcome back, ${teacher.name.split(' ')[0]}`}
        description={`${format(parseISO(DEMO_TODAY), 'EEEE, d MMMM yyyy')} · ${homeroom ? `Class teacher of ${homeroom.name}` : 'Subject teacher'}`}
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 mb-6">
        <StatCard label="Periods Today" value={todaySlots.length} icon={CalendarClock} accent="bg-navy-50 text-navy-700" />
        <StatCard label="My Classes" value={myClasses.length} icon={Users} accent="bg-forest-100 text-forest-700" />
        <StatCard label="Submissions to Review" value={pendingReviewTotal} icon={FileText} accent="bg-gold-100 text-gold-800" hint={missingTotal > 0 ? `${missingTotal} marked missing` : undefined} />
        <StatCard label="Materials Uploaded" value={myMaterials.length} icon={BookOpen} accent="bg-sky-50 text-sky-700" />
      </div>

      <Card className="mb-6">
        <CardHeader className="flex-row items-center justify-between space-y-0">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-navy-600" /> Today's Timetable
            </CardTitle>
            <p className="text-sm text-muted-foreground mt-1">Tap Clock In within 5 minutes before to 10 minutes after each period starts.</p>
          </div>
          <label className="flex items-center gap-2 text-xs font-medium text-muted-foreground shrink-0">
            <Checkbox checked={forceOpen} onCheckedChange={setForceOpen} id="force-window" />
            <span className="flex items-center gap-1">
              <Sparkles className="h-3.5 w-3.5 text-gold-500" /> Demo: force window open
            </span>
          </label>
        </CardHeader>
        <CardContent>
          {todaySlots.length === 0 ? (
            <p className="text-sm text-muted-foreground py-6 text-center">No periods scheduled for you today.</p>
          ) : (
            <div className="flex gap-3 overflow-x-auto pb-2">
              {todaySlots.map((slot) => {
                const record = recordFor(slot)
                const status = record?.status ?? 'pending'
                const meta = statusMeta[status]
                const subject = subjects.find((s) => s.id === slot.subjectId)
                const cls = classes.find((c) => c.id === slot.classId)
                const canClockIn = status === 'pending' && (forceOpen || withinClockWindow(slot, now))
                const canClockOut = (status === 'on_time' || status === 'late') && record && !record.clockOutAt

                return (
                  <div
                    key={slot.id}
                    className="min-w-[220px] shrink-0 rounded-lg border p-4 shadow-soft"
                    style={{ borderTopColor: cls?.color, borderTopWidth: 3 }}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                        Period {slot.period}
                      </span>
                      <Badge variant={meta.badge}>{meta.label}</Badge>
                    </div>
                    <p className="mt-2 font-display text-lg font-semibold text-navy-900">{subject?.name ?? 'Subject'}</p>
                    <p className="text-sm text-muted-foreground">{cls?.name} · Room {slot.room}</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {slot.startTime} – {slot.endTime}
                    </p>
                    <div className="mt-3 flex gap-2">
                      {canClockIn && (
                        <Button size="sm" className="flex-1 gap-1.5" onClick={() => handleClockIn(slot)}>
                          <LogIn className="h-3.5 w-3.5" /> Clock In
                        </Button>
                      )}
                      {canClockOut && (
                        <Button size="sm" variant="outline" className="flex-1 gap-1.5" onClick={() => handleClockOut(slot)}>
                          <LogOut className="h-3.5 w-3.5" /> Clock Out
                        </Button>
                      )}
                      {!canClockIn && !canClockOut && status === 'pending' && (
                        <p className="text-xs text-muted-foreground italic">Window not open yet</p>
                      )}
                      {record?.clockInAt && (
                        <p className="text-[11px] text-muted-foreground self-center">
                          In {format(new Date(record.clockInAt), 'HH:mm')}
                          {record.clockOutAt ? ` · Out ${format(new Date(record.clockOutAt), 'HH:mm')}` : ''}
                        </p>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </CardContent>
      </Card>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="font-display text-xl font-semibold text-navy-800">My Classes</h2>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            {myClasses.map((c) => {
              const roster = students.filter((s) => s.classId === c.id && s.status === 'active')
              const isHomeroom = c.id === teacher.classTeacherOf
              return (
                <Card key={c.id} className="overflow-hidden">
                  <div style={{ backgroundColor: c.color }} className="h-2 w-full" />
                  <CardContent className="pt-4">
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="font-display text-lg font-semibold text-navy-900">{c.name}</p>
                        <Badge variant="outline" className="mt-1">{c.grade}</Badge>
                      </div>
                      {isHomeroom && <Badge variant="gold">Homeroom</Badge>}
                    </div>
                    <p className="mt-3 text-sm text-muted-foreground flex items-center gap-1.5">
                      <GraduationCap className="h-4 w-4" /> {roster.length} students
                    </p>
                    <Button
                      variant="outline"
                      size="sm"
                      className="mt-3 w-full justify-between"
                      onClick={() => navigate(`/staff/attendance?classId=${c.id}`)}
                    >
                      View Students <ChevronRight className="h-4 w-4" />
                    </Button>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </div>

        <div>
          <h2 className="mb-3 font-display text-xl font-semibold text-navy-800">My Tasks</h2>
          <Card className="mb-4">
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <FileText className="h-4 w-4 text-gold-600" /> Homework to Review
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 pt-0">
              {myHomework.length === 0 ? (
                <p className="text-sm text-muted-foreground">No homework assigned yet.</p>
              ) : (
                myHomework.slice(0, 4).map(({ hw, missing, needsReview, outstanding }) => (
                  <button
                    key={hw.id}
                    type="button"
                    onClick={() => navigate('/staff/homework')}
                    className={cn('w-full rounded-md border p-3 text-left transition-colors hover:bg-muted/50')}
                  >
                    <p className="text-sm font-medium">{hw.title}</p>
                    <p className="text-xs text-muted-foreground">Due {format(parseISO(hw.dueDate), 'd MMM')}</p>
                    <div className="mt-2 flex gap-1.5 flex-wrap">
                      {needsReview > 0 && <Badge variant="gold">{needsReview} to grade</Badge>}
                      {missing > 0 && <Badge variant="danger">{missing} missing</Badge>}
                      {outstanding > 0 && <Badge variant="outline">{outstanding} not marked</Badge>}
                      {needsReview === 0 && missing === 0 && outstanding === 0 && <Badge variant="success">All caught up</Badge>}
                    </div>
                  </button>
                ))
              )}
              <Button variant="outline" size="sm" className="w-full" onClick={() => navigate('/staff/homework')}>
                Manage Homework
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <BookOpen className="h-4 w-4 text-sky-600" /> Study Materials
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 pt-0">
              {myMaterials.length === 0 ? (
                <p className="text-sm text-muted-foreground">Nothing uploaded yet.</p>
              ) : (
                myMaterials.slice(0, 3).map((m) => (
                  <div key={m.id} className="flex items-center justify-between rounded-md border p-2.5 text-sm">
                    <div className="min-w-0">
                      <p className="truncate font-medium">{m.title}</p>
                      <p className="text-xs text-muted-foreground">{m.fileType} · {format(parseISO(m.date), 'd MMM')}</p>
                    </div>
                    <CheckCircle2 className="h-4 w-4 text-forest-500 shrink-0" />
                  </div>
                ))
              )}
              <Button variant="outline" size="sm" className="w-full" onClick={() => navigate('/staff/materials')}>
                Upload New Material
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>

      <p className="mt-6 text-xs text-muted-foreground text-center">Signed in as {session?.name} · {session?.email}</p>
    </div>
  )
}
