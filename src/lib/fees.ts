import type { FeeInstalment, Invoice, InvoiceStatus, PaymentMethod } from '@/data/types'
import { DEMO_TODAY } from '@/data/mock-data'

export const PAYMENT_METHODS: {
  id: PaymentMethod
  label: string
  shortLabel: string
  description: string
  mobile: boolean
  accent: string
  badge: string
}[] = [
  {
    id: 'ecocash',
    label: 'EcoCash',
    shortLabel: 'EcoCash',
    description: 'Pay via EcoCash mobile money — confirm on your phone',
    mobile: true,
    accent: 'border-red-300 bg-red-50 hover:border-red-500',
    badge: 'bg-[#E31837] text-white',
  },
  {
    id: 'onemoney',
    label: 'OneMoney',
    shortLabel: 'OneMoney',
    description: 'Pay via NetOne OneMoney — confirm on your phone',
    mobile: true,
    accent: 'border-amber-300 bg-amber-50 hover:border-amber-500',
    badge: 'bg-[#F5A623] text-navy-900',
  },
  {
    id: 'bank_transfer',
    label: 'Bank Transfer',
    shortLabel: 'Bank',
    description: 'Transfer to Westwood College fees account',
    mobile: false,
    accent: 'border-navy-300 bg-navy-50 hover:border-navy-500',
    badge: 'bg-navy-700 text-white',
  },
  {
    id: 'cash',
    label: 'Cash (at Accounts)',
    shortLabel: 'Cash',
    description: 'Recorded by school accounts office',
    mobile: false,
    accent: 'border-forest-300 bg-forest-50 hover:border-forest-500',
    badge: 'bg-forest-700 text-white',
  },
]

export function invoiceStatusFromPaid(paid: number, amount: number, dueDate: string): InvoiceStatus {
  const isPastDue = new Date(dueDate) < new Date(DEMO_TODAY)
  if (paid >= amount) return 'paid'
  if (paid > 0) return isPastDue ? 'overdue' : 'partial'
  return isPastDue ? 'overdue' : 'outstanding'
}

export function syncInvoiceTotals(invoice: Invoice): Invoice {
  if (!invoice.instalments?.length) {
    return {
      ...invoice,
      status: invoiceStatusFromPaid(invoice.paid, invoice.amount, invoice.dueDate),
    }
  }
  const instalments = invoice.instalments.map((inst) => ({
    ...inst,
    status: invoiceStatusFromPaid(inst.paid, inst.amount, inst.dueDate),
  }))
  const paid = instalments.reduce((sum, i) => sum + i.paid, 0)
  const lastDue = instalments[instalments.length - 1]?.dueDate ?? invoice.dueDate
  return {
    ...invoice,
    instalments,
    paid,
    status: invoiceStatusFromPaid(paid, invoice.amount, lastDue),
  }
}

export function applyPaymentToInvoice(
  invoice: Invoice,
  amount: number,
  instalmentId?: string,
): Invoice {
  if (invoice.instalments?.length) {
    const targetId =
      instalmentId ??
      invoice.instalments.find((i) => i.paid < i.amount)?.id ??
      invoice.instalments[invoice.instalments.length - 1].id
    const instalments = invoice.instalments.map((inst) => {
      if (inst.id !== targetId) return inst
      const paid = Math.min(inst.amount, inst.paid + amount)
      return { ...inst, paid }
    })
    return syncInvoiceTotals({ ...invoice, instalments })
  }
  const paid = Math.min(invoice.amount, invoice.paid + amount)
  return syncInvoiceTotals({ ...invoice, paid })
}

export function unpaidInstalments(invoice: Invoice): FeeInstalment[] {
  return (invoice.instalments ?? []).filter((i) => i.paid < i.amount)
}

export function paymentMethodLabel(method: PaymentMethod) {
  return PAYMENT_METHODS.find((m) => m.id === method)?.label ?? method
}

export function makeReceiptRef(method: PaymentMethod) {
  const prefix =
    method === 'ecocash' ? 'ECO' : method === 'onemoney' ? 'OM' : method === 'bank_transfer' ? 'BT' : 'CASH'
  return `${prefix}-WW-${Math.floor(10000 + Math.random() * 89999)}`
}
