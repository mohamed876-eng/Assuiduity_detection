import { delay } from '@/lib/delay'
import { uid } from '@/utils/id'
import { getCollection, getDb, setCollection } from './db'

function enrich(teacher, db) {
  const classes = db.classes.filter((entry) => entry.teacherId === teacher.id)
  const courses = db.courses.filter((entry) => entry.teacherId === teacher.id)
  return {
    ...teacher,
    classIds: teacher.classIds?.length ? teacher.classIds : classes.map((entry) => entry.id),
    classNameList: classes.map((entry) => entry.name),
    courseNameList: courses.map((entry) => entry.name),
    primaryCourse: courses[0]?.name ?? teacher.primaryCourse ?? 'General Studies',
  }
}

async function withDelay(fn, ms = 360) {
  await delay(ms)
  return fn()
}

export const teacherService = {
  list() {
    return withDelay(() => {
      const db = getDb()
      return db.teachers.map((teacher) => enrich(teacher, db))
    })
  },

  get(id) {
    return withDelay(() => {
      const db = getDb()
      const teacher = db.teachers.find((entry) => entry.id === id)
      if (!teacher) throw new Error('Teacher not found')
      return enrich(teacher, db)
    })
  },

  create(payload) {
    return withDelay(() => {
      const teachers = getCollection('teachers')
      const teacher = {
        id: uid('t'),
        fullName: payload.fullName.trim(),
        email: payload.email.trim(),
        phone: payload.phone ?? '',
        subject: payload.subject,
        profileImage: '',
        classIds: payload.classIds ?? [],
        courseIds: [],
        primaryCourse: '',
        hireDate: payload.hireDate,
        status: payload.status ?? 'active',
        office: payload.office ?? 'Staff Room A',
      }
      setCollection('teachers', [teacher, ...teachers])
      return enrich(teacher, getDb())
    })
  },

  update(id, payload) {
    return withDelay(() => {
      const teachers = getCollection('teachers')
      let updated = null
      const next = teachers.map((teacher) => {
        if (teacher.id !== id) return teacher
        updated = { ...teacher, ...payload }
        return updated
      })
      if (!updated) throw new Error('Teacher not found')
      setCollection('teachers', next)
      return enrich(updated, getDb())
    })
  },

  remove(id) {
    return withDelay(() => {
      const teachers = getCollection('teachers')
      if (!teachers.some((teacher) => teacher.id === id)) throw new Error('Teacher not found')
      setCollection(
        'teachers',
        teachers.filter((teacher) => teacher.id !== id),
      )
      setCollection(
        'classes',
        getCollection('classes').map((cls) =>
          cls.teacherId === id ? { ...cls, teacherId: '' } : cls,
        ),
      )
      return { id }
    })
  },
}
