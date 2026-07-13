import { useMemo, useState } from 'react'
import { AlertTriangle, TrendingDown } from 'lucide-react'
import { useAppStore } from '@/stores/app-store'
import { useCurrentStaff } from '@/hooks/use-current-staff'
import { exams, studentFullName } from '@/data/mock-data'
import { overallTrendScore, predictStudentSubjects } from '@/lib/results-prediction'
import { PageHeader, EmptyState } from '@/components/shared/empty-state'
import { PredictionDisclaimer } from '@/components/shared/subject-prediction'
import { Card, CardContent, CardHeader, CardTitle, Badge } from '@/components/ui/card'
import { Label } from '@/components/ui/input'
import { Select } from '@/components/ui/tabs'
import { useClassSubjects } from '@/hooks/use-class-subjects'

export default function StaffPredictionsPage() {
  const { teacher } = useCurrentStaff()
  const students = useAppStore((s) => s.students)
  const classes = useAppStore((s) => s.classes)
  const grades = useAppStore((s) => s.grades)
  const homework = useAppStore((s) => s.homework)
  const invoices = useAppStore((s) => s.invoices)

  const allowedClasses = useMemo(() => {
    if (!teacher) return []
    const ids = new Set([...(teacher.classIds ?? []), ...(teacher.classTeacherOf ? [teacher.classTeacherOf] : [])])
    return classes.filter((c) => ids.has(c.id))
  }, [teacher, classes])

  const [classId, setClassId] = useState(allowedClasses[0]?.id ?? '')
  const effectiveClassId = allowedClasses.some((c) => c.id === classId) ? classId : allowedClasses[0]?.id ?? ''

  const classSubjects = useClassSubjects(effectiveClassId)
  const subjectIds = classSubjects.map((s) => s.id)

  const classStudents = useMemo(
    () => students.filter((s) => s.classId === effectiveClassId && s.status === 'active'),
    [students, effectiveClassId],
  )

  const rows = useMemo(() => {
    return classStudents
      .map((student) => {
        const predictions = predictStudentSubjects(student, subjectIds, grades, exams, homework)
        const avgDelta = overallTrendScore(predictions)
        const declining = predictions.filter((p) => p.trend === 'declining').length
        const improving = predictions.filter((p) => p.trend === 'improving').length
        const conf = { high: 0, medium: 0, low: 0 }
        predictions.forEach((p) => {
          conf[p.confidence]++
        })
        const otherRisk =
          student.attendancePct < 80 ||
          student.previousAvg - student.currentAvg > 10 ||
          invoices.some((inv) => inv.studentId === student.id && inv.status === 'overdue')
        return {
          student,
          avgDelta,
          declining,
          improving,
          conf,
          isDeclining: avgDelta <= -3 || declining > 0,
          needsAttention: declining > 0 && otherRisk,
        }
      })
      .sort((a, b) => a.avgDelta - b.avgDelta)
  }, [classStudents, subjectIds, grades, homework, invoices])

  const attention = rows.filter((r) => r.needsAttention)

  if (!teacher) {
    return <EmptyState title="Staff profile not found" description="Your account is not linked to a staff record." />
  }

  if (allowedClasses.length === 0) {
    return <EmptyState title="No classes assigned" description="You are not assigned to any classes yet." />
  }

  return (
    <div>
      <PageHeader
        title="Class Predictions"
        description="Trend projections for students in your classes."
      />
      <PredictionDisclaimer className="mb-4" />

      <div className="mb-4 space-y-1">
        <Label className="text-xs">My class</Label>
        <Select value={effectiveClassId} onChange={(e) => setClassId(e.target.value)} className="w-56">
          {allowedClasses.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
              {teacher.classTeacherOf === c.id ? ' (class teacher)' : ''}
            </option>
          ))}
        </Select>
      </div>

      {attention.length > 0 && (
        <div className="mb-4 flex items-start gap-3 rounded-lg border border-red-200 bg-red-50/60 px-4 py-3 text-sm">
          <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-red-700" />
          <div>
            <p className="font-semibold text-red-900">Needs attention</p>
            <p className="text-red-800/90">
              {attention.map((a) => studentFullName(a.student)).join(', ')} — declining subjects plus attendance,
              grades, or fee risk.
            </p>
          </div>
        </div>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="text-base">
            {classes.find((c) => c.id === effectiveClassId)?.name} · sorted by decline
          </CardTitle>
        </CardHeader>
        <CardContent>
          {rows.length === 0 ? (
            <EmptyState title="No students" description="No active students in this class." />
          ) : (
            <div className="overflow-x-auto rounded-lg border">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b bg-muted/50 text-left">
                    <th className="px-3 py-2 font-semibold text-muted-foreground">Student</th>
                    <th className="px-3 py-2 font-semibold text-muted-foreground">Avg Δ</th>
                    <th className="px-3 py-2 font-semibold text-muted-foreground">Declining</th>
                    <th className="px-3 py-2 font-semibold text-muted-foreground">Improving</th>
                    <th className="px-3 py-2 font-semibold text-muted-foreground">Confidence</th>
                    <th className="px-3 py-2 font-semibold text-muted-foreground">Flag</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((r) => (
                    <tr key={r.student.id} className="border-b last:border-0">
                      <td className="px-3 py-2 font-medium">{studentFullName(r.student)}</td>
                      <td className="px-3 py-2">
                        <span className={r.avgDelta < 0 ? 'font-semibold text-red-700' : ''}>
                          {r.avgDelta > 0 ? '+' : ''}
                          {r.avgDelta.toFixed(1)}
                        </span>
                      </td>
                      <td className="px-3 py-2">{r.declining}</td>
                      <td className="px-3 py-2">{r.improving}</td>
                      <td className="px-3 py-2 text-xs text-muted-foreground">
                        H{r.conf.high} M{r.conf.medium} L{r.conf.low}
                      </td>
                      <td className="px-3 py-2">
                        {r.isDeclining ? (
                          <Badge variant="danger" className="gap-1">
                            <TrendingDown className="h-3 w-3" /> Declining
                          </Badge>
                        ) : (
                          <Badge variant="secondary">OK</Badge>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
