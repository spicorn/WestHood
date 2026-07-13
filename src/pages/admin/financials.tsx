import { useMemo, useState } from 'react'
import { toast } from 'sonner'
import { Bar, BarChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import {
  Banknote,
  Bell,
  CheckCircle2,
  CircleDollarSign,
  MoreHorizontal,
  Percent,
  Save,
} from 'lucide-react'
import { PageHeader, StatCard } from '@/components/shared/empty-state'
import { Card, CardContent, CardDescription, CardHeader, CardTitle, Badge } from '@/components/ui/card'
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
import { Tabs, TabsContent, TabsList, TabsTrigger, Select } from '@/components/ui/tabs'
import { PaymentMethodPicker } from '@/components/shared/payment-method-picker'
import { useAppStore } from '@/stores/app-store'
import { useAuthStore } from '@/stores/auth-store'
import { studentFullName } from '@/data/mock-data'
import type { FeeStructure, Invoice, InvoiceStatus, PaymentMethod } from '@/data/types'
import { unpaidInstalments } from '@/lib/fees'
import { formatCurrency, formatDate } from '@/lib/utils'

const STATUS_FILTERS: (InvoiceStatus | 'all')[] = ['all', 'paid', 'partial', 'outstanding', 'overdue']
const statusVariant: Record<InvoiceStatus, 'success' | 'warning' | 'secondary' | 'danger'> = {
  paid: 'success',
  partial: 'warning',
  outstanding: 'secondary',
  overdue: 'danger',
}

function instalmentSplitPreview(amount: number, count: number) {
  if (count <= 1) return [amount]
  const base = Math.floor(amount / count)
  return Array.from({ length: count }, (_, i) =>
    i === count - 1 ? amount - base * (count - 1) : base,
  )
}

export default function AdminFinancials() {
  const invoices = useAppStore((s) => s.invoices)
  const students = useAppStore((s) => s.students)
  const classes = useAppStore((s) => s.classes)
  const feeStructures = useAppStore((s) => s.feeStructures)
  const updateInvoice = useAppStore((s) => s.updateInvoice)
  const upsertFeeStructure = useAppStore((s) => s.upsertFeeStructure)
  const recordPayment = useAppStore((s) => s.recordPayment)
  const sendFeeReminders = useAppStore((s) => s.sendFeeReminders)
  const session = useAuthStore((s) => s.session)

  const [filter, setFilter] = useState<InvoiceStatus | 'all'>('all')
  const [payTarget, setPayTarget] = useState<Invoice | null>(null)
  const [payAmount, setPayAmount] = useState('')
  const [payMethod, setPayMethod] = useState<PaymentMethod>('cash')
  const [payInstalmentId, setPayInstalmentId] = useState<string>('')
  const [feeDrafts, setFeeDrafts] = useState<Record<string, FeeStructure>>({})

  const recordedBy = session?.userId ?? 'u-admin'
  const actorName = session?.name ?? 'Admin'

  const studentName = (id: string) => {
    const st = students.find((s) => s.id === id)
    return st ? studentFullName(st) : id
  }

  const totals = useMemo(() => {
    const totalDue = invoices.reduce((sum, inv) => sum + inv.amount, 0)
    const totalPaid = invoices.reduce((sum, inv) => sum + inv.paid, 0)
    const overdue = invoices.filter((inv) => inv.status === 'overdue')
    const collectionRate = totalDue > 0 ? Math.round((totalPaid / totalDue) * 100) : 0
    return {
      totalDue,
      totalPaid,
      outstanding: totalDue - totalPaid,
      overdueCount: overdue.length,
      overdueIds: overdue.map((i) => i.id),
      collectionRate,
    }
  }, [invoices])

  const revenueByClass = useMemo(
    () =>
      classes.map((c) => {
        const classInvoices = invoices.filter(
          (inv) => inv.classId === c.id || students.find((s) => s.id === inv.studentId)?.classId === c.id,
        )
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

  const getFeeDraft = (f: FeeStructure) => feeDrafts[f.id] ?? f

  const openPay = (inv: Invoice) => {
    setPayTarget(inv)
    const unpaid = unpaidInstalments(inv)
    const first = unpaid[0]
    setPayInstalmentId(first?.id ?? '')
    setPayAmount(String(first ? first.amount - first.paid : inv.amount - inv.paid))
    setPayMethod('cash')
  }

  const savePayment = () => {
    if (!payTarget) return
    const amount = Number(payAmount)
    if (Number.isNaN(amount) || amount <= 0) {
      toast.error('Enter a valid payment amount.')
      return
    }
    const record = recordPayment({
      invoiceId: payTarget.id,
      amount,
      method: payMethod,
      instalmentId: payInstalmentId || undefined,
      recordedBy,
    })
    if (!record) {
      toast.error('Could not record payment.')
      return
    }
    toast.success(`Payment recorded for ${studentName(payTarget.studentId)}.`, {
      description: `${formatCurrency(amount)} via ${payMethod.replace('_', ' ')} · ${record.reference}`,
    })
    setPayTarget(null)
  }

  const markPaid = (inv: Invoice) => {
    if (inv.instalments?.length) {
      updateInvoice(inv.id, {
        instalments: inv.instalments.map((i) => ({ ...i, paid: i.amount, status: 'paid' as const })),
        paid: inv.amount,
        status: 'paid',
      })
    } else {
      updateInvoice(inv.id, { paid: inv.amount, status: 'paid' })
    }
    toast.success(`Invoice marked as paid for ${studentName(inv.studentId)}.`)
  }

  const sendReminder = (inv: Invoice) => {
    const n = sendFeeReminders([inv.id], actorName)
    toast.success(`Fee reminder sent to guardian of ${studentName(inv.studentId)}.`, {
      description: `${n} reminder logged.`,
    })
  }

  const sendBulkReminders = () => {
    if (totals.overdueIds.length === 0) {
      toast.message('No overdue invoices to remind.')
      return
    }
    const n = sendFeeReminders(totals.overdueIds, actorName)
    toast.success(`Sent ${n} fee reminder${n === 1 ? '' : 's'} for overdue accounts.`)
  }

  const patchFeeDraft = (id: string, patch: Partial<FeeStructure>) => {
    const base = feeStructures.find((f) => f.id === id)
    if (!base) return
    setFeeDrafts((prev) => ({ ...prev, [id]: { ...(prev[id] ?? base), ...patch } }))
  }

  const saveFeeStructure = (id: string) => {
    const draft = feeDrafts[id] ?? feeStructures.find((f) => f.id === id)
    if (!draft) return
    const prev = feeStructures.find((f) => f.id === id)
    upsertFeeStructure(draft)
    setFeeDrafts((d) => {
      const next = { ...d }
      delete next[id]
      return next
    })
    toast.success('Fee structure saved.')
    if (prev && prev.instalmentCount !== draft.instalmentCount) {
      toast.message('Instalment plan updated', {
        description: 'Changes apply to future invoices — existing invoices keep their current plan.',
      })
    }
  }

  return (
    <div>
      <PageHeader title="Financials" description="Track invoices, collections, fee structures, and reminders." />

      <Tabs defaultValue="overview">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="invoices">Invoices</TabsTrigger>
          <TabsTrigger value="structures">Fee Structures</TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <StatCard
              label="Collection rate"
              value={`${totals.collectionRate}%`}
              icon={Percent}
              accent="bg-forest-50 text-forest-700"
              hint={`${formatCurrency(totals.totalPaid)} of ${formatCurrency(totals.totalDue)}`}
            />
            <StatCard
              label="Total outstanding"
              value={formatCurrency(totals.outstanding)}
              icon={CircleDollarSign}
              accent="bg-gold-50 text-gold-800"
            />
            <StatCard
              label="Overdue invoices"
              value={totals.overdueCount}
              icon={Bell}
              accent="bg-red-50 text-red-700"
            />
            <StatCard
              label="Total collected"
              value={formatCurrency(totals.totalPaid)}
              icon={Banknote}
              accent="bg-navy-50 text-navy-700"
            />
          </div>

          <Card className="mt-6">
            <CardHeader className="flex flex-row flex-wrap items-center justify-between gap-2">
              <div>
                <CardTitle>Collections by class</CardTitle>
                <CardDescription>Expected vs collected fee totals.</CardDescription>
              </div>
              <Button onClick={sendBulkReminders} disabled={totals.overdueCount === 0}>
                <Bell className="mr-2 h-4 w-4" />
                Send Reminder ({totals.overdueCount} overdue)
              </Button>
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
        </TabsContent>

        <TabsContent value="invoices">
          <Card>
            <CardHeader className="flex flex-row flex-wrap items-center justify-between gap-2">
              <CardTitle>Invoices</CardTitle>
              <div className="flex flex-wrap gap-1.5">
                {STATUS_FILTERS.map((f) => (
                  <Button
                    key={f}
                    size="sm"
                    variant={filter === f ? 'default' : 'outline'}
                    onClick={() => setFilter(f)}
                    className="capitalize"
                  >
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
                      <th className="px-4 py-2 font-semibold text-muted-foreground">Instalments</th>
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
                        <td colSpan={8} className="px-4 py-8 text-center text-muted-foreground">
                          No invoices match this filter.
                        </td>
                      </tr>
                    ) : (
                      filtered.map((inv) => {
                        const unpaid = unpaidInstalments(inv)
                        const instSummary = inv.instalments?.length
                          ? `${inv.instalments.filter((i) => i.paid >= i.amount).length}/${inv.instalments.length} paid`
                          : 'Lump sum'
                        return (
                          <tr key={inv.id} className="border-b last:border-0">
                            <td className="px-4 py-2 font-medium">{studentName(inv.studentId)}</td>
                            <td className="px-4 py-2 text-muted-foreground">{inv.description}</td>
                            <td className="px-4 py-2">
                              <span className="text-xs">{instSummary}</span>
                              {unpaid.length > 0 && (
                                <p className="text-[11px] text-muted-foreground">
                                  Next: {unpaid[0].label} ({formatCurrency(unpaid[0].amount - unpaid[0].paid)})
                                </p>
                              )}
                            </td>
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
                                  {inv.status !== 'paid' && (
                                    <DropdownMenuItem onClick={() => openPay(inv)}>
                                      <Banknote className="mr-2 h-3.5 w-3.5" /> Record payment
                                    </DropdownMenuItem>
                                  )}
                                  {inv.status !== 'paid' && (
                                    <DropdownMenuItem onClick={() => sendReminder(inv)}>
                                      <Bell className="mr-2 h-3.5 w-3.5" /> Send fee reminder
                                    </DropdownMenuItem>
                                  )}
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </td>
                          </tr>
                        )
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="structures">
          <Card>
            <CardHeader>
              <CardTitle>Fee structures</CardTitle>
              <CardDescription>
                Set term tuition, instalment count (1 = lump sum, 3 = three instalments). Changes apply to future
                invoices.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto rounded-lg border">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b bg-muted/50 text-left">
                      <th className="px-4 py-2 font-semibold text-muted-foreground">Class</th>
                      <th className="px-4 py-2 font-semibold text-muted-foreground">Term</th>
                      <th className="px-4 py-2 font-semibold text-muted-foreground">Amount</th>
                      <th className="px-4 py-2 font-semibold text-muted-foreground">Instalments</th>
                      <th className="px-4 py-2 font-semibold text-muted-foreground">3-way split preview</th>
                      <th className="px-4 py-2 font-semibold text-muted-foreground" />
                    </tr>
                  </thead>
                  <tbody>
                    {feeStructures.map((f) => {
                      const draft = getFeeDraft(f)
                      const className = classes.find((c) => c.id === draft.classId)?.name ?? draft.classId
                      const split = instalmentSplitPreview(draft.amount, 3)
                      return (
                        <tr key={f.id} className="border-b last:border-0 align-top">
                          <td className="px-4 py-3 font-medium">{className}</td>
                          <td className="px-4 py-3">
                            <Input
                              value={draft.term}
                              onChange={(e) => patchFeeDraft(f.id, { term: e.target.value })}
                              className="h-9 w-36"
                            />
                          </td>
                          <td className="px-4 py-3">
                            <Input
                              type="number"
                              min={0}
                              value={draft.amount}
                              onChange={(e) => patchFeeDraft(f.id, { amount: Number(e.target.value) || 0 })}
                              className="h-9 w-28"
                            />
                          </td>
                          <td className="px-4 py-3">
                            <Select
                              value={String(draft.instalmentCount)}
                              onChange={(e) =>
                                patchFeeDraft(f.id, { instalmentCount: Number(e.target.value) as 1 | 3 })
                              }
                              className="h-9 w-28"
                            >
                              <option value="1">1 (lump)</option>
                              <option value="3">3</option>
                            </Select>
                          </td>
                          <td className="px-4 py-3 text-xs text-muted-foreground">
                            {split.map((a, i) => (
                              <div key={i}>
                                Inst {i + 1}: {formatCurrency(a)}
                              </div>
                            ))}
                          </td>
                          <td className="px-4 py-3">
                            <Button size="sm" onClick={() => saveFeeStructure(f.id)}>
                              <Save className="mr-1.5 h-3.5 w-3.5" /> Save
                            </Button>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <Dialog open={!!payTarget} onOpenChange={(v) => !v && setPayTarget(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Record payment</DialogTitle>
            <DialogDescription>
              {payTarget &&
                `Cash or bank transfer for ${studentName(payTarget.studentId)} — ${payTarget.description}.`}
            </DialogDescription>
          </DialogHeader>
          {payTarget && (
            <div className="space-y-4">
              {payTarget.instalments && payTarget.instalments.length > 0 && (
                <div className="space-y-1.5">
                  <Label>Instalment</Label>
                  <Select
                    value={payInstalmentId}
                    onChange={(e) => {
                      const id = e.target.value
                      setPayInstalmentId(id)
                      const inst = payTarget.instalments?.find((i) => i.id === id)
                      if (inst) setPayAmount(String(inst.amount - inst.paid))
                    }}
                  >
                    <option value="">Invoice balance ({formatCurrency(payTarget.amount - payTarget.paid)})</option>
                    {unpaidInstalments(payTarget).map((inst) => (
                      <option key={inst.id} value={inst.id}>
                        {inst.label} — {formatCurrency(inst.amount - inst.paid)} due
                      </option>
                    ))}
                  </Select>
                </div>
              )}
              <div className="space-y-1.5">
                <Label>Amount</Label>
                <Input type="number" min={0} value={payAmount} onChange={(e) => setPayAmount(e.target.value)} />
              </div>
              <div className="space-y-1.5">
                <Label>Payment method</Label>
                <PaymentMethodPicker
                  value={payMethod}
                  onChange={setPayMethod}
                  allowed={['cash', 'bank_transfer']}
                />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setPayTarget(null)}>
              Cancel
            </Button>
            <Button onClick={savePayment}>Record payment</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
