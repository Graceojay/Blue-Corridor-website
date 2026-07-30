import { SITE_URL, pages } from '@/lib/site'

export default function sitemap() {
  const now = new Date()
  return Object.values(pages).map((page) => ({
    url: `${SITE_URL}${page.route}`,
    lastModified: now,
    changeFrequency: page.route === '/' ? 'weekly' : 'monthly',
    priority: page.route === '/' ? 1 : page.route === '/contact' ? 0.8 : 0.9,
  }))
}
