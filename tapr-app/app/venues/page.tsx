// app/venues/page.tsx
import Link from 'next/link'
import { prisma } from '@/lib/db'
import BottomNav from '@/components/BottomNav'

export default async function VenuesPage() {
  const venues = await prisma.venue.findMany({
    orderBy: { createdAt: 'desc' },
    include: { _count: { select: { menuItems: true } } },
  })

  return (
    <main className="min-h-screen pb-24">
      {/* Status bar + header */}
      <div className="sticky top-0 z-20 px-5 pt-14 pb-4" style={{ background: 'var(--bg)' }}>
        
        <h1 className="font-display text-3xl font-bold" style={{ color: 'var(--text)' }}>
          Discover Venues
        </h1>
        <p className="text-sm mt-1" style={{ color: 'var(--sub)' }}>
          {venues.length} places near you
        </p>
      </div>

      {/* Search */}
      <div className="px-5 mb-4">
        <div
          className="flex items-center gap-3 rounded-2xl px-4 py-3 border"
          style={{ background: 'var(--card)', borderColor: 'var(--border)' }}
        >
          <span>🔍</span>
          <input
            type="text"
            placeholder="Search venues..."
            className="flex-1 bg-transparent outline-none text-sm"
            style={{ color: 'var(--text)' }}
          />
        </div>
      </div>

      {/* Category tags */}
      <div className="flex gap-2 px-5 mb-5 overflow-x-auto no-scrollbar">
        {['All', 'Bar', 'Brewery', 'Gastropub', 'Restaurant', 'Cafe'].map((cat, i) => (
          <button
            key={cat}
            className="px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap flex-shrink-0 border transition-all"
            style={{
              background: i === 0 ? 'var(--text)' : 'var(--card)',
              color: i === 0 ? '#000' : 'var(--sub)',
              borderColor: i === 0 ? 'var(--text)' : 'var(--border)',
              fontWeight: i === 0 ? 600 : 400,
            }}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Venue cards */}
      <div className="px-5 space-y-3">
        {venues.map((venue, idx) => (
          <Link
            key={venue.id}
            href={`/venues/${venue.slug}`}
            className="block rounded-3xl overflow-hidden border transition-transform active:scale-[0.99] animate-fade-up"
            style={{
              background: 'var(--card)',
              borderColor: 'var(--border)',
              animationDelay: `${idx * 0.08}s`,
            }}
          >
            {/* Hero image */}
            <div
              className="h-48 relative flex items-center justify-center overflow-hidden"
              style={{ background: 'linear-gradient(135deg, #1a0f00, #2d1a05, #1a0f00)' }}
            >
              <span className="text-7xl opacity-20">🍺</span>
              <div
                className="absolute inset-0"
                style={{
                  background: 'linear-gradient(180deg, transparent 40%, rgba(14,14,14,0.95) 100%)',
                }}
              />
              <div className="absolute top-3 right-3 text-[11px] font-medium px-2 py-1 rounded-full border"
                style={{ background: 'rgba(0,0,0,0.6)', borderColor: 'rgba(255,255,255,0.1)', color: 'var(--text)' }}>
                01 · 06
              </div>
              {venue.isOpen && (
                <div className="absolute bottom-3 left-4 text-xs font-semibold" style={{ color: 'var(--green)' }}>
                  ● Open now
                </div>
              )}
            </div>

            {/* Info */}
            <div className="p-4">
              <h2 className="font-display text-xl font-bold leading-tight" style={{ color: 'var(--text)' }}>
                {venue.name}
              </h2>
              <p className="text-xs mt-0.5 mb-3" style={{ color: 'var(--sub)' }}>
                {venue.category.join(' · ')}
              </p>
              <div className="flex items-center justify-between text-xs" style={{ color: 'var(--sub)' }}>
                <span>📍 {venue.city.split(',')[0]}</span>
                <span>{venue._count.menuItems} menu items</span>
              </div>
            </div>
          </Link>
        ))}
      </div>

      <BottomNav active="home" />
    </main>
  )
}
