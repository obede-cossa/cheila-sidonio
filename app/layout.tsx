import { Analytics } from '@vercel/analytics/next'
import type { Metadata, Viewport } from 'next'
import { GeistSans } from 'geist/font/sans'

import './globals.css'

/**
 * Fonts come from npm, not fonts.gstatic.com.
 *
 * `next/font/google` downloads the woff2 files during the build. If that
 * request fails, Turbopack reports it as
 *   Can't resolve '@vercel/turbopack-next/internal/font/google/font'
 * which is a network error wearing a module-resolution costume.
 *
 * - Geist ships in the `geist` package (Vercel's own, wraps next/font/local).
 * - Cormorant Garamond ships in @fontsource-variable/cormorant-garamond,
 *   imported at the top of globals.css.
 *
 * Both resolve from node_modules, so the build works offline.
 */

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000'),
  title: {
    default: 'Cheila & Sidonio | Lista de presentes',
    template: '%s | Cheila & Sidonio',
  },
  description: 'Celebre connosco o início da nossa história.',
  openGraph: {
    title: 'Cheila & Sidonio | Lista de presentes',
    description: 'Celebre connosco o início da nossa história.',
    locale: 'pt_PT',
    type: 'website',
  },
  icons: {
    icon: [
      { url: '/icon-light-32x32.png', media: '(prefers-color-scheme: light)' },
      { url: '/icon-dark-32x32.png', media: '(prefers-color-scheme: dark)' },
      { url: '/icon.svg', type: 'image/svg+xml' },
    ],
    apple: '/apple-icon.png',
  },
}

export const viewport: Viewport = {
  colorScheme: 'light dark',
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: 'white' },
    { media: '(prefers-color-scheme: dark)', color: 'black' },
  ],
}

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="pt-PT"
      className={`${GeistSans.variable} bg-background`}
      suppressHydrationWarning
    >
      <body className="antialiased">
        {children}
        {process.env.NODE_ENV === 'production' && <Analytics />}
      </body>
    </html>
  )
}
