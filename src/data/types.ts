export type Role = 'admin' | 'staff' | 'parent' | 'student'

export type StudentStatus = 'active' | 'archived'
export type StaffStatus = 'active' | 'inactive'
export type InvoiceStatus = 'paid' | 'partial' | 'outstanding' | 'overdue'
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
  | 'nap'
  | 'food'
  | 'exam'
  | 'merit'
  | 'alert'

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
  level: 'early' | 'primary' | 'olevel' | 'alevel'
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
}

export interface FeeStructure {
  id: string
  classId: string
  term: string
  amount: number
  description: string
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
