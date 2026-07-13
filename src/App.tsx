import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
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
import AdminTimetable from '@/pages/admin/timetable'
import AdminNotices from '@/pages/admin/notices'
import AdminFinancials from '@/pages/admin/financials'
import AdminStaffAttendance from '@/pages/admin/staff-attendance'
import AdminSettings from '@/pages/admin/settings'
import AdminProfile from '@/pages/admin/profile'

import StaffHome from '@/pages/staff/home'
import StaffMyClass from '@/pages/staff/my-class'
import StaffAttendance from '@/pages/staff/attendance'
import StaffExams from '@/pages/staff/exams'
import StaffTimetable from '@/pages/staff/timetable'
import StaffMaterials from '@/pages/staff/materials'
import StaffHomework from '@/pages/staff/homework'
import StaffNotices from '@/pages/staff/notices'
import StaffProfile from '@/pages/staff/profile'
import StaffSettings from '@/pages/staff/settings'

import StudentHome from '@/pages/student/home'
import StudentTeachers from '@/pages/student/teachers'
import StudentSubjects from '@/pages/student/subjects'
import StudentMarks from '@/pages/student/marks'
import StudentTimetable from '@/pages/student/timetable'
import StudentPayments from '@/pages/student/payments'
import StudentLibrary from '@/pages/student/library'
import StudentNotices from '@/pages/student/notices'
import StudentMerit from '@/pages/student/merit'
import StudentProfile from '@/pages/student/profile'
import StudentSettings from '@/pages/student/settings'
import StudentHomework from '@/pages/student/homework'

import ParentHome from '@/pages/parent/home'
import ParentTeachers from '@/pages/parent/teachers'
import ParentMarks from '@/pages/parent/marks'
import ParentTimetable from '@/pages/parent/timetable'
import ParentPayments from '@/pages/parent/payments'
import ParentNotices from '@/pages/parent/notices'
import ParentPickup from '@/pages/parent/pickup'
import ParentProfile from '@/pages/parent/profile'
import ParentSettings from '@/pages/parent/settings'

export default function App() {
  return (
    <BrowserRouter>
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
            <Route path="timetable" element={<AdminTimetable />} />
            <Route path="notices" element={<AdminNotices />} />
            <Route path="financials" element={<AdminFinancials />} />
            <Route path="staff-attendance" element={<AdminStaffAttendance />} />
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
            <Route path="timetable" element={<StaffTimetable />} />
            <Route path="materials" element={<StaffMaterials />} />
            <Route path="homework" element={<StaffHomework />} />
            <Route path="notices" element={<StaffNotices />} />
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
            <Route path="timetable" element={<StudentTimetable />} />
            <Route path="payments" element={<StudentPayments />} />
            <Route path="library" element={<StudentLibrary />} />
            <Route path="notices" element={<StudentNotices />} />
            <Route path="merit" element={<StudentMerit />} />
            <Route path="homework" element={<StudentHomework />} />
            <Route path="profile" element={<StudentProfile />} />
            <Route path="settings" element={<StudentSettings />} />
          </Route>
        </Route>

        <Route element={<RequireAuth role="parent" />}>
          <Route path="/parent" element={<ParentLayout />}>
            <Route index element={<ParentHome />} />
            <Route path="teachers" element={<ParentTeachers />} />
            <Route path="marks" element={<ParentMarks />} />
            <Route path="timetable" element={<ParentTimetable />} />
            <Route path="payments" element={<ParentPayments />} />
            <Route path="notices" element={<ParentNotices />} />
            <Route path="pickup" element={<ParentPickup />} />
            <Route path="profile" element={<ParentProfile />} />
            <Route path="settings" element={<ParentSettings />} />
          </Route>
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      <Toaster richColors position="top-right" closeButton />
    </BrowserRouter>
  )
}
