import { create } from 'zustand'
import { authService, type UserResponse } from './api'


interface AuthState {
  user: UserResponse | null
  isLoggedIn: boolean
  isInitialized: boolean
  login: (user: UserResponse) => void
  logout: () => Promise<void>
  checkAuth: () => Promise<void>
  updateProfile: (name: string) => Promise<void>
  deleteAccount: () => Promise<void>
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isLoggedIn: false,
  isInitialized: false,
  login: (user) => set({ user, isLoggedIn: true }),
  logout: async () => {
    try {
      await authService.logout()
    } catch (e) {
      console.error('Logout error occurred:', e)
    } finally {
      localStorage.removeItem('access_token')
      localStorage.removeItem('refresh_token')
      set({ user: null, isLoggedIn: false })
    }
  },
  checkAuth: async () => {
    const token = localStorage.getItem('access_token')
    if (!token) {
      set({ user: null, isLoggedIn: false, isInitialized: true })
      return
    }
    try {
      const user = await authService.getMyInfo()
      set({ user, isLoggedIn: true, isInitialized: true })
    } catch (error) {
      console.error('Session validation failed:', error)
      localStorage.removeItem('access_token')
      localStorage.removeItem('refresh_token')
      set({ user: null, isLoggedIn: false, isInitialized: true })
    }
  },
  updateProfile: async (name) => {
    try {
      const updatedUser = await authService.updateProfile(name)
      set({ user: updatedUser })
    } catch (error) {
      console.error('Profile update failed:', error)
      throw error
    }
  },
  deleteAccount: async () => {
    try {
      await authService.deleteAccount()
    } catch (error) {
      console.error('Account deletion failed:', error)
    } finally {
      localStorage.removeItem('access_token')
      localStorage.removeItem('refresh_token')
      localStorage.removeItem('temp_mock_email')
      localStorage.removeItem('temp_mock_name')
      set({ user: null, isLoggedIn: false })
    }
  }
}))

