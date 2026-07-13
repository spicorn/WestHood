import { ChevronDown, Users } from 'lucide-react'
import { useAppStore } from '@/stores/app-store'
import { useParentChildren } from '@/hooks/use-parent'
import { studentFullName } from '@/data/mock-data'
import { Avatar } from '@/components/ui/tabs'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { cn } from '@/lib/utils'

export function ChildSwitcher({ className }: { className?: string }) {
  const children = useParentChildren()
  const classes = useAppStore((s) => s.classes)
  const selectedChildId = useAppStore((s) => s.selectedChildId)
  const setSelectedChildId = useAppStore((s) => s.setSelectedChildId)

  const selected = children.find((c) => c.id === selectedChildId) ?? children[0]

  if (!selected) return null

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          className={cn(
            'flex items-center gap-3 rounded-lg border bg-card px-3 py-2 shadow-soft transition-colors hover:bg-muted/60',
            className,
          )}
        >
          <Avatar name={studentFullName(selected)} size="sm" />
          <div className="text-left">
            <p className="text-[11px] leading-none text-muted-foreground">Viewing</p>
            <p className="text-sm font-semibold leading-tight text-navy-900">{studentFullName(selected)}</p>
          </div>
          {children.length > 1 && <ChevronDown className="h-4 w-4 text-muted-foreground" />}
        </button>
      </DropdownMenuTrigger>
      {children.length > 1 && (
        <DropdownMenuContent align="start" className="w-64">
          <DropdownMenuLabel className="flex items-center gap-2">
            <Users className="h-3.5 w-3.5" /> Switch child
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          {children.map((child) => {
            const classRoom = classes.find((c) => c.id === child.classId)
            return (
              <DropdownMenuItem key={child.id} onClick={() => setSelectedChildId(child.id)} className="gap-2 py-2">
                <Avatar name={studentFullName(child)} size="sm" />
                <div className="flex-1">
                  <p className="text-sm font-medium">{studentFullName(child)}</p>
                  <p className="text-xs text-muted-foreground">{classRoom?.name ?? child.classId}</p>
                </div>
                {child.id === selectedChildId && <span className="h-2 w-2 shrink-0 rounded-full bg-gold-500" />}
              </DropdownMenuItem>
            )
          })}
        </DropdownMenuContent>
      )}
    </DropdownMenu>
  )
}
