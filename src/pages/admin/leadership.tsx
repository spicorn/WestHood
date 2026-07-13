import { useMemo } from 'react'
import { toast } from 'sonner'
import { Crown } from 'lucide-react'
import { PageHeader, EmptyState } from '@/components/shared/empty-state'
import { LeadershipBadge } from '@/components/shared/leadership-badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Select } from '@/components/ui/tabs'
import { useAppStore } from '@/stores/app-store'
import { LEADERSHIP_LABELS, studentFullName } from '@/data/mock-data'
import type { LeadershipRole } from '@/data/types'

const ROLE_ORDER: LeadershipRole[] = [
  'head_boy',
  'head_girl',
  'deputy_head',
  'prefect',
  'class_captain',
]

export default function AdminLeadership() {
  const students = useAppStore((s) => s.students)
  const classes = useAppStore((s) => s.classes)
  const setLeadershipRole = useAppStore((s) => s.setLeadershipRole)

  const grouped = useMemo(() => {
    return ROLE_ORDER.map((role) => ({
      role,
      label: LEADERSHIP_LABELS[role],
      members: students.filter((s) => s.status === 'active' && s.leadershipRole === role),
    })).filter((g) => g.members.length > 0)
  }, [students])

  const onChangeRole = (studentId: string, role: LeadershipRole) => {
    setLeadershipRole(studentId, role)
    toast.success(role === 'none' ? 'Leadership role cleared.' : `Role updated to ${LEADERSHIP_LABELS[role]}.`)
  }

  return (
    <div>
      <PageHeader
        title="Leadership Team"
        description="Prefects and student leaders across the college. Exclude students with no role."
      />

      {grouped.length === 0 ? (
        <EmptyState
          icon={Crown}
          title="No leadership appointments"
          description="Assign roles from a student profile or here once students are selected."
        />
      ) : (
        <div className="space-y-4">
          {grouped.map(({ role, label, members }) => (
            <Card key={role}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <LeadershipBadge role={role} size="md" />
                  <span className="text-navy-800">{label}</span>
                  <span className="text-sm font-normal text-muted-foreground">({members.length})</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {members.map((s) => (
                    <li
                      key={s.id}
                      className="flex flex-wrap items-center justify-between gap-3 rounded-md border px-3 py-2"
                    >
                      <div>
                        <p className="text-sm font-medium">{studentFullName(s)}</p>
                        <p className="text-xs text-muted-foreground">
                          {classes.find((c) => c.id === s.classId)?.name ?? s.classId} · {s.admissionNo}
                        </p>
                      </div>
                      <Select
                        className="w-44"
                        value={s.leadershipRole ?? 'none'}
                        onChange={(e) => onChangeRole(s.id, e.target.value as LeadershipRole)}
                      >
                        {(Object.keys(LEADERSHIP_LABELS) as LeadershipRole[]).map((r) => (
                          <option key={r} value={r}>
                            {r === 'none' ? 'No role' : LEADERSHIP_LABELS[r]}
                          </option>
                        ))}
                      </Select>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
