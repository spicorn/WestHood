import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import {
  Bell,
  ChevronDown,
  LogOut,
  Menu,
  Search,
  Settings,
  User,
  X,
  type LucideIcon,
} from 'lucide-react'
import { useState } from 'react'
import { Wordmark } from '@/components/shared/brand'
import { Avatar } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { roleAccentClass, roleHome, roleLabels, useAuthStore } from '@/stores/auth-store'
import { useAppStore } from '@/stores/app-store'
import { cn } from '@/lib/utils'
import { CommandPalette } from '@/components/shared/command-palette'
import type { Role } from '@/data/types'

export interface NavItem {
  to: string
  label: string
  icon: LucideIcon
}

export function AppShell({ nav, role }: { nav: NavItem[]; role: Role }) {
  const session = useAuthStore((s) => s.session)!
  const logout = useAuthStore((s) => s.logout)
  const navigate = useNavigate()
  const [mobileOpen, setMobileOpen] = useState(false)
  const [cmdOpen, setCmdOpen] = useState(false)
  const notifications = useAppStore((s) => s.notifications)
  const markRead = useAppStore((s) => s.markNotificationsRead)
  const roleNotifs = notifications.filter((n) => n.role === role || n.role === 'all')
  const unread = roleNotifs.filter((n) => !n.read).length

  const doLogout = () => {
    logout()
    navigate('/login')
  }

  const Sidebar = ({ onNavigate }: { onNavigate?: () => void }) => (
    <div className="flex h-full flex-col">
      <div className="border-b border-white/10 p-4">
        <Wordmark compact />
      </div>
      <nav className="flex-1 space-y-0.5 overflow-y-auto p-3">
        {nav.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.to === roleHome(role)}
            onClick={onNavigate}
            className={({ isActive }) =>
              cn(
                'flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium transition-colors',
                isActive
                  ? 'bg-white/10 text-gold-300'
                  : 'text-navy-100/80 hover:bg-white/5 hover:text-white',
              )
            }
          >
            <item.icon className="h-4 w-4 shrink-0" />
            {item.label}
          </NavLink>
        ))}
      </nav>
      <div className="border-t border-white/10 p-3">
        <button
          type="button"
          onClick={doLogout}
          className="flex w-full items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium text-navy-100/80 hover:bg-white/5 hover:text-white"
        >
          <LogOut className="h-4 w-4" />
          Logout
        </button>
      </div>
    </div>
  )

  return (
    <div className={cn('min-h-screen', roleAccentClass[role])}>
      <div className="flex min-h-screen">
        <aside className="no-print hidden w-64 shrink-0 bg-navy-800 text-white lg:block">
          <Sidebar />
        </aside>

        <AnimatePresence>
          {mobileOpen && (
            <>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-40 bg-navy-950/50 lg:hidden"
                onClick={() => setMobileOpen(false)}
              />
              <motion.aside
                initial={{ x: -280 }}
                animate={{ x: 0 }}
                exit={{ x: -280 }}
                transition={{ type: 'spring', damping: 28, stiffness: 320 }}
                className="fixed inset-y-0 left-0 z-50 w-64 bg-navy-800 text-white lg:hidden"
              >
                <div className="absolute right-2 top-2">
                  <Button variant="ghost" size="icon" className="text-white hover:bg-white/10" onClick={() => setMobileOpen(false)}>
                    <X className="h-5 w-5" />
                  </Button>
                </div>
                <Sidebar onNavigate={() => setMobileOpen(false)} />
              </motion.aside>
            </>
          )}
        </AnimatePresence>

        <div className="flex min-w-0 flex-1 flex-col">
          <header className="no-print sticky top-0 z-30 flex h-14 items-center gap-3 border-b bg-card/90 px-4 backdrop-blur">
            <Button variant="ghost" size="icon" className="lg:hidden" onClick={() => setMobileOpen(true)}>
              <Menu className="h-5 w-5" />
            </Button>
            <div className="hidden sm:block">
              <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                {roleLabels[role]}
              </span>
            </div>
            <div className="ml-auto flex items-center gap-1 sm:gap-2">
              {(role === 'admin' || role === 'staff') && (
                <Button variant="outline" size="sm" className="hidden md:inline-flex gap-2" onClick={() => setCmdOpen(true)}>
                  <Search className="h-3.5 w-3.5" />
                  Search
                  <kbd className="rounded border bg-muted px-1 text-[10px]">⌘K</kbd>
                </Button>
              )}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="relative">
                    <Bell className="h-5 w-5" />
                    {unread > 0 && (
                      <span className="absolute right-1 top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-gold-500 px-1 text-[10px] font-bold text-navy-900">
                        {unread}
                      </span>
                    )}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-80">
                  <DropdownMenuLabel className="flex items-center justify-between">
                    Notifications
                    <button type="button" className="text-xs font-normal text-primary" onClick={() => markRead(role)}>
                      Mark all read
                    </button>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  {roleNotifs.slice(0, 6).map((n) => (
                    <DropdownMenuItem
                      key={n.id}
                      className="flex flex-col items-start gap-0.5 py-2"
                      onClick={() => n.href && navigate(n.href)}
                    >
                      <span className={cn('text-sm font-medium', !n.read && 'text-navy-800')}>{n.title}</span>
                      <span className="text-xs text-muted-foreground line-clamp-2">{n.body}</span>
                      <span className="text-[10px] text-muted-foreground">{n.time}</span>
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button type="button" className="flex items-center gap-2 rounded-md px-2 py-1.5 hover:bg-muted">
                    <Avatar name={session.name} size="sm" />
                    <div className="hidden text-left sm:block">
                      <p className="text-sm font-medium leading-none">{session.name}</p>
                      <p className="text-[11px] text-muted-foreground">{roleLabels[role]}</p>
                    </div>
                    <ChevronDown className="hidden h-4 w-4 text-muted-foreground sm:block" />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuLabel>
                    <p>{session.name}</p>
                    <p className="text-xs font-normal text-muted-foreground">{session.email}</p>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => navigate(`/${role}/profile`)}>
                    <User className="mr-2 h-4 w-4" /> My Profile
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => navigate(`/${role}/settings`)}>
                    <Settings className="mr-2 h-4 w-4" /> Settings
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={doLogout}>
                    <LogOut className="mr-2 h-4 w-4" /> Logout
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </header>

          <main className="flex-1 p-4 sm:p-6">
            <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.2 }}>
              <Outlet />
            </motion.div>
          </main>
        </div>
      </div>
      {(role === 'admin' || role === 'staff') && <CommandPalette open={cmdOpen} onOpenChange={setCmdOpen} />}
    </div>
  )
}
