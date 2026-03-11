import Link from 'next/link'
import { absoluteUrl, pickSeo, isStaging } from '@/lib/seo'
import type { Metadata } from 'next'

export default async function Page() {
  return (
    <section className="section">
      <div className="container">
        <h1>Technical Library</h1>
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({ '@context': 'https://schema.org', '@type': 'BreadcrumbList', itemListElement: [ { '@type': 'ListItem', position: 1, name: 'Home', item: absoluteUrl('/') }, { '@type': 'ListItem', position: 2, name: 'Technical Library', item: absoluteUrl('/technical-library') } ] }) }} />
        <div className="grid grid-3" style={{ marginTop: 12 }}>
          <div className="card">
            <h3>Case Studies</h3>
            <p>Detailed, anonymized results from real projects.</p>
            <Link className="btn btn-secondary" href="/technical-library/case-studies">View</Link>
          </div>
          <div className="card">
            <h3>Technical Resources</h3>
            <p>Whitepapers, blog and downloadable specs.</p>
            <Link className="btn btn-secondary" href="/technical-library/resources">View</Link>
          </div>
          <div className="card">
            <h3>Compliance Guides</h3>
            <p>NSF, API, ISO progress and guidance.</p>
            <Link className="btn btn-secondary" href="/technical-library/compliance-guides">View</Link>
          </div>
          <div className="card" id="tools">
            <h3>Tools</h3>
            <p>Interactive calculators to support technical decision-making.</p>
            <div className="actions" style={{ gap: 8 }}>
              <Link className="btn btn-secondary" href="/tools/friction-calculator">Friction Calculator</Link>
              <Link className="btn btn-secondary" href="/tools/cold-flow-calculator">Cold Flow Calculator</Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

export async function generateMetadata(): Promise<Metadata> {
  const gRes = await fetch(`${process.env.STRAPI_URL || 'http://localhost:1337'}/api/global?populate=*`, { next: { revalidate: 120 } }).then(r=>r.json()).catch(()=>({}))
  const g = gRes?.data?.attributes
  const seo = pickSeo({ seo: { metaTitle: 'Technical Library — NRTech USA', metaDescription: 'Case studies, resources and compliance guides.' } }, g)
  return {
    title: seo.title,
    description: seo.description,
    alternates: { canonical: absoluteUrl('/technical-library') },
    robots: isStaging() ? { index: false, follow: false } : undefined,
    openGraph: { title: seo.title, description: seo.description, url: absoluteUrl('/technical-library') },
  }
}
