import { useMemo, useState } from 'react'
import { toast } from 'sonner'
import { CalendarOff, Plus } from 'lucide-react'
import { useAppStore } from '@/stores/app-store'
import { useAuthStore } from '@/stores/auth-store'
import { useCurrentParent, useParentChildren, useSelectedChild } from '@/hooks/use-parent'
import { ChildSwitcher } from '@/components/parent/child-switcher'
import { PageHeader, EmptyState } from '@/components/shared/empty-state'
import { Card, CardContent, Badge } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input, Label, Textarea } from '@/components/ui/input'
import { Select } from '@/components/ui/tabs'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { studentFullName } from '@/data/mock-data'
import { formatDate } from '@/lib/utils'
import type { AbsenceRequestStatus } from '@/data/types'

const statusVariant: Record<AbsenceRequestStatus, 'warning' | 'success' | 'danger'> = {
  pending: 'warning',
  approved: 'success',
  declined: 'danger',
}

export default function ParentAbsencePage() {
  const session = useAuthStore((s) => s.session)
  const parent = useCurrentParent()
  const children = useParentChildren()
  const selectedChild = useSelectedChild()
  const absenceRequests = useAppStore((s) => s.absenceRequests)
  const submitAbsenceRequest = useAppStore((s) => s.submitAbsenceRequest)
  const students = useAppStore((s) => s.students)

  const [open, setOpen] = useState(false)
  const [studentId, setStudentId] = useState(selectedChild?.id ?? '')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [reason, setReason] = useState('')

  const mine = useMemo(
    () =>
      absenceRequests
        .filter((r) => parent.studentIds.includes(r.studentId))
        .slice()
        .sort((a, b) => b.submittedAt.localeCompare(a.submittedAt)),
    [absenceRequests, parent.studentIds],
  )

  const openForm = () => {
    setStudentId(selectedChild?.id ?? children[0]?.id ?? '')
    setStartDate('')
    setEndDate('')
    setReason('')
    setOpen(true)
  }

  const submit = () => {
    if (!session || !studentId || !startDate || !endDate || !reason.trim()) {
      toast.error('Please complete all fields.')
      return
    }
    if (endDate < startDate) {
      toast.error('End date cannot be before start date.')
      return
    }
    submitAbsenceRequest({
      studentId,
      parentId: parent.id,
      parentName: session.name,
      startDate,
      endDate,
      reason: reason.trim(),
    })
    toast.success('Absence request submitted', {
      description: 'The school will review and notify you of the decision.',
    })
    setOpen(false)
  }

  const nameOf = (id: string) => {
    const s = students.find((x) => x.id === id)
    return s ? studentFullName(s) : id
  }

  if (!children.length) {
    return <EmptyState title="No children linked" description="No students are linked to your account yet." />
  }

  return (
    <div>
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <PageHeader
          title="Absence Requests"
          description="Notify the school when your child will be away, and track past requests."
        />
        <ChildSwitcher />
      </div>

      <div className="mb-4">
        <Button onClick={openForm}>
          <Plus className="mr-2 h-4 w-4" /> Submit absence
        </Button>
      </div>

      {mine.length === 0 ? (
        <EmptyState
          icon={CalendarOff}
          title="No absence requests"
          description="Submit a note when your child will miss school."
          action={{ label: 'Submit absence', onClick: openForm }}
        />
      ) : (
        <ul className="space-y-3">
          {mine.map((r) => (
            <li key={r.id}>
              <Card>
                <CardContent className="flex flex-col gap-2 pt-5 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="font-medium">{nameOf(r.studentId)}</p>
                      <Badge variant={statusVariant[r.status]}>{r.status}</Badge>
                    </div>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {formatDate(r.startDate)} – {formatDate(r.endDate)}
                    </p>
                    <p className="mt-2 text-sm">{r.reason}</p>
                    {r.reviewNote && (
                      <p className="mt-2 text-xs text-muted-foreground">School note: {r.reviewNote}</p>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground shrink-0">
                    Submitted {formatDate(r.submittedAt.slice(0, 10))}
                  </p>
                </CardContent>
              </Card>
            </li>
          ))}
        </ul>
      )}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Submit absence request</DialogTitle>
            <DialogDescription>
              Let class teachers and the office know when your child will be away.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="abs-child">Child</Label>
              <Select id="abs-child" value={studentId} onChange={(e) => setStudentId(e.target.value)}>
                {children.map((c) => (
                  <option key={c.id} value={c.id}>
                    {studentFullName(c)}
                  </option>
                ))}
              </Select>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label htmlFor="abs-start">Start date</Label>
                <Input
                  id="abs-start"
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="abs-end">End date</Label>
                <Input
                  id="abs-end"
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="abs-reason">Reason</Label>
              <Textarea
                id="abs-reason"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="e.g. Medical appointment / family commitment"
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button onClick={submit}>Submit</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
