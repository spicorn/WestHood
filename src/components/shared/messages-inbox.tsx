import { useEffect, useMemo, useState } from 'react'
import { toast } from 'sonner'
import { MessageSquare, Send } from 'lucide-react'
import { useAppStore } from '@/stores/app-store'
import { useAuthStore } from '@/stores/auth-store'
import { PageHeader, EmptyState } from '@/components/shared/empty-state'
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
import { cn, formatDate } from '@/lib/utils'
import type { Role } from '@/data/types'

interface MessagesInboxProps {
  title?: string
  description?: string
  /** When true, show compose for new direct threads */
  allowCompose?: boolean
  /** Optional fixed recipient options for compose (id + name) */
  composeRecipients?: { id: string; name: string }[]
  /** Pre-select a thread (e.g. after notice reply) */
  initialThreadId?: string | null
}

export function MessagesInbox({
  title = 'Messages',
  description = 'Conversations with the school community.',
  allowCompose = true,
  composeRecipients,
  initialThreadId,
}: MessagesInboxProps) {
  const session = useAuthStore((s) => s.session)
  const messageThreads = useAppStore((s) => s.messageThreads)
  const chatMessages = useAppStore((s) => s.chatMessages)
  const sendMessage = useAppStore((s) => s.sendMessage)
  const startDirectThread = useAppStore((s) => s.startDirectThread)
  const staff = useAppStore((s) => s.staff)

  const userId = session?.userId ?? ''
  const userName = session?.name ?? ''
  const userRole = (session?.role ?? 'parent') as Role

  const threads = useMemo(
    () =>
      messageThreads
        .filter((t) => t.participantIds.includes(userId))
        .slice()
        .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt)),
    [messageThreads, userId],
  )

  const [selectedId, setSelectedId] = useState<string | null>(initialThreadId ?? null)

  useEffect(() => {
    if (initialThreadId) setSelectedId(initialThreadId)
  }, [initialThreadId])
  const [draft, setDraft] = useState('')
  const [composeOpen, setComposeOpen] = useState(false)
  const [composeSubject, setComposeSubject] = useState('')
  const [composeBody, setComposeBody] = useState('')
  const [composeTo, setComposeTo] = useState('')

  const selected = threads.find((t) => t.id === selectedId) ?? threads[0] ?? null
  const activeId = selected?.id ?? null

  const messages = useMemo(
    () =>
      chatMessages
        .filter((m) => m.threadId === activeId)
        .slice()
        .sort((a, b) => a.sentAt.localeCompare(b.sentAt)),
    [chatMessages, activeId],
  )

  const recipients = useMemo(() => {
    if (composeRecipients?.length) return composeRecipients
    if (userRole === 'parent' || userRole === 'student') {
      return [
        { id: 'u-admin', name: 'School Office' },
        ...staff
          .filter((s) => s.status === 'active')
          .map((s) => ({ id: s.userId, name: s.name })),
      ]
    }
    if (userRole === 'staff') {
      return [
        { id: 'u-admin', name: 'School Office' },
        { id: 'u-parent', name: 'Rudo Mutasa (Parent)' },
      ]
    }
    return [
      { id: 'u-staff', name: 'Chipo Ncube (Staff)' },
      { id: 'u-parent', name: 'Rudo Mutasa (Parent)' },
    ]
  }, [composeRecipients, staff, userRole])

  const send = () => {
    if (!activeId || !draft.trim() || !session) return
    sendMessage({
      threadId: activeId,
      body: draft.trim(),
      senderId: userId,
      senderName: userName,
      senderRole: userRole,
    })
    setDraft('')
    toast.success('Message sent')
  }

  const startCompose = () => {
    setComposeSubject('')
    setComposeBody('')
    setComposeTo(recipients[0]?.id ?? '')
    setComposeOpen(true)
  }

  const submitCompose = () => {
    if (!session) return
    if (!composeSubject.trim() || !composeBody.trim() || !composeTo) {
      toast.error('Please fill subject, recipient, and message.')
      return
    }
    const recipient = recipients.find((r) => r.id === composeTo)
    if (!recipient) return
    const id = startDirectThread({
      subject: composeSubject.trim(),
      body: composeBody.trim(),
      senderId: userId,
      senderName: userName,
      senderRole: userRole,
      recipientId: recipient.id,
      recipientName: recipient.name,
    })
    setComposeOpen(false)
    setSelectedId(id)
    toast.success('Conversation started')
  }

  const otherNames = (t: (typeof threads)[0]) =>
    t.participantIds
      .filter((id) => id !== userId)
      .map((id) => t.participantNames[id] ?? id)
      .join(', ')

  return (
    <div>
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <PageHeader title={title} description={description} />
        {allowCompose && (
          <Button onClick={startCompose}>
            <MessageSquare className="mr-2 h-4 w-4" /> New message
          </Button>
        )}
      </div>

      {threads.length === 0 ? (
        <EmptyState
          icon={MessageSquare}
          title="No conversations yet"
          description="Start a message or reply to a school notice to begin a thread."
          action={allowCompose ? { label: 'New message', onClick: startCompose } : undefined}
        />
      ) : (
        <div className="grid min-h-[480px] overflow-hidden rounded-lg border bg-card shadow-soft lg:grid-cols-[280px_1fr]">
          <aside className="border-b lg:border-b-0 lg:border-r">
            <ul className="max-h-[200px] overflow-y-auto lg:max-h-[520px]">
              {threads.map((t) => (
                <li key={t.id}>
                  <button
                    type="button"
                    onClick={() => setSelectedId(t.id)}
                    className={cn(
                      'w-full border-b px-3 py-3 text-left transition-colors hover:bg-muted/50',
                      activeId === t.id && 'bg-navy-50 border-l-2 border-l-navy-600',
                    )}
                  >
                    <p className="truncate text-sm font-medium">{t.subject}</p>
                    <p className="mt-0.5 truncate text-xs text-muted-foreground">{otherNames(t)}</p>
                    <p className="mt-1 truncate text-xs text-muted-foreground">{t.lastPreview}</p>
                  </button>
                </li>
              ))}
            </ul>
          </aside>

          <div className="flex min-h-[360px] flex-col">
            {selected ? (
              <>
                <div className="border-b px-4 py-3">
                  <p className="font-medium">{selected.subject}</p>
                  <p className="text-xs text-muted-foreground">With {otherNames(selected)}</p>
                </div>
                <div className="flex-1 space-y-3 overflow-y-auto p-4">
                  {messages.map((m) => {
                    const mine = m.senderId === userId
                    return (
                      <div key={m.id} className={cn('flex', mine ? 'justify-end' : 'justify-start')}>
                        <div
                          className={cn(
                            'max-w-[85%] rounded-lg px-3 py-2 text-sm',
                            mine ? 'bg-navy-700 text-white' : 'bg-muted text-foreground',
                          )}
                        >
                          {!mine && (
                            <p className="mb-0.5 text-xs font-medium opacity-80">{m.senderName}</p>
                          )}
                          <p className="whitespace-pre-wrap">{m.body}</p>
                          <p className={cn('mt-1 text-[10px]', mine ? 'text-navy-100' : 'text-muted-foreground')}>
                            {formatDate(m.sentAt.slice(0, 10))} · {m.sentAt.slice(11, 16)}
                          </p>
                        </div>
                      </div>
                    )
                  })}
                </div>
                <div className="flex gap-2 border-t p-3">
                  <Textarea
                    value={draft}
                    onChange={(e) => setDraft(e.target.value)}
                    placeholder="Write a reply…"
                    className="min-h-[44px] flex-1 resize-none"
                    rows={2}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault()
                        send()
                      }
                    }}
                  />
                  <Button onClick={send} disabled={!draft.trim()} className="self-end">
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
              </>
            ) : (
              <div className="flex flex-1 items-center justify-center p-6">
                <EmptyState title="Select a conversation" description="Choose a thread from the list." />
              </div>
            )}
          </div>
        </div>
      )}

      <Dialog open={composeOpen} onOpenChange={setComposeOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>New message</DialogTitle>
            <DialogDescription>Start a direct conversation with the school.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="msg-to">To</Label>
              <Select id="msg-to" value={composeTo} onChange={(e) => setComposeTo(e.target.value)}>
                {recipients.map((r) => (
                  <option key={r.id} value={r.id}>
                    {r.name}
                  </option>
                ))}
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="msg-subj">Subject</Label>
              <Input
                id="msg-subj"
                value={composeSubject}
                onChange={(e) => setComposeSubject(e.target.value)}
                placeholder="e.g. Question about fees"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="msg-body">Message</Label>
              <Textarea
                id="msg-body"
                value={composeBody}
                onChange={(e) => setComposeBody(e.target.value)}
                placeholder="Write your message…"
                rows={4}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setComposeOpen(false)}>
              Cancel
            </Button>
            <Button onClick={submitCompose}>Send</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
