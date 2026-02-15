// components/BottomNav.tsx
import Link from 'next/link'

interface Props {
  active: 'home' | 'explore' | 'menu' | 'pay'
  venueSlug?: string
}

export default function BottomNav({ active, venueSlug }: Props) {
  const items = [
    { key: 'home', icon: '🏠', label: 'Home', href: '/venues' },
    { key: 'explore', icon: '🔍', label: 'Explore', href: venueSlug ? `/venues/${venueSlug}` : '/venues' },
    { key: 'menu', icon: '🍽️', label: 'Menu', href: venueSlug ? `/venues/${venueSlug}/menu` : '/venues' },
    //{ key: 'pay', icon: '💳', label: 'Pay', href: '/tip' },
  ]

  return (
    <div
      className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[430px] flex items-center justify-around border-t z-50"
      style={{
        background: 'var(--bg)',
        borderColor: 'var(--border)',
        paddingBottom: 'max(16px, env(safe-area-inset-bottom))',
        paddingTop: '8px',
        height: '80px',
      }}
    >
      {items.map((item) => (
        <Link
          key={item.key}
          href={item.href}
          className="flex flex-col items-center gap-1 px-4 py-2 rounded-xl transition-all active:scale-95"
          style={{ color: item.key === active ? 'var(--accent)' : 'var(--sub)' }}
        >
          <span className="text-[22px]">{item.icon}</span>
          <span className="text-[10px] font-medium">{item.label}</span>
        </Link>
      ))}
    </div>
  )
}
