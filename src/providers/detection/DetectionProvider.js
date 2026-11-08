import { MockDetectionProvider } from './MockDetectionProvider'
import { ApiDetectionProvider } from './ApiDetectionProvider'

export function createDetectionProvider(options = {}) {
  const mode = options.mode ?? import.meta.env.VITE_DETECTION_MODE ?? 'mock'
  if (mode === 'api') {
    return new ApiDetectionProvider(options)
  }
  return new MockDetectionProvider(options)
}
