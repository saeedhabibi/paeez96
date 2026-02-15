// app/api/auth/login/route.ts
import { NextRequest } from 'next/server'
import bcrypt from 'bcryptjs'
import { z } from 'zod'
import { prisma } from '@/lib/db'
import { signToken, setAuthCookie } from '@/lib/auth'
import { ok, error, handleError } from '@/lib/api'

const schema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
})

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { email, password } = schema.parse(body)

    const user = await prisma.user.findUnique({ where: { email } })
    if (!user) return error('Invalid email or password', 401)

    const valid = await bcrypt.compare(password, user.password)
    if (!valid) return error('Invalid email or password', 401)

    const token = signToken({ userId: user.id, email: user.email, name: user.name })
    setAuthCookie(token)

    return ok({ id: user.id, name: user.name, email: user.email })
  } catch (err) {
    return handleError(err)
  }
}
