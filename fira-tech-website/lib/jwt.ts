import jwt from 'jsonwebtoken'

const JWT_SECRET = process.env.JWT_SECRET!

export interface JWTPayload {
  id: string
  email: string
  name: string
  role: string
  exp: number
}

export function generateToken(payload: Omit<JWTPayload, 'exp'>): string {
  return jwt.sign(payload, JWT_SECRET, {
    expiresIn: '1h'
  })
}

export function verifyToken(token: string): JWTPayload | null {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as JWTPayload
    return decoded
  } catch (error) {
    return null
  }
}

export function setAuthCookie(res: any, token: string): void {
  const cookie = `auth-token=${token}; HttpOnly; Secure; SameSite=Strict; Path=/; Max-Age=3600`
  res.setHeader('Set-Cookie', cookie)
}

export function clearAuthCookie(res: any): void {
  const cookie = 'auth-token=; HttpOnly; Secure; SameSite=Strict; Path=/; Max-Age=0; Expires=Thu, 01 Jan 1970 00:00:00 GMT'
  res.setHeader('Set-Cookie', cookie)
}

export function getTokenFromCookie(req: any): string | null {
  const cookieHeader = req.headers.cookie || ''
  const cookies = cookieHeader.split(';').reduce((acc: any, cookie) => {
    const [name, value] = cookie.trim().split('=')
    acc[name] = value
    return acc
  }, {})
  
  return cookies['auth-token'] || null
}
