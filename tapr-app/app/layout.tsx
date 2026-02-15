// app/layout.tsx
import type { Metadata, Viewport } from 'next'
import { Playfair_Display, DM_Sans } from 'next/font/google'
import './globals.css'

const playfair = Playfair_Display({
  subsets: ['latin'],
  variable: '--font-playfair',
  weight: ['400', '700', '900'],
})

const dmSans = DM_Sans({
  subsets: ['latin'],
  variable: '--font-dm-sans',
  weight: ['300', '400', '500', '600'],
})

export const metadata: Metadata = {
  title: 'Tapr — Bar & Dining',
  description: 'Discover bars, browse menus, and tip your server',
  manifest: '/manifest.json',
  appleWebApp: { capable: true, statusBarStyle: 'black-translucent', title: 'Tapr' },
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  themeColor: '#0e0e0e',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${playfair.variable} ${dmSans.variable}`}>
      <body className="bg-[#0e0e0e] font-sans text-[#f0ece4] antialiased">
        <div className="flex justify-center">
          <div className="w-full max-w-[430px] min-h-screen relative">
            {children}
          </div>
        </div>
      </body>
    </html>
  )
}
