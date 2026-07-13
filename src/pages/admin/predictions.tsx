import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { AlertTriangle, TrendingDown } from 'lucide-react'
import { useAppStore } from '@/stores/app-store'
import { exams, studentFullName } from '@/data/mock-data'
import { overallTrendScore, predictStudentSubjects } from '@/lib/results-prediction'
import { PageHeader, EmptyState } from '@/components/shared/empty-state'
import { PredictionDisclaimer } from '@/components/shared/subject-prediction'
import { Card, CardContent, CardHeader, CardTitle, Badge } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/input'
import { Select } from '@/components/ui/tabs'
import { useClassSubjects } from '@/hooks/use-class-subjects'

function riskFlags(
  student: { id: string; attendancePct: number; previousAvg: number; currentAvg: number },
  invoices: { studentId: string; status: string }[],
) {
  const flags: string[] = []
  if (student.attendancePct < 80) flags.push(`Attendance ${student.attendancePct}%`)
  if (student.previousAvg - student.currentAvg > 10)
    flags.push(`Grade dropped ${Math.round(student.previousAvg - student.currentAvg)} pts`)
  if (invoices.some((inv) => inv.studentId === student.id && inv.status === 'overdue'))
    flags.push('Overdue fees')
  return flags
}

export default function AdminPredictionsPage() {
  const students = useAppStore((s) => s.students)
  const classes = useAppStore((s) => s.classes)
  const grades = useAppStore((s) => s.grades)
  const homework = useAppStore((s) => s.homework)
  const invoices = useAppStore((s) => s.invoices)

  const [classId, setClassId] = useState(classes.find((c) => c.id === 'c-f4')?.id ?? classes[0]?.id ?? '')
  const classSubjects = useClassSubjects(classId)
  const subjectIds = classSubjects.map((s) => s.id)

  const classStudents = useMemo(
    () => students.filter((s) => s.classId === classId && s.status === 'active'),
    [students, classId],
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
        const flags = riskFlags(student, invoices)
        const needsAttention = declining > 0 && flags.length >= 1
        return {
          student,
          predictions,
          avgDelta,
          declining,
          improving,
          conf,
          flags,
          needsAttention,
          isDeclining: avgDelta <= -3 || declining > 0,
        }
      })
      .sort((a, b) => a.avgDelta - b.avgDelta)
  }, [classStudents, subjectIds, grades, homework, invoices])

  const attention = rows.filter((r) => r.needsAttention && r.isDeclining)

  return (
    <div>
      <PageHeader
        title="Results Predictions"
        description="Class-wide trend projections based on past exam marks, attendance, and homework."
      />

      <PredictionDisclaimer className="mb-4" />

      <div className="mb-4 space-y-1">
        <Label className="text-xs">Class</Label>
        <Select value={classId} onChange={(e) => setClassId(e.target.value)} className="w-56">
          {classes.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </Select>
      </div>

      {attention.length > 0 && (
        <Card className="mb-4 border-red-200 bg-red-50/50">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-red-800 text-base">
              <AlertTriangle className="h-5 w-5" /> Needs Attention — declining + other risk flags
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 text-sm">
              {attention.map(({ student, flags, declining, avgDelta }) => (
                <li key={student.id} className="flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <span className="font-medium">{studentFullName(student)}</span>
                    <span className="text-muted-foreground">
                      {' '}
                      · {declining} declining subject{declining === 1 ? '' : 's'} · avg Δ {avgDelta.toFixed(1)}
                    </span>
                    <div className="mt-0.5 flex flex-wrap gap-1">
                      {flags.map((f) => (
                        <Badge key={f} variant="danger">
                          {f}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  <Button size="sm" variant="outline" asChild>
                    <Link to={`/admin/students/${student.id}`}>Profile</Link>
                  </Button>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}

      {rows.length === 0 ? (
        <EmptyState title="No students" description="Select a class with enrolled students." />
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>
              {classes.find((c) => c.id === classId)?.name} projections
              <span className="ml-2 text-sm font-normal text-muted-foreground">
                Sorted by biggest decline first
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto rounded-lg border">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b bg-muted/50 text-left">
                    <th className="px-4 py-2 font-semibold text-muted-foreground">Student</th>
                    <th className="px-4 py-2 font-semibold text-muted-foreground">Avg delta</th>
                    <th className="px-4 py-2 font-semibold text-muted-foreground">Declining</th>
                    <th className="px-4 py-2 font-semibold text-muted-foreground">Improving</th>
                    <th className="px-4 py-2 font-semibold text-muted-foreground">Confidence mix</th>
                    <th className="px-4 py-2 font-semibold text-muted-foreground">Flag</th>
                    <th className="px-4 py-2 font-semibold text-muted-foreground" />
                  </tr>
                </thead>
                <tbody>
                  {rows.map((r) => (
                    <tr key={r.student.id} className="border-b last:border-0">
                      <td className="px-4 py-2 font-medium">{studentFullName(r.student)}</td>
                      <td className="px-4 py-2">
                        <span className={r.avgDelta < 0 ? 'text-red-700 font-semibold' : r.avgDelta > 0 ? 'text-forest-700 font-semibold' : ''}>
                          {r.avgDelta > 0 ? '+' : ''}
                          {r.avgDelta.toFixed(1)}
                        </span>
                      </td>
                      <td className="px-4 py-2">{r.declining}</td>
                      <td className="px-4 py-2">{r.improving}</td>
                      <td className="px-4 py-2 text-xs text-muted-foreground">
                        H {r.conf.high} · M {r.conf.medium} · L {r.conf.low}
                      </td>
                      <td className="px-4 py-2">
                        {r.isDeclining ? (
                          <Badge variant="danger" className="gap-1">
                            <TrendingDown className="h-3 w-3" /> Declining
                          </Badge>
                        ) : (
                          <Badge variant="secondary">OK</Badge>
                        )}
                      </td>
                      <td className="px-4 py-2">
                        <Button size="sm" variant="outline" asChild>
                          <Link to={`/admin/students/${r.student.id}`}>Profile</Link>
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
