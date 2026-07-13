import { useAppStore } from '@/stores/app-store'
import { useSelectedChild } from '@/hooks/use-parent'
import { ChildSwitcher } from '@/components/parent/child-switcher'
import { PageHeader, EmptyState } from '@/components/shared/empty-state'
import { WeeklyTimetable } from '@/components/shared/weekly-timetable'

export default function ParentTimetablePage() {
  const child = useSelectedChild()
  const classes = useAppStore((s) => s.classes)
  const classRoom = classes.find((c) => c.id === child?.classId)

  if (!child) return <EmptyState title="No children linked" description="No students are linked to your account yet." />

  return (
    <div>
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <PageHeader title="Timetable" description={`Weekly schedule for ${classRoom?.name ?? child.classId}.`} />
        <ChildSwitcher />
      </div>
      <WeeklyTimetable classId={child.classId} />
    </div>
  )
}
