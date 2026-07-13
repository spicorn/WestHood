import type { ALevelStream, GradeEntry, Student, Subject } from '@/data/types'
import { exams } from '@/data/mock-data'
import { predictSubject } from '@/lib/results-prediction'

/**
 * A-Level Subject Combination Advisor
 * Uses recent/projected marks to score Sciences / Commercials / Arts fitness.
 * Disclaimer: based on current performance — a guide, not a decision.
 */

export const STREAM_SUBJECTS: Record<ALevelStream, string[]> = {
  sciences: ['sub-maths', 'sub-sci', 'sub-ict'],
  commercials: ['sub-maths', 'sub-acc', 'sub-geo'],
  arts: ['sub-eng', 'sub-hist', 'sub-shona', 'sub-geo'],
}

export const STREAM_LABELS: Record<ALevelStream, string> = {
  sciences: 'Sciences',
  commercials: 'Commercials',
  arts: 'Arts',
}

export interface StreamSubjectStrength {
  subjectId: string
  subjectName: string
  mark: number
  strength: 'strong' | 'adequate' | 'developing'
}

export interface StreamAdvice {
  stream: ALevelStream
  score: number
  viable: boolean
  rationale: string
  subjects: StreamSubjectStrength[]
}

function strengthFromMark(mark: number): StreamSubjectStrength['strength'] {
  if (mark >= 70) return 'strong'
  if (mark >= 55) return 'adequate'
  return 'developing'
}

function latestMark(studentId: string, subjectId: string, grades: GradeEntry[]) {
  const chronological = [...exams].sort(
    (a, b) => new Date(a.endDate).getTime() - new Date(b.endDate).getTime(),
  )
  for (let i = chronological.length - 1; i >= 0; i--) {
    const g = grades.find(
      (x) => x.studentId === studentId && x.subjectId === subjectId && x.examId === chronological[i].id,
    )
    if (g) return g.mark
  }
  return null
}

export function adviseALevelStreams(
  student: Student,
  grades: GradeEntry[],
  subjects: Subject[],
  homework: Parameters<typeof predictSubject>[4],
): StreamAdvice[] {
  const streams: ALevelStream[] = ['sciences', 'commercials', 'arts']
  return streams.map((stream) => {
    const subjectIds = STREAM_SUBJECTS[stream]
    const subjectRows: StreamSubjectStrength[] = subjectIds
      .map((sid) => {
        const sub = subjects.find((s) => s.id === sid)
        const predicted = predictSubject(student, sid, grades, exams, homework)
        const latest = latestMark(student.id, sid, grades)
        const mark = predicted?.projectedMark ?? latest
        if (mark == null || !sub) return null
        return {
          subjectId: sid,
          subjectName: sub.name,
          mark,
          strength: strengthFromMark(mark),
        }
      })
      .filter((x): x is StreamSubjectStrength => x !== null)

    const avg =
      subjectRows.length === 0
        ? 0
        : subjectRows.reduce((sum, s) => sum + s.mark, 0) / subjectRows.length
    const strongNames = subjectRows.filter((s) => s.strength === 'strong').map((s) => s.subjectName)
    const weakNames = subjectRows.filter((s) => s.strength === 'developing').map((s) => s.subjectName)
    const viable = avg >= 55 && subjectRows.filter((s) => s.strength !== 'developing').length >= 2

    let rationale: string
    if (strongNames.length >= 2) {
      rationale = `Strong in ${strongNames.join('/')} — ${STREAM_LABELS[stream]} combination viable.`
    } else if (viable) {
      rationale = `Adequate foundations across core ${STREAM_LABELS[stream]} subjects (avg ${Math.round(avg)}%).`
    } else if (weakNames.length) {
      rationale = `Needs improvement in ${weakNames.join(', ')} before ${STREAM_LABELS[stream]} is recommended.`
    } else {
      rationale = `Insufficient subject history to recommend ${STREAM_LABELS[stream]} confidently.`
    }

    return {
      stream,
      score: Math.round(avg),
      viable,
      rationale,
      subjects: subjectRows,
    }
  }).sort((a, b) => b.score - a.score)
}

export const ADVISOR_DISCLAIMER =
  'Based on current performance — a guide, not a decision.'
