import axios, { AxiosError } from 'axios'
import { showErrorToast } from '@/utils/toast'

export const AUTH_TOKEN_KEY = 'delica_auth_token'
export const AUTH_USER_KEY = 'delica_auth_user'

const DEFAULT_RATE_LIMIT_DELAY = 60_000
let rateLimitedUntil = 0
export const isApiRateLimited = () => Date.now() < rateLimitedUntil

const axiosHelper = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || '',
  timeout: 15000,
  headers: {
    Accept: 'application/json',
    'Content-Type': 'application/json'
  }
})

axiosHelper.interceptors.request.use((config) => {
  if (Date.now() < rateLimitedUntil) {
    const seconds = Math.ceil((rateLimitedUntil - Date.now()) / 1000)
    throw new AxiosError(
      `Too many requests. Please try again in ${seconds} seconds.`,
      'ERR_RATE_LIMITED',
      config
    )
  }

  const token = localStorage.getItem(AUTH_TOKEN_KEY)

  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }

  return config
})

axiosHelper.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    if (!axios.isCancel(error) && error.code !== 'ERR_RATE_LIMITED') {
      showErrorToast(getApiErrorMessage(error))
    }

    if (error.response?.status === 429) {
      const now = Date.now()
      const retryAfter = error.response.headers['retry-after']
      const value = retryAfter == null ? '' : String(retryAfter).trim()
      const seconds = value === '' ? NaN : Number(value)
      const retryAt = Number.isFinite(seconds) && seconds >= 0
        ? now + seconds * 1000
        : Date.parse(value)
      rateLimitedUntil = Math.max(
        rateLimitedUntil,
        Number.isFinite(retryAt) && retryAt > now ? retryAt : now + DEFAULT_RATE_LIMIT_DELAY
      )
    }

    if (error.response?.status === 401) {
      clearAuthSession()

      if (window.location.pathname !== '/login') {
        window.location.assign('/login')
      }
    }

    return Promise.reject(error)
  }
)

export const setAuthSession = (token: string, user?: unknown) => {
  localStorage.setItem(AUTH_TOKEN_KEY, token)

  if (user) {
    localStorage.setItem(AUTH_USER_KEY, JSON.stringify(user))
  }
}

export const clearAuthSession = () => {
  localStorage.removeItem(AUTH_TOKEN_KEY)
  localStorage.removeItem(AUTH_USER_KEY)
}

export const isAuthenticated = () => Boolean(localStorage.getItem(AUTH_TOKEN_KEY))

export const getApiErrorMessage = (error: unknown, fallback = 'Something went wrong.') => {
  if (!axios.isAxiosError(error)) return fallback

  const data = error.response?.data as { message?: unknown; error?: unknown } | undefined
  for (const message of [data?.message, data?.error, error.message]) {
    if (typeof message === 'string' && message.trim()) return message.trim()
  }
  return fallback
}

export default axiosHelper
