export interface CurrentUser {
  userId: string
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

  // Spring Security 기본값: sub = 사용자 식별자
  const userId = String(claims['userId'] ?? claims['sub'] ?? '')
  const numericId = Number(claims['id'] ?? claims['numericId'] ?? NaN)
  const name = String(claims['name'] ?? claims['username'] ?? '')
  const email = String(claims['email'] ?? '')

  if (!userId) return null
  return { userId, numericId: Number.isNaN(numericId) ? -1 : numericId, name, email }
}
