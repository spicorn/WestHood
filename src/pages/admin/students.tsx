import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { toast } from 'sonner'
import { Archive, ArchiveRestore, MoreHorizontal, Pencil, Plus, UserPlus } from 'lucide-react'
import { PageHeader } from '@/components/shared/empty-state'
import { DataTable, type Column } from '@/components/shared/data-table'
import { Button } from '@/components/ui/button'
import { Input, Label } from '@/components/ui/input'
import { Badge } from '@/components/ui/card'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Select, Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { useAppStore } from '@/stores/app-store'
import { studentFullName } from '@/data/mock-data'
import type { Student } from '@/data/types'
import { formatDate } from '@/lib/utils'

const studentSchema = z.object({
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  admissionNo: z.string().min(1, 'Admission number is required'),
  dob: z.string().min(1, 'Date of birth is required'),
  classId: z.string().min(1, 'Select a class'),
  gender: z.enum(['M', 'F']),
})

type StudentFormValues = z.infer<typeof studentSchema>

let studentIdSeq = 0
function nextStudentId() {
  studentIdSeq += 1
  return `stu-${Date.now()}-${studentIdSeq}`
}

function StudentFormDialog({
  open,
  onOpenChange,
  editing,
}: {
  open: boolean
  onOpenChange: (v: boolean) => void
  editing: Student | null
}) {
  const classes = useAppStore((s) => s.classes)
  const upsertStudent = useAppStore((s) => s.upsertStudent)

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<StudentFormValues>({
    resolver: zodResolver(studentSchema),
    values: editing
      ? {
          firstName: editing.firstName,
          lastName: editing.lastName,
          admissionNo: editing.admissionNo,
          dob: editing.dob,
          classId: editing.classId,
          gender: editing.gender,
        }
      : {
          firstName: '',
          lastName: '',
          admissionNo: '',
          dob: '',
          classId: classes[0]?.id ?? '',
          gender: 'M',
        },
  })

  const onSubmit = handleSubmit((values) => {
    if (editing) {
      upsertStudent({ ...editing, ...values })
      toast.success(`${values.firstName} ${values.lastName} updated.`)
    } else {
      const id = nextStudentId()
      upsertStudent({
        id,
        ...values,
        status: 'active',
        parentIds: [],
        attendancePct: 100,
        previousAvg: 0,
        currentAvg: 0,
      })
      toast.success(`${values.firstName} ${values.lastName} enrolled.`)
    }
    onOpenChange(false)
    reset()
  })

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{editing ? 'Edit Student' : 'Add Student'}</DialogTitle>
          <DialogDescription>
            {editing ? 'Update this student\u2019s profile details.' : 'Enroll a new student into the school register.'}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={onSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="firstName">First name</Label>
              <Input id="firstName" {...register('firstName')} />
              {errors.firstName && <p className="text-xs text-destructive">{errors.firstName.message}</p>}
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="lastName">Last name</Label>
              <Input id="lastName" {...register('lastName')} />
              {errors.lastName && <p className="text-xs text-destructive">{errors.lastName.message}</p>}
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="admissionNo">Admission No.</Label>
              <Input id="admissionNo" {...register('admissionNo')} />
              {errors.admissionNo && <p className="text-xs text-destructive">{errors.admissionNo.message}</p>}
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="dob">Date of birth</Label>
              <Input id="dob" type="date" {...register('dob')} />
              {errors.dob && <p className="text-xs text-destructive">{errors.dob.message}</p>}
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="classId">Class</Label>
              <Select id="classId" {...register('classId')}>
                {classes.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </Select>
              {errors.classId && <p className="text-xs text-destructive">{errors.classId.message}</p>}
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="gender">Gender</Label>
              <Select id="gender" {...register('gender')}>
                <option value="M">Male</option>
                <option value="F">Female</option>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {editing ? 'Save changes' : 'Enroll student'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

export default function AdminStudents() {
  const navigate = useNavigate()
  const students = useAppStore((s) => s.students)
  const classes = useAppStore((s) => s.classes)
  const archiveStudent = useAppStore((s) => s.archiveStudent)
  const [tab, setTab] = useState<'active' | 'archived'>('active')
  const [formOpen, setFormOpen] = useState(false)
  const [editing, setEditing] = useState<Student | null>(null)

  const classNameOf = (id: string) => classes.find((c) => c.id === id)?.name ?? '—'

  const rows = useMemo(() => students.filter((s) => s.status === tab), [students, tab])

  const columns: Column<Student>[] = [
    {
      key: 'name',
      header: 'Name',
      sortable: true,
      render: (s) => (
        <button
          type="button"
          className="text-left font-medium text-navy-800 hover:underline"
          onClick={() => navigate(`/admin/students/${s.id}`)}
        >
          {studentFullName(s)}
          <span className="ml-2 text-xs font-normal text-muted-foreground">{s.admissionNo}</span>
        </button>
      ),
    },
    { key: 'dob', header: 'DOB', render: (s) => formatDate(s.dob) },
    { key: 'classId', header: 'Class', render: (s) => classNameOf(s.classId) },
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
            <Button variant="ghost" size="icon" onClick={(e) => e.stopPropagation()}>
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => navigate(`/admin/students/${s.id}`)}>View profile</DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => {
                setEditing(s)
                setFormOpen(true)
              }}
            >
              <Pencil className="mr-2 h-3.5 w-3.5" /> Edit
            </DropdownMenuItem>
            {s.status === 'active' ? (
              <DropdownMenuItem
                onClick={() => {
                  archiveStudent(s.id, true)
                  toast.success(`${studentFullName(s)} archived.`)
                }}
              >
                <Archive className="mr-2 h-3.5 w-3.5" /> Archive
              </DropdownMenuItem>
            ) : (
              <DropdownMenuItem
                onClick={() => {
                  archiveStudent(s.id, false)
                  toast.success(`${studentFullName(s)} restored.`)
                }}
              >
                <ArchiveRestore className="mr-2 h-3.5 w-3.5" /> Restore
              </DropdownMenuItem>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      ),
    },
  ]

  return (
    <div>
      <PageHeader
        title="Students"
        description="Manage enrollment, profiles, and student records."
        actions={
          <Button
            onClick={() => {
              setEditing(null)
              setFormOpen(true)
            }}
          >
            <UserPlus className="h-4 w-4" /> Add Student
          </Button>
        }
      />

      <Tabs value={tab} onValueChange={(v) => setTab(v as 'active' | 'archived')}>
        <TabsList>
          <TabsTrigger value="active">
            Active ({students.filter((s) => s.status === 'active').length})
          </TabsTrigger>
          <TabsTrigger value="archived">
            Archived ({students.filter((s) => s.status === 'archived').length})
          </TabsTrigger>
        </TabsList>
        <TabsContent value={tab}>
          <DataTable
            data={rows}
            columns={columns}
            searchKeys={['firstName', 'lastName', 'admissionNo']}
            searchPlaceholder="Search students by name or admission no…"
            onRowClick={(s) => navigate(`/admin/students/${s.id}`)}
            emptyMessage={tab === 'active' ? 'No active students found.' : 'No archived students.'}
          />
        </TabsContent>
      </Tabs>

      <StudentFormDialog open={formOpen} onOpenChange={setFormOpen} editing={editing} />

      {students.length === 0 && (
        <Button variant="outline" className="mt-4" onClick={() => setFormOpen(true)}>
          <Plus className="h-4 w-4" /> Add your first student
        </Button>
      )}
    </div>
  )
}
