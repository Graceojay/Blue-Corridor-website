import fs from 'node:fs'
import path from 'node:path'

export const SITE_URL = 'https://bluecorridorglobal.com'

export const pages = {
  home: {
    route: '/',
    title: 'Blue Corridor Global | Executive Advisory, Leadership Alignment & Human Capital',
    description: 'Blue Corridor Global helps founders, executives and institutions strengthen strategic clarity, leadership alignment, human capital and sustainable performance.',
    type: 'website',
  },
  about: {
    route: '/about',
    title: 'About Blue Corridor Global | Human Capital Systems & Leadership Advisory',
    description: 'Discover Blue Corridor Global, a founder-led human capital innovation firm building systems for leadership clarity, belonging, alignment and sustainable performance.',
    type: 'website',
  },
  alignmentlab: {
    route: '/alignmentlab',
    title: 'Alignment Lab | Strategic Clarity for Founders and Executives',
    description: 'A private strategic alignment experience helping founders, executives and entrepreneurs make clearer decisions, restore capacity and lead sustainable growth.',
    type: 'website',
  },
  executiveadvisory: {
    route: '/executiveadvisory',
    title: 'Executive Advisory for Founders and Leaders | Blue Corridor Global',
    description: 'Private executive advisory for founders, executives and entrepreneurs navigating consequential decisions, complex growth, leadership transitions and high-stakes pressure.',
    type: 'website',
  },
  legacyadvisory: {
    route: '/legacyadvisory',
    title: 'Legacy Advisory for Founders and Visionaries | Blue Corridor Global',
    description: 'A discreet six-month legacy advisory engagement for founders and visionaries ready to preserve intellectual property, life experience and enduring family meaning.',
    type: 'website',
  },
  chaptersproject: {
    route: '/chaptersproject',
    title: 'CHAPTERS Project | Youth Identity, Belonging & Human Capital',
    description: 'Partner with Blue Corridor Global to deploy CHAPTERS Project across schools, organizations, communities and public systems to strengthen identity, belonging and agency.',
    type: 'website',
  },
  speaking: {
    route: '/speaking',
    title: 'Jesunifemi Ogundipe | Keynote Speaker on Leadership and Human Capital',
    description: 'Book Jesunifemi Ogundipe for keynotes and leadership engagements on clarity, identity, belonging, emotional intelligence, human capital and the future of work.',
    type: 'profile',
  },
  contact: {
    route: '/contact',
    title: 'Contact Blue Corridor Global | Executive Advisory and Partnerships',
    description: 'Contact Blue Corridor Global about Executive Advisory, Alignment Lab, Legacy Advisory, CHAPTERS Project partnerships, institutional deployment or speaking.',
    type: 'website',
  },
  founder: {
    route: '/founder',
    title: 'Jesunifemi Ogundipe | Founder of Blue Corridor Global',
    description: 'Meet Jesunifemi Ogundipe, lawyer, systems innovator, human capital strategist, four-time author and keynote speaker building clarity infrastructure for leaders and institutions.',
    type: 'profile',
  },
}

export const slugs = Object.keys(pages).filter((key) => key !== 'home')

export function readPage(slug) {
  const safeSlug = slug === 'home' ? 'home' : slugs.includes(slug) ? slug : null
  if (!safeSlug) return null
  return fs.readFileSync(path.join(process.cwd(), 'content', `${safeSlug}.html`), 'utf8')
}

export function pageMetadata(slug) {
  const page = pages[slug]
  if (!page) return {}
  const canonical = `${SITE_URL}${page.route}`
  return {
    title: page.title,
    description: page.description,
    alternates: { canonical },
    robots: { index: true, follow: true, googleBot: { index: true, follow: true, 'max-image-preview': 'large', 'max-snippet': -1, 'max-video-preview': -1 } },
    openGraph: {
      title: page.title,
      description: page.description,
      url: canonical,
      siteName: 'Blue Corridor Global',
      locale: 'en_CA',
      type: page.type,
      images: [{ url: '/assets/founder-portrait.jpg', alt: 'Blue Corridor Global' }],
    },
    twitter: {
      card: 'summary_large_image',
      title: page.title,
      description: page.description,
      images: ['/assets/founder-portrait.jpg'],
    },
  }
}


export function structuredData(slug) {
  const page = pages[slug]
  if (!page) return []
  const url = `${SITE_URL}${page.route}`
  const breadcrumb = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: page.route === '/' ? [
      { '@type': 'ListItem', position: 1, name: 'Home', item: SITE_URL },
    ] : [
      { '@type': 'ListItem', position: 1, name: 'Home', item: SITE_URL },
      { '@type': 'ListItem', position: 2, name: page.title.split('|')[0].trim(), item: url },
    ],
  }
  const webPage = {
    '@context': 'https://schema.org',
    '@type': slug === 'founder' || slug === 'speaking' ? 'ProfilePage' : 'WebPage',
    '@id': `${url}/#webpage`,
    url,
    name: page.title,
    description: page.description,
    isPartOf: { '@id': `${SITE_URL}/#website` },
    about: { '@id': `${SITE_URL}/#organization` },
    inLanguage: 'en-CA',
  }
  const extras = []
  if (slug === 'founder' || slug === 'speaking') {
    extras.push({
      '@context': 'https://schema.org',
      '@type': 'Person',
      '@id': `${SITE_URL}/founder/#person`,
      name: 'Jesunifemi Ogundipe',
      url: `${SITE_URL}/founder`,
      image: `${SITE_URL}/assets/founder-profile-white-suit.webp`,
      jobTitle: 'Founder and Principal Advisor',
      worksFor: { '@id': `${SITE_URL}/#organization` },
      knowsAbout: ['Executive advisory', 'Human capital', 'Leadership alignment', 'Identity and belonging', 'Future of work'],
    })
  }
  const serviceNames = {
    executiveadvisory: 'Executive Advisory',
    alignmentlab: 'Alignment Lab',
    legacyadvisory: 'Legacy Advisory',
    chaptersproject: 'CHAPTERS Project',
    speaking: 'Keynote Speaking and Leadership Engagements',
  }
  if (serviceNames[slug]) {
    extras.push({
      '@context': 'https://schema.org',
      '@type': 'Service',
      name: serviceNames[slug],
      url,
      provider: { '@id': `${SITE_URL}/#organization` },
      areaServed: 'Global',
      description: page.description,
    })
  }
  return [webPage, breadcrumb, ...extras]
}
