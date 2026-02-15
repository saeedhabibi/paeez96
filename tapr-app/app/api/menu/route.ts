// app/api/menu/route.ts
import { NextRequest } from 'next/server'
import { prisma } from '@/lib/db'
import { ok, error, handleError } from '@/lib/api'

// GET /api/menu?venueId=xxx&category=Cocktail
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const venueSlug = searchParams.get('venue')
    const category = searchParams.get('category')

    if (!venueSlug) return error('venue is required', 400)

    const venue = await prisma.venue.findUnique({ where: { slug: venueSlug } })
    if (!venue) return error('Venue not found', 404)

    const items = await prisma.menuItem.findMany({
      where: {
        venueId: venue.id,
        isAvailable: true,
        ...(category && category !== 'All' ? { category } : {}),
      },
      orderBy: [{ category: 'asc' }, { price: 'asc' }],
    })

    return ok(items)
  } catch (err) {
    return handleError(err)
  }
}
