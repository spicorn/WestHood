import { useMemo, useState } from 'react'
import { toast } from 'sonner'
import { ArrowRightLeft, GraduationCap, MoreHorizontal, Pencil, Plus, Sparkles, Users } from 'lucide-react'
import { PageHeader } from '@/components/shared/empty-state'
import { Card, CardContent, Badge } from '@/components/ui/card'
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { useAppStore } from '@/stores/app-store'
import { studentFullName } from '@/data/mock-data'
import type { ALevelStream, ClassRoom } from '@/data/types'
import { SubjectCombinationAdvisor } from '@/components/shared/subject-combination-advisor'
import { STREAM_LABELS, adviseALevelStreams } from '@/lib/alevel-advisor'

const LEVELS: { value: ClassRoom['level']; label: string }[] = [
  { value: 'olevel', label: 'O-Level' },
  { value: 'alevel', label: 'A-Level' },
]

const COLOR_PRESETS = ['#E8A87C', '#F2C94C', '#85C1E9', '#82E0AA', '#76D7C4', '#5DADE2', '#AF7AC5', '#5D6D7E', '#1A5276', '#0E6655']

interface ClassFormState {
  id?: string
  name: string
  grade: string
  level: ClassRoom['level']
  color: string
  capacity: number
  classTeacherId: string
}

const emptyForm: ClassFormState = {
  name: '',
  grade: '',
  level: 'olevel',
  color: COLOR_PRESETS[0],
  capacity: 30,
  classTeacherId: '',
}

export default function AdminClasses() {
  const classes = useAppStore((s) => s.classes)
  const students = useAppStore((s) => s.students)
  const staff = useAppStore((s) => s.staff)
  const grades = useAppStore((s) => s.grades)
  const subjects = useAppStore((s) => s.subjects)
  const homework = useAppStore((s) => s.homework)
  const upsertClass = useAppStore((s) => s.upsertClass)
  const upsertStaff = useAppStore((s) => s.upsertStaff)
  const upsertStudent = useAppStore((s) => s.upsertStudent)
  const promoteClass = useAppStore((s) => s.promoteClass)

  const [formOpen, setFormOpen] = useState(false)
  const [form, setForm] = useState<ClassFormState>(emptyForm)

  const [moveOpen, setMoveOpen] = useState(false)
  const [moveFromId, setMoveFromId] = useState<string>('')
  const [moveToId, setMoveToId] = useState<string>('')
  const [moveSelected, setMoveSelected] = useState<string[]>([])

  const [promoteOpen, setPromoteOpen] = useState(false)
  const [promoteFromId, setPromoteFromId] = useState<string>('')
  const [promoteToId, setPromoteToId] = useState<string>('')
  const [promoteExclude, setPromoteExclude] = useState<string[]>([])
  const [streamByStudent, setStreamByStudent] = useState<Record<string, ALevelStream>>({})
  const [advisorStudentId, setAdvisorStudentId] = useState<string | null>(null)

  const activeStaff = useMemo(() => staff.filter((s) => s.status === 'active'), [staff])
  const countIn = (classId: string) => students.filter((s) => s.classId === classId && s.status === 'active').length

  const openCreate = () => {
    setForm(emptyForm)
    setFormOpen(true)
  }

  const openEdit = (c: ClassRoom) => {
    setForm({
      id: c.id,
      name: c.name,
      grade: c.grade,
      level: c.level,
      color: c.color,
      capacity: c.capacity,
      classTeacherId: c.classTeacherId ?? '',
    })
    setFormOpen(true)
  }

  const saveClass = () => {
    if (!form.name.trim() || !form.grade.trim()) {
      toast.error('Class name and grade are required.')
      return
    }
    const id = form.id ?? `c-${Date.now()}`
    upsertClass({
      id,
      name: form.name,
      grade: form.grade,
      level: form.level,
      color: form.color,
      capacity: form.capacity,
      classTeacherId: form.classTeacherId || undefined,
    })

    // Unassign any previous class teacher for this class if it changed
    staff
      .filter((s) => s.classTeacherOf === id && s.id !== form.classTeacherId)
      .forEach((s) => upsertStaff({ ...s, isClassTeacher: false, classTeacherOf: undefined }))

    if (form.classTeacherId) {
      const teacher = staff.find((s) => s.id === form.classTeacherId)
      if (teacher) {
        upsertStaff({
          ...teacher,
          isClassTeacher: true,
          classTeacherOf: id,
          classIds: teacher.classIds.includes(id) ? teacher.classIds : [...teacher.classIds, id],
        })
      }
    }

    toast.success(`${form.name} ${form.id ? 'updated' : 'created'}.`)
    setFormOpen(false)
  }

  const openMove = (fromId: string) => {
    setMoveFromId(fromId)
    setMoveToId(classes.find((c) => c.id !== fromId)?.id ?? '')
    setMoveSelected([])
    setMoveOpen(true)
  }

  const moveCandidates = students.filter((s) => s.classId === moveFromId && s.status === 'active')

  const confirmMove = () => {
    if (!moveToId || moveSelected.length === 0) {
      toast.error('Select a destination class and at least one student.')
      return
    }
    moveSelected.forEach((sid) => {
      const student = students.find((s) => s.id === sid)
      if (student) upsertStudent({ ...student, classId: moveToId })
    })
    toast.success(`Moved ${moveSelected.length} student${moveSelected.length > 1 ? 's' : ''} to ${classes.find((c) => c.id === moveToId)?.name}.`)
    setMoveOpen(false)
  }

  const openPromote = () => {
    const fromId = classes.find((c) => c.id === 'c-f4')?.id ?? classes[0]?.id ?? ''
    const toId = classes.find((c) => c.id === 'c-l6')?.id ?? classes[1]?.id ?? classes[0]?.id ?? ''
    setPromoteFromId(fromId)
    setPromoteToId(toId)
    setPromoteExclude([])
    setStreamByStudent({})
    setAdvisorStudentId(null)
    setPromoteOpen(true)
  }

  const promoteCandidates = students.filter((s) => s.classId === promoteFromId && s.status === 'active')
  const isForm4ToL6 = promoteFromId === 'c-f4' && promoteToId === 'c-l6'
  const advisorStudent = advisorStudentId ? students.find((s) => s.id === advisorStudentId) : undefined
  const advisorAdvice = advisorStudent
    ? adviseALevelStreams(advisorStudent, grades, subjects, homework)
    : []

  const confirmPromote = () => {
    if (!promoteFromId || !promoteToId) return
    const streams = isForm4ToL6 ? streamByStudent : undefined
    if (isForm4ToL6) {
      const missing = promoteCandidates.filter((s) => !promoteExclude.includes(s.id) && !streams?.[s.id])
      if (missing.length > 0) {
        toast.error(`Select an A-Level stream for ${missing.length} student${missing.length === 1 ? '' : 's'}.`)
        return
      }
    }
    promoteClass(promoteFromId, promoteToId, promoteExclude, streams)
    const moved = promoteCandidates.length - promoteExclude.length
    toast.success(`Promoted ${moved} student${moved !== 1 ? 's' : ''} from ${classes.find((c) => c.id === promoteFromId)?.name} to ${classes.find((c) => c.id === promoteToId)?.name}.`)
    setPromoteOpen(false)
  }

  return (
    <div>
      <PageHeader
        title="Classes"
        description="Manage class rosters, teachers, and year-end promotion."
        actions={
          <>
            <Button variant="outline" onClick={openPromote}>
              <Sparkles className="h-4 w-4" /> Year-End Promotion
            </Button>
            <Button onClick={openCreate}>
              <Plus className="h-4 w-4" /> New Class
            </Button>
          </>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {classes.map((c) => {
          const teacher = staff.find((s) => s.id === c.classTeacherId)
          const enrolled = countIn(c.id)
          return (
            <Card key={c.id} className="overflow-hidden">
              <div className="h-2" style={{ backgroundColor: c.color }} />
              <CardContent className="pt-4">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="font-display text-lg font-semibold">{c.name}</p>
                    <p className="text-xs text-muted-foreground">{c.grade}</p>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => openEdit(c)}>
                        <Pencil className="mr-2 h-3.5 w-3.5" /> Edit / Assign Teacher
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => openMove(c.id)}>
                        <ArrowRightLeft className="mr-2 h-3.5 w-3.5" /> Move Students
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
                <Badge variant="outline" className="mt-2">
                  {LEVELS.find((l) => l.value === c.level)?.label}
                </Badge>
                <div className="mt-4 flex items-center gap-1.5 text-sm text-muted-foreground">
                  <Users className="h-3.5 w-3.5" />
                  {enrolled} / {c.capacity} students
                </div>
                <div className="mt-1.5 flex items-center gap-1.5 text-sm text-muted-foreground">
                  <GraduationCap className="h-3.5 w-3.5" />
                  {teacher ? teacher.name : 'No class teacher assigned'}
                </div>
                <div className="mt-3 h-1.5 w-full rounded-full bg-muted">
                  <div
                    className="h-1.5 rounded-full"
                    style={{
                      width: `${Math.min(100, (enrolled / c.capacity) * 100)}%`,
                      backgroundColor: c.color,
                    }}
                  />
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Create / Edit Class Dialog */}
      <Dialog open={formOpen} onOpenChange={setFormOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{form.id ? 'Edit Class' : 'New Class'}</DialogTitle>
            <DialogDescription>Configure class details and assign a class teacher.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>Class name</Label>
                <Input value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} />
              </div>
              <div className="space-y-1.5">
                <Label>Grade</Label>
                <Input value={form.grade} onChange={(e) => setForm((f) => ({ ...f, grade: e.target.value }))} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>Level</Label>
                <Select value={form.level} onChange={(e) => setForm((f) => ({ ...f, level: e.target.value as ClassRoom['level'] }))}>
                  {LEVELS.map((l) => (
                    <option key={l.value} value={l.value}>
                      {l.label}
                    </option>
                  ))}
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label>Capacity</Label>
                <Input
                  type="number"
                  min={1}
                  value={form.capacity}
                  onChange={(e) => setForm((f) => ({ ...f, capacity: Number(e.target.value) }))}
                />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label>Color</Label>
              <div className="flex flex-wrap gap-2">
                {COLOR_PRESETS.map((color) => (
                  <button
                    key={color}
                    type="button"
                    onClick={() => setForm((f) => ({ ...f, color }))}
                    className="h-8 w-8 rounded-full ring-offset-2 transition-transform hover:scale-110"
                    style={{
                      backgroundColor: color,
                      outline: form.color === color ? `2px solid ${color}` : undefined,
                      boxShadow: form.color === color ? '0 0 0 2px white, 0 0 0 4px ' + color : undefined,
                    }}
                    aria-label={color}
                  />
                ))}
              </div>
            </div>
            <div className="space-y-1.5">
              <Label>Class Teacher</Label>
              <Select value={form.classTeacherId} onChange={(e) => setForm((f) => ({ ...f, classTeacherId: e.target.value }))}>
                <option value="">Unassigned</option>
                {activeStaff.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name}
                  </option>
                ))}
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setFormOpen(false)}>
              Cancel
            </Button>
            <Button onClick={saveClass}>{form.id ? 'Save changes' : 'Create class'}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Move Students Dialog */}
      <Dialog open={moveOpen} onOpenChange={setMoveOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Move Students</DialogTitle>
            <DialogDescription>Move selected students from {classes.find((c) => c.id === moveFromId)?.name} to another class.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-1.5">
              <Label>Destination class</Label>
              <Select value={moveToId} onChange={(e) => setMoveToId(e.target.value)}>
                {classes
                  .filter((c) => c.id !== moveFromId)
                  .map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
              </Select>
            </div>
            <div className="max-h-64 space-y-1.5 overflow-y-auto rounded-md border p-2">
              {moveCandidates.length === 0 ? (
                <p className="p-2 text-sm text-muted-foreground">No active students in this class.</p>
              ) : (
                moveCandidates.map((s) => (
                  <label key={s.id} className="flex items-center gap-2 rounded-md px-2 py-1.5 text-sm hover:bg-muted/60">
                    <Checkbox
                      checked={moveSelected.includes(s.id)}
                      onCheckedChange={(checked) =>
                        setMoveSelected((prev) => (checked ? [...prev, s.id] : prev.filter((id) => id !== s.id)))
                      }
                    />
                    {studentFullName(s)}
                    <span className="ml-auto text-xs text-muted-foreground">{s.admissionNo}</span>
                  </label>
                ))
              )}
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setMoveOpen(false)}>
              Cancel
            </Button>
            <Button onClick={confirmMove}>Move {moveSelected.length > 0 ? `(${moveSelected.length})` : ''}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Year-End Promotion Dialog */}
      <Dialog open={promoteOpen} onOpenChange={setPromoteOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-gold-500" /> One-Click Year-End Promotion
            </DialogTitle>
            <DialogDescription>Promote all active students from one class to the next. Uncheck any student to exclude them (e.g. repeating the year).</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>Promote from</Label>
                <Select
                  value={promoteFromId}
                  onChange={(e) => {
                    setPromoteFromId(e.target.value)
                    setPromoteExclude([])
                    setStreamByStudent({})
                    setAdvisorStudentId(null)
                  }}
                >
                  {classes.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label>Promote to</Label>
                <Select
                  value={promoteToId}
                  onChange={(e) => {
                    setPromoteToId(e.target.value)
                    setStreamByStudent({})
                    setAdvisorStudentId(null)
                  }}
                >
                  {classes
                    .filter((c) => c.id !== promoteFromId)
                    .map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                </Select>
              </div>
            </div>

            <div className="overflow-hidden rounded-lg border">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b bg-muted/50 text-left">
                    <th className="w-10 px-3 py-2" />
                    <th className="px-3 py-2 font-semibold text-muted-foreground">Student</th>
                    <th className="px-3 py-2 font-semibold text-muted-foreground">Current avg.</th>
                    {isForm4ToL6 && (
                      <th className="px-3 py-2 font-semibold text-muted-foreground">A-Level stream</th>
                    )}
                    <th className="px-3 py-2 font-semibold text-muted-foreground">Outcome</th>
                  </tr>
                </thead>
                <tbody>
                  {promoteCandidates.length === 0 ? (
                    <tr>
                      <td colSpan={isForm4ToL6 ? 5 : 4} className="px-3 py-6 text-center text-muted-foreground">
                        No active students to promote in this class.
                      </td>
                    </tr>
                  ) : (
                    promoteCandidates.map((s) => {
                      const excluded = promoteExclude.includes(s.id)
                      return (
                        <tr key={s.id} className="border-b last:border-0">
                          <td className="px-3 py-2">
                            <Checkbox
                              checked={!excluded}
                              onCheckedChange={(checked) =>
                                setPromoteExclude((prev) => (checked ? prev.filter((id) => id !== s.id) : [...prev, s.id]))
                              }
                            />
                          </td>
                          <td className="px-3 py-2">{studentFullName(s)}</td>
                          <td className="px-3 py-2">{s.currentAvg}%</td>
                          {isForm4ToL6 && (
                            <td className="px-3 py-2">
                              {!excluded && (
                                <div className="flex flex-wrap items-center gap-2">
                                  <Select
                                    className="w-36"
                                    value={streamByStudent[s.id] ?? ''}
                                    onChange={(e) =>
                                      setStreamByStudent((prev) => ({
                                        ...prev,
                                        [s.id]: e.target.value as ALevelStream,
                                      }))
                                    }
                                  >
                                    <option value="">Select stream</option>
                                    {(Object.keys(STREAM_LABELS) as ALevelStream[]).map((stream) => (
                                      <option key={stream} value={stream}>
                                        {STREAM_LABELS[stream]}
                                      </option>
                                    ))}
                                  </Select>
                                  <Button size="sm" variant="ghost" onClick={() => setAdvisorStudentId(s.id)}>
                                    Advisor
                                  </Button>
                                </div>
                              )}
                            </td>
                          )}
                          <td className="px-3 py-2">
                            {excluded ? (
                              <Badge variant="secondary">Stays in {classes.find((c) => c.id === promoteFromId)?.name}</Badge>
                            ) : (
                              <Badge variant="success">Promotes to {classes.find((c) => c.id === promoteToId)?.name}</Badge>
                            )}
                          </td>
                        </tr>
                      )
                    })
                  )}
                </tbody>
              </table>
            </div>
            {isForm4ToL6 && advisorStudent && (
              <SubjectCombinationAdvisor
                advice={advisorAdvice}
                showPicker
                selectedStream={streamByStudent[advisorStudent.id]}
                onSelectStream={(stream) => {
                  setStreamByStudent((prev) => ({ ...prev, [advisorStudent.id]: stream }))
                  toast.success(`${STREAM_LABELS[stream]} selected for ${studentFullName(advisorStudent)}.`)
                }}
              />
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setPromoteOpen(false)}>
              Cancel
            </Button>
            <Button onClick={confirmPromote} disabled={promoteCandidates.length === 0}>
              Confirm Promotion ({promoteCandidates.length - promoteExclude.length})
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
