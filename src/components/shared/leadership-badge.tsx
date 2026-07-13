import { Crown, Star } from 'lucide-react'
import type { LeadershipRole } from '@/data/types'
import { LEADERSHIP_LABELS } from '@/data/mock-data'
import { cn } from '@/lib/utils'
import { Badge } from '@/components/ui/card'

export function LeadershipBadge({
  role,
  className,
  size = 'sm',
}: {
  role?: LeadershipRole | null
  className?: string
  size?: 'sm' | 'md'
}) {
  if (!role || role === 'none') return null
  const label = LEADERSHIP_LABELS[role]
  const Icon = role === 'head_boy' || role === 'head_girl' || role === 'deputy_head' ? Crown : Star
  return (
    <Badge
      variant="gold"
      className={cn(
        'inline-flex items-center gap-1 border-gold-400/60',
        size === 'md' && 'px-2.5 py-1 text-xs',
        className,
      )}
    >
      <Icon className={size === 'md' ? 'h-3.5 w-3.5' : 'h-3 w-3'} />
      {label}
    </Badge>
  )
}

export function EscalationBadge({ show, className }: { show?: boolean; className?: string }) {
  if (!show) return null
  return (
    <Badge variant="danger" className={cn('font-semibold', className)}>
      Flagged for follow-up
    </Badge>
  )
}
