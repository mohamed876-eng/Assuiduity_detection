import { delay } from '@/lib/delay'
import { uid } from '@/utils/id'
import { getCollection, getDb, setCollection } from './db'

function enrich(course, db) {
  const teacher = db.teachers.find((entry) => entry.id === course.teacherId)
  const classList = db.classes.filter((cls) => course.classIds.includes(cls.id))
  return {
    ...course,
    teacherName: teacher?.fullName ?? 'Unassigned',
    classNames: classList.map((cls) => cls.name),
    studentCount: db.students.filter((student) => course.classIds.includes(student.classId)).length,
  }
}

async function withDelay(fn, ms = 360) {
  await delay(ms)
  return fn()
}

export const courseService = {
  list() {
    return withDelay(() => {
      const db = getDb()
      return db.courses.map((course) => enrich(course, db))
    })
  },

  get(id) {
    return withDelay(() => {
      const db = getDb()
      const course = db.courses.find((entry) => entry.id === id)
      if (!course) throw new Error('Course not found')
      return enrich(course, db)
    })
  },

  create(payload) {
    return withDelay(() => {
      const courses = getCollection('courses')
      const codeExists = courses.some(
        (course) => course.code.toLowerCase() === payload.code.trim().toLowerCase(),
      )
      if (codeExists) throw new Error('A course with this code already exists.')
      const course = {
        id: uid('co'),
        name: payload.name.trim(),
        code: payload.code.trim().toUpperCase(),
        teacherId: payload.teacherId ?? '',
        classIds: payload.classIds ?? [],
        credits: Number(payload.credits) || 1,
        color: payload.color ?? '#343338',
        description: payload.description ?? '',
        schedule: payload.schedule ?? [],
        createdAt: new Date().toISOString(),
      }
      setCollection('courses', [course, ...courses])
      return enrich(course, getDb())
    })
  },

  update(id, payload) {
    return withDelay(() => {
      const courses = getCollection('courses')
      let updated = null
      const next = courses.map((course) => {
        if (course.id !== id) return course
        updated = {
          ...course,
          ...payload,
          code: payload.code?.trim().toUpperCase() ?? course.code,
          credits: Number(payload.credits) || course.credits,
        }
        return updated
      })
      if (!updated) throw new Error('Course not found')
      setCollection('courses', next)
      return enrich(updated, getDb())
    })
  },

  remove(id) {
    return withDelay(() => {
      const courses = getCollection('courses')
      if (!courses.some((course) => course.id === id)) throw new Error('Course not found')
      setCollection(
        'courses',
        courses.filter((course) => course.id !== id),
      )
      return { id }
    })
  },
}
