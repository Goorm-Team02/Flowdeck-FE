// src/features/auth/authStore.tsx
import { createContext, useContext, useState, useEffect, type ReactNode } from 'react'
import type { User } from "./authTypes";
import { authService, tokenStorage } from "./api/customApi";

interface AuthContextType {
  user: User | null;
  isLoggedIn: boolean;
  isLoading: boolean;
  login: (user: User) => void;
  logout: () => void;
  updateProfile: (name: string) => Promise<void>;
  deleteAccount: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // 컴포넌트 마운트 시 저장소에서 토큰(flowdeck_access_token)을 읽어 세션을 자동 복원합니다.
  useEffect(() => {
    async function restoreSession() {
      const token = tokenStorage.getToken();
      if (!token) {
        setIsLoading(false);
        return;
      }
      try {
        const userInfo = await authService.getMyInfo();
        setUser(userInfo);
        setIsLoggedIn(true);
      } catch (err) {
        console.error("Session restore failed, cleaning token:", err);
        tokenStorage.clearToken();
      } finally {
        setIsLoading(false);
      }
    }
    restoreSession();
  }, []);

  const login = (newUser: User) => {
    setUser(newUser);
    setIsLoggedIn(true);
  };

  const logout = () => {
    tokenStorage.clearToken();
    setUser(null);
    setIsLoggedIn(false);
  };

  const updateProfile = async (name: string) => {
    await authService.updateProfile(name);
    if (user) {
      setUser({ ...user, name });
    }
  };

  const deleteAccount = async () => {
    await authService.deleteAccount();
    logout();
  };

  return (
    <AuthContext.Provider value={{ user, isLoggedIn, isLoading, login, logout, updateProfile, deleteAccount }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuthStore() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuthStore must be used within an AuthProvider");
  }
  return context;
}