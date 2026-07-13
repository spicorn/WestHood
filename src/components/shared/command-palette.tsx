import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Command } from 'cmdk'
import { BookOpen, GraduationCap, Users } from 'lucide-react'
import { useAppStore } from '@/stores/app-store'
import { studentFullName } from '@/data/mock-data'
import { Dialog, DialogContent } from '@/components/ui/dialog'

export function CommandPalette({ open, onOpenChange }: { open: boolean; onOpenChange: (v: boolean) => void }) {
  const navigate = useNavigate()
  const students = useAppStore((s) => s.students)
  const classes = useAppStore((s) => s.classes)
  const subjects = useAppStore((s) => s.subjects)
  const [q, setQ] = useState('')

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault()
        onOpenChange(!open)
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, onOpenChange])

  const go = (path: string) => {
    onOpenChange(false)
    navigate(path)
  }

  const filteredStudents = useMemo(
    () =>
      students
        .filter((s) => s.status === 'active')
        .filter((s) => studentFullName(s).toLowerCase().includes(q.toLowerCase()))
        .slice(0, 8),
    [students, q],
  )

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="overflow-hidden p-0 max-w-lg">
        <Command className="rounded-lg" shouldFilter={false}>
          <div className="flex items-center border-b px-3">
            <Command.Input
              value={q}
              onValueChange={setQ}
              placeholder="Search students, classes, subjects…"
              className="flex h-12 w-full rounded-md bg-transparent py-3 text-sm outline-none placeholder:text-muted-foreground"
            />
          </div>
          <Command.List className="max-h-80 overflow-y-auto p-2">
            <Command.Empty className="py-6 text-center text-sm text-muted-foreground">No results.</Command.Empty>
            <Command.Group heading="Students" className="text-xs font-semibold text-muted-foreground px-2 py-1.5">
              {filteredStudents.map((s) => (
                <Command.Item
                  key={s.id}
                  value={studentFullName(s)}
                  onSelect={() => go(`/admin/students/${s.id}`)}
                  className="flex cursor-pointer items-center gap-2 rounded-md px-2 py-2 text-sm aria-selected:bg-muted"
                >
                  <Users className="h-4 w-4 text-muted-foreground" />
                  {studentFullName(s)}
                  <span className="ml-auto text-xs text-muted-foreground">{s.admissionNo}</span>
                </Command.Item>
              ))}
            </Command.Group>
            <Command.Group heading="Classes" className="text-xs font-semibold text-muted-foreground px-2 py-1.5">
              {classes
                .filter((c) => c.name.toLowerCase().includes(q.toLowerCase()))
                .map((c) => (
                  <Command.Item
                    key={c.id}
                    value={c.name}
                    onSelect={() => go('/admin/classes')}
                    className="flex cursor-pointer items-center gap-2 rounded-md px-2 py-2 text-sm aria-selected:bg-muted"
                  >
                    <GraduationCap className="h-4 w-4 text-muted-foreground" />
                    {c.name}
                  </Command.Item>
                ))}
            </Command.Group>
            <Command.Group heading="Subjects" className="text-xs font-semibold text-muted-foreground px-2 py-1.5">
              {subjects
                .filter((s) => s.name.toLowerCase().includes(q.toLowerCase()))
                .map((s) => (
                  <Command.Item
                    key={s.id}
                    value={s.name}
                    onSelect={() => go('/admin/subjects')}
                    className="flex cursor-pointer items-center gap-2 rounded-md px-2 py-2 text-sm aria-selected:bg-muted"
                  >
                    <BookOpen className="h-4 w-4 text-muted-foreground" />
                    {s.name}
                  </Command.Item>
                ))}
            </Command.Group>
          </Command.List>
        </Command>
      </DialogContent>
    </Dialog>
  )
}
