import { useMemo, useState } from 'react'
import { toast } from 'sonner'
import { AlertTriangle, CalendarRange, Pencil } from 'lucide-react'
import type { TimetableSlot } from '@/data/types'
import { useAppStore } from '@/stores/app-store'
import { useCurrentStaff } from '@/hooks/use-current-staff'
import { PageHeader, EmptyState } from '@/components/shared/empty-state'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input, Label } from '@/components/ui/input'
import { Select, Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog'
import { cn } from '@/lib/utils'

const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday']

export default function StaffTimetablePage() {
  const { teacher } = useCurrentStaff()
  const timetable = useAppStore((s) => s.timetable)
  const subjects = useAppStore((s) => s.subjects)
  const classes = useAppStore((s) => s.classes)
  const staff = useAppStore((s) => s.staff)
  const upsertTimetableSlot = useAppStore((s) => s.upsertTimetableSlot)

  const periods = useMemo(() => {
    const set = new Set<number>()
    timetable.forEach((s) => set.add(s.period))
    return Array.from(set).sort((a, b) => a - b)
  }, [timetable])

  const mySlots = useMemo(() => (teacher ? timetable.filter((s) => s.teacherId === teacher.id) : []), [timetable, teacher])
  const homeroom = teacher?.classTeacherOf ? classes.find((c) => c.id === teacher.classTeacherOf) : undefined
  const homeroomSlots = useMemo(
    () => (homeroom ? timetable.filter((s) => s.classId === homeroom.id) : []),
    [timetable, homeroom],
  )

  const [editSlot, setEditSlot] = useState<TimetableSlot | null>(null)
  const [draftSubjectId, setDraftSubjectId] = useState('')
  const [draftTeacherId, setDraftTeacherId] = useState('')
  const [draftRoom, setDraftRoom] = useState('')
  const [clashError, setClashError] = useState<string | null>(null)

  if (!teacher) return <PageHeader title="Timetable" description="Loading your staff profile…" />

  function openEdit(slot: TimetableSlot) {
    setEditSlot(slot)
    setDraftSubjectId(slot.subjectId)
    setDraftTeacherId(slot.teacherId)
    setDraftRoom(slot.room)
    setClashError(null)
  }

  function handleSaveSlot() {
    if (!editSlot) return
    const clash = timetable.find(
      (s) =>
        s.id !== editSlot.id &&
        s.day === editSlot.day &&
        s.period === editSlot.period &&
        (s.teacherId === draftTeacherId || s.room === draftRoom),
    )
    if (clash) {
      const reason = clash.teacherId === draftTeacherId ? 'That teacher already has a class this period.' : 'That room is already booked this period.'
      setClashError(reason)
      return
    }
    upsertTimetableSlot({ ...editSlot, subjectId: draftSubjectId, teacherId: draftTeacherId, room: draftRoom })
    toast.success(`Updated Period ${editSlot.period} on ${days[editSlot.day]}`)
    setEditSlot(null)
  }

  function renderGrid(slots: TimetableSlot[], editable: boolean) {
    return (
      <div className="overflow-x-auto">
        <table className="w-full min-w-[720px] border-collapse text-sm">
          <thead>
            <tr>
              <th className="w-24 border-b p-2 text-left text-xs font-semibold text-muted-foreground">Period</th>
              {days.map((d) => (
                <th key={d} className="border-b p-2 text-left text-xs font-semibold text-muted-foreground">{d}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {periods.map((period) => {
              const sample = slots.find((s) => s.period === period)
              return (
                <tr key={period} className="border-b last:border-0">
                  <td className="p-2 align-top text-xs font-medium text-muted-foreground">
                    P{period}
                    {sample && <div className="text-[10px]">{sample.startTime}–{sample.endTime}</div>}
                  </td>
                  {days.map((_, dayIdx) => {
                    const slot = slots.find((s) => s.day === dayIdx && s.period === period)
                    if (!slot) {
                      return (
                        <td key={dayIdx} className="p-2 align-top">
                          <div className="rounded-md border border-dashed p-2 text-center text-xs text-muted-foreground">Free</div>
                        </td>
                      )
                    }
                    const subject = subjects.find((sub) => sub.id === slot.subjectId)
                    const cls = classes.find((c) => c.id === slot.classId)
                    const slotTeacher = staff.find((t) => t.id === slot.teacherId)
                    return (
                      <td key={dayIdx} className="p-2 align-top">
                        <div
                          className={cn('group relative rounded-md border p-2.5 text-xs')}
                          style={{ borderLeftColor: cls?.color, borderLeftWidth: 3 }}
                        >
                          <p className="font-medium text-navy-900">{subject?.name}</p>
                          <p className="text-muted-foreground">{cls?.name} · {slot.room}</p>
                          {editable && <p className="text-muted-foreground">{slotTeacher?.name}</p>}
                          {editable && (
                            <button
                              type="button"
                              onClick={() => openEdit(slot)}
                              className="absolute right-1.5 top-1.5 rounded-md bg-card p-1 opacity-0 shadow-soft transition-opacity group-hover:opacity-100"
                              title="Edit slot"
                            >
                              <Pencil className="h-3 w-3 text-navy-600" />
                            </button>
                          )}
                        </div>
                      </td>
                    )
                  })}
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    )
  }

  return (
    <div>
      <PageHeader title="My Timetable" description="Your personal weekly teaching schedule." />

      <Tabs defaultValue="mine">
        <TabsList>
          <TabsTrigger value="mine">My Schedule</TabsTrigger>
          {homeroom && <TabsTrigger value="class">Edit {homeroom.name} Timetable</TabsTrigger>}
        </TabsList>

        <TabsContent value="mine">
          <Card>
            <CardContent className="pt-5">
              {mySlots.length === 0 ? (
                <EmptyState icon={CalendarRange} title="No periods scheduled" description="You have no timetable slots assigned yet." />
              ) : (
                renderGrid(mySlots, false)
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {homeroom && (
          <TabsContent value="class">
            <Card>
              <CardContent className="pt-5">
                <p className="mb-3 text-sm text-muted-foreground">
                  As class teacher of {homeroom.name}, you can edit the subject, teacher, or room for each period. Changes are checked for clashes before saving.
                </p>
                {renderGrid(homeroomSlots, true)}
              </CardContent>
            </Card>
          </TabsContent>
        )}
      </Tabs>

      <Dialog open={!!editSlot} onOpenChange={(open) => !open && setEditSlot(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Timetable Slot</DialogTitle>
            <DialogDescription>
              {editSlot && `${days[editSlot.day]} · Period ${editSlot.period} · ${editSlot.startTime}–${editSlot.endTime}`}
            </DialogDescription>
          </DialogHeader>
          {editSlot && (
            <div className="space-y-3">
              <div className="space-y-1.5">
                <Label>Subject</Label>
                <Select value={draftSubjectId} onChange={(e) => setDraftSubjectId(e.target.value)}>
                  {subjects.map((s) => (
                    <option key={s.id} value={s.id}>{s.name}</option>
                  ))}
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label>Teacher</Label>
                <Select value={draftTeacherId} onChange={(e) => setDraftTeacherId(e.target.value)}>
                  {staff.map((t) => (
                    <option key={t.id} value={t.id}>{t.name}</option>
                  ))}
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label>Room</Label>
                <Input value={draftRoom} onChange={(e) => setDraftRoom(e.target.value)} />
              </div>
              {clashError && (
                <div className="flex items-start gap-2 rounded-md border border-red-200 bg-red-50 p-2.5 text-sm text-red-800">
                  <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5" /> {clashError}
                </div>
              )}
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditSlot(null)}>Cancel</Button>
            <Button onClick={handleSaveSlot}>Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
