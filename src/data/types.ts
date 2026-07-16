export type Role = 'admin' | 'staff' | 'parent' | 'student'

export type StudentStatus = 'active' | 'archived'
export type StaffStatus = 'active' | 'inactive'
export type InvoiceStatus = 'paid' | 'partial' | 'outstanding' | 'overdue'
export type PaymentMethod = 'ecocash' | 'onemoney' | 'bank_transfer' | 'cash'
export type ReportStatus = 'draft' | 'finalized' | 'published'
export type PredictionConfidence = 'high' | 'medium' | 'low'
export type AttendanceStatus = 'present' | 'absent' | 'late'
export type PeriodClockStatus = 'pending' | 'on_time' | 'late' | 'missed' | 'substituted'
export type NoticeCategory = 'General' | 'Sports' | 'Exams' | 'Holiday' | 'Urgent'
export type NoticeAudience = 'All' | 'Staff' | 'Parents' | 'Students' | string
export type HomeworkStatus = 'assigned' | 'submitted' | 'late' | 'missing'
export type LibraryStatus = 'available' | 'issued' | 'overdue' | 'returned'
export type InviteStatus = 'pending' | 'accepted'
export type ActivityType =
  | 'attendance'
  | 'pickup'
  | 'reading'
  | 'homework'
  | 'observation'
  | 'exam'
  | 'merit'
  | 'alert'
  | 'payment'
  | 'fee_reminder'
  | 'discipline'
  | 'detention'
  | 'club'
  | 'guidance'
  | 'absence'
  | 'message'
  | 'admission'

export interface UserAccount {
  id: string
  email: string
  username: string
  password: string
  role: Role
  name: string
  avatar?: string
  phone?: string
}

export interface AuthSession {
  userId: string
  role: Role
  name: string
  email: string
  avatar?: string
}

export interface ClassRoom {
  id: string
  name: string
  grade: string
  level: 'olevel' | 'alevel'
  color: string
  classTeacherId?: string
  capacity: number
}

export interface StaffMember {
  id: string
  name: string
  email: string
  phone: string
  subjects: string[]
  classIds: string[]
  isClassTeacher: boolean
  classTeacherOf?: string
  status: StaffStatus
  bio: string
  avatar?: string
  userId: string
}

export interface ParentGuardian {
  id: string
  name: string
  email: string
  phone: string
  relationship: string
  studentIds: string[]
  userId?: string
  avatar?: string
  notificationPrefs?: {
    attendance: boolean
    homework: boolean
    fees: boolean
    notices: boolean
  }
}

export type LeadershipRole =
  | 'none'
  | 'head_boy'
  | 'head_girl'
  | 'deputy_head'
  | 'prefect'
  | 'class_captain'

export type DisciplineSeverity = 'minor' | 'major' | 'serious'
export type ConsequenceStatus = 'scheduled' | 'completed' | 'missed'
export type ExamBody = 'ZIMSEC' | 'Cambridge'
export type ExamLevel = 'O-Level' | 'A-Level'
export type RegistrationStatus = 'registered' | 'pending' | 'not_registered'
export type ClubCategory = 'sport' | 'academic' | 'creative'
export type ALevelStream = 'sciences' | 'commercials' | 'arts'

export interface Student {
  id: string
  firstName: string
  lastName: string
  admissionNo: string
  dob: string
  classId: string
  status: StudentStatus
  parentIds: string[]
  avatar?: string
  gender: 'M' | 'F'
  attendancePct: number
  previousAvg: number
  currentAvg: number
  leadershipRole?: LeadershipRole
  /** Set when Form 4 promotes into Lower Sixth */
  alevelStream?: ALevelStream
  disciplineEscalated?: boolean
}

export interface Subject {
  id: string
  name: string
  code: string
  teacherIds: string[]
  classIds: string[]
}

export interface Exam {
  id: string
  name: string
  term: string
  year: number
  startDate: string
  endDate: string
  subjectIds: string[]
  gradeBoundaries: { grade: string; min: number; max: number }[]
}

export interface GradeEntry {
  id: string
  examId: string
  studentId: string
  subjectId: string
  mark: number
  comment?: string
}

export interface Notice {
  id: string
  title: string
  body: string
  category: NoticeCategory
  audience: NoticeAudience
  date: string
  pinned: boolean
  createdBy: string
}

export interface FeeInstalment {
  id: string
  label: string
  /** 1-based instalment number within the plan */
  sequence: number
  amount: number
  paid: number
  dueDate: string
  status: InvoiceStatus
}

export interface PaymentRecord {
  id: string
  invoiceId: string
  instalmentId?: string
  amount: number
  method: PaymentMethod
  paidAt: string
  reference: string
  recordedBy: string
  mobileNumber?: string
}

export interface Invoice {
  id: string
  studentId: string
  description: string
  term: string
  amount: number
  paid: number
  status: InvoiceStatus
  dueDate: string
  issuedDate: string
  /** When set, fees are split across instalments rather than a lump sum */
  instalmentPlan?: boolean
  instalments?: FeeInstalment[]
  classId?: string
}

export interface FeeStructure {
  id: string
  classId: string
  term: string
  amount: number
  description: string
  /** Number of termly instalments (1 = lump sum, 3 = three instalments) */
  instalmentCount: number
}

export interface ElectronicReport {
  id: string
  studentId: string
  term: string
  examId: string
  status: ReportStatus
  classPosition: number
  classSize: number
  attendancePct: number
  principalComment?: string
  classTeacherComment?: string
  finalizedAt?: string
  publishedAt?: string
  createdAt: string
}

export interface TimetableSlot {
  id: string
  classId: string
  day: number // 0=Mon .. 4=Fri
  period: number
  startTime: string
  endTime: string
  subjectId: string
  teacherId: string
  room: string
  substituteTeacherId?: string
}

export interface StaffPeriodAttendance {
  id: string
  teacherId: string
  date: string
  slotId: string
  status: PeriodClockStatus
  clockInAt?: string
  clockOutAt?: string
  note?: string
  substituteTeacherId?: string
}

export interface StudentAttendance {
  id: string
  studentId: string
  classId: string
  date: string
  status: AttendanceStatus
  note?: string
  takenBy: string
}

export interface LibraryBook {
  id: string
  title: string
  author: string
  isbn: string
  category: string
  status: LibraryStatus
  issuedTo?: string
  dueDate?: string
}

export interface StudyMaterial {
  id: string
  title: string
  subjectId: string
  classId: string
  uploadedBy: string
  fileType: string
  fileSize: string
  date: string
}

export interface Homework {
  id: string
  title: string
  description: string
  subjectId: string
  classId: string
  assignedBy: string
  dueDate: string
  createdAt: string
  submissions: { studentId: string; status: HomeworkStatus; submittedAt?: string }[]
}

export interface ReadingLog {
  id: string
  studentId: string
  title: string
  pages: string
  date: string
  loggedBy: string
  notes?: string
}

export interface MeritRecord {
  id: string
  studentId: string
  points: number
  type: 'merit' | 'demerit'
  reason: string
  date: string
  loggedBy: string
  /** Disciplinary extension — for demerits / conduct follow-up */
  severity?: DisciplineSeverity
  category?: string
  escalated?: boolean
  notes?: string
}

export interface DetentionRecord {
  id: string
  studentId: string
  meritId: string
  scheduledAt: string
  location: string
  status: ConsequenceStatus
  assignedBy: string
  notes?: string
}

export interface GuidanceNote {
  id: string
  studentId: string
  careerInterest: string
  tags: string[]
  pathwayNotes: string
  loggedBy: string
  loggedByName: string
  createdAt: string
}

export interface ExamSitting {
  id: string
  name: string
  body: ExamBody
  level: ExamLevel
  series: string
  year: number
}

export interface ExamRegistration {
  id: string
  sittingId: string
  studentId: string
  subjectIds: string[]
  candidateNumber: string
  status: RegistrationStatus
}

export interface Club {
  id: string
  name: string
  category: ClubCategory
  supervisorId: string
  meetingDay: string
  meetingTime: string
  description: string
}

export interface ClubMembership {
  id: string
  clubId: string
  studentId: string
  joinedAt: string
}

export interface PickupPerson {
  id: string
  studentId: string
  name: string
  relationship: string
  phone: string
  avatar?: string
}

export interface ActivityEntry {
  id: string
  studentId: string
  type: ActivityType
  title: string
  description: string
  status?: string
  date: string
  time: string
  flagged?: boolean
  meta?: Record<string, string>
}

export interface ParentInvite {
  id: string
  studentId: string
  name: string
  email: string
  phone: string
  relationship: string
  status: InviteStatus
  sentAt: string
  invitedBy: string
}

export interface CommentPhrase {
  id: string
  band: 'strong' | 'average' | 'needs_improvement'
  text: string
}

export interface SchoolSettings {
  name: string
  tagline: string
  address: string
  phone: string
  email: string
  academicYear: string
  currentTerm: string
  termStart: string
  termEnd: string
}

export interface NotificationItem {
  id: string
  role: Role | 'all'
  title: string
  body: string
  time: string
  read: boolean
  href?: string
}

export type AbsenceRequestStatus = 'pending' | 'approved' | 'declined'
export type AdmissionStage = 'enquiry' | 'application' | 'offer' | 'accepted' | 'enrolled' | 'withdrawn'
export type AuditAction =
  | 'grade_upsert'
  | 'report_status'
  | 'report_publish'
  | 'payment_recorded'
  | 'invoice_updated'
  | 'absence_decision'
  | 'admission_stage'
  | 'student_enrolled'

export interface AbsenceRequest {
  id: string
  studentId: string
  parentId: string
  parentName: string
  startDate: string
  endDate: string
  reason: string
  status: AbsenceRequestStatus
  submittedAt: string
  reviewedBy?: string
  reviewedAt?: string
  reviewNote?: string
}

export interface MessageThread {
  id: string
  subject: string
  /** Notice reply threads reference a notice id */
  noticeId?: string
  studentId?: string
  participantIds: string[]
  participantNames: Record<string, string>
  createdAt: string
  updatedAt: string
  lastPreview: string
}

export interface ChatMessage {
  id: string
  threadId: string
  senderId: string
  senderName: string
  senderRole: Role
  body: string
  sentAt: string
  readBy: string[]
}

export interface AuditLogEntry {
  id: string
  action: AuditAction
  actorId: string
  actorName: string
  actorRole: Role
  summary: string
  entityType: string
  entityId: string
  createdAt: string
  meta?: Record<string, string>
}

export interface AdmissionEnquiry {
  id: string
  studentName: string
  dob: string
  gender: 'M' | 'F'
  applyingForClassId: string
  guardianName: string
  guardianEmail: string
  guardianPhone: string
  relationship: string
  stage: AdmissionStage
  notes: string
  source: string
  createdAt: string
  updatedAt: string
  enrolledStudentId?: string
}
