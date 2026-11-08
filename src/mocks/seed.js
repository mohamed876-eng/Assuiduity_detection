import { format, isWeekend, subDays, addDays } from 'date-fns'

const STUDENT_NAMES = [
  'Ahmed Al-Farsi',
  'Lina Haddad',
  'Youssef Amrani',
  'Maya Chen',
  'Noah Williams',
  'Sofia Garcia',
  'Omar Khalil',
  'Emma Thompson',
  "Liam O'Connor",
  'Aisha Rahman',
  'Lucas Martin',
  'Isabella Rossi',
  'Karim Benali',
  'Chloe Dubois',
  'Daniel Kim',
  'Fatima Zahra',
  'Ethan Brown',
  'Leila Nasser',
  'Mateo Silva',
  'Hannah Schmidt',
  'Adam Novak',
  'Nina Petrova',
  'Samuel Adeyemi',
  'Zara Ali',
  'Julien Laurent',
  'Alice Johnson',
  'Rami Mansour',
  'Elena Vasquez',
  'Tomas Oliveira',
  'Priya Patel',
  'Jonas Weber',
  'Amira Saleh',
  'Felix Andersen',
  'Grace Okafor',
  'Hugo Bernard',
  'Mia Nakamura',
  'Ibrahim Diallo',
  'Clara Jensen',
  'David Lopez',
  'Yasmin Karim',
  'Oliver Smith',
  'Nour El-Sayed',
  'Gabriel Costa',
  'Isla Murphy',
  'Hassan Farouk',
  'Anna Kowalski',
  'Theo Van Dijk',
  'Layla Hussein',
  'Ryan Walker',
  'Sana Iqbal',
  'Marco Bianchi',
  'Eva Lindgren',
  'Bilal Chaudhry',
  'Sophie Turner',
  'Karim Haddad',
  'Ella Fitzgerald',
  'Ali Kaya',
  'Maria Santos',
  'Jack Robinson',
  'Salma Idrissi',
  'Victor Nguyen',
  'Lucy Bennett',
  'Mehdi Bouazizi',
  'Ingrid Larsen',
  'Carlos Mendoza',
  'Nadia Petrova',
  'Aaron Cohen',
  'Freya Nilsson',
  'Tariq Osman',
  'Julia Kowalczyk',
  'Ben Carter',
  'Rania Fawaz',
]

const TEACHERS = [
  { fullName: 'Dr. David Chen', subject: 'Mathematics', phone: '+1 (415) 555-0142' },
  { fullName: 'Amara Okafor', subject: 'Physics', phone: '+1 (415) 555-0178' },
  { fullName: 'Lucas Moreau', subject: 'Chemistry', phone: '+1 (415) 555-0119' },
  { fullName: 'Priya Sharma', subject: 'Biology', phone: '+1 (415) 555-0164' },
  { fullName: 'Emily Carter', subject: 'English Literature', phone: '+1 (415) 555-0133' },
  { fullName: 'Omar Haddad', subject: 'Computer Science', phone: '+1 (415) 555-0155' },
  { fullName: 'Sofia Rossi', subject: 'History', phone: '+1 (415) 555-0187' },
  { fullName: 'James Wilson', subject: 'Physical Education', phone: '+1 (415) 555-0121' },
]

const CLASSES = [
  { name: 'Grade 10 - A', level: 'Grade 10', room: 'A-101', teacherId: 't1', capacity: 30 },
  { name: 'Grade 10 - B', level: 'Grade 10', room: 'A-102', teacherId: 't2', capacity: 30 },
  { name: 'Grade 11 - A', level: 'Grade 11', room: 'B-201', teacherId: 't3', capacity: 28 },
  { name: 'Grade 11 - B', level: 'Grade 11', room: 'B-202', teacherId: 't4', capacity: 28 },
  { name: 'Grade 12 - A', level: 'Grade 12', room: 'C-301', teacherId: 't5', capacity: 26 },
  { name: 'Grade 12 - B', level: 'Grade 12', room: 'C-302', teacherId: 't6', capacity: 26 },
]

const COURSES = [
  { name: 'Mathematics', code: 'MATH-101', teacherId: 't1', credits: 4, color: '#343338', classIds: ['c1', 'c2', 'c3', 'c4'] },
  { name: 'Advanced Mathematics', code: 'MATH-301', teacherId: 't1', credits: 4, color: '#57565b', classIds: ['c5', 'c6'] },
  { name: 'Physics', code: 'PHYS-201', teacherId: 't2', credits: 3, color: '#6e6d73', classIds: ['c3', 'c4', 'c5', 'c6'] },
  { name: 'Chemistry', code: 'CHEM-201', teacherId: 't3', credits: 3, color: '#29282d', classIds: ['c3', 'c4', 'c5', 'c6'] },
  { name: 'Biology', code: 'BIO-201', teacherId: 't4', credits: 3, color: '#8a898f', classIds: ['c3', 'c4'] },
  { name: 'English Literature', code: 'ENG-101', teacherId: 't5', credits: 3, color: '#4a494f', classIds: ['c1', 'c2', 'c5', 'c6'] },
  { name: 'Computer Science', code: 'CS-201', teacherId: 't6', credits: 4, color: '#1f1e22', classIds: ['c1', 'c2', 'c5', 'c6'] },
  { name: 'World History', code: 'HIST-101', teacherId: 't7', credits: 2, color: '#77767c', classIds: ['c1', 'c2', 'c3', 'c4'] },
  { name: 'Geography', code: 'GEO-101', teacherId: 't7', credits: 2, color: '#a09fa5', classIds: ['c1', 'c2', 'c3', 'c4'] },
  { name: 'Physical Education', code: 'PE-101', teacherId: 't8', credits: 1, color: '#b4b3b9', classIds: ['c1', 'c2', 'c3', 'c4', 'c5', 'c6'] },
]

function createRandom(seed) {
  let state = seed
  return function random() {
    state += 0x6d2b79f5
    let value = Math.imul(state ^ (state >>> 15), 1 | state)
    value ^= value + Math.imul(value ^ (value >>> 7), 61 | value)
    return ((value ^ (value >>> 14)) >>> 0) / 4294967296
  }
}

function slugify(name) {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '.')
    .replace(/^\.|\.$/g, '')
}

function timeFrom(base, minutesToAdd) {
  const [hours, minutes] = base.split(':').map(Number)
  const total = hours * 60 + minutes + minutesToAdd
  return `${String(Math.floor(total / 60) % 24).padStart(2, '0')}:${String(total % 60).padStart(2, '0')}`
}

function endTimeFrom(start, duration = 45) {
  return timeFrom(start, duration)
}

export function createSeedDatabase() {
  const random = createRandom(20261108)
  const now = new Date()
  const today = format(now, 'yyyy-MM-dd')

  const classes = CLASSES.map((item, index) => ({
    id: `c${index + 1}`,
    ...item,
    description: `${item.level} cohort — room ${item.room}`,
    createdAt: '2024-08-20',
  }))

  const teachers = TEACHERS.map((item, index) => {
    const teacherClasses = classes.filter((cls) => String(cls.teacherId) === `t${index + 1}`)
    const course = COURSES.find((entry) => entry.teacherId === `t${index + 1}`)
    return {
      id: `t${index + 1}`,
      ...item,
      email: `${slugify(item.fullName.replace('Dr. ', ''))}@smartattendance.app`,
      profileImage: '',
      classIds: teacherClasses.map((cls) => cls.id),
      courseIds: COURSES.filter((entry) => entry.teacherId === `t${index + 1}`).map(
        (entry) => `co${COURSES.indexOf(entry) + 1}`,
      ),
      primaryCourse: course?.name ?? 'General Studies',
      hireDate: format(subDays(now, 900 + index * 120), 'yyyy-MM-dd'),
      status: index === 7 ? 'on-leave' : 'active',
      office: `Staff Room ${String.fromCharCode(65 + (index % 4))}`,
    }
  })

  const courses = COURSES.map((item, index) => ({
    id: `co${index + 1}`,
    ...item,
    description: `${item.name} curriculum for ${item.classIds.length} cohort(s).`,
    schedule: [
      { day: 'Monday', startTime: index % 2 === 0 ? '08:30' : '10:15', endTime: index % 2 === 0 ? '09:15' : '11:00' },
      { day: 'Wednesday', startTime: index % 2 === 0 ? '10:15' : '13:00', endTime: index % 2 === 0 ? '11:00' : '13:45' },
    ],
    createdAt: '2024-08-22',
  }))

  const students = STUDENT_NAMES.map((fullName, index) => {
    const classId = `c${(index % classes.length) + 1}`
    const status =
      index === 23 ? 'suspended' : index === 47 || index === 61 ? 'inactive' : 'active'
    return {
      id: `s${index + 1}`,
      fullName,
      email: `${slugify(fullName)}@student.smartattendance.app`,
      studentNumber: `STU-2024-${String(index + 1).padStart(3, '0')}`,
      classId,
      profileImage: '',
      enrollmentDate: format(subDays(now, 420 - (index % 40) * 3), 'yyyy-MM-dd'),
      status,
      guardianName: `${fullName.split(' ').slice(-1)[0]} Family`,
      phone: `+1 (415) 555-${String(1200 + index).slice(-4)}`,
      address: `${100 + index} Campus Avenue, Springfield`,
      reliability: 0.82 + random() * 0.16,
      createdAt: '2024-09-01',
    }
  })

  const attendance = []
  const sessions = []
  let sessionCounter = 0
  let attendanceCounter = 0

  const courseByClass = (classId) => {
    const options = courses.filter((course) => course.classIds.includes(classId))
    return options[Math.floor(random() * options.length)] ?? courses[0]
  }

  const addAttendanceForSession = (session, classId, statusOverride) => {
    const classStudents = students.filter((student) => student.classId === classId)
    classStudents.forEach((student) => {
      let status = statusOverride
      if (!status) {
        const risk = 1 - student.reliability
        const roll = random()
        if (student.status !== 'active') status = 'excused'
        else if (roll < risk * 0.55) status = 'absent'
        else if (roll < risk * 0.55 + risk * 0.35) status = 'late'
        else if (roll < risk * 0.55 + risk * 0.35 + 0.02) status = 'excused'
        else status = 'present'
      }
      const offset = status === 'late' ? 8 + Math.floor(random() * 20) : Math.floor(random() * 8)
      const time =
        status === 'absent'
          ? null
          : `${timeFrom(session.startTime, offset)}`
      attendanceCounter += 1
      attendance.push({
        id: `a${attendanceCounter}`,
        studentId: student.id,
        sessionId: session.id,
        classId,
        courseId: session.courseId,
        teacherId: session.teacherId,
        date: session.date,
        time,
        status,
        confidence: status === 'absent' ? null : Number((0.86 + random() * 0.13).toFixed(3)),
        method: random() > 0.12 ? 'face' : 'manual',
        note: status === 'excused' ? 'Excused absence recorded by staff.' : '',
      })
    })
  }

  for (let dayOffset = 28; dayOffset >= 1; dayOffset -= 1) {
    const date = subDays(now, dayOffset)
    if (isWeekend(date)) continue
    const dateKey = format(date, 'yyyy-MM-dd')
    classes.forEach((cls, classIndex) => {
      sessionCounter += 1
      const course = courseByClass(cls.id)
      const startTime = classIndex % 2 === 0 ? '08:30' : '10:15'
      const session = {
        id: `se${sessionCounter}`,
        title: `${course.name} — ${cls.name}`,
        classId: cls.id,
        courseId: course.id,
        teacherId: course.teacherId,
        date: dateKey,
        startTime,
        endTime: endTimeFrom(startTime),
        room: cls.room,
        status: 'completed',
        createdAt: format(subDays(date, 2), 'yyyy-MM-dd'),
      }
      sessions.push(session)
      addAttendanceForSession(session, cls.id)
    })
  }

  const todayStartTimes = ['08:30', '09:30', '10:30', '11:30', '13:00', '14:00']
  classes.forEach((cls, classIndex) => {
    sessionCounter += 1
    const course = courseByClass(cls.id)
    const startTime = todayStartTimes[classIndex]
    const status = classIndex === 4 ? 'active' : classIndex === 5 ? 'scheduled' : 'completed'
    const session = {
      id: `se${sessionCounter}`,
      title: `${course.name} — ${cls.name}`,
      classId: cls.id,
      courseId: course.id,
      teacherId: course.teacherId,
      date: today,
      startTime,
      endTime: endTimeFrom(startTime),
      room: cls.room,
      status,
      createdAt: format(subDays(now, 2), 'yyyy-MM-dd'),
    }
    sessions.push(session)
    if (status !== 'scheduled') {
      if (status === 'active') {
        const activeStudents = students.filter((student) => student.classId === cls.id)
        addAttendanceForSession(session, cls.id, null)
        // keep a few students still undetected in the active session
        const removable = attendance
          .filter((record) => record.sessionId === session.id && record.status === 'absent')
          .slice(0, 4)
        removable.forEach((record) => {
          const index = attendance.indexOf(record)
          if (index >= 0) attendance.splice(index, 1)
        })
        if (activeStudents.length === 0) {
          // no-op guard for empty classes
        }
      } else {
        addAttendanceForSession(session, cls.id)
      }
    }
  })

  for (let futureOffset = 1; futureOffset <= 3; futureOffset += 1) {
    const date = addDays(now, futureOffset)
    if (isWeekend(date)) continue
    const dateKey = format(date, 'yyyy-MM-dd')
    classes.slice(0, 3).forEach((cls, classIndex) => {
      sessionCounter += 1
      const course = courseByClass(cls.id)
      const startTime = classIndex % 2 === 0 ? '09:00' : '11:00'
      sessions.push({
        id: `se${sessionCounter}`,
        title: `${course.name} — ${cls.name}`,
        classId: cls.id,
        courseId: course.id,
        teacherId: course.teacherId,
        date: dateKey,
        startTime,
        endTime: endTimeFrom(startTime),
        room: cls.room,
        status: 'scheduled',
        createdAt: format(now, 'yyyy-MM-dd'),
      })
    })
  }

  const faces = students.map((student, index) => {
    if (index < 52) {
      return {
        id: `f${index + 1}`,
        studentId: student.id,
        status: 'registered',
        quality: Number((0.88 + random() * 0.11).toFixed(3)),
        samples: 3 + Math.floor(random() * 4),
        registeredAt: format(subDays(now, 30 + index), 'yyyy-MM-dd'),
        notes: 'Biometric template stored on the recognition backend.',
      }
    }
    if (index < 63) {
      return {
        id: `f${index + 1}`,
        studentId: student.id,
        status: index === 61 ? 'failed' : 'pending',
        quality: index === 61 ? 0.41 : Number((0.62 + random() * 0.2).toFixed(3)),
        samples: index === 61 ? 1 : 2,
        registeredAt: null,
        submittedAt: format(subDays(now, 3 + (index % 9)), 'yyyy-MM-dd'),
        notes: index === 61 ? 'Low light during capture. Retry recommended.' : 'Awaiting backend review.',
      }
    }
    return {
      id: `f${index + 1}`,
      studentId: student.id,
      status: 'not_registered',
      quality: null,
      samples: 0,
      registeredAt: null,
      notes: 'No biometric template on file.',
    }
  })

  const notificationTemplates = [
    {
      type: 'recognition',
      severity: 'success',
      title: 'Face recognized',
      message: 'Ahmed Al-Farsi was recognized and marked present in Mathematics.',
    },
    {
      type: 'absence',
      severity: 'warning',
      title: 'Absence alert',
      message: '3 students are marked absent in Grade 11 - A this morning.',
    },
    {
      type: 'late',
      severity: 'warning',
      title: 'Late arrivals',
      message: '2 students arrived late for English Literature.',
    },
    {
      type: 'detection',
      severity: 'danger',
      title: 'Low confidence match',
      message: 'A recognition event scored below the 0.80 confidence threshold.',
    },
    {
      type: 'backend',
      severity: 'danger',
      title: 'Detection backend reconnecting',
      message: 'The WebSocket detection stream dropped and reconnected automatically.',
    },
    {
      type: 'session',
      severity: 'info',
      title: 'Session started',
      message: 'Physics — Grade 11 - A is now live.',
    },
    {
      type: 'recognition',
      severity: 'success',
      title: 'Face recognized',
      message: 'Maya Chen was recognized and marked present in Computer Science.',
    },
    {
      type: 'absence',
      severity: 'warning',
      title: 'Attendance threshold',
      message: 'Grade 10 - B dropped below the 85% daily attendance target.',
    },
    {
      type: 'session',
      severity: 'info',
      title: 'Session completed',
      message: 'Biology — Grade 12 - A finished with 92% attendance.',
    },
    {
      type: 'late',
      severity: 'warning',
      title: 'Late arrival',
      message: 'Liam O’Connor arrived 14 minutes late to World History.',
    },
    {
      type: 'backend',
      severity: 'info',
      title: 'Backend connected',
      message: 'Recognition API is healthy and accepting detection events.',
    },
    {
      type: 'detection',
      severity: 'warning',
      title: 'Camera frame skipped',
      message: '2 frames were skipped because lighting conditions were poor.',
    },
  ]

  const notifications = notificationTemplates.map((item, index) => ({
    id: `n${index + 1}`,
    ...item,
    createdAt: new Date(now.getTime() - index * 47 * 60 * 1000).toISOString(),
    read: index > 4,
  }))

  const settings = {
    profile: {
      fullName: '',
      email: '',
      phone: '+1 (415) 555-0190',
      title: '',
      timezone: 'America/Los_Angeles',
    },
    preferences: {
      language: 'en',
      weekStart: 'monday',
      dateFormat: 'MMM d, yyyy',
      emailDigest: true,
      compactTables: false,
    },
    camera: {
      deviceId: '',
      facingMode: 'user',
      mirrorPreview: true,
      resolution: '1280x720',
    },
    detection: {
      confidenceThreshold: 0.85,
      autoMark: true,
      cooldownSeconds: 30,
      sessionMinutes: 60,
      markLateAfterMinutes: 10,
      simulatedMode: true,
    },
    notifications: {
      recognition: true,
      absence: true,
      late: true,
      detectionErrors: true,
      backendErrors: true,
      sessionChanges: true,
      channels: { inApp: true, email: true },
    },
    api: {
      baseUrl: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api',
      websocketUrl: 'ws://localhost:8000/ws/detection',
      detectionMode: import.meta.env.VITE_DETECTION_MODE || 'mock',
      timeout: 15000,
    },
  }

  return {
    version: 2,
    seededAt: now.toISOString(),
    students,
    teachers,
    classes,
    courses,
    sessions,
    attendance,
    faces,
    notifications,
    settings,
  }
}
