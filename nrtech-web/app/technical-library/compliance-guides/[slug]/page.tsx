import { assetUrl, getComplianceGuideBySlug } from '@/lib/strapi'
import { notFound } from 'next/navigation'
import Breadcrumbs from '@/components/Breadcrumbs'
import { absoluteUrl } from '@/lib/seo'

type Props = { params: { slug: string } }

export default async function Page({ params }: Props) {
  const data = await getComplianceGuideBySlug(params.slug)
  const it = data?.data?.[0]
  if (!it) return notFound()
  const a = it.attributes
  const files = a.downloads?.data || []
  return (
    <>
      <Breadcrumbs items={[{ name: 'Home', href: '/' }, { name: 'Technical Library', href: '/technical-library' }, { name: 'Compliance Guides', href: '/technical-library/compliance-guides' }, { name: a.title }]} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({ '@context': 'https://schema.org', '@type': 'BreadcrumbList', itemListElement: [ { '@type': 'ListItem', position: 1, name: 'Home', item: absoluteUrl('/') }, { '@type': 'ListItem', position: 2, name: 'Technical Library', item: absoluteUrl('/technical-library') }, { '@type': 'ListItem', position: 3, name: 'Compliance Guides', item: absoluteUrl('/technical-library/compliance-guides') }, { '@type': 'ListItem', position: 4, name: a.title, item: absoluteUrl(`/technical-library/compliance-guides/${a.slug}`) } ] }) }} />
      <section className="hero">
        <div className="container">
          <h1>{a.title}</h1>
          <p>{a.status ? `${a.status}${a.progress ? ` — ${a.progress}%` : ''}` : ''}</p>
        </div>
      </section>
      <section className="section">
        <div className="container">
          {a.body ? <div dangerouslySetInnerHTML={{ __html: a.body }} /> : null}
          {files.length ? (
            <div style={{ marginTop: 16 }}>
              <h3>Downloads</h3>
              <ul>
                {files.map((f: any) => (
                  <li key={f.id}><a href={assetUrl(f.attributes.url)} target="_blank" rel="noreferrer">{f.attributes.name || f.attributes.url}</a></li>
                ))}
              </ul>
            </div>
          ) : null}
        </div>
      </section>
    </>
  )
}
