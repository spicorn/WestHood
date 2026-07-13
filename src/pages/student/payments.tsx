import { useMemo } from 'react'
import { Receipt, Wallet } from 'lucide-react'
import { useAppStore } from '@/stores/app-store'
import { useCurrentStudent } from '@/hooks/use-current-student'
import { PageHeader, StatCard, EmptyState } from '@/components/shared/empty-state'
import { Card, CardContent, CardHeader, CardTitle, Badge } from '@/components/ui/card'
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

  return (
    <div>
      <PageHeader
        title="Payments"
        description="Your fee account and instalment plan. Parents can pay online — ask them to use Pay Now in the parent portal."
      />

      <div className="mb-6 grid gap-4 sm:grid-cols-3">
        <StatCard label="Total billed" value={formatCurrency(totalBilled)} icon={Wallet} accent="bg-navy-50 text-navy-700" />
        <StatCard label="Total paid" value={formatCurrency(totalPaid)} icon={Receipt} accent="bg-forest-50 text-forest-700" />
        <StatCard
          label="Balance due"
          value={formatCurrency(balance)}
          icon={Wallet}
          accent={balance > 0 ? 'bg-red-50 text-red-700' : 'bg-forest-50 text-forest-700'}
        />
      </div>

      {myInvoices.length === 0 ? (
        <EmptyState title="No invoices" description="No fee invoices have been issued for you yet." />
      ) : (
        <div className="space-y-4">
          {myInvoices.map((inv) => (
            <Card key={inv.id}>
              <CardHeader className="flex flex-row items-start justify-between gap-2 space-y-0">
                <div>
                  <CardTitle className="text-lg">{inv.description}</CardTitle>
                  <p className="text-sm text-muted-foreground">
                    {inv.term} · Due {formatDate(inv.dueDate)}
                    {inv.instalmentPlan ? ' · Instalment plan' : ''}
                  </p>
                </div>
                <Badge variant={statusVariant[inv.status]}>{inv.status}</Badge>
              </CardHeader>
              <CardContent>
                <div className="mb-3 flex flex-wrap gap-4 text-sm">
                  <span>
                    Billed <strong>{formatCurrency(inv.amount)}</strong>
                  </span>
                  <span>
                    Paid <strong>{formatCurrency(inv.paid)}</strong>
                  </span>
                  <span>
                    Balance <strong>{formatCurrency(inv.amount - inv.paid)}</strong>
                  </span>
                </div>
                {inv.instalments && inv.instalments.length > 0 && (
                  <div className="overflow-x-auto rounded-md border">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b bg-muted/50 text-left">
                          <th className="px-3 py-2">Instalment</th>
                          <th className="px-3 py-2">Due</th>
                          <th className="px-3 py-2">Amount</th>
                          <th className="px-3 py-2">Paid</th>
                          <th className="px-3 py-2">Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {inv.instalments.map((inst) => (
                          <tr key={inst.id} className="border-b last:border-0">
                            <td className="px-3 py-2">{inst.label}</td>
                            <td className="px-3 py-2">{formatDate(inst.dueDate)}</td>
                            <td className="px-3 py-2">{formatCurrency(inst.amount)}</td>
                            <td className="px-3 py-2">{formatCurrency(inst.paid)}</td>
                            <td className="px-3 py-2">
                              <Badge variant={statusVariant[inst.status]}>{inst.status}</Badge>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
