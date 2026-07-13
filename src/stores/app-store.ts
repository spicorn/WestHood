import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type {
  ActivityEntry,
  ALevelStream,
  ClassRoom,
  Club,
  ClubMembership,
  ConsequenceStatus,
  DetentionRecord,
  ElectronicReport,
  ExamRegistration,
  ExamSitting,
  FeeStructure,
  GradeEntry,
  GuidanceNote,
  Homework,
  Invoice,
  LeadershipRole,
  LibraryBook,
  MeritRecord,
  Notice,
  NotificationItem,
  ParentInvite,
  PaymentMethod,
  PaymentRecord,
  PickupPerson,
  ReportStatus,
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
  clubMemberships as seedClubMemberships,
  clubs as seedClubs,
  detentionRecords as seedDetentions,
  electronicReports as seedReports,
  examRegistrations as seedExamRegs,
  examSittings as seedExamSittings,
  feeStructures as seedFeeStructures,
  grades as seedGrades,
  guidanceNotes as seedGuidance,
  homework as seedHomework,
  invoices as seedInvoices,
  libraryBooks as seedLibrary,
  meritRecords as seedMerit,
  notices as seedNotices,
  notifications as seedNotifications,
  parentInvites as seedInvites,
  paymentRecords as seedPayments,
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
import { applyPaymentToInvoice, makeReceiptRef, syncInvoiceTotals } from '@/lib/fees'

interface AppState {
  students: Student[]
  staff: StaffMember[]
  classes: ClassRoom[]
  subjects: Subject[]
  notices: Notice[]
  invoices: Invoice[]
  feeStructures: FeeStructure[]
  paymentRecords: PaymentRecord[]
  electronicReports: ElectronicReport[]
  detentionRecords: DetentionRecord[]
  guidanceNotes: GuidanceNote[]
  examSittings: ExamSitting[]
  examRegistrations: ExamRegistration[]
  clubs: Club[]
  clubMemberships: ClubMembership[]
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
  upsertFeeStructure: (f: FeeStructure) => void
  recordPayment: (input: {
    invoiceId: string
    amount: number
    method: PaymentMethod
    instalmentId?: string
    recordedBy: string
    mobileNumber?: string
  }) => PaymentRecord | null
  sendFeeReminders: (invoiceIds: string[], by: string) => number
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
  promoteClass: (fromClassId: string, toClassId: string, excludeIds: string[], streamByStudent?: Record<string, ALevelStream>) => void
  requestLibraryBook: (bookId: string, studentId: string) => void
  upsertReport: (r: ElectronicReport) => void
  setReportStatus: (id: string, status: ReportStatus) => void
  bulkFinalizeReports: (studentIds: string[], term: string) => number
  setPrincipalComment: (reportId: string, comment: string) => void
  addMeritWithEscalation: (m: MeritRecord) => { escalated: boolean }
  upsertDetention: (d: DetentionRecord) => void
  updateDetentionStatus: (id: string, status: ConsequenceStatus) => void
  addGuidanceNote: (n: GuidanceNote) => void
  upsertExamRegistration: (r: ExamRegistration) => void
  bulkRegisterClass: (sittingId: string, classId: string, subjectIds: string[]) => number
  upsertClub: (c: Club) => void
  joinClub: (clubId: string, studentId: string) => void
  leaveClub: (clubId: string, studentId: string) => void
  setLeadershipRole: (studentId: string, role: LeadershipRole) => void
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
      feeStructures: seedFeeStructures,
      paymentRecords: seedPayments,
      electronicReports: seedReports,
      detentionRecords: seedDetentions,
      guidanceNotes: seedGuidance,
      examSittings: seedExamSittings,
      examRegistrations: seedExamRegs,
      clubs: seedClubs,
      clubMemberships: seedClubMemberships,
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
          invoices: st.invoices.map((inv) =>
            inv.id === id ? syncInvoiceTotals({ ...inv, ...patch }) : inv,
          ),
        })),
      upsertFeeStructure: (f) =>
        set((st) => ({
          feeStructures: st.feeStructures.some((x) => x.id === f.id)
            ? st.feeStructures.map((x) => (x.id === f.id ? f : x))
            : [...st.feeStructures, f],
        })),
      recordPayment: ({ invoiceId, amount, method, instalmentId, recordedBy, mobileNumber }) => {
        const invoice = get().invoices.find((i) => i.id === invoiceId)
        if (!invoice || amount <= 0) return null
        const updated = applyPaymentToInvoice(invoice, amount, instalmentId)
        const record: PaymentRecord = {
          id: `pay-${Date.now()}`,
          invoiceId,
          instalmentId,
          amount,
          method,
          paidAt: new Date().toISOString(),
          reference: makeReceiptRef(method),
          recordedBy,
          mobileNumber,
        }
        const student = get().students.find((s) => s.id === invoice.studentId)
        set((st) => ({
          invoices: st.invoices.map((i) => (i.id === invoiceId ? updated : i)),
          paymentRecords: [record, ...st.paymentRecords],
          activities: [
            {
              id: `act-pay-${Date.now()}`,
              studentId: invoice.studentId,
              type: 'payment',
              title: `Fee payment received`,
              description: `${method} payment of $${amount.toFixed(2)} for ${student ? `${student.firstName} ${student.lastName}` : 'student'} — ref ${record.reference}`,
              status: 'Paid',
              date: new Date().toISOString().slice(0, 10),
              time: new Date().toTimeString().slice(0, 5),
            },
            ...st.activities,
          ],
        }))
        return record
      },
      sendFeeReminders: (invoiceIds, by) => {
        const invoices = get().invoices.filter((i) => invoiceIds.includes(i.id))
        const now = new Date()
        const activities: ActivityEntry[] = invoices.map((inv) => ({
          id: `act-rem-${inv.id}-${now.getTime()}`,
          studentId: inv.studentId,
          type: 'fee_reminder',
          title: 'Fee reminder sent',
          description: `Reminder for outstanding balance on ${inv.description} (sent by ${by})`,
          status: 'Sent',
          date: now.toISOString().slice(0, 10),
          time: now.toTimeString().slice(0, 5),
          flagged: true,
        }))
        set((st) => ({ activities: [...activities, ...st.activities] }))
        return activities.length
      },
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
                      ? {
                          ...s,
                          status,
                          submittedAt:
                            status === 'submitted' || status === 'late'
                              ? new Date().toISOString()
                              : s.submittedAt,
                        }
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
      addMeritWithEscalation: (m) => {
        const termStart = '2026-05-05'
        let escalated = false
        set((st) => {
          const next = [m, ...st.meritRecords]
          if (m.type === 'demerit' && m.severity === 'minor') {
            const minors = next.filter(
              (x) =>
                x.studentId === m.studentId &&
                x.type === 'demerit' &&
                x.severity === 'minor' &&
                x.date >= termStart,
            )
            if (minors.length >= 3) {
              escalated = true
              const marked = next.map((x) =>
                x.id === m.id || (x.studentId === m.studentId && x.severity === 'minor' && x.date >= termStart)
                  ? { ...x, escalated: true }
                  : x,
              )
              return {
                meritRecords: marked,
                students: st.students.map((s) =>
                  s.id === m.studentId ? { ...s, disciplineEscalated: true } : s,
                ),
                notifications: [
                  {
                    id: `nt-esc-${Date.now()}`,
                    role: 'admin' as const,
                    title: 'Discipline escalation',
                    body: `Student flagged for follow-up after ${minors.length} Minor entries this term.`,
                    time: 'Just now',
                    read: false,
                    href: `/admin/students/${m.studentId}`,
                  },
                  ...st.notifications,
                ],
                activities: [
                  {
                    id: `act-esc-${Date.now()}`,
                    studentId: m.studentId,
                    type: 'discipline' as const,
                    title: 'Flagged for follow-up',
                    description: `${minors.length} Minor entries this term — escalated to Head of Year`,
                    status: 'Escalated',
                    date: new Date().toISOString().slice(0, 10),
                    time: new Date().toTimeString().slice(0, 5),
                    flagged: true,
                  },
                  ...st.activities,
                ],
              }
            }
          }
          if (m.type === 'demerit' && (m.severity === 'major' || m.severity === 'serious')) {
            escalated = m.severity === 'serious'
            return {
              meritRecords: [{ ...m, escalated: escalated || m.escalated }, ...st.meritRecords],
              students: escalated
                ? st.students.map((s) => (s.id === m.studentId ? { ...s, disciplineEscalated: true } : s))
                : st.students,
            }
          }
          return { meritRecords: next }
        })
        return { escalated }
      },
      upsertDetention: (d) =>
        set((st) => ({
          detentionRecords: st.detentionRecords.some((x) => x.id === d.id)
            ? st.detentionRecords.map((x) => (x.id === d.id ? d : x))
            : [d, ...st.detentionRecords],
          activities: [
            {
              id: `act-det-${Date.now()}`,
              studentId: d.studentId,
              type: 'detention' as const,
              title: 'Detention scheduled',
              description: `${d.scheduledAt.slice(0, 16).replace('T', ' ')} — ${d.location}`,
              status: d.status === 'scheduled' ? 'Scheduled' : d.status,
              date: new Date().toISOString().slice(0, 10),
              time: new Date().toTimeString().slice(0, 5),
              flagged: true,
            },
            ...st.activities,
          ],
        })),
      updateDetentionStatus: (id, status) =>
        set((st) => ({
          detentionRecords: st.detentionRecords.map((d) => (d.id === id ? { ...d, status } : d)),
        })),
      addGuidanceNote: (n) =>
        set((st) => ({
          guidanceNotes: [n, ...st.guidanceNotes],
          activities: [
            {
              id: `act-guid-${Date.now()}`,
              studentId: n.studentId,
              type: 'guidance' as const,
              title: 'Career guidance note',
              description: `Interest: ${n.careerInterest}`,
              status: 'Logged',
              date: n.createdAt.slice(0, 10),
              time: n.createdAt.slice(11, 16) || '12:00',
            },
            ...st.activities,
          ],
        })),
      upsertExamRegistration: (r) =>
        set((st) => ({
          examRegistrations: st.examRegistrations.some((x) => x.id === r.id)
            ? st.examRegistrations.map((x) => (x.id === r.id ? r : x))
            : [...st.examRegistrations, r],
        })),
      bulkRegisterClass: (sittingId, classId, subjectIds) => {
        const classStudents = get().students.filter((s) => s.classId === classId && s.status === 'active')
        let count = 0
        set((st) => {
          const next = [...st.examRegistrations]
          classStudents.forEach((s, i) => {
            const existing = next.find((r) => r.sittingId === sittingId && r.studentId === s.id)
            if (existing) {
              Object.assign(existing, {
                subjectIds,
                status: 'registered' as const,
                candidateNumber: existing.candidateNumber || `ZW${2026500 + i}`,
              })
            } else {
              next.push({
                id: `reg-${sittingId}-${s.id}`,
                sittingId,
                studentId: s.id,
                subjectIds,
                candidateNumber: `ZW${2026500 + i}`,
                status: 'registered',
              })
            }
            count++
          })
          return { examRegistrations: next }
        })
        return count
      },
      upsertClub: (c) =>
        set((st) => ({
          clubs: st.clubs.some((x) => x.id === c.id)
            ? st.clubs.map((x) => (x.id === c.id ? c : x))
            : [...st.clubs, c],
        })),
      joinClub: (clubId, studentId) =>
        set((st) => {
          if (st.clubMemberships.some((m) => m.clubId === clubId && m.studentId === studentId)) return st
          const club = st.clubs.find((c) => c.id === clubId)
          return {
            clubMemberships: [
              { id: `cm-${Date.now()}`, clubId, studentId, joinedAt: new Date().toISOString().slice(0, 10) },
              ...st.clubMemberships,
            ],
            activities: [
              {
                id: `act-club-${Date.now()}`,
                studentId,
                type: 'club' as const,
                title: club?.name ?? 'Club',
                description: `Signed up for ${club?.name ?? 'club'}`,
                status: 'Joined',
                date: new Date().toISOString().slice(0, 10),
                time: new Date().toTimeString().slice(0, 5),
              },
              ...st.activities,
            ],
          }
        }),
      leaveClub: (clubId, studentId) =>
        set((st) => ({
          clubMemberships: st.clubMemberships.filter(
            (m) => !(m.clubId === clubId && m.studentId === studentId),
          ),
        })),
      setLeadershipRole: (studentId, role) =>
        set((st) => ({
          students: st.students.map((s) => (s.id === studentId ? { ...s, leadershipRole: role } : s)),
        })),
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
      promoteClass: (fromClassId, toClassId, excludeIds, streamByStudent) =>
        set((st) => ({
          students: st.students.map((s) =>
            s.classId === fromClassId && s.status === 'active' && !excludeIds.includes(s.id)
              ? {
                  ...s,
                  classId: toClassId,
                  alevelStream: streamByStudent?.[s.id] ?? s.alevelStream,
                }
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
      upsertReport: (r) =>
        set((st) => ({
          electronicReports: st.electronicReports.some((x) => x.id === r.id)
            ? st.electronicReports.map((x) => (x.id === r.id ? r : x))
            : [r, ...st.electronicReports],
        })),
      setReportStatus: (id, status) =>
        set((st) => ({
          electronicReports: st.electronicReports.map((r) => {
            if (r.id !== id) return r
            return {
              ...r,
              status,
              finalizedAt:
                status === 'finalized' || status === 'published'
                  ? r.finalizedAt ?? new Date().toISOString()
                  : r.finalizedAt,
              publishedAt: status === 'published' ? new Date().toISOString() : r.publishedAt,
            }
          }),
        })),
      bulkFinalizeReports: (studentIds, term) => {
        const now = new Date().toISOString()
        let count = 0
        set((st) => ({
          electronicReports: st.electronicReports.map((r) => {
            if (r.term !== term || !studentIds.includes(r.studentId) || r.status !== 'draft') return r
            count++
            return { ...r, status: 'finalized' as const, finalizedAt: now }
          }),
        }))
        return count
      },
      setPrincipalComment: (reportId, comment) =>
        set((st) => ({
          electronicReports: st.electronicReports.map((r) =>
            r.id === reportId ? { ...r, principalComment: comment } : r,
          ),
        })),
    }),
    {
      name: 'westwood-app-data-v4',
      partialize: (s) => ({
        students: s.students,
        staff: s.staff,
        classes: s.classes,
        notices: s.notices,
        invoices: s.invoices,
        feeStructures: s.feeStructures,
        paymentRecords: s.paymentRecords,
        electronicReports: s.electronicReports,
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
        detentionRecords: s.detentionRecords,
        guidanceNotes: s.guidanceNotes,
        examRegistrations: s.examRegistrations,
        clubs: s.clubs,
        clubMemberships: s.clubMemberships,
      }),
    },
  ),
)
