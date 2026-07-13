import { useState } from 'react'
import { toast } from 'sonner'
import { useAuthStore } from '@/stores/auth-store'
import { PageHeader } from '@/components/shared/empty-state'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input, Label } from '@/components/ui/input'
import { Checkbox } from '@/components/ui/tabs'

export default function StudentSettingsPage() {
  const session = useAuthStore((s) => s.session)!
  const [notifyHomework, setNotifyHomework] = useState(true)
  const [notifyNotices, setNotifyNotices] = useState(true)
  const [notifyLibrary, setNotifyLibrary] = useState(true)

  const savePassword = (e: React.FormEvent) => {
    e.preventDefault()
    toast.success('Password updated', { description: 'Your new password has been saved.' })
  }

  const saveNotifications = () => {
    toast.success('Notification preferences saved')
  }

  return (
    <div className="space-y-4">
      <PageHeader title="Settings" description="Manage your account security and notification preferences." />

      <Card>
        <CardHeader>
          <CardTitle>Account</CardTitle>
          <CardDescription>Signed in as {session.email}</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={savePassword} className="grid max-w-md gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="current-password">Current password</Label>
              <Input id="current-password" type="password" placeholder="••••••••" />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="new-password">New password</Label>
              <Input id="new-password" type="password" placeholder="••••••••" />
            </div>
            <Button type="submit" className="w-fit">
              Update password
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Notifications</CardTitle>
          <CardDescription>Choose what you want to be notified about.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <label className="flex items-center gap-2 text-sm">
            <Checkbox checked={notifyHomework} onCheckedChange={setNotifyHomework} /> Homework reminders
          </label>
          <label className="flex items-center gap-2 text-sm">
            <Checkbox checked={notifyNotices} onCheckedChange={setNotifyNotices} /> Notices & announcements
          </label>
          <label className="flex items-center gap-2 text-sm">
            <Checkbox checked={notifyLibrary} onCheckedChange={setNotifyLibrary} /> Library due-date reminders
          </label>
          <Button onClick={saveNotifications} className="mt-2 w-fit">
            Save preferences
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
