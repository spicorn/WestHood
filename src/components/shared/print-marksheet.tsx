import type { ClassRoom, Exam, Student } from '@/data/types'
import { getGradeLetter, studentFullName } from '@/data/mock-data'
import { formatDate } from '@/lib/utils'
import { SchoolCrest } from '@/components/shared/brand'
import { cn } from '@/lib/utils'

export interface MarksheetRow {
  subjectName: string
  subjectCode: string
  teacherName?: string
  mark: number
  comment?: string
}

export interface PrintMarksheetProps {
  student: Student
  classRoom?: ClassRoom
  exam: Exam
  rows: MarksheetRow[]
  schoolName?: string
  schoolTagline?: string
  className?: string
}

/**
 * Printable report card / marksheet. Reused by student, parent, and admin pages.
 * Wrap the page's print action with `window.print()`; only elements inside
 * `.print-area` (applied here) are rendered in the print stylesheet.
 */
export function PrintMarksheet({
  student,
  classRoom,
  exam,
  rows,
  schoolName = 'Westwood College',
  schoolTagline = 'Visus Manifestus.',
  className,
}: PrintMarksheetProps) {
  const average = rows.length > 0 ? rows.reduce((sum, r) => sum + r.mark, 0) / rows.length : 0
  const overallGrade = getGradeLetter(Math.round(average), exam)

  return (
    <div className={cn('print-area rounded-lg border bg-card p-6 shadow-soft sm:p-8', className)}>
      <div className="flex items-center justify-between gap-4 border-b pb-4">
        <div className="flex items-center gap-3">
          <SchoolCrest size="md" />
          <div>
            <p className="font-display text-xl font-semibold text-navy-900">{schoolName}</p>
            <p className="text-[11px] uppercase tracking-[0.18em] text-gold-700">{schoolTagline}</p>
          </div>
        </div>
        <div className="text-right">
          <p className="font-display text-lg font-semibold text-navy-800">Academic Report</p>
          <p className="text-xs text-muted-foreground">{exam.name}</p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 py-4 text-sm sm:grid-cols-4">
        <div>
          <p className="text-xs text-muted-foreground">Student</p>
          <p className="font-medium">{studentFullName(student)}</p>
        </div>
        <div>
          <p className="text-xs text-muted-foreground">Admission No.</p>
          <p className="font-medium">{student.admissionNo}</p>
        </div>
        <div>
          <p className="text-xs text-muted-foreground">Class</p>
          <p className="font-medium">{classRoom?.name ?? student.classId}</p>
        </div>
        <div>
          <p className="text-xs text-muted-foreground">Term</p>
          <p className="font-medium">{exam.term}</p>
        </div>
      </div>

      <table className="w-full border-collapse text-sm">
        <thead>
          <tr className="border-y bg-muted/50 text-left">
            <th className="px-3 py-2 font-semibold text-muted-foreground">Subject</th>
            <th className="px-3 py-2 font-semibold text-muted-foreground">Teacher</th>
            <th className="px-3 py-2 text-right font-semibold text-muted-foreground">Mark</th>
            <th className="px-3 py-2 text-center font-semibold text-muted-foreground">Grade</th>
            <th className="px-3 py-2 font-semibold text-muted-foreground">Comment</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.subjectCode} className="border-b last:border-0">
              <td className="px-3 py-2">
                <span className="font-medium">{row.subjectName}</span>
                <span className="ml-1 text-xs text-muted-foreground">({row.subjectCode})</span>
              </td>
              <td className="px-3 py-2 text-muted-foreground">{row.teacherName ?? '—'}</td>
              <td className="px-3 py-2 text-right font-semibold">{row.mark}%</td>
              <td className="px-3 py-2 text-center font-semibold">{getGradeLetter(row.mark, exam)}</td>
              <td className="px-3 py-2 text-muted-foreground">{row.comment ?? '—'}</td>
            </tr>
          ))}
          {rows.length === 0 && (
            <tr>
              <td colSpan={5} className="px-3 py-6 text-center text-muted-foreground">
                No grades recorded for this exam.
              </td>
            </tr>
          )}
        </tbody>
      </table>

      <div className="mt-4 flex flex-wrap items-center justify-between gap-3 rounded-md bg-navy-50 px-4 py-3">
        <div>
          <p className="text-xs text-muted-foreground">Average</p>
          <p className="font-display text-lg font-semibold text-navy-900">{average.toFixed(1)}%</p>
        </div>
        <div>
          <p className="text-xs text-muted-foreground">Overall Grade</p>
          <p className="font-display text-lg font-semibold text-navy-900">{overallGrade}</p>
        </div>
        <div>
          <p className="text-xs text-muted-foreground">Exam Period</p>
          <p className="text-sm font-medium">
            {formatDate(exam.startDate)} – {formatDate(exam.endDate)}
          </p>
        </div>
      </div>

      <div className="mt-8 grid grid-cols-2 gap-8 text-sm">
        <div className="border-t pt-2 text-muted-foreground">Class Teacher's Signature</div>
        <div className="border-t pt-2 text-muted-foreground">Parent/Guardian's Signature</div>
      </div>
    </div>
  )
}
