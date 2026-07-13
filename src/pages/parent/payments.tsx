import { useMemo, useState } from 'react'
import { toast } from 'sonner'
import { Download, Loader2, Printer, Receipt, Smartphone, Wallet } from 'lucide-react'
import { useAppStore } from '@/stores/app-store'
import { useAuthStore } from '@/stores/auth-store'
import { useParentChildren, useSelectedChild } from '@/hooks/use-parent'
import { studentFullName } from '@/data/mock-data'
import type { Invoice, PaymentMethod, PaymentRecord } from '@/data/types'
import { unpaidInstalments } from '@/lib/fees'
import { ChildSwitcher } from '@/components/parent/child-switcher'
import { PageHeader, StatCard, EmptyState } from '@/components/shared/empty-state'
import { PaymentMethodPicker, PaymentMethodBadge } from '@/components/shared/payment-method-picker'
import { FeeReceipt } from '@/components/shared/fee-receipt'
import { Card, CardContent, CardHeader, CardTitle, CardDescription, Badge } from '@/components/ui/card'
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
import { formatCurrency, formatDate } from '@/lib/utils'

const statusVariant: Record<Invoice['status'], 'success' | 'warning' | 'outline' | 'danger'> = {
  paid: 'success',
  partial: 'warning',
  outstanding: 'outline',
  overdue: 'danger',
}

type PayStep = 'amount' | 'method' | 'confirm' | 'success'

const PARENT_METHODS: PaymentMethod[] = ['ecocash', 'onemoney', 'bank_transfer']

export default function ParentPaymentsPage() {
  const child = useSelectedChild()
  const children = useParentChildren()
  const invoices = useAppStore((s) => s.invoices)
  const paymentRecords = useAppStore((s) => s.paymentRecords)
  const students = useAppStore((s) => s.students)
  const settings = useAppStore((s) => s.settings)
  const recordPayment = useAppStore((s) => s.recordPayment)
  const session = useAuthStore((s) => s.session)

  const [payInvoice, setPayInvoice] = useState<Invoice | null>(null)
  const [step, setStep] = useState<PayStep>('amount')
  const [instalmentId, setInstalmentId] = useState<string>('balance')
  const [method, setMethod] = useState<PaymentMethod>('ecocash')
  const [mobile, setMobile] = useState('')
  const [pending, setPending] = useState(false)
  const [receipt, setReceipt] = useState<PaymentRecord | null>(null)
  const [viewReceipt, setViewReceipt] = useState<PaymentRecord | null>(null)

  const childInvoices = useMemo(
    () => invoices.filter((i) => child && i.studentId === child.id),
    [invoices, child],
  )

  const childPayments = useMemo(
    () =>
      paymentRecords.filter((p) => {
        const inv = invoices.find((i) => i.id === p.invoiceId)
        return inv && child && inv.studentId === child.id
      }),
    [paymentRecords, invoices, child],
  )

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

  const payAmount = useMemo(() => {
    if (!payInvoice) return 0
    if (instalmentId === 'balance') return payInvoice.amount - payInvoice.paid
    const inst = payInvoice.instalments?.find((i) => i.id === instalmentId)
    return inst ? inst.amount - inst.paid : 0
  }, [payInvoice, instalmentId])

  const openPay = (inv: Invoice) => {
    const unpaid = unpaidInstalments(inv)
    setPayInvoice(inv)
    setInstalmentId(unpaid[0]?.id ?? 'balance')
    setMethod('ecocash')
    setMobile('')
    setPending(false)
    setReceipt(null)
    setStep('amount')
  }

  const closePay = () => {
    setPayInvoice(null)
    setPending(false)
    setReceipt(null)
    setStep('amount')
  }

  const completePayment = () => {
    if (!payInvoice || payAmount <= 0) return
    const record = recordPayment({
      invoiceId: payInvoice.id,
      amount: payAmount,
      method,
      instalmentId: instalmentId === 'balance' ? undefined : instalmentId,
      recordedBy: session?.userId ?? 'u-parent',
      mobileNumber: method === 'ecocash' || method === 'onemoney' ? mobile : undefined,
    })
    if (!record) {
      toast.error('Payment could not be recorded.')
      return
    }
    setReceipt(record)
    setStep('success')
    toast.success('Payment successful', { description: record.reference })
  }

  const confirmMobilePay = () => {
    if (!mobile.trim() || mobile.trim().length < 9) {
      toast.error('Enter a valid mobile number.')
      return
    }
    setPending(true)
    window.setTimeout(() => {
      setPending(false)
      completePayment()
    }, 2500)
  }

  const receiptStudent = (rec: PaymentRecord) => {
    const inv = invoices.find((i) => i.id === rec.invoiceId)
    return students.find((s) => s.id === inv?.studentId)
  }

  const receiptInvoice = (rec: PaymentRecord) => invoices.find((i) => i.id === rec.invoiceId)

  const printReceipt = () => window.print()

  if (!child) return <EmptyState title="No children linked" description="No students are linked to your account yet." />

  return (
    <div>
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <PageHeader
          title="Payments"
          description="Fee invoices for your selected child, plus a combined statement for all your children."
        />
        <ChildSwitcher />
      </div>

      <div className="mb-6 grid gap-4 sm:grid-cols-3">
        <StatCard
          label={`${child.firstName}'s balance`}
          value={formatCurrency(childInvoices.reduce((s, i) => s + (i.amount - i.paid), 0))}
          icon={Wallet}
          accent="bg-navy-50 text-navy-700"
        />
        <StatCard
          label="Total paid (all children)"
          value={formatCurrency(combinedTotals.paid)}
          icon={Receipt}
          accent="bg-forest-50 text-forest-700"
        />
        <StatCard
          label="Combined balance due"
          value={formatCurrency(combinedTotals.balance)}
          icon={Wallet}
          accent={combinedTotals.balance > 0 ? 'bg-red-50 text-red-700' : 'bg-forest-50 text-forest-700'}
        />
      </div>

      <h3 className="mb-3 font-display text-lg font-semibold text-navy-900">{child.firstName}&apos;s invoices</h3>
      {childInvoices.length === 0 ? (
        <EmptyState title="No invoices" description="No fee invoices have been issued for this child yet." />
      ) : (
        <div className="space-y-4">
          {childInvoices.map((inv) => (
            <Card key={inv.id}>
              <CardHeader className="flex flex-row flex-wrap items-start justify-between gap-3 pb-2">
                <div>
                  <CardTitle className="text-base">{inv.description}</CardTitle>
                  <CardDescription>
                    {inv.term} · Due {formatDate(inv.dueDate)}
                  </CardDescription>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <Badge variant={statusVariant[inv.status]}>{inv.status}</Badge>
                  {inv.status !== 'paid' && (
                    <Button size="sm" onClick={() => openPay(inv)}>
                      Pay Now
                    </Button>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                <div className="mb-3 flex flex-wrap gap-4 text-sm">
                  <span>
                    Billed: <strong>{formatCurrency(inv.amount)}</strong>
                  </span>
                  <span>
                    Paid: <strong>{formatCurrency(inv.paid)}</strong>
                  </span>
                  <span>
                    Balance: <strong>{formatCurrency(inv.amount - inv.paid)}</strong>
                  </span>
                </div>
                {inv.instalments && inv.instalments.length > 0 ? (
                  <div className="overflow-x-auto rounded-lg border">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b bg-muted/50 text-left">
                          <th className="px-3 py-2 font-semibold text-muted-foreground">Instalment</th>
                          <th className="px-3 py-2 font-semibold text-muted-foreground">Amount</th>
                          <th className="px-3 py-2 font-semibold text-muted-foreground">Paid</th>
                          <th className="px-3 py-2 font-semibold text-muted-foreground">Due</th>
                          <th className="px-3 py-2 font-semibold text-muted-foreground">Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {inv.instalments.map((inst) => (
                          <tr key={inst.id} className="border-b last:border-0">
                            <td className="px-3 py-2 font-medium">{inst.label}</td>
                            <td className="px-3 py-2">{formatCurrency(inst.amount)}</td>
                            <td className="px-3 py-2">{formatCurrency(inst.paid)}</td>
                            <td className="px-3 py-2 text-muted-foreground">{formatDate(inst.dueDate)}</td>
                            <td className="px-3 py-2">
                              <Badge variant={statusVariant[inst.status]}>{inst.status}</Badge>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">Single lump-sum invoice (no instalment plan).</p>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {childPayments.length > 0 && (
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Payment receipts</CardTitle>
            <CardDescription>Download or print receipts for past payments.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto rounded-lg border">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b bg-muted/50 text-left">
                    <th className="px-4 py-2 font-semibold text-muted-foreground">Date</th>
                    <th className="px-4 py-2 font-semibold text-muted-foreground">Invoice</th>
                    <th className="px-4 py-2 font-semibold text-muted-foreground">Amount</th>
                    <th className="px-4 py-2 font-semibold text-muted-foreground">Method</th>
                    <th className="px-4 py-2 font-semibold text-muted-foreground">Reference</th>
                    <th className="px-4 py-2 font-semibold text-muted-foreground" />
                  </tr>
                </thead>
                <tbody>
                  {childPayments.map((p) => {
                    const inv = receiptInvoice(p)
                    return (
                      <tr key={p.id} className="border-b last:border-0">
                        <td className="px-4 py-2">{formatDate(p.paidAt.slice(0, 10))}</td>
                        <td className="px-4 py-2">{inv?.description ?? p.invoiceId}</td>
                        <td className="px-4 py-2">{formatCurrency(p.amount)}</td>
                        <td className="px-4 py-2">
                          <PaymentMethodBadge method={p.method} />
                        </td>
                        <td className="px-4 py-2 text-muted-foreground">{p.reference}</td>
                        <td className="px-4 py-2">
                          <Button size="sm" variant="outline" onClick={() => setViewReceipt(p)}>
                            <Download className="mr-1.5 h-3.5 w-3.5" /> Receipt
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

      {/* Pay Now multi-step */}
      <Dialog open={!!payInvoice} onOpenChange={(v) => !v && closePay()}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {step === 'success' ? 'Payment successful' : `Pay — ${payInvoice?.description ?? ''}`}
            </DialogTitle>
            <DialogDescription>
              {step === 'amount' && 'Choose what to pay.'}
              {step === 'method' && 'Select how you will pay.'}
              {step === 'confirm' && 'Confirm payment details.'}
              {step === 'success' && 'Your receipt is ready to download or print.'}
            </DialogDescription>
          </DialogHeader>

          {step === 'amount' && payInvoice && (
            <div className="space-y-3">
              <button
                type="button"
                onClick={() => setInstalmentId('balance')}
                className={`w-full rounded-lg border-2 p-3 text-left ${
                  instalmentId === 'balance' ? 'border-gold-500 ring-2 ring-gold-500' : 'border-border'
                }`}
              >
                <p className="font-semibold">Full outstanding balance</p>
                <p className="text-sm text-muted-foreground">{formatCurrency(payInvoice.amount - payInvoice.paid)}</p>
              </button>
              {unpaidInstalments(payInvoice).map((inst) => (
                <button
                  key={inst.id}
                  type="button"
                  onClick={() => setInstalmentId(inst.id)}
                  className={`w-full rounded-lg border-2 p-3 text-left ${
                    instalmentId === inst.id ? 'border-gold-500 ring-2 ring-gold-500' : 'border-border'
                  }`}
                >
                  <p className="font-semibold">{inst.label}</p>
                  <p className="text-sm text-muted-foreground">
                    {formatCurrency(inst.amount - inst.paid)} · due {formatDate(inst.dueDate)}
                  </p>
                </button>
              ))}
              <DialogFooter>
                <Button variant="outline" onClick={closePay}>
                  Cancel
                </Button>
                <Button disabled={payAmount <= 0} onClick={() => setStep('method')}>
                  Continue
                </Button>
              </DialogFooter>
            </div>
          )}

          {step === 'method' && (
            <div className="space-y-4">
              <p className="text-sm">
                Amount: <strong>{formatCurrency(payAmount)}</strong>
              </p>
              <PaymentMethodPicker value={method} onChange={setMethod} allowed={PARENT_METHODS} />
              <DialogFooter>
                <Button variant="outline" onClick={() => setStep('amount')}>
                  Back
                </Button>
                <Button onClick={() => setStep('confirm')}>Continue</Button>
              </DialogFooter>
            </div>
          )}

          {step === 'confirm' && (
            <div className="space-y-4">
              {(method === 'ecocash' || method === 'onemoney') && (
                <>
                  <div className="space-y-1.5">
                    <Label>Mobile number</Label>
                    <Input
                      placeholder="07XX XXX XXX"
                      value={mobile}
                      onChange={(e) => setMobile(e.target.value)}
                      disabled={pending}
                    />
                  </div>
                  {pending ? (
                    <div className="flex flex-col items-center gap-3 rounded-lg border bg-muted/40 py-8">
                      <Loader2 className="h-8 w-8 animate-spin text-navy-700" />
                      <div className="flex items-center gap-2 text-sm font-medium">
                        <Smartphone className="h-4 w-4" />
                        Confirm on your phone…
                      </div>
                      <p className="text-xs text-muted-foreground">Waiting for {method === 'ecocash' ? 'EcoCash' : 'OneMoney'} approval</p>
                    </div>
                  ) : (
                    <DialogFooter>
                      <Button variant="outline" onClick={() => setStep('method')}>
                        Back
                      </Button>
                      <Button onClick={confirmMobilePay}>Confirm on phone</Button>
                    </DialogFooter>
                  )}
                </>
              )}
              {method === 'bank_transfer' && (
                <>
                  <div className="rounded-lg border bg-navy-50/60 p-4 text-sm space-y-2">
                    <p className="font-semibold text-navy-900">Westwood College Fees Account</p>
                    <p>
                      Bank: <strong>CBZ Bank</strong>
                    </p>
                    <p>
                      Account name: <strong>Westwood College</strong>
                    </p>
                    <p>
                      Account no: <strong>01234567890123</strong>
                    </p>
                    <p>
                      Branch: <strong>Borrowdale</strong>
                    </p>
                    <p>
                      Reference: <strong>{child.admissionNo}</strong>
                    </p>
                    <p className="text-xs text-muted-foreground pt-1">
                      Transfer {formatCurrency(payAmount)}, then confirm below.
                    </p>
                  </div>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setStep('method')}>
                      Back
                    </Button>
                    <Button onClick={completePayment}>Confirm Paid</Button>
                  </DialogFooter>
                </>
              )}
            </div>
          )}

          {step === 'success' && receipt && payInvoice && child && (
            <div className="space-y-4">
              <FeeReceipt
                student={child}
                description={payInvoice.description}
                term={payInvoice.term}
                amount={receipt.amount}
                method={receipt.method}
                reference={receipt.reference}
                paidAt={receipt.paidAt}
                instalmentLabel={
                  instalmentId !== 'balance'
                    ? payInvoice.instalments?.find((i) => i.id === instalmentId)?.label
                    : undefined
                }
                schoolName={settings.name}
              />
              <DialogFooter className="no-print">
                <Button variant="outline" onClick={printReceipt}>
                  <Printer className="mr-1.5 h-3.5 w-3.5" /> Print
                </Button>
                <Button
                  onClick={() => {
                    printReceipt()
                    toast.success('Receipt ready — use your browser print dialog to save as PDF.')
                  }}
                >
                  <Download className="mr-1.5 h-3.5 w-3.5" /> Download
                </Button>
                <Button variant="secondary" onClick={closePay}>
                  Done
                </Button>
              </DialogFooter>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Past receipt viewer */}
      <Dialog open={!!viewReceipt} onOpenChange={(v) => !v && setViewReceipt(null)}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Fee receipt</DialogTitle>
          </DialogHeader>
          {viewReceipt &&
            (() => {
              const stu = receiptStudent(viewReceipt)
              const inv = receiptInvoice(viewReceipt)
              if (!stu || !inv) return <p className="text-sm text-muted-foreground">Receipt details unavailable.</p>
              const instLabel = inv.instalments?.find((i) => i.id === viewReceipt.instalmentId)?.label
              return (
                <>
                  <FeeReceipt
                    student={stu}
                    description={inv.description}
                    term={inv.term}
                    amount={viewReceipt.amount}
                    method={viewReceipt.method}
                    reference={viewReceipt.reference}
                    paidAt={viewReceipt.paidAt}
                    instalmentLabel={instLabel}
                    schoolName={settings.name}
                  />
                  <DialogFooter className="no-print">
                    <Button variant="outline" onClick={printReceipt}>
                      <Printer className="mr-1.5 h-3.5 w-3.5" /> Print
                    </Button>
                    <Button onClick={() => setViewReceipt(null)}>Close</Button>
                  </DialogFooter>
                </>
              )
            })()}
        </DialogContent>
      </Dialog>
    </div>
  )
}
