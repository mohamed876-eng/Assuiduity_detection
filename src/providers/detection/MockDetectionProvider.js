import { BaseDetectionProvider } from './BaseDetectionProvider'

const STATUS_WEIGHTS = [
  { status: 'present', weight: 0.82 },
  { status: 'late', weight: 0.14 },
  { status: 'excused', weight: 0.04 },
]

function pickStatus() {
  const roll = Math.random()
  let cursor = 0
  for (const entry of STATUS_WEIGHTS) {
    cursor += entry.weight
    if (roll <= cursor) return entry.status
  }
  return 'present'
}

function randomBetween(min, max) {
  return Math.floor(min + Math.random() * (max - min))
}

export class MockDetectionProvider extends BaseDetectionProvider {
  constructor({ getStudents, minInterval = 3800, maxInterval = 6800 } = {}) {
    super()
    this.getStudents = getStudents ?? (() => [])
    this.minInterval = minInterval
    this.maxInterval = maxInterval
    this.timer = null
    this.recognized = new Set()
    this.failureCounter = 0
    this.status = { detection: 'idle', backend: 'connected', message: 'Mock detection service ready.' }
  }

  scheduleNext() {
    if (this.timer) clearTimeout(this.timer)
    const wait = randomBetween(this.minInterval, this.maxInterval)
    this.timer = setTimeout(() => {
      this.tick()
      if (this.status.detection === 'active' && this.status.backend === 'connected') {
        this.scheduleNext()
      }
    }, wait)
  }

  tick() {
    const pool = this.getStudents() ?? []
    if (!pool.length) {
      this.setStatus({ message: 'No students available for this class.' })
      return
    }
    const remaining = pool.filter((student) => !this.recognized.has(student.id))
    const candidate =
      remaining.length > 0
        ? remaining[Math.floor(Math.random() * remaining.length)]
        : pool[Math.floor(Math.random() * pool.length)]

    this.failureCounter += 1
    const failed = this.failureCounter % 9 === 0
    const alreadyRecognized = this.recognized.has(candidate.id)
    const confidence = failed
      ? Number((0.61 + Math.random() * 0.16).toFixed(3))
      : Number((0.86 + Math.random() * 0.13).toFixed(3))

    const accepted = !failed && !alreadyRecognized && confidence >= 0.8
    if (accepted) this.recognized.add(candidate.id)

    const event = {
      event: accepted ? 'face_recognized' : 'face_match_rejected',
      student_id: candidate.id,
      student_name: candidate.fullName,
      student_number: candidate.studentNumber,
      confidence,
      status: accepted ? pickStatus() : 'unmatched',
      timestamp: new Date().toISOString(),
      camera_id: 'mock-camera-01',
      session_id: null,
    }

    this.emit({
      type: 'recognition',
      payload: {
        event,
        accepted,
        reason: failed
          ? 'Confidence below the 0.80 threshold. The backend would retry with another frame.'
          : alreadyRecognized
            ? 'Student already recognized in this detection session.'
            : 'Simulated recognition event from MockDetectionProvider.',
        duplicate: alreadyRecognized,
      },
    })

    if (!accepted && !alreadyRecognized) {
      this.emit({
        type: 'warning',
        payload: {
          title: 'Low confidence match',
          message: `Recognition for ${candidate.fullName} was rejected by the confidence threshold.`,
        },
      })
    }
  }

  start() {
    if (this.status.detection === 'active') return
    this.recognized.clear()
    this.setStatus({
      detection: 'starting',
      backend: 'connecting',
      message: 'Connecting to mock detection service…',
    })
    setTimeout(() => {
      this.setStatus({
        detection: 'active',
        backend: 'connected',
        message: 'Listening for simulated recognition events.',
      })
      this.scheduleNext()
    }, 700)
  }

  stop() {
    if (this.timer) clearTimeout(this.timer)
    this.timer = null
    this.setStatus({
      detection: 'stopping',
      message: 'Stopping detection session…',
    })
    setTimeout(() => {
      this.setStatus({ detection: 'idle', message: 'Detection stopped.' })
    }, 350)
  }

  simulateDisconnect() {
    if (this.timer) clearTimeout(this.timer)
    this.timer = null
    this.setStatus({
      backend: 'disconnected',
      message: 'Simulated backend connection lost. Recognition is paused.',
    })
    this.emit({
      type: 'warning',
      payload: {
        title: 'Backend disconnected',
        message: 'The mock detection backend was disconnected. Reconnect to resume events.',
      },
    })
  }

  reconnect() {
    this.setStatus({ backend: 'connecting', message: 'Reconnecting to mock backend…' })
    setTimeout(() => {
      this.setStatus({ backend: 'connected', message: 'Mock backend reconnected.' })
      if (this.status.detection === 'active') this.scheduleNext()
    }, 900)
  }

  dispose() {
    if (this.timer) clearTimeout(this.timer)
    this.timer = null
    super.dispose()
  }
}
