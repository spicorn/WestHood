import { useMemo, useState } from 'react'
import { Eye, GitCompare, Printer } from 'lucide-react'
import { useAppStore } from '@/stores/app-store'
import { useSelectedChild } from '@/hooks/use-parent'
import { exams } from '@/data/mock-data'
import type { ElectronicReport } from '@/data/types'
import { predictStudentSubjects } from '@/lib/results-prediction'
import { ChildSwitcher } from '@/components/parent/child-switcher'
import { PageHeader, EmptyState } from '@/components/shared/empty-state'
import { ElectronicReportDocument } from '@/components/shared/electronic-report-document'
import type { MarksheetRow } from '@/components/shared/print-marksheet'
import { Card, CardContent, CardDescription, CardHeader, CardTitle, Badge } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/tabs'
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { formatDate } from '@/lib/utils'
import { useClassSubjects } from '@/hooks/use-class-subjects'

function buildRows(
  studentId: string,
  examId: string,
  grades: ReturnType<typeof useAppStore.getState>['grades'],
  subjects: ReturnType<typeof useAppStore.getState>['subjects'],
): MarksheetRow[] {
  return grades
    .filter((g) => g.studentId === studentId && g.examId === examId)
    .map((g) => {
      const subject = subjects.find((s) => s.id === g.subjectId)
      return {
        subjectName: subject?.name ?? 'Subject',
        subjectCode: subject?.code ?? g.subjectId,
        mark: g.mark,
        comment: g.comment,
      }
    })
}

export default function ParentReportsPage() {
  const child = useSelectedChild()
  const classes = useAppStore((s) => s.classes)
  const grades = useAppStore((s) => s.grades)
  const subjects = useAppStore((s) => s.subjects)
  const homework = useAppStore((s) => s.homework)
  const meritRecords = useAppStore((s) => s.meritRecords)
  const electronicReports = useAppStore((s) => s.electronicReports)
  const guidanceNotes = useAppStore((s) => s.guidanceNotes)

  const [viewReport, setViewReport] = useState<ElectronicReport | null>(null)
  const [compareIds, setCompareIds] = useState<string[]>([])
  const [compareOpen, setCompareOpen] = useState(false)

  const classSubjects = useClassSubjects(child?.classId)
  const published = useMemo(
    () =>
      electronicReports
        .filter((r) => child && r.studentId === child.id && r.status === 'published')
        .sort((a, b) => b.term.localeCompare(a.term)),
    [electronicReports, child],
  )

  const toggleCompare = (id: string) => {
    setCompareIds((prev) => {
      if (prev.includes(id)) return prev.filter((x) => x !== id)
      if (prev.length >= 2) return [prev[1], id]
      return [...prev, id]
    })
  }

  const compareReports = published.filter((r) => compareIds.includes(r.id))
  const classRoom = classes.find((c) => c.id === child?.classId)
  const subjectNames = Object.fromEntries(subjects.map((s) => [s.id, s.name]))

  const renderDoc = (report: ElectronicReport) => {
    if (!child) return null
    const exam = exams.find((e) => e.id === report.examId) ?? exams[0]
    if (!exam) return null
    const rows = buildRows(child.id, report.examId, grades, subjects)
    const merit = meritRecords.filter((m) => m.studentId === child.id)
    const careerInterest = [...guidanceNotes]
      .filter((n) => n.studentId === child.id)
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt))[0]?.careerInterest
    const predictions = predictStudentSubjects(
      child,
      classSubjects.map((s) => s.id),
      grades,
      exams,
      homework,
    )
    return (
      <ElectronicReportDocument
        student={child}
        classRoom={classRoom}
        exam={exam}
        report={report}
        rows={rows}
        meritRecords={merit}
        predictions={predictions}
        subjectNames={subjectNames}
        careerInterest={careerInterest}
        leadershipRole={child.leadershipRole}
      />
    )
  }

  if (!child) return <EmptyState title="No children linked" description="No students are linked to your account yet." />

  return (
    <div>
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <PageHeader
          title="Reports"
          description={`Published report cards for ${child.firstName}. Select two to compare side by side.`}
        />
        <ChildSwitcher />
      </div>

      {published.length === 0 ? (
        <EmptyState title="No published reports" description="Published report cards will appear here when available." />
      ) : (
        <>
          <div className="mb-3 flex flex-wrap items-center gap-2">
            <Button
              size="sm"
              disabled={compareIds.length !== 2}
              onClick={() => setCompareOpen(true)}
            >
              <GitCompare className="mr-1.5 h-3.5 w-3.5" /> Compare selected ({compareIds.length}/2)
            </Button>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Report archive</CardTitle>
              <CardDescription>Past and current published terms.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto rounded-lg border">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b bg-muted/50 text-left">
                      <th className="px-4 py-2 font-semibold text-muted-foreground w-10">Compare</th>
                      <th className="px-4 py-2 font-semibold text-muted-foreground">Term</th>
                      <th className="px-4 py-2 font-semibold text-muted-foreground">Position</th>
                      <th className="px-4 py-2 font-semibold text-muted-foreground">Attendance</th>
                      <th className="px-4 py-2 font-semibold text-muted-foreground">Published</th>
                      <th className="px-4 py-2 font-semibold text-muted-foreground" />
                    </tr>
                  </thead>
                  <tbody>
                    {published.map((r) => (
                      <tr key={r.id} className="border-b last:border-0">
                        <td className="px-4 py-2">
                          <Checkbox
                            checked={compareIds.includes(r.id)}
                            onCheckedChange={() => toggleCompare(r.id)}
                          />
                        </td>
                        <td className="px-4 py-2 font-medium">
                          {r.term} <Badge variant="success" className="ml-1">published</Badge>
                        </td>
                        <td className="px-4 py-2">
                          {r.classPosition} / {r.classSize}
                        </td>
                        <td className="px-4 py-2">{r.attendancePct}%</td>
                        <td className="px-4 py-2 text-muted-foreground">
                          {r.publishedAt ? formatDate(r.publishedAt.slice(0, 10)) : '—'}
                        </td>
                        <td className="px-4 py-2">
                          <Button size="sm" onClick={() => setViewReport(r)}>
                            <Eye className="mr-1.5 h-3.5 w-3.5" /> View
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </>
      )}

      <Dialog open={!!viewReport} onOpenChange={(v) => !v && setViewReport(null)}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{viewReport?.term} report</DialogTitle>
          </DialogHeader>
          {viewReport && renderDoc(viewReport)}
          <DialogFooter className="no-print">
            <Button variant="outline" onClick={() => window.print()}>
              <Printer className="mr-1.5 h-3.5 w-3.5" /> Print
            </Button>
            <Button onClick={() => setViewReport(null)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={compareOpen} onOpenChange={setCompareOpen}>
        <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Compare reports</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 lg:grid-cols-2">
            {compareReports.map((r) => (
              <div key={r.id}>
                <p className="mb-2 font-display font-semibold text-navy-800">{r.term}</p>
                {renderDoc(r)}
              </div>
            ))}
          </div>
          <DialogFooter className="no-print">
            <Button onClick={() => setCompareOpen(false)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
