import { delay } from '@/lib/delay'
import { format } from 'date-fns'
import { uid } from '@/utils/id'
import { getCollection, getDb, setCollection } from './db'
import { notificationService } from './notificationService'

function enrich(session, db) {
  const cls = db.classes.find((entry) => entry.id === session.classId)
  const course = db.courses.find((entry) => entry.id === session.courseId)
  const teacher = db.teachers.find((entry) => entry.id === session.teacherId)
  const records = db.attendance.filter((record) => record.sessionId === session.id)
  const counts = { present: 0, absent: 0, late: 0, excused: 0 }
  records.forEach((record) => {
    counts[record.status] = (counts[record.status] ?? 0) + 1
  })
  const studentCount = db.students.filter((student) => student.classId === session.classId).length
  return {
    ...session,
    className: cls?.name ?? '—',
    courseName: course?.name ?? '—',
    courseCode: course?.code ?? '—',
    teacherName: teacher?.fullName ?? '—',
    studentCount,
    counts,
    recorded: records.length,
    attendanceRate: records.length
      ? Math.round(((counts.present + counts.late) / records.length) * 100)
      : 0,
  }
}

async function withDelay(fn, ms = 380) {
  await delay(ms)
  return fn()
}

export const sessionService = {
  list() {
    return withDelay(() => {
      const db = getDb()
      return db.sessions
        .map((session) => enrich(session, db))
        .sort((a, b) => {
          if (a.date === b.date) return b.startTime.localeCompare(a.startTime)
          return b.date.localeCompare(a.date)
        })
    })
  },

  get(id) {
    return withDelay(() => {
      const db = getDb()
      const session = db.sessions.find((entry) => entry.id === id)
      if (!session) throw new Error('Session not found')
      return enrich(session, db)
    })
  },

  create(payload) {
    return withDelay(() => {
      const db = getDb()
      const cls = db.classes.find((entry) => entry.id === payload.classId)
      const course = db.courses.find((entry) => entry.id === payload.courseId)
      const session = {
        id: uid('se'),
        title: `${course?.name ?? 'Session'} — ${cls?.name ?? 'Class'}`,
        classId: payload.classId,
        courseId: payload.courseId,
        teacherId: payload.teacherId,
        date: payload.date,
        startTime: payload.startTime,
        endTime: payload.endTime,
        room: payload.room ?? cls?.room ?? '—',
        status: 'scheduled',
        createdAt: new Date().toISOString(),
      }
      setCollection('sessions', [session, ...getCollection('sessions')])
      return enrich(session, getDb())
    })
  },

  update(id, payload) {
    return withDelay(() => {
      const sessions = getCollection('sessions')
      let updated = null
      const next = sessions.map((session) => {
        if (session.id !== id) return session
        updated = { ...session, ...payload }
        return updated
      })
      if (!updated) throw new Error('Session not found')
      setCollection('sessions', next)
      return enrich(updated, getDb())
    })
  },

  start(id) {
    return withDelay(() => {
      const db = getDb()
      const session = db.sessions.find((entry) => entry.id === id)
      if (!session) throw new Error('Session not found')
      if (session.status === 'active') return enrich(session, db)
      const next = db.sessions.map((entry) =>
        entry.id === id ? { ...entry, status: 'active', startedAt: new Date().toISOString() } : entry,
      )
      setCollection('sessions', next)
      notificationService.add({
        type: 'session',
        severity: 'info',
        title: 'Session started',
        message: `${session.title} is now live.`,
      })
      return enrich({ ...session, status: 'active' }, getDb())
    }, 500)
  },

  stop(id) {
    return withDelay(() => {
      const db = getDb()
      const session = db.sessions.find((entry) => entry.id === id)
      if (!session) throw new Error('Session not found')
      const classStudents = db.students.filter((student) => student.classId === session.classId)
      const recorded = new Set(
        db.attendance
          .filter((record) => record.sessionId === session.id)
          .map((record) => record.studentId),
      )
      const missing = classStudents.filter((student) => !recorded.has(student.id))
      if (missing.length) {
        const newRecords = missing.map((student) => ({
          id: uid('a'),
          studentId: student.id,
          sessionId: session.id,
          classId: session.classId,
          courseId: session.courseId,
          teacherId: session.teacherId,
          date: session.date,
          time: null,
          status: 'absent',
          confidence: null,
          method: 'auto',
          note: 'No recognition event received before session close.',
        }))
        setCollection('attendance', [...newRecords, ...getCollection('attendance')])
      }
      const next = getCollection('sessions').map((entry) =>
        entry.id === id
          ? { ...entry, status: 'completed', stoppedAt: new Date().toISOString() }
          : entry,
      )
      setCollection('sessions', next)
      notificationService.add({
        type: 'session',
        severity: 'info',
        title: 'Session completed',
        message: `${session.title} has been closed${missing.length ? ` with ${missing.length} auto-marked absent` : ''}.`,
      })
      return enrich({ ...session, status: 'completed' }, getDb())
    }, 600)
  },

  remove(id) {
    return withDelay(() => {
      const sessions = getCollection('sessions')
      if (!sessions.some((session) => session.id === id)) throw new Error('Session not found')
      setCollection(
        'sessions',
        sessions.filter((session) => session.id !== id),
      )
      setCollection(
        'attendance',
        getCollection('attendance').filter((record) => record.sessionId !== id),
      )
      return { id }
    })
  },
}

export function todayKey() {
  return format(new Date(), 'yyyy-MM-dd')
}
