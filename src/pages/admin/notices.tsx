import { useMemo, useState } from 'react'
import { useForm, useWatch } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { toast } from 'sonner'
import { CalendarDays, MoreHorizontal, Pencil, Pin, Plus, Trash2 } from 'lucide-react'
import { PageHeader, EmptyState } from '@/components/shared/empty-state'
import { NoticeCalendar } from '@/components/shared/notice-calendar'
import { Card, CardContent, CardHeader, CardTitle, Badge } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input, Label, Textarea } from '@/components/ui/input'
import { Checkbox, Select } from '@/components/ui/tabs'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { useAppStore } from '@/stores/app-store'
import type { Notice } from '@/data/types'
import { formatDate } from '@/lib/utils'

const CATEGORIES: Notice['category'][] = ['General', 'Sports', 'Exams', 'Holiday', 'Urgent']

const noticeSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  body: z.string().min(1, 'Body is required'),
  category: z.enum(['General', 'Sports', 'Exams', 'Holiday', 'Urgent']),
  audience: z.string().min(1, 'Select an audience'),
  date: z.string().min(1, 'Date is required'),
  pinned: z.boolean(),
})
type NoticeFormValues = z.infer<typeof noticeSchema>

let noticeIdSeq = 0
function nextNoticeId() {
  noticeIdSeq += 1
  return `n-${Date.now()}-${noticeIdSeq}`
}

export default function AdminNotices() {
  const notices = useAppStore((s) => s.notices)
  const classes = useAppStore((s) => s.classes)
  const upsertNotice = useAppStore((s) => s.upsertNotice)
  const deleteNotice = useAppStore((s) => s.deleteNotice)

  const [formOpen, setFormOpen] = useState(false)
  const [editing, setEditing] = useState<Notice | null>(null)
  const [deleting, setDeleting] = useState<Notice | null>(null)

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    control,
    formState: { errors },
  } = useForm<NoticeFormValues>({
    resolver: zodResolver(noticeSchema),
    defaultValues: { title: '', body: '', category: 'General', audience: 'All', date: '', pinned: false },
  })

  const pinned = useWatch({ control, name: 'pinned' })

  const audienceOptions = useMemo(
    () => ['All', 'Staff', 'Parents', 'Students', ...classes.map((c) => c.id)],
    [classes],
  )

  const audienceLabel = (aud: string) => classes.find((c) => c.id === aud)?.name ?? aud

  const openCreate = () => {
    setEditing(null)
    reset({ title: '', body: '', category: 'General', audience: 'All', date: '', pinned: false })
    setFormOpen(true)
  }

  const openEdit = (n: Notice) => {
    setEditing(n)
    reset({ title: n.title, body: n.body, category: n.category, audience: n.audience, date: n.date, pinned: n.pinned })
    setFormOpen(true)
  }

  const onSubmit = handleSubmit((values) => {
    upsertNotice({
      id: editing?.id ?? nextNoticeId(),
      title: values.title,
      body: values.body,
      category: values.category,
      audience: values.audience,
      date: values.date,
      pinned: values.pinned,
      createdBy: editing?.createdBy ?? 'u-admin',
    })
    toast.success(`Notice ${editing ? 'updated' : 'published'}.`)
    setFormOpen(false)
  })

  const confirmDelete = () => {
    if (!deleting) return
    deleteNotice(deleting.id)
    toast.success('Notice deleted.')
    setDeleting(null)
  }

  const sortedNotices = useMemo(
    () => [...notices].sort((a, b) => (a.pinned === b.pinned ? b.date.localeCompare(a.date) : a.pinned ? -1 : 1)),
    [notices],
  )

  return (
    <div>
      <PageHeader
        title="Notices & Calendar"
        description="Publish announcements and manage the school events calendar."
        actions={
          <Button onClick={openCreate}>
            <Plus className="h-4 w-4" /> New Notice
          </Button>
        }
      />

      <div className="mb-6">
        <NoticeCalendar notices={notices} />
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CalendarDays className="h-4 w-4" /> All Notices
          </CardTitle>
        </CardHeader>
        <CardContent>
          {sortedNotices.length === 0 ? (
            <EmptyState title="No notices yet" description="Publish your first notice to keep the school informed." action={{ label: 'New Notice', onClick: openCreate }} />
          ) : (
            <ul className="space-y-2">
              {sortedNotices.map((n) => (
                <li key={n.id} className="flex items-start gap-3 rounded-md border p-3">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <p className="font-medium">{n.title}</p>
                      {n.pinned && <Pin className="h-3.5 w-3.5 text-gold-500" />}
                    </div>
                    <p className="mt-1 text-sm text-muted-foreground">{n.body}</p>
                    <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                      <Badge variant="outline">{n.category}</Badge>
                      <Badge variant="secondary">{audienceLabel(n.audience)}</Badge>
                      <span>{formatDate(n.date)}</span>
                    </div>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => openEdit(n)}>
                        <Pencil className="mr-2 h-3.5 w-3.5" /> Edit
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => setDeleting(n)}>
                        <Trash2 className="mr-2 h-3.5 w-3.5" /> Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>

      <Dialog open={formOpen} onOpenChange={setFormOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editing ? 'Edit Notice' : 'New Notice'}</DialogTitle>
            <DialogDescription>Publish an announcement to a chosen audience.</DialogDescription>
          </DialogHeader>
          <form onSubmit={onSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="title">Title</Label>
              <Input id="title" {...register('title')} />
              {errors.title && <p className="text-xs text-destructive">{errors.title.message}</p>}
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="body">Body</Label>
              <Textarea id="body" {...register('body')} />
              {errors.body && <p className="text-xs text-destructive">{errors.body.message}</p>}
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="category">Category</Label>
                <Select id="category" {...register('category')}>
                  {CATEGORIES.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="audience">Audience</Label>
                <Select id="audience" {...register('audience')}>
                  {audienceOptions.map((a) => (
                    <option key={a} value={a}>
                      {audienceLabel(a)}
                    </option>
                  ))}
                </Select>
              </div>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="date">Date</Label>
              <Input id="date" type="date" {...register('date')} />
              {errors.date && <p className="text-xs text-destructive">{errors.date.message}</p>}
            </div>
            <label className="flex items-center gap-2 text-sm">
              <Checkbox checked={pinned} onCheckedChange={(checked) => setValue('pinned', checked)} />
              Pin to top of calendar and notice board
            </label>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setFormOpen(false)}>
                Cancel
              </Button>
              <Button type="submit">{editing ? 'Save changes' : 'Publish notice'}</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={!!deleting} onOpenChange={(v) => !v && setDeleting(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Notice</DialogTitle>
            <DialogDescription>Are you sure you want to delete &ldquo;{deleting?.title}&rdquo;?</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleting(null)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={confirmDelete}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
