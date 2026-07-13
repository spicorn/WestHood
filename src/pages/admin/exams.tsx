import { useMemo, useState } from 'react'
import { toast } from 'sonner'
import { CalendarRange, ClipboardList, FileText, Save } from 'lucide-react'
import { PageHeader } from '@/components/shared/empty-state'
import { Card, CardContent, CardHeader, CardTitle, Badge } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input, Label } from '@/components/ui/input'
import { Select, Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useAppStore } from '@/stores/app-store'
import { exams, getGradeLetter, studentFullName } from '@/data/mock-data'
import type { Exam, GradeEntry, Student } from '@/data/types'
import { formatDate } from '@/lib/utils'

interface RowState {
  mark: string
  comment: string
}

function buildInitialRows(examId: string, subjectId: string, classStudentIds: string[], grades: GradeEntry[]) {
  const next: Record<string, RowState> = {}
  for (const studentId of classStudentIds) {
    const existing = grades.find((g) => g.examId === examId && g.studentId === studentId && g.subjectId === subjectId)
    next[studentId] = { mark: existing ? String(existing.mark) : '', comment: existing?.comment ?? '' }
  }
  return next
}

function MarksheetTable({
  examId,
  subjectId,
  classStudents,
  grades,
  selectedExam,
  subjectName,
  upsertGrade,
}: {
  examId: string
  subjectId: string
  classStudents: Student[]
  grades: GradeEntry[]
  selectedExam?: Exam
  subjectName?: string
  upsertGrade: (g: GradeEntry) => void
}) {
  const [rows, setRows] = useState<Record<string, RowState>>(() =>
    buildInitialRows(examId, subjectId, classStudents.map((s) => s.id), grades),
  )

  const updateRow = (studentId: string, patch: Partial<RowState>) => {
    setRows((prev) => ({ ...prev, [studentId]: { ...prev[studentId], ...patch } }))
  }

  const saveRow = (studentId: string) => {
    const row = rows[studentId]
    const mark = Number(row?.mark)
    if (!row?.mark || Number.isNaN(mark) || mark < 0 || mark > 100) {
      toast.error('Enter a valid mark between 0 and 100.')
      return
    }
    const id = `gr-${examId}-${studentId}-${subjectId}`
    upsertGrade({ id, examId, studentId, subjectId, mark, comment: row.comment || undefined })
    toast.success('Grade saved.')
  }

  const saveAll = () => {
    let count = 0
    for (const st of classStudents) {
      const row = rows[st.id]
      const mark = Number(row?.mark)
      if (row?.mark && !Number.isNaN(mark) && mark >= 0 && mark <= 100) {
        const id = `gr-${examId}-${st.id}-${subjectId}`
        upsertGrade({ id, examId, studentId: st.id, subjectId, mark, comment: row.comment || undefined })
        count++
      }
    }
    toast.success(`${count} grade${count !== 1 ? 's' : ''} saved for ${subjectName ?? 'this subject'}.`)
  }

  return (
    <>
      <div className="overflow-x-auto rounded-lg border">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b bg-muted/50 text-left">
              <th className="px-4 py-2 font-semibold text-muted-foreground">Student</th>
              <th className="px-4 py-2 font-semibold text-muted-foreground">Mark (%)</th>
              <th className="px-4 py-2 font-semibold text-muted-foreground">Grade</th>
              <th className="px-4 py-2 font-semibold text-muted-foreground">Comment</th>
              <th className="px-4 py-2 font-semibold text-muted-foreground" />
            </tr>
          </thead>
          <tbody>
            {classStudents.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-muted-foreground">
                  No active students in this class.
                </td>
              </tr>
            ) : (
              classStudents.map((st) => {
                const row = rows[st.id] ?? { mark: '', comment: '' }
                const markNum = Number(row.mark)
                return (
                  <tr key={st.id} className="border-b last:border-0">
                    <td className="px-4 py-2 font-medium">{studentFullName(st)}</td>
                    <td className="px-4 py-2">
                      <Input
                        type="number"
                        min={0}
                        max={100}
                        className="w-20"
                        value={row.mark}
                        onChange={(e) => updateRow(st.id, { mark: e.target.value })}
                      />
                    </td>
                    <td className="px-4 py-2">
                      {row.mark && !Number.isNaN(markNum) ? (
                        <Badge variant="outline">{getGradeLetter(markNum, selectedExam)}</Badge>
                      ) : (
                        '—'
                      )}
                    </td>
                    <td className="px-4 py-2">
                      <Input
                        className="min-w-[220px]"
                        value={row.comment}
                        onChange={(e) => updateRow(st.id, { comment: e.target.value })}
                        placeholder="Optional comment…"
                      />
                    </td>
                    <td className="px-4 py-2">
                      <Button size="sm" variant="outline" onClick={() => saveRow(st.id)}>
                        Save
                      </Button>
                    </td>
                  </tr>
                )
              })
            )}
          </tbody>
        </table>
      </div>
      {classStudents.length > 0 && (
        <Button className="mt-4" onClick={saveAll}>
          <Save className="h-4 w-4" /> Save All Marks
        </Button>
      )}
    </>
  )
}

export default function AdminExams() {
  const students = useAppStore((s) => s.students)
  const classes = useAppStore((s) => s.classes)
  const subjects = useAppStore((s) => s.subjects)
  const grades = useAppStore((s) => s.grades)
  const upsertGrade = useAppStore((s) => s.upsertGrade)

  const [examId, setExamId] = useState(exams[0]?.id ?? '')
  const [classId, setClassId] = useState(classes[0]?.id ?? '')
  const [subjectId, setSubjectId] = useState('')

  const [reportExamId, setReportExamId] = useState(exams[0]?.id ?? '')
  const [reportStudentId, setReportStudentId] = useState(students[0]?.id ?? '')

  const selectedExam = exams.find((e) => e.id === examId) ?? exams[0]
  const classSubjects = useMemo(() => subjects.filter((s) => s.classIds.includes(classId)), [subjects, classId])
  const effectiveSubjectId = classSubjects.some((s) => s.id === subjectId) ? subjectId : classSubjects[0]?.id ?? ''

  const classStudents = useMemo(
    () => students.filter((s) => s.classId === classId && s.status === 'active'),
    [students, classId],
  )

  const reportExam = exams.find((e) => e.id === reportExamId) ?? exams[0]
  const reportStudent = students.find((s) => s.id === reportStudentId)
  const reportEntries = useMemo(
    () => grades.filter((g) => g.examId === reportExamId && g.studentId === reportStudentId),
    [grades, reportExamId, reportStudentId],
  )
  const reportAverage = reportEntries.length
    ? Math.round(reportEntries.reduce((sum, g) => sum + g.mark, 0) / reportEntries.length)
    : 0

  return (
    <div>
      <PageHeader title="Exams & Grades" description="Manage exam schedules, enter marks, and review report cards." />

      <div className="mb-6 grid gap-3 sm:grid-cols-2">
        {exams.map((exam) => (
          <Card key={exam.id}>
            <CardContent className="flex items-start justify-between pt-4">
              <div>
                <p className="font-display text-lg font-semibold">{exam.name}</p>
                <p className="text-xs text-muted-foreground">{exam.term}</p>
                <p className="mt-1 flex items-center gap-1.5 text-xs text-muted-foreground">
                  <CalendarRange className="h-3.5 w-3.5" />
                  {formatDate(exam.startDate)} – {formatDate(exam.endDate)}
                </p>
              </div>
              <Badge variant="outline">{exam.subjectIds.length} subjects</Badge>
            </CardContent>
          </Card>
        ))}
      </div>

      <Tabs defaultValue="marksheet">
        <TabsList>
          <TabsTrigger value="marksheet">
            <ClipboardList className="mr-1.5 h-3.5 w-3.5" /> Marksheet Entry
          </TabsTrigger>
          <TabsTrigger value="report">
            <FileText className="mr-1.5 h-3.5 w-3.5" /> Report Card
          </TabsTrigger>
        </TabsList>

        <TabsContent value="marksheet">
          <Card>
            <CardHeader>
              <CardTitle>Grade Entry</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="mb-4 grid gap-3 sm:grid-cols-3">
                <div className="space-y-1.5">
                  <Label>Exam</Label>
                  <Select value={examId} onChange={(e) => setExamId(e.target.value)}>
                    {exams.map((e) => (
                      <option key={e.id} value={e.id}>
                        {e.name}
                      </option>
                    ))}
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label>Class</Label>
                  <Select
                    value={classId}
                    onChange={(e) => {
                      setClassId(e.target.value)
                      setSubjectId('')
                    }}
                  >
                    {classes.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label>Subject</Label>
                  <Select value={effectiveSubjectId} onChange={(e) => setSubjectId(e.target.value)}>
                    {classSubjects.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.name}
                      </option>
                    ))}
                  </Select>
                </div>
              </div>

              <MarksheetTable
                key={`${examId}-${classId}-${effectiveSubjectId}`}
                examId={examId}
                subjectId={effectiveSubjectId}
                classStudents={classStudents}
                grades={grades}
                selectedExam={selectedExam}
                subjectName={subjects.find((s) => s.id === effectiveSubjectId)?.name}
                upsertGrade={upsertGrade}
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="report">
          <Card>
            <CardHeader>
              <CardTitle>Student Report Card</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="mb-4 grid gap-3 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <Label>Exam</Label>
                  <Select value={reportExamId} onChange={(e) => setReportExamId(e.target.value)}>
                    {exams.map((e) => (
                      <option key={e.id} value={e.id}>
                        {e.name}
                      </option>
                    ))}
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label>Student</Label>
                  <Select value={reportStudentId} onChange={(e) => setReportStudentId(e.target.value)}>
                    {students
                      .filter((s) => s.status === 'active')
                      .map((s) => (
                        <option key={s.id} value={s.id}>
                          {studentFullName(s)}
                        </option>
                      ))}
                  </Select>
                </div>
              </div>

              {reportStudent && (
                <div className="mb-4 rounded-md border bg-muted/30 p-3 text-sm">
                  <p className="font-medium">{studentFullName(reportStudent)}</p>
                  <p className="text-xs text-muted-foreground">
                    {classes.find((c) => c.id === reportStudent.classId)?.name} · {reportExam?.name}
                  </p>
                </div>
              )}

              <div className="overflow-x-auto rounded-lg border">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b bg-muted/50 text-left">
                      <th className="px-4 py-2 font-semibold text-muted-foreground">Subject</th>
                      <th className="px-4 py-2 font-semibold text-muted-foreground">Mark</th>
                      <th className="px-4 py-2 font-semibold text-muted-foreground">Grade</th>
                      <th className="px-4 py-2 font-semibold text-muted-foreground">Comment</th>
                    </tr>
                  </thead>
                  <tbody>
                    {reportEntries.length === 0 ? (
                      <tr>
                        <td colSpan={4} className="px-4 py-8 text-center text-muted-foreground">
                          No grade entries for this exam yet.
                        </td>
                      </tr>
                    ) : (
                      reportEntries.map((entry) => (
                        <tr key={entry.id} className="border-b last:border-0">
                          <td className="px-4 py-2">{subjects.find((s) => s.id === entry.subjectId)?.name}</td>
                          <td className="px-4 py-2">{entry.mark}%</td>
                          <td className="px-4 py-2">
                            <Badge variant="outline">{getGradeLetter(entry.mark, reportExam)}</Badge>
                          </td>
                          <td className="px-4 py-2 text-muted-foreground">{entry.comment ?? '—'}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                  {reportEntries.length > 0 && (
                    <tfoot>
                      <tr className="border-t bg-muted/30 font-medium">
                        <td className="px-4 py-2">Average</td>
                        <td className="px-4 py-2">{reportAverage}%</td>
                        <td className="px-4 py-2">
                          <Badge variant="gold">{getGradeLetter(reportAverage, reportExam)}</Badge>
                        </td>
                        <td className="px-4 py-2" />
                      </tr>
                    </tfoot>
                  )}
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
