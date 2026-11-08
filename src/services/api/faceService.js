import { delay } from '@/lib/delay'
import { uid } from '@/utils/id'
import { getCollection, getDb, setCollection } from './db'

function enrich(face, db) {
  const student = db.students.find((entry) => entry.id === face.studentId)
  const cls = db.classes.find((entry) => entry.id === student?.classId)
  return {
    ...face,
    studentName: student?.fullName ?? 'Removed student',
    studentNumber: student?.studentNumber ?? '—',
    className: cls?.name ?? '—',
    classId: cls?.id ?? '',
    enrollmentDate: student?.enrollmentDate ?? null,
    status: student ? face.status : 'not_registered',
  }
}

async function withDelay(fn, ms = 380) {
  await delay(ms)
  return fn()
}

export const faceService = {
  list() {
    return withDelay(() => {
      const db = getDb()
      return db.faces.map((face) => enrich(face, db))
    })
  },

  getForStudent(studentId) {
    return withDelay(() => {
      const db = getDb()
      const face = db.faces.find((entry) => entry.studentId === studentId)
      return face ? enrich(face, db) : null
    }, 240)
  },

  submitForRegistration(studentId, captureMeta = {}) {
    return withDelay(() => {
      const db = getDb()
      const student = db.students.find((entry) => entry.id === studentId)
      if (!student) throw new Error('Student not found')
      const existing = db.faces.find((face) => face.studentId === studentId)
      const updated = existing
        ? {
            ...existing,
            status: 'pending',
            submittedAt: new Date().toISOString(),
            quality: captureMeta.quality ?? 0.78,
            samples: (existing.samples ?? 0) + 1,
            notes:
              'Image submitted to the backend queue. Biometric registration is simulated in this prototype.',
          }
        : {
            id: uid('f'),
            studentId,
            status: 'pending',
            submittedAt: new Date().toISOString(),
            quality: captureMeta.quality ?? 0.78,
            samples: 1,
            registeredAt: null,
            notes:
              'Image submitted to the backend queue. Biometric registration is simulated in this prototype.',
          }
      const faces = existing
        ? db.faces.map((face) => (face.studentId === studentId ? updated : face))
        : [updated, ...getCollection('faces')]
      setCollection('faces', faces)
      return enrich(updated, getDb())
    }, 700)
  },

  markForRetry(studentId) {
    return withDelay(() => {
      const db = getDb()
      const face = db.faces.find((entry) => entry.studentId === studentId)
      if (!face) throw new Error('Face record not found')
      const updated = {
        ...face,
        status: 'not_registered',
        quality: null,
        samples: 0,
        notes: 'Previous submission cleared. Capture a new image to retry.',
      }
      setCollection(
        'faces',
        db.faces.map((entry) => (entry.studentId === studentId ? updated : entry)),
      )
      return enrich(updated, getDb())
    }, 300)
  },
}
