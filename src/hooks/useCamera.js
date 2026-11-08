import { useCallback, useEffect, useRef, useState } from 'react'

const ERROR_MESSAGES = {
  NotAllowedError: 'Camera permission was denied. Allow camera access in your browser settings and try again.',
  PermissionDeniedError: 'Camera permission was denied. Allow camera access in your browser settings.',
  NotFoundError: 'No camera was found on this device.',
  DevicesNotFoundError: 'No camera was found on this device.',
  NotReadableError: 'The camera is already in use by another application.',
  OverconstrainedError: 'The selected camera does not support the requested settings.',
  SecurityError: 'Camera access requires a secure context (HTTPS or localhost).',
}

export function useCamera() {
  const [stream, setStream] = useState(null)
  const [status, setStatus] = useState('idle')
  const [error, setError] = useState('')
  const [devices, setDevices] = useState([])
  const streamRef = useRef(null)

  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop())
      streamRef.current = null
    }
    setStream(null)
    setStatus('idle')
  }, [])

  const refreshDevices = useCallback(async () => {
    if (!navigator.mediaDevices?.enumerateDevices) return []
    try {
      const list = await navigator.mediaDevices.enumerateDevices()
      const cameras = list.filter((device) => device.kind === 'videoinput')
      setDevices(cameras)
      return cameras
    } catch {
      return []
    }
  }, [])

  const startCamera = useCallback(
    async (deviceId) => {
      setError('')
      if (!navigator.mediaDevices?.getUserMedia) {
        setStatus('unavailable')
        setError('Camera API is not available in this browser or context.')
        return null
      }
      stopCamera()
      setStatus('connecting')
      try {
        const constraints = {
          audio: false,
          video: deviceId
            ? { deviceId: { exact: deviceId }, width: { ideal: 1280 }, height: { ideal: 720 } }
            : { facingMode: 'user', width: { ideal: 1280 }, height: { ideal: 720 } },
        }
        const nextStream = await navigator.mediaDevices.getUserMedia(constraints)
        streamRef.current = nextStream
        setStream(nextStream)
        setStatus('connected')
        await refreshDevices()
        return nextStream
      } catch (cameraError) {
        setStatus(cameraError.name === 'NotAllowedError' ? 'denied' : 'error')
        setError(
          ERROR_MESSAGES[cameraError.name] ||
            cameraError.message ||
            'Unable to access the camera.',
        )
        return null
      }
    },
    [refreshDevices, stopCamera],
  )

  useEffect(() => {
    refreshDevices()
  }, [refreshDevices])

  useEffect(
    () => () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop())
      }
    },
    [],
  )

  return { stream, status, error, devices, startCamera, stopCamera, refreshDevices }
}
