import { useMemo, useState } from 'react'
import { toast } from 'sonner'
import { Bar, BarChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { Banknote, Bell, CheckCircle2, CircleDollarSign, MoreHorizontal } from 'lucide-react'
import { PageHeader, StatCard } from '@/components/shared/empty-state'
import { Card, CardContent, CardHeader, CardTitle, Badge } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input, Label } from '@/components/ui/input'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { useAppStore } from '@/stores/app-store'
import { DEMO_TODAY, studentFullName } from '@/data/mock-data'
import type { Invoice, InvoiceStatus } from '@/data/types'
import { formatCurrency, formatDate } from '@/lib/utils'

const STATUS_FILTERS: (InvoiceStatus | 'all')[] = ['all', 'paid', 'partial', 'outstanding', 'overdue']
const statusVariant: Record<InvoiceStatus, 'success' | 'warning' | 'secondary' | 'danger'> = {
  paid: 'success',
  partial: 'warning',
  outstanding: 'secondary',
  overdue: 'danger',
}

function computeStatus(paid: number, amount: number, dueDate: string): InvoiceStatus {
  const isPastDue = new Date(dueDate) < new Date(DEMO_TODAY)
  if (paid >= amount) return 'paid'
  if (paid > 0) return isPastDue ? 'overdue' : 'partial'
  return isPastDue ? 'overdue' : 'outstanding'
}

export default function AdminFinancials() {
  const invoices = useAppStore((s) => s.invoices)
  const students = useAppStore((s) => s.students)
  const classes = useAppStore((s) => s.classes)
  const updateInvoice = useAppStore((s) => s.updateInvoice)

  const [filter, setFilter] = useState<InvoiceStatus | 'all'>('all')
  const [partialTarget, setPartialTarget] = useState<Invoice | null>(null)
  const [partialAmount, setPartialAmount] = useState('')

  const studentName = (id: string) => {
    const st = students.find((s) => s.id === id)
    return st ? studentFullName(st) : id
  }

  const totals = useMemo(() => {
    const totalDue = invoices.reduce((sum, inv) => sum + inv.amount, 0)
    const totalPaid = invoices.reduce((sum, inv) => sum + inv.paid, 0)
    const overdueCount = invoices.filter((inv) => inv.status === 'overdue').length
    return { totalDue, totalPaid, outstanding: totalDue - totalPaid, overdueCount }
  }, [invoices])

  const revenueByClass = useMemo(
    () =>
      classes.map((c) => {
        const classInvoices = invoices.filter((inv) => students.find((s) => s.id === inv.studentId)?.classId === c.id)
        return {
          name: c.name,
          collected: classInvoices.reduce((sum, inv) => sum + inv.paid, 0),
          expected: classInvoices.reduce((sum, inv) => sum + inv.amount, 0),
        }
      }),
    [classes, invoices, students],
  )

  const filtered = useMemo(
    () => (filter === 'all' ? invoices : invoices.filter((inv) => inv.status === filter)),
    [invoices, filter],
  )

  const markPaid = (inv: Invoice) => {
    updateInvoice(inv.id, { paid: inv.amount, status: 'paid' })
    toast.success(`Invoice marked as paid for ${studentName(inv.studentId)}.`)
  }

  const openPartial = (inv: Invoice) => {
    setPartialTarget(inv)
    setPartialAmount(String(inv.paid))
  }

  const savePartial = () => {
    if (!partialTarget) return
    const amount = Number(partialAmount)
    if (Number.isNaN(amount) || amount < 0) {
      toast.error('Enter a valid payment amount.')
      return
    }
    const status = computeStatus(amount, partialTarget.amount, partialTarget.dueDate)
    updateInvoice(partialTarget.id, { paid: amount, status })
    toast.success(`Payment updated for ${studentName(partialTarget.studentId)}.`)
    setPartialTarget(null)
  }

  const sendReminder = (inv: Invoice) => {
    toast.success(`Fee reminder sent to guardian of ${studentName(inv.studentId)}.`)
  }

  return (
    <div>
      <PageHeader title="Financials" description="Track invoices, collections, and outstanding balances." />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Total Expected" value={formatCurrency(totals.totalDue)} icon={CircleDollarSign} />
        <StatCard label="Total Collected" value={formatCurrency(totals.totalPaid)} icon={Banknote} accent="bg-forest-50 text-forest-700" />
        <StatCard label="Outstanding" value={formatCurrency(totals.outstanding)} icon={CircleDollarSign} accent="bg-gold-50 text-gold-800" />
        <StatCard label="Overdue Invoices" value={totals.overdueCount} icon={Bell} accent="bg-red-50 text-red-700" />
      </div>

      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Revenue by Class</CardTitle>
        </CardHeader>
        <CardContent className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={revenueByClass} margin={{ left: -20 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(213 20% 90%)" />
              <XAxis dataKey="name" tick={{ fontSize: 11 }} interval={0} angle={-30} textAnchor="end" height={60} />
              <YAxis tick={{ fontSize: 11 }} tickFormatter={(v) => `$${v / 1000}k`} />
              <Tooltip formatter={(v) => formatCurrency(Number(v))} />
              <Legend />
              <Bar dataKey="expected" fill="#a9bdd3" radius={[4, 4, 0, 0]} name="Expected" />
              <Bar dataKey="collected" fill="#1e3a5f" radius={[4, 4, 0, 0]} name="Collected" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Card className="mt-6">
        <CardHeader className="flex flex-row flex-wrap items-center justify-between gap-2">
          <CardTitle>Invoices</CardTitle>
          <div className="flex flex-wrap gap-1.5">
            {STATUS_FILTERS.map((f) => (
              <Button key={f} size="sm" variant={filter === f ? 'default' : 'outline'} onClick={() => setFilter(f)} className="capitalize">
                {f}
              </Button>
            ))}
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto rounded-lg border">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-muted/50 text-left">
                  <th className="px-4 py-2 font-semibold text-muted-foreground">Student</th>
                  <th className="px-4 py-2 font-semibold text-muted-foreground">Description</th>
                  <th className="px-4 py-2 font-semibold text-muted-foreground">Amount</th>
                  <th className="px-4 py-2 font-semibold text-muted-foreground">Paid</th>
                  <th className="px-4 py-2 font-semibold text-muted-foreground">Status</th>
                  <th className="px-4 py-2 font-semibold text-muted-foreground">Due</th>
                  <th className="px-4 py-2 font-semibold text-muted-foreground" />
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-4 py-8 text-center text-muted-foreground">
                      No invoices match this filter.
                    </td>
                  </tr>
                ) : (
                  filtered.map((inv) => (
                    <tr key={inv.id} className="border-b last:border-0">
                      <td className="px-4 py-2 font-medium">{studentName(inv.studentId)}</td>
                      <td className="px-4 py-2 text-muted-foreground">{inv.description}</td>
                      <td className="px-4 py-2">{formatCurrency(inv.amount)}</td>
                      <td className="px-4 py-2">{formatCurrency(inv.paid)}</td>
                      <td className="px-4 py-2">
                        <Badge variant={statusVariant[inv.status]}>{inv.status}</Badge>
                      </td>
                      <td className="px-4 py-2 text-muted-foreground">{formatDate(inv.dueDate)}</td>
                      <td className="px-4 py-2">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            {inv.status !== 'paid' && (
                              <DropdownMenuItem onClick={() => markPaid(inv)}>
                                <CheckCircle2 className="mr-2 h-3.5 w-3.5" /> Mark fully paid
                              </DropdownMenuItem>
                            )}
                            <DropdownMenuItem onClick={() => openPartial(inv)}>
                              <Banknote className="mr-2 h-3.5 w-3.5" /> Record payment
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => sendReminder(inv)}>
                              <Bell className="mr-2 h-3.5 w-3.5" /> Send fee reminder
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      <Dialog open={!!partialTarget} onOpenChange={(v) => !v && setPartialTarget(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Record Payment</DialogTitle>
            <DialogDescription>
              {partialTarget && `Update the amount paid by ${studentName(partialTarget.studentId)} for ${partialTarget.description}.`}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-1.5">
            <Label>Amount paid</Label>
            <Input type="number" min={0} value={partialAmount} onChange={(e) => setPartialAmount(e.target.value)} />
            {partialTarget && <p className="text-xs text-muted-foreground">Invoice total: {formatCurrency(partialTarget.amount)}</p>}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setPartialTarget(null)}>
              Cancel
            </Button>
            <Button onClick={savePartial}>Save payment</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
