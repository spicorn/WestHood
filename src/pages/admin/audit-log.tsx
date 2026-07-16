import { useMemo, useState } from 'react'
import { ScrollText } from 'lucide-react'
import { useAppStore } from '@/stores/app-store'
import { PageHeader, EmptyState } from '@/components/shared/empty-state'
import { DataTable, type Column } from '@/components/shared/data-table'
import { Badge } from '@/components/ui/card'
import { Label } from '@/components/ui/input'
import { Select } from '@/components/ui/tabs'
import { formatDate } from '@/lib/utils'
import type { AuditAction, AuditLogEntry } from '@/data/types'

const ACTION_LABELS: Record<AuditAction, string> = {
  grade_upsert: 'Grade update',
  report_status: 'Report status',
  report_publish: 'Report published',
  payment_recorded: 'Payment recorded',
  invoice_updated: 'Invoice updated',
  absence_decision: 'Absence decision',
  admission_stage: 'Admission stage',
  student_enrolled: 'Student enrolled',
}

export default function AdminAuditLogPage() {
  const auditLog = useAppStore((s) => s.auditLog)
  const [actionFilter, setActionFilter] = useState<AuditAction | 'all'>('all')

  const rows = useMemo(
    () =>
      auditLog
        .filter((e) => (actionFilter === 'all' ? true : e.action === actionFilter))
        .slice()
        .sort((a, b) => b.createdAt.localeCompare(a.createdAt)),
    [auditLog, actionFilter],
  )

  const columns: Column<AuditLogEntry>[] = [
    {
      key: 'createdAt',
      header: 'When',
      sortable: true,
      render: (r) => (
        <span className="whitespace-nowrap text-sm">
          {formatDate(r.createdAt.slice(0, 10))} · {r.createdAt.slice(11, 16)}
        </span>
      ),
    },
    {
      key: 'action',
      header: 'Action',
      render: (r) => <Badge variant="outline">{ACTION_LABELS[r.action] ?? r.action}</Badge>,
    },
    {
      key: 'actor',
      header: 'Who',
      render: (r) => (
        <div>
          <p className="text-sm font-medium">{r.actorName}</p>
          <p className="text-xs capitalize text-muted-foreground">{r.actorRole}</p>
        </div>
      ),
    },
    {
      key: 'summary',
      header: 'Summary',
      render: (r) => <span className="text-sm">{r.summary}</span>,
    },
    {
      key: 'entity',
      header: 'Record',
      render: (r) => (
        <span className="text-xs text-muted-foreground">
          {r.entityType} · {r.entityId}
        </span>
      ),
    },
  ]

  return (
    <div>
      <PageHeader
        title="Audit Log"
        description="A constructive trail of key academic, finance, and pastoral decisions — useful for Head’s reviews and board assurance."
      />

      <div className="mb-4 max-w-xs space-y-1.5">
        <Label>Filter by action</Label>
        <Select
          value={actionFilter}
          onChange={(e) => setActionFilter(e.target.value as AuditAction | 'all')}
        >
          <option value="all">All actions</option>
          {(Object.keys(ACTION_LABELS) as AuditAction[]).map((a) => (
            <option key={a} value={a}>
              {ACTION_LABELS[a]}
            </option>
          ))}
        </Select>
      </div>

      {rows.length === 0 ? (
        <EmptyState
          icon={ScrollText}
          title="No audit entries"
          description="Decisions on grades, payments, absences, and admissions will appear here."
        />
      ) : (
        <DataTable
          data={rows}
          columns={columns}
          searchKeys={['summary', 'actorName']}
          searchPlaceholder="Search audit log…"
          pageSize={15}
        />
      )}
    </div>
  )
}
