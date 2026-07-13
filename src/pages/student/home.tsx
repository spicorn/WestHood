import { useMemo } from 'react'
import { Link } from 'react-router-dom'
import { BookOpenCheck, CalendarClock, ClipboardList, GraduationCap, Users } from 'lucide-react'
import { useAppStore } from '@/stores/app-store'
import { useCurrentStudent } from '@/hooks/use-current-student'
import { DEMO_TODAY, exams } from '@/data/mock-data'
import { PageHeader, StatCard, EmptyState } from '@/components/shared/empty-state'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/card'
import { formatDate } from '@/lib/utils'

const DAY_LABELS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday']

export default function StudentHomePage() {
  const student = useCurrentStudent()
  const classes = useAppStore((s) => s.classes)
  const subjects = useAppStore((s) => s.subjects)
  const staff = useAppStore((s) => s.staff)
  const timetable = useAppStore((s) => s.timetable)
  const notices = useAppStore((s) => s.notices)
  const homework = useAppStore((s) => s.homework)
  const clubs = useAppStore((s) => s.clubs)
  const clubMemberships = useAppStore((s) => s.clubMemberships)

  const classRoom = classes.find((c) => c.id === student.classId)

  const todayIndex = useMemo(() => {
    const jsDay = new Date(`${DEMO_TODAY}T00:00:00`).getDay()
    return (jsDay + 6) % 7 // 0=Mon..6=Sun
  }, [])

  const todaysSlots = useMemo(
    () =>
      timetable
        .filter((t) => t.classId === student.classId && t.day === todayIndex)
        .sort((a, b) => a.period - b.period),
    [timetable, student.classId, todayIndex],
  )

  const upcomingExams = useMemo(
    () => exams.filter((e) => e.startDate >= DEMO_TODAY).sort((a, b) => a.startDate.localeCompare(b.startDate)),
    [],
  )

  const pendingHomework = useMemo(
    () =>
      homework.filter((h) => {
        if (h.classId !== student.classId) return false
        const sub = h.submissions.find((s) => s.studentId === student.id)
        return sub && (sub.status === 'assigned' || sub.status === 'missing')
      }),
    [homework, student.classId, student.id],
  )

  const relevantNotices = useMemo(
    () =>
      notices
        .filter((n) => n.audience === 'All' || n.audience === 'Students' || n.audience === student.classId)
        .sort((a, b) => b.date.localeCompare(a.date))
        .slice(0, 4),
    [notices, student.classId],
  )

  const myClubs = useMemo(() => {
    return clubMemberships
      .filter((m) => m.studentId === student.id)
      .map((m) => clubs.find((c) => c.id === m.clubId))
      .filter(Boolean)
  }, [clubMemberships, clubs, student.id])

  const nextFixture = useMemo(() => {
    const names = myClubs.map((c) => c!.name.toLowerCase())
    return notices
      .filter((n) => n.date >= DEMO_TODAY)
      .filter(
        (n) =>
          n.category === 'Sports' ||
          names.some((name) => n.title.toLowerCase().includes(name.split(' ')[0] ?? '')),
      )
      .sort((a, b) => a.date.localeCompare(b.date))[0]
  }, [notices, myClubs])

  return (
    <div>
      <PageHeader
        title={`Welcome back, ${student.firstName}!`}
        description={`${classRoom?.name ?? student.classId} · ${classRoom?.grade ?? ''}`}
      />

      <div className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Attendance" value={`${student.attendancePct}%`} icon={GraduationCap} accent="bg-navy-50 text-navy-700" hint="This term" />
        <StatCard label="Current average" value={`${student.currentAvg}%`} icon={ClipboardList} accent="bg-forest-50 text-forest-700" hint={`Was ${student.previousAvg}% last term`} />
        <StatCard label="Upcoming exams" value={upcomingExams.length} icon={CalendarClock} accent="bg-gold-50 text-gold-700" hint={upcomingExams[0]?.name ?? 'None scheduled'} />
        <StatCard label="Pending homework" value={pendingHomework.length} icon={BookOpenCheck} accent="bg-sky-50 text-sky-700" hint="Assigned or missing" />
      </div>

      <div className="mb-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Users className="h-4 w-4" /> My Clubs
            </CardTitle>
            <Link to="/student/clubs" className="text-sm font-medium text-navy-700 hover:underline">
              Manage →
            </Link>
          </CardHeader>
          <CardContent>
            {myClubs.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                You haven&apos;t joined any clubs yet.{' '}
                <Link to="/student/clubs" className="font-medium text-navy-700 hover:underline">
                  Browse clubs
                </Link>
              </p>
            ) : (
              <div className="flex flex-wrap gap-2">
                {myClubs.map((c) =>
                  c ? (
                    <Badge key={c.id} variant="outline">
                      {c.name}
                    </Badge>
                  ) : null,
                )}
              </div>
            )}
            {nextFixture && (
              <p className="mt-3 text-sm text-muted-foreground">
                Next fixture: <span className="font-medium text-navy-800">{nextFixture.title}</span> ·{' '}
                {formatDate(nextFixture.date)}
              </p>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 lg:grid-cols-[1.4fr_1fr]">
        <Card>
          <CardHeader>
            <CardTitle>Today&apos;s timetable — {DAY_LABELS[todayIndex] ?? 'Weekend'}</CardTitle>
          </CardHeader>
          <CardContent>
            {todaysSlots.length === 0 ? (
              <EmptyState title="No classes today" description="Enjoy your day off — check the full timetable for the week ahead." />
            ) : (
              <ul className="space-y-2">
                {todaysSlots.map((slot) => {
                  const subject = subjects.find((s) => s.id === slot.subjectId)
                  const teacher = staff.find((s) => s.id === slot.teacherId)
                  return (
                    <li key={slot.id} className="flex items-center justify-between rounded-md border px-3 py-2">
                      <div>
                        <p className="text-sm font-medium">{subject?.name ?? 'Subject'}</p>
                        <p className="text-xs text-muted-foreground">{teacher?.name ?? 'TBA'} · Room {slot.room}</p>
                      </div>
                      <Badge variant="outline">
                        {slot.startTime}–{slot.endTime}
                      </Badge>
                    </li>
                  )
                })}
              </ul>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Noticeboard</CardTitle>
          </CardHeader>
          <CardContent>
            {relevantNotices.length === 0 ? (
              <EmptyState title="No notices" description="Nothing new posted yet." />
            ) : (
              <ul className="space-y-3">
                {relevantNotices.map((n) => (
                  <li key={n.id} className="rounded-md border p-3">
                    <div className="mb-1 flex items-center gap-2">
                      <Badge variant="outline">{n.category}</Badge>
                      {n.pinned && <Badge variant="gold">Pinned</Badge>}
                    </div>
                    <p className="text-sm font-medium">{n.title}</p>
                    <p className="mt-0.5 text-xs text-muted-foreground">{formatDate(n.date)}</p>
                  </li>
                ))}
              </ul>
            )}
            <Link to="/student/notices" className="mt-3 inline-block text-sm font-medium text-navy-700 hover:underline">
              View all notices →
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
