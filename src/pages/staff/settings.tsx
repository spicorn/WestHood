import { useState } from 'react'
import { toast } from 'sonner'
import { Bell, Globe, Moon, Save, Sun } from 'lucide-react'
import { PageHeader } from '@/components/shared/empty-state'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Checkbox, Select } from '@/components/ui/tabs'
import { Label } from '@/components/ui/input'
import { cn } from '@/lib/utils'

export default function StaffSettingsPage() {
  const [emailAlerts, setEmailAlerts] = useState(true)
  const [smsAlerts, setSmsAlerts] = useState(false)
  const [clockInReminders, setClockInReminders] = useState(true)
  const [weeklyDigest, setWeeklyDigest] = useState(true)
  const [theme, setTheme] = useState<'light' | 'dark'>('light')
  const [language, setLanguage] = useState('en')

  function handleSave() {
    toast.success('Preferences saved', { description: 'These settings are saved locally for this demo.' })
  }

  return (
    <div>
      <PageHeader title="Settings" description="Notification and display preferences." />

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bell className="h-5 w-5 text-navy-600" /> Notifications
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {[
              { key: 'email', label: 'Email alerts', hint: 'Homework reviews, notices, and reminders', checked: emailAlerts, set: setEmailAlerts },
              { key: 'sms', label: 'SMS alerts', hint: 'Urgent notices only', checked: smsAlerts, set: setSmsAlerts },
              { key: 'clockin', label: 'Clock-in reminders', hint: 'Notify me 5 minutes before each period', checked: clockInReminders, set: setClockInReminders },
              { key: 'digest', label: 'Weekly digest', hint: 'Summary of homework, attendance, and marks', checked: weeklyDigest, set: setWeeklyDigest },
            ].map((row) => (
              <label key={row.key} htmlFor={row.key} className="flex items-start justify-between gap-3 rounded-md border p-3 cursor-pointer">
                <div>
                  <p className="text-sm font-medium">{row.label}</p>
                  <p className="text-xs text-muted-foreground">{row.hint}</p>
                </div>
                <Checkbox id={row.key} checked={row.checked} onCheckedChange={row.set} className="mt-0.5 shrink-0" />
              </label>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Globe className="h-5 w-5 text-navy-600" /> Display
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-1.5">
              <Label>Theme</Label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setTheme('light')}
                  className={cn('flex items-center justify-center gap-2 rounded-md border p-2.5 text-sm', theme === 'light' && 'border-navy-500 bg-navy-50 text-navy-800 font-medium')}
                >
                  <Sun className="h-4 w-4" /> Light
                </button>
                <button
                  type="button"
                  onClick={() => setTheme('dark')}
                  className={cn('flex items-center justify-center gap-2 rounded-md border p-2.5 text-sm', theme === 'dark' && 'border-navy-500 bg-navy-50 text-navy-800 font-medium')}
                >
                  <Moon className="h-4 w-4" /> Dark
                </button>
              </div>
              <p className="text-xs text-muted-foreground">Dark mode is coming soon — this is a placeholder for the demo.</p>
            </div>
            <div className="space-y-1.5">
              <Label>Language</Label>
              <Select value={language} onChange={(e) => setLanguage(e.target.value)}>
                <option value="en">English</option>
                <option value="sn">Shona</option>
                <option value="nd">Ndebele</option>
              </Select>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="mt-6 flex justify-end">
        <Button className="gap-2" onClick={handleSave}>
          <Save className="h-4 w-4" /> Save Preferences
        </Button>
      </div>
    </div>
  )
}
