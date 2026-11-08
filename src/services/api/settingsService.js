import { delay } from '@/lib/delay'
import { createSeedDatabase } from '@/mocks/seed'
import { getDb, persistDb } from './db'

export const settingsService = {
  get() {
    return new Promise((resolve) => {
      setTimeout(() => resolve(getDb().settings), 250)
    })
  },

  async saveSection(section, values) {
    await delay(500)
    const db = getDb()
    const settings = { ...db.settings, [section]: { ...db.settings[section], ...values } }
    persistDb({ ...db, settings })
    return settings
  },

  async saveAll(values) {
    await delay(500)
    const db = getDb()
    const settings = { ...db.settings, ...values }
    persistDb({ ...db, settings })
    return settings
  },

  async reset() {
    await delay(400)
    const db = getDb()
    const seed = createSeedDatabase()
    persistDb({ ...db, settings: seed.settings })
    return seed.settings
  },
}
