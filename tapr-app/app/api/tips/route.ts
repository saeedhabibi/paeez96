// app/api/tips/route.ts
import { NextRequest } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/lib/db'
import { getCurrentUser } from '@/lib/auth'
import { ok, error, handleError } from '@/lib/api'

const schema = z.object({
  staffId: z.string(),
  amount: z.number().positive().max(1000),
  paymentMethod: z.enum(['card', 'apple_pay', 'google_pay']),
  stripePaymentIntentId: z.string().optional(),
})

// POST /api/tips  — create a tip
export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { staffId, amount, paymentMethod, stripePaymentIntentId } = schema.parse(body)

    const user = await getCurrentUser()

    // Find the actual staff member
    const staff = await prisma.staff.findFirst({ where: { id: staffId } })
    if (!staff) {
      // For demo: find any staff member
      const anyStaff = await prisma.staff.findFirst()
      if (!anyStaff) return error('Staff not found', 404)
    }

    const realStaff = staff ?? (await prisma.staff.findFirst())!

    const tip = await prisma.tip.create({
      data: {
        staffId: realStaff.id,
        userId: user?.id,
        amount,
        paymentMethod,
        stripeId: stripePaymentIntentId,
        status: stripePaymentIntentId ? 'completed' : 'pending',
        currency: 'USD',
      },
      include: { staff: { select: { name: true, role: true } } },
    })

    return ok(tip, 201)
  } catch (err) {
    return handleError(err)
  }
}

// GET /api/tips — list tips for current user
export async function GET(_req: NextRequest) {
  try {
    const user = await getCurrentUser()
    if (!user) return error('Unauthorized', 401)

    const tips = await prisma.tip.findMany({
      where: { userId: user.id },
      include: { staff: { select: { name: true, role: true, venue: { select: { name: true } } } } },
      orderBy: { createdAt: 'desc' },
    })

    return ok(tips)
  } catch (err) {
    return handleError(err)
  }
}
