import { create } from 'zustand'

interface AuthState {
  user: { name: string; email: string } | null
  isLoggedIn: boolean
  login: (name: string, email: string) => void
  logout: () => void
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isLoggedIn: false,
  login: (name, email) => set({ user: { name, email }, isLoggedIn: true }),
  logout: () => set({ user: null, isLoggedIn: false }),
}))
