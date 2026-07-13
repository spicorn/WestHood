import type { ClassRoom, ElectronicReport, Exam, LeadershipRole, MeritRecord, Student } from '@/data/types'
import type { MarksheetRow } from '@/components/shared/print-marksheet'
import type { SubjectPrediction } from '@/lib/results-prediction'
import { SchoolCrest } from '@/components/shared/brand'
import { LeadershipBadge } from '@/components/shared/leadership-badge'
import { getGradeLetter, studentFullName } from '@/data/mock-data'
import { formatDate, cn } from '@/lib/utils'
import { PredictionDisclaimer } from '@/components/shared/subject-prediction'

export interface ElectronicReportDocumentProps {
  student: Student
  classRoom?: ClassRoom
  exam: Exam
  report: ElectronicReport
  rows: MarksheetRow[]
  meritRecords: MeritRecord[]
  predictions?: SubjectPrediction[]
  subjectNames?: Record<string, string>
  careerInterest?: string
  leadershipRole?: LeadershipRole
  className?: string
}

/** Full branded report card for print/PDF — looks like something you'd hand a parent. */
export function ElectronicReportDocument({
  student,
  classRoom,
  exam,
  report,
  rows,
  meritRecords,
  predictions = [],
  subjectNames = {},
  careerInterest,
  leadershipRole,
  className,
}: ElectronicReportDocumentProps) {
  const average = rows.length > 0 ? rows.reduce((sum, r) => sum + r.mark, 0) / rows.length : 0
  const overallGrade = getGradeLetter(Math.round(average), exam)
  const meritTotal = meritRecords.reduce((sum, m) => sum + m.points, 0)

  return (
    <div className={cn('print-area rounded-lg border-2 border-navy-800/20 bg-card p-6 shadow-soft sm:p-8', className)}>
      <div className="relative overflow-hidden rounded-md bg-navy-800 px-5 py-4 text-white">
        <div className="absolute -right-6 -top-6 h-24 w-24 rounded-full bg-gold-500/20" />
        <div className="relative flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <SchoolCrest size="md" />
            <div>
              <p className="font-display text-2xl font-semibold">Westwood College</p>
              <p className="text-[11px] uppercase tracking-[0.2em] text-gold-400">Visus Manifestus.</p>
            </div>
          </div>
          <div className="text-right">
            <p className="font-display text-lg font-semibold">Student Report Card</p>
            <p className="text-xs text-navy-100/80">{report.term}</p>
            <div className="mt-1.5 flex justify-end">
              <LeadershipBadge role={leadershipRole ?? student.leadershipRole} />
            </div>
          </div>
        </div>
      </div>

      <div className="mt-5 grid grid-cols-2 gap-3 text-sm sm:grid-cols-4">
        <div>
          <p className="text-xs text-muted-foreground">Student</p>
          <p className="font-semibold">{studentFullName(student)}</p>
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
          <p className="text-xs text-muted-foreground">Class Position</p>
          <p className="font-medium">
            {report.classPosition} of {report.classSize}
          </p>
        </div>
      </div>
      {careerInterest && (
        <p className="mt-3 text-sm">
          <span className="text-xs text-muted-foreground">Career Interest · </span>
          <span className="font-medium text-navy-800">{careerInterest}</span>
        </p>
      )}

      <table className="mt-5 w-full border-collapse text-sm">
        <thead>
          <tr className="border-y bg-navy-50 text-left">
            <th className="px-3 py-2 font-semibold text-navy-700">Subject</th>
            <th className="px-3 py-2 text-right font-semibold text-navy-700">Mark</th>
            <th className="px-3 py-2 text-center font-semibold text-navy-700">Grade</th>
            <th className="px-3 py-2 font-semibold text-navy-700">Teacher Comment</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.subjectCode} className="border-b">
              <td className="px-3 py-2 font-medium">{row.subjectName}</td>
              <td className="px-3 py-2 text-right">{row.mark}%</td>
              <td className="px-3 py-2 text-center font-semibold">{getGradeLetter(row.mark, exam)}</td>
              <td className="px-3 py-2 text-muted-foreground">{row.comment ?? '—'}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="mt-4 grid gap-3 sm:grid-cols-4">
        <div className="rounded-md bg-navy-50 px-3 py-2">
          <p className="text-xs text-muted-foreground">Average</p>
          <p className="font-display text-xl font-semibold text-navy-900">{average.toFixed(1)}%</p>
        </div>
        <div className="rounded-md bg-navy-50 px-3 py-2">
          <p className="text-xs text-muted-foreground">Overall Grade</p>
          <p className="font-display text-xl font-semibold text-navy-900">{overallGrade}</p>
        </div>
        <div className="rounded-md bg-navy-50 px-3 py-2">
          <p className="text-xs text-muted-foreground">Attendance</p>
          <p className="font-display text-xl font-semibold text-navy-900">{report.attendancePct}%</p>
        </div>
        <div className="rounded-md bg-navy-50 px-3 py-2">
          <p className="text-xs text-muted-foreground">Merit Balance</p>
          <p className="font-display text-xl font-semibold text-navy-900">{meritTotal >= 0 ? '+' : ''}{meritTotal}</p>
        </div>
      </div>

      {meritRecords.length > 0 && (
        <div className="mt-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-1">Conduct notes</p>
          <ul className="space-y-1 text-sm">
            {meritRecords.slice(0, 5).map((m) => (
              <li key={m.id} className="text-muted-foreground">
                <span className={m.type === 'merit' ? 'text-forest-700 font-medium' : 'text-red-700 font-medium'}>
                  {m.points > 0 ? '+' : ''}{m.points}
                </span>{' '}
                — {m.reason} <span className="text-xs">({formatDate(m.date)})</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        <div className="rounded-md border p-3">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Class Teacher&apos;s Comment</p>
          <p className="mt-1 text-sm">{report.classTeacherComment || '—'}</p>
        </div>
        <div className="rounded-md border border-gold-300/50 bg-gold-50/40 p-3">
          <p className="text-xs font-semibold uppercase tracking-wide text-gold-800">Head&apos;s Comment</p>
          <p className="mt-1 text-sm">{report.principalComment || '—'}</p>
        </div>
      </div>

      {predictions.length > 0 && (
        <div className="mt-4 rounded-md border border-dashed border-navy-300 bg-muted/40 p-3">
          <p className="text-xs font-semibold uppercase tracking-wide text-navy-700 mb-2">Projected Next Term</p>
          <ul className="grid gap-1 text-sm sm:grid-cols-2">
            {predictions.map((p) => (
              <li key={p.subjectId}>
                <span className="font-medium">{subjectNames[p.subjectId] ?? p.subjectId}</span>
                {': '}
                <span className="text-muted-foreground">{p.gradeBand}</span>
              </li>
            ))}
          </ul>
          <PredictionDisclaimer className="mt-2" />
        </div>
      )}

      <div className="mt-8 grid grid-cols-3 gap-6 text-xs text-muted-foreground">
        <div className="border-t pt-2">Class Teacher</div>
        <div className="border-t pt-2">Principal / Head</div>
        <div className="border-t pt-2">Parent / Guardian</div>
      </div>
      <p className="mt-4 text-center text-[10px] text-muted-foreground">
        {exam.name} · Issued {report.publishedAt ? formatDate(report.publishedAt.slice(0, 10)) : '—'} · Westwood College, Harare
      </p>
    </div>
  )
}
