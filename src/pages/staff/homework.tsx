import { useMemo, useState } from 'react'
import { toast } from 'sonner'
import { Check, ChevronDown, Clock3, FileWarning, Plus, X } from 'lucide-react'
import type { Homework, HomeworkStatus } from '@/data/types'
import { studentFullName } from '@/data/mock-data'
import { useAppStore } from '@/stores/app-store'
import { useCurrentStaff } from '@/hooks/use-current-staff'
import { PageHeader, EmptyState } from '@/components/shared/empty-state'
import { Card, CardContent, Badge } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Select, Avatar } from '@/components/ui/tabs'
import { Input, Label, Textarea } from '@/components/ui/input'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogTrigger,
} from '@/components/ui/dialog'
import { cn, format, parseISO, todayISO } from '@/lib/utils'

const cycleOrder: HomeworkStatus[] = ['assigned', 'submitted', 'late', 'missing']

const statusStyle: Record<HomeworkStatus, string> = {
  assigned: 'bg-muted border-border text-muted-foreground',
  submitted: 'bg-forest-500 border-forest-600 text-white',
  late: 'bg-gold-500 border-gold-600 text-navy-900',
  missing: 'bg-red-500 border-red-600 text-white',
}

const statusIcon: Record<HomeworkStatus, typeof Check> = {
  assigned: Clock3,
  submitted: Check,
  late: Clock3,
  missing: X,
}

const statusLabel: Record<HomeworkStatus, string> = {
  assigned: 'Not marked',
  submitted: 'Submitted',
  late: 'Late',
  missing: 'Missing',
}

export default function StaffHomeworkPage() {
  const { teacher } = useCurrentStaff()
  const subjects = useAppStore((s) => s.subjects)
  const classes = useAppStore((s) => s.classes)
  const students = useAppStore((s) => s.students)
  const homework = useAppStore((s) => s.homework)
  const upsertHomework = useAppStore((s) => s.upsertHomework)
  const updateHomeworkSubmission = useAppStore((s) => s.updateHomeworkSubmission)

  const mySubjects = useMemo(() => subjects.filter((s) => teacher?.subjects.includes(s.id)), [subjects, teacher])
  const myHomework = useMemo(
    () => homework.filter((h) => h.assignedBy === teacher?.id).sort((a, b) => b.dueDate.localeCompare(a.dueDate)),
    [homework, teacher],
  )

  const [createOpen, setCreateOpen] = useState(false)
  const [expandedId, setExpandedId] = useState<string | null>(myHomework[0]?.id ?? null)
  const [form, setForm] = useState({ title: '', description: '', subjectId: '', classId: '', dueDate: todayISO() })

  if (!teacher) return <PageHeader title="Homework" description="Loading your staff profile…" />

  const availableClasses = classes.filter(
    (c) => teacher.classIds.includes(c.id) && subjects.find((s) => s.id === form.subjectId)?.classIds.includes(c.id),
  )

  function resetForm() {
    setForm({ title: '', description: '', subjectId: '', classId: '', dueDate: todayISO() })
  }

  function handleCreate() {
    if (!form.title.trim() || !form.subjectId || !form.classId || !form.dueDate) {
      toast.error('Fill in the title, subject, class, and due date.')
      return
    }
    const roster = students.filter((s) => s.classId === form.classId && s.status === 'active')
    const hw: Homework = {
      id: `hw-${Date.now()}`,
      title: form.title.trim(),
      description: form.description.trim(),
      subjectId: form.subjectId,
      classId: form.classId,
      assignedBy: teacher!.id,
      dueDate: form.dueDate,
      createdAt: todayISO(),
      submissions: roster.map((s) => ({ studentId: s.id, status: 'assigned' as const })),
    }
    upsertHomework(hw)
    toast.success('Homework created', { description: `${hw.title} assigned to ${classes.find((c) => c.id === form.classId)?.name}.` })
    setCreateOpen(false)
    setExpandedId(hw.id)
    resetForm()
  }

  function cycleSubmission(hwId: string, studentId: string, current: HomeworkStatus) {
    const next = cycleOrder[(cycleOrder.indexOf(current) + 1) % cycleOrder.length]
    updateHomeworkSubmission(hwId, studentId, next)
    if (next === 'missing') {
      toast.warning('Marked missing — parent has been notified in their activity feed.')
    }
  }

  return (
    <div>
      <PageHeader
        title="Homework"
        description="Create assignments and track submissions for your classes."
        actions={
          <Dialog open={createOpen} onOpenChange={setCreateOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2"><Plus className="h-4 w-4" /> New Homework</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>New Homework</DialogTitle>
                <DialogDescription>Assign homework to one of your classes.</DialogDescription>
              </DialogHeader>
              <div className="space-y-3">
                <div className="space-y-1.5">
                  <Label>Title</Label>
                  <Input value={form.title} onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))} placeholder="e.g. Fractions Word Problems" />
                </div>
                <div className="space-y-1.5">
                  <Label>Description</Label>
                  <Textarea value={form.description} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))} placeholder="Instructions for students…" />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label>Subject</Label>
                    <Select
                      value={form.subjectId}
                      onChange={(e) => setForm((f) => ({ ...f, subjectId: e.target.value, classId: '' }))}
                    >
                      <option value="">Select…</option>
                      {mySubjects.map((s) => (
                        <option key={s.id} value={s.id}>{s.name}</option>
                      ))}
                    </Select>
                  </div>
                  <div className="space-y-1.5">
                    <Label>Class</Label>
                    <Select value={form.classId} onChange={(e) => setForm((f) => ({ ...f, classId: e.target.value }))} disabled={!form.subjectId}>
                      <option value="">Select…</option>
                      {availableClasses.map((c) => (
                        <option key={c.id} value={c.id}>{c.name}</option>
                      ))}
                    </Select>
                  </div>
                </div>
                <div className="space-y-1.5">
                  <Label>Due Date</Label>
                  <Input type="date" value={form.dueDate} onChange={(e) => setForm((f) => ({ ...f, dueDate: e.target.value }))} />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setCreateOpen(false)}>Cancel</Button>
                <Button onClick={handleCreate}>Assign Homework</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        }
      />

      {myHomework.length === 0 ? (
        <EmptyState icon={FileWarning} title="No homework assigned yet" description="Create your first homework to start tracking submissions." />
      ) : (
        <div className="space-y-4">
          {myHomework.map((hw) => {
            const subject = subjects.find((s) => s.id === hw.subjectId)
            const cls = classes.find((c) => c.id === hw.classId)
            const counts = {
              submitted: hw.submissions.filter((s) => s.status === 'submitted').length,
              late: hw.submissions.filter((s) => s.status === 'late').length,
              missing: hw.submissions.filter((s) => s.status === 'missing').length,
              assigned: hw.submissions.filter((s) => s.status === 'assigned').length,
            }
            const isOpen = expandedId === hw.id
            return (
              <Card key={hw.id}>
                <button
                  type="button"
                  onClick={() => setExpandedId(isOpen ? null : hw.id)}
                  className="flex w-full items-center justify-between gap-3 p-5 text-left"
                >
                  <div className="min-w-0">
                    <p className="font-display text-lg font-semibold text-navy-900">{hw.title}</p>
                    <p className="text-sm text-muted-foreground">{subject?.name} · {cls?.name} · Due {format(parseISO(hw.dueDate), 'd MMM yyyy')}</p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    {counts.submitted > 0 && <Badge variant="success">{counts.submitted} in</Badge>}
                    {counts.late > 0 && <Badge variant="warning">{counts.late} late</Badge>}
                    {counts.missing > 0 && <Badge variant="danger">{counts.missing} missing</Badge>}
                    {counts.assigned > 0 && <Badge variant="outline">{counts.assigned} unmarked</Badge>}
                    <ChevronDown className={cn('h-4 w-4 text-muted-foreground transition-transform', isOpen && 'rotate-180')} />
                  </div>
                </button>
                {isOpen && (
                  <CardContent className="pt-0 space-y-3">
                    {hw.description && <p className="mb-2 text-sm text-muted-foreground border-t pt-3">{hw.description}</p>}
                    <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                      {hw.submissions.map((sub) => {
                        const student = students.find((s) => s.id === sub.studentId)
                        if (!student) return null
                        const Icon = statusIcon[sub.status]
                        return (
                          <button
                            key={sub.studentId}
                            type="button"
                            onClick={() => cycleSubmission(hw.id, sub.studentId, sub.status)}
                            className={cn('flex items-center gap-2.5 rounded-lg border-2 p-3 text-left transition-all active:scale-[0.98]', statusStyle[sub.status])}
                          >
                            <Avatar name={studentFullName(student)} size="sm" className="bg-white/25 text-current shrink-0" />
                            <div className="min-w-0 flex-1">
                              <p className="truncate text-sm font-medium">{studentFullName(student)}</p>
                              <p className="flex items-center gap-1 text-xs opacity-90">
                                <Icon className="h-3 w-3" /> {statusLabel[sub.status]}
                              </p>
                            </div>
                          </button>
                        )
                      })}
                    </div>
                  </CardContent>
                )}
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}
