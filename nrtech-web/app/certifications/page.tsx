import type { Metadata } from 'next'
import { STRAPI_URL } from '@/lib/strapi'

export const metadata: Metadata = { title: 'Certifications — NRTech USA' }

export default async function Page() {
  const res = await fetch(`${STRAPI_URL}/api/compliance-status`, { next: { revalidate: 120 } }).then(r=>r.json()).catch(()=>({}))
  const a = res?.data?.attributes || {}
  const items = [
    { label: 'NSF H1 Certification', status: a.nsfStatus, progress: a.nsfProgress },
    { label: 'API Licensing', status: a.apiStatus, progress: a.apiProgress },
    { label: 'ISO 9001:2015', status: a.isoStatus, progress: a.isoProgress },
  ]
  return (
    <section className="section">
      <div className="container">
        <h1>Certifications</h1>
        <div style={{ display: 'grid', gap: 16, marginTop: 12 }}>
          {items.map((it, i) => (
            <div key={i} className="card">
              <h3>{it.label}</h3>
              <p>{it.status || ''}</p>
              {typeof it.progress === 'number' ? (
                <div style={{ background: '#eee', borderRadius: 8, overflow: 'hidden', height: 10 }}>
                  <div style={{ width: `${Math.max(0, Math.min(100, it.progress))}%`, background: '#1E3A5F', height: 10 }} />
                </div>
              ) : null}
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
