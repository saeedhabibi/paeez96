// app/api/venues/route.ts
import { NextRequest } from 'next/server'
import { prisma } from '@/lib/db'
import { ok, handleError } from '@/lib/api'

// GET /api/venues?category=Bar&search=copper
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const category = searchParams.get('category')
    const search = searchParams.get('search')

    const venues = await prisma.venue.findMany({
      where: {
        ...(category && category !== 'All' ? { category: { has: category } } : {}),
        ...(search ? {
          OR: [
            { name: { contains: search, mode: 'insensitive' } },
            { city: { contains: search, mode: 'insensitive' } },
          ],
        } : {}),
      },
      include: { _count: { select: { menuItems: true, staff: true } } },
      orderBy: { createdAt: 'desc' },
    })

    return ok(venues)
  } catch (err) {
    return handleError(err)
  }
}
