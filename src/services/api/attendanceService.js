import { delay } from '@/lib/delay'
import { format } from 'date-fns'
import { getCollection, getDb, setCollection } from './db'
import { uid } from '@/utils/id'

function enrich(record, db) {
  const student = db.students.find((entry) => entry.id === record.studentId)
  const cls = db.classes.find((entry) => entry.id === record.classId)
  const course = db.courses.find((entry) => entry.id === record.courseId)
  const teacher = db.teachers.find((entry) => entry.id === record.teacherId)
  return {
    ...record,
    studentName: student?.fullName ?? 'Removed student',
    studentNumber: student?.studentNumber ?? '—',
    studentImage: student?.profileImage ?? '',
    className: cls?.name ?? '—',
    courseName: course?.name ?? '—',
    courseCode: course?.code ?? '—',
    teacherName: teacher?.fullName ?? '—',
  }
}

async function withDelay(fn, ms = 420) {
  await delay(ms)
  return fn()
}

function sortRecords(records) {
  return [...records].sort((a, b) => {
    if (a.date === b.date) return (b.time ?? '').localeCompare(a.time ?? '')
    return b.date.localeCompare(a.date)
  })
}

export const attendanceService = {
  list(filters = {}) {
    return withDelay(() => {
      const db = getDb()
      let records = db.attendance.map((record) => enrich(record, db))
      if (filters.studentId) records = records.filter((r) => r.studentId === filters.studentId)
      if (filters.classId) records = records.filter((r) => r.classId === filters.classId)
      if (filters.courseId) records = records.filter((r) => r.courseId === filters.courseId)
      if (filters.sessionId) records = records.filter((r) => r.sessionId === filters.sessionId)
      if (filters.status) records = records.filter((r) => r.status === filters.status)
      if (filters.date) records = records.filter((r) => r.date === filters.date)
      if (filters.from) records = records.filter((r) => r.date >= filters.from)
      if (filters.to) records = records.filter((r) => r.date <= filters.to)
      if (filters.search) {
        const term = filters.search.toLowerCase()
        records = records.filter(
          (r) =>
            r.studentName.toLowerCase().includes(term) ||
            r.studentNumber.toLowerCase().includes(term) ||
            r.courseName.toLowerCase().includes(term),
        )
      }
      return sortRecords(records)
    })
  },

  get(id) {
    return withDelay(() => {
      const db = getDb()
      const record = db.attendance.find((entry) => entry.id === id)
      if (!record) throw new Error('Attendance record not found')
      return enrich(record, db)
    })
  },

  updateStatus(id, status, note = '') {
    return withDelay(() => {
      const records = getCollection('attendance')
      let updated = null
      const next = records.map((record) => {
        if (record.id !== id) return record
        updated = {
          ...record,
          status,
          note,
          method: 'manual',
          time: status === 'absent' ? null : record.time ?? format(new Date(), 'HH:mm'),
        }
        return updated
      })
      if (!updated) throw new Error('Attendance record not found')
      setCollection('attendance', next)
      return enrich(updated, getDb())
    }, 300)
  },

  markFromDetection(payload) {
    const records = getCollection('attendance')
    const timestamp = payload.timestamp ? new Date(payload.timestamp) : new Date()
    const existing = records.find(
      (record) => record.sessionId === payload.sessionId && record.studentId === payload.studentId,
    )
    const nextRecord = {
      id: existing?.id ?? uid('a'),
      studentId: payload.studentId,
      sessionId: payload.sessionId,
      classId: payload.classId,
      courseId: payload.courseId,
      teacherId: payload.teacherId,
      date: payload.date,
      time: format(timestamp, 'HH:mm'),
      status: payload.status,
      confidence: payload.confidence,
      method: 'face',
      note: 'Updated by simulated live detection.',
    }
    const next = existing
      ? records.map((record) => (record.id === existing.id ? { ...record, ...nextRecord } : record))
      : [nextRecord, ...records]
    setCollection('attendance', next)
    return enrich(nextRecord, getDb())
  },

  statsToday() {
    return withDelay(() => {
      const today = format(new Date(), 'yyyy-MM-dd')
      const records = getCollection('attendance').filter((record) => record.date === today)
      const counts = { present: 0, absent: 0, late: 0, excused: 0 }
      records.forEach((record) => {
        counts[record.status] = (counts[record.status] ?? 0) + 1
      })
      const total = records.length
      const rate = total ? ((counts.present + counts.late) / total) * 100 : 0
      return { ...counts, total, rate }
    }, 260)
  },
}
