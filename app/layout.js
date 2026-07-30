import './globals.css'
import { Suspense } from 'react'
import SiteRuntime from '@/components/SiteRuntime'
import { SITE_URL } from '@/lib/site'

export const metadata = {
  metadataBase: new URL(SITE_URL),
  applicationName: 'Blue Corridor Global',
  category: 'Executive Advisory and Human Capital Innovation',
  authors: [{ name: 'Blue Corridor Global', url: SITE_URL }],
  creator: 'Blue Corridor Global',
  publisher: 'Blue Corridor Global',
  formatDetection: { email: false, address: false, telephone: false },
  icons: { icon: '/assets/favicon.png', shortcut: '/assets/favicon.png', apple: '/assets/favicon.png' },
}

const organizationSchema = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  '@id': `${SITE_URL}/#organization`,
  name: 'Blue Corridor Global',
  url: SITE_URL,
  logo: `${SITE_URL}/assets/blue-corridor-logo.png`,
  email: 'info@bluecorridorglobal.com',
  description: 'A human capital innovation and executive advisory firm helping leaders and institutions build clarity, alignment, belonging and sustainable performance.',
  founder: {
    '@type': 'Person',
    name: 'Jesunifemi Ogundipe',
    url: `${SITE_URL}/founder`,
  },
  areaServed: ['Canada', 'Nigeria', 'Global'],
}

const websiteSchema = {
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  '@id': `${SITE_URL}/#website`,
  url: SITE_URL,
  name: 'Blue Corridor Global',
  publisher: { '@id': `${SITE_URL}/#organization` },
  inLanguage: 'en-CA',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en-CA">
      <body>
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }} />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteSchema) }} />
        {children}
        <Suspense fallback={null}><SiteRuntime /></Suspense>
      </body>
    </html>
  )
}
