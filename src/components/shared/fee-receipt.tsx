import type { PaymentMethod, Student } from '@/data/types'
import { SchoolCrest } from '@/components/shared/brand'
import { paymentMethodLabel } from '@/lib/fees'
import { formatCurrency, formatDate, cn } from '@/lib/utils'
import { studentFullName } from '@/data/mock-data'

export interface FeeReceiptProps {
  student: Student
  description: string
  term: string
  amount: number
  method: PaymentMethod
  reference: string
  paidAt: string
  instalmentLabel?: string
  schoolName?: string
  className?: string
}

/** Branded printable/downloadable fee receipt — use with window.print() + .print-area */
export function FeeReceipt({
  student,
  description,
  term,
  amount,
  method,
  reference,
  paidAt,
  instalmentLabel,
  schoolName = 'Westwood College',
  className,
}: FeeReceiptProps) {
  return (
    <div className={cn('print-area rounded-lg border bg-card p-6 shadow-soft sm:p-8', className)}>
      <div className="flex items-center justify-between border-b border-gold-400/40 pb-4">
        <div className="flex items-center gap-3">
          <SchoolCrest size="md" />
          <div>
            <p className="font-display text-xl font-semibold text-navy-900">{schoolName}</p>
            <p className="text-[11px] uppercase tracking-[0.18em] text-gold-700">Visus Manifestus.</p>
          </div>
        </div>
        <div className="text-right">
          <p className="font-display text-lg font-semibold text-navy-800">Official Fee Receipt</p>
          <p className="text-xs text-muted-foreground">{reference}</p>
        </div>
      </div>

      <div className="mt-5 grid gap-3 text-sm sm:grid-cols-2">
        <div>
          <p className="text-xs text-muted-foreground">Received from</p>
          <p className="font-medium">{studentFullName(student)}</p>
          <p className="text-xs text-muted-foreground">{student.admissionNo}</p>
        </div>
        <div>
          <p className="text-xs text-muted-foreground">Date paid</p>
          <p className="font-medium">{formatDate(paidAt.includes('T') ? paidAt : `${paidAt}T12:00:00`, 'dd MMM yyyy HH:mm')}</p>
        </div>
        <div>
          <p className="text-xs text-muted-foreground">Description</p>
          <p className="font-medium">{description}</p>
          {instalmentLabel && <p className="text-xs text-muted-foreground">{instalmentLabel}</p>}
        </div>
        <div>
          <p className="text-xs text-muted-foreground">Term</p>
          <p className="font-medium">{term}</p>
        </div>
        <div>
          <p className="text-xs text-muted-foreground">Payment method</p>
          <p className="font-medium">{paymentMethodLabel(method)}</p>
        </div>
        <div>
          <p className="text-xs text-muted-foreground">Amount received</p>
          <p className="font-display text-2xl font-semibold text-forest-700">{formatCurrency(amount)}</p>
        </div>
      </div>

      <p className="mt-6 rounded-md bg-muted px-3 py-2 text-xs text-muted-foreground">
        This is an official receipt from Westwood College Accounts. Keep for your records.
        For queries contact accounts@westwood.co.zw · +263 242 885 120.
      </p>

      <div className="mt-8 grid grid-cols-2 gap-8 text-sm">
        <div className="border-t pt-2 text-muted-foreground">Accounts Officer</div>
        <div className="border-t pt-2 text-muted-foreground">School Stamp</div>
      </div>
    </div>
  )
}
