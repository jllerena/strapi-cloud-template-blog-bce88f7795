import { getWhy } from '@/lib/strapi'
import { pickSeo, absoluteUrl, isStaging } from '@/lib/seo'
import type { Metadata } from 'next'
import Image from 'next/image'

export default async function Page() {
  const data = await getWhy()
  const hero = data?.data?.attributes?.hero
  const problem = data?.data?.attributes?.problem
  const story = data?.data?.attributes?.story
  const advantages = data?.data?.attributes?.advantages || []
  return (
    <>
      <section className="hero">
        <div className="container">
          {hero?.image?.data?.attributes?.url ? (
            <Image src={hero.image.data.attributes.url} alt={hero?.image?.data?.attributes?.alternativeText || hero?.title || 'Hero'} width={1200} height={600} sizes="(max-width: 1200px) 100vw, 1200px" placeholder="blur" blurDataURL="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR4nGNgYAAAAAMAASsJTYQAAAAASUVORK5KYII=" style={{ width: '100%', height: 'auto', borderRadius: 12, marginBottom: 16 }} priority />
          ) : null}
          <h1>{hero?.title || 'Built for the Mid‑Market'}</h1>
          <p>{hero?.subtitle || 'You are underserved by majors and ill‑fit by commodity suppliers. We designed NRTech for you.'}</p>
        </div>
      </section>
      <section className="section">
        <div className="container">
          <h2>The Problem</h2>
          <div className="card"><p>{problem || 'You are stuck between commodity suppliers with inconsistent quality and major players who won’t take your call for orders under 100,000 gallons.'}</p></div>
        </div>
      </section>
      <section className="section">
        <div className="container">
          <h2>Our Story</h2>
          <div className="card"><p>{story || 'NRTech exists to serve the mid‑market with custom formulations, fast response, and cost‑competitive supply.'}</p></div>
        </div>
      </section>
      <section className="section">
        <div className="container">
          <h2>The NRTech Advantage</h2>
          <div className="grid grid-3">
            {(advantages.length ? advantages : [
              { title: 'Cost‑Competitive', description: 'India supply chain advantage of 15‑25%.' },
              { title: 'Custom & Flexible', description: 'Tailored solutions with realistic MOQs.' },
              { title: 'Rapid Response', description: '48‑hour technical response guarantee.' },
            ]).map((a: any, i: number) => (
              <div key={i} className="card">
                {a?.icon?.data?.attributes?.url ? (
                  <img className="feature-icon" src={a.icon.data.attributes.url} alt={a.title} />
                ) : null}
                <h3>{a.title}</h3>
                <p>{a.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
      <section className="section" id="team">
        <div className="container">
          <h2>Team Credentials</h2>
          <div className="grid grid-3">
            <div className="card"><h3>Chief Technical Officer</h3><p>PhD Chemistry, 20+ years, problem‑solving focus.</p></div>
            <div className="card"><h3>Senior Formulation Chemist</h3><p>NSF, Ecolabel expertise, high‑performance additives.</p></div>
            <div className="card"><h3>Quality Control Director</h3><p>Rigorous testing and data transparency.</p></div>
          </div>
          <div className="actions" style={{ marginTop: 14 }}>
            <a className="btn btn-primary" href="/technical-library#case-studies">See Case Studies</a>
          </div>
        </div>
      </section>
    </>
  )
}

export async function generateMetadata(): Promise<Metadata> {
  const [wRes, gRes] = await Promise.all([
    fetch(`${process.env.STRAPI_URL || 'http://localhost:1337'}/api/why-nrtech?populate=*`, { next: { revalidate: 120 } }).then(r=>r.json()).catch(()=>({})),
    fetch(`${process.env.STRAPI_URL || 'http://localhost:1337'}/api/global?populate=*`, { next: { revalidate: 120 } }).then(r=>r.json()).catch(()=>({})),
  ])
  const a = wRes?.data?.attributes
  const g = gRes?.data?.attributes
  const seo = pickSeo(a, g)
  return {
    title: seo.title,
    description: seo.description,
    alternates: { canonical: absoluteUrl('/why-nrtech') },
    robots: isStaging() ? { index: false, follow: false } : undefined,
    openGraph: { title: seo.title, description: seo.description, url: absoluteUrl('/why-nrtech'), images: seo.imageUrl ? [{ url: seo.imageUrl }] : undefined },
    twitter: { card: 'summary_large_image', title: seo.title, description: seo.description, images: seo.imageUrl ? [seo.imageUrl] : undefined },
  }
}
