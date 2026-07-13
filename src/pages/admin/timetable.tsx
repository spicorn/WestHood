import { useMemo, useState } from 'react'
import { toast } from 'sonner'
import { AlertTriangle, Clock, Pencil, Plus } from 'lucide-react'
import { PageHeader } from '@/components/shared/empty-state'
import { Card, CardContent, Badge } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input, Label } from '@/components/ui/input'
import { Select } from '@/components/ui/tabs'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { useAppStore } from '@/stores/app-store'
import type { TimetableSlot } from '@/data/types'
import { cn } from '@/lib/utils'

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday']

interface SlotFormState {
  id?: string
  day: number
  period: number
  startTime: string
  endTime: string
  subjectId: string
  teacherId: string
  room: string
}

export default function AdminTimetable() {
  const classes = useAppStore((s) => s.classes)
  const subjects = useAppStore((s) => s.subjects)
  const staff = useAppStore((s) => s.staff)
  const timetable = useAppStore((s) => s.timetable)
  const upsertTimetableSlot = useAppStore((s) => s.upsertTimetableSlot)

  const [classId, setClassId] = useState(classes[0]?.id ?? '')
  const [dialogOpen, setDialogOpen] = useState(false)
  const [form, setForm] = useState<SlotFormState | null>(null)

  const periods = useMemo(() => {
    const map = new Map<number, { period: number; startTime: string; endTime: string }>()
    for (const slot of timetable) {
      if (!map.has(slot.period)) map.set(slot.period, { period: slot.period, startTime: slot.startTime, endTime: slot.endTime })
    }
    return Array.from(map.values()).sort((a, b) => a.period - b.period)
  }, [timetable])

  const classSlots = useMemo(() => timetable.filter((t) => t.classId === classId), [timetable, classId])
  const classSubjects = useMemo(() => subjects.filter((s) => s.classIds.includes(classId)), [subjects, classId])

  const findSlot = (day: number, period: number) => classSlots.find((s) => s.day === day && s.period === period)

  const openNew = (day: number, period: number) => {
    const periodInfo = periods.find((p) => p.period === period)
    setForm({
      day,
      period,
      startTime: periodInfo?.startTime ?? '',
      endTime: periodInfo?.endTime ?? '',
      subjectId: classSubjects[0]?.id ?? '',
      teacherId: classSubjects[0]?.teacherIds[0] ?? staff[0]?.id ?? '',
      room: '',
    })
    setDialogOpen(true)
  }

  const openEdit = (slot: TimetableSlot) => {
    setForm({
      id: slot.id,
      day: slot.day,
      period: slot.period,
      startTime: slot.startTime,
      endTime: slot.endTime,
      subjectId: slot.subjectId,
      teacherId: slot.teacherId,
      room: slot.room,
    })
    setDialogOpen(true)
  }

  const conflicts = useMemo(() => {
    if (!form) return []
    return timetable.filter(
      (t) =>
        t.id !== form.id &&
        t.day === form.day &&
        t.period === form.period &&
        (t.teacherId === form.teacherId || (form.room && t.room === form.room)),
    )
  }, [form, timetable])

  const conflictMessages = useMemo(
    () =>
      conflicts.map((c) => {
        const cls = classes.find((cc) => cc.id === c.classId)?.name ?? c.classId
        const teacher = staff.find((s) => s.id === c.teacherId)?.name ?? c.teacherId
        const reasons: string[] = []
        if (form && c.teacherId === form.teacherId) reasons.push(`${teacher} is already teaching ${cls}`)
        if (form && form.room && c.room === form.room) reasons.push(`Room ${c.room} is already booked by ${cls}`)
        return reasons.join(' · ')
      }),
    [conflicts, classes, staff, form],
  )

  const save = () => {
    if (!form) return
    if (!form.subjectId || !form.teacherId || !form.room.trim()) {
      toast.error('Subject, teacher, and room are required.')
      return
    }
    if (conflicts.length > 0) {
      toast.error('Resolve the scheduling clash before saving.')
      return
    }
    upsertTimetableSlot({
      id: form.id ?? `tt-${Date.now()}`,
      classId,
      day: form.day,
      period: form.period,
      startTime: form.startTime,
      endTime: form.endTime,
      subjectId: form.subjectId,
      teacherId: form.teacherId,
      room: form.room,
    })
    toast.success(`Timetable slot ${form.id ? 'updated' : 'added'}.`)
    setDialogOpen(false)
    setForm(null)
  }

  return (
    <div>
      <PageHeader
        title="Timetable"
        description="Build weekly schedules per class with automatic clash detection."
        actions={
          <div className="w-56">
            <Select value={classId} onChange={(e) => setClassId(e.target.value)}>
              {classes.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </Select>
          </div>
        }
      />

      <Card>
        <CardContent className="overflow-x-auto pt-5">
          <table className="w-full border-separate border-spacing-1 text-sm">
            <thead>
              <tr>
                <th className="w-24 text-left text-xs font-semibold text-muted-foreground">Period</th>
                {DAYS.map((d) => (
                  <th key={d} className="text-left text-xs font-semibold text-muted-foreground">
                    {d}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {periods.map((p) => (
                <tr key={p.period}>
                  <td className="align-top text-xs text-muted-foreground">
                    <p className="font-semibold text-navy-700">Period {p.period}</p>
                    <p className="flex items-center gap-1">
                      <Clock className="h-3 w-3" /> {p.startTime}–{p.endTime}
                    </p>
                  </td>
                  {DAYS.map((_, dayIdx) => {
                    const slot = findSlot(dayIdx, p.period)
                    return (
                      <td key={dayIdx} className="align-top">
                        {slot ? (
                          <button
                            type="button"
                            onClick={() => openEdit(slot)}
                            className="group w-full rounded-md border border-navy-200 bg-navy-50/60 p-2 text-left transition-colors hover:bg-navy-50"
                          >
                            <div className="flex items-center justify-between">
                              <Badge variant="outline">{subjects.find((s) => s.id === slot.subjectId)?.code}</Badge>
                              <Pencil className="h-3 w-3 text-muted-foreground opacity-0 group-hover:opacity-100" />
                            </div>
                            <p className="mt-1 truncate text-xs font-medium text-navy-800">
                              {staff.find((s) => s.id === slot.teacherId)?.name}
                            </p>
                            <p className="text-[11px] text-muted-foreground">Room {slot.room}</p>
                          </button>
                        ) : (
                          <button
                            type="button"
                            onClick={() => openNew(dayIdx, p.period)}
                            className="flex h-[64px] w-full items-center justify-center rounded-md border border-dashed text-muted-foreground transition-colors hover:border-navy-300 hover:text-navy-600"
                          >
                            <Plus className="h-4 w-4" />
                          </button>
                        )}
                      </td>
                    )
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>

      <Dialog
        open={dialogOpen}
        onOpenChange={(v) => {
          setDialogOpen(v)
          if (!v) setForm(null)
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{form?.id ? 'Edit Timetable Slot' : 'Add Timetable Slot'}</DialogTitle>
            <DialogDescription>
              {classes.find((c) => c.id === classId)?.name} · {form ? DAYS[form.day] : ''} · Period {form?.period}
            </DialogDescription>
          </DialogHeader>
          {form && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label>Start time</Label>
                  <Input type="time" value={form.startTime} onChange={(e) => setForm({ ...form, startTime: e.target.value })} />
                </div>
                <div className="space-y-1.5">
                  <Label>End time</Label>
                  <Input type="time" value={form.endTime} onChange={(e) => setForm({ ...form, endTime: e.target.value })} />
                </div>
              </div>
              <div className="space-y-1.5">
                <Label>Subject</Label>
                <Select
                  value={form.subjectId}
                  onChange={(e) => {
                    const subject = subjects.find((s) => s.id === e.target.value)
                    setForm({ ...form, subjectId: e.target.value, teacherId: subject?.teacherIds[0] ?? form.teacherId })
                  }}
                >
                  {classSubjects.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name}
                    </option>
                  ))}
                </Select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label>Teacher</Label>
                  <Select value={form.teacherId} onChange={(e) => setForm({ ...form, teacherId: e.target.value })}>
                    {staff.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.name}
                      </option>
                    ))}
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label>Room</Label>
                  <Input value={form.room} onChange={(e) => setForm({ ...form, room: e.target.value })} placeholder="e.g. R12" />
                </div>
              </div>

              {conflicts.length > 0 && (
                <div className="flex items-start gap-2 rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-800">
                  <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
                  <div>
                    <p className="font-medium">Scheduling clash detected</p>
                    <ul className={cn('mt-1 list-inside list-disc text-xs')}>
                      {conflictMessages.map((msg, i) => (
                        <li key={i}>{msg}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              )}
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={save} disabled={conflicts.length > 0}>
              {form?.id ? 'Save changes' : 'Add slot'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
