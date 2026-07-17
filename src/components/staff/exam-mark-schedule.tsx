import { Fragment, useEffect, useMemo, useState } from 'react'
import { toast } from 'sonner'
import { Download, Printer, Save, Table2 } from 'lucide-react'
import { exams, getGradeLetter } from '@/data/mock-data'
import { useAppStore } from '@/stores/app-store'
import { useCurrentStaff } from '@/hooks/use-current-staff'
import { EmptyState, StatCard } from '@/components/shared/empty-state'
import { Card, CardContent, CardHeader, CardTitle, Badge } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Select } from '@/components/ui/tabs'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'
import type { Exam, StaffMember, Student, Subject } from '@/data/types'

const gradeColors: Record<string, string> = {
  A: '#2d5a3f',
  B: '#57a373',
  C: '#d4a017',
  D: '#e0bd5a',
  E: '#c4920f',
  U: '#c0392b',
}

const PASS_MARK = 40

type MarkGrid = Record<string, Record<string, string>>

function buildGrid(
  roster: Student[],
  classSubjects: Subject[],
  examId: string,
  grades: { examId: string; studentId: string; subjectId: string; mark: number }[],
): MarkGrid {
  const grid: MarkGrid = {}
  for (const student of roster) {
    grid[student.id] = {}
    for (const subject of classSubjects) {
      const existing = grades.find(
        (g) => g.examId === examId && g.studentId === student.id && g.subjectId === subject.id,
      )
      grid[student.id][subject.id] = existing ? String(existing.mark) : ''
    }
  }
  return grid
}

function parseMark(value: string): number | null {
  if (value.trim() === '') return null
  const n = Number(value)
  if (!Number.isFinite(n) || n < 0 || n > 100) return null
  return Math.round(n * 10) / 10
}

function studentStats(
  studentId: string,
  classSubjects: Subject[],
  grid: MarkGrid,
) {
  const marks = classSubjects
    .map((s) => parseMark(grid[studentId]?.[s.id] ?? ''))
    .filter((m): m is number => m !== null)
  const total = marks.reduce((a, b) => a + b, 0)
  const count = marks.length
  const average = count ? Math.round((total / count) * 10) / 10 : null
  return { total, count, average }
}

function canEditSubject(teacher: StaffMember, classId: string, subjectId: string) {
  if (teacher.classTeacherOf === classId) return true
  return teacher.subjects.includes(subjectId)
}

function exportCsv(
  roster: Student[],
  classSubjects: Subject[],
  grid: MarkGrid,
  exam: Exam,
  className: string,
) {
  const headers = [
    'No.',
    'Surname',
    'First Name',
    ...classSubjects.flatMap((s) => [`${s.name} Mark`, `${s.name} Grade`]),
    'Total',
    'Subjects',
    'Average',
  ]
  const rows = roster.map((student, i) => {
    const stats = studentStats(student.id, classSubjects, grid)
    const subjectCells = classSubjects.flatMap((subject) => {
      const mark = parseMark(grid[student.id]?.[subject.id] ?? '')
      return [
        mark ?? '',
        mark !== null ? getGradeLetter(mark, exam) : '',
      ]
    })
    return [
      i + 1,
      student.lastName,
      student.firstName,
      ...subjectCells,
      stats.count ? stats.total : '',
      stats.count || '',
      stats.average ?? '',
    ]
  })
  const csv = [headers, ...rows]
    .map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(','))
    .join('\n')
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = `${className.replace(/\s+/g, '-')}-${exam.name.replace(/\s+/g, '-')}-mark-schedule.csv`
  link.click()
  URL.revokeObjectURL(url)
}

export function ExamMarkSchedule() {
  const { teacher } = useCurrentStaff()
  const subjects = useAppStore((s) => s.subjects)
  const classes = useAppStore((s) => s.classes)
  const students = useAppStore((s) => s.students)
  const grades = useAppStore((s) => s.grades)
  const staff = useAppStore((s) => s.staff)
  const upsertGrade = useAppStore((s) => s.upsertGrade)
  const settings = useAppStore((s) => s.settings)

  const availableClasses = useMemo(() => {
    if (!teacher) return []
    const ids = new Set<string>()
    if (teacher.classTeacherOf) ids.add(teacher.classTeacherOf)
    teacher.classIds.forEach((id) => ids.add(id))
    return classes.filter((c) => ids.has(c.id))
  }, [teacher, classes])

  const [examId, setExamId] = useState(exams[0]?.id ?? '')
  const [classId, setClassId] = useState(teacher?.classTeacherOf ?? teacher?.classIds[0] ?? '')

  useEffect(() => {
    if (!availableClasses.some((c) => c.id === classId)) {
      setClassId(teacher?.classTeacherOf ?? availableClasses[0]?.id ?? '')
    }
  }, [availableClasses, classId, teacher])

  const exam = exams.find((e) => e.id === examId)
  const classRoom = classes.find((c) => c.id === classId)
  const isClassTeacher = teacher?.classTeacherOf === classId

  const classSubjects = useMemo(
    () =>
      subjects
        .filter((s) => s.classIds.includes(classId) && exam?.subjectIds.includes(s.id))
        .sort((a, b) => a.name.localeCompare(b.name)),
    [subjects, classId, exam],
  )

  const roster = useMemo(
    () =>
      students
        .filter((s) => s.classId === classId && s.status === 'active')
        .sort((a, b) => a.lastName.localeCompare(b.lastName) || a.firstName.localeCompare(b.firstName)),
    [students, classId],
  )

  const [grid, setGrid] = useState<MarkGrid>(() =>
    buildGrid(roster, classSubjects, examId, grades),
  )

  useEffect(() => {
    setGrid(buildGrid(roster, classSubjects, examId, grades))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [examId, classId])

  if (!teacher) return null

  if (availableClasses.length === 0) {
    return (
      <EmptyState
        icon={Table2}
        title="No classes assigned"
        description="You need at least one assigned class to compile a mark schedule."
      />
    )
  }

  const studentAverages = roster
    .map((s) => studentStats(s.id, classSubjects, grid).average)
    .filter((a): a is number => a !== null)

  const passCount = studentAverages.filter((a) => a >= PASS_MARK).length
  const passRate = studentAverages.length
    ? Math.round((passCount / studentAverages.length) * 1000) / 10
    : null
  const classAverage = studentAverages.length
    ? Math.round((studentAverages.reduce((a, b) => a + b, 0) / studentAverages.length) * 10) / 10
    : null

  const filledCells = roster.reduce((acc, s) => {
    for (const sub of classSubjects) {
      if (parseMark(grid[s.id]?.[sub.id] ?? '') !== null) acc++
    }
    return acc
  }, 0)
  const totalCells = roster.length * classSubjects.length

  function updateCell(studentId: string, subjectId: string, value: string) {
    if (!canEditSubject(teacher, classId, subjectId)) return
    setGrid((prev) => ({
      ...prev,
      [studentId]: { ...prev[studentId], [subjectId]: value },
    }))
  }

  function handleSave() {
    if (!exam) return
    let saved = 0
    for (const student of roster) {
      for (const subject of classSubjects) {
        if (!canEditSubject(teacher, classId, subject.id)) continue
        const mark = parseMark(grid[student.id]?.[subject.id] ?? '')
        if (mark === null) continue
        const existing = grades.find(
          (g) =>
            g.examId === examId &&
            g.studentId === student.id &&
            g.subjectId === subject.id,
        )
        upsertGrade({
          id: existing?.id ?? `gr-${examId}-${subject.id}-${student.id}`,
          examId,
          subjectId: subject.id,
          studentId: student.id,
          mark,
          comment: existing?.comment,
        })
        saved++
      }
    }
    toast.success(`Saved ${saved} mark${saved === 1 ? '' : 's'} to the mark schedule`, {
      description: `${exam.name} · ${classRoom?.name}`,
    })
  }

  return (
    <div>
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div className="grid flex-1 gap-3 sm:grid-cols-2">
          <div>
            <label className="mb-1.5 block text-xs font-medium text-muted-foreground">Exam / Term</label>
            <Select value={examId} onChange={(e) => setExamId(e.target.value)}>
              {exams.map((e) => (
                <option key={e.id} value={e.id}>
                  {e.name}
                </option>
              ))}
            </Select>
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-medium text-muted-foreground">Class</label>
            <Select value={classId} onChange={(e) => setClassId(e.target.value)}>
              {availableClasses.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                  {teacher.classTeacherOf === c.id ? ' (My Class)' : ''}
                </option>
              ))}
            </Select>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" className="gap-2" onClick={() => window.print()}>
            <Printer className="h-4 w-4" />
            Print
          </Button>
          {exam && classRoom && (
            <Button
              variant="outline"
              className="gap-2"
              onClick={() => exportCsv(roster, classSubjects, grid, exam, classRoom.name)}
            >
              <Download className="h-4 w-4" />
              Export CSV
            </Button>
          )}
          <Button className="gap-2" onClick={handleSave}>
            <Save className="h-4 w-4" />
            Save Schedule
          </Button>
        </div>
      </div>

      {!isClassTeacher && (
        <p className="mb-4 rounded-md border border-gold-200 bg-gold-50/80 px-3 py-2 text-sm text-gold-900">
          You can edit marks only for subjects you teach. The class teacher compiles the full schedule.
        </p>
      )}

      <div className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Students in Class" value={roster.length} accent="bg-navy-50 text-navy-700" />
        <StatCard
          label="Class Average"
          value={classAverage !== null ? `${classAverage}%` : '—'}
          accent="bg-forest-100 text-forest-700"
        />
        <StatCard
          label="Pass Rate (≥40%)"
          value={passRate !== null ? `${passRate}%` : '—'}
          accent="bg-gold-100 text-gold-800"
        />
        <StatCard
          label="Marks Entered"
          value={`${filledCells}/${totalCells}`}
          accent="bg-navy-50 text-navy-700"
        />
      </div>

      <Card className="print-area overflow-hidden">
        <CardHeader className="border-b bg-muted/30 pb-4">
          <div className="text-center">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
              {settings.name}
            </p>
            <CardTitle className="mt-1 font-display text-xl">Exam Mark Schedule</CardTitle>
            <p className="mt-1 text-sm text-muted-foreground">
              {classRoom?.name ?? 'Class'} · {exam?.name ?? 'Exam'}
            </p>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[960px] border-collapse text-xs">
              <thead>
                <tr className="border-b bg-[#a0331c] text-white">
                  <th
                    rowSpan={2}
                    className="sticky left-0 z-20 border-r border-white/20 bg-[#a0331c] px-2 py-2 text-center font-semibold"
                  >
                    No.
                  </th>
                  <th
                    rowSpan={2}
                    className="sticky left-8 z-20 min-w-[88px] border-r border-white/20 bg-[#a0331c] px-2 py-2 text-left font-semibold"
                  >
                    Surname
                  </th>
                  <th
                    rowSpan={2}
                    className="sticky left-[120px] z-20 min-w-[88px] border-r border-white/20 bg-[#a0331c] px-2 py-2 text-left font-semibold"
                  >
                    First Name
                  </th>
                  {classSubjects.map((subject) => (
                    <th
                      key={subject.id}
                      colSpan={2}
                      className="border-r border-white/20 px-1 py-2 text-center font-semibold"
                    >
                      {subject.name}
                    </th>
                  ))}
                  <th
                    rowSpan={2}
                    className="border-r border-white/20 px-2 py-2 text-center font-semibold"
                  >
                    Total
                  </th>
                  <th
                    rowSpan={2}
                    className="border-r border-white/20 px-2 py-2 text-center font-semibold"
                  >
                    Subjects
                  </th>
                  <th rowSpan={2} className="px-2 py-2 text-center font-semibold">
                    Average
                  </th>
                </tr>
                <tr className="border-b bg-[#8a2b17] text-white/90">
                  {classSubjects.flatMap((subject) => [
                    <th
                      key={`${subject.id}-m`}
                      className="border-r border-white/10 px-1 py-1 text-center font-medium"
                    >
                      Mark
                    </th>,
                    <th
                      key={`${subject.id}-g`}
                      className="border-r border-white/20 px-1 py-1 text-center font-medium"
                    >
                      Grade
                    </th>,
                  ])}
                </tr>
              </thead>
              <tbody>
                {roster.length === 0 ? (
                  <tr>
                    <td
                      colSpan={3 + classSubjects.length * 2 + 3}
                      className="px-4 py-10 text-center text-muted-foreground"
                    >
                      No active students in this class.
                    </td>
                  </tr>
                ) : (
                  roster.map((student, index) => {
                    const stats = studentStats(student.id, classSubjects, grid)
                    const avgGrade =
                      stats.average !== null && exam
                        ? getGradeLetter(Math.round(stats.average), exam)
                        : null
                    return (
                      <tr key={student.id} className="border-b last:border-0 hover:bg-muted/20">
                        <td className="sticky left-0 z-10 border-r bg-card px-2 py-1.5 text-center text-muted-foreground">
                          {index + 1}
                        </td>
                        <td className="sticky left-8 z-10 border-r bg-card px-2 py-1.5 font-medium">
                          {student.lastName}
                        </td>
                        <td className="sticky left-[120px] z-10 border-r bg-card px-2 py-1.5">
                          {student.firstName}
                        </td>
                        {classSubjects.map((subject) => {
                          const raw = grid[student.id]?.[subject.id] ?? ''
                          const mark = parseMark(raw)
                          const letter =
                            mark !== null && exam ? getGradeLetter(mark, exam) : null
                          const editable = canEditSubject(teacher, classId, subject.id)
                          return (
                            <Fragment key={`${student.id}-${subject.id}`}>
                              <td
                                key={`${student.id}-${subject.id}-m`}
                                className="border-r px-0.5 py-1 text-center"
                              >
                                {editable ? (
                                  <Input
                                    type="number"
                                    min={0}
                                    max={100}
                                    value={raw}
                                    onChange={(e) =>
                                      updateCell(student.id, subject.id, e.target.value)
                                    }
                                    className="mx-auto h-7 w-12 px-1 text-center text-xs"
                                    placeholder="—"
                                  />
                                ) : (
                                  <span className="text-muted-foreground">{mark ?? '—'}</span>
                                )}
                              </td>
                              <td
                                key={`${student.id}-${subject.id}-g`}
                                className="border-r px-1 py-1 text-center"
                              >
                                {letter ? (
                                  <Badge
                                    className="h-5 min-w-[1.5rem] justify-center px-1 text-[10px]"
                                    style={{
                                      backgroundColor: `${gradeColors[letter]}18`,
                                      color: gradeColors[letter],
                                    }}
                                  >
                                    {letter}
                                  </Badge>
                                ) : (
                                  '—'
                                )}
                              </td>
                            </Fragment>
                          )
                        })}
                        <td className="border-r px-2 py-1.5 text-center font-medium tabular-nums">
                          {stats.count ? stats.total : '—'}
                        </td>
                        <td className="border-r px-2 py-1.5 text-center tabular-nums">
                          {stats.count || '—'}
                        </td>
                        <td className="px-2 py-1.5 text-center">
                          {stats.average !== null ? (
                            <span
                              className={cn(
                                'inline-flex items-center gap-1 font-semibold tabular-nums',
                                stats.average >= PASS_MARK ? 'text-forest-700' : 'text-red-700',
                              )}
                            >
                              {stats.average}%
                              {avgGrade && (
                                <Badge
                                  variant="outline"
                                  className="h-5 px-1 text-[10px]"
                                  style={{
                                    borderColor: gradeColors[avgGrade],
                                    color: gradeColors[avgGrade],
                                  }}
                                >
                                  {avgGrade}
                                </Badge>
                              )}
                            </span>
                          ) : (
                            '—'
                          )}
                        </td>
                      </tr>
                    )
                  })
                )}
              </tbody>
              {roster.length > 0 && (
                <tfoot>
                  <tr className="border-t-2 bg-muted/40 font-semibold">
                    <td
                      colSpan={3 + classSubjects.length * 2}
                      className="sticky left-0 z-10 border-r bg-muted/40 px-3 py-2 text-right text-muted-foreground"
                    >
                      Summary
                    </td>
                    <td colSpan={3} className="px-3 py-2">
                      <div className="flex flex-wrap gap-x-6 gap-y-1 text-xs">
                        <span>
                          <span className="text-muted-foreground">No. in class: </span>
                          {roster.length}
                        </span>
                        <span>
                          <span className="text-muted-foreground">Pass rate: </span>
                          {passRate !== null ? `${passRate}%` : '—'}
                        </span>
                        <span>
                          <span className="text-muted-foreground">Class average: </span>
                          {classAverage !== null ? `${classAverage}%` : '—'}
                        </span>
                      </div>
                    </td>
                  </tr>
                  <tr className="border-t bg-muted/20 text-[11px] text-muted-foreground">
                    <td colSpan={3 + classSubjects.length * 2 + 3} className="px-3 py-2">
                      Grading: A 80–100 · B 70–79 · C 60–69 · D 50–59 · E 40–49 · U below 40.
                      Totals and averages update automatically as marks are entered.
                    </td>
                  </tr>
                </tfoot>
              )}
            </table>
          </div>
        </CardContent>
      </Card>

      <div className="mt-4 rounded-md border bg-card p-4 text-sm">
        <p className="font-medium text-navy-800">Class teacher sign-off</p>
        <div className="mt-3 grid gap-4 sm:grid-cols-3">
          <div>
            <p className="text-xs text-muted-foreground">Class teacher</p>
            <p className="font-medium">
              {staff.find((m) => m.id === classRoom?.classTeacherId)?.name ?? '—'}
            </p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Compiled by</p>
            <p className="font-medium">{teacher.name}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Date</p>
            <p className="font-medium">{new Date().toLocaleDateString('en-GB')}</p>
          </div>
        </div>
      </div>
    </div>
  )
}
