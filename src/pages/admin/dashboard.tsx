import { useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import {
  AlertTriangle,
  Banknote,
  CalendarClock,
  ChevronRight,
  ClipboardCheck,
  Mail,
  Pin,
  TrendingDown,
  UserCheck,
  UserX,
  Users,
  UserSquare2,
} from 'lucide-react'
import { PageHeader, StatCard } from '@/components/shared/empty-state'
import { EscalationBadge } from '@/components/shared/leadership-badge'
import { Card, CardContent, CardHeader, CardTitle, Badge } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Avatar } from '@/components/ui/tabs'
import { useAppStore } from '@/stores/app-store'
import { DEMO_TODAY, exams, studentFullName } from '@/data/mock-data'
import { formatDate } from '@/lib/utils'
import { predictStudentSubjects } from '@/lib/results-prediction'

function weekdayIndex(dateStr: string) {
  // 0 = Monday .. 4 = Friday, matching TimetableSlot.day convention
  const jsDay = new Date(`${dateStr}T00:00:00`).getDay() // 0 Sun .. 6 Sat
  return jsDay === 0 ? 6 : jsDay - 1
}

export default function AdminDashboard() {
  const navigate = useNavigate()
  const students = useAppStore((s) => s.students)
  const staff = useAppStore((s) => s.staff)
  const classes = useAppStore((s) => s.classes)
  const subjects = useAppStore((s) => s.subjects)
  const grades = useAppStore((s) => s.grades)
  const homework = useAppStore((s) => s.homework)
  const invoices = useAppStore((s) => s.invoices)
  const timetable = useAppStore((s) => s.timetable)
  const staffAttendance = useAppStore((s) => s.staffAttendance)
  const studentAttendance = useAppStore((s) => s.studentAttendance)
  const notices = useAppStore((s) => s.notices)
  const parentInvites = useAppStore((s) => s.parentInvites)
  const currentTerm = useAppStore((s) => s.settings.currentTerm)

  const activeStudents = useMemo(() => students.filter((s) => s.status === 'active'), [students])
  const activeStaff = useMemo(() => staff.filter((s) => s.status === 'active'), [staff])

  const feesCollectedPct = useMemo(() => {
    const total = invoices.reduce((sum, inv) => sum + inv.amount, 0)
    const paid = invoices.reduce((sum, inv) => sum + inv.paid, 0)
    return total === 0 ? 0 : Math.round((paid / total) * 100)
  }, [invoices])

  const attendanceToday = useMemo(() => {
    const todays = studentAttendance.filter((a) => a.date === DEMO_TODAY)
    if (todays.length === 0) return null
    const present = todays.filter((a) => a.status !== 'absent').length
    return Math.round((present / todays.length) * 100)
  }, [studentAttendance])

  const pendingInvites = useMemo(() => parentInvites.filter((i) => i.status === 'pending').length, [parentInvites])

  const enrollmentByClass = useMemo(
    () =>
      classes.map((c) => ({
        name: c.name,
        students: activeStudents.filter((s) => s.classId === c.id).length,
        color: c.color,
      })),
    [classes, activeStudents],
  )

  const feeCollectionTrend = useMemo(() => {
    const totalDue = invoices.reduce((sum, inv) => sum + inv.amount, 0)
    const totalPaid = invoices.reduce((sum, inv) => sum + inv.paid, 0)
    const weeks = 6
    const weights = [0.08, 0.2, 0.38, 0.58, 0.8, 1]
    return Array.from({ length: weeks }, (_, i) => ({
      week: `Wk ${i + 1}`,
      collected: Math.round(totalPaid * weights[i]),
      expected: Math.round(totalDue * ((i + 1) / weeks)),
    }))
  }, [invoices])

  const attendanceTrend = useMemo(() => {
    const dates = Array.from(new Set(studentAttendance.map((a) => a.date))).sort()
    return dates.map((date) => {
      const records = studentAttendance.filter((a) => a.date === date)
      const present = records.filter((a) => a.status !== 'absent').length
      return {
        date: formatDate(date, 'dd MMM'),
        rate: records.length ? Math.round((present / records.length) * 100) : 0,
      }
    })
  }, [studentAttendance])

  const upcomingNotices = useMemo(
    () =>
      notices
        .filter((n) => n.date >= DEMO_TODAY)
        .sort((a, b) => (a.pinned === b.pinned ? a.date.localeCompare(b.date) : a.pinned ? -1 : 1))
        .slice(0, 5),
    [notices],
  )

  const todayStaffStatus = useMemo(() => {
    const todayDay = weekdayIndex(DEMO_TODAY)
    const slots = timetable.filter((t) => t.day === todayDay)
    const rows = slots
      .map((slot) => {
        const record = staffAttendance.find((a) => a.date === DEMO_TODAY && a.slotId === slot.id)
        const teacher = staff.find((s) => s.id === slot.teacherId)
        return { slot, record, teacher }
      })
      .filter((r) => r.teacher)
    const checkedIn = rows.filter((r) => r.record && r.record.status !== 'missed' && r.record.status !== 'pending')
    const notCheckedIn = rows.filter((r) => !r.record || r.record.status === 'missed' || r.record.status === 'pending')
    return { checkedIn, notCheckedIn }
  }, [timetable, staffAttendance, staff])

  const needsAttention = useMemo(() => {
    return activeStudents
      .map((s) => {
        const flags: string[] = []
        if (s.attendancePct < 80) flags.push(`Attendance ${s.attendancePct}%`)
        if (s.previousAvg - s.currentAvg > 10) flags.push(`Grade dropped ${Math.round(s.previousAvg - s.currentAvg)} pts`)
        const overdue = invoices.some((inv) => inv.studentId === s.id && inv.status === 'overdue')
        if (overdue) flags.push('Overdue fees')
        if (s.disciplineEscalated) flags.push('Flagged for follow-up')
        // Projected decline from results-prediction (trend-based, same rules as Predictions page)
        const classSubjects = subjects.filter((sub) => sub.classIds.includes(s.classId)).slice(0, 5)
        const preds = predictStudentSubjects(s, classSubjects.map((x) => x.id), grades, exams, homework)
        const declining = preds.filter((p) => p.trend === 'declining')
        if (declining.length >= 2) flags.push(`Projected decline in ${declining.length} subjects`)
        return { student: s, flags }
      })
      .filter((r) => r.flags.length >= 2 || r.student.disciplineEscalated)
      .sort((a, b) => b.flags.length - a.flags.length)
  }, [activeStudents, invoices, subjects, grades, homework])

  return (
    <div>
      <PageHeader
        title="Admin Dashboard"
        description={`Overview for ${formatDate(DEMO_TODAY, 'EEEE, d MMMM yyyy')}`}
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        <StatCard label="Total Students" value={activeStudents.length} icon={Users} hint={`${students.length - activeStudents.length} archived`} />
        <StatCard label="Total Staff" value={activeStaff.length} icon={UserSquare2} accent="bg-forest-50 text-forest-700" />
        <StatCard
          label="Fees Collected"
          value={`${feesCollectedPct}%`}
          icon={Banknote}
          accent="bg-gold-50 text-gold-800"
          hint="This term"
        />
        <StatCard
          label="Attendance Today"
          value={attendanceToday === null ? '—' : `${attendanceToday}%`}
          icon={ClipboardCheck}
          accent="bg-sky-50 text-sky-700"
        />
        <StatCard
          label="Pending Invites"
          value={pendingInvites}
          icon={Mail}
          accent="bg-navy-50 text-navy-700"
          hint="Awaiting parent acceptance"
        />
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Enrollment by Class</CardTitle>
          </CardHeader>
          <CardContent className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={enrollmentByClass} margin={{ left: -20 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(213 20% 90%)" />
                <XAxis dataKey="name" tick={{ fontSize: 11 }} interval={0} angle={-30} textAnchor="end" height={60} />
                <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
                <Tooltip />
                <Bar dataKey="students" radius={[4, 4, 0, 0]} fill="#1e3a5f" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Fee Collection Trend — {currentTerm}</CardTitle>
          </CardHeader>
          <CardContent className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={feeCollectionTrend} margin={{ left: -20 }}>
                <defs>
                  <linearGradient id="collected" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#d4a017" stopOpacity={0.5} />
                    <stop offset="100%" stopColor="#d4a017" stopOpacity={0.03} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(213 20% 90%)" />
                <XAxis dataKey="week" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} tickFormatter={(v) => `$${v / 1000}k`} />
                <Tooltip formatter={(v) => `$${Number(v).toLocaleString()}`} />
                <Area type="monotone" dataKey="expected" stroke="#7e9cbd" fill="none" strokeDasharray="4 3" />
                <Area type="monotone" dataKey="collected" stroke="#c4920f" fill="url(#collected)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Attendance Trend</CardTitle>
          </CardHeader>
          <CardContent className="h-64">
            {attendanceTrend.length === 0 ? (
              <p className="text-sm text-muted-foreground">No attendance records yet.</p>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={attendanceTrend} margin={{ left: -20 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(213 20% 90%)" />
                  <XAxis dataKey="date" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} domain={[0, 100]} />
                  <Tooltip formatter={(v) => `${v}%`} />
                  <Line type="monotone" dataKey="rate" stroke="#2d5a3f" strokeWidth={2} dot={{ r: 3 }} />
                </LineChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Upcoming Notices</CardTitle>
            <Button variant="ghost" size="sm" onClick={() => navigate('/admin/notices')}>
              View all <ChevronRight className="h-3.5 w-3.5" />
            </Button>
          </CardHeader>
          <CardContent className="space-y-3">
            {upcomingNotices.length === 0 ? (
              <p className="text-sm text-muted-foreground">No upcoming notices.</p>
            ) : (
              upcomingNotices.map((n) => (
                <div key={n.id} className="flex items-start gap-3 rounded-md border p-3">
                  <div className="mt-0.5 rounded-md bg-navy-50 p-1.5 text-navy-700">
                    <CalendarClock className="h-4 w-4" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <p className="truncate text-sm font-medium">{n.title}</p>
                      {n.pinned && <Pin className="h-3 w-3 shrink-0 text-gold-500" />}
                    </div>
                    <p className="mt-0.5 line-clamp-1 text-xs text-muted-foreground">{n.body}</p>
                  </div>
                  <div className="shrink-0 text-right">
                    <Badge variant="outline">{n.category}</Badge>
                    <p className="mt-1 text-[11px] text-muted-foreground">{formatDate(n.date)}</p>
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-red-700">
              <AlertTriangle className="h-5 w-5" /> Needs Attention
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {needsAttention.length === 0 ? (
              <p className="text-sm text-muted-foreground">No students currently flagged.</p>
            ) : (
              needsAttention.map(({ student, flags }) => (
                <button
                  key={student.id}
                  type="button"
                  onClick={() => navigate(`/admin/students/${student.id}`)}
                  className="flex w-full items-center gap-3 rounded-md border border-red-100 bg-red-50/60 p-3 text-left transition-colors hover:bg-red-50"
                >
                  <Avatar name={studentFullName(student)} size="sm" />
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="text-sm font-medium text-navy-900">{studentFullName(student)}</p>
                      <EscalationBadge show={student.disciplineEscalated} />
                    </div>
                    <div className="mt-1 flex flex-wrap gap-1">
                      {flags.map((f) => (
                        <Badge key={f} variant="danger">
                          {f}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground" />
                </button>
              ))
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Staff Check-In — Today</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <div className="mb-2 flex items-center gap-2 text-sm font-semibold text-forest-700">
                  <UserCheck className="h-4 w-4" /> In Class ({todayStaffStatus.checkedIn.length})
                </div>
                <ul className="space-y-1.5">
                  {todayStaffStatus.checkedIn.slice(0, 6).map(({ slot, teacher }) => (
                    <li key={slot.id} className="rounded-md border px-2.5 py-1.5 text-xs">
                      <p className="font-medium">{teacher?.name}</p>
                      <p className="text-muted-foreground">Period {slot.period} · Room {slot.room}</p>
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <div className="mb-2 flex items-center gap-2 text-sm font-semibold text-red-700">
                  <UserX className="h-4 w-4" /> Not Checked In ({todayStaffStatus.notCheckedIn.length})
                </div>
                <ul className="space-y-1.5">
                  {todayStaffStatus.notCheckedIn.slice(0, 6).map(({ slot, teacher }) => (
                    <li key={slot.id} className="rounded-md border border-red-100 bg-red-50/50 px-2.5 py-1.5 text-xs">
                      <p className="font-medium">{teacher?.name}</p>
                      <p className="text-muted-foreground">Period {slot.period} · Room {slot.room}</p>
                    </li>
                  ))}
                  {todayStaffStatus.notCheckedIn.length === 0 && (
                    <p className="text-xs text-muted-foreground">Everyone is accounted for.</p>
                  )}
                </ul>
              </div>
            </div>
            <Button variant="outline" size="sm" className="mt-4 w-full" onClick={() => navigate('/admin/staff-attendance')}>
              <TrendingDown className="h-3.5 w-3.5" /> View full staff attendance
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
