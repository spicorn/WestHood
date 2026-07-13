import { useMemo, useState } from 'react'
import { Printer } from 'lucide-react'
import { useAppStore } from '@/stores/app-store'
import { useCurrentStudent } from '@/hooks/use-current-student'
import { exams } from '@/data/mock-data'
import { PageHeader } from '@/components/shared/empty-state'
import { Button } from '@/components/ui/button'
import { Select } from '@/components/ui/tabs'
import { PrintMarksheet, type MarksheetRow } from '@/components/shared/print-marksheet'

function useMarksheetRows(studentId: string, classId: string | undefined, examId: string) {
  const grades = useAppStore((s) => s.grades)
  const subjects = useAppStore((s) => s.subjects)
  const staff = useAppStore((s) => s.staff)
  const timetable = useAppStore((s) => s.timetable)

  return useMemo(() => {
    return grades
      .filter((g) => g.studentId === studentId && g.examId === examId)
      .map((g) => {
        const subject = subjects.find((s) => s.id === g.subjectId)
        const slot = timetable.find((t) => t.classId === classId && t.subjectId === g.subjectId)
        const teacher = staff.find((s) => s.id === (slot?.teacherId ?? subject?.teacherIds[0]))
        return {
          subjectName: subject?.name ?? 'Subject',
          subjectCode: subject?.code ?? g.subjectId,
          teacherName: teacher?.name,
          mark: g.mark,
          comment: g.comment,
        } satisfies MarksheetRow
      })
  }, [grades, subjects, staff, timetable, studentId, classId, examId])
}

export default function StudentMarksPage() {
  const student = useCurrentStudent()
  const classes = useAppStore((s) => s.classes)
  const classRoom = classes.find((c) => c.id === student.classId)
  const [examId, setExamId] = useState(exams[exams.length - 1]?.id ?? exams[0]?.id ?? '')
  const exam = exams.find((e) => e.id === examId) ?? exams[0]
  const rows = useMarksheetRows(student.id, student.classId, exam?.id ?? '')

  if (!exam) {
    return <PageHeader title="My Marks" description="No exams have been configured yet." />
  }

  return (
    <div>
      <PageHeader
        title="My Marks"
        description="Your marksheet by term and exam."
        actions={
          <>
            <Select value={examId} onChange={(e) => setExamId(e.target.value)} className="w-56">
              {exams.map((e) => (
                <option key={e.id} value={e.id}>
                  {e.name}
                </option>
              ))}
            </Select>
            <Button className="no-print" onClick={() => window.print()}>
              <Printer className="mr-2 h-4 w-4" /> Print
            </Button>
          </>
        }
      />
      <PrintMarksheet student={student} classRoom={classRoom} exam={exam} rows={rows} />
    </div>
  )
}
