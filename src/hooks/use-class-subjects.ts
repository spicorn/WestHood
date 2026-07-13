import { useMemo } from 'react'
import { useAppStore } from '@/stores/app-store'
import type { StaffMember, Subject } from '@/data/types'

/**
 * Resolves the subjects actually scheduled for a class from the timetable
 * (falling back to Subject.classIds metadata for classes without timetable data).
 */
export function useClassSubjects(classId: string | undefined): Subject[] {
  const timetable = useAppStore((s) => s.timetable)
  const subjects = useAppStore((s) => s.subjects)

  return useMemo(() => {
    if (!classId) return []
    const scheduledIds = Array.from(
      new Set(timetable.filter((t) => t.classId === classId).map((t) => t.subjectId)),
    )
    const ids = scheduledIds.length > 0 ? scheduledIds : subjects.filter((s) => s.classIds.includes(classId)).map((s) => s.id)
    return ids
      .map((id) => subjects.find((s) => s.id === id))
      .filter((s): s is Subject => Boolean(s))
  }, [timetable, subjects, classId])
}

/** Resolves the teacher actually assigned to a subject for a given class via the timetable. */
export function useSubjectTeacher(classId: string | undefined, subjectId: string): StaffMember | undefined {
  const timetable = useAppStore((s) => s.timetable)
  const staff = useAppStore((s) => s.staff)
  const subjects = useAppStore((s) => s.subjects)

  return useMemo(() => {
    const slot = timetable.find((t) => t.classId === classId && t.subjectId === subjectId)
    if (slot) return staff.find((s) => s.id === slot.teacherId)
    const subject = subjects.find((s) => s.id === subjectId)
    const fallbackId = subject?.teacherIds[0]
    return staff.find((s) => s.id === fallbackId)
  }, [timetable, staff, subjects, classId, subjectId])
}
