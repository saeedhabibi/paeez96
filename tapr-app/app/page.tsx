// app/page.tsx
import Link from 'next/link'
import { getCurrentUser } from '@/lib/auth'
import { prisma } from '@/lib/db'

export default async function WelcomePage() {
  const user = await getCurrentUser()

  // Fetch user stats if logged in
  const stats = user
    ? await prisma.$transaction([
        prisma.visit.count({ where: { userId: user.id } }),
        prisma.venue.count({ where: { id: { in: (await prisma.visit.findMany({ where: { userId: user.id }, select: { venueId: true } })).map(v => v.venueId) } } }),
        prisma.tip.aggregate({ where: { userId: user.id, status: 'completed' }, _sum: { amount: true } }),
      ])
    : null

  const visitCount = (stats?.[0] as number) || 0
  const savedCount = 4 // placeholder
  const totalSpent = (stats?.[2] as any)?._sum?.amount || 0

  return (
    <main className="min-h-screen flex flex-col">
      {/* Hero */}
      <div className="relative h-[460px] overflow-hidden">
        {/* Background atmosphere */}
        <div
          className="absolute inset-0"
          style={{
            background: 'linear-gradient(135deg, #1a0f00 0%, #2d1a05 40%, #0e0e0e 100%)',
          }}
        />
        <div className="absolute inset-0 flex items-center justify-center text-[140px] opacity-5 select-none">
          🍂
        </div>
        <div
          className="absolute inset-0"
          style={{
            background:
              'radial-gradient(ellipse at 25% 60%, rgba(212,168,67,0.12) 0%, transparent 65%), linear-gradient(180deg, rgba(14,14,14,0.2) 0%, rgba(14,14,14,0.92) 80%, #0e0e0e 100%)',
          }}
        />

        

        {/* Content */}
        <div className="absolute bottom-0 left-0 right-0 px-6 pb-2">
          <p
            className="text-[11px] font-semibold tracking-[3px] uppercase mb-2 animate-fade-up"
            style={{ color: 'var(--accent)' }}
          >
            Welcome Back
          </p>
          <h1
            className="font-display text-[56px] font-black leading-none mb-1 animate-fade-up delay-100"
            style={{ color: 'var(--text)' }}
          >
            {user ? user.name.split(' ')[0] : 'payiz'}
            <br />
            {user ? user.name.split(' ').slice(1).join(' ') : '96'}
          </h1>
          <p className="text-sm animate-fade-up delay-200" style={{ color: 'var(--sub)' }}>
            Your favourite bars, at your fingertips
          </p>
        </div>
      </div>

      {/* Bottom section */}
      <div className="flex-1 px-6 pt-6 pb-10 flex flex-col gap-6 animate-fade-up delay-300">
        {/* Stats */}
        <div className="grid grid-cols-3 gap-3">
          {[
            { num: visitCount || 12, label: 'Visits' },
            { num: savedCount, label: 'Saved' },
            { num: `$${Math.round(totalSpent || 86)}`, label: 'Spent' },
          ].map((stat) => (
            <div
              key={stat.label}
              className="rounded-2xl p-4 text-center border"
              style={{ background: 'var(--card)', borderColor: 'var(--border)' }}
            >
              <div className="font-display text-2xl font-bold" style={{ color: 'var(--accent)' }}>
                {stat.num}
              </div>
              <div className="text-[11px] mt-1" style={{ color: 'var(--sub)' }}>
                {stat.label}
              </div>
            </div>
          ))}
        </div>

        <Link
          href="/venues"
          className="w-full py-[18px] rounded-2xl flex items-center justify-center gap-2 text-base font-bold transition-all active:scale-[0.99]"
          style={{ background: 'var(--accent)', color: '#000' }}
        >
          🍻 Start Ordering
        </Link>

        {!user && (
          <div className="text-center">
            <p className="text-sm" style={{ color: 'var(--sub)' }}>
              Already have an account?{' '}
              <Link href="/auth/login" className="underline" style={{ color: 'var(--accent)' }}>
                Sign in
              </Link>
            </p>
          </div>
        )}
      </div>
    </main>
  )
}
