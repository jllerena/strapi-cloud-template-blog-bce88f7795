import Link from 'next/link'
import { getResources } from '@/lib/strapi'
import { absoluteUrl, pickSeo, isStaging } from '@/lib/seo'
import type { Metadata } from 'next'

export default async function Page() {
  const list = await getResources()
  const items = list?.data || []
  return (
    <section className="section">
      <div className="container">
        <h1>Technical Resources</h1>
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({ '@context': 'https://schema.org', '@type': 'BreadcrumbList', itemListElement: [ { '@type': 'ListItem', position: 1, name: 'Home', item: absoluteUrl('/') }, { '@type': 'ListItem', position: 2, name: 'Technical Library', item: absoluteUrl('/technical-library') }, { '@type': 'ListItem', position: 3, name: 'Technical Resources', item: absoluteUrl('/technical-library/resources') } ] }) }} />
        <div className="grid grid-3" style={{ marginTop: 12 }}>
          {(Array.isArray(items) ? items : []).filter((it: any) => it && it.attributes).map((it: any, i: number) => {
            const a = it?.attributes || {}
            const title = a.title || '(untitled)'
            const excerpt = a.excerpt || ''
            const slug = a.slug || ''
            return (
              <div key={it?.id ?? slug ?? i} className="card">
                <h3>{title}</h3>
                <p>{excerpt.slice(0, 200)}</p>
                {slug ? <Link className="btn btn-secondary" href={`/technical-library/resources/${slug}`}>Read</Link> : null}
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
  const seo = pickSeo({ seo: { metaTitle: 'Technical Resources — NRTech USA', metaDescription: 'Whitepapers, blogs, and downloadable specs.' } }, g)
  return {
    title: seo.title,
    description: seo.description,
    alternates: { canonical: absoluteUrl('/technical-library/resources') },
    robots: isStaging() ? { index: false, follow: false } : undefined,
    openGraph: { title: seo.title, description: seo.description, url: absoluteUrl('/technical-library/resources') },
  }
}
