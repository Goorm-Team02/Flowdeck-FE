import { useState, FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '../../features/auth/authStore'
import { authService } from '../../features/auth/api'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  
  const navigate = useNavigate()
  const { login } = useAuthStore()

  const handleLogin = async (e: FormEvent) => {
    e.preventDefault()
    setError(null)
    setIsLoading(true)

    try {
      // 1. Send Login API Call
      await authService.login({ email, password })
      
      // 2. Fetch User Info
      const user = await authService.getMyInfo()
      
      // 3. Mark Logged In globally
      login(user)
      
      // 4. Navigate to index
      navigate('/')
    } catch (err: any) {
      console.error('Login error:', err)
      const resMsg = err.response?.data?.message || '로그인에 실패하였습니다. 이메일과 패스워드를 다시 확인해주세요.'
      setError(resMsg)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-bg-primary font-sans">
      <div className="w-full max-w-md rounded-xl bg-bg-secondary p-10 shadow-2xl border border-border">
        <div className="mb-10 text-center">
          <div className="mx-auto mb-4 w-12 h-12 bg-accent rounded-lg flex items-center justify-center font-bold text-white text-2xl shadow-lg">F</div>
          <h1 className="text-3xl font-bold text-white tracking-tight">Flowdeck 로그인</h1>
          <p className="mt-2 text-text-muted text-sm tracking-wide">실시간 협업 웹 개발 IDE 플랫폼에 로그인하세요</p>
        </div>
        
        {error && (
          <div className="mb-6 p-4 rounded-md bg-red-950/40 border border-red-900/50 text-red-400 text-xs font-semibold">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-6">
          <div>
            <label className="block text-xs font-bold text-text-muted uppercase tracking-wider mb-2">이메일 주소</label>
            <input 
              type="email" 
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-md bg-bg-primary border border-border p-3 text-sm text-white focus:border-accent focus:ring-1 focus:ring-accent outline-none transition-all placeholder:text-bg-tertiary"
              placeholder="name@company.com" 
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-text-muted uppercase tracking-wider mb-2">비밀번호</label>
            <input 
              type="password" 
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-md bg-bg-primary border border-border p-3 text-sm text-white focus:border-accent focus:ring-1 focus:ring-accent outline-none transition-all placeholder:text-bg-tertiary"
              placeholder="••••••••" 
            />
          </div>
          
          <div className="flex items-center justify-between text-xs">
            <label className="flex items-center gap-2 cursor-pointer text-text-muted hover:text-white transition-colors font-medium">
              <input type="checkbox" className="rounded border-border bg-bg-primary text-accent focus:ring-accent accent-accent" />
              로그인 상태 유지
            </label>
            <button type="button" onClick={() => alert('데모 환경에서는 비밀번호 찾기 기능이 제공되지 않습니다. 신규 계정을 가입하거나 admin@flowdeck.io (비밀번호: password123) 계정을 이용하세요!')} className="text-accent hover:text-accent-hover font-bold tracking-tight">비밀번호 찾기</button>
          </div>

          <button 
            type="submit"
            disabled={isLoading}
            className="w-full rounded-md bg-accent p-3.5 font-bold text-white hover:bg-accent-hover transition-all shadow-lg active:scale-95 transform disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? '로그인 처리 중...' : '로그인'}
          </button>
        </form>
        
        <div className="mt-8 flex items-center gap-4 text-text-muted text-xs font-bold uppercase tracking-widest before:content-[''] before:flex-1 before:h-[1px] before:bg-border after:content-[''] after:flex-1 after:h-[1px] after:bg-border">
          환영합니다
        </div>

        <div className="mt-6 p-4 rounded-lg bg-bg-primary/50 text-[11px] text-text-muted border border-border/40 space-y-2">
          <div>
            <p className="font-semibold text-white">🚀 시스템 관리자 접속 계정:</p>
            <p>이메일: <code className="text-accent">admin@flowdeck.io</code> | 비번: <code className="text-accent">password123</code></p>
          </div>
          <div className="border-t border-border/40 pt-2 grid grid-cols-1 sm:grid-cols-2 gap-2">
            <div>
              <p className="font-semibold text-white">👤 일반 테스트 계정 1:</p>
              <p>이메일: <code className="text-accent">user1@flowdeck.io</code></p>
              <p>비밀번호: <code className="text-accent">password123</code></p>
            </div>
            <div className="border-t sm:border-t-0 sm:border-l border-border/40 pt-2 sm:pt-0 sm:pl-3">
              <p className="font-semibold text-white">👥 일반 테스트 계정 2:</p>
              <p>이메일: <code className="text-accent">user2@flowdeck.io</code></p>
              <p>비밀번호: <code className="text-accent">password123</code></p>
            </div>
          </div>
        </div>

        <p className="mt-8 text-center text-sm text-text-muted">
          Flowdeck이 처음이신가요? <a href="/signup" className="text-accent hover:text-accent-hover font-bold transition-colors ml-1">새 계정 만들기</a>
        </p>
      </div>
    </div>
  )
}
