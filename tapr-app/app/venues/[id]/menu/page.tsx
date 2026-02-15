// app/venues/[id]/menu/page.tsx
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { prisma } from '@/lib/db'
import BottomNav from '@/components/BottomNav'

interface Props {
  params: { id: string }
  searchParams: { category?: string }
}

const CATEGORIES = ['All', 'Starter', 'Main', 'Cocktail', 'Beer', 'Non-alcoholic']

const CATEGORY_EMOJIS: Record<string, string> = {
  Starter: '🥗',
  Main: '🍽️',
  Cocktail: '🍹',
  Beer: '🍺',
  'Non-alcoholic': '🧃',
}

export default async function MenuPage({ params, searchParams }: Props) {
  const venue = await prisma.venue.findUnique({ where: { slug: params.id } })
  if (!venue) notFound()

  const category = searchParams.category || 'All'

  const items = await prisma.menuItem.findMany({
    where: {
      venueId: venue.id,
      isAvailable: true,
      ...(category !== 'All' ? { category } : {}),
    },
    orderBy: [{ category: 'asc' }, { name: 'asc' }],
  })

  // Group by category
  const grouped: Record<string, typeof items> = {}
  items.forEach((item) => {
    if (!grouped[item.category]) grouped[item.category] = []
    grouped[item.category].push(item)
  })

  return (
    <main className="min-h-screen pb-24">
      {/* Header */}
      <div className="sticky top-0 z-20 px-5 pt-14 pb-3 border-b"
        style={{ background: 'var(--bg)', borderColor: 'var(--border)' }}>
        <div className="flex justify-between items-center text-xs font-semibold mb-3">
          <span>9:41</span>
          <div className="flex gap-1 text-base">●●● 📶 🔋</div>
        </div>
        <Link
          href={`/venues/${venue.slug}`}
          className="flex items-center gap-1 text-sm mb-2"
          style={{ color: 'var(--sub)' }}
        >
          ← {venue.name}
        </Link>
        <h1 className="font-display text-3xl font-bold" style={{ color: 'var(--text)' }}>
          Menu
        </h1>
      </div>

      {/* Category tabs */}
      <div
        className="flex gap-2 px-5 py-3 overflow-x-auto no-scrollbar border-b sticky top-[120px] z-10"
        style={{ background: 'var(--bg)', borderColor: 'var(--border)' }}
      >
        {CATEGORIES.map((cat) => (
          <Link
            key={cat}
            href={`/venues/${params.id}/menu?category=${cat}`}
            className="px-4 py-2 rounded-full text-[13px] font-medium whitespace-nowrap flex-shrink-0 border transition-all"
            style={{
              background: cat === category ? 'var(--card)' : 'transparent',
              borderColor: cat === category ? 'var(--border)' : 'transparent',
              color: cat === category ? 'var(--text)' : 'var(--sub)',
            }}
          >
            {cat}
          </Link>
        ))}
      </div>

      {/* Items */}
      <div className="px-5 pt-2">
        {Object.keys(grouped).length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <span className="text-5xl mb-4">🍽️</span>
            <p style={{ color: 'var(--sub)' }}>No items in this category</p>
          </div>
        ) : (
          Object.entries(grouped).map(([cat, catItems]) => (
            <div key={cat}>
              <h2
                className="text-[11px] uppercase tracking-[2px] py-4"
                style={{ color: 'var(--sub)' }}
              >
                {cat}s
              </h2>
              <div className="space-y-3">
                {catItems.map((item, idx) => (
                  <div
                    key={item.id}
                    className="rounded-3xl overflow-hidden border animate-fade-up"
                    style={{
                      background: 'var(--card)',
                      borderColor: 'var(--border)',
                      animationDelay: `${idx * 0.06}s`,
                    }}
                  >
                    {/* Image */}
                    <div
                      className="h-44 flex items-center justify-center text-6xl relative overflow-hidden"
                      style={{
                        background:
                          cat === 'Cocktail'
                            ? 'linear-gradient(135deg, #000d1a, #001a2d)'
                            : cat === 'Beer'
                            ? 'linear-gradient(135deg, #1a0800, #2d1400)'
                            : 'linear-gradient(135deg, #0a1a00, #142d00)',
                      }}
                    >
                      <span className="opacity-50">{CATEGORY_EMOJIS[cat] || '🍴'}</span>
                      <div
                        className="absolute inset-0"
                        style={{ background: 'linear-gradient(transparent 50%, rgba(0,0,0,0.4) 100%)' }}
                      />
                    </div>

                    {/* Body */}
                    <div className="p-4">
                      <h3 className="font-display text-lg font-bold" style={{ color: 'var(--text)' }}>
                        {item.name}
                      </h3>
                      {item.description && (
                        <p className="text-xs mt-1 mb-3 leading-relaxed" style={{ color: 'var(--sub)' }}>
                          {item.description}
                        </p>
                      )}
                      <div className="flex items-center justify-between">
                        <div>
                          <span className="font-display text-xl font-bold" style={{ color: 'var(--accent)' }}>
                            ${item.price.toFixed(2)}
                          </span>
                          {item.weight && (
                            <span className="text-[11px] ml-2" style={{ color: 'var(--sub)' }}>
                              {item.weight}
                            </span>
                          )}
                        </div>
                        <button
                          className="w-9 h-9 rounded-xl flex items-center justify-center text-xl font-light border-none transition-all active:scale-95"
                          style={{ background: 'var(--accent)', color: '#000' }}
                        >
                          +
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))
        )}
      </div>

      <BottomNav active="menu" venueSlug={venue.slug} />
    </main>
  )
}
