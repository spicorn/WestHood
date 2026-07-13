import { useAppStore } from '@/stores/app-store'
import { useCurrentStudent } from '@/hooks/use-current-student'
import { parents, studentFullName } from '@/data/mock-data'
import { PageHeader } from '@/components/shared/empty-state'
import { Card, CardContent, CardHeader, CardTitle, Badge } from '@/components/ui/card'
import { Avatar } from '@/components/ui/tabs'
import { formatDate } from '@/lib/utils'

export default function StudentProfilePage() {
  const student = useCurrentStudent()
  const classes = useAppStore((s) => s.classes)
  const classRoom = classes.find((c) => c.id === student.classId)
  const guardians = parents.filter((p) => student.parentIds.includes(p.id))

  return (
    <div>
      <PageHeader title="My Profile" description="Your personal and academic details on file." />

      <div className="grid gap-4 lg:grid-cols-[1fr_1.4fr]">
        <Card>
          <CardContent className="pt-6 text-center">
            <Avatar name={studentFullName(student)} size="lg" className="mx-auto h-24 w-24 text-2xl" />
            <p className="mt-4 font-display text-xl font-semibold text-navy-900">{studentFullName(student)}</p>
            <p className="text-sm text-muted-foreground">{student.admissionNo}</p>
            <div className="mt-3 flex justify-center gap-2">
              <Badge variant="outline">{classRoom?.name ?? student.classId}</Badge>
              <Badge variant="outline">{student.gender === 'M' ? 'Male' : 'Female'}</Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Details</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-xs text-muted-foreground">Date of Birth</p>
              <p className="font-medium">{formatDate(student.dob)}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Admission No.</p>
              <p className="font-medium">{student.admissionNo}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Class</p>
              <p className="font-medium">{classRoom?.name ?? student.classId}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Attendance</p>
              <p className="font-medium">{student.attendancePct}%</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Current Average</p>
              <p className="font-medium">{student.currentAvg}%</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Previous Average</p>
              <p className="font-medium">{student.previousAvg}%</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="mt-4">
        <CardHeader>
          <CardTitle>Parent / Guardian</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {guardians.length === 0 ? (
            <p className="text-sm text-muted-foreground">No guardian on file.</p>
          ) : (
            guardians.map((g) => (
              <div key={g.id} className="flex items-center gap-3 rounded-md border p-3">
                <Avatar name={g.name} size="md" />
                <div>
                  <p className="text-sm font-medium">
                    {g.name} <span className="text-xs text-muted-foreground">({g.relationship})</span>
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {g.email} · {g.phone}
                  </p>
                </div>
              </div>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  )
}
