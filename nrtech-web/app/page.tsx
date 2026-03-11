import { getHomepage, assetUrl } from '@/lib/strapi'
import Link from 'next/link'
import Image from 'next/image'
import Carousel from '@/components/Carousel'
import { pickSeo, absoluteUrl, isStaging } from '@/lib/seo'
import type { Metadata } from 'next'

export default async function Page() {
  const data = await getHomepage()
  const globalRes = await fetch(`${process.env.STRAPI_URL || 'http://localhost:1337'}/api/global?populate=*`, { next: { revalidate: 120 } }).then(r=>r.json()).catch(()=>({}))
  const hero = data?.data?.attributes?.hero
  const rows = data?.data?.attributes?.comparisonRows || []
  const personas = data?.data?.attributes?.personas || []
  const metrics = data?.data?.attributes?.metrics || []
  const testimonials = (data?.data?.attributes?.testimonials || []).map((t: any) => ({
    quote: t?.quote,
    attribution: t?.attribution,
  }))
  const lead = data?.data?.attributes?.leadMagnet
  const leadUrl: string | undefined = assetUrl(lead?.file?.data?.attributes?.url)
  return (
    <>
      <section className="hero">
        <div className="container">
          {hero?.image?.data?.attributes?.url ? (
            <Image src={assetUrl(hero.image.data.attributes.url)!} alt={hero?.image?.data?.attributes?.alternativeText || hero?.title || 'Hero'} width={1200} height={600} sizes="(max-width: 1200px) 100vw, 1200px" placeholder="blur" blurDataURL="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR4nGNgYAAAAAMAASsJTYQAAAAASUVORK5CYII=" style={{ width: '100%', height: 'auto', borderRadius: 12, marginBottom: 16 }} priority />
          ) : null}
          <h1>{hero?.title || 'Advanced Lubricant Additives, Without the Corporate Runaround'}</h1>
          <p>{hero?.subtitle || 'Custom-formulated, high-performance additives with 48-hour technical response, 4-6 week delivery, and 10-15% cost savings. Built for the mid-market.'}</p>
          <div className="actions">
            <Link className="btn btn-primary" href={hero?.primaryCtaUrl || '/schedule'}>{hero?.primaryCtaLabel || 'Schedule Your Free 30-Minute Formulation Consultation'}</Link>
            <Link className="btn btn-secondary" href={hero?.secondaryCtaUrl || '/technical-library'}>{hero?.secondaryCtaLabel || 'Download: Bio-Based Additives Compliance Guide'}</Link>
          </div>
        </div>
      </section>
      <section className="section">
        <div className="container">
          <h2>The NRTech Difference vs. Major Suppliers</h2>
          <p className="sub">Clear advantages for mid-market volumes</p>
          <table className="table">
            <thead>
              <tr>
                <th>Factor</th>
                <th>NRTech USA</th>
                <th>Major Suppliers</th>
              </tr>
            </thead>
            <tbody>
              {(rows.length ? rows : [
                { factor: 'Technical Response', nrtech: '48 hours', majors: '5-14 days' },
                { factor: 'Custom Formulation', nrtech: '4-6 weeks', majors: '12-20 weeks' },
                { factor: 'Minimum Order', nrtech: '20kg / 10,000 gal', majors: '5,000kg+ / 100,000 gal+' },
                { factor: 'Pricing', nrtech: '10-15% below majors', majors: 'Premium (12-20% increases 2024-25)' },
                { factor: 'Technical Support', nrtech: 'Direct PhD access', majors: 'Sales rep layers' },
              ]).map((r: any, i: number) => (
                <tr key={i}><td>{r.factor}</td><td>{r.nrtech}</td><td>{r.majors}</td></tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
      <section className="section">
        <div className="container">
          <h2>Who We Serve</h2>
          <div className="grid grid-3">
            {(personas.length ? personas : [
              { title: 'Regional Blenders', description: '50k-500k gallons/year with flexible MOQs and custom services.' },
              { title: 'Bio‑Based Innovators', description: 'NSF/Ecolabel compliance with high performance and sustainability.' },
              { title: 'Aftermarket Brands', description: 'Private label manufacturing and rapid market launch support.' },
            ]).map((p: any, i: number) => (
              <div key={i} className="card">
                {p?.icon?.data?.attributes?.url ? (
                  <img className="icon" src={assetUrl(p.icon.data.attributes.url)} alt={p.title} />
                ) : null}
                <h3>{p.title}</h3>
                <p>{p.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
      <section className="section">
        <div className="container">
          <h2>Trusted by North American Blenders & Manufacturers</h2>
          <div className="metrics">
            {(metrics.length ? metrics : [
              { value: '18% Average Cost Reduction', label: 'Custom hydraulic package' },
              { value: '40% Wear Reduction', label: 'Measured improvement' },
              { value: '48‑Hour Response', label: 'Guaranteed' },
            ]).map((m: any, i: number) => (
              <div key={i} className="metric"><div className="num">{m.value}</div><div className="label">{m.label}</div></div>
            ))}
          </div>
          <Carousel items={
            testimonials.length ? testimonials : [
              { quote: 'NRTech delivered a custom formulation in 5 weeks that reduced wear by 40%.', attribution: 'Regional Blender, Midwest USA' },
              { quote: 'We achieved NSF H1 compliance on first submission. Clear technical partnership.', attribution: 'Food‑Grade Manufacturer' },
              { quote: 'Cost down 18% without performance trade‑offs. Rapid technical support.', attribution: 'Industrial OEM' },
            ]
          } />
        </div>
      </section>
      <section className="section">
        <div className="container">
          <h2>Recent Case Studies</h2>
          <div className="grid grid-3">
            <div className="card"><h3>Hydraulic Additive Package</h3><p>18% cost savings with tailored chemistry.</p><a className="btn btn-secondary" href="/technical-library#case-hydraulic">Read</a></div>
            <div className="card"><h3>NSF H1 Compliance</h3><p>Food‑grade lubricant passed on first submission.</p><a className="btn btn-secondary" href="/technical-library#case-nsf">Read</a></div>
            <div className="card"><h3>Bio‑Based Winterization</h3><p>Cold flow improver solved biodiesel issues.</p><a className="btn btn-secondary" href="/technical-library#case-winter">Read</a></div>
          </div>
        </div>
      </section>
      <section className="section">
        <div className="container lead-cta">
          <h3>{lead?.title || 'Download: The Ultimate Guide to Bio‑Based Lubricant Additives in 2025'}</h3>
          <p>{lead?.description || 'Gated PDF with technical insights and compliance guidance.'}</p>
          <a className="btn btn-primary" href={leadUrl || '/technical-library'}>{lead ? 'Get the PDF' : 'View Guide'}</a>
        </div>
      </section>
    </>
  )
}

export async function generateMetadata(): Promise<Metadata> {
  const [homeRes, gRes] = await Promise.all([
    fetch(`${process.env.STRAPI_URL || 'http://localhost:1337'}/api/homepage?populate=*`, { next: { revalidate: 120 } }).then(r=>r.json()).catch(()=>({})),
    fetch(`${process.env.STRAPI_URL || 'http://localhost:1337'}/api/global?populate=*`, { next: { revalidate: 120 } }).then(r=>r.json()).catch(()=>({})),
  ])
  const a = homeRes?.data?.attributes
  const g = gRes?.data?.attributes
  const seo = pickSeo(a, g)
  return {
    title: seo.title,
    description: seo.description,
    alternates: { canonical: absoluteUrl('/') },
    robots: isStaging() ? { index: false, follow: false } : undefined,
    openGraph: { title: seo.title, description: seo.description, url: absoluteUrl('/'), images: seo.imageUrl ? [{ url: seo.imageUrl }] : undefined },
    twitter: { card: 'summary_large_image', title: seo.title, description: seo.description, images: seo.imageUrl ? [seo.imageUrl] : undefined },
  }
}
