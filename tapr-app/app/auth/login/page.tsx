// app/auth/login/page.tsx
'use client'
import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

export default function LoginPage() {
  const router = useRouter()
  const [form, setForm] = useState({ email: '', password: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      const data = await res.json()
      if (!res.ok) { setError(data.error); return }
      router.push('/')
      router.refresh()
    } catch {
      setError('Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="min-h-screen flex flex-col px-6 pt-20 pb-10">
      <div className="text-5xl mb-8">🍂</div>
      <h1 className="font-display text-4xl font-bold mb-1" style={{ color: 'var(--text)' }}>Welcome back</h1>
      <p className="text-sm mb-10" style={{ color: 'var(--sub)' }}>Sign in to your Tapr account</p>

      <form onSubmit={handleSubmit} className="space-y-3 flex-1">
        {[
          { label: 'Email', key: 'email', type: 'email', placeholder: 'nessa@tapr.app' },
          { label: 'Password', key: 'password', type: 'password', placeholder: '••••••••' },
        ].map((field) => (
          <div key={field.key}>
            <label className="text-xs uppercase tracking-wider mb-2 block" style={{ color: 'var(--sub)' }}>
              {field.label}
            </label>
            <input
              type={field.type}
              placeholder={field.placeholder}
              value={(form as any)[field.key]}
              onChange={(e) => setForm({ ...form, [field.key]: e.target.value })}
              required
              className="w-full px-4 py-4 rounded-2xl border outline-none text-sm transition-all"
              style={{
                background: 'var(--card)',
                borderColor: 'var(--border)',
                color: 'var(--text)',
              }}
            />
          </div>
        ))}

        {error && <p className="text-sm text-red-400">{error}</p>}

        <button
          type="submit"
          disabled={loading}
          className="w-full py-5 rounded-2xl font-bold text-base disabled:opacity-50 transition-all active:scale-[0.99] mt-4"
          style={{ background: 'var(--accent)', color: '#000' }}
        >
          {loading ? 'Signing in...' : 'Sign in'}
        </button>
      </form>

      <p className="text-center text-sm mt-8" style={{ color: 'var(--sub)' }}>
        Don't have an account?{' '}
        <Link href="/auth/register" className="underline" style={{ color: 'var(--accent)' }}>
          Register
        </Link>
      </p>

      {/* Demo credentials */}
      <div className="mt-4 p-3 rounded-xl border text-xs text-center" style={{ borderColor: 'var(--border)', color: 'var(--sub)' }}>
        Demo: nessa@tapr.app / password123
      </div>
    </main>
  )
}
