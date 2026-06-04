// src/shared/api/client.ts
import axios from 'axios'
import type { AxiosError, InternalAxiosRequestConfig } from 'axios'
import type { ApiResponse } from '@/shared/types/api'
import { ApiError, NetworkError, UnauthorizedError } from './errors'

const BASE_URL = import.meta.env.VITE_API_BASE_URL || ''

export const apiClient = axios.create({
  baseURL: BASE_URL,
  timeout: 10_000,
  headers: { 'Content-Type': 'application/json' },
})

// --- [인증 총괄 규격화] 질문자님이 설계하신 토큰 표준 키로 스토리지를 단일화합니다. ---
const TOKEN_KEY = 'flowdeck_access_token'
const REFRESH_KEY = 'flowdeck_refresh_token'

export const tokenStorage = {
  getAccess: () => localStorage.getItem(TOKEN_KEY),
  getRefresh: () => localStorage.getItem(REFRESH_KEY),
  setAccess: (token: string) => localStorage.setItem(TOKEN_KEY, token),
  setTokens: (access: string, refresh: string) => {
    localStorage.setItem(TOKEN_KEY, access)
    localStorage.setItem(REFRESH_KEY, refresh)
  },
  clear: () => {
    localStorage.removeItem(TOKEN_KEY)
    localStorage.removeItem(REFRESH_KEY)
  },
}

let isRefreshing = false
let waitQueue: Array<(token: string) => void> = []

function drainQueue(token: string) {
  waitQueue.forEach((resolve) => resolve(token))
  waitQueue = []
}

export function forcedLogout(reason?: string) {
  tokenStorage.clear()
  waitQueue = []
  const url = reason ? `/login?reason=${encodeURIComponent(reason)}` : '/login'
  window.location.href = url
}

async function refreshAccessToken(): Promise<string> {
  const refreshToken = tokenStorage.getRefresh()
  if (!refreshToken) throw new UnauthorizedError()

  const res = await axios.post<ApiResponse<{ accessToken: string; tokenType: string }>>(
    `${BASE_URL}/api/auth/refresh`,
    { refreshToken },
  )
  const newToken = res.data.data.accessToken
  tokenStorage.setAccess(newToken)
  return newToken
}

// Request interceptor
apiClient.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const token = tokenStorage.getAccess()
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// Response interceptor
apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError<ApiResponse>) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean }

    if (!error.response) {
      return Promise.reject(new NetworkError())
    }

    const { status, data } = error.response

    // 로그인 API 자체에 대한 401 응답은 리프레시 루프를 돌지 않도록 방어합니다.
    if (status === 401 && !originalRequest._retry && originalRequest.url !== '/api/auth/login') {
      if (isRefreshing) {
        return new Promise((resolve) => {
          waitQueue.push((token) => {
            originalRequest.headers.Authorization = `Bearer ${token}`
            resolve(apiClient(originalRequest))
          })
        })
      }

      originalRequest._retry = true
      isRefreshing = true

      try {
        const newToken = await refreshAccessToken()
        drainQueue(newToken)
        originalRequest.headers.Authorization = `Bearer ${newToken}`
        return apiClient(originalRequest)
      } catch {
        forcedLogout()
        return Promise.reject(new UnauthorizedError())
      } finally {
        isRefreshing = false
      }
    }

    const code = data?.code ?? 'UNKNOWN'
    const message = data?.message ?? '요청 처리 중 오류가 발생했습니다.'

    return Promise.reject(new ApiError(status, code, message))
  },
)