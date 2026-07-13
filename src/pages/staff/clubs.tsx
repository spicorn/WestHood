import { useMemo, useState } from 'react'
import { Users } from 'lucide-react'
import { PageHeader, EmptyState } from '@/components/shared/empty-state'
import { Card, CardContent, CardHeader, CardTitle, Badge } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { useAppStore } from '@/stores/app-store'
import { useCurrentStaff } from '@/hooks/use-current-staff'
import { studentFullName } from '@/data/mock-data'
import type { Club, ClubCategory } from '@/data/types'
import { formatDate } from '@/lib/utils'

const CATEGORY_LABEL: Record<ClubCategory, string> = {
  sport: 'Sport',
  academic: 'Academic',
  creative: 'Creative',
}

export default function StaffClubs() {
  const { teacher } = useCurrentStaff()
  const clubs = useAppStore((s) => s.clubs)
  const clubMemberships = useAppStore((s) => s.clubMemberships)
  const students = useAppStore((s) => s.students)
  const [rosterClub, setRosterClub] = useState<Club | null>(null)

  const supervised = useMemo(
    () => (teacher ? clubs.filter((c) => c.supervisorId === teacher.id) : []),
    [clubs, teacher],
  )

  const roster = useMemo(() => {
    if (!rosterClub) return []
    return clubMemberships
      .filter((m) => m.clubId === rosterClub.id)
      .map((m) => ({
        membership: m,
        student: students.find((s) => s.id === m.studentId),
      }))
  }, [rosterClub, clubMemberships, students])

  if (!teacher) {
    return <PageHeader title="Clubs" description="Loading your staff profile…" />
  }

  return (
    <div>
      <PageHeader title="Clubs" description="Clubs you supervise and their member rosters." />

      {supervised.length === 0 ? (
        <EmptyState
          icon={Users}
          title="No clubs assigned"
          description="You are not listed as supervisor for any club yet."
        />
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {supervised.map((c) => {
            const count = clubMemberships.filter((m) => m.clubId === c.id).length
            return (
              <Card key={c.id}>
                <CardHeader>
                  <CardTitle className="text-lg">{c.name}</CardTitle>
                  <Badge variant="outline" className="w-fit">
                    {CATEGORY_LABEL[c.category]}
                  </Badge>
                </CardHeader>
                <CardContent className="space-y-3 text-sm">
                  <p className="text-muted-foreground">{c.description}</p>
                  <p>
                    Meets {c.meetingDay} · {c.meetingTime}
                  </p>
                  <p className="flex items-center gap-1.5">
                    <Users className="h-3.5 w-3.5" /> {count} members
                  </p>
                  <Button size="sm" variant="outline" onClick={() => setRosterClub(c)}>
                    View roster
                  </Button>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}

      <Dialog open={!!rosterClub} onOpenChange={(v) => !v && setRosterClub(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{rosterClub?.name} roster</DialogTitle>
            <DialogDescription>Students signed up for your club.</DialogDescription>
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
    </div>
  )
}
