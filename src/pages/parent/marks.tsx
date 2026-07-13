import { useMemo, useState } from 'react'
import { Printer } from 'lucide-react'
import { useAppStore } from '@/stores/app-store'
import { useSelectedChild } from '@/hooks/use-parent'
import { exams } from '@/data/mock-data'
import { predictStudentSubjects } from '@/lib/results-prediction'
import { ChildSwitcher } from '@/components/parent/child-switcher'
import { PageHeader, EmptyState } from '@/components/shared/empty-state'
import { Button } from '@/components/ui/button'
import { Select } from '@/components/ui/tabs'
import { PrintMarksheet, type MarksheetRow } from '@/components/shared/print-marksheet'
import { SubjectPredictionCard, PredictionDisclaimer } from '@/components/shared/subject-prediction'
import { useClassSubjects } from '@/hooks/use-class-subjects'

function useMarksheetRows(studentId: string | undefined, classId: string | undefined, examId: string) {
  const grades = useAppStore((s) => s.grades)
  const subjects = useAppStore((s) => s.subjects)
  const staff = useAppStore((s) => s.staff)
  const timetable = useAppStore((s) => s.timetable)

  return useMemo(() => {
    if (!studentId) return []
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

export default function ParentMarksPage() {
  const child = useSelectedChild()
  const classes = useAppStore((s) => s.classes)
  const grades = useAppStore((s) => s.grades)
  const homework = useAppStore((s) => s.homework)
  const classRoom = classes.find((c) => c.id === child?.classId)
  const classSubjects = useClassSubjects(child?.classId)
  const [examId, setExamId] = useState(exams[exams.length - 1]?.id ?? exams[0]?.id ?? '')
  const exam = exams.find((e) => e.id === examId) ?? exams[0]
  const rows = useMarksheetRows(child?.id, child?.classId, exam?.id ?? '')

  const predictions = useMemo(() => {
    if (!child) return []
    return predictStudentSubjects(
      child,
      classSubjects.map((s) => s.id),
      grades,
      exams,
      homework,
    )
  }, [child, classSubjects, grades, homework])

  if (!child) return <EmptyState title="No children linked" description="No students are linked to your account yet." />
  if (!exam) return <EmptyState title="No exams" description="No exams have been configured yet." />

  return (
    <div>
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <PageHeader title="Report Card" description={`Marksheet for ${child.firstName} by term and exam.`} />
        <ChildSwitcher />
      </div>
      <div className="mb-4 flex flex-wrap gap-2">
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
      </div>
      <PrintMarksheet student={child} classRoom={classRoom} exam={exam} rows={rows} />

      {predictions.length > 0 && (
        <section className="mt-8 no-print">
          <h2 className="mb-2 font-display text-2xl font-semibold text-navy-900">Results Projection</h2>
          <PredictionDisclaimer className="mb-4" />
          <div className="grid gap-4 md:grid-cols-2">
            {predictions.map((p) => (
              <SubjectPredictionCard
                key={p.subjectId}
                prediction={p}
                subjectName={classSubjects.find((s) => s.id === p.subjectId)?.name ?? p.subjectId}
              />
            ))}
          </div>
        </section>
      )}
    </div>
  )
}
