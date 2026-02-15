// app/venues/[id]/page.tsx
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { prisma } from '@/lib/db'
import BottomNav from '@/components/BottomNav'

interface Props {
  params: { id: string }
}

export default async function VenueDetailPage({ params }: Props) {
  const venue = await prisma.venue.findUnique({
    where: { slug: params.id },
    include: { staff: true, _count: { select: { menuItems: true } } },
  })

  if (!venue) notFound()

  const isOpen = (() => {
    const now = new Date()
    const h = now.getHours()
    const open = parseInt(venue.openTime)
    const close = parseInt(venue.closeTime) || 24
    return h >= open && h < close
  })()

  return (
    <main className="min-h-screen pb-24">
      {/* Hero */}
      <div className="relative h-72 overflow-hidden">
        <div
          className="absolute inset-0 flex items-center justify-center text-[120px]"
          style={{ background: 'linear-gradient(135deg, #0d0500, #2a1200, #1a0a00)' }}
        >
          <span className="opacity-20 select-none">🍺</span>
        </div>
        <div
          className="absolute inset-0"
          style={{ background: 'linear-gradient(180deg, rgba(0,0,0,0.5) 0%, rgba(14,14,14,0.97) 100%)' }}
        />

        {/* Top bar */}
        <div className="absolute top-0 left-0 right-0 flex justify-between items-center px-5 pt-14">
          <Link href="/venues" className="flex items-center gap-1 text-sm" style={{ color: 'var(--text)' }}>
            ← Back
          </Link>
          <div className="text-xs px-2 py-1 rounded-full border font-medium"
            style={{ background: 'rgba(0,0,0,0.6)', borderColor: 'rgba(255,255,255,0.1)', color: 'var(--text)' }}>
            01 · 06
          </div>
        </div>

        {/* Venue badge */}
        <div className="absolute bottom-0 left-0 right-0 px-5 pb-5 flex items-center gap-4">
          <div
            className="w-14 h-14 rounded-2xl flex items-center justify-center font-display font-black text-base flex-shrink-0"
            style={{ background: 'var(--accent)', color: '#000' }}
          >
            {venue.logoText || venue.name.slice(0, 2).toUpperCase()}
          </div>
          <div>
            <h1 className="font-display text-xl font-bold leading-tight" style={{ color: 'var(--text)' }}>
              {venue.name}
            </h1>
            <p className="text-xs mt-0.5" style={{ color: 'var(--sub)' }}>
              {venue.category.join(' · ')}
            </p>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="px-5">
        {/* Info rows */}
        <div className="py-4 border-b space-y-2 animate-fade-up" style={{ borderColor: 'var(--border)' }}>
          {venue.phone && (
            <div className="flex items-center gap-3 text-sm" style={{ color: 'var(--sub)' }}>
              <span>📞</span><span>{venue.phone}</span>
            </div>
          )}
          <div className="flex items-center gap-3 text-sm" style={{ color: 'var(--sub)' }}>
            <span>📍</span><span>{venue.address}, {venue.city}</span>
          </div>
          <div className="flex items-center gap-3 text-sm" style={{ color: 'var(--sub)' }}>
            <span>🕐</span>
            <span>
              {venue.openTime} PM – {venue.closeTime} AM &nbsp;
              <span style={{ color: isOpen ? 'var(--green)' : '#ef4444', fontWeight: 600 }}>
                {isOpen ? 'Open now' : 'Closed'}
              </span>
            </span>
          </div>
        </div>

        {/* Action buttons */}
        <div className="grid grid-cols-2 gap-3 py-4 border-b animate-fade-up delay-100" style={{ borderColor: 'var(--border)' }}>
          <button
            className="py-3 rounded-2xl text-sm font-medium border flex items-center justify-center gap-2 transition-all active:scale-[0.99]"
            style={{ background: 'var(--card)', borderColor: 'var(--border)', color: 'var(--text)' }}
          >
            💾 Save contact
          </button>
          <button
            className="py-3 rounded-2xl text-sm font-medium border flex items-center justify-center gap-2 transition-all active:scale-[0.99]"
            style={{ background: 'var(--card)', borderColor: 'var(--border)', color: 'var(--text)' }}
          >
            🔄 Exchange
          </button>
        </div>

        {/* Bio */}
        {venue.bio && (
          <div className="py-4 border-b animate-fade-up delay-200" style={{ borderColor: 'var(--border)' }}>
            <p className="text-[11px] uppercase tracking-[2px] mb-2" style={{ color: 'var(--sub)' }}>Bio</p>
            <p className="text-sm leading-7" style={{ color: '#aaa' }}>{venue.bio}</p>
          </div>
        )}

        {/* Map placeholder */}
        <div className="py-4 border-b animate-fade-up delay-200" style={{ borderColor: 'var(--border)' }}>
          <p className="text-[11px] uppercase tracking-[2px] mb-3" style={{ color: 'var(--sub)' }}>Location</p>
          <div
            className="h-32 rounded-2xl flex items-center justify-center gap-2 text-sm border relative overflow-hidden"
            style={{ background: 'var(--bg3)', borderColor: 'var(--border)', color: 'var(--sub)' }}
          >
            {/* Grid pattern */}
            <div className="absolute inset-0"
              style={{
                backgroundImage: 'linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)',
                backgroundSize: '24px 24px',
              }}
            />
            <span className="text-2xl relative z-10">📍</span>
            <span className="relative z-10">{venue.address}</span>
          </div>
        </div>

        {/* Featured */}
        <div className="py-4 animate-fade-up delay-300">
          <p className="text-[11px] uppercase tracking-[2px] mb-3" style={{ color: 'var(--sub)' }}>Featured</p>
          <div className="space-y-2">
            {[
              { icon: '🍽️', label: 'Our menu', href: `/venues/${venue.slug}/menu` },
              { icon: '📅', label: 'Make reservations', href: '#' },
              { icon: '💳', label: 'Tip payment', href: '/tip' },
              { icon: '🎵', label: 'Events & open-mike', href: '#' },
            ].map((item) => (
              <Link
                key={item.label}
                href={item.href}
                className="flex items-center justify-between p-4 rounded-2xl border transition-all active:scale-[0.99]"
                style={{ background: 'var(--card)', borderColor: 'var(--border)' }}
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl flex items-center justify-center text-base"
                    style={{ background: 'var(--bg3)' }}>
                    {item.icon}
                  </div>
                  <span className="text-sm font-medium" style={{ color: 'var(--text)' }}>{item.label}</span>
                </div>
                <span style={{ color: 'var(--sub)' }}>›</span>
              </Link>
            ))}
          </div>
        </div>
      </div>

      <BottomNav active="explore" venueSlug={venue.slug} />
    </main>
  )
}
