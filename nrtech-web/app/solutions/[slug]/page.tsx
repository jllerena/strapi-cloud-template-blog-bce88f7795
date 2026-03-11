import { getSolutionBySlug, assetUrl } from '@/lib/strapi'
import { pickSeo, absoluteUrl, isStaging } from '@/lib/seo'
import type { Metadata } from 'next'
import Breadcrumbs from '@/components/Breadcrumbs'
import Image from 'next/image'
import { isStaging } from '@/lib/seo'
import { notFound } from 'next/navigation'

type Props = { params: { slug: string } }

export default async function Page({ params }: Props) {
  const data = await getSolutionBySlug(params.slug)
  const it = data?.data?.[0]
  if (!it) return notFound()
  const hero = it.attributes.hero
  const summary = it.attributes.summary
  const benefits = it.attributes.benefits || []
  const cta = it.attributes.primaryCta
  return (
    <>
      <Breadcrumbs items={[{ name: 'Home', href: '/' }, { name: 'Solutions', href: '/solutions' }, { name: it.attributes.title }]} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({ '@context': 'https://schema.org', '@type': 'BreadcrumbList', itemListElement: [ { '@type': 'ListItem', position: 1, name: 'Home', item: absoluteUrl('/') }, { '@type': 'ListItem', position: 2, name: 'Solutions', item: absoluteUrl('/solutions') }, { '@type': 'ListItem', position: 3, name: it.attributes.title, item: absoluteUrl(`/solutions/${it.attributes.slug}`) } ] }) }} />
      <section className="hero">
        <div className="container">
          {hero?.image?.data?.attributes?.url ? (
            <Image src={assetUrl(hero.image.data.attributes.url)!} alt={hero?.image?.data?.attributes?.alternativeText || hero?.title || it.attributes.title} width={1200} height={600} sizes="(max-width: 1200px) 100vw, 1200px" placeholder="blur" blurDataURL="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR4nGNgYAAAAAMAASsJTYQAAAAASUVORK5CYII=" style={{ width: '100%', height: 'auto', borderRadius: 12, marginBottom: 16 }} priority />
          ) : null}
          <h1>{hero?.title || it.attributes.title}</h1>
          <p>{hero?.subtitle || ''}</p>
        </div>
      </section>
      <section className="section">
        <div className="container">
          {summary ? (
            <div dangerouslySetInnerHTML={{ __html: summary }} />
          ) : null}
        </div>
      </section>
      <section className="section">
        <div className="container">
          <h2>Key Benefits</h2>
          <div className="grid grid-3">
            {(benefits.length ? benefits : []).map((b: any, i: number) => (
              <div key={i} className="card"><h3>{b.title}</h3><p>{b.description}</p></div>
            ))}
          </div>
          {cta?.ctaUrl ? (
            <div className="actions" style={{ marginTop: 16 }}>
              <a className="btn btn-primary" href={cta.ctaUrl}>{cta?.ctaLabel || 'Schedule Scoping Call'}</a>
            </div>
          ) : null}
        </div>
      </section>
    </>
  )
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const [sRes, gRes] = await Promise.all([
    fetch(`${process.env.STRAPI_URL || 'http://localhost:1337'}/api/solutions?filters[slug][$eq]=${encodeURIComponent(params.slug)}&populate=*`, { next: { revalidate: 120 } }).then(r=>r.json()).catch(()=>({})),
    fetch(`${process.env.STRAPI_URL || 'http://localhost:1337'}/api/global?populate=*`, { next: { revalidate: 120 } }).then(r=>r.json()).catch(()=>({})),
  ])
  const a = sRes?.data?.[0]?.attributes
  const g = gRes?.data?.attributes
  const seo = pickSeo(a, g)
  return {
    title: seo.title,
    description: seo.description,
    alternates: { canonical: absoluteUrl(`/solutions/${params.slug}`) },
    robots: isStaging() ? { index: false, follow: false } : undefined,
    openGraph: { title: seo.title, description: seo.description, url: absoluteUrl(`/solutions/${params.slug}`), images: seo.imageUrl ? [{ url: seo.imageUrl }] : undefined },
    twitter: { card: 'summary_large_image', title: seo.title, description: seo.description, images: seo.imageUrl ? [seo.imageUrl] : undefined },
  }
}
