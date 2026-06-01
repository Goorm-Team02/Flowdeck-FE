import { type FormEvent, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'

import { login } from '@/features/auth/api/auth'
import { tokenStorage } from '@/shared/api/client'

export default function LoginPage() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const redirect = searchParams.get('redirect') ?? '/'

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)
    try {
      const { accessToken, refreshToken } = await login(email, password)
      tokenStorage.setTokens(accessToken, refreshToken)
      navigate(redirect, { replace: true })
    } catch {
      setError('이메일 또는 비밀번호가 올바르지 않습니다.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="h-screen flex items-center justify-center bg-bg-primary">
      <div className="w-full max-w-sm px-4">
        <div className="mb-8 text-center">
          <h1 className="text-2xl font-bold text-text-primary">Flowdeck</h1>
          <p className="mt-1 text-[13px] text-text-primary/50">로그인하여 계속하세요</p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="bg-bg-secondary border border-border rounded-xl p-6 flex flex-col gap-4"
        >
          <div className="flex flex-col gap-1.5">
            <label htmlFor="email" className="text-[13px] text-text-primary/70">
              이메일
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoFocus
              className="px-3 py-2 text-[13px] rounded-lg border border-border bg-bg-primary text-text-primary placeholder:text-text-primary/30 outline-none focus:border-accent transition-colors"
              placeholder="you@example.com"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label htmlFor="password" className="text-[13px] text-text-primary/70">
              비밀번호
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="px-3 py-2 text-[13px] rounded-lg border border-border bg-bg-primary text-text-primary placeholder:text-text-primary/30 outline-none focus:border-accent transition-colors"
              placeholder="••••••••"
            />
          </div>

          {error && <p className="text-[12px] text-red-400">{error}</p>}

          <button
            type="submit"
            disabled={isLoading}
            className="mt-1 py-2 text-[13px] font-medium bg-accent text-white rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? '로그인 중...' : '로그인'}
          </button>
        </form>
      </div>
    </div>
  )
}
