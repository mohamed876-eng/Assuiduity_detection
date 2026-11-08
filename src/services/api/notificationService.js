import { delay } from '@/lib/delay'
import { uid } from '@/utils/id'
import { getCollection, setCollection } from './db'

export const notificationService = {
  list() {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve(
          [...getCollection('notifications')].sort(
            (a, b) => new Date(b.createdAt) - new Date(a.createdAt),
          ),
        )
      }, 300)
    })
  },

  add(payload) {
    const notification = {
      id: uid('n'),
      type: payload.type ?? 'system',
      severity: payload.severity ?? 'info',
      title: payload.title,
      message: payload.message,
      studentId: payload.studentId ?? null,
      createdAt: new Date().toISOString(),
      read: false,
    }
    setCollection('notifications', [notification, ...getCollection('notifications')])
    return notification
  },

  markRead(id) {
    setCollection(
      'notifications',
      getCollection('notifications').map((entry) =>
        entry.id === id ? { ...entry, read: true } : entry,
      ),
    )
  },

  markAllRead() {
    setCollection(
      'notifications',
      getCollection('notifications').map((entry) => ({ ...entry, read: true })),
    )
  },

  remove(id) {
    setCollection(
      'notifications',
      getCollection('notifications').filter((entry) => entry.id !== id),
    )
  },

  async unreadCount() {
    await delay(150)
    return getCollection('notifications').filter((entry) => !entry.read).length
  },
}
