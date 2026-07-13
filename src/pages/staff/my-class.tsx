import { useMemo, useState, type FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import {
  AlertTriangle,
  ClipboardCheck,
  GraduationCap,
  Mail,
  Phone,
  ShieldCheck,
  UserRound,
  Users,
} from 'lucide-react'
import { DEMO_TODAY, parents, studentFullName } from '@/data/mock-data'
import { useAppStore } from '@/stores/app-store'
import { useCurrentStaff } from '@/hooks/use-current-staff'
import { PageHeader, EmptyState, StatCard } from '@/components/shared/empty-state'
import { Card, CardContent, CardHeader, CardTitle, Badge } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Avatar, Select } from '@/components/ui/tabs'
import { Input, Label } from '@/components/ui/input'
import { cn, format } from '@/lib/utils'

export default function MyClassPage() {
  const navigate = useNavigate()
  const { teacher } = useCurrentStaff()
  const classes = useAppStore((s) => s.classes)
  const students = useAppStore((s) => s.students)
  const pickupPeople = useAppStore((s) => s.pickupPeople)
  const activities = useAppStore((s) => s.activities)
  const addActivity = useAppStore((s) => s.addActivity)

  const homeroom = teacher?.classTeacherOf ? classes.find((c) => c.id === teacher.classTeacherOf) : undefined
  const roster = useMemo(
    () => (homeroom ? students.filter((s) => s.classId === homeroom.id && s.status === 'active') : []),
    [students, homeroom],
  )

  const [pickupStudentId, setPickupStudentId] = useState(roster[0]?.id ?? '')
  const [pickupPersonId, setPickupPersonId] = useState('')
  const [customName, setCustomName] = useState('')
  const [contactOpenId, setContactOpenId] = useState<string | null>(null)

  if (!teacher) return <PageHeader title="My Class" description="Loading your staff profile…" />

  if (!homeroom) {
    return (
      <div>
        <PageHeader title="My Class" description="Homeroom overview for your class." />
        <EmptyState
          icon={Users}
          title="You aren't assigned as a class teacher"
          description="This page is only available to homeroom / class teachers. Contact the school office if you believe this is incorrect."
        />
      </div>
    )
  }

  const activeStudentId = pickupStudentId || roster[0]?.id || ''
  const authorizedForStudent = pickupPeople.filter((p) => p.studentId === activeStudentId)
  const recentPickups = activities
    .filter((a) => a.type === 'pickup' && roster.some((s) => s.id === a.studentId))
    .sort((a, b) => (b.date + b.time).localeCompare(a.date + a.time))
    .slice(0, 6)

  function handleLogPickup(e: FormEvent) {
    e.preventDefault()
    const student = roster.find((s) => s.id === activeStudentId)
    if (!student) return

    let name: string
    let relationship: string | undefined
    let authorized: boolean

    if (pickupPersonId === 'other' || !pickupPersonId) {
      if (!customName.trim()) {
        toast.error('Enter the name of the person collecting the student.')
        return
      }
      name = customName.trim()
      const match = pickupPeople.find(
        (p) => p.studentId === student.id && p.name.toLowerCase() === name.toLowerCase(),
      )
      authorized = !!match
      relationship = match?.relationship
    } else {
      const person = pickupPeople.find((p) => p.id === pickupPersonId)
      if (!person) {
        toast.error('Select a pickup person from the list.')
        return
      }
      name = person.name
      relationship = person.relationship
      authorized = true
    }

    addActivity({
      id: `act-pickup-${Date.now()}`,
      studentId: student.id,
      type: 'pickup',
      title: 'Afternoon pickup',
      description: authorized
        ? `Collected by ${name}${relationship ? ` (${relationship})` : ''}`
        : `Collected by ${name} — not on the authorized pickup list`,
      status: authorized ? 'Authorized' : 'Unauthorized',
      date: DEMO_TODAY,
      time: format(new Date(), 'HH:mm'),
      flagged: !authorized,
      meta: relationship ? { person: name, relationship } : { person: name },
    })

    if (authorized) {
      toast.success(`Pickup logged for ${studentFullName(student)}`, { description: `Collected by ${name}.` })
    } else {
      toast.warning(`Unauthorized pickup flagged for ${studentFullName(student)}`, {
        description: `${name} is not on the authorized list. Admin and parents will be notified.`,
      })
    }
    setCustomName('')
    setPickupPersonId('')
  }

  return (
    <div>
      <PageHeader
        title="My Class"
        description={`Homeroom overview for ${homeroom.name}`}
        actions={
          <Button className="gap-2" onClick={() => navigate(`/staff/attendance?classId=${homeroom.id}`)}>
            <ClipboardCheck className="h-4 w-4" /> Take Attendance
          </Button>
        }
      />

      <div className="grid gap-4 sm:grid-cols-3 mb-6">
        <StatCard label="Students" value={roster.length} icon={GraduationCap} accent="bg-forest-100 text-forest-700" />
        <StatCard
          label="Avg. Attendance"
          value={`${Math.round(roster.reduce((sum, s) => sum + s.attendancePct, 0) / Math.max(1, roster.length))}%`}
          icon={ClipboardCheck}
          accent="bg-navy-50 text-navy-700"
        />
        <StatCard
          label="Flagged Pickups"
          value={recentPickups.filter((a) => a.flagged).length}
          icon={AlertTriangle}
          accent="bg-red-100 text-red-700"
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5 text-navy-600" /> Class Roster
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {roster.map((s) => {
                const studentParents = parents.filter((p) => s.parentIds.includes(p.id))
                const isOpen = contactOpenId === s.id
                return (
                  <div key={s.id} className="rounded-lg border p-3">
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex items-center gap-3 min-w-0">
                        <Avatar name={studentFullName(s)} size="sm" />
                        <div className="min-w-0">
                          <p className="text-sm font-medium truncate">{studentFullName(s)}</p>
                          <p className="text-xs text-muted-foreground">{s.admissionNo}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <Badge variant={s.attendancePct >= 90 ? 'success' : s.attendancePct >= 75 ? 'warning' : 'danger'}>
                          {s.attendancePct}% present
                        </Badge>
                        <Button size="sm" variant="outline" onClick={() => setContactOpenId(isOpen ? null : s.id)}>
                          <Phone className="h-3.5 w-3.5 mr-1.5" /> Contact
                        </Button>
                      </div>
                    </div>
                    {isOpen && (
                      <div className="mt-3 space-y-2 border-t pt-3">
                        {studentParents.length === 0 ? (
                          <p className="text-xs text-muted-foreground">No parent/guardian on file.</p>
                        ) : (
                          studentParents.map((p) => (
                            <div key={p.id} className="flex flex-wrap items-center justify-between gap-2 rounded-md bg-muted/40 p-2 text-sm">
                              <div>
                                <p className="font-medium">{p.name} <span className="text-xs text-muted-foreground">({p.relationship})</span></p>
                                <p className="text-xs text-muted-foreground">{p.phone} · {p.email}</p>
                              </div>
                              <div className="flex gap-1.5">
                                <Button size="sm" variant="outline" asChild>
                                  <a href={`tel:${p.phone}`}>
                                    <Phone className="h-3.5 w-3.5" />
                                  </a>
                                </Button>
                                <Button size="sm" variant="outline" asChild>
                                  <a href={`mailto:${p.email}`}>
                                    <Mail className="h-3.5 w-3.5" />
                                  </a>
                                </Button>
                                <Button
                                  size="sm"
                                  onClick={() => toast.success(`Quick message sent to ${p.name}`, { description: 'They will be notified via the parent app.' })}
                                >
                                  Quick Message
                                </Button>
                              </div>
                            </div>
                          ))
                        )}
                      </div>
                    )}
                  </div>
                )
              })}
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ShieldCheck className="h-5 w-5 text-forest-600" /> Log Pickup
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleLogPickup} className="space-y-3">
                <div className="space-y-1.5">
                  <Label htmlFor="pickup-student">Student</Label>
                  <Select
                    id="pickup-student"
                    value={activeStudentId}
                    onChange={(e) => {
                      setPickupStudentId(e.target.value)
                      setPickupPersonId('')
                    }}
                  >
                    {roster.map((s) => (
                      <option key={s.id} value={s.id}>
                        {studentFullName(s)}
                      </option>
                    ))}
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="pickup-person">Collected by</Label>
                  <Select id="pickup-person" value={pickupPersonId} onChange={(e) => setPickupPersonId(e.target.value)}>
                    <option value="">Select authorized pickup person…</option>
                    {authorizedForStudent.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name} — {p.relationship}
                      </option>
                    ))}
                    <option value="other">Other / not on list…</option>
                  </Select>
                </div>
                {(pickupPersonId === 'other' || pickupPersonId === '') && (
                  <div className="space-y-1.5">
                    <Label htmlFor="pickup-name">Name of person collecting</Label>
                    <Input
                      id="pickup-name"
                      value={customName}
                      onChange={(e) => setCustomName(e.target.value)}
                      placeholder="Type full name…"
                    />
                    <p className="text-xs text-muted-foreground">
                      If this name doesn't match the authorized list, the pickup will be flagged automatically.
                    </p>
                  </div>
                )}
                <Button type="submit" className="w-full">Log Pickup</Button>
              </form>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <UserRound className="h-4 w-4 text-navy-600" /> Recent Pickups
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {recentPickups.length === 0 ? (
                <p className="text-sm text-muted-foreground">No pickups logged yet.</p>
              ) : (
                recentPickups.map((a) => {
                  const student = students.find((s) => s.id === a.studentId)
                  return (
                    <div key={a.id} className={cn('rounded-md border p-2.5 text-sm', a.flagged && 'border-red-300 bg-red-50')}>
                      <div className="flex items-center justify-between gap-2">
                        <p className="font-medium">{student ? studentFullName(student) : 'Student'}</p>
                        {a.flagged ? <Badge variant="danger">Flagged</Badge> : <Badge variant="success">OK</Badge>}
                      </div>
                      <p className="text-xs text-muted-foreground mt-0.5">{a.description}</p>
                      <p className="text-[11px] text-muted-foreground mt-1">{a.date} · {a.time}</p>
                    </div>
                  )
                })
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
