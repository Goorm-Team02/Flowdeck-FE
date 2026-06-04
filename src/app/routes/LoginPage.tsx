import { useState, type FormEvent } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'

import { useSetAtom } from 'jotai'

import { useAuthStore } from '@/features/auth/authStore'
import { authService } from '@/features/auth/api/customApi'
import { currentUserAtom } from '@/features/auth/stores/currentUserAtom'
import { parseCurrentUser } from '@/features/auth/utils/jwt'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const redirect = searchParams.get('redirect') ?? '/'
  const { login } = useAuthStore()
  const setCurrentUser = useSetAtom(currentUserAtom)

  const handleLogin = async (e: FormEvent) => {
    e.preventDefault()
    setError(null)
    setIsLoading(true)

    try {
      const res = await authService.login({ email, password })
      login(res.user)
      const jwtUser = parseCurrentUser(res.accessToken)
      if (jwtUser) {
        // getMyInfo() 응답으로 JWT에 없는 필드 보완
        setCurrentUser({
          ...jwtUser,
          publicId: res.user.id ?? jwtUser.publicId,
          name: res.user.name || jwtUser.name,
          email: res.user.email || jwtUser.email,
        })
      } else {
        setCurrentUser(jwtUser)
      }
      navigate(redirect, { replace: true })
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : undefined
      setError(message ?? '로그인에 실패하였습니다. 이메일과 패스워드를 다시 확인해주세요.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div
      id="login_page_container"
      className="flex min-h-screen items-center justify-center bg-zinc-950 font-sans p-4"
    >
      <div
        id="login_card"
        className="w-full max-w-md rounded-xl bg-zinc-900 p-8 shadow-2xl border border-zinc-800"
      >
        <div className="mb-8 text-center">
          <img src="/logo.png" alt="Flowdeck" className="mx-auto mb-4 w-14 h-14" />
          <h1 className="text-3xl font-bold text-white tracking-tight">Flowdeck 로그인</h1>
          <p className="mt-2 text-zinc-400 text-sm tracking-wide">
            실시간 협업 웹 개발 IDE 플랫폼에 로그인하세요
          </p>
        </div>

        {error && (
          <div
            id="login_error"
            className="mb-6 p-4 rounded-md bg-red-950/40 border border-red-900/50 text-red-400 text-xs font-semibold"
          >
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-6">
          <div>
            <label className="block text-xs font-bold text-zinc-400 uppercase tracking-wider mb-2">
              이메일 주소
            </label>
            <input
              id="login_email_input"
              type="email"
              required
              autoFocus
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-md bg-zinc-950 border border-zinc-800 p-3 text-sm text-white focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none transition-all placeholder:text-zinc-600"
              placeholder="name@company.com"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-zinc-400 uppercase tracking-wider mb-2">
              비밀번호
            </label>
            <input
              id="login_password_input"
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-md bg-zinc-950 border border-zinc-800 p-3 text-sm text-white focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none transition-all placeholder:text-zinc-600"
              placeholder="••••••••"
            />
          </div>

          <button
            id="login_submit_btn"
            type="submit"
            disabled={isLoading}
            className="w-full rounded-md bg-indigo-600 p-3.5 font-bold text-white hover:bg-indigo-500 transition-all shadow-lg active:scale-95 transform disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
          >
            {isLoading ? '로그인 처리 중...' : '로그인'}
          </button>
        </form>

        <p className="mt-8 text-center text-sm text-zinc-400">
          Flowdeck이 처음이신가요?
          <Link
            to="/signup"
            className="text-indigo-400 hover:text-indigo-300 font-bold transition-colors ml-1"
          >
            새 계정 만들기
          </Link>
        </p>
      </div>
    </div>
  )
}
