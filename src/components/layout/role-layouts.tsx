import {
  BookOpen,
  CalendarDays,
  CalendarOff,
  ClipboardCheck,
  ClipboardList,
  CreditCard,
  Crown,
  FileBarChart,
  GraduationCap,
  Home,
  Library,
  Settings,
  ShieldAlert,
  Users,
  UserPlus,
  UserSquare2,
  Award,
  FileText,
  Clock,
  Bell,
  Wallet,
  User,
  LineChart,
  ScrollText,
  Compass,
  FileBadge,
  MessageSquare,
  Scroll,
} from 'lucide-react'
import { AppShell, type NavItem } from '@/components/layout/app-shell'

const adminNav: NavItem[] = [
  { to: '/admin', label: 'Dashboard', icon: Home },
  { to: '/admin/students', label: 'Students', icon: GraduationCap },
  { to: '/admin/admissions', label: 'Admissions', icon: UserPlus },
  { to: '/admin/classes', label: 'Classes', icon: Users },
  { to: '/admin/staff', label: 'Staff', icon: UserSquare2 },
  { to: '/admin/subjects', label: 'Subjects', icon: BookOpen },
  { to: '/admin/exams', label: 'Exams & Grades', icon: ClipboardList },
  { to: '/admin/exam-registration', label: 'Exam Registration', icon: FileBadge },
  { to: '/admin/discipline', label: 'Discipline', icon: ShieldAlert },
  { to: '/admin/clubs', label: 'Clubs', icon: Users },
  { to: '/admin/leadership', label: 'Leadership', icon: Crown },
  { to: '/admin/reports', label: 'Reports', icon: ScrollText },
  { to: '/admin/predictions', label: 'Predictions', icon: LineChart },
  { to: '/admin/timetable', label: 'Timetable', icon: Clock },
  { to: '/admin/notices', label: 'Notices / Calendar', icon: CalendarDays },
  { to: '/admin/absence-requests', label: 'Absence Requests', icon: CalendarOff },
  { to: '/admin/messages', label: 'Messages', icon: MessageSquare },
  { to: '/admin/financials', label: 'Financials', icon: Wallet },
  { to: '/admin/analytics-export', label: 'Analytics Export', icon: FileBarChart },
  { to: '/admin/staff-attendance', label: 'Staff Attendance', icon: ClipboardCheck },
  { to: '/admin/audit-log', label: 'Audit Log', icon: Scroll },
  { to: '/admin/settings', label: 'Settings', icon: Settings },
]

const staffNav: NavItem[] = [
  { to: '/staff', label: 'Home', icon: Home },
  { to: '/staff/my-class', label: 'My Class', icon: Users },
  { to: '/staff/attendance', label: 'Attendance', icon: ClipboardCheck },
  { to: '/staff/exams', label: 'Exam Records', icon: ClipboardList },
  { to: '/staff/discipline', label: 'Discipline', icon: ShieldAlert },
  { to: '/staff/clubs', label: 'Clubs', icon: Users },
  { to: '/staff/predictions', label: 'Predictions', icon: LineChart },
  { to: '/staff/timetable', label: 'Timetable', icon: Clock },
  { to: '/staff/materials', label: 'Study Materials', icon: FileText },
  { to: '/staff/homework', label: 'Homework', icon: BookOpen },
  { to: '/staff/notices', label: 'Notices', icon: Bell },
  { to: '/staff/absence-requests', label: 'Absence Requests', icon: CalendarOff },
  { to: '/staff/messages', label: 'Messages', icon: MessageSquare },
  { to: '/staff/profile', label: 'My Profile', icon: User },
]

const studentNav: NavItem[] = [
  { to: '/student', label: 'Home', icon: Home },
  { to: '/student/teachers', label: 'My Teachers', icon: UserSquare2 },
  { to: '/student/subjects', label: 'My Subjects', icon: BookOpen },
  { to: '/student/marks', label: 'My Marks', icon: ClipboardList },
  { to: '/student/reports', label: 'Reports', icon: ScrollText },
  { to: '/student/clubs', label: 'Clubs', icon: Users },
  { to: '/student/timetable', label: 'Timetable', icon: Clock },
  { to: '/student/homework', label: 'Assignments', icon: BookOpen },
  { to: '/student/payments', label: 'Payments', icon: CreditCard },
  { to: '/student/library', label: 'Library', icon: Library },
  { to: '/student/notices', label: 'Notices', icon: CalendarDays },
  { to: '/student/messages', label: 'Messages', icon: MessageSquare },
  { to: '/student/merit', label: 'Merit Record', icon: Award },
  { to: '/student/profile', label: 'My Profile', icon: User },
]

const parentNav: NavItem[] = [
  { to: '/parent', label: 'Home', icon: Home },
  { to: '/parent/teachers', label: "Child's Teachers", icon: UserSquare2 },
  { to: '/parent/marks', label: 'Marksheet', icon: ClipboardList },
  { to: '/parent/reports', label: 'Reports', icon: ScrollText },
  { to: '/parent/guidance', label: 'Care & Guidance', icon: Compass },
  { to: '/parent/timetable', label: 'Timetable', icon: Clock },
  { to: '/parent/assignments', label: 'Assignments', icon: BookOpen },
  { to: '/parent/payments', label: 'Payments', icon: CreditCard },
  { to: '/parent/notices', label: 'Notices', icon: CalendarDays },
  { to: '/parent/absence', label: 'Absence Requests', icon: CalendarOff },
  { to: '/parent/messages', label: 'Messages', icon: MessageSquare },
  { to: '/parent/pickup', label: 'Pickup Auth', icon: Users },
  { to: '/parent/profile', label: 'My Profile', icon: User },
]

export function AdminLayout() {
  return <AppShell nav={adminNav} role="admin" />
}
export function StaffLayout() {
  return <AppShell nav={staffNav} role="staff" />
}
export function StudentLayout() {
  return <AppShell nav={studentNav} role="student" />
}
export function ParentLayout() {
  return <AppShell nav={parentNav} role="parent" />
}
