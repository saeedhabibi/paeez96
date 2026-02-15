// app/api/auth/register/route.ts
import { NextRequest } from 'next/server'
import bcrypt from 'bcryptjs'
import { z } from 'zod'
import { prisma } from '@/lib/db'
import { signToken, setAuthCookie } from '@/lib/auth'
import { ok, error, handleError } from '@/lib/api'

const schema = z.object({
  name: z.string().min(2).max(60),
  email: z.string().email(),
  password: z.string().min(8),
})

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { name, email, password } = schema.parse(body)

    const exists = await prisma.user.findUnique({ where: { email } })
    if (exists) return error('Email already registered', 409)

    const hashed = await bcrypt.hash(password, 12)
    const user = await prisma.user.create({
      data: { name, email, password: hashed },
    })

    const token = signToken({ userId: user.id, email: user.email, name: user.name })
    setAuthCookie(token)

    return ok({ id: user.id, name: user.name, email: user.email }, 201)
  } catch (err) {
    return handleError(err)
  }
}
