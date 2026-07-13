import { useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { toast } from 'sonner'
import {
  Award,
  ArrowLeft,
  CalendarCheck,
  CheckCircle2,
  Compass,
  Mail,
  Minus,
  Pencil,
  Phone,
  Plus,
  RotateCcw,
  Send,
  Wallet,
} from 'lucide-react'
import { PageHeader, EmptyState } from '@/components/shared/empty-state'
import { SubjectCombinationAdvisor } from '@/components/shared/subject-combination-advisor'
import { EscalationBadge, LeadershipBadge } from '@/components/shared/leadership-badge'
import { Card, CardContent, CardHeader, CardTitle, Badge } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input, Label, Textarea } from '@/components/ui/input'
import { Avatar, Select } from '@/components/ui/tabs'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { useAppStore } from '@/stores/app-store'
import { exams, getGradeLetter, LEADERSHIP_LABELS, parents as allParents, studentFullName } from '@/data/mock-data'
import type {
  DisciplineSeverity,
  GuidanceNote,
  Invoice,
  LeadershipRole,
  MeritRecord,
  ParentInvite,
} from '@/data/types'
import { adviseALevelStreams } from '@/lib/alevel-advisor'
import { formatCurrency, formatDate } from '@/lib/utils'

const invoiceStatusVariant: Record<Invoice['status'], 'success' | 'warning' | 'danger' | 'secondary'> = {
  paid: 'success',
  partial: 'warning',
  outstanding: 'secondary',
  overdue: 'danger',
}

const SEVERITY_VARIANT: Record<DisciplineSeverity, 'warning' | 'danger'> = {
  minor: 'warning',
  major: 'danger',
  serious: 'danger',
}

const editSchema = z.object({
  firstName: z.string().min(1, 'Required'),
  lastName: z.string().min(1, 'Required'),
  admissionNo: z.string().min(1, 'Required'),
  dob: z.string().min(1, 'Required'),
  classId: z.string().min(1, 'Required'),
  gender: z.enum(['M', 'F']),
})
type EditFormValues = z.infer<typeof editSchema>

const inviteSchema = z.object({
  name: z.string().min(1, 'Guardian name is required'),
  email: z.string().email('Enter a valid email'),
  phone: z.string().min(6, 'Enter a valid phone number'),
  relationship: z.string().min(1, 'Required'),
})
type InviteFormValues = z.infer<typeof inviteSchema>

let entitySeq = 0
function nextEntityId(prefix: string) {
  entitySeq += 1
  return `${prefix}-${Date.now()}-${entitySeq}`
}

export default function AdminStudentDetail() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const students = useAppStore((s) => s.students)
  const classes = useAppStore((s) => s.classes)
  const invoices = useAppStore((s) => s.invoices)
  const grades = useAppStore((s) => s.grades)
  const subjects = useAppStore((s) => s.subjects)
  const homework = useAppStore((s) => s.homework)
  const studentAttendance = useAppStore((s) => s.studentAttendance)
  const parentInvites = useAppStore((s) => s.parentInvites)
  const meritRecords = useAppStore((s) => s.meritRecords)
  const guidanceNotes = useAppStore((s) => s.guidanceNotes)
  const detentionRecords = useAppStore((s) => s.detentionRecords)
  const upsertStudent = useAppStore((s) => s.upsertStudent)
  const upsertInvite = useAppStore((s) => s.upsertInvite)
  const addMerit = useAppStore((s) => s.addMerit)
  const addMeritWithEscalation = useAppStore((s) => s.addMeritWithEscalation)
  const addGuidanceNote = useAppStore((s) => s.addGuidanceNote)
  const setLeadershipRole = useAppStore((s) => s.setLeadershipRole)
  const upsertDetention = useAppStore((s) => s.upsertDetention)

  const [editOpen, setEditOpen] = useState(false)
  const [inviteOpen, setInviteOpen] = useState(false)
  const [meritForm, setMeritForm] = useState<{
    type: MeritRecord['type']
    points: number
    reason: string
    severity: DisciplineSeverity
  }>({
    type: 'merit',
    points: 1,
    reason: '',
    severity: 'minor',
  })
  const [guidanceForm, setGuidanceForm] = useState({
    careerInterest: '',
    tags: '',
    pathwayNotes: '',
  })
  const [detentionOpen, setDetentionOpen] = useState(false)
  const [detentionMerit, setDetentionMerit] = useState<MeritRecord | null>(null)
  const [scheduledAt, setScheduledAt] = useState('2026-07-16T15:30')
  const [location, setLocation] = useState('Library Room B')
  const [detentionNotes, setDetentionNotes] = useState('')

  const student = useMemo(() => students.find((s) => s.id === id), [students, id])

  const studentGrades = useMemo(() => grades.filter((g) => g.studentId === id), [grades, id])
  const studentInvoices = useMemo(() => invoices.filter((i) => i.studentId === id), [invoices, id])
  const studentMerit = useMemo(() => meritRecords.filter((m) => m.studentId === id), [meritRecords, id])
  const studentInvites = useMemo(() => parentInvites.filter((i) => i.studentId === id), [parentInvites, id])
  const studentGuidance = useMemo(
    () =>
      guidanceNotes
        .filter((n) => n.studentId === id)
        .sort((a, b) => b.createdAt.localeCompare(a.createdAt)),
    [guidanceNotes, id],
  )
  const attendanceRecords = useMemo(
    () => studentAttendance.filter((a) => a.studentId === id).sort((a, b) => a.date.localeCompare(b.date)),
    [studentAttendance, id],
  )
  const studentDetentions = useMemo(
    () => detentionRecords.filter((d) => d.studentId === id).sort((a, b) => b.scheduledAt.localeCompare(a.scheduledAt)),
    [detentionRecords, id],
  )

  const streamAdvice = useMemo(
    () => (student ? adviseALevelStreams(student, grades, subjects, homework) : []),
    [student, grades, subjects, homework],
  )

  const editForm = useForm<EditFormValues>({
    resolver: zodResolver(editSchema),
    values: student
      ? {
          firstName: student.firstName,
          lastName: student.lastName,
          admissionNo: student.admissionNo,
          dob: student.dob,
          classId: student.classId,
          gender: student.gender,
        }
      : undefined,
  })

  const inviteForm = useForm<InviteFormValues>({
    resolver: zodResolver(inviteSchema),
    defaultValues: { name: '', email: '', phone: '', relationship: 'Parent' },
  })

  if (!student) {
    return (
      <EmptyState
        title="Student not found"
        description="This student record may have been removed."
        action={{ label: 'Back to Students', onClick: () => navigate('/admin/students') }}
      />
    )
  }

  const guardians = allParents.filter((p) => student.parentIds.includes(p.id))
  const className = classes.find((c) => c.id === student.classId)?.name ?? '—'
  const meritTotal = studentMerit.reduce((sum, m) => sum + m.points, 0)
  const isForm4 = student.classId === 'c-f4'

  const gradesByExam = exams.map((exam) => ({
    exam,
    entries: studentGrades.filter((g) => g.examId === exam.id),
  }))

  const onEditSubmit = editForm.handleSubmit((values) => {
    upsertStudent({ ...student, ...values })
    toast.success('Student profile updated.')
    setEditOpen(false)
  })

  const onInviteSubmit = inviteForm.handleSubmit((values) => {
    const inviteId = nextEntityId('inv')
    upsertInvite({
      id: inviteId,
      studentId: student.id,
      name: values.name,
      email: values.email,
      phone: values.phone,
      relationship: values.relationship,
      status: 'pending',
      sentAt: new Date().toISOString().slice(0, 10),
      invitedBy: 'u-admin',
    })
    toast.success(`Invitation sent to ${values.name}.`)
    setInviteOpen(false)
    inviteForm.reset()
  })

  const resendInvite = (invite: ParentInvite) => {
    upsertInvite({ ...invite, sentAt: new Date().toISOString().slice(0, 10) })
    toast.success(`Invitation resent to ${invite.name}.`)
  }

  const simulateAccept = (invite: ParentInvite) => {
    upsertInvite({ ...invite, status: 'accepted' })
    toast.success(`${invite.name} accepted the invitation.`)
  }

  const submitMerit = () => {
    if (!meritForm.reason.trim()) {
      toast.error('Please add a reason for this merit/demerit entry.')
      return
    }
    const entryId = nextEntityId('mr')
    if (meritForm.type === 'demerit') {
      const { escalated } = addMeritWithEscalation({
        id: entryId,
        studentId: student.id,
        points: -Math.abs(meritForm.points),
        type: 'demerit',
        reason: meritForm.reason,
        date: new Date().toISOString().slice(0, 10),
        loggedBy: 'u-admin',
        severity: meritForm.severity,
      })
      toast.success(
        escalated
          ? 'Demerit logged — student flagged for follow-up.'
          : 'Discipline log updated.',
      )
    } else {
      addMerit({
        id: entryId,
        studentId: student.id,
        points: Math.abs(meritForm.points),
        type: 'merit',
        reason: meritForm.reason,
        date: new Date().toISOString().slice(0, 10),
        loggedBy: 'u-admin',
      })
      toast.success('Merit log updated.')
    }
    setMeritForm({ type: 'merit', points: 1, reason: '', severity: 'minor' })
  }

  const submitGuidance = () => {
    if (!guidanceForm.careerInterest.trim() || !guidanceForm.pathwayNotes.trim()) {
      toast.error('Career interest and pathway notes are required.')
      return
    }
    const note: GuidanceNote = {
      id: nextEntityId('gn'),
      studentId: student.id,
      careerInterest: guidanceForm.careerInterest.trim(),
      tags: guidanceForm.tags
        .split(',')
        .map((t) => t.trim())
        .filter(Boolean),
      pathwayNotes: guidanceForm.pathwayNotes.trim(),
      loggedBy: 'u-admin',
      loggedByName: 'Admin',
      createdAt: new Date().toISOString(),
    }
    addGuidanceNote(note)
    toast.success('Guidance note added.')
    setGuidanceForm({ careerInterest: '', tags: '', pathwayNotes: '' })
  }

  const openDetention = (m: MeritRecord) => {
    setDetentionMerit(m)
    setScheduledAt('2026-07-16T15:30')
    setLocation('Library Room B')
    setDetentionNotes('')
    setDetentionOpen(true)
  }

  const assignDetention = () => {
    if (!detentionMerit) return
    if (!scheduledAt || !location.trim()) {
      toast.error('Schedule time and location are required.')
      return
    }
    upsertDetention({
      id: nextEntityId('det'),
      studentId: student.id,
      meritId: detentionMerit.id,
      scheduledAt: scheduledAt.length === 16 ? `${scheduledAt}:00` : scheduledAt,
      location: location.trim(),
      status: 'scheduled',
      assignedBy: 'u-admin',
      notes: detentionNotes.trim() || undefined,
    })
    toast.success('Detention scheduled.')
    setDetentionOpen(false)
  }

  const onLeadershipChange = (role: LeadershipRole) => {
    setLeadershipRole(student.id, role)
    toast.success(role === 'none' ? 'Leadership role cleared.' : `Role set to ${LEADERSHIP_LABELS[role]}.`)
  }

  return (
    <div>
      <Button variant="ghost" size="sm" className="mb-2" onClick={() => navigate('/admin/students')}>
        <ArrowLeft className="h-4 w-4" /> Back to Students
      </Button>

      <PageHeader
        title={studentFullName(student)}
        description={`${className} · Admission No. ${student.admissionNo}`}
        actions={
          <Button variant="outline" onClick={() => setEditOpen(true)}>
            <Pencil className="h-4 w-4" /> Edit Profile
          </Button>
        }
      />

      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-1">
          <CardContent className="pt-5">
            <div className="flex items-center gap-4">
              <Avatar name={studentFullName(student)} size="lg" />
              <div className="space-y-1.5">
                <p className="font-display text-xl font-semibold">{studentFullName(student)}</p>
                <div className="flex flex-wrap gap-1.5">
                  <Badge variant={student.status === 'active' ? 'success' : 'secondary'}>{student.status}</Badge>
                  <LeadershipBadge role={student.leadershipRole} />
                  <EscalationBadge show={student.disciplineEscalated} />
                </div>
              </div>
            </div>
            <dl className="mt-5 space-y-2.5 text-sm">
              <div className="flex justify-between">
                <dt className="text-muted-foreground">Date of birth</dt>
                <dd className="font-medium">{formatDate(student.dob)}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-muted-foreground">Gender</dt>
                <dd className="font-medium">{student.gender === 'M' ? 'Male' : 'Female'}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-muted-foreground">Class</dt>
                <dd className="font-medium">{className}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-muted-foreground">Attendance</dt>
                <dd className={`font-medium ${student.attendancePct < 80 ? 'text-red-600' : ''}`}>{student.attendancePct}%</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-muted-foreground">Current avg.</dt>
                <dd className="font-medium">
                  {student.currentAvg}%{' '}
                  {student.previousAvg - student.currentAvg > 10 && (
                    <span className="text-xs text-red-600">(was {student.previousAvg}%)</span>
                  )}
                </dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-muted-foreground">Merit points</dt>
                <dd className={`font-medium ${meritTotal < 0 ? 'text-red-600' : 'text-forest-700'}`}>{meritTotal}</dd>
              </div>
            </dl>
            <div className="mt-4 space-y-1.5">
              <Label>Leadership role</Label>
              <Select
                value={student.leadershipRole ?? 'none'}
                onChange={(e) => onLeadershipChange(e.target.value as LeadershipRole)}
              >
                {(Object.keys(LEADERSHIP_LABELS) as LeadershipRole[]).map((role) => (
                  <option key={role} value={role}>
                    {role === 'none' ? 'No role' : LEADERSHIP_LABELS[role]}
                  </option>
                ))}
              </Select>
            </div>
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Guardians</CardTitle>
          </CardHeader>
          <CardContent>
            {guardians.length === 0 ? (
              <p className="text-sm text-muted-foreground">No guardians linked yet. Invite a parent below.</p>
            ) : (
              <div className="grid gap-3 sm:grid-cols-2">
                {guardians.map((g) => (
                  <div key={g.id} className="flex items-start gap-3 rounded-md border p-3">
                    <Avatar name={g.name} size="sm" />
                    <div className="min-w-0">
                      <p className="text-sm font-medium">{g.name}</p>
                      <p className="text-xs text-muted-foreground">{g.relationship}</p>
                      <p className="mt-1 flex items-center gap-1 text-xs text-muted-foreground">
                        <Mail className="h-3 w-3" /> {g.email}
                      </p>
                      <p className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Phone className="h-3 w-3" /> {g.phone}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {isForm4 && (
          <div className="lg:col-span-3">
            <SubjectCombinationAdvisor advice={streamAdvice} />
          </div>
        )}

        <Card className="lg:col-span-3">
          <CardHeader>
            <CardTitle>Marksheet</CardTitle>
          </CardHeader>
          <CardContent className="space-y-5">
            {gradesByExam.every((g) => g.entries.length === 0) ? (
              <p className="text-sm text-muted-foreground">No grade entries recorded yet.</p>
            ) : (
              gradesByExam
                .filter((g) => g.entries.length > 0)
                .map(({ exam, entries }) => (
                  <div key={exam.id}>
                    <h4 className="mb-2 font-display text-lg font-semibold">{exam.name}</h4>
                    <div className="overflow-x-auto rounded-lg border">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="border-b bg-muted/50 text-left">
                            <th className="px-4 py-2 font-semibold text-muted-foreground">Subject</th>
                            <th className="px-4 py-2 font-semibold text-muted-foreground">Mark</th>
                            <th className="px-4 py-2 font-semibold text-muted-foreground">Grade</th>
                            <th className="px-4 py-2 font-semibold text-muted-foreground">Comment</th>
                          </tr>
                        </thead>
                        <tbody>
                          {entries.map((entry) => (
                            <tr key={entry.id} className="border-b last:border-0">
                              <td className="px-4 py-2">{subjects.find((s) => s.id === entry.subjectId)?.name}</td>
                              <td className="px-4 py-2">{entry.mark}%</td>
                              <td className="px-4 py-2">
                                <Badge variant="outline">{getGradeLetter(entry.mark, exam)}</Badge>
                              </td>
                              <td className="px-4 py-2 text-muted-foreground">{entry.comment ?? '—'}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                ))
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CalendarCheck className="h-4 w-4" /> Attendance History
            </CardTitle>
          </CardHeader>
          <CardContent>
            {attendanceRecords.length === 0 ? (
              <p className="text-sm text-muted-foreground">No daily attendance records for this student.</p>
            ) : (
              <ul className="space-y-1.5">
                {attendanceRecords.map((a) => (
                  <li key={a.id} className="flex items-center justify-between rounded-md border px-3 py-1.5 text-sm">
                    <span>{formatDate(a.date, 'EEE, d MMM')}</span>
                    <Badge variant={a.status === 'present' ? 'success' : a.status === 'late' ? 'warning' : 'danger'}>
                      {a.status}
                    </Badge>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Wallet className="h-4 w-4" /> Fee Status
            </CardTitle>
          </CardHeader>
          <CardContent>
            {studentInvoices.length === 0 ? (
              <p className="text-sm text-muted-foreground">No invoices issued.</p>
            ) : (
              <ul className="space-y-2">
                {studentInvoices.map((inv) => (
                  <li key={inv.id} className="rounded-md border p-2.5 text-sm">
                    <div className="flex items-center justify-between">
                      <span className="font-medium">{inv.description}</span>
                      <Badge variant={invoiceStatusVariant[inv.status]}>{inv.status}</Badge>
                    </div>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {formatCurrency(inv.paid)} of {formatCurrency(inv.amount)} paid · due {formatDate(inv.dueDate)}
                    </p>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>

        <Card className="lg:col-span-3">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Parent Invitations</CardTitle>
            <Button size="sm" onClick={() => setInviteOpen(true)}>
              <Send className="h-3.5 w-3.5" /> Invite Parent
            </Button>
          </CardHeader>
          <CardContent>
            {studentInvites.length === 0 ? (
              <p className="text-sm text-muted-foreground">No invitations sent for this student yet.</p>
            ) : (
              <ul className="space-y-2">
                {studentInvites.map((inv) => (
                  <li key={inv.id} className="flex flex-wrap items-center justify-between gap-2 rounded-md border p-3">
                    <div>
                      <p className="text-sm font-medium">
                        {inv.name} <span className="text-xs text-muted-foreground">({inv.relationship})</span>
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {inv.email} · sent {formatDate(inv.sentAt)}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant={inv.status === 'accepted' ? 'success' : 'warning'}>{inv.status}</Badge>
                      {inv.status === 'pending' && (
                        <>
                          <Button variant="outline" size="sm" onClick={() => resendInvite(inv)}>
                            <RotateCcw className="h-3.5 w-3.5" /> Resend
                          </Button>
                          <Button variant="secondary" size="sm" onClick={() => simulateAccept(inv)}>
                            <CheckCircle2 className="h-3.5 w-3.5" /> Simulate Accept
                          </Button>
                        </>
                      )}
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>

        <Card className="lg:col-span-3">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Compass className="h-4 w-4" /> Guidance
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3 rounded-md border bg-muted/30 p-3">
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <Label>Career interest</Label>
                  <Input
                    value={guidanceForm.careerInterest}
                    onChange={(e) => setGuidanceForm((f) => ({ ...f, careerInterest: e.target.value }))}
                    placeholder="e.g. Engineering / Applied Sciences"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label>Tags (comma separated)</Label>
                  <Input
                    value={guidanceForm.tags}
                    onChange={(e) => setGuidanceForm((f) => ({ ...f, tags: e.target.value }))}
                    placeholder="STEM, Engineering"
                  />
                </div>
              </div>
              <div className="space-y-1.5">
                <Label>Pathway notes</Label>
                <Textarea
                  rows={3}
                  value={guidanceForm.pathwayNotes}
                  onChange={(e) => setGuidanceForm((f) => ({ ...f, pathwayNotes: e.target.value }))}
                />
              </div>
              <Button onClick={submitGuidance}>
                <Plus className="h-4 w-4" /> Add guidance note
              </Button>
            </div>
            {studentGuidance.length === 0 ? (
              <p className="text-sm text-muted-foreground">No guidance notes yet.</p>
            ) : (
              <ul className="space-y-2">
                {studentGuidance.map((n) => (
                  <li key={n.id} className="rounded-md border p-3 text-sm">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="font-medium">{n.careerInterest}</p>
                      <span className="text-xs text-muted-foreground">
                        {formatDate(n.createdAt.slice(0, 10))} · {n.loggedByName}
                      </span>
                    </div>
                    <div className="mt-1 flex flex-wrap gap-1">
                      {n.tags.map((t) => (
                        <Badge key={t} variant="outline">
                          {t}
                        </Badge>
                      ))}
                    </div>
                    <p className="mt-2 text-muted-foreground">{n.pathwayNotes}</p>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>

        <Card className="lg:col-span-3">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Award className="h-4 w-4" /> Merit / Discipline Log
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-wrap items-end gap-3 rounded-md border bg-muted/30 p-3">
              <div className="space-y-1.5">
                <Label>Type</Label>
                <Select
                  value={meritForm.type}
                  onChange={(e) => setMeritForm((f) => ({ ...f, type: e.target.value as MeritRecord['type'] }))}
                  className="w-32"
                >
                  <option value="merit">Merit</option>
                  <option value="demerit">Demerit</option>
                </Select>
              </div>
              {meritForm.type === 'demerit' && (
                <div className="space-y-1.5">
                  <Label>Severity</Label>
                  <Select
                    value={meritForm.severity}
                    onChange={(e) =>
                      setMeritForm((f) => ({ ...f, severity: e.target.value as DisciplineSeverity }))
                    }
                    className="w-32"
                  >
                    <option value="minor">Minor</option>
                    <option value="major">Major</option>
                    <option value="serious">Serious</option>
                  </Select>
                </div>
              )}
              <div className="space-y-1.5">
                <Label>Points</Label>
                <Input
                  type="number"
                  min={1}
                  max={5}
                  className="w-20"
                  value={meritForm.points}
                  onChange={(e) => setMeritForm((f) => ({ ...f, points: Number(e.target.value) }))}
                />
              </div>
              <div className="flex-1 space-y-1.5">
                <Label>Reason</Label>
                <Input
                  value={meritForm.reason}
                  onChange={(e) => setMeritForm((f) => ({ ...f, reason: e.target.value }))}
                  placeholder="e.g. Helped a classmate with homework"
                />
              </div>
              <Button onClick={submitMerit}>
                <Plus className="h-4 w-4" /> Log Entry
              </Button>
            </div>

            {studentMerit.length === 0 ? (
              <p className="text-sm text-muted-foreground">No merit or demerit entries logged yet.</p>
            ) : (
              <ul className="space-y-1.5">
                {studentMerit.map((m) => (
                  <li key={m.id} className="flex flex-wrap items-center justify-between gap-2 rounded-md border px-3 py-2 text-sm">
                    <div className="flex items-center gap-2">
                      {m.points >= 0 ? (
                        <Plus className="h-3.5 w-3.5 text-forest-600" />
                      ) : (
                        <Minus className="h-3.5 w-3.5 text-red-600" />
                      )}
                      <span>{m.reason}</span>
                      {m.severity && (
                        <Badge variant={SEVERITY_VARIANT[m.severity]} className="capitalize">
                          {m.severity}
                        </Badge>
                      )}
                      <EscalationBadge show={m.escalated} />
                    </div>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <span className={m.points >= 0 ? 'font-semibold text-forest-700' : 'font-semibold text-red-700'}>
                        {m.points > 0 ? `+${m.points}` : m.points}
                      </span>
                      <span>{formatDate(m.date)}</span>
                      {m.type === 'demerit' && (
                        <Button size="sm" variant="outline" onClick={() => openDetention(m)}>
                          Assign detention
                        </Button>
                      )}
                    </div>
                  </li>
                ))}
              </ul>
            )}

            {studentDetentions.length > 0 && (
              <div className="pt-2">
                <p className="mb-2 text-sm font-semibold text-navy-800">Detentions</p>
                <ul className="space-y-1.5">
                  {studentDetentions.map((d) => (
                    <li key={d.id} className="flex items-center justify-between rounded-md border px-3 py-2 text-sm">
                      <span>
                        {d.scheduledAt.slice(0, 16).replace('T', ' ')} · {d.location}
                      </span>
                      <Badge
                        variant={d.status === 'completed' ? 'success' : d.status === 'missed' ? 'danger' : 'warning'}
                        className="capitalize"
                      >
                        {d.status}
                      </Badge>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Student Profile</DialogTitle>
            <DialogDescription>Update {studentFullName(student)}&rsquo;s details.</DialogDescription>
          </DialogHeader>
          <form onSubmit={onEditSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="firstName">First name</Label>
                <Input id="firstName" {...editForm.register('firstName')} />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="lastName">Last name</Label>
                <Input id="lastName" {...editForm.register('lastName')} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="admissionNo">Admission No.</Label>
                <Input id="admissionNo" {...editForm.register('admissionNo')} />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="dob">Date of birth</Label>
                <Input id="dob" type="date" {...editForm.register('dob')} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="classId">Class</Label>
                <Select id="classId" {...editForm.register('classId')}>
                  {classes.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="gender">Gender</Label>
                <Select id="gender" {...editForm.register('gender')}>
                  <option value="M">Male</option>
                  <option value="F">Female</option>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setEditOpen(false)}>
                Cancel
              </Button>
              <Button type="submit">Save changes</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={inviteOpen} onOpenChange={setInviteOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Invite Parent / Guardian</DialogTitle>
            <DialogDescription>Send a portal invitation linked to {studentFullName(student)}.</DialogDescription>
          </DialogHeader>
          <form onSubmit={onInviteSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="inv-name">Full name</Label>
              <Input id="inv-name" {...inviteForm.register('name')} />
              {inviteForm.formState.errors.name && (
                <p className="text-xs text-destructive">{inviteForm.formState.errors.name.message}</p>
              )}
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="inv-email">Email</Label>
                <Input id="inv-email" type="email" {...inviteForm.register('email')} />
                {inviteForm.formState.errors.email && (
                  <p className="text-xs text-destructive">{inviteForm.formState.errors.email.message}</p>
                )}
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="inv-phone">Phone</Label>
                <Input id="inv-phone" {...inviteForm.register('phone')} />
                {inviteForm.formState.errors.phone && (
                  <p className="text-xs text-destructive">{inviteForm.formState.errors.phone.message}</p>
                )}
              </div>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="inv-rel">Relationship</Label>
              <Input id="inv-rel" {...inviteForm.register('relationship')} placeholder="Mother, Father, Guardian…" />
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setInviteOpen(false)}>
                Cancel
              </Button>
              <Button type="submit">
                <Send className="h-4 w-4" /> Send Invite
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={detentionOpen} onOpenChange={setDetentionOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Assign detention</DialogTitle>
            <DialogDescription>Schedule constructive follow-up linked to this demerit entry.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-1.5">
              <Label>Scheduled at</Label>
              <Input type="datetime-local" value={scheduledAt} onChange={(e) => setScheduledAt(e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label>Location</Label>
              <Input value={location} onChange={(e) => setLocation(e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label>Notes</Label>
              <Textarea rows={3} value={detentionNotes} onChange={(e) => setDetentionNotes(e.target.value)} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDetentionOpen(false)}>
              Cancel
            </Button>
            <Button onClick={assignDetention}>Schedule</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
