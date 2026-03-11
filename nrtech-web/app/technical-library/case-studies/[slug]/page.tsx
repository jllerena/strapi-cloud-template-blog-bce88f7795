import { assetUrl, getCaseStudyBySlug } from '@/lib/strapi'
import Breadcrumbs from '@/components/Breadcrumbs'
import { absoluteUrl } from '@/lib/seo'
import Image from 'next/image'
import { notFound } from 'next/navigation'

type Props = { params: { slug: string } }

export default async function Page({ params }: Props) {
  const data = await getCaseStudyBySlug(params.slug)
  const it = data?.data?.[0]
  if (!it) return notFound()
  const a = it.attributes
  const metrics = a.metrics || []
  return (
    <>
      <Breadcrumbs items={[{ name: 'Home', href: '/' }, { name: 'Technical Library', href: '/technical-library' }, { name: 'Case Studies', href: '/technical-library/case-studies' }, { name: a.title }]} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({ '@context': 'https://schema.org', '@type': 'BreadcrumbList', itemListElement: [ { '@type': 'ListItem', position: 1, name: 'Home', item: absoluteUrl('/') }, { '@type': 'ListItem', position: 2, name: 'Technical Library', item: absoluteUrl('/technical-library') }, { '@type': 'ListItem', position: 3, name: 'Case Studies', item: absoluteUrl('/technical-library/case-studies') }, { '@type': 'ListItem', position: 4, name: a.title, item: absoluteUrl(`/technical-library/case-studies/${a.slug}`) } ] }) }} />
      <section className="hero">
        <div className="container">
          {a?.cover?.data?.attributes?.url ? (
            <Image src={assetUrl(a.cover.data.attributes.url)!} alt={a.title} width={1200} height={600} sizes="(max-width: 1200px) 100vw, 1200px" placeholder="blur" blurDataURL="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR4nGNgYAAAAAMAASsJTYQAAAAASUVORK5CYII=" style={{ width: '100%', height: 'auto', borderRadius: 12, marginBottom: 16 }} />
          ) : null}
          <h1>{a.title}</h1>
          <p>{a.excerpt || ''}</p>
        </div>
      </section>
      <section className="section">
        <div className="container">
          {a.body ? <div dangerouslySetInnerHTML={{ __html: a.body }} /> : null}
          {metrics.length ? (
            <div className="metrics" style={{ marginTop: 16 }}>
              {metrics.map((m: any, i: number) => (
                <div key={i} className="metric"><div className="num">{m.value}</div><div className="label">{m.label}</div></div>
              ))}
            </div>
          ) : null}
        </div>
      </section>
    </>
  )
}
