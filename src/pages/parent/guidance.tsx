import { useMemo } from 'react'
import { CalendarClock, Compass, Users } from 'lucide-react'
import { useAppStore } from '@/stores/app-store'
import { useSelectedChild } from '@/hooks/use-parent'
import { ChildSwitcher } from '@/components/parent/child-switcher'
import { PageHeader, EmptyState } from '@/components/shared/empty-state'
import { Card, CardContent, CardHeader, CardTitle, Badge } from '@/components/ui/card'
import { DEMO_TODAY } from '@/data/mock-data'
import { formatDate } from '@/lib/utils'

export default function ParentGuidance() {
  const child = useSelectedChild()
  const guidanceNotes = useAppStore((s) => s.guidanceNotes)
  const detentionRecords = useAppStore((s) => s.detentionRecords)
  const clubs = useAppStore((s) => s.clubs)
  const clubMemberships = useAppStore((s) => s.clubMemberships)
  const notices = useAppStore((s) => s.notices)

  const notes = useMemo(
    () =>
      guidanceNotes
        .filter((n) => child && n.studentId === child.id)
        .sort((a, b) => b.createdAt.localeCompare(a.createdAt)),
    [guidanceNotes, child],
  )

  const latestInterest = notes[0]?.careerInterest

  const detentions = useMemo(
    () =>
      detentionRecords
        .filter((d) => child && d.studentId === child.id)
        .filter((d) => d.status === 'scheduled' || d.status === 'completed')
        .sort((a, b) => b.scheduledAt.localeCompare(a.scheduledAt)),
    [detentionRecords, child],
  )

  const joinedClubs = useMemo(() => {
    if (!child) return []
    return clubMemberships
      .filter((m) => m.studentId === child.id)
      .map((m) => clubs.find((c) => c.id === m.clubId))
      .filter(Boolean)
  }, [clubMemberships, clubs, child])

  const upcomingFixtures = useMemo(() => {
    const names = joinedClubs.map((c) => c!.name.toLowerCase())
    return notices
      .filter((n) => n.date >= DEMO_TODAY)
      .filter(
        (n) =>
          n.category === 'Sports' ||
          names.some((name) => n.title.toLowerCase().includes(name.split(' ')[0] ?? '')),
      )
      .sort((a, b) => a.date.localeCompare(b.date))
      .slice(0, 5)
  }, [notices, joinedClubs])

  if (!child) {
    return (
      <EmptyState title="No children linked" description="No students are linked to your account yet." />
    )
  }

  return (
    <div>
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <PageHeader
          title="Care & Guidance"
          description={`Career guidance, detentions, and clubs for ${child.firstName}.`}
        />
        <ChildSwitcher />
      </div>

      <div className="mb-4 rounded-md border border-gold-300/50 bg-gold-50/50 px-4 py-3">
        <p className="text-xs font-semibold uppercase tracking-wide text-gold-800">Career interest</p>
        <p className="mt-1 font-display text-lg font-semibold text-navy-800">
          {latestInterest ?? 'Not recorded yet'}
        </p>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Compass className="h-4 w-4" /> Guidance notes
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {notes.length === 0 ? (
              <p className="text-sm text-muted-foreground">No guidance notes logged yet.</p>
            ) : (
              notes.map((n) => (
                <div key={n.id} className="rounded-md border p-3 text-sm">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="font-medium">{n.careerInterest}</p>
                    <span className="text-xs text-muted-foreground">
                      {formatDate(n.createdAt.slice(0, 10))} · {n.loggedByName}
                    </span>
                  </div>
                  <div className="mt-1 flex flex-wrap gap-1">
                    {n.tags.map((t) => (
                      <Badge key={t} variant="outline">
                        {t}
                      </Badge>
                    ))}
                  </div>
                  <p className="mt-2 text-muted-foreground">{n.pathwayNotes}</p>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CalendarClock className="h-4 w-4" /> Detentions
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {detentions.length === 0 ? (
              <p className="text-sm text-muted-foreground">No scheduled or completed detentions.</p>
            ) : (
              detentions.map((d) => (
                <div key={d.id} className="flex items-center justify-between rounded-md border px-3 py-2 text-sm">
                  <div>
                    <p className="font-medium">{d.location}</p>
                    <p className="text-xs text-muted-foreground">
                      {d.scheduledAt.slice(0, 16).replace('T', ' ')}
                      {d.notes ? ` · ${d.notes}` : ''}
                    </p>
                  </div>
                  <Badge variant={d.status === 'completed' ? 'success' : 'warning'} className="capitalize">
                    {d.status}
                  </Badge>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-4 w-4" /> Clubs joined
            </CardTitle>
          </CardHeader>
          <CardContent>
            {joinedClubs.length === 0 ? (
              <p className="text-sm text-muted-foreground">Not signed up for any clubs yet.</p>
            ) : (
              <ul className="space-y-2">
                {joinedClubs.map((c) =>
                  c ? (
                    <li key={c.id} className="rounded-md border px-3 py-2 text-sm">
                      <p className="font-medium">{c.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {c.meetingDay} · {c.meetingTime}
                      </p>
                    </li>
                  ) : null,
                )}
              </ul>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Upcoming fixtures</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {upcomingFixtures.length === 0 ? (
              <p className="text-sm text-muted-foreground">No upcoming sports or club fixtures.</p>
            ) : (
              upcomingFixtures.map((n) => (
                <div key={n.id} className="rounded-md border p-3 text-sm">
                  <div className="mb-1 flex items-center gap-2">
                    <Badge variant="outline">{n.category}</Badge>
                    <span className="text-xs text-muted-foreground">{formatDate(n.date)}</span>
                  </div>
                  <p className="font-medium">{n.title}</p>
                  <p className="mt-0.5 text-xs text-muted-foreground line-clamp-2">{n.body}</p>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
