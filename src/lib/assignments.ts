import type { Homework, StudyMaterial, Subject } from '@/data/types'
import { DEMO_TODAY } from '@/data/mock-data'

export type AssignmentKind = 'homework' | 'material'

export interface UnifiedAssignment {
  id: string
  kind: AssignmentKind
  title: string
  subjectId: string
  subjectName: string
  classId: string
  dueDate?: string
  createdAt: string
  status?: 'assigned' | 'submitted' | 'late' | 'missing' | 'available'
  overdue?: boolean
  meta?: string
}

export function buildStudentAssignments(
  studentId: string,
  classId: string,
  homework: Homework[],
  materials: StudyMaterial[],
  subjects: Subject[],
): UnifiedAssignment[] {
  const subjectName = (id: string) => subjects.find((s) => s.id === id)?.name ?? id
  const hwItems: UnifiedAssignment[] = homework
    .filter((h) => h.classId === classId)
    .map((h) => {
      const sub = h.submissions.find((s) => s.studentId === studentId)
      const status = sub?.status ?? 'assigned'
      const overdue = status === 'missing' || (status === 'assigned' && h.dueDate < DEMO_TODAY)
      return {
        id: h.id,
        kind: 'homework' as const,
        title: h.title,
        subjectId: h.subjectId,
        subjectName: subjectName(h.subjectId),
        classId: h.classId,
        dueDate: h.dueDate,
        createdAt: h.createdAt,
        status: overdue && status === 'assigned' ? 'missing' : status,
        overdue,
        meta: h.description,
      }
    })
  const matItems: UnifiedAssignment[] = materials
    .filter((m) => m.classId === classId)
    .map((m) => ({
      id: m.id,
      kind: 'material' as const,
      title: m.title,
      subjectId: m.subjectId,
      subjectName: subjectName(m.subjectId),
      classId: m.classId,
      createdAt: m.date,
      status: 'available' as const,
      meta: `${m.fileType} · ${m.fileSize}`,
    }))
  return [...hwItems, ...matItems].sort((a, b) => {
    const da = a.dueDate ?? a.createdAt
    const db = b.dueDate ?? b.createdAt
    return db.localeCompare(da)
  })
}
