import { delay } from '@/lib/delay'
import { getDb } from './db'

export async function globalSearch(term) {
  await delay(220)
  const query = term.trim().toLowerCase()
  if (query.length < 2) return { students: [], teachers: [], classes: [], courses: [] }
  const db = getDb()
  const includes = (value) => (value ?? '').toLowerCase().includes(query)

  return {
    students: db.students
      .filter((student) => includes(student.fullName) || includes(student.studentNumber) || includes(student.email))
      .slice(0, 5)
      .map((student) => {
        const cls = db.classes.find((entry) => entry.id === student.classId)
        return {
          id: student.id,
          title: student.fullName,
          subtitle: `${student.studentNumber} · ${cls?.name ?? 'Unassigned'}`,
          to: `/students/${student.id}`,
        }
      }),
    teachers: db.teachers
      .filter((teacher) => includes(teacher.fullName) || includes(teacher.email) || includes(teacher.subject))
      .slice(0, 3)
      .map((teacher) => ({
        id: teacher.id,
        title: teacher.fullName,
        subtitle: teacher.subject,
        to: `/teachers/${teacher.id}`,
      })),
    classes: db.classes
      .filter((cls) => includes(cls.name) || includes(cls.level) || includes(cls.room))
      .slice(0, 3)
      .map((cls) => ({
        id: cls.id,
        title: cls.name,
        subtitle: `Room ${cls.room}`,
        to: `/classes/${cls.id}`,
      })),
    courses: db.courses
      .filter((course) => includes(course.name) || includes(course.code))
      .slice(0, 3)
      .map((course) => ({
        id: course.id,
        title: course.name,
        subtitle: course.code,
        to: '/courses',
      })),
  }
}
