import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { toast } from 'sonner'
import { KeyRound, Mail, Phone, Save, ShieldCheck } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input, Label } from '@/components/ui/input'
import { Avatar } from '@/components/ui/tabs'
import { roleLabels, useAuthStore } from '@/stores/auth-store'

const profileSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  phone: z.string().min(1, 'Phone is required'),
})
type ProfileFormValues = z.infer<typeof profileSchema>

const passwordSchema = z
  .object({
    currentPassword: z.string().min(1, 'Enter your current password'),
    newPassword: z.string().min(4, 'New password must be at least 4 characters'),
    confirmPassword: z.string().min(1, 'Confirm your new password'),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  })
type PasswordFormValues = z.infer<typeof passwordSchema>

export function ProfilePage({ extra, title = 'My Profile' }: { extra?: React.ReactNode; title?: string }) {
  const session = useAuthStore((s) => s.session)!
  const [phone, setPhone] = useState('')

  const profileForm = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: { name: session.name, phone: phone || '' },
  })

  const passwordForm = useForm<PasswordFormValues>({
    resolver: zodResolver(passwordSchema),
    defaultValues: { currentPassword: '', newPassword: '', confirmPassword: '' },
  })

  const onProfileSubmit = profileForm.handleSubmit((values) => {
    setPhone(values.phone)
    toast.success('Profile details updated.')
  })

  const onPasswordSubmit = passwordForm.handleSubmit(() => {
    toast.success('Password changed successfully.')
    passwordForm.reset()
  })

  return (
    <div className="max-w-3xl space-y-6">
      <Card>
        <CardContent className="flex flex-wrap items-center gap-4 pt-6">
          <Avatar name={session.name} size="lg" />
          <div>
            <h1 className="font-display text-2xl font-semibold text-navy-900">{session.name}</h1>
            <p className="flex items-center gap-1.5 text-sm text-muted-foreground">
              <ShieldCheck className="h-3.5 w-3.5" /> {roleLabels[session.role]}
            </p>
            <p className="mt-0.5 flex items-center gap-1.5 text-sm text-muted-foreground">
              <Mail className="h-3.5 w-3.5" /> {session.email}
            </p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{title}</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={onProfileSubmit} className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="profile-name">Full name</Label>
              <Input id="profile-name" {...profileForm.register('name')} />
              {profileForm.formState.errors.name && (
                <p className="text-xs text-destructive">{profileForm.formState.errors.name.message}</p>
              )}
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="profile-phone">Phone</Label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input id="profile-phone" className="pl-9" {...profileForm.register('phone')} />
              </div>
              {profileForm.formState.errors.phone && (
                <p className="text-xs text-destructive">{profileForm.formState.errors.phone.message}</p>
              )}
            </div>
            <div className="sm:col-span-2">
              <Button type="submit">
                <Save className="h-4 w-4" /> Save changes
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <KeyRound className="h-4 w-4" /> Change Password
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={onPasswordSubmit} className="grid gap-4 sm:grid-cols-3">
            <div className="space-y-1.5">
              <Label htmlFor="current-password">Current password</Label>
              <Input id="current-password" type="password" {...passwordForm.register('currentPassword')} />
              {passwordForm.formState.errors.currentPassword && (
                <p className="text-xs text-destructive">{passwordForm.formState.errors.currentPassword.message}</p>
              )}
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="new-password">New password</Label>
              <Input id="new-password" type="password" {...passwordForm.register('newPassword')} />
              {passwordForm.formState.errors.newPassword && (
                <p className="text-xs text-destructive">{passwordForm.formState.errors.newPassword.message}</p>
              )}
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="confirm-password">Confirm new password</Label>
              <Input id="confirm-password" type="password" {...passwordForm.register('confirmPassword')} />
              {passwordForm.formState.errors.confirmPassword && (
                <p className="text-xs text-destructive">{passwordForm.formState.errors.confirmPassword.message}</p>
              )}
            </div>
            <div className="sm:col-span-3">
              <Button type="submit" variant="secondary">
                Update password
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {extra}
    </div>
  )
}

export default ProfilePage
