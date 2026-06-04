export interface CurrentUser {
  userId: string    // JWT 'userId' custom claim (숫자 문자열일 수 있음)
  publicId: string  // JWT 'sub' claim (Spring Security principal, UUID 형식)
  numericId: number
  name: string
  email: string
}

function decodeJWT(token: string): Record<string, unknown> | null {
  try {
    const payload = token.split('.')[1]
    if (!payload) return null
    const decoded = atob(payload.replace(/-/g, '+').replace(/_/g, '/'))
    return JSON.parse(decoded)
  } catch {
    return null
  }
}

export function parseCurrentUser(token: string | null): CurrentUser | null {
  if (!token) return null
  const claims = decodeJWT(token)
  if (!claims) return null

  const sub = String(claims['sub'] ?? '')
  const userId = String(claims['userId'] ?? sub)
  // publicId: sub (UUID) 우선, 없으면 userId fallback
  const publicId = sub || userId
  // numericId: 명시적 숫자 클레임 → userId가 숫자인 경우도 시도
  const numericId = Number(claims['id'] ?? claims['numericId'] ?? claims['userId'] ?? NaN)
  const name = String(claims['name'] ?? claims['username'] ?? '')
  const email = String(claims['email'] ?? '')

  if (!userId) return null
  return { userId, publicId, numericId: Number.isNaN(numericId) ? -1 : numericId, name, email }
}
