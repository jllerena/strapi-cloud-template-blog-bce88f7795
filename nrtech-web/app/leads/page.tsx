import type { Metadata } from 'next'

const HUBSPOT_TOKEN = process.env.HUBSPOT_PRIVATE_APP_TOKEN || ''
const PORTAL_ID = process.env.NEXT_PUBLIC_HUBSPOT_PORTAL_ID || ''

export const metadata: Metadata = { title: 'Leads — NRTech USA' }

async function hs(path: string) {
  if (!HUBSPOT_TOKEN) return null
  const res = await fetch(`https://api.hubapi.com${path}`, { headers: { Authorization: `Bearer ${HUBSPOT_TOKEN}` }, next: { revalidate: 60 } })
  if (!res.ok) return null
  return res.json()
}

export default async function Page() {
  const data = await hs('/crm/v3/objects/contacts?limit=20&properties=email,firstname,lastname,phone,company&sort=-createdate')
  const items = data?.results || []
  return (
    <section className="section">
      <div className="container">
        <h1>Recent Leads</h1>
        {!HUBSPOT_TOKEN && <p style={{ color: 'crimson' }}>HubSpot token missing. Set HUBSPOT_PRIVATE_APP_TOKEN in .env.local</p>}
        <table className="table" style={{ marginTop: 12 }}>
          <thead><tr><th>Name</th><th>Email</th><th>Company</th><th>Phone</th><th>HubSpot</th></tr></thead>
          <tbody>
            {items.map((it: any) => {
              const p = it.properties || {}
              const name = [p.firstname, p.lastname].filter(Boolean).join(' ') || '(no name)'
              const contactLink = PORTAL_ID ? `https://app.hubspot.com/contacts/${PORTAL_ID}/record/0-1/${it.id}` : undefined
              return (
                <tr key={it.id}><td>{name}</td><td>{p.email}</td><td>{p.company}</td><td>{p.phone}</td><td>{contactLink ? <a href={contactLink} target="_blank" rel="noreferrer">Open</a> : '-'}</td></tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </section>
  )
}

