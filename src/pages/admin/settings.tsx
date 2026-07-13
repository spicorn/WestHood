import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { toast } from 'sonner'
import { Save, School } from 'lucide-react'
import { PageHeader } from '@/components/shared/empty-state'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input, Label, Textarea } from '@/components/ui/input'
import { useAppStore } from '@/stores/app-store'

const settingsSchema = z.object({
  name: z.string().min(1, 'School name is required'),
  tagline: z.string().min(1, 'Tagline is required'),
  address: z.string().min(1, 'Address is required'),
  phone: z.string().min(1, 'Phone is required'),
  email: z.string().email('Enter a valid email'),
  academicYear: z.string().min(1, 'Required'),
  currentTerm: z.string().min(1, 'Required'),
  termStart: z.string().min(1, 'Required'),
  termEnd: z.string().min(1, 'Required'),
})
type SettingsFormValues = z.infer<typeof settingsSchema>

export default function AdminSettings() {
  const settings = useAppStore((s) => s.settings)
  const updateSettings = useAppStore((s) => s.updateSettings)

  const {
    register,
    handleSubmit,
    formState: { errors, isDirty },
  } = useForm<SettingsFormValues>({
    resolver: zodResolver(settingsSchema),
    defaultValues: settings,
  })

  const onSubmit = handleSubmit((values) => {
    updateSettings(values)
    toast.success('School settings saved.')
  })

  return (
    <div>
      <PageHeader title="Settings" description="School profile and academic term configuration." />

      <form onSubmit={onSubmit} className="max-w-3xl space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <School className="h-4 w-4" /> School Profile
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="name">School name</Label>
                <Input id="name" {...register('name')} />
                {errors.name && <p className="text-xs text-destructive">{errors.name.message}</p>}
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="tagline">Tagline</Label>
                <Input id="tagline" {...register('tagline')} />
                {errors.tagline && <p className="text-xs text-destructive">{errors.tagline.message}</p>}
              </div>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="address">Address</Label>
              <Textarea id="address" {...register('address')} />
              {errors.address && <p className="text-xs text-destructive">{errors.address.message}</p>}
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="phone">Phone</Label>
                <Input id="phone" {...register('phone')} />
                {errors.phone && <p className="text-xs text-destructive">{errors.phone.message}</p>}
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" {...register('email')} />
                {errors.email && <p className="text-xs text-destructive">{errors.email.message}</p>}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Academic Term</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="academicYear">Academic year</Label>
                <Input id="academicYear" {...register('academicYear')} />
                {errors.academicYear && <p className="text-xs text-destructive">{errors.academicYear.message}</p>}
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="currentTerm">Current term</Label>
                <Input id="currentTerm" {...register('currentTerm')} />
                {errors.currentTerm && <p className="text-xs text-destructive">{errors.currentTerm.message}</p>}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="termStart">Term start</Label>
                <Input id="termStart" type="date" {...register('termStart')} />
                {errors.termStart && <p className="text-xs text-destructive">{errors.termStart.message}</p>}
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="termEnd">Term end</Label>
                <Input id="termEnd" type="date" {...register('termEnd')} />
                {errors.termEnd && <p className="text-xs text-destructive">{errors.termEnd.message}</p>}
              </div>
            </div>
          </CardContent>
        </Card>

        <Button type="submit" disabled={!isDirty}>
          <Save className="h-4 w-4" /> Save Settings
        </Button>
      </form>
    </div>
  )
}
