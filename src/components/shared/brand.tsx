import { cn } from '@/lib/utils'

export function SchoolCrest({ className, size = 'md' }: { className?: string; size?: 'sm' | 'md' | 'lg' }) {
  const sizes = { sm: 'h-8 w-8', md: 'h-11 w-11', lg: 'h-20 w-20' }
  return (
    <svg
      viewBox="0 0 64 64"
      className={cn(sizes[size], className)}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden
    >
      <rect width="64" height="64" rx="12" fill="#1E3A5F" />
      <path d="M32 10L48 18V30C48 40 40 48 32 52C24 48 16 40 16 30V18L32 10Z" fill="#2D5A3F" stroke="#D4A017" strokeWidth="2" />
      <path d="M32 18V46" stroke="#D4A017" strokeWidth="1.5" />
      <path d="M22 28H42" stroke="#D4A017" strokeWidth="1.5" />
      <circle cx="32" cy="28" r="4" fill="#D4A017" />
      <text x="32" y="58" textAnchor="middle" fill="#F5E9C8" fontSize="6" fontFamily="serif" fontWeight="600">
        WC
      </text>
    </svg>
  )
}

export function Wordmark({ compact = false, className }: { compact?: boolean; className?: string }) {
  return (
    <div className={cn('flex items-center gap-3', className)}>
      <SchoolCrest size={compact ? 'sm' : 'md'} />
      <div className="min-w-0">
        <p className="font-display text-lg font-semibold leading-tight text-navy-50 truncate">Westwood College</p>
        {!compact && <p className="text-[11px] tracking-[0.18em] uppercase text-gold-400/90">Visus Manifestus.</p>}
      </div>
    </div>
  )
}
