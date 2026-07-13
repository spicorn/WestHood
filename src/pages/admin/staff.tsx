import { useMemo, useState } from 'react'
import { toast } from 'sonner'
import { KeyRound, MoreHorizontal, Pencil, ShieldOff, ShieldCheck, UserPlus } from 'lucide-react'
import { PageHeader } from '@/components/shared/empty-state'
import { DataTable, type Column } from '@/components/shared/data-table'
import { Card, CardContent, CardHeader, CardTitle, Badge } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input, Label } from '@/components/ui/input'
import { Avatar, Checkbox, Select, Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
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
import type { StaffMember } from '@/data/types'

interface StaffFormState {
  name: string
  email: string
  phone: string
  bio: string
  subjects: string[]
  classIds: string[]
  isClassTeacher: boolean
  classTeacherOf: string
}

function toFormState(s: StaffMember): StaffFormState {
  return {
    name: s.name,
    email: s.email,
    phone: s.phone,
    bio: s.bio,
    subjects: s.subjects,
    classIds: s.classIds,
    isClassTeacher: s.isClassTeacher,
    classTeacherOf: s.classTeacherOf ?? '',
  }
}

export default function AdminStaff() {
  const staff = useAppStore((s) => s.staff)
  const subjects = useAppStore((s) => s.subjects)
  const classes = useAppStore((s) => s.classes)
  const timetable = useAppStore((s) => s.timetable)
  const upsertStaff = useAppStore((s) => s.upsertStaff)
  const upsertClass = useAppStore((s) => s.upsertClass)

  const [editing, setEditing] = useState<StaffMember | null>(null)
  const [form, setForm] = useState<StaffFormState | null>(null)
  const [addOpen, setAddOpen] = useState(false)
  const [addForm, setAddForm] = useState({ name: '', email: '', phone: '' })

  const openEdit = (s: StaffMember) => {
    setEditing(s)
    setForm(toFormState(s))
  }

  const toggleInArray = (key: 'subjects' | 'classIds', id: string) => {
    setForm((f) => {
      if (!f) return f
      const has = f[key].includes(id)
      return { ...f, [key]: has ? f[key].filter((x) => x !== id) : [...f[key], id] }
    })
  }

  const saveEdit = () => {
    if (!editing || !form) return
    if (!form.name.trim() || !form.email.trim()) {
      toast.error('Name and email are required.')
      return
    }
    const updated: StaffMember = {
      ...editing,
      name: form.name,
      email: form.email,
      phone: form.phone,
      bio: form.bio,
      subjects: form.subjects,
      classIds: form.classIds,
      isClassTeacher: form.isClassTeacher,
      classTeacherOf: form.isClassTeacher && form.classTeacherOf ? form.classTeacherOf : undefined,
    }
    upsertStaff(updated)

    if (form.isClassTeacher && form.classTeacherOf) {
      staff
        .filter((s) => s.classTeacherOf === form.classTeacherOf && s.id !== editing.id)
        .forEach((s) => upsertStaff({ ...s, isClassTeacher: false, classTeacherOf: undefined }))
      const targetClass = classes.find((c) => c.id === form.classTeacherOf)
      if (targetClass) upsertClass({ ...targetClass, classTeacherId: editing.id })
    } else if (editing.classTeacherOf) {
      const previousClass = classes.find((c) => c.id === editing.classTeacherOf)
      if (previousClass && previousClass.classTeacherId === editing.id) {
        upsertClass({ ...previousClass, classTeacherId: undefined })
      }
    }

    toast.success(`${form.name}'s profile updated.`)
    setEditing(null)
    setForm(null)
  }

  const toggleActive = (s: StaffMember) => {
    upsertStaff({ ...s, status: s.status === 'active' ? 'inactive' : 'active' })
    toast.success(`${s.name} is now ${s.status === 'active' ? 'inactive' : 'active'}.`)
  }

  const resetPassword = (s: StaffMember) => {
    toast.success(`Password reset link sent to ${s.email}.`)
  }

  const addStaff = () => {
    if (!addForm.name.trim() || !addForm.email.trim()) {
      toast.error('Name and email are required.')
      return
    }
    const id = `st-${Date.now()}`
    upsertStaff({
      id,
      name: addForm.name,
      email: addForm.email,
      phone: addForm.phone,
      subjects: [],
      classIds: [],
      isClassTeacher: false,
      status: 'active',
      bio: '',
      userId: `u-${id}`,
    })
    toast.success(`${addForm.name} added to staff.`)
    setAddOpen(false)
    setAddForm({ name: '', email: '', phone: '' })
  }

  const workload = useMemo(
    () =>
      staff
        .map((s) => {
          const periods = timetable.filter((t) => t.teacherId === s.id)
          const subjectNames = Array.from(new Set(periods.map((p) => subjects.find((sub) => sub.id === p.subjectId)?.name).filter(Boolean)))
          const classNames = Array.from(new Set(periods.map((p) => classes.find((c) => c.id === p.classId)?.name).filter(Boolean)))
          return { staff: s, periodCount: periods.length, subjectNames, classNames }
        })
        .sort((a, b) => b.periodCount - a.periodCount),
    [staff, timetable, subjects, classes],
  )

  const columns: Column<StaffMember>[] = [
    {
      key: 'name',
      header: 'Name',
      sortable: true,
      render: (s) => (
        <div className="flex items-center gap-2">
          <Avatar name={s.name} size="sm" />
          <div>
            <p className="font-medium text-navy-800">{s.name}</p>
            <p className="text-xs text-muted-foreground">{s.email}</p>
          </div>
        </div>
      ),
    },
    {
      key: 'subjects',
      header: 'Subjects',
      render: (s) => (
        <div className="flex flex-wrap gap-1">
          {s.subjects.map((subId) => (
            <Badge key={subId} variant="outline">
              {subjects.find((sub) => sub.id === subId)?.code ?? subId}
            </Badge>
          ))}
        </div>
      ),
    },
    {
      key: 'classes',
      header: 'Classes',
      render: (s) => <span className="text-sm text-muted-foreground">{s.classIds.length} classes</span>,
    },
    {
      key: 'classTeacher',
      header: 'Class Teacher',
      render: (s) =>
        s.isClassTeacher ? (
          <Badge variant="gold">{classes.find((c) => c.id === s.classTeacherOf)?.name ?? 'Yes'}</Badge>
        ) : (
          <span className="text-xs text-muted-foreground">No</span>
        ),
    },
    {
      key: 'status',
      header: 'Status',
      render: (s) => <Badge variant={s.status === 'active' ? 'success' : 'secondary'}>{s.status}</Badge>,
    },
    {
      key: 'actions',
      header: 'Actions',
      className: 'w-16',
      render: (s) => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => openEdit(s)}>
              <Pencil className="mr-2 h-3.5 w-3.5" /> Edit
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => resetPassword(s)}>
              <KeyRound className="mr-2 h-3.5 w-3.5" /> Reset password
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => toggleActive(s)}>
              {s.status === 'active' ? (
                <>
                  <ShieldOff className="mr-2 h-3.5 w-3.5" /> Deactivate
                </>
              ) : (
                <>
                  <ShieldCheck className="mr-2 h-3.5 w-3.5" /> Activate
                </>
              )}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ),
    },
  ]

  return (
    <div>
      <PageHeader
        title="Staff"
        description="Manage teaching staff, subjects, classes, and workload."
        actions={
          <Button onClick={() => setAddOpen(true)}>
            <UserPlus className="h-4 w-4" /> Add Staff
          </Button>
        }
      />

      <Tabs defaultValue="directory">
        <TabsList>
          <TabsTrigger value="directory">Directory</TabsTrigger>
          <TabsTrigger value="workload">Teacher Workload</TabsTrigger>
        </TabsList>
        <TabsContent value="directory">
          <DataTable data={staff} columns={columns} searchKeys={['name', 'email']} searchPlaceholder="Search staff…" />
        </TabsContent>
        <TabsContent value="workload">
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {workload.map(({ staff: s, periodCount, subjectNames, classNames }) => (
              <Card key={s.id}>
                <CardHeader className="pb-2">
                  <CardTitle className="flex items-center gap-2 text-base">
                    <Avatar name={s.name} size="sm" />
                    {s.name}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 pt-0">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Periods / week</span>
                    <span className="font-display text-2xl font-semibold text-navy-800">{periodCount}</span>
                  </div>
                  <div>
                    <p className="text-xs font-medium text-muted-foreground">Subjects taught</p>
                    <div className="mt-1 flex flex-wrap gap-1">
                      {subjectNames.length ? subjectNames.map((n) => <Badge key={n} variant="outline">{n}</Badge>) : <span className="text-xs text-muted-foreground">None scheduled</span>}
                    </div>
                  </div>
                  <div>
                    <p className="text-xs font-medium text-muted-foreground">Classes</p>
                    <div className="mt-1 flex flex-wrap gap-1">
                      {classNames.length ? classNames.map((n) => <Badge key={n} variant="secondary">{n}</Badge>) : <span className="text-xs text-muted-foreground">None scheduled</span>}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>

      <Dialog
        open={!!editing}
        onOpenChange={(v) => {
          if (!v) {
            setEditing(null)
            setForm(null)
          }
        }}
      >
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Edit Staff Member</DialogTitle>
            <DialogDescription>Update subjects, classes, and class-teacher assignment.</DialogDescription>
          </DialogHeader>
          {form && (
            <div className="max-h-[65vh] space-y-4 overflow-y-auto pr-1">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label>Name</Label>
                  <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
                </div>
                <div className="space-y-1.5">
                  <Label>Email</Label>
                  <Input value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
                </div>
              </div>
              <div className="space-y-1.5">
                <Label>Phone</Label>
                <Input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
              </div>
              <div className="space-y-1.5">
                <Label>Bio</Label>
                <Input value={form.bio} onChange={(e) => setForm({ ...form, bio: e.target.value })} />
              </div>
              <div className="space-y-1.5">
                <Label>Subjects</Label>
                <div className="grid grid-cols-2 gap-1.5 rounded-md border p-2">
                  {subjects.map((sub) => (
                    <label key={sub.id} className="flex items-center gap-2 text-sm">
                      <Checkbox checked={form.subjects.includes(sub.id)} onCheckedChange={() => toggleInArray('subjects', sub.id)} />
                      {sub.name}
                    </label>
                  ))}
                </div>
              </div>
              <div className="space-y-1.5">
                <Label>Classes</Label>
                <div className="grid grid-cols-2 gap-1.5 rounded-md border p-2">
                  {classes.map((c) => (
                    <label key={c.id} className="flex items-center gap-2 text-sm">
                      <Checkbox checked={form.classIds.includes(c.id)} onCheckedChange={() => toggleInArray('classIds', c.id)} />
                      {c.name}
                    </label>
                  ))}
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Checkbox
                  id="isClassTeacher"
                  checked={form.isClassTeacher}
                  onCheckedChange={(checked) => setForm({ ...form, isClassTeacher: checked })}
                />
                <Label htmlFor="isClassTeacher">Class teacher</Label>
              </div>
              {form.isClassTeacher && (
                <div className="space-y-1.5">
                  <Label>Class teacher of</Label>
                  <Select value={form.classTeacherOf} onChange={(e) => setForm({ ...form, classTeacherOf: e.target.value })}>
                    <option value="">Select a class</option>
                    {form.classIds.length > 0
                      ? classes
                          .filter((c) => form.classIds.includes(c.id))
                          .map((c) => (
                            <option key={c.id} value={c.id}>
                              {c.name}
                            </option>
                          ))
                      : classes.map((c) => (
                          <option key={c.id} value={c.id}>
                            {c.name}
                          </option>
                        ))}
                  </Select>
                </div>
              )}
            </div>
          )}
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setEditing(null)
                setForm(null)
              }}
            >
              Cancel
            </Button>
            <Button onClick={saveEdit}>Save changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={addOpen} onOpenChange={setAddOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Staff Member</DialogTitle>
            <DialogDescription>Create a new staff account. Subjects and classes can be assigned after creation.</DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <div className="space-y-1.5">
              <Label>Name</Label>
              <Input value={addForm.name} onChange={(e) => setAddForm((f) => ({ ...f, name: e.target.value }))} />
            </div>
            <div className="space-y-1.5">
              <Label>Email</Label>
              <Input value={addForm.email} onChange={(e) => setAddForm((f) => ({ ...f, email: e.target.value }))} />
            </div>
            <div className="space-y-1.5">
              <Label>Phone</Label>
              <Input value={addForm.phone} onChange={(e) => setAddForm((f) => ({ ...f, phone: e.target.value }))} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAddOpen(false)}>
              Cancel
            </Button>
            <Button onClick={addStaff}>Add staff member</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
