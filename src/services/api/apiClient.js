import axios from 'axios'
import { API_BASE_URL } from '@/constants'
import { readStorage } from '@/utils/storage'

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000,
  headers: { 'Content-Type': 'application/json' },
})

apiClient.interceptors.request.use((config) => {
  const session = readStorage('session', null)
  if (session?.token) {
    config.headers.Authorization = `Bearer ${session.token}`
  }
  return config
})

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    const message =
      error.response?.data?.detail ||
      error.response?.data?.message ||
      error.message ||
      'Unexpected API error'
    return Promise.reject(new Error(message))
  },
)
