import { BaseDetectionProvider } from './BaseDetectionProvider'
import { API_BASE_URL } from '@/constants'

function wsUrlFromApi(apiUrl) {
  const base = apiUrl.replace(/\/api\/?$/, '')
  return `${base.replace(/^http/, 'ws')}/ws/detection`
}

export class ApiDetectionProvider extends BaseDetectionProvider {
  constructor({ apiBaseUrl = API_BASE_URL, websocketUrl } = {}) {
    super()
    this.apiBaseUrl = apiBaseUrl
    this.websocketUrl = websocketUrl || wsUrlFromApi(apiBaseUrl)
    this.socket = null
    this.status = { detection: 'idle', backend: 'disconnected', message: 'Backend not connected.' }
  }

  async post(path) {
    const response = await fetch(`${this.apiBaseUrl}${path}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    })
    if (!response.ok) throw new Error(`Request failed with status ${response.status}`)
    return response.json().catch(() => ({}))
  }

  connect() {
    if (this.socket && this.socket.readyState <= WebSocket.OPEN) return
    this.setStatus({ backend: 'connecting', message: 'Opening detection WebSocket…' })
    this.socket = new WebSocket(this.websocketUrl)
    this.socket.onopen = () => {
      this.setStatus({ backend: 'connected', message: 'Detection WebSocket connected.' })
    }
    this.socket.onmessage = (message) => {
      try {
        const payload = JSON.parse(message.data)
        if (payload.event === 'face_recognized' || payload.event === 'face_match_rejected') {
          this.emit({
            type: 'recognition',
            payload: {
              event: payload,
              accepted: payload.event === 'face_recognized',
              reason: payload.reason ?? 'Event received from recognition backend.',
            },
          })
        } else if (payload.event === 'error') {
          this.emit({ type: 'warning', payload: { title: 'Detection error', message: payload.message } })
        }
      } catch {
        this.emit({
          type: 'warning',
          payload: { title: 'Invalid event', message: 'Backend sent an unreadable payload.' },
        })
      }
    }
    this.socket.onerror = () => {
      this.setStatus({ backend: 'disconnected', message: 'Detection WebSocket error.' })
    }
    this.socket.onclose = () => {
      this.setStatus({
        backend: 'disconnected',
        detection: this.status.detection === 'active' ? 'active' : this.status.detection,
        message: 'Detection WebSocket closed.',
      })
    }
  }

  async start() {
    try {
      this.setStatus({ detection: 'starting', message: 'Starting backend detection…' })
      this.connect()
      await this.post('/detection/start')
      this.setStatus({ detection: 'active', message: 'Backend detection active.' })
    } catch (error) {
      this.setStatus({ detection: 'error', backend: 'disconnected', message: error.message })
    }
  }

  async stop() {
    try {
      this.setStatus({ detection: 'stopping', message: 'Stopping backend detection…' })
      await this.post('/detection/stop')
      this.setStatus({ detection: 'idle', message: 'Backend detection stopped.' })
    } catch (error) {
      this.setStatus({ detection: 'error', message: error.message })
    }
  }

  disconnect() {
    if (this.socket) this.socket.close()
    this.simulateDisconnect()
  }

  simulateDisconnect() {
    this.setStatus({
      backend: 'disconnected',
      message: 'Detection backend disconnected. Reconnect to resume.',
    })
  }

  reconnect() {
    this.connect()
  }

  dispose() {
    if (this.socket) {
      this.socket.onclose = null
      this.socket.close()
      this.socket = null
    }
    super.dispose()
  }
}
