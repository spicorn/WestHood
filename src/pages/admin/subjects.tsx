import { useState } from 'react'
import { toast } from 'sonner'
import { BookOpen, MoreHorizontal, Pencil, Plus, Trash2 } from 'lucide-react'
import { PageHeader, EmptyState } from '@/components/shared/empty-state'
import { Card, CardContent, Badge } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input, Label } from '@/components/ui/input'
import { Checkbox } from '@/components/ui/tabs'
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
import type { Subject } from '@/data/types'

interface SubjectFormState {
  id?: string
  name: string
  code: string
  teacherIds: string[]
  classIds: string[]
}

const emptyForm: SubjectFormState = { name: '', code: '', teacherIds: [], classIds: [] }

export default function AdminSubjects() {
  const subjects = useAppStore((s) => s.subjects)
  const staff = useAppStore((s) => s.staff)
  const classes = useAppStore((s) => s.classes)
  const upsertSubject = useAppStore((s) => s.upsertSubject)

  const [formOpen, setFormOpen] = useState(false)
  const [form, setForm] = useState<SubjectFormState>(emptyForm)
  const [deleting, setDeleting] = useState<Subject | null>(null)

  const openCreate = () => {
    setForm(emptyForm)
    setFormOpen(true)
  }

  const openEdit = (subject: Subject) => {
    setForm({ id: subject.id, name: subject.name, code: subject.code, teacherIds: subject.teacherIds, classIds: subject.classIds })
    setFormOpen(true)
  }

  const toggle = (key: 'teacherIds' | 'classIds', id: string) => {
    setForm((f) => {
      const has = f[key].includes(id)
      return { ...f, [key]: has ? f[key].filter((x) => x !== id) : [...f[key], id] }
    })
  }

  const save = () => {
    if (!form.name.trim() || !form.code.trim()) {
      toast.error('Subject name and code are required.')
      return
    }
    upsertSubject({
      id: form.id ?? `sub-${Date.now()}`,
      name: form.name,
      code: form.code.toUpperCase(),
      teacherIds: form.teacherIds,
      classIds: form.classIds,
    })
    toast.success(`${form.name} ${form.id ? 'updated' : 'created'}.`)
    setFormOpen(false)
  }

  const confirmDelete = () => {
    if (!deleting) return
    useAppStore.setState((st) => ({ subjects: st.subjects.filter((s) => s.id !== deleting.id) }))
    toast.success(`${deleting.name} removed.`)
    setDeleting(null)
  }

  return (
    <div>
      <PageHeader
        title="Subjects"
        description="Manage the subject catalogue and teacher/class assignments."
        actions={
          <Button onClick={openCreate}>
            <Plus className="h-4 w-4" /> New Subject
          </Button>
        }
      />

      {subjects.length === 0 ? (
        <EmptyState icon={BookOpen} title="No subjects yet" description="Create your first subject to get started." action={{ label: 'New Subject', onClick: openCreate }} />
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {subjects.map((sub) => (
            <Card key={sub.id}>
              <CardContent className="pt-4">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="font-display text-lg font-semibold">{sub.name}</p>
                    <Badge variant="outline">{sub.code}</Badge>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => openEdit(sub)}>
                        <Pencil className="mr-2 h-3.5 w-3.5" /> Edit
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => setDeleting(sub)}>
                        <Trash2 className="mr-2 h-3.5 w-3.5" /> Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
                <div className="mt-3">
                  <p className="text-xs font-medium text-muted-foreground">Teachers</p>
                  <div className="mt-1 flex flex-wrap gap-1">
                    {sub.teacherIds.length === 0 ? (
                      <span className="text-xs text-muted-foreground">None assigned</span>
                    ) : (
                      sub.teacherIds.map((tid) => (
                        <Badge key={tid} variant="secondary">
                          {staff.find((s) => s.id === tid)?.name ?? tid}
                        </Badge>
                      ))
                    )}
                  </div>
                </div>
                <div className="mt-3">
                  <p className="text-xs font-medium text-muted-foreground">Classes</p>
                  <div className="mt-1 flex flex-wrap gap-1">
                    {sub.classIds.length === 0 ? (
                      <span className="text-xs text-muted-foreground">None assigned</span>
                    ) : (
                      sub.classIds.map((cid) => (
                        <Badge key={cid} variant="outline">
                          {classes.find((c) => c.id === cid)?.name ?? cid}
                        </Badge>
                      ))
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={formOpen} onOpenChange={setFormOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{form.id ? 'Edit Subject' : 'New Subject'}</DialogTitle>
            <DialogDescription>Assign teachers and classes for this subject.</DialogDescription>
          </DialogHeader>
          <div className="max-h-[65vh] space-y-4 overflow-y-auto pr-1">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>Subject name</Label>
                <Input value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} />
              </div>
              <div className="space-y-1.5">
                <Label>Code</Label>
                <Input value={form.code} onChange={(e) => setForm((f) => ({ ...f, code: e.target.value }))} />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label>Teachers</Label>
              <div className="grid grid-cols-2 gap-1.5 rounded-md border p-2">
                {staff.map((s) => (
                  <label key={s.id} className="flex items-center gap-2 text-sm">
                    <Checkbox checked={form.teacherIds.includes(s.id)} onCheckedChange={() => toggle('teacherIds', s.id)} />
                    {s.name}
                  </label>
                ))}
              </div>
            </div>
            <div className="space-y-1.5">
              <Label>Classes</Label>
              <div className="grid grid-cols-2 gap-1.5 rounded-md border p-2">
                {classes.map((c) => (
                  <label key={c.id} className="flex items-center gap-2 text-sm">
                    <Checkbox checked={form.classIds.includes(c.id)} onCheckedChange={() => toggle('classIds', c.id)} />
                    {c.name}
                  </label>
                ))}
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setFormOpen(false)}>
              Cancel
            </Button>
            <Button onClick={save}>{form.id ? 'Save changes' : 'Create subject'}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={!!deleting} onOpenChange={(v) => !v && setDeleting(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Subject</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete {deleting?.name}? This cannot be undone.
            </DialogDescription>
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
