import { notFound } from 'next/navigation'
import LegacyPage from '@/components/LegacyPage'
import { pageMetadata, pages, readPage, slugs, structuredData } from '@/lib/site'

export const dynamic = 'force-static'
export const dynamicParams = false

export function generateStaticParams() {
  return slugs.map((slug) => ({ slug }))
}

export async function generateMetadata({ params }) {
  const { slug } = await params
  if (!pages[slug]) return {}
  return pageMetadata(slug)
}

export default async function SitePage({ params }) {
  const { slug } = await params
  const html = readPage(slug)
  if (!html) notFound()
  return (
    <>
      {structuredData(slug).map((schema, index) => (
        <script key={index} type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />
      ))}
      <LegacyPage html={html} />
    </>
  )
}
