import { useMemo } from 'react'
import { toast } from 'sonner'
import {
  Download,
  FileSpreadsheet,
  Printer,
  Users,
  Wallet,
  ClipboardCheck,
  ShieldAlert,
} from 'lucide-react'
import { useAppStore } from '@/stores/app-store'
import { PageHeader, StatCard } from '@/components/shared/empty-state'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { downloadCsv, printBoardPack } from '@/lib/export'
import { studentFullName } from '@/data/mock-data'
import { formatCurrency } from '@/lib/utils'

export default function AdminAnalyticsExportPage() {
  const students = useAppStore((s) => s.students)
  const classes = useAppStore((s) => s.classes)
  const invoices = useAppStore((s) => s.invoices)
  const meritRecords = useAppStore((s) => s.meritRecords)

  const active = useMemo(() => students.filter((s) => s.status === 'active'), [students])

  const enrolmentByClass = useMemo(() => {
    return classes.map((c) => ({
      classId: c.id,
      name: c.name,
      count: active.filter((s) => s.classId === c.id).length,
    }))
  }, [classes, active])

  const outstandingFees = invoices.reduce((sum, i) => sum + Math.max(0, i.amount - i.paid), 0)
  const demerits = meritRecords.filter((m) => m.type === 'demerit' || !!m.severity)
  const avgAttendance =
    active.length === 0
      ? 0
      : Math.round(active.reduce((s, x) => s + x.attendancePct, 0) / active.length)

  const className = (id: string) => classes.find((c) => c.id === id)?.name ?? id

  const exportEnrolment = () => {
    downloadCsv(
      'westwood-enrolment.csv',
      ['Class', 'Grade', 'Level', 'Active students'],
      classes.map((c) => [
        c.name,
        c.grade,
        c.level,
        active.filter((s) => s.classId === c.id).length,
      ]),
    )
    toast.success('Enrolment CSV downloaded')
  }

  const exportFees = () => {
    downloadCsv(
      'westwood-fees.csv',
      ['Invoice ID', 'Student', 'Class', 'Description', 'Term', 'Amount', 'Paid', 'Balance', 'Status'],
      invoices.map((inv) => {
        const stu = students.find((s) => s.id === inv.studentId)
        return [
          inv.id,
          stu ? studentFullName(stu) : inv.studentId,
          stu ? className(stu.classId) : '',
          inv.description,
          inv.term,
          inv.amount,
          inv.paid,
          Math.max(0, inv.amount - inv.paid),
          inv.status,
        ]
      }),
    )
    toast.success('Fees CSV downloaded')
  }

  const exportAttendance = () => {
    downloadCsv(
      'westwood-attendance.csv',
      ['Admission no.', 'Student', 'Class', 'Attendance %', 'Status'],
      active.map((s) => [
        s.admissionNo,
        studentFullName(s),
        className(s.classId),
        s.attendancePct,
        s.status,
      ]),
    )
    toast.success('Attendance CSV downloaded')
  }

  const exportDiscipline = () => {
    downloadCsv(
      'westwood-discipline.csv',
      ['Date', 'Student', 'Class', 'Type', 'Severity', 'Points', 'Reason'],
      demerits.map((m) => {
        const stu = students.find((s) => s.id === m.studentId)
        return [
          m.date,
          stu ? studentFullName(stu) : m.studentId,
          stu ? className(stu.classId) : '',
          m.type,
          m.severity ?? '',
          m.points,
          m.reason,
        ]
      }),
    )
    toast.success('Discipline CSV downloaded')
  }

  const printPack = () => {
    const enrolmentRows = enrolmentByClass
      .map(
        (r) =>
          `<tr><td>${r.name}</td><td>${r.count}</td></tr>`,
      )
      .join('')
    const feeRows = invoices
      .slice(0, 40)
      .map((inv) => {
        const stu = students.find((s) => s.id === inv.studentId)
        return `<tr><td>${stu ? studentFullName(stu) : inv.studentId}</td><td>${inv.description}</td><td>$${inv.amount.toFixed(2)}</td><td>$${inv.paid.toFixed(2)}</td><td>${inv.status}</td></tr>`
      })
      .join('')
    const attRows = active
      .slice()
      .sort((a, b) => a.attendancePct - b.attendancePct)
      .slice(0, 40)
      .map(
        (s) =>
          `<tr><td>${studentFullName(s)}</td><td>${className(s.classId)}</td><td>${s.attendancePct}%</td></tr>`,
      )
      .join('')
    const discRows = demerits
      .slice(0, 40)
      .map((m) => {
        const stu = students.find((s) => s.id === m.studentId)
        return `<tr><td>${m.date}</td><td>${stu ? studentFullName(stu) : m.studentId}</td><td>${m.severity ?? m.type}</td><td>${m.reason}</td></tr>`
      })
      .join('')

    printBoardPack('Board Pack — Analytics Summary', [
      `<div class="kpi"><b>${active.length}</b>Active students</div>
       <div class="kpi"><b>${formatCurrency(outstandingFees)}</b>Outstanding fees</div>
       <div class="kpi"><b>${avgAttendance}%</b>Avg attendance</div>
       <div class="kpi"><b>${demerits.length}</b>Discipline entries</div>`,
      `<h2>Enrolment by class</h2>
       <table><thead><tr><th>Class</th><th>Students</th></tr></thead><tbody>${enrolmentRows}</tbody></table>`,
      `<h2>Fees (sample)</h2>
       <table><thead><tr><th>Student</th><th>Description</th><th>Amount</th><th>Paid</th><th>Status</th></tr></thead><tbody>${feeRows}</tbody></table>`,
      `<h2>Attendance (lowest first)</h2>
       <table><thead><tr><th>Student</th><th>Class</th><th>%</th></tr></thead><tbody>${attRows}</tbody></table>`,
      `<h2>Discipline</h2>
       <table><thead><tr><th>Date</th><th>Student</th><th>Severity</th><th>Reason</th></tr></thead><tbody>${discRows}</tbody></table>`,
    ])
    toast.success('Board pack opened for printing')
  }

  return (
    <div>
      <PageHeader
        title="Analytics & Export"
        description="Headline figures for leadership, plus CSV downloads and a printable board pack."
      />

      <div className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Active enrolment"
          value={active.length}
          icon={Users}
          accent="bg-navy-50 text-navy-700"
        />
        <StatCard
          label="Outstanding fees"
          value={formatCurrency(outstandingFees)}
          icon={Wallet}
          accent="bg-gold-50 text-gold-700"
        />
        <StatCard
          label="Avg attendance"
          value={`${avgAttendance}%`}
          icon={ClipboardCheck}
          accent="bg-forest-50 text-forest-700"
        />
        <StatCard
          label="Discipline entries"
          value={demerits.length}
          icon={ShieldAlert}
          accent="bg-red-50 text-red-700"
        />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <FileSpreadsheet className="h-4 w-4 text-navy-600" /> CSV exports
            </CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-2">
            <Button variant="outline" className="justify-start" onClick={exportEnrolment}>
              <Download className="mr-2 h-4 w-4" /> Export Enrolment CSV (by class)
            </Button>
            <Button variant="outline" className="justify-start" onClick={exportFees}>
              <Download className="mr-2 h-4 w-4" /> Export Fees CSV (invoices)
            </Button>
            <Button variant="outline" className="justify-start" onClick={exportAttendance}>
              <Download className="mr-2 h-4 w-4" /> Export Attendance CSV
            </Button>
            <Button variant="outline" className="justify-start" onClick={exportDiscipline}>
              <Download className="mr-2 h-4 w-4" /> Export Discipline CSV (demerits)
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Printer className="h-4 w-4 text-forest-600" /> Board pack
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-sm text-muted-foreground">
              Opens a print-ready summary with enrolment, fees, attendance, and discipline tables for
              governors and the Head.
            </p>
            <Button onClick={printPack}>
              <Printer className="mr-2 h-4 w-4" /> Print Board Pack PDF
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
