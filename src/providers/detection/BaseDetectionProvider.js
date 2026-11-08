export class BaseDetectionProvider {
  constructor() {
    this.listeners = new Set()
    this.status = {
      detection: 'idle',
      backend: 'disconnected',
      message: '',
    }
  }

  subscribe(listener) {
    this.listeners.add(listener)
    listener({ type: 'status', payload: this.status })
    return () => this.listeners.delete(listener)
  }

  emit(message) {
    this.listeners.forEach((listener) => {
      try {
        listener(message)
      } catch {
        /* listener errors should not break the stream */
      }
    })
  }

  setStatus(patch) {
    this.status = { ...this.status, ...patch }
    this.emit({ type: 'status', payload: this.status })
  }

  start() {
    throw new Error('start() not implemented')
  }

  stop() {
    throw new Error('stop() not implemented')
  }

  dispose() {
    this.listeners.clear()
  }
}
