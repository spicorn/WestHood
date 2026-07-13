import { useEffect, useMemo, useState } from 'react'
import { toast } from 'sonner'
import { Bar, BarChart, CartesianGrid, Cell, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { BookMarked, MessageSquarePlus, Save, Search, TrendingUp } from 'lucide-react'
import { commentPhrases, exams, getGradeLetter, studentFullName } from '@/data/mock-data'
import { useAppStore } from '@/stores/app-store'
import { useCurrentStaff } from '@/hooks/use-current-staff'
import { PageHeader, EmptyState, StatCard } from '@/components/shared/empty-state'
import { Card, CardContent, CardHeader, CardTitle, Badge } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Select, Avatar } from '@/components/ui/tabs'
import { Input, Textarea } from '@/components/ui/input'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import { cn } from '@/lib/utils'

const gradeColors: Record<string, string> = {
  A: '#2d5a3f',
  B: '#57a373',
  C: '#d4a017',
  D: '#e0bd5a',
  E: '#c4920f',
  U: '#c0392b',
}

const bandLabel: Record<string, string> = {
  strong: 'Strong',
  average: 'Average',
  needs_improvement: 'Needs Improvement',
}

interface MarkRow {
  mark: string
  comment: string
}

export default function StaffExamsPage() {
  const { teacher } = useCurrentStaff()
  const subjects = useAppStore((s) => s.subjects)
  const classes = useAppStore((s) => s.classes)
  const students = useAppStore((s) => s.students)
  const grades = useAppStore((s) => s.grades)
  const upsertGrade = useAppStore((s) => s.upsertGrade)

  const mySubjects = useMemo(
    () => subjects.filter((sub) => teacher?.subjects.includes(sub.id)),
    [subjects, teacher],
  )

  const [examId, setExamId] = useState(exams[0]?.id ?? '')
  const [subjectId, setSubjectId] = useState(mySubjects[0]?.id ?? '')
  const subject = subjects.find((s) => s.id === subjectId)
  const myClassesForSubject = useMemo(
    () => classes.filter((c) => teacher?.classIds.includes(c.id) && subject?.classIds.includes(c.id)),
    [classes, teacher, subject],
  )
  const [classId, setClassId] = useState(myClassesForSubject[0]?.id ?? '')

  useEffect(() => {
    if (!myClassesForSubject.some((c) => c.id === classId)) {
      setClassId(myClassesForSubject[0]?.id ?? '')
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [subjectId])

  const exam = exams.find((e) => e.id === examId)
  const roster = useMemo(
    () => students.filter((s) => s.classId === classId && s.status === 'active').sort((a, b) => a.firstName.localeCompare(b.firstName)),
    [students, classId],
  )

  const [rows, setRows] = useState<Record<string, MarkRow>>({})
  const [commentFor, setCommentFor] = useState<string | null>(null)
  const [commentQuery, setCommentQuery] = useState('')

  useEffect(() => {
    const map: Record<string, MarkRow> = {}
    for (const s of roster) {
      const g = grades.find((g) => g.examId === examId && g.subjectId === subjectId && g.studentId === s.id)
      map[s.id] = { mark: g ? String(g.mark) : '', comment: g?.comment ?? '' }
    }
    setRows(map)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [examId, subjectId, classId])

  if (!teacher) return <PageHeader title="Exam Records" description="Loading your staff profile…" />

  if (mySubjects.length === 0) {
    return (
      <div>
        <PageHeader title="Exam Records" description="Enter and edit marks for the subjects you teach." />
        <EmptyState icon={BookMarked} title="No subjects assigned" description="You have no subjects assigned yet." />
      </div>
    )
  }

  const validMarks = roster
    .map((s) => Number(rows[s.id]?.mark))
    .filter((m) => Number.isFinite(m) && m >= 0 && m <= 100)
  const average = validMarks.length ? Math.round((validMarks.reduce((a, b) => a + b, 0) / validMarks.length) * 10) / 10 : null

  const distribution = exam
    ? exam.gradeBoundaries.map((b) => ({
        grade: b.grade,
        count: validMarks.filter((m) => m >= b.min && m <= b.max).length,
      }))
    : []

  function updateRow(studentId: string, patch: Partial<MarkRow>) {
    setRows((prev) => ({ ...prev, [studentId]: { ...(prev[studentId] ?? { mark: '', comment: '' }), ...patch } }))
  }

  function handleSaveAll() {
    let saved = 0
    for (const s of roster) {
      const row = rows[s.id]
      const markNum = Number(row?.mark)
      if (!row || row.mark === '' || !Number.isFinite(markNum)) continue
      const clamped = Math.max(0, Math.min(100, markNum))
      const existing = grades.find((g) => g.examId === examId && g.subjectId === subjectId && g.studentId === s.id)
      upsertGrade({
        id: existing?.id ?? `gr-${examId}-${subjectId}-${s.id}`,
        examId,
        subjectId,
        studentId: s.id,
        mark: clamped,
        comment: row.comment.trim() || undefined,
      })
      saved++
    }
    toast.success(`Saved marks for ${saved} student${saved === 1 ? '' : 's'}`, {
      description: `${exam?.name} · ${subject?.name} · ${classes.find((c) => c.id === classId)?.name}`,
    })
  }

  const filteredPhrases = commentPhrases.filter((p) => p.text.toLowerCase().includes(commentQuery.toLowerCase()))

  return (
    <div>
      <PageHeader
        title="Exam Records"
        description="Enter and edit marks for the subjects you teach, with class averages and grade distribution."
        actions={<Button className="gap-2" onClick={handleSaveAll}><Save className="h-4 w-4" /> Save All Marks</Button>}
      />

      <div className="mb-6 grid gap-3 sm:grid-cols-3">
        <div>
          <label className="mb-1.5 block text-xs font-medium text-muted-foreground">Exam</label>
          <Select value={examId} onChange={(e) => setExamId(e.target.value)}>
            {exams.map((e) => (
              <option key={e.id} value={e.id}>{e.name}</option>
            ))}
          </Select>
        </div>
        <div>
          <label className="mb-1.5 block text-xs font-medium text-muted-foreground">Subject</label>
          <Select value={subjectId} onChange={(e) => setSubjectId(e.target.value)}>
            {mySubjects.map((s) => (
              <option key={s.id} value={s.id}>{s.name}</option>
            ))}
          </Select>
        </div>
        <div>
          <label className="mb-1.5 block text-xs font-medium text-muted-foreground">Class</label>
          <Select value={classId} onChange={(e) => setClassId(e.target.value)} disabled={myClassesForSubject.length === 0}>
            {myClassesForSubject.map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </Select>
        </div>
      </div>

      {myClassesForSubject.length === 0 ? (
        <EmptyState icon={BookMarked} title="No classes for this subject" description="You don't teach this subject to any of your classes." />
      ) : (
        <>
          <div className="mb-6 grid gap-4 sm:grid-cols-3">
            <StatCard label="Students" value={roster.length} accent="bg-navy-50 text-navy-700" />
            <StatCard label="Class Average" value={average !== null ? `${average}%` : '—'} icon={TrendingUp} accent="bg-forest-100 text-forest-700" />
            <StatCard label="Marks Entered" value={`${validMarks.length}/${roster.length}`} accent="bg-gold-100 text-gold-800" />
          </div>

          <div className="grid gap-6 lg:grid-cols-[1.6fr_1fr] mb-6">
            <Card>
              <CardHeader>
                <CardTitle>Mark Entry</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {roster.map((s) => {
                  const row = rows[s.id] ?? { mark: '', comment: '' }
                  const mark = Number(row.mark)
                  const letter = row.mark !== '' && Number.isFinite(mark) && exam ? getGradeLetter(mark, exam) : null
                  return (
                    <div key={s.id} className="rounded-lg border p-3">
                      <div className="flex items-center gap-3">
                        <Avatar name={studentFullName(s)} size="sm" />
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-medium truncate">{studentFullName(s)}</p>
                          <p className="text-xs text-muted-foreground">{s.admissionNo}</p>
                        </div>
                        <Input
                          type="number"
                          min={0}
                          max={100}
                          value={row.mark}
                          onChange={(e) => updateRow(s.id, { mark: e.target.value })}
                          placeholder="Mark"
                          className="w-20 text-center"
                        />
                        {letter && (
                          <Badge
                            style={{ backgroundColor: `${gradeColors[letter]}20`, color: gradeColors[letter] }}
                            className="w-9 justify-center"
                          >
                            {letter}
                          </Badge>
                        )}
                      </div>
                      <div className="mt-2 flex items-start gap-2">
                        <Textarea
                          value={row.comment}
                          onChange={(e) => updateRow(s.id, { comment: e.target.value })}
                          placeholder="Report card comment…"
                          className="min-h-[38px] py-2 text-sm"
                        />
                        <Button
                          type="button"
                          variant="outline"
                          size="icon"
                          className="shrink-0"
                          title="Comment bank"
                          onClick={() => {
                            setCommentFor(s.id)
                            setCommentQuery('')
                          }}
                        >
                          <MessageSquarePlus className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  )
                })}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Grade Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={distribution}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} />
                      <XAxis dataKey="grade" tickLine={false} axisLine={false} fontSize={12} />
                      <YAxis allowDecimals={false} tickLine={false} axisLine={false} fontSize={12} width={24} />
                      <Tooltip cursor={{ fill: 'rgba(30,58,95,0.05)' }} />
                      <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                        {distribution.map((d) => (
                          <Cell key={d.grade} fill={gradeColors[d.grade] ?? '#1e3a5f'} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
                <p className="mt-2 text-center text-xs text-muted-foreground">Based on marks currently entered above.</p>
              </CardContent>
            </Card>
          </div>
        </>
      )}

      <Dialog open={!!commentFor} onOpenChange={(open) => !open && setCommentFor(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Comment Bank</DialogTitle>
            <DialogDescription>Search and pick a phrase to use as the report card remark.</DialogDescription>
          </DialogHeader>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              className="pl-9"
              placeholder="Search phrases…"
              value={commentQuery}
              onChange={(e) => setCommentQuery(e.target.value)}
              autoFocus
            />
          </div>
          <div className="max-h-80 space-y-3 overflow-y-auto pr-1">
            {(['strong', 'average', 'needs_improvement'] as const).map((band) => {
              const items = filteredPhrases.filter((p) => p.band === band)
              if (items.length === 0) return null
              return (
                <div key={band}>
                  <p className="mb-1.5 text-xs font-semibold uppercase tracking-wide text-muted-foreground">{bandLabel[band]}</p>
                  <div className="space-y-1.5">
                    {items.map((p) => (
                      <button
                        key={p.id}
                        type="button"
                        onClick={() => {
                          if (commentFor) updateRow(commentFor, { comment: p.text })
                          setCommentFor(null)
                        }}
                        className={cn(
                          'w-full rounded-md border p-2.5 text-left text-sm transition-colors hover:bg-muted/60',
                        )}
                      >
                        {p.text}
                      </button>
                    ))}
                  </div>
                </div>
              )
            })}
            {filteredPhrases.length === 0 && <p className="py-6 text-center text-sm text-muted-foreground">No phrases match your search.</p>}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
