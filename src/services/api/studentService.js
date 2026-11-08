import { delay } from '@/lib/delay'
import { uid } from '@/utils/id'
import { getCollection, setCollection, getDb } from './db'

function enrich(student, db) {
  const cls = db.classes.find((entry) => entry.id === student.classId)
  const face = db.faces.find((entry) => entry.studentId === student.id)
  return {
    ...student,
    className: cls?.name ?? 'Unassigned',
    classLevel: cls?.level ?? '—',
    faceStatus: face?.status ?? 'not_registered',
  }
}

async function withDelay(fn, ms = 380) {
  await delay(ms)
  return fn()
}

export const studentService = {
  list() {
    return withDelay(() => {
      const db = getDb()
      return db.students.map((student) => enrich(student, db))
    })
  },

  get(id) {
    return withDelay(() => {
      const db = getDb()
      const student = db.students.find((entry) => entry.id === id)
      if (!student) throw new Error('Student not found')
      return enrich(student, db)
    })
  },

  create(payload) {
    return withDelay(() => {
      const students = getCollection('students')
      const nextNumber =
        payload.studentNumber?.trim() ||
        `STU-${new Date().getFullYear()}-${String(students.length + 1).padStart(3, '0')}`
      const duplicate = students.some(
        (entry) => entry.studentNumber.toLowerCase() === nextNumber.toLowerCase(),
      )
      if (duplicate) throw new Error('A student with this student number already exists.')
      const student = {
        id: uid('s'),
        fullName: payload.fullName.trim(),
        email: payload.email.trim(),
        studentNumber: nextNumber,
        classId: payload.classId,
        profileImage: payload.profileImage ?? '',
        enrollmentDate: payload.enrollmentDate,
        status: payload.status ?? 'active',
        guardianName: payload.guardianName ?? '',
        phone: payload.phone ?? '',
        address: payload.address ?? '',
        reliability: 0.9,
        createdAt: new Date().toISOString(),
      }
      setCollection('students', [student, ...students])
      const faces = getCollection('faces')
      setCollection('faces', [
        {
          id: uid('f'),
          studentId: student.id,
          status: 'not_registered',
          quality: null,
          samples: 0,
          registeredAt: null,
          notes: 'No biometric template on file.',
        },
        ...faces,
      ])
      return enrich(student, getDb())
    })
  },

  update(id, payload) {
    return withDelay(() => {
      const students = getCollection('students')
      let updated = null
      const next = students.map((student) => {
        if (student.id !== id) return student
        updated = { ...student, ...payload }
        return updated
      })
      if (!updated) throw new Error('Student not found')
      setCollection('students', next)
      return enrich(updated, getDb())
    })
  },

  remove(id) {
    return withDelay(() => {
      const students = getCollection('students')
      if (!students.some((student) => student.id === id)) throw new Error('Student not found')
      setCollection(
        'students',
        students.filter((student) => student.id !== id),
      )
      setCollection(
        'faces',
        getCollection('faces').filter((face) => face.studentId !== id),
      )
      setCollection(
        'attendance',
        getCollection('attendance').filter((record) => record.studentId !== id),
      )
      return { id }
    })
  },
}
