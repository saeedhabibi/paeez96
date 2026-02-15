// app/api/venues/[id]/route.ts
import { NextRequest } from 'next/server'
import { prisma } from '@/lib/db'
import { ok, error, handleError } from '@/lib/api'

// GET /api/venues/:slug
export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const venue = await prisma.venue.findUnique({
      where: { slug: params.id },
      include: {
        menuItems: { where: { isAvailable: true }, orderBy: [{ category: 'asc' }, { name: 'asc' }] },
        staff: true,
        _count: { select: { visits: true } },
      },
    })
    if (!venue) return error('Venue not found', 404)
    return ok(venue)
  } catch (err) {
    return handleError(err)
  }
}
