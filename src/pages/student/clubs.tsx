import { useMemo } from 'react'
import { toast } from 'sonner'
import { CalendarDays, LogOut, UserPlus, Users } from 'lucide-react'
import { PageHeader, EmptyState } from '@/components/shared/empty-state'
import { Card, CardContent, CardHeader, CardTitle, Badge } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { useAppStore } from '@/stores/app-store'
import { useCurrentStudent } from '@/hooks/use-current-student'
import { DEMO_TODAY } from '@/data/mock-data'
import type { ClubCategory } from '@/data/types'
import { formatDate } from '@/lib/utils'

const CATEGORY_LABEL: Record<ClubCategory, string> = {
  sport: 'Sport',
  academic: 'Academic',
  creative: 'Creative',
}

export default function StudentClubs() {
  const student = useCurrentStudent()
  const clubs = useAppStore((s) => s.clubs)
  const clubMemberships = useAppStore((s) => s.clubMemberships)
  const notices = useAppStore((s) => s.notices)
  const staff = useAppStore((s) => s.staff)
  const joinClub = useAppStore((s) => s.joinClub)
  const leaveClub = useAppStore((s) => s.leaveClub)

  const myMemberships = useMemo(
    () => clubMemberships.filter((m) => m.studentId === student.id),
    [clubMemberships, student.id],
  )

  const myClubs = useMemo(
    () => myMemberships.map((m) => clubs.find((c) => c.id === m.clubId)).filter(Boolean),
    [myMemberships, clubs],
  )

  const upcomingFixtures = useMemo(() => {
    const names = myClubs.map((c) => c!.name.toLowerCase())
    return notices
      .filter((n) => n.date >= DEMO_TODAY)
      .filter(
        (n) =>
          n.category === 'Sports' ||
          names.some((name) => n.title.toLowerCase().includes(name.split(' ')[0] ?? '')),
      )
      .sort((a, b) => a.date.localeCompare(b.date))
      .slice(0, 6)
  }, [notices, myClubs])

  const onJoin = (clubId: string) => {
    joinClub(clubId, student.id)
    toast.success('Signed up for club.')
  }

  const onLeave = (clubId: string) => {
    leaveClub(clubId, student.id)
    toast.success('Left club.')
  }

  return (
    <div>
      <PageHeader title="Clubs" description="Browse co-curricular clubs and manage your sign-ups." />

      <div className="mb-6 grid gap-4 lg:grid-cols-[1fr_1fr]">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-4 w-4" /> My Clubs
            </CardTitle>
          </CardHeader>
          <CardContent>
            {myClubs.length === 0 ? (
              <EmptyState title="No clubs yet" description="Sign up below to join a society or team." />
            ) : (
              <ul className="space-y-2">
                {myClubs.map((c) =>
                  c ? (
                    <li key={c.id} className="flex items-center justify-between rounded-md border px-3 py-2 text-sm">
                      <div>
                        <p className="font-medium">{c.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {c.meetingDay} · {c.meetingTime}
                        </p>
                      </div>
                      <Button size="sm" variant="outline" onClick={() => onLeave(c.id)}>
                        <LogOut className="h-3.5 w-3.5" /> Leave
                      </Button>
                    </li>
                  ) : null,
                )}
              </ul>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CalendarDays className="h-4 w-4" /> Upcoming fixtures
            </CardTitle>
          </CardHeader>
          <CardContent>
            {upcomingFixtures.length === 0 ? (
              <p className="text-sm text-muted-foreground">No upcoming club-related notices.</p>
            ) : (
              <ul className="space-y-2">
                {upcomingFixtures.map((n) => (
                  <li key={n.id} className="rounded-md border p-3 text-sm">
                    <div className="mb-1 flex items-center gap-2">
                      <Badge variant="outline">{n.category}</Badge>
                      <span className="text-xs text-muted-foreground">{formatDate(n.date)}</span>
                    </div>
                    <p className="font-medium">{n.title}</p>
                    <p className="mt-0.5 text-xs text-muted-foreground line-clamp-2">{n.body}</p>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Browse clubs</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 md:grid-cols-2">
            {clubs.map((c) => {
              const joined = myMemberships.some((m) => m.clubId === c.id)
              const supervisor = staff.find((s) => s.id === c.supervisorId)
              const count = clubMemberships.filter((m) => m.clubId === c.id).length
              return (
                <div key={c.id} className="rounded-md border p-4">
                  <div className="mb-2 flex items-start justify-between gap-2">
                    <div>
                      <p className="font-display text-lg font-semibold text-navy-800">{c.name}</p>
                      <Badge variant="outline" className="mt-1">
                        {CATEGORY_LABEL[c.category]}
                      </Badge>
                    </div>
                    {joined ? (
                      <Button size="sm" variant="outline" onClick={() => onLeave(c.id)}>
                        Leave
                      </Button>
                    ) : (
                      <Button size="sm" onClick={() => onJoin(c.id)}>
                        <UserPlus className="h-3.5 w-3.5" /> Sign up
                      </Button>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground">{c.description}</p>
                  <p className="mt-2 text-xs text-muted-foreground">
                    {c.meetingDay} · {c.meetingTime} · {supervisor?.name ?? 'Supervisor TBA'} · {count} members
                  </p>
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
