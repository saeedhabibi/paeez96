// lib/auth.ts
import jwt from 'jsonwebtoken'
import { cookies } from 'next/headers'
import { prisma } from './db'

const JWT_SECRET = process.env.JWT_SECRET!

export interface JWTPayload {
  userId: string
  email: string
  name: string
}

export function signToken(payload: JWTPayload): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' })
}

export function verifyToken(token: string): JWTPayload | null {
  try {
    return jwt.verify(token, JWT_SECRET) as JWTPayload
  } catch {
    return null
  }
}

export async function getCurrentUser() {
  try {
    const cookieStore = await cookies()
    const token = cookieStore.get('tapr_token')?.value
    if (!token) return null
    const payload = verifyToken(token)
    if (!payload) return null
    const user = await prisma.user.findUnique({
      where: { id: payload.userId },
      select: { id: true, email: true, name: true, avatar: true },
    })
    return user
  } catch {
    return null
  }
}

export function setAuthCookie(token: string) {
  cookies().set('tapr_token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 7, // 7 days
    path: '/',
  })
}

export function clearAuthCookie() {
  cookies().delete('tapr_token')
}
