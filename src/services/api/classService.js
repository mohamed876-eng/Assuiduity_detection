import { delay } from '@/lib/delay'
import { uid } from '@/utils/id'
import { getCollection, getDb, setCollection } from './db'

function enrich(cls, db) {
  const teacher = db.teachers.find((entry) => entry.id === cls.teacherId)
  const students = db.students.filter((student) => student.classId === cls.id)
  const courses = db.courses.filter((course) => course.classIds.includes(cls.id))
  return {
    ...cls,
    teacherName: teacher?.fullName ?? 'Unassigned',
    teacherEmail: teacher?.email ?? '',
    studentCount: students.length,
    courseCount: courses.length,
    courseNames: courses.map((course) => course.name),
    capacity: cls.capacity ?? 30,
  }
}

async function withDelay(fn, ms = 360) {
  await delay(ms)
  return fn()
}

export const classService = {
  list() {
    return withDelay(() => {
      const db = getDb()
      return db.classes.map((cls) => enrich(cls, db))
    })
  },

  get(id) {
    return withDelay(() => {
      const db = getDb()
      const cls = db.classes.find((entry) => entry.id === id)
      if (!cls) throw new Error('Class not found')
      return enrich(cls, db)
    })
  },

  create(payload) {
    return withDelay(() => {
      const classes = getCollection('classes')
      const cls = {
        id: uid('c'),
        name: payload.name.trim(),
        level: payload.level,
        room: payload.room,
        teacherId: payload.teacherId ?? '',
        capacity: Number(payload.capacity) || 30,
        description: payload.description ?? '',
        createdAt: new Date().toISOString(),
      }
      setCollection('classes', [cls, ...classes])
      return enrich(cls, getDb())
    })
  },

  update(id, payload) {
    return withDelay(() => {
      const classes = getCollection('classes')
      let updated = null
      const next = classes.map((cls) => {
        if (cls.id !== id) return cls
        updated = { ...cls, ...payload, capacity: Number(payload.capacity) || 30 }
        return updated
      })
      if (!updated) throw new Error('Class not found')
      setCollection('classes', next)
      return enrich(updated, getDb())
    })
  },

  remove(id) {
    return withDelay(() => {
      const classes = getCollection('classes')
      if (!classes.some((cls) => cls.id === id)) throw new Error('Class not found')
      setCollection(
        'classes',
        classes.filter((cls) => cls.id !== id),
      )
      setCollection(
        'students',
        getCollection('students').map((student) =>
          student.classId === id ? { ...student, classId: '' } : student,
        ),
      )
      setCollection(
        'courses',
        getCollection('courses').map((course) => ({
          ...course,
          classIds: course.classIds.filter((classId) => classId !== id),
        })),
      )
      return { id }
    })
  },
}
