import { useCallback, useEffect, useRef, useState } from 'react'
import { createDetectionProvider } from '@/providers/detection/DetectionProvider'
import { DETECTION_MODE } from '@/constants'

const INITIAL_STATUS = {
  detection: 'idle',
  backend: DETECTION_MODE === 'mock' ? 'connected' : 'disconnected',
  message: '',
}

export function useDetection({ getStudents, mode = DETECTION_MODE, onWarning } = {}) {
  const providerRef = useRef(null)
  const studentsRef = useRef(getStudents)
  const warningRef = useRef(onWarning)
  const [status, setStatus] = useState(INITIAL_STATUS)
  const [events, setEvents] = useState([])

  useEffect(() => {
    studentsRef.current = getStudents
    warningRef.current = onWarning
  }, [getStudents, onWarning])

  useEffect(() => {
    const provider = createDetectionProvider({
      mode,
      getStudents: () => studentsRef.current?.() ?? [],
    })
    providerRef.current = provider
    const unsubscribe = provider.subscribe((message) => {
      if (message.type === 'status') setStatus(message.payload)
      if (message.type === 'recognition') {
        setEvents((current) => [{ ...message.payload, id: `${Date.now()}-${Math.random()}` }, ...current].slice(0, 100))
      }
      if (message.type === 'warning') {
        warningRef.current?.(message.payload)
      }
    })
    return () => {
      unsubscribe()
      provider.dispose()
      providerRef.current = null
    }
  }, [mode])

  const start = useCallback(() => {
    setEvents([])
    providerRef.current?.start()
  }, [])

  const stop = useCallback(() => {
    providerRef.current?.stop()
  }, [])

  const simulateDisconnect = useCallback(() => {
    providerRef.current?.simulateDisconnect?.()
  }, [])

  const reconnect = useCallback(() => {
    providerRef.current?.reconnect?.()
  }, [])

  const clearEvents = useCallback(() => setEvents([]), [])

  return { status, events, start, stop, simulateDisconnect, reconnect, clearEvents }
}
