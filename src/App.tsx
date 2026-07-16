import { Navigate, Route, Routes } from 'react-router-dom'
import { Toaster } from 'sonner'
import { RedirectHome, RequireAuth } from '@/components/layout/route-guards'
import {
  AdminLayout,
  ParentLayout,
  StaffLayout,
  StudentLayout,
} from '@/components/layout/role-layouts'
import { LoginPage } from '@/pages/login'

import AdminDashboard from '@/pages/admin/dashboard'
import AdminStudents from '@/pages/admin/students'
import AdminStudentDetail from '@/pages/admin/student-detail'
import AdminClasses from '@/pages/admin/classes'
import AdminStaff from '@/pages/admin/staff'
import AdminSubjects from '@/pages/admin/subjects'
import AdminExams from '@/pages/admin/exams'
import AdminExamRegistration from '@/pages/admin/exam-registration'
import AdminDiscipline from '@/pages/admin/discipline'
import AdminClubs from '@/pages/admin/clubs'
import AdminLeadership from '@/pages/admin/leadership'
import AdminTimetable from '@/pages/admin/timetable'
import AdminNotices from '@/pages/admin/notices'
import AdminFinancials from '@/pages/admin/financials'
import AdminReports from '@/pages/admin/reports'
import AdminPredictions from '@/pages/admin/predictions'
import AdminStaffAttendance from '@/pages/admin/staff-attendance'
import AdminSettings from '@/pages/admin/settings'
import AdminProfile from '@/pages/admin/profile'
import AdminAbsenceRequests from '@/pages/admin/absence-requests'
import AdminMessages from '@/pages/admin/messages'
import AdminAuditLog from '@/pages/admin/audit-log'
import AdminAdmissions from '@/pages/admin/admissions'
import AdminAnalyticsExport from '@/pages/admin/analytics-export'

import StaffHome from '@/pages/staff/home'
import StaffMyClass from '@/pages/staff/my-class'
import StaffAttendance from '@/pages/staff/attendance'
import StaffExams from '@/pages/staff/exams'
import StaffDiscipline from '@/pages/staff/discipline'
import StaffClubs from '@/pages/staff/clubs'
import StaffTimetable from '@/pages/staff/timetable'
import StaffMaterials from '@/pages/staff/materials'
import StaffHomework from '@/pages/staff/homework'
import StaffNotices from '@/pages/staff/notices'
import StaffPredictions from '@/pages/staff/predictions'
import StaffProfile from '@/pages/staff/profile'
import StaffSettings from '@/pages/staff/settings'
import StaffAbsenceRequests from '@/pages/staff/absence-requests'
import StaffMessages from '@/pages/staff/messages'

import StudentHome from '@/pages/student/home'
import StudentTeachers from '@/pages/student/teachers'
import StudentSubjects from '@/pages/student/subjects'
import StudentMarks from '@/pages/student/marks'
import StudentTimetable from '@/pages/student/timetable'
import StudentPayments from '@/pages/student/payments'
import StudentLibrary from '@/pages/student/library'
import StudentNotices from '@/pages/student/notices'
import StudentMerit from '@/pages/student/merit'
import StudentClubs from '@/pages/student/clubs'
import StudentReports from '@/pages/student/reports'
import StudentProfile from '@/pages/student/profile'
import StudentSettings from '@/pages/student/settings'
import StudentHomework from '@/pages/student/homework'
import StudentMessages from '@/pages/student/messages'

import ParentHome from '@/pages/parent/home'
import ParentTeachers from '@/pages/parent/teachers'
import ParentMarks from '@/pages/parent/marks'
import ParentTimetable from '@/pages/parent/timetable'
import ParentPayments from '@/pages/parent/payments'
import ParentReports from '@/pages/parent/reports'
import ParentGuidance from '@/pages/parent/guidance'
import ParentNotices from '@/pages/parent/notices'
import ParentPickup from '@/pages/parent/pickup'
import ParentProfile from '@/pages/parent/profile'
import ParentSettings from '@/pages/parent/settings'
import ParentAbsence from '@/pages/parent/absence'
import ParentAssignments from '@/pages/parent/assignments'
import ParentMessages from '@/pages/parent/messages'

export default function App() {
  return (
    <>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/" element={<RedirectHome />} />

        <Route element={<RequireAuth role="admin" />}>
          <Route path="/admin" element={<AdminLayout />}>
            <Route index element={<AdminDashboard />} />
            <Route path="students" element={<AdminStudents />} />
            <Route path="students/:id" element={<AdminStudentDetail />} />
            <Route path="classes" element={<AdminClasses />} />
            <Route path="staff" element={<AdminStaff />} />
            <Route path="subjects" element={<AdminSubjects />} />
            <Route path="exams" element={<AdminExams />} />
            <Route path="exam-registration" element={<AdminExamRegistration />} />
            <Route path="discipline" element={<AdminDiscipline />} />
            <Route path="clubs" element={<AdminClubs />} />
            <Route path="leadership" element={<AdminLeadership />} />
            <Route path="timetable" element={<AdminTimetable />} />
            <Route path="notices" element={<AdminNotices />} />
            <Route path="financials" element={<AdminFinancials />} />
            <Route path="reports" element={<AdminReports />} />
            <Route path="predictions" element={<AdminPredictions />} />
            <Route path="staff-attendance" element={<AdminStaffAttendance />} />
            <Route path="absence-requests" element={<AdminAbsenceRequests />} />
            <Route path="messages" element={<AdminMessages />} />
            <Route path="audit-log" element={<AdminAuditLog />} />
            <Route path="admissions" element={<AdminAdmissions />} />
            <Route path="analytics-export" element={<AdminAnalyticsExport />} />
            <Route path="settings" element={<AdminSettings />} />
            <Route path="profile" element={<AdminProfile />} />
          </Route>
        </Route>

        <Route element={<RequireAuth role="staff" />}>
          <Route path="/staff" element={<StaffLayout />}>
            <Route index element={<StaffHome />} />
            <Route path="my-class" element={<StaffMyClass />} />
            <Route path="attendance" element={<StaffAttendance />} />
            <Route path="exams" element={<StaffExams />} />
            <Route path="discipline" element={<StaffDiscipline />} />
            <Route path="clubs" element={<StaffClubs />} />
            <Route path="timetable" element={<StaffTimetable />} />
            <Route path="materials" element={<StaffMaterials />} />
            <Route path="homework" element={<StaffHomework />} />
            <Route path="predictions" element={<StaffPredictions />} />
            <Route path="notices" element={<StaffNotices />} />
            <Route path="absence-requests" element={<StaffAbsenceRequests />} />
            <Route path="messages" element={<StaffMessages />} />
            <Route path="profile" element={<StaffProfile />} />
            <Route path="settings" element={<StaffSettings />} />
          </Route>
        </Route>

        <Route element={<RequireAuth role="student" />}>
          <Route path="/student" element={<StudentLayout />}>
            <Route index element={<StudentHome />} />
            <Route path="teachers" element={<StudentTeachers />} />
            <Route path="subjects" element={<StudentSubjects />} />
            <Route path="marks" element={<StudentMarks />} />
            <Route path="reports" element={<StudentReports />} />
            <Route path="timetable" element={<StudentTimetable />} />
            <Route path="payments" element={<StudentPayments />} />
            <Route path="library" element={<StudentLibrary />} />
            <Route path="notices" element={<StudentNotices />} />
            <Route path="merit" element={<StudentMerit />} />
            <Route path="clubs" element={<StudentClubs />} />
            <Route path="homework" element={<StudentHomework />} />
            <Route path="messages" element={<StudentMessages />} />
            <Route path="profile" element={<StudentProfile />} />
            <Route path="settings" element={<StudentSettings />} />
          </Route>
        </Route>

        <Route element={<RequireAuth role="parent" />}>
          <Route path="/parent" element={<ParentLayout />}>
            <Route index element={<ParentHome />} />
            <Route path="teachers" element={<ParentTeachers />} />
            <Route path="marks" element={<ParentMarks />} />
            <Route path="reports" element={<ParentReports />} />
            <Route path="guidance" element={<ParentGuidance />} />
            <Route path="timetable" element={<ParentTimetable />} />
            <Route path="payments" element={<ParentPayments />} />
            <Route path="notices" element={<ParentNotices />} />
            <Route path="absence" element={<ParentAbsence />} />
            <Route path="assignments" element={<ParentAssignments />} />
            <Route path="messages" element={<ParentMessages />} />
            <Route path="pickup" element={<ParentPickup />} />
            <Route path="profile" element={<ParentProfile />} />
            <Route path="settings" element={<ParentSettings />} />
          </Route>
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      <Toaster richColors position="top-right" closeButton />
    </>
  )
}
