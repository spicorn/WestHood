import { useMemo, useState } from 'react'
import { toast } from 'sonner'
import { Pencil, Plus, Trash2, UserCheck } from 'lucide-react'
import { useAppStore } from '@/stores/app-store'
import { useSelectedChild } from '@/hooks/use-parent'
import { ChildSwitcher } from '@/components/parent/child-switcher'
import { PageHeader, EmptyState } from '@/components/shared/empty-state'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Avatar } from '@/components/ui/tabs'
import { Input, Label } from '@/components/ui/input'
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import type { PickupPerson } from '@/data/types'

interface FormState {
  name: string
  relationship: string
  phone: string
}

const emptyForm: FormState = { name: '', relationship: '', phone: '' }

export default function ParentPickupPage() {
  const child = useSelectedChild()
  const pickupPeople = useAppStore((s) => s.pickupPeople)
  const upsertPickup = useAppStore((s) => s.upsertPickup)
  const removePickup = useAppStore((s) => s.removePickup)

  const [dialogOpen, setDialogOpen] = useState(false)
  const [editing, setEditing] = useState<PickupPerson | null>(null)
  const [form, setForm] = useState<FormState>(emptyForm)
  const [deleteTarget, setDeleteTarget] = useState<PickupPerson | null>(null)

  const list = useMemo(() => (child ? pickupPeople.filter((p) => p.studentId === child.id) : []), [pickupPeople, child])

  const openAdd = () => {
    setEditing(null)
    setForm(emptyForm)
    setDialogOpen(true)
  }

  const openEdit = (person: PickupPerson) => {
    setEditing(person)
    setForm({ name: person.name, relationship: person.relationship, phone: person.phone })
    setDialogOpen(true)
  }

  const save = () => {
    if (!child) return
    if (!form.name.trim() || !form.relationship.trim() || !form.phone.trim()) {
      toast.error('Please fill in all fields.')
      return
    }
    upsertPickup({
      id: editing?.id ?? `pk-${Date.now()}`,
      studentId: child.id,
      name: form.name.trim(),
      relationship: form.relationship.trim(),
      phone: form.phone.trim(),
    })
    toast.success(editing ? 'Pickup person updated' : 'Pickup person added', {
      description: `${form.name} is ${editing ? 'now updated on' : 'now added to'} ${child.firstName}'s authorized list.`,
    })
    setDialogOpen(false)
  }

  const confirmDelete = () => {
    if (!deleteTarget) return
    removePickup(deleteTarget.id)
    toast.success('Pickup person removed', { description: `${deleteTarget.name} has been removed from the authorized list.` })
    setDeleteTarget(null)
  }

  if (!child) return <EmptyState title="No children linked" description="No students are linked to your account yet." />

  return (
    <div>
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <PageHeader title="Authorized Pickup" description={`People authorized to collect ${child.firstName} from school.`} />
        <ChildSwitcher />
      </div>

      <div className="mb-4">
        <Button onClick={openAdd}>
          <Plus className="mr-2 h-4 w-4" /> Add pickup person
        </Button>
      </div>

      {list.length === 0 ? (
        <EmptyState icon={UserCheck} title="No authorized persons" description="Add trusted adults who are allowed to collect your child." action={{ label: 'Add pickup person', onClick: openAdd }} />
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {list.map((p) => (
            <Card key={p.id}>
              <CardContent className="flex items-start gap-3 pt-5">
                <Avatar name={p.name} size="md" />
                <div className="flex-1">
                  <p className="text-sm font-medium">{p.name}</p>
                  <p className="text-xs text-muted-foreground">{p.relationship}</p>
                  <p className="mt-1 text-xs text-muted-foreground">{p.phone}</p>
                </div>
                <div className="flex gap-1">
                  <Button size="icon" variant="ghost" onClick={() => openEdit(p)}>
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button size="icon" variant="ghost" onClick={() => setDeleteTarget(p)}>
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editing ? 'Edit pickup person' : 'Add pickup person'}</DialogTitle>
            <DialogDescription>This person will be authorized to collect {child.firstName} from school.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="pk-name">Full name</Label>
              <Input id="pk-name" value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} placeholder="e.g. Grace Mutasa" />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="pk-rel">Relationship</Label>
              <Input id="pk-rel" value={form.relationship} onChange={(e) => setForm((f) => ({ ...f, relationship: e.target.value }))} placeholder="e.g. Aunt" />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="pk-phone">Phone</Label>
              <Input id="pk-phone" value={form.phone} onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))} placeholder="+263 77 000 0000" />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={save}>Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={Boolean(deleteTarget)} onOpenChange={(open) => !open && setDeleteTarget(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Remove pickup person?</DialogTitle>
            <DialogDescription>
              {deleteTarget?.name} will no longer be authorized to collect {child.firstName}. This cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteTarget(null)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={confirmDelete}>
              Remove
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
