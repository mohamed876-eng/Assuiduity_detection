import { createSeedDatabase } from '@/mocks/seed'
import { readStorage, removeStorage, writeStorage } from '@/utils/storage'

const DB_KEY = 'db'

let cachedDb = null

export function getDb() {
  if (cachedDb) return cachedDb
  let db = readStorage(DB_KEY)
  if (!db || db.version !== 2) {
    db = createSeedDatabase()
    writeStorage(DB_KEY, db)
  }
  cachedDb = db
  return db
}

export function persistDb(nextDb) {
  cachedDb = nextDb
  writeStorage(DB_KEY, nextDb)
  return nextDb
}

export function getCollection(name) {
  return getDb()[name] ?? []
}

export function setCollection(name, items) {
  const db = { ...getDb(), [name]: items }
  return persistDb(db)
}

export function mutateCollection(name, updater) {
  const current = getCollection(name)
  const next = updater(current)
  setCollection(name, next)
  return next
}

export function resetDatabase() {
  removeStorage(DB_KEY)
  cachedDb = null
  return getDb()
}
