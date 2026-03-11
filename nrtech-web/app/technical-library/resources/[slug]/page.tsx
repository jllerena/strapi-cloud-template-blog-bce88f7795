import { assetUrl, getResourceBySlug } from '@/lib/strapi'
import { LeadDownloadForm } from '@/components/LeadForm'
import { notFound } from 'next/navigation'
import Breadcrumbs from '@/components/Breadcrumbs'
import { absoluteUrl } from '@/lib/seo'

type Props = { params: { slug: string } }

export default async function Page({ params }: Props) {
  const data = await getResourceBySlug(params.slug)
  const it = data?.data?.[0]
  if (!it) return notFound()
  const a = it.attributes
  const dl = a.file?.data?.attributes
  return (
    <>
      <Breadcrumbs items={[{ name: 'Home', href: '/' }, { name: 'Technical Library', href: '/technical-library' }, { name: 'Technical Resources', href: '/technical-library/resources' }, { name: a.title }]} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({ '@context': 'https://schema.org', '@type': 'BreadcrumbList', itemListElement: [ { '@type': 'ListItem', position: 1, name: 'Home', item: absoluteUrl('/') }, { '@type': 'ListItem', position: 2, name: 'Technical Library', item: absoluteUrl('/technical-library') }, { '@type': 'ListItem', position: 3, name: 'Technical Resources', item: absoluteUrl('/technical-library/resources') }, { '@type': 'ListItem', position: 4, name: a.title, item: absoluteUrl(`/technical-library/resources/${a.slug}`) } ] }) }} />
      <section className="hero">
        <div className="container">
          <h1>{a.title}</h1>
          <p>{a.excerpt || ''}</p>
        </div>
      </section>
      <section className="section">
        <div className="container">
          {a.body ? <div dangerouslySetInnerHTML={{ __html: a.body }} /> : null}
          {dl?.url ? (
            <div style={{ marginTop: 16 }}>
              <h3>Download</h3>
              <LeadDownloadForm fileUrl={assetUrl(dl.url)!} context={`resource:${a.slug}`} />
            </div>
          ) : null}
        </div>
      </section>
    </>
  )
}
