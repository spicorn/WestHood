import { useEffect, useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { toast } from 'sonner'
import { Check, ClipboardCheck, Clock3, X } from 'lucide-react'
import type { AttendanceStatus } from '@/data/types'
import { DEMO_TODAY, studentFullName } from '@/data/mock-data'
import { useAppStore } from '@/stores/app-store'
import { useCurrentStaff } from '@/hooks/use-current-staff'
import { PageHeader, EmptyState, StatCard } from '@/components/shared/empty-state'
import { Card, CardContent, Badge } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Select, Avatar } from '@/components/ui/tabs'
import { cn, format } from '@/lib/utils'

const cycle: AttendanceStatus[] = ['present', 'late', 'absent']

const statusStyles: Record<AttendanceStatus, string> = {
  present: 'bg-forest-500 border-forest-600 text-white',
  late: 'bg-gold-500 border-gold-600 text-navy-900',
  absent: 'bg-red-500 border-red-600 text-white',
}

const statusIcon: Record<AttendanceStatus, typeof Check> = {
  present: Check,
  late: Clock3,
  absent: X,
}

const statusLabel: Record<AttendanceStatus, string> = {
  present: 'Present',
  late: 'Late',
  absent: 'Absent',
}

export default function StaffAttendancePage() {
  const [params] = useSearchParams()
  const { teacher } = useCurrentStaff()
  const classes = useAppStore((s) => s.classes)
  const students = useAppStore((s) => s.students)
  const studentAttendance = useAppStore((s) => s.studentAttendance)
  const setStudentAttendanceBatch = useAppStore((s) => s.setStudentAttendanceBatch)

  const myClasses = useMemo(() => classes.filter((c) => teacher?.classIds.includes(c.id)), [classes, teacher])
  const queryClassId = params.get('classId')
  const defaultClassId = teacher?.classTeacherOf ?? myClasses[0]?.id ?? ''
  const [classId, setClassId] = useState(queryClassId && myClasses.some((c) => c.id === queryClassId) ? queryClassId : defaultClassId)

  useEffect(() => {
    if (queryClassId && myClasses.some((c) => c.id === queryClassId)) setClassId(queryClassId)
  }, [queryClassId, myClasses])

  const roster = useMemo(
    () => students.filter((s) => s.classId === classId && s.status === 'active').sort((a, b) => a.firstName.localeCompare(b.firstName)),
    [students, classId],
  )

  const existingForToday = useMemo(
    () => studentAttendance.filter((r) => r.classId === classId && r.date === DEMO_TODAY),
    [studentAttendance, classId],
  )

  const [statusMap, setStatusMap] = useState<Record<string, AttendanceStatus>>({})
  const [submitted, setSubmitted] = useState(false)

  useEffect(() => {
    const initial: Record<string, AttendanceStatus> = {}
    for (const s of roster) {
      initial[s.id] = existingForToday.find((r) => r.studentId === s.id)?.status ?? 'present'
    }
    setStatusMap(initial)
    setSubmitted(existingForToday.length > 0)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [classId])

  if (!teacher) return <PageHeader title="Attendance" description="Loading your staff profile…" />

  if (myClasses.length === 0) {
    return (
      <div>
        <PageHeader title="Attendance" description="One-tap attendance register." />
        <EmptyState icon={ClipboardCheck} title="No classes assigned" description="You have no classes assigned yet." />
      </div>
    )
  }

  const selectedClass = classes.find((c) => c.id === classId)
  const counts = {
    present: Object.values(statusMap).filter((v) => v === 'present').length,
    late: Object.values(statusMap).filter((v) => v === 'late').length,
    absent: Object.values(statusMap).filter((v) => v === 'absent').length,
  }

  function cycleStatus(studentId: string) {
    setStatusMap((prev) => {
      const current = prev[studentId] ?? 'present'
      const next = cycle[(cycle.indexOf(current) + 1) % cycle.length]
      return { ...prev, [studentId]: next }
    })
  }

  function handleSubmit() {
    if (!teacher) return
    const records = roster.map((s) => ({
      id: existingForToday.find((r) => r.studentId === s.id)?.id ?? `sa-${classId}-${s.id}-${Date.now()}`,
      studentId: s.id,
      classId,
      date: DEMO_TODAY,
      status: statusMap[s.id] ?? 'present',
      takenBy: teacher.id,
    }))
    setStudentAttendanceBatch(records)
    setSubmitted(true)
    toast.success(`Attendance submitted for ${selectedClass?.name}`, {
      description: `${counts.present} present · ${counts.late} late · ${counts.absent} absent`,
    })
  }

  return (
    <div>
      <PageHeader
        title="Attendance Register"
        description={`One-tap register · ${format(new Date(`${DEMO_TODAY}T00:00:00`), 'EEEE, d MMMM yyyy')}`}
        actions={
          myClasses.length > 1 ? (
            <Select value={classId} onChange={(e) => setClassId(e.target.value)} className="w-48">
              {myClasses.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </Select>
          ) : (
            <Badge variant="outline" className="h-10 items-center px-3 text-sm">{selectedClass?.name}</Badge>
          )
        }
      />

      <div className="grid gap-4 sm:grid-cols-3 mb-6">
        <StatCard label="Present" value={counts.present} accent="bg-forest-100 text-forest-700" />
        <StatCard label="Late" value={counts.late} accent="bg-gold-100 text-gold-800" />
        <StatCard label="Absent" value={counts.absent} accent="bg-red-100 text-red-700" />
      </div>

      <Card>
        <CardContent className="pt-5">
          <div className="mb-4 flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              Tap a student to cycle Present → Late → Absent. {submitted && <span className="text-forest-700 font-medium">Attendance already submitted today — resubmitting will update it.</span>}
            </p>
          </div>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {roster.map((s) => {
              const status = statusMap[s.id] ?? 'present'
              const Icon = statusIcon[status]
              return (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => cycleStatus(s.id)}
                  className={cn(
                    'flex items-center gap-3 rounded-lg border-2 p-4 text-left transition-all active:scale-[0.98]',
                    statusStyles[status],
                  )}
                >
                  <Avatar name={studentFullName(s)} size="md" className="bg-white/25 text-white shrink-0" />
                  <div className="min-w-0 flex-1">
                    <p className="font-medium truncate">{studentFullName(s)}</p>
                    <p className="text-xs opacity-90">{s.admissionNo}</p>
                  </div>
                  <div className="flex items-center gap-1 rounded-full bg-white/20 px-2.5 py-1 text-xs font-semibold shrink-0">
                    <Icon className="h-3.5 w-3.5" /> {statusLabel[status]}
                  </div>
                </button>
              )
            })}
          </div>
          <div className="mt-6 flex justify-end">
            <Button size="lg" className="gap-2" onClick={handleSubmit}>
              <ClipboardCheck className="h-4 w-4" /> Submit Attendance
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
