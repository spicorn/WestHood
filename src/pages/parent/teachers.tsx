import { useMemo } from 'react'
import { Mail, Phone } from 'lucide-react'
import { useAppStore } from '@/stores/app-store'
import { useSelectedChild } from '@/hooks/use-parent'
import { useClassSubjects } from '@/hooks/use-class-subjects'
import { ChildSwitcher } from '@/components/parent/child-switcher'
import { PageHeader, EmptyState } from '@/components/shared/empty-state'
import { Card, CardContent, Badge } from '@/components/ui/card'
import { Avatar } from '@/components/ui/tabs'

export default function ParentTeachersPage() {
  const child = useSelectedChild()
  const timetable = useAppStore((s) => s.timetable)
  const staff = useAppStore((s) => s.staff)
  const classSubjects = useClassSubjects(child?.classId)

  const teacherGroups = useMemo(() => {
    const map = new Map<string, { teacherId: string; subjectNames: string[] }>()
    for (const subject of classSubjects) {
      const slot = timetable.find((t) => t.classId === child?.classId && t.subjectId === subject.id)
      const teacherId = slot?.teacherId ?? subject.teacherIds[0]
      if (!teacherId) continue
      const existing = map.get(teacherId)
      if (existing) existing.subjectNames.push(subject.name)
      else map.set(teacherId, { teacherId, subjectNames: [subject.name] })
    }
    return Array.from(map.values())
      .map((g) => ({ teacher: staff.find((s) => s.id === g.teacherId), subjectNames: g.subjectNames }))
      .filter((g) => Boolean(g.teacher))
  }, [classSubjects, timetable, staff, child?.classId])

  if (!child) return <EmptyState title="No children linked" description="No students are linked to your account yet." />

  return (
    <div>
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <PageHeader title="Child's Teachers" description={`Subject teachers assigned to ${child.firstName}'s class.`} />
        <ChildSwitcher />
      </div>
      {teacherGroups.length === 0 ? (
        <EmptyState title="No teachers found" description="Teacher assignments have not been published yet." />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {teacherGroups.map(({ teacher, subjectNames }) => (
            <Card key={teacher!.id}>
              <CardContent className="pt-5">
                <div className="flex items-center gap-3">
                  <Avatar name={teacher!.name} size="lg" />
                  <div>
                    <p className="font-display text-lg font-semibold text-navy-900">{teacher!.name}</p>
                    {teacher!.isClassTeacher && <Badge variant="gold">Class Teacher</Badge>}
                  </div>
                </div>
                <div className="mt-3 flex flex-wrap gap-1.5">
                  {subjectNames.map((name) => (
                    <Badge key={name} variant="outline">
                      {name}
                    </Badge>
                  ))}
                </div>
                <div className="mt-4 space-y-1.5 border-t pt-3 text-sm">
                  <a href={`mailto:${teacher!.email}`} className="flex items-center gap-2 text-navy-700 hover:underline">
                    <Mail className="h-3.5 w-3.5" /> {teacher!.email}
                  </a>
                  <a href={`tel:${teacher!.phone}`} className="flex items-center gap-2 text-navy-700 hover:underline">
                    <Phone className="h-3.5 w-3.5" /> {teacher!.phone}
                  </a>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
