import { CheckCircle2, Landmark, Banknote, Smartphone } from 'lucide-react'
import type { PaymentMethod } from '@/data/types'
import { PAYMENT_METHODS } from '@/lib/fees'
import { cn } from '@/lib/utils'

const icons: Record<PaymentMethod, typeof Smartphone> = {
  ecocash: Smartphone,
  onemoney: Smartphone,
  bank_transfer: Landmark,
  cash: Banknote,
}

export function PaymentMethodPicker({
  value,
  onChange,
  allowed,
}: {
  value?: PaymentMethod
  onChange: (m: PaymentMethod) => void
  allowed?: PaymentMethod[]
}) {
  const methods = PAYMENT_METHODS.filter((m) => !allowed || allowed.includes(m.id))
  return (
    <div className="grid gap-3 sm:grid-cols-2">
      {methods.map((m) => {
        const Icon = icons[m.id]
        const selected = value === m.id
        return (
          <button
            key={m.id}
            type="button"
            onClick={() => onChange(m.id)}
            className={cn(
              'flex items-start gap-3 rounded-lg border-2 p-3 text-left transition-all',
              m.accent,
              selected && 'ring-2 ring-gold-500 border-gold-500',
            )}
          >
            <div className={cn('rounded-md px-2 py-1 text-[10px] font-bold uppercase tracking-wide', m.badge)}>
              {m.shortLabel}
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <Icon className="h-4 w-4 shrink-0" />
                <span className="font-semibold text-sm">{m.label}</span>
                {selected && <CheckCircle2 className="ml-auto h-4 w-4 text-forest-600" />}
              </div>
              <p className="mt-1 text-xs text-muted-foreground">{m.description}</p>
            </div>
          </button>
        )
      })}
    </div>
  )
}

export function PaymentMethodBadge({ method }: { method: PaymentMethod }) {
  const m = PAYMENT_METHODS.find((x) => x.id === method)
  if (!m) return null
  return <span className={cn('inline-flex rounded px-2 py-0.5 text-[10px] font-bold uppercase', m.badge)}>{m.shortLabel}</span>
}
