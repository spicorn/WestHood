import { useMemo } from 'react'
import { Receipt, Wallet } from 'lucide-react'
import { useAppStore } from '@/stores/app-store'
import { useCurrentStudent } from '@/hooks/use-current-student'
import { PageHeader, StatCard, EmptyState } from '@/components/shared/empty-state'
import { DataTable, type Column } from '@/components/shared/data-table'
import { Badge } from '@/components/ui/card'
import { formatCurrency, formatDate } from '@/lib/utils'
import type { Invoice } from '@/data/types'

const statusVariant: Record<Invoice['status'], 'success' | 'warning' | 'outline' | 'danger'> = {
  paid: 'success',
  partial: 'warning',
  outstanding: 'outline',
  overdue: 'danger',
}

export default function StudentPaymentsPage() {
  const student = useCurrentStudent()
  const invoices = useAppStore((s) => s.invoices)

  const myInvoices = useMemo(() => invoices.filter((i) => i.studentId === student.id), [invoices, student.id])
  const totalBilled = myInvoices.reduce((sum, i) => sum + i.amount, 0)
  const totalPaid = myInvoices.reduce((sum, i) => sum + i.paid, 0)
  const balance = totalBilled - totalPaid

  const columns: Column<Invoice>[] = [
    { key: 'description', header: 'Description', render: (r) => <span className="font-medium">{r.description}</span> },
    { key: 'term', header: 'Term', render: (r) => r.term },
    { key: 'amount', header: 'Amount', render: (r) => formatCurrency(r.amount) },
    { key: 'paid', header: 'Paid', render: (r) => formatCurrency(r.paid) },
    { key: 'balance', header: 'Balance', render: (r) => formatCurrency(r.amount - r.paid) },
    { key: 'status', header: 'Status', render: (r) => <Badge variant={statusVariant[r.status]}>{r.status}</Badge> },
    { key: 'dueDate', header: 'Due Date', render: (r) => formatDate(r.dueDate) },
  ]

  return (
    <div>
      <PageHeader title="Payments" description="Read-only view of your fee invoices. Contact the accounts office for payment." />

      <div className="mb-6 grid gap-4 sm:grid-cols-3">
        <StatCard label="Total billed" value={formatCurrency(totalBilled)} icon={Wallet} accent="bg-navy-50 text-navy-700" />
        <StatCard label="Total paid" value={formatCurrency(totalPaid)} icon={Receipt} accent="bg-forest-50 text-forest-700" />
        <StatCard label="Balance due" value={formatCurrency(balance)} icon={Wallet} accent={balance > 0 ? 'bg-red-50 text-red-700' : 'bg-forest-50 text-forest-700'} />
      </div>

      {myInvoices.length === 0 ? (
        <EmptyState title="No invoices" description="No fee invoices have been issued for you yet." />
      ) : (
        <DataTable data={myInvoices} columns={columns} emptyMessage="No invoices found." />
      )}
    </div>
  )
}
