// app/tip/page.tsx
'use client'
import { useState } from 'react'
import Link from 'next/link'
import BottomNav from '@/components/BottomNav'

const TIP_AMOUNTS = [10, 25, 50, 100]

export default function TipPage() {
  const [selected, setSelected] = useState<number | null>(null)
  const [custom, setCustom] = useState('0')
  const [paying, setPaying] = useState(false)
  const [paid, setPaid] = useState(false)

  const amount = (selected ?? parseFloat(custom)) || 0

  async function handlePay(method: string) {
    if (amount <= 0) return
    setPaying(true)
    try {
      const res = await fetch('/api/tips', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ staffId: 'demo-staff', amount, paymentMethod: method }),
      })
      if (res.ok) setPaid(true)
    } finally {
      setPaying(false)
    }
  }

  if (paid) {
    return (
      <main className="min-h-screen flex flex-col items-center justify-center px-6 text-center">
        <div className="text-6xl mb-6">🎉</div>
        <h1 className="font-display text-4xl font-bold mb-2" style={{ color: 'var(--text)' }}>
          Thank you!
        </h1>
        <p className="text-sm mb-8" style={{ color: 'var(--sub)' }}>
          Your ${amount} tip has been sent to Nessa Verve
        </p>
        <Link
          href="/venues"
          className="px-8 py-4 rounded-2xl font-bold text-base transition-all active:scale-[0.99]"
          style={{ background: 'var(--accent)', color: '#000' }}
        >
          Back to Venues
        </Link>
      </main>
    )
  }

  return (
    <main className="min-h-screen pb-24 overflow-y-auto">
      {/* Header */}
      <div className="flex items-center justify-between px-5 pt-14 pb-5">
        <div>
          <Link href="/venues" className="text-sm mb-1 block" style={{ color: 'var(--sub)' }}>
            ← Back
          </Link>
          <span className="font-display text-2xl font-bold" style={{ color: 'var(--text)' }}>
            tapr
          </span>
        </div>
        <button
          className="px-4 py-2 rounded-full text-xs font-bold"
          style={{ background: 'var(--accent)', color: '#000' }}
        >
          Get your card
        </button>
      </div>

      <p className="px-5 text-[11px] uppercase tracking-[2px] mb-3" style={{ color: 'var(--sub)' }}>
        Tip payment
      </p>

      {/* Server card */}
      <div
        className="mx-5 mb-6 p-6 rounded-3xl border flex items-center gap-4 animate-fade-up"
        style={{ background: 'var(--card)', borderColor: 'var(--border)' }}
      >
        <div
          className="w-[72px] h-[72px] rounded-full flex items-center justify-center text-3xl flex-shrink-0 border-2"
          style={{ background: 'linear-gradient(135deg, #333, #555)', borderColor: 'var(--accent)' }}
        >
          👩
        </div>
        <div>
          <h2 className="font-display text-2xl font-bold" style={{ color: 'var(--text)' }}>
            Nessa Verve
          </h2>
          <p className="text-sm mt-0.5" style={{ color: 'var(--sub)' }}>
            Your server tonight
          </p>
          <p className="text-sm mt-1 tracking-wider" style={{ color: 'var(--accent)' }}>
            ★★★★★
          </p>
        </div>
      </div>

      {/* Tip amounts */}
      <div className="grid grid-cols-4 gap-2 px-5 mb-4 animate-fade-up delay-100">
        {TIP_AMOUNTS.map((amt) => (
          <button
            key={amt}
            onClick={() => { setSelected(amt); setCustom(String(amt)) }}
            className="py-4 rounded-2xl text-base font-bold border transition-all active:scale-95"
            style={{
              background: selected === amt ? 'var(--accent)' : 'var(--card)',
              color: selected === amt ? '#000' : 'var(--text)',
              borderColor: selected === amt ? 'var(--accent)' : 'var(--border)',
            }}
          >
            ${amt}
          </button>
        ))}
      </div>

      {/* Custom amount */}
      <div
        className="mx-5 mb-5 px-4 py-3 rounded-2xl border flex items-center gap-2 animate-fade-up delay-100"
        style={{ background: 'var(--card)', borderColor: 'var(--border)' }}
      >
        <span className="text-sm" style={{ color: 'var(--sub)' }}>Amount: $</span>
        <input
          type="number"
          value={custom}
          onChange={(e) => { setCustom(e.target.value); setSelected(null) }}
          className="flex-1 bg-transparent outline-none text-xl font-bold"
          style={{ color: 'var(--text)' }}
          placeholder="0"
          min="0"
        />
      </div>

      <div className="h-px mx-5 mb-5" style={{ background: 'var(--border)' }} />

      {/* Pay buttons */}
      <div className="px-5 space-y-3 animate-fade-up delay-200">
        <button
          onClick={() => handlePay('apple_pay')}
          disabled={paying || amount <= 0}
          className="w-full py-4 rounded-2xl font-bold text-base flex items-center justify-center gap-2 disabled:opacity-40 transition-all active:scale-[0.99]"
          style={{ background: '#fff', color: '#000' }}
        >
          🍎 Buy with Apple Pay
        </button>
        <button
          onClick={() => handlePay('google_pay')}
          disabled={paying || amount <= 0}
          className="w-full py-4 rounded-2xl font-bold text-base flex items-center justify-center gap-2 disabled:opacity-40 transition-all active:scale-[0.99]"
          style={{ background: '#fff', color: '#000' }}
        >
          🔵 Buy with Google Pay
        </button>
      </div>

      {/* Card form */}
      <div
        className="mx-5 mt-4 rounded-2xl border overflow-hidden animate-fade-up delay-300"
        style={{ background: 'var(--card)', borderColor: 'var(--border)' }}
      >
        <div className="px-4 py-3 border-b flex justify-between items-center" style={{ borderColor: 'var(--border)' }}>
          <span className="text-sm" style={{ color: 'var(--sub)' }}>Card number</span>
          <input
            className="bg-transparent outline-none text-sm text-right"
            style={{ color: 'var(--text)' }}
            placeholder="•••• •••• •••• ••••"
          />
        </div>
        <div className="grid grid-cols-2 border-b" style={{ borderColor: 'var(--border)' }}>
          <div className="px-4 py-3 border-r" style={{ borderColor: 'var(--border)' }}>
            <div className="text-[11px] mb-1" style={{ color: 'var(--sub)' }}>Validity</div>
            <input className="bg-transparent outline-none text-sm w-full" style={{ color: 'var(--text)' }} placeholder="MM / YY" />
          </div>
          <div className="px-4 py-3">
            <div className="text-[11px] mb-1" style={{ color: 'var(--sub)' }}>CVV2 code</div>
            <input className="bg-transparent outline-none text-sm w-full" style={{ color: 'var(--text)' }} placeholder="•••" type="password" />
          </div>
        </div>
        <div className="px-4 py-3 flex justify-between items-center">
          <span className="text-sm" style={{ color: 'var(--sub)' }}>Email</span>
          <input
            className="bg-transparent outline-none text-sm text-right flex-1 ml-2"
            style={{ color: 'var(--text)' }}
            placeholder="your@email.com"
            type="email"
          />
        </div>
        <div className="px-4 pb-4 pt-2">
          <button
            onClick={() => handlePay('card')}
            disabled={paying || amount <= 0}
            className="w-full py-4 rounded-2xl font-bold text-base disabled:opacity-40 transition-all active:scale-[0.99]"
            style={{ background: 'var(--accent)', color: '#000' }}
          >
            {paying ? 'Processing...' : `Pay $${amount || 0}`}
          </button>
        </div>
      </div>

      <BottomNav active="pay" />
    </main>
  )
}
