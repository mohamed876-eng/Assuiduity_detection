import { delay } from '@/lib/delay'
import { addMonths, format, startOfMonth, subDays, subMonths } from 'date-fns'
import { getDb } from './db'

export function summarize(records) {
  const counts = { present: 0, absent: 0, late: 0, excused: 0 }
  records.forEach((record) => {
    counts[record.status] = (counts[record.status] ?? 0) + 1
  })
  const total = records.length
  const rate = total ? ((counts.present + counts.late) / total) * 100 : 0
  return { ...counts, total, rate: Number(rate.toFixed(1)) }
}

function dayRate(records, dateKey) {
  const dayRecords = records.filter((record) => record.date === dateKey)
  return { ...summarize(dayRecords), date: dateKey }
}

function baseMonthly() {
  const now = new Date()
  const rates = [92.4, 90.8, 93.1, 89.7, 91.9, 92.8]
  return rates.map((rate, index) => {
    const month = subMonths(now, rates.length - 1 - index)
    const total = 1400 + index * 32
    return {
      month: format(month, 'MMM'),
      period: format(month, 'yyyy-MM'),
      rate,
      present: Math.round((total * rate) / 100),
      absent: Math.round(total * (1 - rate / 100)),
      total,
    }
  })
}

export const analyticsService = {
  async dashboard() {
    await delay(420)
    const db = getDb()
    const today = format(new Date(), 'yyyy-MM-dd')
    const yesterday = format(subDays(new Date(), 1), 'yyyy-MM-dd')
    const todayRecords = db.attendance.filter((record) => record.date === today)
    const yesterdayRecords = db.attendance.filter((record) => record.date === yesterday)
    const counts = summarize(todayRecords)
    const yesterdayCounts = summarize(yesterdayRecords)

    const weekly = []
    for (let offset = 6; offset >= 0; offset -= 1) {
      const date = subDays(new Date(), offset)
      const key = format(date, 'yyyy-MM-dd')
      const day = dayRate(db.attendance, key)
      weekly.push({
        date: key,
        day: format(date, 'EEE'),
        rate: day.rate,
        present: day.present,
        absent: day.absent,
        late: day.late,
      })
    }

    const hallPass = db.courses[0]?.color ?? '#343338'
    const byClass = db.classes.map((cls) => {
      const records = db.attendance.filter((record) => record.classId === cls.id)
      const summary = summarize(records)
      return {
        id: cls.id,
        name: cls.name,
        rate: summary.rate,
        present: summary.present,
        absent: summary.absent,
        late: summary.late,
        total: summary.total,
        color: hallPass,
      }
    })

    const allRecordsSorted = [...db.attendance].sort((a, b) => {
      if (a.date === b.date) return (b.time ?? '').localeCompare(a.time ?? '')
      return b.date.localeCompare(a.date)
    })

    const recentActivity = allRecordsSorted.slice(0, 8).map((record) => {
      const student = db.students.find((entry) => entry.id === record.studentId)
      const course = db.courses.find((entry) => entry.id === record.courseId)
      const cls = db.classes.find((entry) => entry.id === record.classId)
      return {
        id: record.id,
        studentName: student?.fullName ?? 'Unknown student',
        studentId: student?.id,
        courseName: course?.name ?? '—',
        className: cls?.name ?? '—',
        status: record.status,
        date: record.date,
        time: record.time,
        confidence: record.confidence,
      }
    })

    const upcomingSessions = db.sessions
      .filter((session) => session.date >= today && ['scheduled', 'active'].includes(session.status))
      .sort((a, b) => `${a.date}${a.startTime}`.localeCompare(`${b.date}${b.startTime}`))
      .slice(0, 5)
      .map((session) => {
        const cls = db.classes.find((entry) => entry.id === session.classId)
        const course = db.courses.find((entry) => entry.id === session.courseId)
        const teacher = db.teachers.find((entry) => entry.id === session.teacherId)
        return {
          ...session,
          className: cls?.name ?? '—',
          courseName: course?.name ?? '—',
          teacherName: teacher?.fullName ?? '—',
        }
      })

    const alerts = db.notifications
      .filter((notification) => !notification.read && notification.severity !== 'info')
      .slice(0, 4)

    return {
      stats: {
        totalStudents: db.students.length,
        activeStudents: db.students.filter((student) => student.status === 'active').length,
        totalTeachers: db.teachers.length,
        presentToday: counts.present,
        absentToday: counts.absent,
        lateToday: counts.late,
        excusedToday: counts.excused,
        recordedToday: counts.total,
        attendanceRate: counts.rate,
        presentDelta: counts.present - yesterdayCounts.present,
        absentDelta: counts.absent - yesterdayCounts.absent,
        lateDelta: counts.late - yesterdayCounts.late,
        rateDelta: Number((counts.rate - yesterdayCounts.rate).toFixed(1)),
        faceRegistered: db.faces.filter((face) => face.status === 'registered').length,
      },
      weekly,
      monthly: baseMonthly(),
      distribution: {
        present: counts.present,
        absent: counts.absent,
        late: counts.late,
        excused: counts.excused,
      },
      byClass,
      recentActivity,
      upcomingSessions,
      alerts,
    }
  },

  async studentSummaries() {
    await delay(260)
    const db = getDb()
    const map = {}
    db.students.forEach((student) => {
      map[student.id] = summarize(
        db.attendance.filter((record) => record.studentId === student.id),
      )
    })
    return map
  },

  async report({ from, to }) {
    await delay(420)
    const db = getDb()
    const raw = db.attendance.filter(
      (record) => (!from || record.date >= from) && (!to || record.date <= to),
    )
    const enrich = (record) => {
      const student = db.students.find((entry) => entry.id === record.studentId)
      const cls = db.classes.find((entry) => entry.id === record.classId)
      const course = db.courses.find((entry) => entry.id === record.courseId)
      return {
        ...record,
        studentName: student?.fullName ?? 'Removed student',
        studentNumber: student?.studentNumber ?? '—',
        className: cls?.name ?? '—',
        courseName: course?.name ?? '—',
      }
    }
    const records = raw.map(enrich)
    const totals = summarize(records)
    const group = (key) => {
      const groups = {}
      records.forEach((record) => {
        const id = record[key]
        if (!groups[id]) groups[id] = []
        groups[id].push(record)
      })
      return groups
    }

    const byStudent = Object.entries(group('studentId')).map(([id, items]) => {
      const summary = summarize(items)
      return {
        id,
        name: items[0]?.studentName ?? 'Unknown',
        studentNumber: items[0]?.studentNumber ?? '—',
        className: items[0]?.className ?? '—',
        ...summary,
      }
    })

    const byClass = Object.entries(group('classId')).map(([id, items]) => ({
      id,
      name: items[0]?.className ?? 'Unknown',
      ...summarize(items),
    }))

    const byCourse = Object.entries(group('courseId')).map(([id, items]) => ({
      id,
      name: items[0]?.courseName ?? 'Unknown',
      ...summarize(items),
    }))

    const dayMap = {}
    records.forEach((record) => {
      if (!dayMap[record.date]) dayMap[record.date] = []
      dayMap[record.date].push(record)
    })
    const trend = Object.entries(dayMap)
      .map(([date, items]) => ({ date, label: format(new Date(`${date}T00:00:00`), 'MMM d'), ...summarize(items) }))
      .sort((a, b) => a.date.localeCompare(b.date))

    const absenceStats = [...byStudent].sort((a, b) => b.absent - a.absent).slice(0, 8)
    const lateStats = [...byStudent].sort((a, b) => b.late - a.late).slice(0, 8)

    return {
      totals,
      byStudent: byStudent.sort((a, b) => b.total - a.total),
      byClass: byClass.sort((a, b) => b.total - a.total),
      byCourse: byCourse.sort((a, b) => b.total - a.total),
      trend,
      absenceStats,
      lateStats,
      records,
      range: { from, to, fromMonth: format(startOfMonth(new Date(`${from || new Date().toISOString().slice(0, 10)}T00:00:00`)), 'MMM yyyy') },
    }
  },
}

export function nextMonths(count = 6) {
  const now = new Date()
  return Array.from({ length: count }, (_, index) => addMonths(now, index))
}
