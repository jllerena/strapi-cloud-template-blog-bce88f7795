import Link from 'next/link'
import Image from 'next/image'
import { getSolutions, assetUrl, getGlobal } from '@/lib/strapi'
import { absoluteUrl, pickSeo, isStaging } from '@/lib/seo'
import type { Metadata } from 'next'

export default async function Page() {
  const list = await getSolutions()
  const items = list?.data || []
  return (
    <section className="section">
      <div className="container">
        <h1>Solutions Built Around Your Application</h1>
        {items.length === 0 && (
          <p className="sub">No solutions found. Check Strapi content and permissions for public access.</p>
        )}
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({ '@context': 'https://schema.org', '@type': 'BreadcrumbList', itemListElement: [ { '@type': 'ListItem', position: 1, name: 'Home', item: absoluteUrl('/') }, { '@type': 'ListItem', position: 2, name: 'Solutions', item: absoluteUrl('/solutions') } ] }) }} />
        <div className="grid grid-3">
          {(Array.isArray(items) ? items : []).filter((it: any) => it && it.attributes).map((it: any, i: number) => {
            const a = it?.attributes || {}
            const title = a.title || '(untitled)'
            const slug = a.slug || ''
            const summary = a.summary || ''
            const heroUrl = a?.hero?.image?.data?.attributes?.url
            const heroAlt = a?.hero?.image?.data?.attributes?.alternativeText || title
            return (
              <div key={it?.id ?? slug ?? i} className="card">
                {heroUrl ? (
                  <Image src={assetUrl(heroUrl)!} alt={heroAlt} width={600} height={400} sizes="(max-width: 600px) 100vw, 600px" placeholder="blur" blurDataURL="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR4nGNgYAAAAAMAASsJTYQAAAAASUVORK5CYII" style={{ width: '100%', height: 'auto' }} />
                ) : null}
                <h3>{title}</h3>
                <p>{summary.slice(0, 160)}</p>
                {slug ? <Link className="btn btn-secondary" href={`/solutions/${slug}`}>Learn More</Link> : null}
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}

export async function generateMetadata(): Promise<Metadata> {
  const gRes = await getGlobal()
  const g = gRes?.data?.attributes
  const seo = pickSeo({ seo: { metaTitle: 'Solutions — NRTech USA', metaDescription: 'Solutions built around your application.' } }, g)
  return {
    title: seo.title,
    description: seo.description,
    alternates: { canonical: absoluteUrl('/solutions') },
    robots: isStaging() ? { index: false, follow: false } : undefined,
    openGraph: { title: seo.title, description: seo.description, url: absoluteUrl('/solutions') },
  }
}
