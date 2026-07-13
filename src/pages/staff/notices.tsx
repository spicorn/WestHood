import { useMemo } from 'react'
import { Bell, Pin } from 'lucide-react'
import { useAppStore } from '@/stores/app-store'
import { PageHeader, EmptyState } from '@/components/shared/empty-state'
import { Card, CardContent, Badge } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { NoticeCalendar } from '@/components/shared/notice-calendar'
import { format, parseISO } from '@/lib/utils'

const categoryBadge: Record<string, 'default' | 'secondary' | 'success' | 'warning' | 'danger' | 'outline' | 'gold'> = {
  General: 'outline',
  Sports: 'success',
  Exams: 'gold',
  Holiday: 'secondary',
  Urgent: 'danger',
}

export default function StaffNoticesPage() {
  const notices = useAppStore((s) => s.notices)

  const staffNotices = useMemo(
    () =>
      notices
        .filter((n) => n.audience === 'All' || n.audience === 'Staff')
        .sort((a, b) => {
          if (a.pinned !== b.pinned) return a.pinned ? -1 : 1
          return b.date.localeCompare(a.date)
        }),
    [notices],
  )

  return (
    <div>
      <PageHeader title="Notices" description="School-wide and staff notices." />

      <Tabs defaultValue="list">
        <TabsList>
          <TabsTrigger value="list">List</TabsTrigger>
          <TabsTrigger value="calendar">Calendar</TabsTrigger>
        </TabsList>

        <TabsContent value="list">
          {staffNotices.length === 0 ? (
            <EmptyState icon={Bell} title="No notices" description="There are no notices for staff right now." />
          ) : (
            <div className="space-y-3">
              {staffNotices.map((n) => (
                <Card key={n.id}>
                  <CardContent className="pt-5">
                    <div className="flex flex-wrap items-center gap-2 mb-1.5">
                      <Badge variant={categoryBadge[n.category] ?? 'outline'}>{n.category}</Badge>
                      <Badge variant="outline">{n.audience}</Badge>
                      {n.pinned && (
                        <Badge variant="gold" className="gap-1">
                          <Pin className="h-3 w-3" /> Pinned
                        </Badge>
                      )}
                      <span className="ml-auto text-xs text-muted-foreground">{format(parseISO(n.date), 'd MMM yyyy')}</span>
                    </div>
                    <p className="font-display text-lg font-semibold text-navy-900">{n.title}</p>
                    <p className="mt-1 text-sm text-muted-foreground">{n.body}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="calendar">
          <NoticeCalendar notices={staffNotices} />
        </TabsContent>
      </Tabs>
    </div>
  )
}
