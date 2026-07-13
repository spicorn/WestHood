import { useMemo } from 'react'
import { toast } from 'sonner'
import { Download, Receipt, Wallet } from 'lucide-react'
import { useAppStore } from '@/stores/app-store'
import { useParentChildren, useSelectedChild } from '@/hooks/use-parent'
import { studentFullName } from '@/data/mock-data'
import { ChildSwitcher } from '@/components/parent/child-switcher'
import { PageHeader, StatCard, EmptyState } from '@/components/shared/empty-state'
import { DataTable, type Column } from '@/components/shared/data-table'
import { Card, CardContent, CardHeader, CardTitle, CardDescription, Badge } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { formatCurrency, formatDate } from '@/lib/utils'
import type { Invoice } from '@/data/types'

const statusVariant: Record<Invoice['status'], 'success' | 'warning' | 'outline' | 'danger'> = {
  paid: 'success',
  partial: 'warning',
  outstanding: 'outline',
  overdue: 'danger',
}

export default function ParentPaymentsPage() {
  const child = useSelectedChild()
  const children = useParentChildren()
  const invoices = useAppStore((s) => s.invoices)

  const childInvoices = useMemo(() => invoices.filter((i) => child && i.studentId === child.id), [invoices, child])

  const siblingBreakdown = useMemo(
    () =>
      children.map((c) => {
        const inv = invoices.filter((i) => i.studentId === c.id)
        const billed = inv.reduce((sum, i) => sum + i.amount, 0)
        const paid = inv.reduce((sum, i) => sum + i.paid, 0)
        return { student: c, billed, paid, balance: billed - paid, invoiceCount: inv.length }
      }),
    [children, invoices],
  )

  const combinedTotals = siblingBreakdown.reduce(
    (acc, s) => ({ billed: acc.billed + s.billed, paid: acc.paid + s.paid, balance: acc.balance + s.balance }),
    { billed: 0, paid: 0, balance: 0 },
  )

  const downloadReceipt = (invoice: Invoice) => {
    toast.success('Receipt downloading…', { description: `Receipt for ${invoice.description} (${formatCurrency(invoice.paid)} paid).` })
  }

  const columns: Column<Invoice>[] = [
    { key: 'description', header: 'Description', render: (r) => <span className="font-medium">{r.description}</span> },
    { key: 'term', header: 'Term', render: (r) => r.term },
    { key: 'amount', header: 'Amount', render: (r) => formatCurrency(r.amount) },
    { key: 'paid', header: 'Paid', render: (r) => formatCurrency(r.paid) },
    { key: 'balance', header: 'Balance', render: (r) => formatCurrency(r.amount - r.paid) },
    { key: 'status', header: 'Status', render: (r) => <Badge variant={statusVariant[r.status]}>{r.status}</Badge> },
    { key: 'dueDate', header: 'Due Date', render: (r) => formatDate(r.dueDate) },
    {
      key: 'action',
      header: '',
      render: (r) => (
        <Button size="sm" variant="outline" onClick={() => downloadReceipt(r)}>
          <Download className="mr-1.5 h-3.5 w-3.5" /> Receipt
        </Button>
      ),
    },
  ]

  if (!child) return <EmptyState title="No children linked" description="No students are linked to your account yet." />

  return (
    <div>
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <PageHeader title="Payments" description="Fee invoices for your selected child, plus a combined statement for all your children." />
        <ChildSwitcher />
      </div>

      <div className="mb-6 grid gap-4 sm:grid-cols-3">
        <StatCard label={`${child.firstName}'s balance`} value={formatCurrency(childInvoices.reduce((s, i) => s + (i.amount - i.paid), 0))} icon={Wallet} accent="bg-navy-50 text-navy-700" />
        <StatCard label="Total paid (all children)" value={formatCurrency(combinedTotals.paid)} icon={Receipt} accent="bg-forest-50 text-forest-700" />
        <StatCard label="Combined balance due" value={formatCurrency(combinedTotals.balance)} icon={Wallet} accent={combinedTotals.balance > 0 ? 'bg-red-50 text-red-700' : 'bg-forest-50 text-forest-700'} />
      </div>

      <h3 className="mb-3 font-display text-lg font-semibold text-navy-900">{child.firstName}'s invoices</h3>
      {childInvoices.length === 0 ? (
        <EmptyState title="No invoices" description="No fee invoices have been issued for this child yet." />
      ) : (
        <DataTable data={childInvoices} columns={columns} emptyMessage="No invoices found." />
      )}

      {children.length > 1 && (
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Combined sibling fee statement</CardTitle>
            <CardDescription>A breakdown of fees across all children linked to your account.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto rounded-lg border">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b bg-muted/50 text-left">
                    <th className="px-4 py-3 font-semibold text-muted-foreground">Child</th>
                    <th className="px-4 py-3 font-semibold text-muted-foreground">Invoices</th>
                    <th className="px-4 py-3 font-semibold text-muted-foreground">Billed</th>
                    <th className="px-4 py-3 font-semibold text-muted-foreground">Paid</th>
                    <th className="px-4 py-3 font-semibold text-muted-foreground">Balance</th>
                  </tr>
                </thead>
                <tbody>
                  {siblingBreakdown.map((s) => (
                    <tr key={s.student.id} className="border-b last:border-0">
                      <td className="px-4 py-3 font-medium">{studentFullName(s.student)}</td>
                      <td className="px-4 py-3">{s.invoiceCount}</td>
                      <td className="px-4 py-3">{formatCurrency(s.billed)}</td>
                      <td className="px-4 py-3">{formatCurrency(s.paid)}</td>
                      <td className="px-4 py-3 font-semibold">{formatCurrency(s.balance)}</td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr className="border-t bg-muted/40 font-semibold">
                    <td className="px-4 py-3">Total</td>
                    <td className="px-4 py-3">{siblingBreakdown.reduce((sum, s) => sum + s.invoiceCount, 0)}</td>
                    <td className="px-4 py-3">{formatCurrency(combinedTotals.billed)}</td>
                    <td className="px-4 py-3">{formatCurrency(combinedTotals.paid)}</td>
                    <td className="px-4 py-3">{formatCurrency(combinedTotals.balance)}</td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
