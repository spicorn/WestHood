import { useState } from 'react'
import { toast } from 'sonner'
import { useCurrentParent } from '@/hooks/use-parent'
import { PageHeader } from '@/components/shared/empty-state'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input, Label } from '@/components/ui/input'
import { Checkbox } from '@/components/ui/tabs'

export default function ParentSettingsPage() {
  const parent = useCurrentParent()
  const [email, setEmail] = useState(parent.email)
  const [phone, setPhone] = useState(parent.phone)
  const [prefs, setPrefs] = useState(
    parent.notificationPrefs ?? { attendance: true, homework: true, fees: true, notices: true },
  )

  const saveContact = (e: React.FormEvent) => {
    e.preventDefault()
    toast.success('Contact details saved')
  }

  const savePrefs = () => {
    toast.success('Notification preferences saved')
  }

  return (
    <div className="space-y-4">
      <PageHeader title="Settings" description="Manage your contact details and notification preferences." />

      <Card>
        <CardHeader>
          <CardTitle>Contact Details</CardTitle>
          <CardDescription>Keep your contact information up to date so the school can reach you.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={saveContact} className="grid max-w-md gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="parent-email">Email</Label>
              <Input id="parent-email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="parent-phone">Phone</Label>
              <Input id="parent-phone" value={phone} onChange={(e) => setPhone(e.target.value)} />
            </div>
            <Button type="submit" className="w-fit">
              Save contact details
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Notification Preferences</CardTitle>
          <CardDescription>Choose which alerts you'd like to receive about your children.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <label className="flex items-center gap-2 text-sm">
            <Checkbox checked={prefs.attendance} onCheckedChange={(v) => setPrefs((p) => ({ ...p, attendance: v }))} /> Attendance alerts
          </label>
          <label className="flex items-center gap-2 text-sm">
            <Checkbox checked={prefs.homework} onCheckedChange={(v) => setPrefs((p) => ({ ...p, homework: v }))} /> Homework updates
          </label>
          <label className="flex items-center gap-2 text-sm">
            <Checkbox checked={prefs.fees} onCheckedChange={(v) => setPrefs((p) => ({ ...p, fees: v }))} /> Fee & payment reminders
          </label>
          <label className="flex items-center gap-2 text-sm">
            <Checkbox checked={prefs.notices} onCheckedChange={(v) => setPrefs((p) => ({ ...p, notices: v }))} /> Notices & announcements
          </label>
          <Button onClick={savePrefs} className="mt-2 w-fit">
            Save preferences
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
