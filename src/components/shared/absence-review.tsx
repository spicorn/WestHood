import { useMemo, useState } from 'react'
import { toast } from 'sonner'
import { CalendarOff } from 'lucide-react'
import { useAppStore } from '@/stores/app-store'
import { useAuthStore } from '@/stores/auth-store'
import { PageHeader, EmptyState } from '@/components/shared/empty-state'
import { DataTable, type Column } from '@/components/shared/data-table'
import { Card, Badge } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Label, Textarea } from '@/components/ui/input'
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
import type { AbsenceRequest, AbsenceRequestStatus, Role } from '@/data/types'

const statusVariant: Record<AbsenceRequestStatus, 'warning' | 'success' | 'danger'> = {
  pending: 'warning',
  approved: 'success',
  declined: 'danger',
}

interface AbsenceReviewPageProps {
  title?: string
  description?: string
  /** Limit to these student ids (staff class filter). Omit for all. */
  studentIds?: string[]
}

export function AbsenceReviewPage({
  title = 'Absence Requests',
  description = 'Review parent absence notes and record decisions.',
  studentIds,
}: AbsenceReviewPageProps) {
  const session = useAuthStore((s) => s.session)
  const absenceRequests = useAppStore((s) => s.absenceRequests)
  const students = useAppStore((s) => s.students)
  const reviewAbsenceRequest = useAppStore((s) => s.reviewAbsenceRequest)

  const [statusFilter, setStatusFilter] = useState<AbsenceRequestStatus | 'all'>('all')
  const [reviewTarget, setReviewTarget] = useState<AbsenceRequest | null>(null)
  const [decision, setDecision] = useState<'approved' | 'declined'>('approved')
  const [note, setNote] = useState('')

  const rows = useMemo(() => {
    return absenceRequests
      .filter((r) => !studentIds || studentIds.includes(r.studentId))
      .filter((r) => (statusFilter === 'all' ? true : r.status === statusFilter))
      .slice()
      .sort((a, b) => b.submittedAt.localeCompare(a.submittedAt))
  }, [absenceRequests, studentIds, statusFilter])

  const openReview = (r: AbsenceRequest) => {
    setReviewTarget(r)
    setDecision('approved')
    setNote('')
  }

  const submitReview = () => {
    if (!reviewTarget || !session) return
    reviewAbsenceRequest(
      reviewTarget.id,
      decision,
      { id: session.userId, name: session.name, role: session.role as Role },
      note.trim() || undefined,
    )
    toast.success(`Absence request ${decision}`, {
      description: `${studentName(reviewTarget.studentId)} · ${formatDate(reviewTarget.startDate)}–${formatDate(reviewTarget.endDate)}`,
    })
    setReviewTarget(null)
  }

  const studentName = (id: string) => {
    const s = students.find((x) => x.id === id)
    return s ? studentFullName(s) : id
  }

  const columns: Column<AbsenceRequest>[] = [
    {
      key: 'student',
      header: 'Student',
      render: (r) => <span className="font-medium">{studentName(r.studentId)}</span>,
    },
    { key: 'parent', header: 'Parent', render: (r) => r.parentName },
    {
      key: 'dates',
      header: 'Dates',
      render: (r) => `${formatDate(r.startDate)} – ${formatDate(r.endDate)}`,
    },
    {
      key: 'reason',
      header: 'Reason',
      render: (r) => <span className="line-clamp-2 max-w-[240px] text-sm">{r.reason}</span>,
    },
    {
      key: 'status',
      header: 'Status',
      render: (r) => <Badge variant={statusVariant[r.status]}>{r.status}</Badge>,
    },
    {
      key: 'actions',
      header: '',
      render: (r) =>
        r.status === 'pending' ? (
          <Button size="sm" onClick={() => openReview(r)}>
            Review
          </Button>
        ) : (
          <span className="text-xs text-muted-foreground">
            {r.reviewedBy ? `By ${r.reviewedBy}` : '—'}
          </span>
        ),
    },
  ]

  return (
    <div>
      <PageHeader title={title} description={description} />

      <div className="mb-4 max-w-xs space-y-1.5">
        <Label>Status</Label>
        <Select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as AbsenceRequestStatus | 'all')}
        >
          <option value="all">All</option>
          <option value="pending">Pending</option>
          <option value="approved">Approved</option>
          <option value="declined">Declined</option>
        </Select>
      </div>

      {rows.length === 0 ? (
        <EmptyState
          icon={CalendarOff}
          title="No absence requests"
          description={
            studentIds
              ? 'No absence notes for students in your classes.'
              : 'No absence requests match this filter.'
          }
        />
      ) : (
        <Card className="overflow-hidden p-0">
          <DataTable data={rows} columns={columns} searchKeys={['parentName', 'reason']} searchPlaceholder="Search requests…" />
        </Card>
      )}

      <Dialog open={!!reviewTarget} onOpenChange={(o) => !o && setReviewTarget(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Review absence request</DialogTitle>
            <DialogDescription>
              {reviewTarget &&
                `${studentName(reviewTarget.studentId)} · ${formatDate(reviewTarget.startDate)} – ${formatDate(reviewTarget.endDate)}`}
            </DialogDescription>
          </DialogHeader>
          {reviewTarget && (
            <div className="grid gap-3">
              <p className="rounded-md border bg-muted/40 p-3 text-sm">{reviewTarget.reason}</p>
              <div className="space-y-1.5">
                <Label>Decision</Label>
                <Select
                  value={decision}
                  onChange={(e) => setDecision(e.target.value as 'approved' | 'declined')}
                >
                  <option value="approved">Approve</option>
                  <option value="declined">Decline</option>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="abs-note">Note (optional)</Label>
                <Textarea
                  id="abs-note"
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder="e.g. Marked excused — medical note on file."
                  rows={3}
                />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setReviewTarget(null)}>
              Cancel
            </Button>
            <Button
              variant={decision === 'declined' ? 'destructive' : 'default'}
              onClick={submitReview}
            >
              {decision === 'approved' ? 'Approve' : 'Decline'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
