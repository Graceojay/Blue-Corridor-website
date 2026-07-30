import LegacyPage from '@/components/LegacyPage'
import { pageMetadata, readPage, structuredData } from '@/lib/site'

export const metadata = pageMetadata('home')
export const dynamic = 'force-static'

export default function HomePage() {
  return (
    <>
      {structuredData('home').map((schema, index) => (
        <script key={index} type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />
      ))}
      <LegacyPage html={readPage('home')} />
    </>
  )
}
