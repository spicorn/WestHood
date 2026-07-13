import { useMemo, useRef, useState, type ChangeEvent } from 'react'
import { toast } from 'sonner'
import { Download, File as FileIcon, Upload, X } from 'lucide-react'
import { DEMO_TODAY } from '@/data/mock-data'
import { useAppStore } from '@/stores/app-store'
import { useCurrentStaff } from '@/hooks/use-current-staff'
import { PageHeader, EmptyState } from '@/components/shared/empty-state'
import { Card, CardContent, CardHeader, CardTitle, Badge } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Select } from '@/components/ui/tabs'
import { Input, Label } from '@/components/ui/input'
import { format, parseISO } from '@/lib/utils'

function formatBytes(bytes: number) {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

export default function StaffMaterialsPage() {
  const { teacher } = useCurrentStaff()
  const subjects = useAppStore((s) => s.subjects)
  const classes = useAppStore((s) => s.classes)
  const studyMaterials = useAppStore((s) => s.studyMaterials)
  const addStudyMaterial = useAppStore((s) => s.addStudyMaterial)

  const mySubjects = useMemo(() => subjects.filter((s) => teacher?.subjects.includes(s.id)), [subjects, teacher])
  const myClasses = useMemo(() => classes.filter((c) => teacher?.classIds.includes(c.id)), [classes, teacher])

  const fileInputRef = useRef<HTMLInputElement>(null)
  const [file, setFile] = useState<File | null>(null)
  const [title, setTitle] = useState('')
  const [subjectId, setSubjectId] = useState('')
  const [classId, setClassId] = useState('')

  if (!teacher) return <PageHeader title="Study Materials" description="Loading your staff profile…" />

  const relevantMaterials = studyMaterials
    .filter((m) => teacher.classIds.includes(m.classId))
    .sort((a, b) => b.date.localeCompare(a.date))

  function handleFileChange(e: ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0]
    if (!f) return
    setFile(f)
    setTitle(f.name.replace(/\.[^/.]+$/, ''))
    setSubjectId(mySubjects[0]?.id ?? '')
    setClassId(myClasses[0]?.id ?? '')
  }

  function resetForm() {
    setFile(null)
    setTitle('')
    setSubjectId('')
    setClassId('')
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  function handleUpload() {
    if (!file) {
      toast.error('Choose a file to upload first.')
      return
    }
    if (!subjectId || !classId) {
      toast.error('Select a subject and class.')
      return
    }
    addStudyMaterial({
      id: `sm-${Date.now()}`,
      title: title.trim() || file.name,
      subjectId,
      classId,
      uploadedBy: teacher!.id,
      fileType: file.name.split('.').pop()?.toUpperCase() ?? 'FILE',
      fileSize: formatBytes(file.size),
      date: DEMO_TODAY,
    })
    toast.success('Material uploaded', { description: `${title || file.name} is now available to ${classes.find((c) => c.id === classId)?.name}.` })
    resetForm()
  }

  function handleDownload(materialTitle: string, fileType: string, fileSize: string) {
    toast.success(`Downloading ${materialTitle}`, { description: `${fileType} · ${fileSize} (demo download)` })
  }

  return (
    <div>
      <PageHeader title="Study Materials" description="Upload notes, worksheets, and slides for your classes." />

      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Upload className="h-5 w-5 text-navy-600" /> Upload New Material
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <input ref={fileInputRef} type="file" className="hidden" onChange={handleFileChange} />
          {!file ? (
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="flex w-full flex-col items-center gap-2 rounded-lg border-2 border-dashed p-8 text-center text-muted-foreground transition-colors hover:border-navy-400 hover:text-navy-600"
            >
              <Upload className="h-8 w-8" />
              <span className="text-sm font-medium">Click to choose a file</span>
              <span className="text-xs">PDF, DOCX, PPTX, images — this is a mock upload for the demo</span>
            </button>
          ) : (
            <div className="rounded-lg border p-4">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="rounded-md bg-navy-50 p-2.5 text-navy-700">
                    <FileIcon className="h-5 w-5" />
                  </div>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium">{file.name}</p>
                    <p className="text-xs text-muted-foreground">{formatBytes(file.size)} · {file.type || 'Unknown type'}</p>
                  </div>
                </div>
                <Button variant="ghost" size="icon" onClick={resetForm}>
                  <X className="h-4 w-4" />
                </Button>
              </div>

              <div className="mt-4 grid gap-3 sm:grid-cols-3">
                <div className="space-y-1.5 sm:col-span-3">
                  <Label>Title</Label>
                  <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. Fractions Worksheet Pack" />
                </div>
                <div className="space-y-1.5">
                  <Label>Subject</Label>
                  <Select value={subjectId} onChange={(e) => setSubjectId(e.target.value)}>
                    <option value="">Select subject…</option>
                    {mySubjects.map((s) => (
                      <option key={s.id} value={s.id}>{s.name}</option>
                    ))}
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label>Class</Label>
                  <Select value={classId} onChange={(e) => setClassId(e.target.value)}>
                    <option value="">Select class…</option>
                    {myClasses.map((c) => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </Select>
                </div>
                <div className="flex items-end">
                  <Button className="w-full gap-2" onClick={handleUpload}>
                    <Upload className="h-4 w-4" /> Upload
                  </Button>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <h2 className="mb-3 font-display text-xl font-semibold text-navy-800">Uploaded Materials</h2>
      {relevantMaterials.length === 0 ? (
        <EmptyState icon={FileIcon} title="No materials yet" description="Materials you upload for your classes will appear here." />
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {relevantMaterials.map((m) => {
            const subject = subjects.find((s) => s.id === m.subjectId)
            const cls = classes.find((c) => c.id === m.classId)
            return (
              <Card key={m.id}>
                <CardContent className="pt-5">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <p className="truncate font-medium">{m.title}</p>
                      <p className="text-xs text-muted-foreground">{subject?.name} · {cls?.name}</p>
                    </div>
                    <Badge variant="outline">{m.fileType}</Badge>
                  </div>
                  <div className="mt-3 flex items-center justify-between text-xs text-muted-foreground">
                    <span>{m.fileSize} · {format(parseISO(m.date), 'd MMM yyyy')}</span>
                    {m.uploadedBy === teacher.id && <Badge variant="gold">Mine</Badge>}
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    className="mt-3 w-full gap-1.5"
                    onClick={() => handleDownload(m.title, m.fileType, m.fileSize)}
                  >
                    <Download className="h-3.5 w-3.5" /> Download
                  </Button>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}
