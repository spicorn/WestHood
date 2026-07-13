import { useAppStore } from '@/stores/app-store'
import { useCurrentStudent } from '@/hooks/use-current-student'
import { PageHeader } from '@/components/shared/empty-state'
import { WeeklyTimetable } from '@/components/shared/weekly-timetable'

export default function StudentTimetablePage() {
  const student = useCurrentStudent()
  const classes = useAppStore((s) => s.classes)
  const classRoom = classes.find((c) => c.id === student.classId)

  return (
    <div>
      <PageHeader title="My Timetable" description={`Weekly schedule for ${classRoom?.name ?? student.classId}.`} />
      <WeeklyTimetable classId={student.classId} />
    </div>
  )
}
