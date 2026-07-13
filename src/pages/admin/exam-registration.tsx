import { useMemo, useState } from 'react'
import { toast } from 'sonner'
import { ClipboardList, Pencil, Users } from 'lucide-react'
import { PageHeader, StatCard } from '@/components/shared/empty-state'
import { Card, CardContent, CardHeader, CardTitle, Badge } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input, Label } from '@/components/ui/input'
import { Checkbox, Select } from '@/components/ui/tabs'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { useAppStore } from '@/stores/app-store'
import { studentFullName } from '@/data/mock-data'
import type { ExamBody, ExamLevel, ExamRegistration, RegistrationStatus } from '@/data/types'

const STATUS_VARIANT: Record<RegistrationStatus, 'success' | 'warning' | 'secondary'> = {
  registered: 'success',
  pending: 'warning',
  not_registered: 'secondary',
}

const STATUS_LABEL: Record<RegistrationStatus, string> = {
  registered: 'Registered',
  pending: 'Pending',
  not_registered: 'Not registered',
}

export default function AdminExamRegistration() {
  const students = useAppStore((s) => s.students)
  const classes = useAppStore((s) => s.classes)
  const subjects = useAppStore((s) => s.subjects)
  const examSittings = useAppStore((s) => s.examSittings)
  const examRegistrations = useAppStore((s) => s.examRegistrations)
  const upsertExamRegistration = useAppStore((s) => s.upsertExamRegistration)
  const bulkRegisterClass = useAppStore((s) => s.bulkRegisterClass)

  const [body, setBody] = useState<ExamBody | 'all'>('all')
  const [level, setLevel] = useState<ExamLevel | 'all'>('all')
  const [classId, setClassId] = useState(classes.find((c) => c.id === 'c-f4')?.id ?? classes[0]?.id ?? '')
  const [sittingId, setSittingId] = useState(examSittings[0]?.id ?? '')

  const [editOpen, setEditOpen] = useState(false)
  const [editing, setEditing] = useState<ExamRegistration | null>(null)
  const [editSubjects, setEditSubjects] = useState<string[]>([])
  const [editStatus, setEditStatus] = useState<RegistrationStatus>('pending')
  const [editCandidate, setEditCandidate] = useState('')

  const [bulkOpen, setBulkOpen] = useState(false)
  const [bulkSubjects, setBulkSubjects] = useState<string[]>([])

  const filteredSittings = useMemo(
    () =>
      examSittings.filter((s) => {
        if (body !== 'all' && s.body !== body) return false
        if (level !== 'all' && s.level !== level) return false
        return true
      }),
    [examSittings, body, level],
  )

  const activeSittingId = filteredSittings.some((s) => s.id === sittingId)
    ? sittingId
    : filteredSittings[0]?.id ?? ''

  const classStudents = useMemo(
    () => students.filter((s) => s.classId === classId && s.status === 'active'),
    [students, classId],
  )

  const classSubjectOptions = useMemo(
    () => subjects.filter((s) => s.classIds.includes(classId)),
    [subjects, classId],
  )

  const rows = useMemo(() => {
    return classStudents.map((student) => {
      const reg = examRegistrations.find(
        (r) => r.studentId === student.id && r.sittingId === activeSittingId,
      )
      return {
        student,
        reg,
        status: (reg?.status ?? 'not_registered') as RegistrationStatus,
      }
    })
  }, [classStudents, examRegistrations, activeSittingId])

  const summary = useMemo(() => {
    const registered = rows.filter((r) => r.status === 'registered').length
    const pending = rows.filter((r) => r.status === 'pending').length
    const notRegistered = rows.filter((r) => r.status === 'not_registered').length
    return { registered, pending, notRegistered }
  }, [rows])

  const openEdit = (studentId: string) => {
    const existing = examRegistrations.find(
      (r) => r.studentId === studentId && r.sittingId === activeSittingId,
    )
    const reg: ExamRegistration = existing ?? {
      id: `reg-${activeSittingId}-${studentId}`,
      sittingId: activeSittingId,
      studentId,
      subjectIds: [],
      candidateNumber: '',
      status: 'pending',
    }
    setEditing(reg)
    setEditSubjects([...reg.subjectIds])
    setEditStatus(reg.status)
    setEditCandidate(reg.candidateNumber)
    setEditOpen(true)
  }

  const saveEdit = () => {
    if (!editing) return
    upsertExamRegistration({
      ...editing,
      subjectIds: editSubjects,
      status: editStatus,
      candidateNumber: editCandidate.trim(),
    })
    toast.success('Registration updated.')
    setEditOpen(false)
  }

  const openBulk = () => {
    setBulkSubjects(classSubjectOptions.slice(0, 5).map((s) => s.id))
    setBulkOpen(true)
  }

  const confirmBulk = () => {
    if (!activeSittingId || !classId) {
      toast.error('Select a sitting and class first.')
      return
    }
    if (bulkSubjects.length === 0) {
      toast.error('Select at least one subject.')
      return
    }
    const count = bulkRegisterClass(activeSittingId, classId, bulkSubjects)
    toast.success(`Registered ${count} student${count === 1 ? '' : 's'} for this sitting.`)
    setBulkOpen(false)
  }

  const toggleSubject = (id: string, list: string[], setList: (v: string[]) => void) => {
    setList(list.includes(id) ? list.filter((x) => x !== id) : [...list, id])
  }

  return (
    <div>
      <PageHeader
        title="Exam Registration"
        description="Track candidate registration by sitting, level, and class."
        actions={
          <Button onClick={openBulk} disabled={!activeSittingId}>
            <Users className="h-4 w-4" /> Bulk register class
          </Button>
        }
      />

      <div className="mb-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <div className="space-y-1.5">
          <Label>Exam body</Label>
          <Select value={body} onChange={(e) => setBody(e.target.value as ExamBody | 'all')}>
            <option value="all">All bodies</option>
            <option value="ZIMSEC">ZIMSEC</option>
            <option value="Cambridge">Cambridge</option>
          </Select>
        </div>
        <div className="space-y-1.5">
          <Label>Level</Label>
          <Select value={level} onChange={(e) => setLevel(e.target.value as ExamLevel | 'all')}>
            <option value="all">All levels</option>
            <option value="O-Level">O-Level</option>
            <option value="A-Level">A-Level</option>
          </Select>
        </div>
        <div className="space-y-1.5">
          <Label>Class</Label>
          <Select value={classId} onChange={(e) => setClassId(e.target.value)}>
            {classes.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </Select>
        </div>
        <div className="space-y-1.5">
          <Label>Sitting</Label>
          <Select value={activeSittingId} onChange={(e) => setSittingId(e.target.value)}>
            {filteredSittings.length === 0 ? (
              <option value="">No sittings match filters</option>
            ) : (
              filteredSittings.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))
            )}
          </Select>
        </div>
      </div>

      <div className="mb-6 grid gap-4 sm:grid-cols-3">
        <StatCard label="Registered" value={summary.registered} icon={ClipboardList} accent="bg-forest-50 text-forest-700" />
        <StatCard label="Pending" value={summary.pending} icon={ClipboardList} accent="bg-gold-50 text-gold-800" />
        <StatCard label="Not registered" value={summary.notRegistered} icon={ClipboardList} accent="bg-navy-50 text-navy-700" />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>
            {classes.find((c) => c.id === classId)?.name ?? 'Class'} ·{' '}
            {filteredSittings.find((s) => s.id === activeSittingId)?.name ?? 'Select sitting'}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto rounded-lg border">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-muted/50 text-left">
                  <th className="px-4 py-2 font-semibold text-muted-foreground">Student</th>
                  <th className="px-4 py-2 font-semibold text-muted-foreground">Candidate No.</th>
                  <th className="px-4 py-2 font-semibold text-muted-foreground">Subjects</th>
                  <th className="px-4 py-2 font-semibold text-muted-foreground">Status</th>
                  <th className="px-4 py-2 font-semibold text-muted-foreground" />
                </tr>
              </thead>
              <tbody>
                {rows.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-4 py-8 text-center text-muted-foreground">
                      No active students in this class.
                    </td>
                  </tr>
                ) : (
                  rows.map(({ student, reg, status }) => (
                    <tr key={student.id} className="border-b last:border-0">
                      <td className="px-4 py-2 font-medium">{studentFullName(student)}</td>
                      <td className="px-4 py-2 text-muted-foreground">{reg?.candidateNumber || '—'}</td>
                      <td className="px-4 py-2">
                        <div className="flex flex-wrap gap-1">
                          {(reg?.subjectIds ?? []).length === 0 ? (
                            <span className="text-muted-foreground">—</span>
                          ) : (
                            reg!.subjectIds.map((sid) => (
                              <Badge key={sid} variant="outline">
                                {subjects.find((s) => s.id === sid)?.code ?? sid}
                              </Badge>
                            ))
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-2">
                        <Badge variant={STATUS_VARIANT[status]}>{STATUS_LABEL[status]}</Badge>
                      </td>
                      <td className="px-4 py-2 text-right">
                        <Button size="sm" variant="outline" onClick={() => openEdit(student.id)} disabled={!activeSittingId}>
                          <Pencil className="h-3.5 w-3.5" /> Edit
                        </Button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit registration</DialogTitle>
            <DialogDescription>
              Update status and subjects for{' '}
              {editing
                ? (() => {
                    const st = students.find((s) => s.id === editing.studentId)
                    return st ? studentFullName(st) : 'student'
                  })()
                : 'student'}
              .
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-1.5">
              <Label>Candidate number</Label>
              <Input value={editCandidate} onChange={(e) => setEditCandidate(e.target.value)} placeholder="e.g. ZW2026001" />
            </div>
            <div className="space-y-1.5">
              <Label>Status</Label>
              <Select value={editStatus} onChange={(e) => setEditStatus(e.target.value as RegistrationStatus)}>
                <option value="registered">Registered</option>
                <option value="pending">Pending</option>
                <option value="not_registered">Not registered</option>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Subjects</Label>
              <div className="max-h-48 space-y-1 overflow-y-auto rounded-md border p-2">
                {classSubjectOptions.map((s) => (
                  <label key={s.id} className="flex items-center gap-2 rounded-md px-2 py-1.5 text-sm hover:bg-muted/60">
                    <Checkbox
                      checked={editSubjects.includes(s.id)}
                      onCheckedChange={() => toggleSubject(s.id, editSubjects, setEditSubjects)}
                    />
                    {s.name} ({s.code})
                  </label>
                ))}
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditOpen(false)}>
              Cancel
            </Button>
            <Button onClick={saveEdit}>Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={bulkOpen} onOpenChange={setBulkOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Bulk register class</DialogTitle>
            <DialogDescription>
              Register all active students in {classes.find((c) => c.id === classId)?.name} for the selected sitting with the same subject set.
            </DialogDescription>
          </DialogHeader>
          <div className="max-h-56 space-y-1 overflow-y-auto rounded-md border p-2">
            {classSubjectOptions.map((s) => (
              <label key={s.id} className="flex items-center gap-2 rounded-md px-2 py-1.5 text-sm hover:bg-muted/60">
                <Checkbox
                  checked={bulkSubjects.includes(s.id)}
                  onCheckedChange={() => toggleSubject(s.id, bulkSubjects, setBulkSubjects)}
                />
                {s.name} ({s.code})
              </label>
            ))}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setBulkOpen(false)}>
              Cancel
            </Button>
            <Button onClick={confirmBulk}>Register class</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
