import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import { MessageSquare } from 'lucide-react'
import { useAppStore } from '@/stores/app-store'
import { useAuthStore } from '@/stores/auth-store'
import { useSelectedChild } from '@/hooks/use-parent'
import { PageHeader } from '@/components/shared/empty-state'
import { NoticeCalendar } from '@/components/shared/notice-calendar'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Label, Textarea } from '@/components/ui/input'
import type { Notice, Role } from '@/data/types'

type FilterKey = 'all' | 'parents'

const filters: { key: FilterKey; label: string }[] = [
  { key: 'all', label: 'All' },
  { key: 'parents', label: 'Parents' },
]

export default function ParentNoticesPage() {
  const navigate = useNavigate()
  const session = useAuthStore((s) => s.session)
  const child = useSelectedChild()
  const notices = useAppStore((s) => s.notices)
  const startNoticeReply = useAppStore((s) => s.startNoticeReply)
  const [filter, setFilter] = useState<FilterKey>('all')
  const [replyNotice, setReplyNotice] = useState<Notice | null>(null)
  const [replyBody, setReplyBody] = useState('')

  const relevant = useMemo(
    () =>
      notices.filter(
        (n) =>
          n.audience === 'All' ||
          n.audience === 'Parents' ||
          (child && n.audience === child.classId),
      ),
    [notices, child],
  )

  const filtered = useMemo(() => {
    if (filter === 'parents') return relevant.filter((n) => n.audience === 'Parents')
    return relevant
  }, [relevant, filter])

  const openReply = (n: Notice) => {
    setReplyNotice(n)
    setReplyBody('')
  }

  const sendReply = () => {
    if (!session || !replyNotice || !replyBody.trim()) {
      toast.error('Please write a short message.')
      return
    }
    const threadId = startNoticeReply({
      noticeId: replyNotice.id,
      subject: `Re: ${replyNotice.title}`,
      body: replyBody.trim(),
      senderId: session.userId,
      senderName: session.name,
      senderRole: session.role as Role,
      studentId: child?.id,
    })
    toast.success('Reply sent to school')
    setReplyNotice(null)
    navigate('/parent/messages', { state: { threadId } })
  }

  return (
    <div>
      <PageHeader title="Notices & Calendar" description="School notices addressed to parents and guardians." />
      <div className="mb-4 flex gap-2">
        {filters.map((f) => (
          <Button key={f.key} size="sm" variant={filter === f.key ? 'default' : 'outline'} onClick={() => setFilter(f.key)}>
            {f.label}
          </Button>
        ))}
      </div>
      <NoticeCalendar
        notices={filtered}
        renderNoticeActions={(n) => (
          <Button size="sm" variant="outline" className="mt-2" onClick={() => openReply(n)}>
            <MessageSquare className="mr-1.5 h-3.5 w-3.5" /> Reply to school
          </Button>
        )}
      />

      <Dialog open={!!replyNotice} onOpenChange={(o) => !o && setReplyNotice(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reply to school</DialogTitle>
            <DialogDescription>
              {replyNotice ? `Regarding: ${replyNotice.title}` : 'Send a message about this notice.'}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-1.5">
            <Label htmlFor="reply-body">Your message</Label>
            <Textarea
              id="reply-body"
              value={replyBody}
              onChange={(e) => setReplyBody(e.target.value)}
              placeholder="Write your reply to the school office…"
              rows={4}
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setReplyNotice(null)}>
              Cancel
            </Button>
            <Button onClick={sendReply}>Send & open messages</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
