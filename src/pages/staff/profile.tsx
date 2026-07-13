import { useState } from 'react'
import { toast } from 'sonner'
import { BadgeCheck, Mail, Phone, Save } from 'lucide-react'
import { useAppStore } from '@/stores/app-store'
import { useCurrentStaff } from '@/hooks/use-current-staff'
import { PageHeader } from '@/components/shared/empty-state'
import { Card, CardContent, CardHeader, CardTitle, Badge } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Avatar } from '@/components/ui/tabs'
import { Input, Label, Textarea } from '@/components/ui/input'

export default function StaffProfilePage() {
  const { teacher } = useCurrentStaff()
  const subjects = useAppStore((s) => s.subjects)
  const classes = useAppStore((s) => s.classes)
  const upsertStaff = useAppStore((s) => s.upsertStaff)

  const [phone, setPhone] = useState(teacher?.phone ?? '')
  const [bio, setBio] = useState(teacher?.bio ?? '')

  if (!teacher) return <PageHeader title="My Profile" description="Loading your staff profile…" />

  const mySubjects = subjects.filter((s) => teacher.subjects.includes(s.id))
  const myClasses = classes.filter((c) => teacher.classIds.includes(c.id))

  function handleSave() {
    upsertStaff({ ...teacher!, phone: phone.trim(), bio: bio.trim() })
    toast.success('Profile updated')
  }

  return (
    <div>
      <PageHeader title="My Profile" description="Manage your contact details and bio." />

      <div className="grid gap-6 lg:grid-cols-[1fr_1.6fr]">
        <Card>
          <CardContent className="pt-6 text-center">
            <Avatar name={teacher.name} size="lg" className="mx-auto" />
            <p className="mt-3 font-display text-xl font-semibold text-navy-900">{teacher.name}</p>
            <p className="text-sm text-muted-foreground flex items-center justify-center gap-1.5 mt-1">
              <Mail className="h-3.5 w-3.5" /> {teacher.email}
            </p>
            {teacher.isClassTeacher && (
              <Badge variant="gold" className="mt-3 gap-1">
                <BadgeCheck className="h-3.5 w-3.5" /> Class Teacher
              </Badge>
            )}
            <div className="mt-5 space-y-3 text-left">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-1.5">Subjects</p>
                <div className="flex flex-wrap gap-1.5">
                  {mySubjects.map((s) => (
                    <Badge key={s.id} variant="outline">{s.name}</Badge>
                  ))}
                </div>
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-1.5">Classes</p>
                <div className="flex flex-wrap gap-1.5">
                  {myClasses.map((c) => (
                    <Badge key={c.id} variant="outline">{c.name}</Badge>
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Edit Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-1.5">
              <Label>Full Name</Label>
              <Input value={teacher.name} disabled />
            </div>
            <div className="space-y-1.5">
              <Label>Email</Label>
              <Input value={teacher.email} disabled />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="phone">Phone Number</Label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input id="phone" className="pl-9" value={phone} onChange={(e) => setPhone(e.target.value)} />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="bio">Bio</Label>
              <Textarea id="bio" rows={5} value={bio} onChange={(e) => setBio(e.target.value)} placeholder="Tell parents and colleagues about yourself…" />
            </div>
            <Button className="gap-2" onClick={handleSave}>
              <Save className="h-4 w-4" /> Save Changes
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
