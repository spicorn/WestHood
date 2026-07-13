import { useAppStore } from '@/stores/app-store'
import { useCurrentParent, useParentChildren } from '@/hooks/use-parent'
import { studentFullName } from '@/data/mock-data'
import { PageHeader } from '@/components/shared/empty-state'
import { Card, CardContent, CardHeader, CardTitle, Badge } from '@/components/ui/card'
import { Avatar } from '@/components/ui/tabs'

export default function ParentProfilePage() {
  const parent = useCurrentParent()
  const children = useParentChildren()
  const classes = useAppStore((s) => s.classes)

  return (
    <div>
      <PageHeader title="My Profile" description="Your contact details and linked children." />

      <div className="grid gap-4 lg:grid-cols-[1fr_1.4fr]">
        <Card>
          <CardContent className="pt-6 text-center">
            <Avatar name={parent.name} size="lg" className="mx-auto h-24 w-24 text-2xl" />
            <p className="mt-4 font-display text-xl font-semibold text-navy-900">{parent.name}</p>
            <p className="text-sm text-muted-foreground">{parent.relationship}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Contact Details</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 gap-4 text-sm sm:grid-cols-2">
            <div>
              <p className="text-xs text-muted-foreground">Email</p>
              <p className="font-medium">{parent.email}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Phone</p>
              <p className="font-medium">{parent.phone}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Relationship</p>
              <p className="font-medium">{parent.relationship}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Children linked</p>
              <p className="font-medium">{children.length}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="mt-4">
        <CardHeader>
          <CardTitle>My Children</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {children.map((child) => {
            const classRoom = classes.find((c) => c.id === child.classId)
            return (
              <div key={child.id} className="flex items-center gap-3 rounded-md border p-3">
                <Avatar name={studentFullName(child)} size="md" />
                <div className="flex-1">
                  <p className="text-sm font-medium">{studentFullName(child)}</p>
                  <p className="text-xs text-muted-foreground">
                    {classRoom?.name ?? child.classId} · {child.admissionNo}
                  </p>
                </div>
                <Badge variant="outline">{child.attendancePct}% attendance</Badge>
              </div>
            )
          })}
        </CardContent>
      </Card>
    </div>
  )
}
