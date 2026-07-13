import { useMemo } from 'react'
import { BookOpen } from 'lucide-react'
import { useAppStore } from '@/stores/app-store'
import { useCurrentStudent } from '@/hooks/use-current-student'
import { useClassSubjects, useSubjectTeacher } from '@/hooks/use-class-subjects'
import { getGradeLetter } from '@/data/mock-data'
import { PageHeader, EmptyState } from '@/components/shared/empty-state'
import { Card, CardContent, Badge } from '@/components/ui/card'

function SubjectCard({ subjectId, subjectName, subjectCode, classId, studentId }: { subjectId: string; subjectName: string; subjectCode: string; classId: string | undefined; studentId: string }) {
  const grades = useAppStore((s) => s.grades)
  const teacher = useSubjectTeacher(classId, subjectId)

  const subjectGrades = grades.filter((g) => g.studentId === studentId && g.subjectId === subjectId)
  const avg = subjectGrades.length > 0 ? subjectGrades.reduce((sum, g) => sum + g.mark, 0) / subjectGrades.length : null

  return (
    <Card>
      <CardContent className="pt-5">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2">
            <div className="rounded-md bg-navy-50 p-2 text-navy-700">
              <BookOpen className="h-4 w-4" />
            </div>
            <div>
              <p className="font-display text-lg font-semibold text-navy-900">{subjectName}</p>
              <p className="text-xs text-muted-foreground">{subjectCode}</p>
            </div>
          </div>
          {avg !== null && <Badge variant="gold">{getGradeLetter(Math.round(avg))}</Badge>}
        </div>
        <p className="mt-3 text-sm text-muted-foreground">Teacher: {teacher?.name ?? 'TBA'}</p>
        <p className="mt-1 text-sm">
          <span className="text-muted-foreground">Average mark: </span>
          <span className="font-semibold text-navy-800">{avg !== null ? `${avg.toFixed(0)}%` : '—'}</span>
        </p>
      </CardContent>
    </Card>
  )
}

export default function StudentSubjectsPage() {
  const student = useCurrentStudent()
  const classSubjects = useClassSubjects(student.classId)

  const items = useMemo(() => classSubjects, [classSubjects])

  return (
    <div>
      <PageHeader title="My Subjects" description="Subjects you're enrolled in this term, with your average grade so far." />
      {items.length === 0 ? (
        <EmptyState title="No subjects found" description="Subject enrollment has not been published yet." />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((subject) => (
            <SubjectCard
              key={subject.id}
              subjectId={subject.id}
              subjectName={subject.name}
              subjectCode={subject.code}
              classId={student.classId}
              studentId={student.id}
            />
          ))}
        </div>
      )}
    </div>
  )
}
