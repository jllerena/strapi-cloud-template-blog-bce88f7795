import Link from 'next/link'
import { assetUrl, getCaseStudies } from '@/lib/strapi'
import { absoluteUrl, pickSeo, isStaging } from '@/lib/seo'
import type { Metadata } from 'next'

export default async function Page() {
  const list = await getCaseStudies()
  const items = list?.data || []
  return (
    <section className="section">
      <div className="container">
        <h1>Case Studies</h1>
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({ '@context': 'https://schema.org', '@type': 'BreadcrumbList', itemListElement: [ { '@type': 'ListItem', position: 1, name: 'Home', item: absoluteUrl('/') }, { '@type': 'ListItem', position: 2, name: 'Technical Library', item: absoluteUrl('/technical-library') }, { '@type': 'ListItem', position: 3, name: 'Case Studies', item: absoluteUrl('/technical-library/case-studies') } ] }) }} />
        <div className="grid grid-3" style={{ marginTop: 12 }}>
          {(Array.isArray(items) ? items : []).filter((it: any) => it && it.attributes).map((it: any, i: number) => {
            const a = it?.attributes || {}
            const title = a.title || '(untitled)'
            const excerpt = a.excerpt || ''
            const slug = a.slug || ''
            const coverUrl = a?.cover?.data?.attributes?.url
            return (
              <div key={it?.id ?? slug ?? i} className="card">
                {coverUrl ? (
                  <img src={assetUrl(coverUrl)!} alt={title} />
                ) : null}
                <h3>{title}</h3>
                <p>{excerpt.slice(0, 180)}</p>
                {slug ? <Link className="btn btn-secondary" href={`/technical-library/case-studies/${slug}`}>Read</Link> : null}
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}

export async function generateMetadata(): Promise<Metadata> {
  const gRes = await fetch(`${process.env.STRAPI_URL || 'http://localhost:1337'}/api/global?populate=*`, { next: { revalidate: 120 } }).then(r=>r.json()).catch(()=>({}))
  const g = gRes?.data?.attributes
  const seo = pickSeo({ seo: { metaTitle: 'Case Studies — NRTech USA', metaDescription: 'Detailed, anonymized results from real projects.' } }, g)
  return {
    title: seo.title,
    description: seo.description,
    alternates: { canonical: absoluteUrl('/technical-library/case-studies') },
    robots: isStaging() ? { index: false, follow: false } : undefined,
    openGraph: { title: seo.title, description: seo.description, url: absoluteUrl('/technical-library/case-studies') },
  }
}
