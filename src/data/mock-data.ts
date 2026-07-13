import type {
  ActivityEntry,
  ClassRoom,
  Club,
  ClubMembership,
  CommentPhrase,
  DetentionRecord,
  ElectronicReport,
  Exam,
  ExamRegistration,
  ExamSitting,
  FeeStructure,
  GradeEntry,
  GuidanceNote,
  Homework,
  Invoice,
  LibraryBook,
  MeritRecord,
  Notice,
  NotificationItem,
  ParentGuardian,
  ParentInvite,
  PaymentRecord,
  PickupPerson,
  ReadingLog,
  SchoolSettings,
  StaffMember,
  StaffPeriodAttendance,
  Student,
  StudentAttendance,
  StudyMaterial,
  Subject,
  TimetableSlot,
  UserAccount,
} from './types'

export const schoolSettings: SchoolSettings = {
  name: 'Westwood College',
  tagline: 'Visus Manifestus.',
  address: '12 Borrowdale Road, Harare, Zimbabwe',
  phone: '+263 242 885 120',
  email: 'info@westwood.co.zw',
  academicYear: '2026',
  currentTerm: 'Term 2 2026',
  termStart: '2026-05-05',
  termEnd: '2026-08-07',
}

export const demoAccounts: UserAccount[] = [
  {
    id: 'u-admin',
    email: 'admin@westwood.co.zw',
    username: 'admin',
    password: 'admin',
    role: 'admin',
    name: 'Dancel Mautsa',
    phone: '+263 77 100 2001',
  },
  {
    id: 'u-staff',
    email: 'staff@westwood.co.zw',
    username: 'staff',
    password: 'staff',
    role: 'staff',
    name: 'Ngoni Mautsa',
    phone: '+263 77 100 2002',
  },
  {
    id: 'u-parent',
    email: 'parent@westwood.co.zw',
    username: 'parent',
    password: 'parent',
    role: 'parent',
    name: 'Dancel Mautsa',
    phone: '+263 77 100 2003',
  },
  {
    id: 'u-student',
    email: 'student@westwood.co.zw',
    username: 'student',
    password: 'student',
    role: 'student',
    name: 'Kelvin Mautsa',
    phone: '+263 77 100 2004',
  },
]

export const classes: ClassRoom[] = [
  { id: 'c-f1', name: 'Form 1', grade: 'Form 1', level: 'olevel', color: '#82E0AA', capacity: 35, classTeacherId: 'st-farai' },
  { id: 'c-f2', name: 'Form 2', grade: 'Form 2', level: 'olevel', color: '#AF7AC5', capacity: 35, classTeacherId: 'st-tatenda' },
  { id: 'c-f3', name: 'Form 3', grade: 'Form 3', level: 'olevel', color: '#5DADE2', capacity: 36, classTeacherId: 'st-tinashe' },
  { id: 'c-f4', name: 'Form 4', grade: 'Form 4', level: 'olevel', color: '#5D6D7E', capacity: 36, classTeacherId: 'st-chipo' },
  { id: 'c-l6', name: 'Lower Sixth', grade: 'Lower Sixth', level: 'alevel', color: '#1A5276', capacity: 28, classTeacherId: 'st-blessing' },
  { id: 'c-u6', name: 'Upper Sixth', grade: 'Upper Sixth', level: 'alevel', color: '#0E6655', capacity: 26, classTeacherId: 'st-sharon' },
]

export const subjects: Subject[] = [
  { id: 'sub-maths', name: 'Mathematics', code: 'MATH', teacherIds: ['st-chipo', 'st-tatenda'], classIds: ['c-f1', 'c-f2', 'c-f3', 'c-f4', 'c-l6', 'c-u6'] },
  { id: 'sub-eng', name: 'English Language', code: 'ENG', teacherIds: ['st-nyasha', 'st-farai'], classIds: ['c-f1', 'c-f2', 'c-f3', 'c-f4', 'c-l6', 'c-u6'] },
  { id: 'sub-sci', name: 'Combined Science', code: 'SCI', teacherIds: ['st-tinashe', 'st-blessing'], classIds: ['c-f1', 'c-f2', 'c-f3', 'c-f4'] },
  { id: 'sub-shona', name: 'Shona', code: 'SHO', teacherIds: ['st-ruth'], classIds: ['c-f1', 'c-f2', 'c-f3', 'c-f4'] },
  { id: 'sub-ict', name: 'ICT', code: 'ICT', teacherIds: ['st-kudzai'], classIds: ['c-f2', 'c-f3', 'c-f4', 'c-l6'] },
  { id: 'sub-geo', name: 'Geography', code: 'GEO', teacherIds: ['st-sharon'], classIds: ['c-f2', 'c-f3', 'c-f4', 'c-l6', 'c-u6'] },
  { id: 'sub-hist', name: 'History', code: 'HIST', teacherIds: ['st-farai'], classIds: ['c-f2', 'c-f3', 'c-f4', 'c-l6'] },
  { id: 'sub-pe', name: 'Physical Education', code: 'PE', teacherIds: ['st-james'], classIds: ['c-f1', 'c-f2', 'c-f3', 'c-f4'] },
  { id: 'sub-acc', name: 'Accounts', code: 'ACC', teacherIds: ['st-tatenda'], classIds: ['c-f3', 'c-f4', 'c-l6', 'c-u6'] },
  { id: 'sub-agri', name: 'Agriculture', code: 'AGRI', teacherIds: ['st-james'], classIds: ['c-f2', 'c-f3', 'c-f4'] },
]

export const staff: StaffMember[] = [
  {
    id: 'st-chipo',
    name: 'Chipo Ncube',
    email: 'staff@westwood.co.zw',
    phone: '+263 77 211 1001',
    subjects: ['sub-maths'],
    classIds: ['c-f3', 'c-f4'],
    isClassTeacher: true,
    classTeacherOf: 'c-f4',
    status: 'active',
    bio: 'Mathematics specialist and Form 4 class teacher. Guidance mentor for O-Level candidates.',
    userId: 'u-staff',
  },
  {
    id: 'st-tinashe',
    name: 'Tinashe Dube',
    email: 'tinashe.dube@westwood.co.zw',
    phone: '+263 77 211 1002',
    subjects: ['sub-sci'],
    classIds: ['c-f2', 'c-f3', 'c-f4'],
    isClassTeacher: true,
    classTeacherOf: 'c-f3',
    status: 'active',
    bio: 'Combined Science teacher and Science Club coordinator.',
    userId: 'u-st-tinashe',
  },
  {
    id: 'st-farai',
    name: 'Farai Mhlanga',
    email: 'farai.mhlanga@westwood.co.zw',
    phone: '+263 77 211 1003',
    subjects: ['sub-eng', 'sub-hist'],
    classIds: ['c-f1', 'c-f2', 'c-f4'],
    isClassTeacher: true,
    classTeacherOf: 'c-f1',
    status: 'active',
    bio: 'English & History. Leads the debating society.',
    userId: 'u-st-farai',
  },
  {
    id: 'st-tatenda',
    name: 'Tatenda Chirwa',
    email: 'tatenda.chirwa@westwood.co.zw',
    phone: '+263 77 211 1004',
    subjects: ['sub-maths', 'sub-acc'],
    classIds: ['c-f2', 'c-f4', 'c-l6'],
    isClassTeacher: true,
    classTeacherOf: 'c-f2',
    status: 'active',
    bio: 'O-Level Maths and Accounts. Former banking professional.',
    userId: 'u-st-tatenda',
  },
  {
    id: 'st-nyasha',
    name: 'Nyasha Gumbo',
    email: 'nyasha.gumbo@westwood.co.zw',
    phone: '+263 77 211 1005',
    subjects: ['sub-eng'],
    classIds: ['c-f4', 'c-l6', 'c-u6'],
    isClassTeacher: false,
    status: 'active',
    bio: 'Cambridge English specialist. Focus on essay writing.',
    userId: 'u-st-nyasha',
  },
  {
    id: 'st-blessing',
    name: 'Blessing Sibanda',
    email: 'blessing.sibanda@westwood.co.zw',
    phone: '+263 77 211 1006',
    subjects: ['sub-sci'],
    classIds: ['c-f4', 'c-l6', 'c-u6'],
    isClassTeacher: true,
    classTeacherOf: 'c-l6',
    status: 'active',
    bio: 'A-Level Sciences. PhD candidate in Chemistry.',
    userId: 'u-st-blessing',
  },
  {
    id: 'st-sharon',
    name: 'Sharon Moyo',
    email: 'sharon.moyo@westwood.co.zw',
    phone: '+263 77 211 1007',
    subjects: ['sub-geo'],
    classIds: ['c-f2', 'c-f4', 'c-l6', 'c-u6'],
    isClassTeacher: true,
    classTeacherOf: 'c-u6',
    status: 'active',
    bio: 'Geography and Environmental Studies. Career guidance advisor.',
    userId: 'u-st-sharon',
  },
  {
    id: 'st-ruth',
    name: 'Ruth Chikwanha',
    email: 'ruth.chikwanha@westwood.co.zw',
    phone: '+263 77 211 1008',
    subjects: ['sub-shona'],
    classIds: ['c-f1', 'c-f2', 'c-f3', 'c-f4'],
    isClassTeacher: false,
    status: 'active',
    bio: 'Shona language and cultural studies.',
    userId: 'u-st-ruth',
  },
  {
    id: 'st-kudzai',
    name: 'Kudzai Mapfumo',
    email: 'kudzai.mapfumo@westwood.co.zw',
    phone: '+263 77 211 1009',
    subjects: ['sub-ict'],
    classIds: ['c-f2', 'c-f3', 'c-f4', 'c-l6'],
    isClassTeacher: false,
    status: 'active',
    bio: 'ICT and Digital Literacy across the secondary school.',
    userId: 'u-st-kudzai',
  },
  {
    id: 'st-james',
    name: 'James Phiri',
    email: 'james.phiri@westwood.co.zw',
    phone: '+263 77 211 1010',
    subjects: ['sub-pe', 'sub-agri'],
    classIds: ['c-f1', 'c-f2', 'c-f3', 'c-f4'],
    isClassTeacher: false,
    status: 'active',
    bio: 'PE coach, Agriculture practicals lead, and First XV coach.',
    userId: 'u-st-james',
  },
]

const firstNames = [
  'Kelvin', 'Ngonidzashe', 'Blessing', 'Nyasha', 'Tafadzwa', 'Rutendo', 'Panashe', 'Anesu',
  'Tatenda', 'Chiedza', 'Munashe', 'Ruvimbo', 'Takudzwa', 'Vimbai', 'Kudzai', 'Tendai',
  'Sharon', 'Farai', 'Lisa', 'David', 'Grace', 'Ethan', 'Olivia', 'Noah', 'Aisha', 'Brian',
  'Michelle', 'Sean', 'Thandi', 'Craig', 'Precious', 'Junior', 'Faith', 'Ryan', 'Angela',
  'Patrick', 'Lorraine', 'Desmond', 'Memory', 'Collins', 'Susan', 'Peter', 'Helen', 'Mark',
  'Joyce', 'Simon', 'Claire', 'Walter', 'Diana', 'Victor', 'Irene', 'Gabriel', 'Naomi',
]
const lastNames = [
  'Mutasa', 'Ndlovu', 'Chikwanha', 'Moyo', 'Sibanda', 'Dube', 'Mhlanga', 'Chirwa',
  'Gumbo', 'Mapfumo', 'Phiri', 'Makoni', 'Zulu', 'Banda', 'Nyoni', 'Shumba', 'Kurewa',
  'Hove', 'Mugabe', 'Choto', 'Marufu', 'Gwaze', 'Jena', 'Masuku', 'Tshuma',
]

function buildStudents(): Student[] {
  const classIds = ['c-f1', 'c-f2', 'c-f3', 'c-f4', 'c-l6', 'c-u6']
  const perClass = [8, 9, 9, 10, 7, 6]
  const list: Student[] = []
  let i = 0
  classIds.forEach((classId, ci) => {
    for (let j = 0; j < perClass[ci]; j++) {
      // Demo siblings for parent login — Form 4 slots 0 and 1
      const isKelvin = classId === 'c-f4' && j === 0
      const isTariro = classId === 'c-f4' && j === 1
      const firstName = isKelvin ? 'Kelvin' : isTariro ? 'Tariro' : firstNames[i % firstNames.length]
      const lastName = isKelvin || isTariro ? 'Mutasa' : lastNames[i % lastNames.length]
      const id = isKelvin ? 'stu-kelvin' : isTariro ? 'stu-tariro' : `stu-${String(i + 1).padStart(3, '0')}`
      let leadershipRole: Student['leadershipRole'] = 'none'
      if (isTariro) leadershipRole = 'prefect'
      if (classId === 'c-u6' && j === 0) leadershipRole = 'head_boy'
      if (classId === 'c-u6' && j === 1) leadershipRole = 'head_girl'
      if (classId === 'c-f4' && j === 2) leadershipRole = 'class_captain'
      if (classId === 'c-l6' && j === 0) leadershipRole = 'deputy_head'
      list.push({
        id,
        firstName,
        lastName,
        admissionNo: isKelvin ? 'WW2024101' : isTariro ? 'WW2024102' : `WW${2020 + (i % 6)}${String(100 + i)}`,
        dob: isKelvin ? '2009-03-14' : isTariro ? '2009-08-22' : `20${String(8 + (i % 6)).padStart(2, '0')}-${String((i % 12) + 1).padStart(2, '0')}-${String((i % 27) + 1).padStart(2, '0')}`,
        classId,
        status: i === 45 ? 'archived' : 'active',
        parentIds: isKelvin || isTariro ? ['par-rudo'] : [`par-${Math.floor(i / 2) + 1}`],
        gender: isKelvin ? 'M' : isTariro ? 'F' : i % 2 === 0 ? 'M' : 'F',
        attendancePct: isKelvin ? 72 : isTariro ? 94 : 78 + (i % 20),
        previousAvg: isKelvin ? 78 : isTariro ? 85 : 65 + (i % 30),
        currentAvg: isKelvin ? 58 : isTariro ? 88 : 60 + (i % 35),
        leadershipRole,
        disciplineEscalated: isKelvin,
        alevelStream: classId === 'c-l6' || classId === 'c-u6' ? (j % 3 === 0 ? 'sciences' : j % 3 === 1 ? 'commercials' : 'arts') : undefined,
      })
      i++
    }
  })
  return list
}

export const students: Student[] = buildStudents()

export const parents: ParentGuardian[] = [
  {
    id: 'par-rudo',
    name: 'Rudo Mutasa',
    email: 'parent@westwood.co.zw',
    phone: '+263 77 300 4001',
    relationship: 'Mother',
    studentIds: ['stu-kelvin', 'stu-tariro'],
    userId: 'u-parent',
    notificationPrefs: { attendance: true, homework: true, fees: true, notices: true },
  },
  ...Array.from({ length: 24 }, (_, i) => ({
    id: `par-${i + 1}`,
    name: `${lastNames[i % lastNames.length]} Guardian`,
    email: `parent${i + 1}@email.co.zw`,
    phone: `+263 77 400 ${String(1000 + i)}`,
    relationship: i % 2 === 0 ? 'Father' : 'Mother',
    studentIds: students.filter((s) => s.parentIds.includes(`par-${i + 1}`)).map((s) => s.id),
  })),
]

export const exams: Exam[] = [
  {
    id: 'ex-t1-final',
    name: 'Term 1 Final Exams 2026',
    term: 'Term 1 2026',
    year: 2026,
    startDate: '2026-03-17',
    endDate: '2026-03-28',
    subjectIds: subjects.map((s) => s.id),
    gradeBoundaries: [
      { grade: 'A', min: 80, max: 100 },
      { grade: 'B', min: 70, max: 79 },
      { grade: 'C', min: 60, max: 69 },
      { grade: 'D', min: 50, max: 59 },
      { grade: 'E', min: 40, max: 49 },
      { grade: 'U', min: 0, max: 39 },
    ],
  },
  {
    id: 'ex-mid',
    name: 'Term 2 Mid-Term 2026',
    term: 'Term 2 2026',
    year: 2026,
    startDate: '2026-06-09',
    endDate: '2026-06-13',
    subjectIds: subjects.map((s) => s.id),
    gradeBoundaries: [
      { grade: 'A', min: 80, max: 100 },
      { grade: 'B', min: 70, max: 79 },
      { grade: 'C', min: 60, max: 69 },
      { grade: 'D', min: 50, max: 59 },
      { grade: 'E', min: 40, max: 49 },
      { grade: 'U', min: 0, max: 39 },
    ],
  },
  {
    id: 'ex-final',
    name: 'Term 2 Final Exams 2026',
    term: 'Term 2 2026',
    year: 2026,
    startDate: '2026-07-20',
    endDate: '2026-07-31',
    subjectIds: subjects.map((s) => s.id),
    gradeBoundaries: [
      { grade: 'A', min: 80, max: 100 },
      { grade: 'B', min: 70, max: 79 },
      { grade: 'C', min: 60, max: 69 },
      { grade: 'D', min: 50, max: 59 },
      { grade: 'E', min: 40, max: 49 },
      { grade: 'U', min: 0, max: 39 },
    ],
  },
]

function buildGrades(): GradeEntry[] {
  const entries: GradeEntry[] = []
  let n = 0
  // Chronological exam order for trend prediction: Term 1 Final → Term 2 Mid → Term 2 Final
  const orderedExams = ['ex-t1-final', 'ex-mid', 'ex-final'] as const
  for (const student of students.filter((s) => s.status === 'active').slice(0, 40)) {
    const classSubjects = subjects.filter((sub) => sub.classIds.includes(student.classId))
    for (const subject of classSubjects.slice(0, 5)) {
      for (const examId of orderedExams) {
        const exam = exams.find((e) => e.id === examId)!
        let base: number
        if (student.id === 'stu-kelvin') {
          // Declining trend across terms — surfaces in Needs Attention + prediction
          base = examId === 'ex-t1-final' ? 72 : examId === 'ex-mid' ? 55 : 52
        } else if (student.id === 'stu-tariro') {
          base = examId === 'ex-t1-final' ? 82 : examId === 'ex-mid' ? 86 : 88
        } else {
          const drift = examId === 'ex-t1-final' ? student.previousAvg : examId === 'ex-mid' ? student.currentAvg : student.currentAvg + (n % 5) - 2
          base = drift + (n % 15) - 5
        }
        entries.push({
          id: `gr-${n++}`,
          examId: exam.id,
          studentId: student.id,
          subjectId: subject.id,
          mark: Math.max(25, Math.min(98, Math.round(base))),
          comment:
            student.id === 'stu-kelvin' && subject.id === 'sub-maths' && examId === 'ex-mid'
              ? 'Needs to participate more in class discussions.'
              : student.id === 'stu-tariro' && subject.id === 'sub-eng' && examId === 'ex-mid'
                ? 'Excellent grasp of core concepts.'
                : undefined,
        })
      }
    }
  }
  return entries
}

export const grades: GradeEntry[] = buildGrades()

/** Demo date fixed for consistent fee status / attendance / clock-in demos */
export const DEMO_TODAY = '2026-07-13'

export const notices: Notice[] = [
  {
    id: 'n1',
    title: 'Term 2 Parent–Teacher Conferences',
    body: 'Conferences will be held on 18–19 July in the main hall. Book slots via the office.',
    category: 'General',
    audience: 'Parents',
    date: '2026-07-10',
    pinned: true,
    createdBy: 'u-admin',
  },
  {
    id: 'n2',
    title: 'Inter-House Athletics Day',
    body: 'All students report by 07:30. Parents welcome from 09:00 at the sports field.',
    category: 'Sports',
    audience: 'All',
    date: '2026-07-18',
    pinned: false,
    createdBy: 'u-admin',
  },
  {
    id: 'n3',
    title: 'Form 4 Mid-Year Exams Begin',
    body: 'Candidates should collect examination timetables from Form tutors.',
    category: 'Exams',
    audience: 'Students',
    date: '2026-07-20',
    pinned: true,
    createdBy: 'u-admin',
  },
  {
    id: 'n4',
    title: 'Mid-Term Break',
    body: 'School closes Friday 26 June and reopens Monday 6 July.',
    category: 'Holiday',
    audience: 'All',
    date: '2026-06-26',
    pinned: false,
    createdBy: 'u-admin',
  },
  {
    id: 'n5',
    title: 'Fee Payment Reminder — Term 2',
    body: 'Outstanding balances are due by 31 July. Contact accounts for payment plans.',
    category: 'Urgent',
    audience: 'Parents',
    date: '2026-07-08',
    pinned: true,
    createdBy: 'u-admin',
  },
  {
    id: 'n6',
    title: 'Science Fair Registrations Open',
    body: 'Forms available from Mr Dube. Deadline 15 July.',
    category: 'General',
    audience: 'Students',
    date: '2026-07-05',
    pinned: false,
    createdBy: 'st-tinashe',
  },
  {
    id: 'n7',
    title: 'Staff Development Workshop',
    body: 'Saturday 12 July, 08:00–13:00 in the library. Attendance compulsory.',
    category: 'General',
    audience: 'Staff',
    date: '2026-07-12',
    pinned: false,
    createdBy: 'u-admin',
  },
  {
    id: 'n8',
    title: 'Library Book Return Drive',
    body: 'Please return overdue books by Friday to avoid fines.',
    category: 'General',
    audience: 'All',
    date: '2026-07-11',
    pinned: false,
    createdBy: 'u-admin',
  },
  {
    id: 'n9',
    title: 'Form 3 Cambridge Checkpoint Practice',
    body: 'Practice papers available from class teachers this week.',
    category: 'Exams',
    audience: 'c-f3',
    date: '2026-07-14',
    pinned: false,
    createdBy: 'st-farai',
  },
  {
    id: 'n10',
    title: 'Boarding Weekend Leave',
    body: 'Weekend leave forms due Wednesday for boarding students.',
    category: 'General',
    audience: 'Parents',
    date: '2026-07-09',
    pinned: false,
    createdBy: 'u-admin',
  },
  {
    id: 'n11',
    title: 'Football Match vs St George\'s',
    body: 'First XV kick-off 15:00 Saturday at home grounds.',
    category: 'Sports',
    audience: 'All',
    date: '2026-07-19',
    pinned: false,
    createdBy: 'st-james',
  },
  {
    id: 'n12',
    title: 'Uniform Inspection — Forms 1–4',
    body: 'Full school uniform required Monday. Blazers compulsory.',
    category: 'Urgent',
    audience: 'Students',
    date: '2026-07-13',
    pinned: false,
    createdBy: 'u-admin',
  },
]

export const feeStructures: FeeStructure[] = classes.map((c) => ({
  id: `fee-${c.id}`,
  classId: c.id,
  term: 'Term 2 2026',
  amount: c.level === 'olevel' ? 850 : 1100,
  description: `Term 2 tuition — ${c.name}`,
  instalmentCount: 3,
}))

function splitInstalments(
  invoiceId: string,
  total: number,
  count: number,
  paidTotal: number,
): NonNullable<Invoice['instalments']> {
  const base = Math.floor(total / count)
  const amounts = Array.from({ length: count }, (_, i) => (i === count - 1 ? total - base * (count - 1) : base))
  let remaining = paidTotal
  const dueDates = ['2026-05-15', '2026-06-30', '2026-07-31']
  return amounts.map((amount, i) => {
    const paid = Math.min(remaining, amount)
    remaining -= paid
    const dueDate = dueDates[i] ?? '2026-07-31'
    let status: Invoice['status'] = 'outstanding'
    if (paid >= amount) status = 'paid'
    else if (paid > 0) status = new Date(dueDate) < new Date(DEMO_TODAY) ? 'overdue' : 'partial'
    else if (new Date(dueDate) < new Date(DEMO_TODAY)) status = 'overdue'
    return {
      id: `${invoiceId}-inst-${i + 1}`,
      label: `Instalment ${i + 1} of ${count}`,
      sequence: i + 1,
      amount,
      paid,
      dueDate,
      status,
    }
  })
}

function buildInvoices(): Invoice[] {
  return students
    .filter((s) => s.status === 'active')
    .slice(0, 45)
    .map((s, i) => {
      const fs = feeStructures.find((f) => f.classId === s.classId)!
      const isKelvin = s.id === 'stu-kelvin'
      const isTariro = s.id === 'stu-tariro'
      // Mix: fully paid, active instalment plan, overdue — demo texture
      let paid: number
      let usePlan = true
      if (isKelvin) {
        paid = Math.round(fs.amount / 3) // only first instalment-ish, overdue overall
        usePlan = true
      } else if (isTariro) {
        paid = fs.amount
        usePlan = true
      } else if (i % 5 === 0) {
        paid = 0
        usePlan = true
      } else if (i % 3 === 0) {
        paid = Math.round(fs.amount / 3) + Math.round(fs.amount / 6) // mid-plan
        usePlan = true
      } else if (i % 4 === 0) {
        paid = fs.amount
        usePlan = false
      } else {
        paid = fs.amount
        usePlan = true
      }

      const instalments = usePlan ? splitInstalments(`inv-${s.id}`, fs.amount, fs.instalmentCount, paid) : undefined
      const paidSum = instalments ? instalments.reduce((sum, inst) => sum + inst.paid, 0) : paid
      let status: Invoice['status'] = 'paid'
      if (paidSum <= 0) status = 'overdue'
      else if (paidSum < fs.amount) status = paidSum < fs.amount * 0.34 ? 'overdue' : 'partial'
      if (isKelvin) status = 'overdue'

      return {
        id: `inv-${s.id}`,
        studentId: s.id,
        classId: s.classId,
        description: fs.description,
        term: 'Term 2 2026',
        amount: fs.amount,
        paid: paidSum,
        status,
        dueDate: instalments?.[instalments.length - 1]?.dueDate ?? '2026-06-30',
        issuedDate: '2026-05-01',
        instalmentPlan: usePlan,
        instalments,
      }
    })
}

export const invoices: Invoice[] = buildInvoices()

export const paymentRecords: PaymentRecord[] = [
  {
    id: 'pay-1',
    invoiceId: 'inv-stu-tariro',
    instalmentId: 'inv-stu-tariro-inst-1',
    amount: Math.round((feeStructures.find((f) => f.classId === 'c-f4')?.amount ?? 650) / 3),
    method: 'ecocash',
    paidAt: '2026-05-12T10:20:00',
    reference: 'ECO-WW-88421',
    recordedBy: 'u-parent',
    mobileNumber: '0773004001',
  },
  {
    id: 'pay-2',
    invoiceId: 'inv-stu-tariro',
    instalmentId: 'inv-stu-tariro-inst-2',
    amount: Math.round((feeStructures.find((f) => f.classId === 'c-f4')?.amount ?? 650) / 3),
    method: 'bank_transfer',
    paidAt: '2026-06-20T14:05:00',
    reference: 'BT-WW-22910',
    recordedBy: 'u-admin',
  },
  {
    id: 'pay-3',
    invoiceId: 'inv-stu-tariro',
    instalmentId: 'inv-stu-tariro-inst-3',
    amount: (feeStructures.find((f) => f.classId === 'c-f4')?.amount ?? 650) - 2 * Math.round((feeStructures.find((f) => f.classId === 'c-f4')?.amount ?? 650) / 3),
    method: 'cash',
    paidAt: '2026-07-05T09:00:00',
    reference: 'CASH-WW-10012',
    recordedBy: 'u-admin',
  },
  {
    id: 'pay-4',
    invoiceId: 'inv-stu-kelvin',
    instalmentId: 'inv-stu-kelvin-inst-1',
    amount: Math.round((feeStructures.find((f) => f.classId === 'c-f4')?.amount ?? 650) / 3),
    method: 'onemoney',
    paidAt: '2026-05-18T16:40:00',
    reference: 'OM-WW-55102',
    recordedBy: 'u-parent',
    mobileNumber: '0773004001',
  },
]

function buildElectronicReports(): ElectronicReport[] {
  const g4 = students.filter((s) => s.classId === 'c-f4' && s.status === 'active')
  const ranked = [...g4].sort((a, b) => b.currentAvg - a.currentAvg)
  return ranked.map((s, idx) => {
    const isKelvin = s.id === 'stu-kelvin'
    const isTariro = s.id === 'stu-tariro'
    // Mix of draft / finalized / published for demo
    let status: ElectronicReport['status'] = idx % 4 === 0 ? 'draft' : idx % 3 === 0 ? 'finalized' : 'published'
    if (isKelvin) status = 'published'
    if (isTariro) status = 'published'
    return {
      id: `rpt-${s.id}-t2`,
      studentId: s.id,
      term: 'Term 2 2026',
      examId: 'ex-mid',
      status,
      classPosition: idx + 1,
      classSize: ranked.length,
      attendancePct: s.attendancePct,
      principalComment: isKelvin
        ? 'Kelvin shows promise but must improve attendance and consistency this term.'
        : isTariro
          ? 'An exemplary student — keep up the excellent work.'
          : status !== 'draft'
            ? 'Continues to make solid progress this term.'
            : undefined,
      classTeacherComment: isKelvin
        ? 'Needs to participate more in class discussions.'
        : isTariro
          ? 'Shows consistent effort and a positive attitude toward learning.'
          : 'Making steady progress; continued practice will strengthen results.',
      createdAt: '2026-06-20',
      finalizedAt: status !== 'draft' ? '2026-06-25' : undefined,
      publishedAt: status === 'published' ? '2026-06-28' : undefined,
    }
  }).concat(
    // Past-term archive for Kelvin & Tariro
    [
      {
        id: 'rpt-stu-kelvin-t1',
        studentId: 'stu-kelvin',
        term: 'Term 1 2026',
        examId: 'ex-t1-final',
        status: 'published',
        classPosition: 8,
        classSize: Math.max(6, students.filter((s) => s.classId === 'c-f4' && s.status === 'active').length),
        attendancePct: 86,
        principalComment: 'A good start to the year — maintain focus into Term 2.',
        classTeacherComment: 'Shows consistent effort and a positive attitude toward learning.',
        createdAt: '2026-03-30',
        finalizedAt: '2026-04-02',
        publishedAt: '2026-04-05',
      },
      {
        id: 'rpt-stu-tariro-t1',
        studentId: 'stu-tariro',
        term: 'Term 1 2026',
        examId: 'ex-t1-final',
        status: 'published',
        classPosition: 2,
        classSize: Math.max(6, students.filter((s) => s.classId === 'c-f4' && s.status === 'active').length),
        attendancePct: 96,
        principalComment: 'Outstanding Term 1 results — a credit to the class.',
        classTeacherComment: 'Excellent grasp of core concepts.',
        createdAt: '2026-03-30',
        finalizedAt: '2026-04-02',
        publishedAt: '2026-04-05',
      },
    ],
  )
}

export const electronicReports: ElectronicReport[] = buildElectronicReports()

const periods = [
  { period: 1, startTime: '07:30', endTime: '08:10' },
  { period: 2, startTime: '08:15', endTime: '08:55' },
  { period: 3, startTime: '09:00', endTime: '09:40' },
  { period: 4, startTime: '10:00', endTime: '10:40' },
  { period: 5, startTime: '10:45', endTime: '11:25' },
  { period: 6, startTime: '11:30', endTime: '12:10' },
]

function buildTimetable(): TimetableSlot[] {
  const slots: TimetableSlot[] = []
  let id = 0
  const targets = [
    { classId: 'c-f4', teacherId: 'st-chipo', subjects: ['sub-maths', 'sub-eng', 'sub-shona', 'sub-pe', 'sub-ict'] },
    { classId: 'c-f2', teacherId: 'st-tatenda', subjects: ['sub-maths', 'sub-eng', 'sub-sci', 'sub-geo', 'sub-acc'] },
    { classId: 'c-f4', teacherId: 'st-nyasha', subjects: ['sub-eng', 'sub-maths', 'sub-sci', 'sub-hist', 'sub-acc'] },
  ]
  for (const t of targets) {
    for (let day = 0; day < 5; day++) {
      for (let p = 0; p < 6; p++) {
        const subjectId = t.subjects[p % t.subjects.length]
        const subject = subjects.find((s) => s.id === subjectId)!
        const teacherId = subject.teacherIds[0] ?? t.teacherId
        slots.push({
          id: `tt-${id++}`,
          classId: t.classId,
          day,
          period: periods[p].period,
          startTime: periods[p].startTime,
          endTime: periods[p].endTime,
          subjectId,
          teacherId,
          room: `R${(day + 1) * 10 + p + 1}`,
        })
      }
    }
  }
  return slots
}

export const timetable: TimetableSlot[] = buildTimetable()

export const staffPeriodAttendance: StaffPeriodAttendance[] = (() => {
  const todaySlots = timetable.filter((s) => s.day === 0) // Monday demo
  const records: StaffPeriodAttendance[] = []
  let i = 0
  for (const slot of todaySlots) {
    let status: StaffPeriodAttendance['status'] = 'on_time'
    if (slot.teacherId === 'st-tinashe' && slot.period === 2) status = 'missed'
    if (slot.teacherId === 'st-farai' && slot.period === 3) status = 'missed'
    if (slot.teacherId === 'st-james' && slot.period === 1) status = 'late'
    if (slot.teacherId === 'st-ruth' && slot.period === 4) {
      status = 'substituted'
    }
    // Leave most of Chipo's periods today un-clocked so the staff demo can walk through clock-in live.
    if (slot.teacherId === 'st-chipo' && slot.period >= 2) status = 'pending'
    records.push({
      id: `spa-${i++}`,
      teacherId: slot.teacherId,
      date: DEMO_TODAY,
      slotId: slot.id,
      status,
      clockInAt: status === 'on_time' ? `${DEMO_TODAY}T${slot.startTime}:00` : status === 'late' ? `${DEMO_TODAY}T${slot.startTime.slice(0, 2)}:${String(Number(slot.startTime.slice(3)) + 12).padStart(2, '0')}:00` : undefined,
      substituteTeacherId: status === 'substituted' ? 'st-chipo' : undefined,
      note: status === 'missed' ? 'No clock-in within window' : undefined,
    })
  }
  // Last week missed for leaderboard
  records.push(
    {
      id: 'spa-hist-1',
      teacherId: 'st-tinashe',
      date: '2026-07-10',
      slotId: timetable.find((s) => s.teacherId === 'st-tinashe')!.id,
      status: 'missed',
      note: 'Reported sick after period start',
    },
    {
      id: 'spa-hist-2',
      teacherId: 'st-farai',
      date: '2026-07-09',
      slotId: timetable.find((s) => s.teacherId === 'st-farai')!.id,
      status: 'missed',
    },
  )
  return records
})()

export const studentAttendance: StudentAttendance[] = (() => {
  const g4 = students.filter((s) => s.classId === 'c-f4' && s.status === 'active')
  const records: StudentAttendance[] = []
  const dates = ['2026-07-09', '2026-07-10', '2026-07-11', '2026-07-13']
  let i = 0
  for (const date of dates) {
    for (const s of g4) {
      let status: StudentAttendance['status'] = 'present'
      if (s.id === 'stu-kelvin' && date !== '2026-07-13') status = 'absent'
      if (s.id === 'stu-tariro' && date === '2026-07-10') status = 'late'
      records.push({
        id: `sa-${i++}`,
        studentId: s.id,
        classId: 'c-f4',
        date,
        status,
        takenBy: 'st-chipo',
        note: s.id === 'stu-kelvin' && status === 'absent' ? undefined : undefined,
      })
    }
  }
  return records
})()

export const libraryBooks: LibraryBook[] = [
  { id: 'lb1', title: 'Things Fall Apart', author: 'Chinua Achebe', isbn: '978-0385474542', category: 'Literature', status: 'issued', issuedTo: 'stu-kelvin', dueDate: '2026-07-20' },
  { id: 'lb2', title: 'Cambridge IGCSE Mathematics', author: 'Ric Pimentel', isbn: '978-1444191707', category: 'Maths', status: 'available' },
  { id: 'lb3', title: 'A Brief History of Time', author: 'Stephen Hawking', isbn: '978-0553380163', category: 'Science', status: 'issued', issuedTo: 'stu-tariro', dueDate: '2026-07-15' },
  { id: 'lb4', title: 'Shona for Beginners', author: 'Various', isbn: '978-0797410001', category: 'Language', status: 'available' },
  { id: 'lb5', title: 'The Boy Who Harnessed the Wind', author: 'William Kamkwamba', isbn: '978-0061730337', category: 'Biography', status: 'returned' },
  { id: 'lb6', title: 'Geography: An Integrated Approach', author: 'David Waugh', isbn: '978-1408504079', category: 'Geography', status: 'available' },
  { id: 'lb7', title: 'Animal Farm', author: 'George Orwell', isbn: '978-0451526342', category: 'Literature', status: 'overdue', issuedTo: 'stu-005', dueDate: '2026-07-01' },
  { id: 'lb8', title: 'Introduction to Accounting', author: 'Frank Wood', isbn: '978-0273711391', category: 'Accounts', status: 'available' },
]

export const studyMaterials: StudyMaterial[] = [
  { id: 'sm1', title: 'Algebra Revision Pack', subjectId: 'sub-maths', classId: 'c-f4', uploadedBy: 'st-chipo', fileType: 'PDF', fileSize: '1.2 MB', date: '2026-07-01' },
  { id: 'sm2', title: 'Cell Structure Notes', subjectId: 'sub-sci', classId: 'c-f2', uploadedBy: 'st-tinashe', fileType: 'PDF', fileSize: '890 KB', date: '2026-07-03' },
  { id: 'sm3', title: 'Essay Structure Guide', subjectId: 'sub-eng', classId: 'c-f4', uploadedBy: 'st-nyasha', fileType: 'DOCX', fileSize: '420 KB', date: '2026-06-28' },
  { id: 'sm4', title: 'Map Skills Practice', subjectId: 'sub-geo', classId: 'c-f2', uploadedBy: 'st-sharon', fileType: 'PDF', fileSize: '2.1 MB', date: '2026-07-05' },
  { id: 'sm5', title: 'Python Basics Slides', subjectId: 'sub-ict', classId: 'c-f3', uploadedBy: 'st-kudzai', fileType: 'PPTX', fileSize: '3.4 MB', date: '2026-07-07' },
]

export const homework: Homework[] = [
  {
    id: 'hw1',
    title: 'Quadratic Equations Set B',
    description: 'Complete exercises 1–12 in Revision Pack A.',
    subjectId: 'sub-maths',
    classId: 'c-f4',
    assignedBy: 'st-chipo',
    dueDate: '2026-07-10',
    createdAt: '2026-07-06',
    submissions: students
      .filter((s) => s.classId === 'c-f4' && s.status === 'active')
      .map((s) => ({
        studentId: s.id,
        status: s.id === 'stu-kelvin' ? ('missing' as const) : s.id === 'stu-tariro' ? ('submitted' as const) : ('submitted' as const),
        submittedAt: s.id === 'stu-kelvin' ? undefined : '2026-07-09',
      })),
  },
  {
    id: 'hw2',
    title: 'Reading: Chapter 3 Summary',
    description: 'Write a half-page summary of Things Fall Apart Ch. 3.',
    subjectId: 'sub-eng',
    classId: 'c-f4',
    assignedBy: 'st-farai',
    dueDate: '2026-07-15',
    createdAt: '2026-07-11',
    submissions: students
      .filter((s) => s.classId === 'c-f4' && s.status === 'active')
      .map((s) => ({
        studentId: s.id,
        status: 'assigned' as const,
      })),
  },
]

export const readingLogs: ReadingLog[] = [
  { id: 'rl1', studentId: 'stu-kelvin', title: 'Things Fall Apart — Ch. 1–2', pages: '1–24', date: '2026-07-08', loggedBy: 'st-chipo', notes: 'Good comprehension questions answered.' },
  { id: 'rl2', studentId: 'stu-tariro', title: 'Animal Farm — Ch. 1–3', pages: '1–32', date: '2026-07-09', loggedBy: 'st-chipo' },
  { id: 'rl3', studentId: 'stu-kelvin', title: 'Things Fall Apart — Ch. 3', pages: '25–40', date: '2026-07-11', loggedBy: 'st-farai', notes: 'Needs more detail in summary.' },
]

export const meritRecords: MeritRecord[] = [
  { id: 'mr1', studentId: 'stu-kelvin', points: 2, type: 'merit', reason: 'Helped organize the science fair display', date: '2026-06-20', loggedBy: 'st-tinashe' },
  {
    id: 'mr2',
    studentId: 'stu-kelvin',
    points: -1,
    type: 'demerit',
    reason: 'Late to class after break',
    date: '2026-06-18',
    loggedBy: 'st-chipo',
    severity: 'minor',
    category: 'Punctuality',
    notes: 'Arrived 8 minutes late to Period 2.',
  },
  {
    id: 'mr2b',
    studentId: 'stu-kelvin',
    points: -1,
    type: 'demerit',
    reason: 'Incomplete PE kit',
    date: '2026-06-25',
    loggedBy: 'st-james',
    severity: 'minor',
    category: 'Uniform',
  },
  {
    id: 'mr2c',
    studentId: 'stu-kelvin',
    points: -1,
    type: 'demerit',
    reason: 'Disruptive in library study period',
    date: '2026-07-02',
    loggedBy: 'st-chipo',
    severity: 'minor',
    category: 'Conduct',
    escalated: true,
    notes: 'Third minor this term — flagged for Head of Year follow-up.',
  },
  { id: 'mr3', studentId: 'stu-kelvin', points: 1, type: 'merit', reason: 'Excellent contribution in Maths group work', date: '2026-07-07', loggedBy: 'st-chipo' },
  { id: 'mr4', studentId: 'stu-tariro', points: 3, type: 'merit', reason: 'Won inter-house debating final', date: '2026-06-15', loggedBy: 'st-farai' },
  { id: 'mr5', studentId: 'stu-tariro', points: 1, type: 'merit', reason: 'Consistent homework submission', date: '2026-07-05', loggedBy: 'st-chipo' },
  {
    id: 'mr6',
    studentId: 'stu-tariro',
    points: -2,
    type: 'demerit',
    reason: 'Phone out during examination conditions practice',
    date: '2026-07-01',
    loggedBy: 'st-nyasha',
    severity: 'major',
    category: 'Exams',
    notes: 'Device confiscated; returned to parent.',
  },
]

export const pickupPeople: PickupPerson[] = [
  { id: 'pk1', studentId: 'stu-kelvin', name: 'Rudo Mutasa', relationship: 'Mother', phone: '+263 77 300 4001' },
  { id: 'pk2', studentId: 'stu-kelvin', name: 'Tafadzwa Mutasa', relationship: 'Father', phone: '+263 77 300 4002' },
  { id: 'pk3', studentId: 'stu-kelvin', name: 'Grace Mutasa', relationship: 'Aunt', phone: '+263 77 300 4003' },
  { id: 'pk4', studentId: 'stu-tariro', name: 'Rudo Mutasa', relationship: 'Mother', phone: '+263 77 300 4001' },
  { id: 'pk5', studentId: 'stu-tariro', name: 'Tafadzwa Mutasa', relationship: 'Father', phone: '+263 77 300 4002' },
]

export const activities: ActivityEntry[] = [
  { id: 'act1', studentId: 'stu-kelvin', type: 'attendance', title: 'Morning attendance', description: 'Marked present for Form 4 Homeroom', status: 'Present', date: '2026-07-13', time: '07:35' },
  { id: 'act2', studentId: 'stu-kelvin', type: 'homework', title: 'Quadratic Equations Set B', description: 'Homework marked missing after due date', status: 'Missing', date: '2026-07-11', time: '16:00', flagged: true },
  { id: 'act3', studentId: 'stu-kelvin', type: 'reading', title: 'Reading log', description: 'Things Fall Apart — Ch. 3', status: 'Logged', date: '2026-07-11', time: '10:20' },
  { id: 'act4', studentId: 'stu-kelvin', type: 'discipline', title: 'Flagged for follow-up', description: '3 Minor entries this term — escalated to Head of Year', status: 'Escalated', date: '2026-07-02', time: '16:30', flagged: true },
  { id: 'act5', studentId: 'stu-kelvin', type: 'alert', title: 'Consecutive absences', description: 'Absent 3 school days in a row (9–11 July) with no explanatory note on file', status: 'Alert', date: '2026-07-11', time: '17:00', flagged: true },
  { id: 'act6', studentId: 'stu-kelvin', type: 'exam', title: 'Mid-Term Maths', description: 'Scored 52% — below class average', status: '52%', date: '2026-06-12', time: '11:00' },
  { id: 'act7', studentId: 'stu-kelvin', type: 'detention', title: 'Detention scheduled', description: 'Thursday 16 July, 15:30 — Library Room B', status: 'Scheduled', date: '2026-07-03', time: '09:00', flagged: true },
  { id: 'act8', studentId: 'stu-tariro', type: 'attendance', title: 'Morning attendance', description: 'Marked present', status: 'Present', date: '2026-07-13', time: '07:35' },
  { id: 'act9', studentId: 'stu-tariro', type: 'homework', title: 'Quadratic Equations Set B', description: 'Submitted on time', status: 'Submitted', date: '2026-07-09', time: '18:20' },
  { id: 'act10', studentId: 'stu-tariro', type: 'club', title: 'Debating Society', description: 'Signed up for Debating Society', status: 'Joined', date: '2026-05-12', time: '12:40' },
  { id: 'act11', studentId: 'stu-tariro', type: 'guidance', title: 'Career guidance note', description: 'Interest: Law / International Relations — Arts stream recommended', status: 'Logged', date: '2026-07-08', time: '14:00' },
  { id: 'act12', studentId: 'stu-kelvin', type: 'club', title: 'First XV training', description: 'Upcoming fixture vs St George\'s — Sat 19 July', status: 'Fixture', date: '2026-07-12', time: '10:00' },
]

export const parentInvites: ParentInvite[] = [
  {
    id: 'inv-1',
    studentId: 'stu-kelvin',
    name: 'Tafadzwa Mutasa',
    email: 'tafadzwa.mutasa@email.co.zw',
    phone: '+263 77 300 4002',
    relationship: 'Father',
    status: 'accepted',
    sentAt: '2026-05-10',
    invitedBy: 'st-chipo',
  },
  {
    id: 'inv-2',
    studentId: 'stu-005',
    name: 'Patricia Ndlovu',
    email: 'patricia.ndlovu@email.co.zw',
    phone: '+263 77 555 0101',
    relationship: 'Mother',
    status: 'pending',
    sentAt: '2026-07-08',
    invitedBy: 'u-admin',
  },
  {
    id: 'inv-3',
    studentId: 'stu-010',
    name: 'Brian Chikwanha',
    email: 'brian.c@email.co.zw',
    phone: '+263 77 555 0102',
    relationship: 'Father',
    status: 'pending',
    sentAt: '2026-07-11',
    invitedBy: 'u-admin',
  },
]

export const commentPhrases: CommentPhrase[] = [
  { id: 'cp1', band: 'strong', text: 'Shows consistent effort and a positive attitude toward learning.' },
  { id: 'cp2', band: 'strong', text: 'Excellent grasp of core concepts.' },
  { id: 'cp3', band: 'strong', text: 'Contributes thoughtfully to class discussions.' },
  { id: 'cp4', band: 'strong', text: 'Work is well organised and submitted on time.' },
  { id: 'cp5', band: 'strong', text: 'Demonstrates strong analytical and problem-solving skills.' },
  { id: 'cp6', band: 'strong', text: 'A reliable peer mentor who supports classmates.' },
  { id: 'cp7', band: 'average', text: 'Making steady progress; continued practice will strengthen results.' },
  { id: 'cp8', band: 'average', text: 'Understands most topics but needs more revision before assessments.' },
  { id: 'cp9', band: 'average', text: 'Participates when encouraged; would benefit from volunteering answers more often.' },
  { id: 'cp10', band: 'average', text: 'Homework is generally complete though presentation can improve.' },
  { id: 'cp11', band: 'average', text: 'Shows potential that will grow with more consistent study habits.' },
  { id: 'cp12', band: 'average', text: 'Satisfactory performance this term with room to aim higher.' },
  { id: 'cp13', band: 'needs_improvement', text: 'Needs to participate more in class discussions.' },
  { id: 'cp14', band: 'needs_improvement', text: 'Frequent incomplete homework is affecting progress.' },
  { id: 'cp15', band: 'needs_improvement', text: 'Requires additional support to secure foundational skills.' },
  { id: 'cp16', band: 'needs_improvement', text: 'Attendance issues have interrupted learning continuity.' },
  { id: 'cp17', band: 'needs_improvement', text: 'Must focus more carefully during independent tasks.' },
  { id: 'cp18', band: 'needs_improvement', text: 'Would benefit from parental support with evening revision.' },
  { id: 'cp19', band: 'strong', text: 'Outstanding improvement since last term — well done.' },
  { id: 'cp20', band: 'average', text: 'A pleasant and cooperative member of the class.' },
]

export const notifications: NotificationItem[] = [
  { id: 'nt1', role: 'admin', title: '3 missed periods today', body: 'Tinashe Dube and Farai Mhlanga have periods flagged as not checked in.', time: '10 min ago', read: false, href: '/admin/staff-attendance' },
  { id: 'nt2', role: 'admin', title: 'Flagged for follow-up: Kelvin Mutasa', body: 'Discipline escalation, low attendance, overdue fees, projected decline.', time: '1 hr ago', read: false, href: '/admin/students/stu-kelvin' },
  { id: 'nt3', role: 'admin', title: 'Exam registration pending', body: '6 candidates still pending for ZIMSEC O-Level November 2026.', time: '3 hr ago', read: true, href: '/admin/exam-registration' },
  { id: 'nt4', role: 'staff', title: 'Clock-in window open', body: 'Period 4 Maths — Form 4 starts in 5 minutes.', time: 'Just now', read: false, href: '/staff' },
  { id: 'nt5', role: 'staff', title: 'Homework overdue submissions', body: '3 students still missing Quadratic Equations Set B.', time: '2 hr ago', read: false, href: '/staff/homework' },
  { id: 'nt6', role: 'parent', title: 'Absence alert — Kelvin', body: 'Absent 3 days in a row with no note on file.', time: 'Yesterday', read: false, href: '/parent' },
  { id: 'nt7', role: 'parent', title: 'Detention scheduled — Kelvin', body: 'Thursday 16 July, 15:30 — Library Room B.', time: '2 days ago', read: false, href: '/parent' },
  { id: 'nt8', role: 'parent', title: 'Flagged for follow-up', body: 'Kelvin has been flagged after 3 minor discipline entries this term.', time: '3 days ago', read: false, href: '/parent' },
  { id: 'nt9', role: 'student', title: 'New homework posted', body: 'Reading: Chapter 3 Summary due 15 July.', time: '1 day ago', read: false, href: '/student/homework' },
  { id: 'nt10', role: 'student', title: 'First XV fixture', body: 'Match vs St George\'s — Saturday 19 July, 15:00.', time: '2 days ago', read: true, href: '/student/clubs' },
  { id: 'nt11', role: 'admin', title: 'Discipline escalation', body: 'Kelvin Mutasa — 3 Minor entries this term. Flagged for Head of Year follow-up.', time: '4 days ago', read: false, href: '/admin/discipline' },
]

export const detentionRecords: DetentionRecord[] = [
  {
    id: 'det-1',
    studentId: 'stu-kelvin',
    meritId: 'mr2c',
    scheduledAt: '2026-07-16T15:30:00',
    location: 'Library Room B',
    status: 'scheduled',
    assignedBy: 'st-chipo',
    notes: 'Supervised study — catch up Maths homework.',
  },
  {
    id: 'det-2',
    studentId: 'stu-tariro',
    meritId: 'mr6',
    scheduledAt: '2026-07-08T15:30:00',
    location: 'Form Block — Room 12',
    status: 'completed',
    assignedBy: 'st-nyasha',
  },
]

export const guidanceNotes: GuidanceNote[] = [
  {
    id: 'gn1',
    studentId: 'stu-kelvin',
    careerInterest: 'Engineering / Applied Sciences',
    tags: ['STEM', 'Engineering'],
    pathwayNotes: 'Consider Sciences combination if Maths/Science improve in Term 2 Finals. Currently Commercials also viable via Accounts if Maths recovers.',
    loggedBy: 'st-sharon',
    loggedByName: 'Sharon Moyo',
    createdAt: '2026-06-28T10:00:00',
  },
  {
    id: 'gn2',
    studentId: 'stu-kelvin',
    careerInterest: 'Engineering / Applied Sciences',
    tags: ['STEM'],
    pathwayNotes: 'Mid-term dip noted — revisit after Finals. Still encouraged to attend Science Club.',
    loggedBy: 'st-chipo',
    loggedByName: 'Chipo Ncube',
    createdAt: '2026-07-10T11:20:00',
  },
  {
    id: 'gn3',
    studentId: 'stu-tariro',
    careerInterest: 'Law / International Relations',
    tags: ['Arts', 'Law', 'Debate'],
    pathwayNotes: 'Strong English and History — Arts stream recommended for Lower Sixth. Debating Society leadership is a good portfolio builder.',
    loggedBy: 'st-sharon',
    loggedByName: 'Sharon Moyo',
    createdAt: '2026-07-08T14:00:00',
  },
]

export const examSittings: ExamSitting[] = [
  { id: 'sit-zimsec-o-nov', name: 'ZIMSEC O-Level November 2026', body: 'ZIMSEC', level: 'O-Level', series: 'November', year: 2026 },
  { id: 'sit-cam-a-jun', name: 'Cambridge A-Level June 2026', body: 'Cambridge', level: 'A-Level', series: 'June', year: 2026 },
  { id: 'sit-zimsec-a-nov', name: 'ZIMSEC A-Level November 2026', body: 'ZIMSEC', level: 'A-Level', series: 'November', year: 2026 },
]

export const examRegistrations: ExamRegistration[] = (() => {
  const f4 = students.filter((s) => s.classId === 'c-f4' && s.status === 'active')
  const l6 = students.filter((s) => s.classId === 'c-l6' && s.status === 'active')
  const regs: ExamRegistration[] = []
  f4.forEach((s, i) => {
    regs.push({
      id: `reg-zim-${s.id}`,
      sittingId: 'sit-zimsec-o-nov',
      studentId: s.id,
      subjectIds: ['sub-maths', 'sub-eng', 'sub-sci', 'sub-geo', 'sub-hist'].slice(0, 4 + (i % 2)),
      candidateNumber: s.id === 'stu-kelvin' ? '' : `ZW${2026000 + i}`,
      status: s.id === 'stu-kelvin' || i % 7 === 0 ? 'pending' : i % 11 === 0 ? 'not_registered' : 'registered',
    })
  })
  l6.forEach((s, i) => {
    regs.push({
      id: `reg-cam-${s.id}`,
      sittingId: 'sit-cam-a-jun',
      studentId: s.id,
      subjectIds: s.alevelStream === 'sciences'
        ? ['sub-maths', 'sub-sci', 'sub-ict']
        : s.alevelStream === 'commercials'
          ? ['sub-maths', 'sub-acc', 'sub-geo']
          : ['sub-eng', 'sub-hist', 'sub-geo'],
      candidateNumber: `CA${2026100 + i}`,
      status: i === 0 ? 'pending' : 'registered',
    })
  })
  return regs
})()

export const clubs: Club[] = [
  { id: 'club-debate', name: 'Debating Society', category: 'academic', supervisorId: 'st-farai', meetingDay: 'Wednesday', meetingTime: '15:30', description: 'Inter-house and inter-school debate preparation.' },
  { id: 'club-rugby', name: 'First XV Rugby', category: 'sport', supervisorId: 'st-james', meetingDay: 'Tuesday / Thursday', meetingTime: '16:00', description: 'Senior boys rugby — fixtures on Saturdays.' },
  { id: 'club-science', name: 'Science Club', category: 'academic', supervisorId: 'st-tinashe', meetingDay: 'Friday', meetingTime: '14:30', description: 'Experiments, olympiad training, and fair projects.' },
  { id: 'club-choir', name: 'School Choir', category: 'creative', supervisorId: 'st-nyasha', meetingDay: 'Monday', meetingTime: '15:45', description: 'Assembly and competition performances.' },
  { id: 'club-chess', name: 'Chess Club', category: 'academic', supervisorId: 'st-tatenda', meetingDay: 'Thursday', meetingTime: '13:00', description: 'Lunchtime chess and tournament travel.' },
]

export const clubMemberships: ClubMembership[] = [
  { id: 'cm1', clubId: 'club-rugby', studentId: 'stu-kelvin', joinedAt: '2026-05-01' },
  { id: 'cm2', clubId: 'club-science', studentId: 'stu-kelvin', joinedAt: '2026-05-10' },
  { id: 'cm3', clubId: 'club-debate', studentId: 'stu-tariro', joinedAt: '2026-05-12' },
  { id: 'cm4', clubId: 'club-choir', studentId: 'stu-tariro', joinedAt: '2026-05-01' },
  { id: 'cm5', clubId: 'club-chess', studentId: 'stu-tariro', joinedAt: '2026-06-01' },
]

// Club fixtures also appear on the shared Notices/Calendar
notices.push(
  {
    id: 'n-club-1',
    title: 'First XV vs St George\'s',
    body: 'Kick-off 15:00 Saturday at home grounds. All students welcome to support.',
    category: 'Sports',
    audience: 'All',
    date: '2026-07-19',
    pinned: false,
    createdBy: 'st-james',
  },
  {
    id: 'n-club-2',
    title: 'Debating Society — Inter-House Finals',
    body: 'Main hall, 16:00. Prefects assisting with room setup.',
    category: 'General',
    audience: 'Students',
    date: '2026-07-17',
    pinned: false,
    createdBy: 'st-farai',
  },
  {
    id: 'n-club-3',
    title: 'Science Club Fair Showcase',
    body: 'Displays in the lab block after assembly. Parents invited.',
    category: 'General',
    audience: 'All',
    date: '2026-07-22',
    pinned: false,
    createdBy: 'st-tinashe',
  },
)

export function studentFullName(s: Student) {
  return `${s.firstName} ${s.lastName}`
}

export function getGradeLetter(mark: number, exam: Exam = exams[0]) {
  return exam.gradeBoundaries.find((g) => mark >= g.min && mark <= g.max)?.grade ?? 'U'
}

export const LEADERSHIP_LABELS: Record<import('./types').LeadershipRole, string> = {
  none: '',
  head_boy: 'Head Boy',
  head_girl: 'Head Girl',
  deputy_head: 'Deputy Head',
  prefect: 'Prefect',
  class_captain: 'Class Captain',
}
