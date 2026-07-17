import axios, { type AxiosError } from 'axios'

export const AUTH_TOKEN_KEY = 'delica_auth_token'
export const AUTH_USER_KEY = 'delica_auth_user'

const axiosHelper = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || '',
  timeout: 15000,
  headers: {
    Accept: 'application/json',
    'Content-Type': 'application/json'
  }
})

axiosHelper.interceptors.request.use((config) => {
  const token = localStorage.getItem(AUTH_TOKEN_KEY)

  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }

  return config
})

axiosHelper.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
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

  const data = error.response?.data as { message?: string; error?: string } | undefined
  return data?.message || data?.error || error.message || fallback
}

export default axiosHelper
