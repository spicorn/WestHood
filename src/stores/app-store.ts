import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type {
  ActivityEntry,
  ClassRoom,
  GradeEntry,
  Homework,
  Invoice,
  LibraryBook,
  MeritRecord,
  Notice,
  NotificationItem,
  ParentInvite,
  PickupPerson,
  SchoolSettings,
  StaffMember,
  StaffPeriodAttendance,
  Student,
  StudentAttendance,
  StudyMaterial,
  Subject,
  TimetableSlot,
} from '@/data/types'
import {
  activities as seedActivities,
  classes as seedClasses,
  grades as seedGrades,
  homework as seedHomework,
  invoices as seedInvoices,
  libraryBooks as seedLibrary,
  meritRecords as seedMerit,
  notices as seedNotices,
  notifications as seedNotifications,
  parentInvites as seedInvites,
  pickupPeople as seedPickup,
  schoolSettings as seedSettings,
  staff as seedStaff,
  staffPeriodAttendance as seedStaffAtt,
  students as seedStudents,
  studentAttendance as seedStuAtt,
  studyMaterials as seedMaterials,
  subjects as seedSubjects,
  timetable as seedTimetable,
} from '@/data/mock-data'

interface AppState {
  students: Student[]
  staff: StaffMember[]
  classes: ClassRoom[]
  subjects: Subject[]
  notices: Notice[]
  invoices: Invoice[]
  grades: GradeEntry[]
  timetable: TimetableSlot[]
  staffAttendance: StaffPeriodAttendance[]
  studentAttendance: StudentAttendance[]
  homework: Homework[]
  libraryBooks: LibraryBook[]
  studyMaterials: StudyMaterial[]
  meritRecords: MeritRecord[]
  activities: ActivityEntry[]
  parentInvites: ParentInvite[]
  pickupPeople: PickupPerson[]
  notifications: NotificationItem[]
  settings: SchoolSettings
  selectedChildId: string
  setSelectedChildId: (id: string) => void
  upsertStudent: (s: Student) => void
  archiveStudent: (id: string, archive: boolean) => void
  upsertStaff: (s: StaffMember) => void
  upsertClass: (c: ClassRoom) => void
  upsertSubject: (s: Subject) => void
  upsertNotice: (n: Notice) => void
  deleteNotice: (id: string) => void
  updateInvoice: (id: string, patch: Partial<Invoice>) => void
  upsertGrade: (g: GradeEntry) => void
  upsertTimetableSlot: (slot: TimetableSlot) => void
  updateStaffAttendance: (id: string, patch: Partial<StaffPeriodAttendance>) => void
  addStaffAttendance: (r: StaffPeriodAttendance) => void
  setStudentAttendanceBatch: (records: StudentAttendance[]) => void
  upsertHomework: (h: Homework) => void
  updateHomeworkSubmission: (hwId: string, studentId: string, status: Homework['submissions'][0]['status']) => void
  addStudyMaterial: (m: StudyMaterial) => void
  addMerit: (m: MeritRecord) => void
  addActivity: (a: ActivityEntry) => void
  upsertInvite: (i: ParentInvite) => void
  upsertPickup: (p: PickupPerson) => void
  removePickup: (id: string) => void
  markNotificationsRead: (role: string) => void
  updateSettings: (s: Partial<SchoolSettings>) => void
  promoteClass: (fromClassId: string, toClassId: string, excludeIds: string[]) => void
  requestLibraryBook: (bookId: string, studentId: string) => void
}

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      students: seedStudents,
      staff: seedStaff,
      classes: seedClasses,
      subjects: seedSubjects,
      notices: seedNotices,
      invoices: seedInvoices,
      grades: seedGrades,
      timetable: seedTimetable,
      staffAttendance: seedStaffAtt,
      studentAttendance: seedStuAtt,
      homework: seedHomework,
      libraryBooks: seedLibrary,
      studyMaterials: seedMaterials,
      meritRecords: seedMerit,
      activities: seedActivities,
      parentInvites: seedInvites,
      pickupPeople: seedPickup,
      notifications: seedNotifications,
      settings: seedSettings,
      selectedChildId: 'stu-kelvin',
      setSelectedChildId: (id) => set({ selectedChildId: id }),
      upsertStudent: (s) =>
        set((st) => ({
          students: st.students.some((x) => x.id === s.id)
            ? st.students.map((x) => (x.id === s.id ? s : x))
            : [...st.students, s],
        })),
      archiveStudent: (id, archive) =>
        set((st) => ({
          students: st.students.map((s) => (s.id === id ? { ...s, status: archive ? 'archived' : 'active' } : s)),
        })),
      upsertStaff: (s) =>
        set((st) => ({
          staff: st.staff.some((x) => x.id === s.id)
            ? st.staff.map((x) => (x.id === s.id ? s : x))
            : [...st.staff, s],
        })),
      upsertClass: (c) =>
        set((st) => ({
          classes: st.classes.some((x) => x.id === c.id)
            ? st.classes.map((x) => (x.id === c.id ? c : x))
            : [...st.classes, c],
        })),
      upsertSubject: (s) =>
        set((st) => ({
          subjects: st.subjects.some((x) => x.id === s.id)
            ? st.subjects.map((x) => (x.id === s.id ? s : x))
            : [...st.subjects, s],
        })),
      upsertNotice: (n) =>
        set((st) => ({
          notices: st.notices.some((x) => x.id === n.id)
            ? st.notices.map((x) => (x.id === n.id ? n : x))
            : [n, ...st.notices],
        })),
      deleteNotice: (id) => set((st) => ({ notices: st.notices.filter((n) => n.id !== id) })),
      updateInvoice: (id, patch) =>
        set((st) => ({
          invoices: st.invoices.map((inv) => (inv.id === id ? { ...inv, ...patch } : inv)),
        })),
      upsertGrade: (g) =>
        set((st) => ({
          grades: st.grades.some((x) => x.id === g.id)
            ? st.grades.map((x) => (x.id === g.id ? g : x))
            : [...st.grades, g],
        })),
      upsertTimetableSlot: (slot) =>
        set((st) => ({
          timetable: st.timetable.some((x) => x.id === slot.id)
            ? st.timetable.map((x) => (x.id === slot.id ? slot : x))
            : [...st.timetable, slot],
        })),
      updateStaffAttendance: (id, patch) =>
        set((st) => ({
          staffAttendance: st.staffAttendance.map((r) => (r.id === id ? { ...r, ...patch } : r)),
        })),
      addStaffAttendance: (r) => set((st) => ({ staffAttendance: [...st.staffAttendance, r] })),
      setStudentAttendanceBatch: (records) =>
        set((st) => {
          const dates = new Set(records.map((r) => `${r.classId}-${r.date}`))
          const kept = st.studentAttendance.filter((r) => !dates.has(`${r.classId}-${r.date}`))
          return { studentAttendance: [...kept, ...records] }
        }),
      upsertHomework: (h) =>
        set((st) => ({
          homework: st.homework.some((x) => x.id === h.id)
            ? st.homework.map((x) => (x.id === h.id ? h : x))
            : [...st.homework, h],
        })),
      updateHomeworkSubmission: (hwId, studentId, status) =>
        set((st) => ({
          homework: st.homework.map((h) =>
            h.id !== hwId
              ? h
              : {
                  ...h,
                  submissions: h.submissions.map((s) =>
                    s.studentId === studentId
                      ? { ...s, status, submittedAt: status === 'submitted' || status === 'late' ? new Date().toISOString() : s.submittedAt }
                      : s,
                  ),
                },
          ),
          activities:
            status === 'missing'
              ? [
                  {
                    id: `act-${Date.now()}`,
                    studentId,
                    type: 'homework' as const,
                    title: st.homework.find((h) => h.id === hwId)?.title ?? 'Homework',
                    description: 'Homework marked missing after due date',
                    status: 'Missing',
                    date: new Date().toISOString().slice(0, 10),
                    time: new Date().toTimeString().slice(0, 5),
                    flagged: true,
                  },
                  ...st.activities,
                ]
              : st.activities,
        })),
      addStudyMaterial: (m) => set((st) => ({ studyMaterials: [m, ...st.studyMaterials] })),
      addMerit: (m) => set((st) => ({ meritRecords: [m, ...st.meritRecords] })),
      addActivity: (a) => set((st) => ({ activities: [a, ...st.activities] })),
      upsertInvite: (i) =>
        set((st) => ({
          parentInvites: st.parentInvites.some((x) => x.id === i.id)
            ? st.parentInvites.map((x) => (x.id === i.id ? i : x))
            : [i, ...st.parentInvites],
        })),
      upsertPickup: (p) =>
        set((st) => ({
          pickupPeople: st.pickupPeople.some((x) => x.id === p.id)
            ? st.pickupPeople.map((x) => (x.id === p.id ? p : x))
            : [...st.pickupPeople, p],
        })),
      removePickup: (id) => set((st) => ({ pickupPeople: st.pickupPeople.filter((p) => p.id !== id) })),
      markNotificationsRead: (role) =>
        set((st) => ({
          notifications: st.notifications.map((n) =>
            n.role === role || n.role === 'all' ? { ...n, read: true } : n,
          ),
        })),
      updateSettings: (s) => set((st) => ({ settings: { ...st.settings, ...s } })),
      promoteClass: (fromClassId, toClassId, excludeIds) =>
        set((st) => ({
          students: st.students.map((s) =>
            s.classId === fromClassId && s.status === 'active' && !excludeIds.includes(s.id)
              ? { ...s, classId: toClassId }
              : s,
          ),
        })),
      requestLibraryBook: (bookId, studentId) => {
        const book = get().libraryBooks.find((b) => b.id === bookId)
        if (!book || book.status !== 'available') return
        set((st) => ({
          libraryBooks: st.libraryBooks.map((b) =>
            b.id === bookId
              ? {
                  ...b,
                  status: 'issued',
                  issuedTo: studentId,
                  dueDate: new Date(Date.now() + 14 * 86400000).toISOString().slice(0, 10),
                }
              : b,
          ),
        }))
      },
    }),
    {
      name: 'westwood-app-data-v2',
      partialize: (s) => ({
        students: s.students,
        staff: s.staff,
        classes: s.classes,
        notices: s.notices,
        invoices: s.invoices,
        grades: s.grades,
        timetable: s.timetable,
        staffAttendance: s.staffAttendance,
        studentAttendance: s.studentAttendance,
        homework: s.homework,
        activities: s.activities,
        parentInvites: s.parentInvites,
        pickupPeople: s.pickupPeople,
        selectedChildId: s.selectedChildId,
        settings: s.settings,
        meritRecords: s.meritRecords,
        studyMaterials: s.studyMaterials,
        libraryBooks: s.libraryBooks,
        notifications: s.notifications,
      }),
    },
  ),
)
