import { delay } from '@/lib/delay'
import { readStorage, removeStorage, writeStorage } from '@/utils/storage'

const MOCK_USERS = [
  {
    id: 'u1',
    name: 'Sarah Mitchell',
    email: 'admin@smartattendance.app',
    password: 'admin123',
    role: 'admin',
    title: 'System Administrator',
    phone: '+1 (415) 555-0100',
  },
  {
    id: 'u2',
    name: 'David Chen',
    email: 'teacher@smartattendance.app',
    password: 'teacher123',
    role: 'teacher',
    title: 'Mathematics Teacher',
    teacherId: 't1',
    phone: '+1 (415) 555-0142',
  },
]

const SESSION_KEY = 'session'
const REGISTERED_KEY = 'registeredUsers'

function toPublicUser(user) {
  const { password: _password, passwordHash: _passwordHash, ...safeUser } = user
  return safeUser
}

function fallbackHash(value) {
  let h1 = 0xdeadbeef
  let h2 = 0x41c6ce57
  for (let index = 0; index < value.length; index += 1) {
    const code = value.charCodeAt(index)
    h1 = Math.imul(h1 ^ code, 2654435761)
    h2 = Math.imul(h2 ^ code, 1597334677)
  }
  h1 = Math.imul(h1 ^ (h1 >>> 16), 2246822507) ^ Math.imul(h2 ^ (h2 >>> 13), 3266489909)
  h2 = Math.imul(h2 ^ (h2 >>> 16), 2246822507) ^ Math.imul(h1 ^ (h1 >>> 13), 3266489909)
  return `fnv_${(h2 >>> 0).toString(16)}${(h1 >>> 0).toString(16)}`
}

async function hashPassword(password) {
  if (globalThis.crypto?.subtle) {
    const bytes = new TextEncoder().encode(`smart-attendance:${password}`)
    const digest = await globalThis.crypto.subtle.digest('SHA-256', bytes)
    return `sha256_${Array.from(new Uint8Array(digest))
      .map((byte) => byte.toString(16).padStart(2, '0'))
      .join('')}`
  }
  return fallbackHash(password)
}

function getRegisteredUsers() {
  return readStorage(REGISTERED_KEY, [])
}

function getAllUsers() {
  return [...MOCK_USERS, ...getRegisteredUsers()]
}

export const authService = {
  async login({ email, password }) {
    await delay(700)
    const user = getAllUsers().find(
      (entry) => entry.email.toLowerCase() === email.trim().toLowerCase(),
    )
    if (!user) {
      throw new Error('Invalid email or password. Please try again.')
    }

    const matches = user.password
      ? user.password === password
      : user.passwordHash === (await hashPassword(password))

    if (!matches) {
      throw new Error('Invalid email or password. Please try again.')
    }

    const session = {
      token: `mock_jwt_${user.id}_${Date.now().toString(36)}`,
      user: toPublicUser(user),
      issuedAt: new Date().toISOString(),
    }
    writeStorage(SESSION_KEY, session)
    return session
  },

  async signup({ fullName, email, password, role }) {
    await delay(800)
    const normalizedEmail = email.trim().toLowerCase()
    const users = getAllUsers()
    if (users.some((entry) => entry.email.toLowerCase() === normalizedEmail)) {
      throw new Error('An account with this email already exists. Try signing in instead.')
    }

    const user = {
      id: `u_${Date.now().toString(36)}`,
      name: fullName.trim(),
      email: normalizedEmail,
      role: role === 'teacher' ? 'teacher' : 'admin',
      title: role === 'teacher' ? 'Teacher' : 'Administrator',
      phone: '',
      passwordHash: await hashPassword(password),
      createdAt: new Date().toISOString(),
    }

    writeStorage(REGISTERED_KEY, [...getRegisteredUsers(), user])

    const session = {
      token: `mock_jwt_${user.id}_${Date.now().toString(36)}`,
      user: toPublicUser(user),
      issuedAt: new Date().toISOString(),
    }
    writeStorage(SESSION_KEY, session)
    return session
  },

  async forgotPassword({ email }) {
    await delay(650)
    const exists = getAllUsers().some(
      (user) => user.email.toLowerCase() === email.trim().toLowerCase(),
    )
    return {
      delivered: true,
      message: exists
        ? `A password reset link was sent to ${email} (demo simulation).`
        : `If an account exists for ${email}, a reset link has been sent.`,
    }
  },

  getSession() {
    return readStorage(SESSION_KEY, null)
  },

  updateSessionUser(updates) {
    const session = readStorage(SESSION_KEY, null)
    if (!session) return null
    const next = { ...session, user: { ...session.user, ...updates } }
    writeStorage(SESSION_KEY, next)
    return next
  },

  logout() {
    removeStorage(SESSION_KEY)
  },
}
