import { useMemo, useState } from 'react'
import { toast } from 'sonner'
import { GraduationCap, Plus } from 'lucide-react'
import { useAppStore } from '@/stores/app-store'
import { useAuthStore } from '@/stores/auth-store'
import { PageHeader, EmptyState, StatCard } from '@/components/shared/empty-state'
import { Card, CardContent, CardHeader, CardTitle, Badge } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input, Label, Textarea } from '@/components/ui/input'
import { Select } from '@/components/ui/tabs'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { formatDate } from '@/lib/utils'
import type { AdmissionEnquiry, AdmissionStage, Role } from '@/data/types'

const STAGES: AdmissionStage[] = [
  'enquiry',
  'application',
  'offer',
  'accepted',
  'enrolled',
  'withdrawn',
]

const STAGE_LABEL: Record<AdmissionStage, string> = {
  enquiry: 'Enquiry',
  application: 'Application',
  offer: 'Offer',
  accepted: 'Accepted',
  enrolled: 'Enrolled',
  withdrawn: 'Withdrawn',
}

const NEXT_STAGE: Partial<Record<AdmissionStage, AdmissionStage>> = {
  enquiry: 'application',
  application: 'offer',
  offer: 'accepted',
  accepted: 'enrolled',
}

const STAGE_VARIANT: Record<AdmissionStage, 'outline' | 'secondary' | 'warning' | 'success' | 'gold' | 'danger'> = {
  enquiry: 'outline',
  application: 'secondary',
  offer: 'gold',
  accepted: 'warning',
  enrolled: 'success',
  withdrawn: 'danger',
}

interface EnquiryForm {
  studentName: string
  dob: string
  gender: 'M' | 'F'
  applyingForClassId: string
  guardianName: string
  guardianEmail: string
  guardianPhone: string
  relationship: string
  notes: string
  source: string
}

const emptyForm: EnquiryForm = {
  studentName: '',
  dob: '',
  gender: 'M',
  applyingForClassId: '',
  guardianName: '',
  guardianEmail: '',
  guardianPhone: '',
  relationship: 'Parent',
  notes: '',
  source: 'Walk-in',
}

export default function AdminAdmissionsPage() {
  const session = useAuthStore((s) => s.session)
  const admissionEnquiries = useAppStore((s) => s.admissionEnquiries)
  const classes = useAppStore((s) => s.classes)
  const upsertAdmission = useAppStore((s) => s.upsertAdmission)
  const advanceAdmission = useAppStore((s) => s.advanceAdmission)
  const enrolAdmission = useAppStore((s) => s.enrolAdmission)

  const [open, setOpen] = useState(false)
  const [form, setForm] = useState<EnquiryForm>(emptyForm)

  const byStage = useMemo(() => {
    const map = Object.fromEntries(STAGES.map((s) => [s, [] as AdmissionEnquiry[]])) as Record<
      AdmissionStage,
      AdmissionEnquiry[]
    >
    for (const e of admissionEnquiries) {
      map[e.stage]?.push(e)
    }
    for (const s of STAGES) {
      map[s].sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))
    }
    return map
  }, [admissionEnquiries])

  const activePipeline = admissionEnquiries.filter(
    (e) => e.stage !== 'enrolled' && e.stage !== 'withdrawn',
  ).length

  const actor = session
    ? { id: session.userId, name: session.name, role: session.role as Role }
    : null

  const className = (id: string) => classes.find((c) => c.id === id)?.name ?? id

  const openCreate = () => {
    setForm({ ...emptyForm, applyingForClassId: classes[0]?.id ?? '' })
    setOpen(true)
  }

  const createEnquiry = () => {
    if (!form.studentName.trim() || !form.guardianName.trim() || !form.applyingForClassId) {
      toast.error('Student name, guardian, and class are required.')
      return
    }
    const now = new Date().toISOString()
    upsertAdmission({
      id: `adm-${Date.now()}`,
      studentName: form.studentName.trim(),
      dob: form.dob || '2010-01-01',
      gender: form.gender,
      applyingForClassId: form.applyingForClassId,
      guardianName: form.guardianName.trim(),
      guardianEmail: form.guardianEmail.trim(),
      guardianPhone: form.guardianPhone.trim(),
      relationship: form.relationship.trim() || 'Parent',
      stage: 'enquiry',
      notes: form.notes.trim(),
      source: form.source.trim() || 'Walk-in',
      createdAt: now,
      updatedAt: now,
    })
    toast.success('Enquiry created')
    setOpen(false)
  }

  const advance = (e: AdmissionEnquiry) => {
    if (!actor) return
    const next = NEXT_STAGE[e.stage]
    if (!next) return
    if (next === 'enrolled') {
      const student = enrolAdmission(e.id, actor)
      if (student) {
        toast.success(`Enrolled ${e.studentName}`, {
          description: `Admission no. ${student.admissionNo} · ${className(student.classId)}`,
        })
      }
      return
    }
    advanceAdmission(e.id, next, actor)
    toast.success(`Moved to ${STAGE_LABEL[next]}`)
  }

  const withdraw = (e: AdmissionEnquiry) => {
    if (!actor) return
    advanceAdmission(e.id, 'withdrawn', actor)
    toast.success('Marked withdrawn')
  }

  return (
    <div>
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <PageHeader
          title="Admissions"
          description="Track enquiries through to enrolment — Visus Manifestus."
        />
        <Button onClick={openCreate}>
          <Plus className="mr-2 h-4 w-4" /> New enquiry
        </Button>
      </div>

      <div className="mb-6 grid gap-4 sm:grid-cols-3">
        <StatCard
          label="In pipeline"
          value={activePipeline}
          icon={GraduationCap}
          accent="bg-navy-50 text-navy-700"
        />
        <StatCard
          label="Offers out"
          value={byStage.offer.length}
          icon={GraduationCap}
          accent="bg-gold-50 text-gold-700"
        />
        <StatCard
          label="Enrolled"
          value={byStage.enrolled.length}
          icon={GraduationCap}
          accent="bg-forest-50 text-forest-700"
        />
      </div>

      {admissionEnquiries.length === 0 ? (
        <EmptyState
          icon={GraduationCap}
          title="No admissions yet"
          description="Create an enquiry to start the pipeline."
          action={{ label: 'New enquiry', onClick: openCreate }}
        />
      ) : (
        <div className="flex gap-3 overflow-x-auto pb-2">
          {STAGES.filter((s) => s !== 'withdrawn').map((stage) => (
            <div key={stage} className="w-[260px] shrink-0">
              <div className="mb-2 flex items-center justify-between px-1">
                <h3 className="text-sm font-semibold">{STAGE_LABEL[stage]}</h3>
                <Badge variant="outline">{byStage[stage].length}</Badge>
              </div>
              <div className="space-y-2 rounded-lg border bg-muted/30 p-2 min-h-[120px]">
                {byStage[stage].length === 0 ? (
                  <p className="px-2 py-6 text-center text-xs text-muted-foreground">Empty</p>
                ) : (
                  byStage[stage].map((e) => (
                    <Card key={e.id} className="shadow-none">
                      <CardHeader className="p-3 pb-1">
                        <CardTitle className="text-sm font-medium">{e.studentName}</CardTitle>
                        <p className="text-xs text-muted-foreground">
                          {className(e.applyingForClassId)} · {e.guardianName}
                        </p>
                      </CardHeader>
                      <CardContent className="space-y-2 p-3 pt-1">
                        <Badge variant={STAGE_VARIANT[e.stage]}>{STAGE_LABEL[e.stage]}</Badge>
                        {e.notes && (
                          <p className="line-clamp-2 text-xs text-muted-foreground">{e.notes}</p>
                        )}
                        <p className="text-[10px] text-muted-foreground">
                          Updated {formatDate(e.updatedAt.slice(0, 10))}
                        </p>
                        <div className="flex flex-wrap gap-1">
                          {NEXT_STAGE[e.stage] && (
                            <Button size="sm" onClick={() => advance(e)}>
                              {NEXT_STAGE[e.stage] === 'enrolled'
                                ? 'Enrol'
                                : `→ ${STAGE_LABEL[NEXT_STAGE[e.stage]!]}`}
                            </Button>
                          )}
                          {e.stage !== 'enrolled' && e.stage !== 'withdrawn' && (
                            <Button size="sm" variant="ghost" onClick={() => withdraw(e)}>
                              Withdraw
                            </Button>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  ))
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {byStage.withdrawn.length > 0 && (
        <div className="mt-6">
          <h3 className="mb-2 text-sm font-semibold text-muted-foreground">Withdrawn</h3>
          <ul className="space-y-1 text-sm text-muted-foreground">
            {byStage.withdrawn.map((e) => (
              <li key={e.id}>
                {e.studentName} · {className(e.applyingForClassId)}
              </li>
            ))}
          </ul>
        </div>
      )}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>New admission enquiry</DialogTitle>
            <DialogDescription>Capture a prospective student’s details to start the pipeline.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-3">
            <div className="space-y-1.5">
              <Label>Student full name</Label>
              <Input
                value={form.studentName}
                onChange={(e) => setForm((f) => ({ ...f, studentName: e.target.value }))}
              />
            </div>
            <div className="grid gap-3 sm:grid-cols-3">
              <div className="space-y-1.5">
                <Label>Date of birth</Label>
                <Input
                  type="date"
                  value={form.dob}
                  onChange={(e) => setForm((f) => ({ ...f, dob: e.target.value }))}
                />
              </div>
              <div className="space-y-1.5">
                <Label>Gender</Label>
                <Select
                  value={form.gender}
                  onChange={(e) => setForm((f) => ({ ...f, gender: e.target.value as 'M' | 'F' }))}
                >
                  <option value="M">Male</option>
                  <option value="F">Female</option>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label>Applying for</Label>
                <Select
                  value={form.applyingForClassId}
                  onChange={(e) => setForm((f) => ({ ...f, applyingForClassId: e.target.value }))}
                >
                  {classes.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </Select>
              </div>
            </div>
            <div className="space-y-1.5">
              <Label>Guardian name</Label>
              <Input
                value={form.guardianName}
                onChange={(e) => setForm((f) => ({ ...f, guardianName: e.target.value }))}
              />
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label>Guardian email</Label>
                <Input
                  type="email"
                  value={form.guardianEmail}
                  onChange={(e) => setForm((f) => ({ ...f, guardianEmail: e.target.value }))}
                />
              </div>
              <div className="space-y-1.5">
                <Label>Guardian phone</Label>
                <Input
                  value={form.guardianPhone}
                  onChange={(e) => setForm((f) => ({ ...f, guardianPhone: e.target.value }))}
                />
              </div>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label>Relationship</Label>
                <Input
                  value={form.relationship}
                  onChange={(e) => setForm((f) => ({ ...f, relationship: e.target.value }))}
                />
              </div>
              <div className="space-y-1.5">
                <Label>Source</Label>
                <Input
                  value={form.source}
                  onChange={(e) => setForm((f) => ({ ...f, source: e.target.value }))}
                  placeholder="Open Day / Website / Referral"
                />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label>Notes</Label>
              <Textarea
                value={form.notes}
                onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))}
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button onClick={createEnquiry}>Create enquiry</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
