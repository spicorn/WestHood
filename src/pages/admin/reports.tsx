import { useMemo, useState } from 'react'
import { toast } from 'sonner'
import { CheckCircle2, Eye, FileCheck, MessageSquare, Send, Wand2 } from 'lucide-react'
import { useAppStore } from '@/stores/app-store'
import { exams, studentFullName } from '@/data/mock-data'
import type { ElectronicReport, ReportStatus, Student } from '@/data/types'
import { predictStudentSubjects } from '@/lib/results-prediction'
import { PageHeader, EmptyState } from '@/components/shared/empty-state'
import { ElectronicReportDocument } from '@/components/shared/electronic-report-document'
import type { MarksheetRow } from '@/components/shared/print-marksheet'
import { Card, CardContent, CardHeader, CardTitle, Badge } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Label, Textarea } from '@/components/ui/input'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Select } from '@/components/ui/tabs'
import { useClassSubjects } from '@/hooks/use-class-subjects'

const statusVariant: Record<ReportStatus, 'outline' | 'warning' | 'success'> = {
  draft: 'outline',
  finalized: 'warning',
  published: 'success',
}

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

export default function AdminReportsPage() {
  const students = useAppStore((s) => s.students)
  const classes = useAppStore((s) => s.classes)
  const grades = useAppStore((s) => s.grades)
  const subjects = useAppStore((s) => s.subjects)
  const homework = useAppStore((s) => s.homework)
  const meritRecords = useAppStore((s) => s.meritRecords)
  const electronicReports = useAppStore((s) => s.electronicReports)
  const guidanceNotes = useAppStore((s) => s.guidanceNotes)
  const settings = useAppStore((s) => s.settings)
  const upsertReport = useAppStore((s) => s.upsertReport)
  const setReportStatus = useAppStore((s) => s.setReportStatus)
  const bulkFinalizeReports = useAppStore((s) => s.bulkFinalizeReports)
  const setPrincipalComment = useAppStore((s) => s.setPrincipalComment)

  const terms = useMemo(() => {
    const fromExams = exams.map((e) => e.term)
    const fromReports = electronicReports.map((r) => r.term)
    return Array.from(new Set([...fromExams, ...fromReports, settings.currentTerm]))
  }, [electronicReports, settings.currentTerm])

  const [classId, setClassId] = useState(classes[0]?.id ?? '')
  const [term, setTerm] = useState(settings.currentTerm || terms[0] || 'Term 2 2026')
  const [commentTarget, setCommentTarget] = useState<ElectronicReport | null>(null)
  const [commentText, setCommentText] = useState('')
  const [viewReport, setViewReport] = useState<ElectronicReport | null>(null)

  const classSubjects = useClassSubjects(classId)
  const examForTerm = exams.find((e) => e.term === term) ?? exams[exams.length - 1]

  const classStudents = useMemo(
    () => students.filter((s) => s.classId === classId && s.status === 'active'),
    [students, classId],
  )

  const rows = useMemo(() => {
    return classStudents.map((student) => {
      let report = electronicReports.find((r) => r.studentId === student.id && r.term === term)
      return { student, report }
    })
  }, [classStudents, electronicReports, term])

  const ensureDraft = (student: Student, silent = false): ElectronicReport => {
    const existing = electronicReports.find((r) => r.studentId === student.id && r.term === term)
    if (existing) return existing
    // Prefer live store in case drafts were just created in this same action
    const live = useAppStore.getState().electronicReports.find(
      (r) => r.studentId === student.id && r.term === term,
    )
    if (live) return live
    const classSize = classStudents.length
    const ranked = [...classStudents].sort((a, b) => b.currentAvg - a.currentAvg)
    const position = ranked.findIndex((s) => s.id === student.id) + 1
    const draft: ElectronicReport = {
      id: `rpt-${student.id}-${term.replace(/\s+/g, '-').toLowerCase()}`,
      studentId: student.id,
      term,
      examId: examForTerm?.id ?? 'ex-mid',
      status: 'draft',
      classPosition: position || 1,
      classSize: classSize || 1,
      attendancePct: student.attendancePct,
      createdAt: new Date().toISOString().slice(0, 10),
    }
    upsertReport(draft)
    if (!silent) toast.success(`Draft report created for ${studentFullName(student)}.`)
    return draft
  }

  const openComment = (report: ElectronicReport) => {
    setCommentTarget(report)
    setCommentText(report.principalComment ?? '')
  }

  const saveComment = () => {
    if (!commentTarget) return
    setPrincipalComment(commentTarget.id, commentText.trim())
    toast.success('Principal comment saved.')
    setCommentTarget(null)
  }

  const finalize = (student: Student) => {
    const report = ensureDraft(student)
    setReportStatus(report.id, 'finalized')
    toast.success(`Report finalized for ${studentFullName(student)}.`)
  }

  const publish = (student: Student) => {
    const report = ensureDraft(student)
    if (report.status === 'draft') {
      setReportStatus(report.id, 'finalized')
    }
    setReportStatus(report.id, 'published')
    toast.success(`Report published for ${studentFullName(student)}.`)
  }

  const view = (student: Student) => {
    const report = ensureDraft(student)
    // Refresh from store after possible create
    const fresh =
      useAppStore.getState().electronicReports.find((r) => r.id === report.id) ?? report
    setViewReport(fresh)
  }

  const bulkFinalize = () => {
    const className = classes.find((c) => c.id === classId)?.name ?? 'class'
    classStudents.forEach((s) => ensureDraft(s, true))
    const ids = classStudents.map((s) => s.id)
    const n = bulkFinalizeReports(ids, term)
    toast.success(`Finalized ${n} draft report${n === 1 ? '' : 's'} for ${className}.`)
  }

  const draftCount = rows.filter((r) => !r.report || r.report.status === 'draft').length

  const viewStudent = viewReport ? students.find((s) => s.id === viewReport.studentId) : undefined
  const viewExam = viewReport ? exams.find((e) => e.id === viewReport.examId) ?? examForTerm : undefined
  const viewClass = viewStudent ? classes.find((c) => c.id === viewStudent.classId) : undefined
  const viewRows = viewReport && viewStudent ? buildRows(viewStudent.id, viewReport.examId, grades, subjects) : []
  const viewMerit = viewStudent
    ? meritRecords.filter((m) => m.studentId === viewStudent.id).slice(0, 8)
    : []
  const viewCareerInterest = viewStudent
    ? [...guidanceNotes]
        .filter((n) => n.studentId === viewStudent.id)
        .sort((a, b) => b.createdAt.localeCompare(a.createdAt))[0]?.careerInterest
    : undefined
  const viewPredictions =
    viewStudent && classSubjects.length
      ? predictStudentSubjects(
          viewStudent,
          classSubjects.map((s) => s.id),
          grades,
          exams,
          homework,
        )
      : []
  const subjectNames = Object.fromEntries(subjects.map((s) => [s.id, s.name]))

  return (
    <div>
      <PageHeader
        title="Electronic Reports"
        description="Draft, finalize, and publish term report cards with principal comments."
        actions={
          <Button onClick={bulkFinalize} disabled={draftCount === 0}>
            <FileCheck className="mr-2 h-4 w-4" />
            Finalize all {classes.find((c) => c.id === classId)?.name ?? ''} drafts
          </Button>
        }
      />

      <div className="mb-4 flex flex-wrap gap-3">
        <div className="space-y-1">
          <Label className="text-xs">Class</Label>
          <Select value={classId} onChange={(e) => setClassId(e.target.value)} className="w-48">
            {classes.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </Select>
        </div>
        <div className="space-y-1">
          <Label className="text-xs">Term</Label>
          <Select value={term} onChange={(e) => setTerm(e.target.value)} className="w-48">
            {terms.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </Select>
        </div>
      </div>

      {classStudents.length === 0 ? (
        <EmptyState title="No students" description="This class has no active students." />
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>
              {classes.find((c) => c.id === classId)?.name} · {term}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto rounded-lg border">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b bg-muted/50 text-left">
                    <th className="px-4 py-2 font-semibold text-muted-foreground">Student</th>
                    <th className="px-4 py-2 font-semibold text-muted-foreground">Status</th>
                    <th className="px-4 py-2 font-semibold text-muted-foreground">Position</th>
                    <th className="px-4 py-2 font-semibold text-muted-foreground">Attendance</th>
                    <th className="px-4 py-2 font-semibold text-muted-foreground">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map(({ student, report }) => (
                    <tr key={student.id} className="border-b last:border-0">
                      <td className="px-4 py-2 font-medium">{studentFullName(student)}</td>
                      <td className="px-4 py-2">
                        {report ? (
                          <Badge variant={statusVariant[report.status]}>{report.status}</Badge>
                        ) : (
                          <Badge variant="outline">no draft</Badge>
                        )}
                      </td>
                      <td className="px-4 py-2 text-muted-foreground">
                        {report ? `${report.classPosition} / ${report.classSize}` : '—'}
                      </td>
                      <td className="px-4 py-2">{report?.attendancePct ?? student.attendancePct}%</td>
                      <td className="px-4 py-2">
                        <div className="flex flex-wrap gap-1.5">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              const r = ensureDraft(student)
                              openComment(r)
                            }}
                          >
                            <MessageSquare className="mr-1 h-3.5 w-3.5" /> Comment
                          </Button>
                          {(!report || report.status === 'draft') && (
                            <Button size="sm" variant="outline" onClick={() => finalize(student)}>
                              <CheckCircle2 className="mr-1 h-3.5 w-3.5" /> Finalize
                            </Button>
                          )}
                          {report?.status !== 'published' && (
                            <Button size="sm" variant="outline" onClick={() => publish(student)}>
                              <Send className="mr-1 h-3.5 w-3.5" /> Publish
                            </Button>
                          )}
                          <Button size="sm" onClick={() => view(student)}>
                            <Eye className="mr-1 h-3.5 w-3.5" /> View
                          </Button>
                          {!report && (
                            <Button size="sm" variant="secondary" onClick={() => ensureDraft(student)}>
                              <Wand2 className="mr-1 h-3.5 w-3.5" /> Create draft
                            </Button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}

      <Dialog open={!!commentTarget} onOpenChange={(v) => !v && setCommentTarget(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Principal comment</DialogTitle>
            <DialogDescription>Appears on the published report card under Head&apos;s Comment.</DialogDescription>
          </DialogHeader>
          <Textarea
            rows={5}
            value={commentText}
            onChange={(e) => setCommentText(e.target.value)}
            placeholder="Write the Head's comment…"
          />
          <DialogFooter>
            <Button variant="outline" onClick={() => setCommentTarget(null)}>
              Cancel
            </Button>
            <Button onClick={saveComment}>Save comment</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={!!viewReport} onOpenChange={(v) => !v && setViewReport(null)}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Report card</DialogTitle>
          </DialogHeader>
          {viewReport && viewStudent && viewExam && (
            <>
              <ElectronicReportDocument
                student={viewStudent}
                classRoom={viewClass}
                exam={viewExam}
                report={viewReport}
                rows={viewRows}
                meritRecords={viewMerit}
                predictions={viewPredictions}
                subjectNames={subjectNames}
                careerInterest={viewCareerInterest}
                leadershipRole={viewStudent.leadershipRole}
              />
              <DialogFooter className="no-print">
                <Button variant="outline" onClick={() => window.print()}>
                  Print
                </Button>
                <Button onClick={() => setViewReport(null)}>Close</Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
