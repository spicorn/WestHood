import { useMemo, useState } from 'react'
import { toast } from 'sonner'
import { CalendarPlus, Pencil, Plus, Users } from 'lucide-react'
import { PageHeader } from '@/components/shared/empty-state'
import { Card, CardContent, CardHeader, CardTitle, Badge } from '@/components/ui/card'
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
import { useAppStore } from '@/stores/app-store'
import { DEMO_TODAY, studentFullName } from '@/data/mock-data'
import type { Club, ClubCategory, NoticeCategory } from '@/data/types'
import { formatDate } from '@/lib/utils'

const CATEGORY_LABEL: Record<ClubCategory, string> = {
  sport: 'Sport',
  academic: 'Academic',
  creative: 'Creative',
}

const emptyClub = {
  name: '',
  category: 'academic' as ClubCategory,
  supervisorId: '',
  meetingDay: '',
  meetingTime: '',
  description: '',
}

export default function AdminClubs() {
  const clubs = useAppStore((s) => s.clubs)
  const clubMemberships = useAppStore((s) => s.clubMemberships)
  const students = useAppStore((s) => s.students)
  const staff = useAppStore((s) => s.staff)
  const upsertClub = useAppStore((s) => s.upsertClub)
  const upsertNotice = useAppStore((s) => s.upsertNotice)

  const [formOpen, setFormOpen] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [form, setForm] = useState(emptyClub)
  const [rosterClub, setRosterClub] = useState<Club | null>(null)

  const [fixtureOpen, setFixtureOpen] = useState(false)
  const [fixtureClubId, setFixtureClubId] = useState('')
  const [fixtureTitle, setFixtureTitle] = useState('')
  const [fixtureBody, setFixtureBody] = useState('')
  const [fixtureDate, setFixtureDate] = useState(DEMO_TODAY)
  const [fixtureCategory, setFixtureCategory] = useState<NoticeCategory>('Sports')

  const roster = useMemo(() => {
    if (!rosterClub) return []
    return clubMemberships
      .filter((m) => m.clubId === rosterClub.id)
      .map((m) => ({
        membership: m,
        student: students.find((s) => s.id === m.studentId),
      }))
  }, [rosterClub, clubMemberships, students])

  const openCreate = () => {
    setEditingId(null)
    setForm({ ...emptyClub, supervisorId: staff[0]?.id ?? '' })
    setFormOpen(true)
  }

  const openEdit = (c: Club) => {
    setEditingId(c.id)
    setForm({
      name: c.name,
      category: c.category,
      supervisorId: c.supervisorId,
      meetingDay: c.meetingDay,
      meetingTime: c.meetingTime,
      description: c.description,
    })
    setFormOpen(true)
  }

  const saveClub = () => {
    if (!form.name.trim() || !form.supervisorId) {
      toast.error('Club name and supervisor are required.')
      return
    }
    upsertClub({
      id: editingId ?? `club-${Date.now()}`,
      name: form.name.trim(),
      category: form.category,
      supervisorId: form.supervisorId,
      meetingDay: form.meetingDay.trim() || 'TBA',
      meetingTime: form.meetingTime.trim() || 'TBA',
      description: form.description.trim(),
    })
    toast.success(editingId ? 'Club updated.' : 'Club created.')
    setFormOpen(false)
  }

  const openFixture = (club?: Club) => {
    const c = club ?? clubs[0]
    setFixtureClubId(c?.id ?? '')
    setFixtureTitle(c ? `${c.name} fixture` : '')
    setFixtureBody('')
    setFixtureDate(DEMO_TODAY)
    setFixtureCategory(c?.category === 'sport' ? 'Sports' : 'General')
    setFixtureOpen(true)
  }

  const saveFixture = () => {
    if (!fixtureTitle.trim() || !fixtureDate) {
      toast.error('Title and date are required.')
      return
    }
    const club = clubs.find((c) => c.id === fixtureClubId)
    upsertNotice({
      id: `n-club-${Date.now()}`,
      title: fixtureTitle.trim(),
      body: fixtureBody.trim() || (club ? `${club.name} activity.` : 'Club fixture.'),
      category: fixtureCategory,
      audience: 'All',
      date: fixtureDate,
      pinned: false,
      createdBy: 'u-admin',
    })
    toast.success('Fixture added to the notices calendar.')
    setFixtureOpen(false)
  }

  return (
    <div>
      <PageHeader
        title="Clubs"
        description="Manage co-curricular clubs, rosters, and calendar fixtures."
        actions={
          <>
            <Button variant="outline" onClick={() => openFixture()}>
              <CalendarPlus className="h-4 w-4" /> New fixture
            </Button>
            <Button onClick={openCreate}>
              <Plus className="h-4 w-4" /> New club
            </Button>
          </>
        }
      />

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {clubs.map((c) => {
          const supervisor = staff.find((s) => s.id === c.supervisorId)
          const count = clubMemberships.filter((m) => m.clubId === c.id).length
          return (
            <Card key={c.id}>
              <CardHeader className="flex flex-row items-start justify-between gap-2">
                <div>
                  <CardTitle className="text-lg">{c.name}</CardTitle>
                  <Badge variant="outline" className="mt-1">
                    {CATEGORY_LABEL[c.category]}
                  </Badge>
                </div>
                <Button size="sm" variant="ghost" onClick={() => openEdit(c)}>
                  <Pencil className="h-3.5 w-3.5" />
                </Button>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                <p className="text-muted-foreground">{c.description}</p>
                <p>
                  <span className="text-muted-foreground">Meets:</span> {c.meetingDay} · {c.meetingTime}
                </p>
                <p>
                  <span className="text-muted-foreground">Supervisor:</span> {supervisor?.name ?? '—'}
                </p>
                <p className="flex items-center gap-1.5">
                  <Users className="h-3.5 w-3.5 text-muted-foreground" /> {count} members
                </p>
                <div className="flex flex-wrap gap-2 pt-1">
                  <Button size="sm" variant="outline" onClick={() => setRosterClub(c)}>
                    View roster
                  </Button>
                  <Button size="sm" variant="secondary" onClick={() => openFixture(c)}>
                    <CalendarPlus className="h-3.5 w-3.5" /> Fixture
                  </Button>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      <Dialog open={formOpen} onOpenChange={setFormOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingId ? 'Edit club' : 'New club'}</DialogTitle>
            <DialogDescription>Set meeting details and assign a staff supervisor.</DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <div className="space-y-1.5">
              <Label>Name</Label>
              <Input value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>Category</Label>
                <Select
                  value={form.category}
                  onChange={(e) => setForm((f) => ({ ...f, category: e.target.value as ClubCategory }))}
                >
                  <option value="sport">Sport</option>
                  <option value="academic">Academic</option>
                  <option value="creative">Creative</option>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label>Supervisor</Label>
                <Select
                  value={form.supervisorId}
                  onChange={(e) => setForm((f) => ({ ...f, supervisorId: e.target.value }))}
                >
                  {staff
                    .filter((s) => s.status === 'active')
                    .map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.name}
                      </option>
                    ))}
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>Meeting day</Label>
                <Input
                  value={form.meetingDay}
                  onChange={(e) => setForm((f) => ({ ...f, meetingDay: e.target.value }))}
                  placeholder="Wednesday"
                />
              </div>
              <div className="space-y-1.5">
                <Label>Meeting time</Label>
                <Input
                  value={form.meetingTime}
                  onChange={(e) => setForm((f) => ({ ...f, meetingTime: e.target.value }))}
                  placeholder="15:30"
                />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label>Description</Label>
              <Textarea
                rows={3}
                value={form.description}
                onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setFormOpen(false)}>
              Cancel
            </Button>
            <Button onClick={saveClub}>{editingId ? 'Save' : 'Create'}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={!!rosterClub} onOpenChange={(v) => !v && setRosterClub(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{rosterClub?.name} roster</DialogTitle>
            <DialogDescription>Students currently signed up for this club.</DialogDescription>
          </DialogHeader>
          {roster.length === 0 ? (
            <p className="text-sm text-muted-foreground">No members yet.</p>
          ) : (
            <ul className="space-y-2">
              {roster.map(({ membership, student }) => (
                <li key={membership.id} className="flex items-center justify-between rounded-md border px-3 py-2 text-sm">
                  <span className="font-medium">{student ? studentFullName(student) : membership.studentId}</span>
                  <span className="text-xs text-muted-foreground">Joined {formatDate(membership.joinedAt)}</span>
                </li>
              ))}
            </ul>
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={fixtureOpen} onOpenChange={setFixtureOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create club fixture</DialogTitle>
            <DialogDescription>Publishes a Sports or General notice on the school calendar.</DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <div className="space-y-1.5">
              <Label>Club</Label>
              <Select
                value={fixtureClubId}
                onChange={(e) => {
                  setFixtureClubId(e.target.value)
                  const c = clubs.find((x) => x.id === e.target.value)
                  if (c) {
                    setFixtureTitle(`${c.name} fixture`)
                    setFixtureCategory(c.category === 'sport' ? 'Sports' : 'General')
                  }
                }}
              >
                {clubs.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Title</Label>
              <Input value={fixtureTitle} onChange={(e) => setFixtureTitle(e.target.value)} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>Date</Label>
                <Input type="date" value={fixtureDate} onChange={(e) => setFixtureDate(e.target.value)} />
              </div>
              <div className="space-y-1.5">
                <Label>Category</Label>
                <Select
                  value={fixtureCategory}
                  onChange={(e) => setFixtureCategory(e.target.value as NoticeCategory)}
                >
                  <option value="Sports">Sports</option>
                  <option value="General">General</option>
                </Select>
              </div>
            </div>
            <div className="space-y-1.5">
              <Label>Details</Label>
              <Textarea rows={3} value={fixtureBody} onChange={(e) => setFixtureBody(e.target.value)} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setFixtureOpen(false)}>
              Cancel
            </Button>
            <Button onClick={saveFixture}>Publish fixture</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
