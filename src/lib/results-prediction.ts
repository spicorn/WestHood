import type { Exam, GradeEntry, Homework, PredictionConfidence, Student } from '@/data/types'
import { getGradeLetter } from '@/data/mock-data'

/**
 * RESULTS PREDICTION — transparent trend-based projection (NOT a black-box AI).
 *
 * Algorithm (documented for demo Q&A with the Head):
 * 1. Take the student's last 2–3 exam marks for a subject, ordered oldest → newest.
 * 2. Weighted trend: most recent weighted highest.
 *    - 3 marks → weights 20% / 30% / 50%
 *    - 2 marks → weights 40% / 60%
 *    - 1 mark  → that mark is the base (low confidence)
 * 3. Attendance & homework modifiers (simple, capped):
 *    - attendance < 80%  → −3 pts; < 70% → −5 pts
 *    - homework completion < 70% → −2 pts; < 50% → −4 pts
 *    - attendance ≥ 95% AND homework ≥ 90% → +2 pts (bonus)
 * 4. Projected mark is clamped 0–100. Display as a grade *band* (±3 pts),
 *    never a falsely precise single number.
 * 5. Confidence = High/Medium/Low from variance of past marks
 *    (std-dev ≤ 4 → High; ≤ 8 → Medium; else Low).
 */

export interface SubjectPrediction {
  subjectId: string
  pastPoints: { examId: string; examName: string; term: string; mark: number }[]
  projectedMark: number
  projectedLow: number
  projectedHigh: number
  gradeBand: string
  confidence: PredictionConfidence
  trend: 'improving' | 'stable' | 'declining'
  deltaFromLatest: number
}

const WEIGHTS_3 = [0.2, 0.3, 0.5]
const WEIGHTS_2 = [0.4, 0.6]

function stdDev(values: number[]) {
  if (values.length < 2) return 0
  const mean = values.reduce((a, b) => a + b, 0) / values.length
  const variance = values.reduce((sum, v) => sum + (v - mean) ** 2, 0) / values.length
  return Math.sqrt(variance)
}

function homeworkCompletionRate(studentId: string, homework: Homework[]) {
  const relevant = homework.filter((h) => h.submissions.some((s) => s.studentId === studentId))
  if (relevant.length === 0) return 100
  let done = 0
  let total = 0
  for (const h of relevant) {
    const sub = h.submissions.find((s) => s.studentId === studentId)
    if (!sub) continue
    total++
    if (sub.status === 'submitted' || sub.status === 'late') done++
  }
  return total === 0 ? 100 : Math.round((done / total) * 100)
}

function applyModifiers(base: number, attendancePct: number, hwPct: number) {
  let adj = 0
  if (attendancePct < 70) adj -= 5
  else if (attendancePct < 80) adj -= 3
  if (hwPct < 50) adj -= 4
  else if (hwPct < 70) adj -= 2
  if (attendancePct >= 95 && hwPct >= 90) adj += 2
  return Math.max(0, Math.min(100, Math.round(base + adj)))
}

function gradeBandLabel(low: number, high: number, exam: Exam) {
  const gLow = getGradeLetter(low, exam)
  const gHigh = getGradeLetter(high, exam)
  if (gLow === gHigh) return `${gLow} likely`
  // Present higher grade first when improving upwardly naming, else range low–high
  return `${gHigh}–${gLow} likely`.replace(/^(\w+)–\1/, '$1')
}

export function predictSubject(
  student: Student,
  subjectId: string,
  grades: GradeEntry[],
  exams: Exam[],
  homework: Homework[],
): SubjectPrediction | null {
  const chronological = [...exams].sort(
    (a, b) => new Date(a.endDate).getTime() - new Date(b.endDate).getTime(),
  )
  // Prefer completed assessments (before Term 2 Final if still upcoming); use whatever we have
  const pastEntries = chronological
    .map((exam) => {
      const g = grades.find((x) => x.studentId === student.id && x.subjectId === subjectId && x.examId === exam.id)
      return g ? { exam, mark: g.mark } : null
    })
    .filter((x): x is { exam: Exam; mark: number } => x !== null)
    .slice(-3)

  if (pastEntries.length === 0) return null

  const marks = pastEntries.map((p) => p.mark)
  const weights = pastEntries.length >= 3 ? WEIGHTS_3 : pastEntries.length === 2 ? WEIGHTS_2 : [1]
  const weighted =
    pastEntries.length === 1
      ? marks[0]
      : marks.reduce((sum, m, i) => sum + m * (weights[i] ?? 0), 0)

  const hwPct = homeworkCompletionRate(student.id, homework)
  const projected = applyModifiers(weighted, student.attendancePct, hwPct)
  const latest = marks[marks.length - 1]
  const delta = projected - latest

  const sd = stdDev(marks)
  const confidence: PredictionConfidence = sd <= 4 ? 'high' : sd <= 8 ? 'medium' : 'low'

  const bandPad = confidence === 'high' ? 2 : confidence === 'medium' ? 3 : 5
  const projectedLow = Math.max(0, projected - bandPad)
  const projectedHigh = Math.min(100, projected + bandPad)
  const refExam = pastEntries[pastEntries.length - 1].exam

  let trend: SubjectPrediction['trend'] = 'stable'
  if (delta <= -3) trend = 'declining'
  else if (delta >= 3) trend = 'improving'

  return {
    subjectId,
    pastPoints: pastEntries.map((p) => ({
      examId: p.exam.id,
      examName: p.exam.name,
      term: p.exam.term,
      mark: p.mark,
    })),
    projectedMark: projected,
    projectedLow,
    projectedHigh,
    gradeBand: gradeBandLabel(projectedLow, projectedHigh, refExam),
    confidence,
    trend,
    deltaFromLatest: delta,
  }
}

export function predictStudentSubjects(
  student: Student,
  subjectIds: string[],
  grades: GradeEntry[],
  exams: Exam[],
  homework: Homework[],
) {
  return subjectIds
    .map((id) => predictSubject(student, id, grades, exams, homework))
    .filter((p): p is SubjectPrediction => p !== null)
}

export function overallTrendScore(predictions: SubjectPrediction[]) {
  if (predictions.length === 0) return 0
  return predictions.reduce((sum, p) => sum + p.deltaFromLatest, 0) / predictions.length
}

export const PREDICTION_DISCLAIMER =
  'Projection based on historical performance trend — not a guarantee.'
