import { useState, FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { authService } from '../../features/auth/api'

export default function SignupPage() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [successMsg, setSuccessMsg] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const navigate = useNavigate()

  const handleSignup = async (e: FormEvent) => {
    e.preventDefault()
    setError(null)
    setSuccessMsg(null)
    setIsLoading(true)

    try {
      if (password.length < 8) {
        throw new Error('비밀번호는 최소 8자 이상이어야 합니다.')
      }

      await authService.signup({ name, email, password })
      setSuccessMsg('계정이 성공적으로 생성되었습니다! 로그인 페이지로 이동합니다...')
      setTimeout(() => {
        navigate('/login')
      }, 2000)
    } catch (err: any) {
      console.error('Signup error:', err)
      const resMsg = err.response?.data?.message || err.message || '가입 실패. 입력한 데이터를 다시 한번 점검해주세요.'
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
          <h1 className="text-3xl font-bold text-white tracking-tight">Flowdeck 계정 만들기</h1>
          <p className="mt-2 text-text-muted text-sm tracking-wide">실시간 협업 코드 편집 플랫폼에 참여하세요</p>
        </div>

        {error && (
          <div className="mb-6 p-4 rounded-md bg-red-950/40 border border-red-900/50 text-red-400 text-xs font-semibold">
            {error}
          </div>
        )}

        {successMsg && (
          <div className="mb-6 p-4 rounded-md bg-green-950/40 border border-green-900/50 text-green-400 text-xs font-semibold">
            {successMsg}
          </div>
        )}

        <form onSubmit={handleSignup} className="space-y-6">
          <div>
            <label className="block text-xs font-bold text-text-muted uppercase tracking-wider mb-2">이름 (Full Name)</label>
            <input 
              type="text" 
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full rounded-md bg-bg-primary border border-border p-3 text-sm text-white focus:border-accent focus:ring-1 focus:ring-accent outline-none transition-all placeholder:text-bg-tertiary"
              placeholder="홍길동" 
            />
          </div>
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
            <label className="block text-xs font-bold text-text-muted uppercase tracking-wider mb-2">비밀번호 (8자 이상)</label>
            <input 
              type="password" 
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-md bg-bg-primary border border-border p-3 text-sm text-white focus:border-accent focus:ring-1 focus:ring-accent outline-none transition-all placeholder:text-bg-tertiary"
              placeholder="••••••••" 
            />
          </div>
          <button 
            type="submit"
            disabled={isLoading || !!successMsg}
            className="w-full rounded-md bg-accent p-3.5 font-bold text-white hover:bg-accent-hover transition-all shadow-lg active:scale-95 transform mt-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? '계정 생성 진행 중...' : '계정 생성하기'}
          </button>
        </form>
        
        <p className="mt-8 text-center text-sm text-text-muted">
          이미 계정이 있으신가요? <a href="/login" className="text-accent hover:text-accent-hover font-bold transition-colors ml-1">로그인 하러 가기</a>
        </p>
      </div>
    </div>
  )
}
