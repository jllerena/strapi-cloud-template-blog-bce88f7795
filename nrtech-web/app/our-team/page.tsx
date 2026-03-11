import type { Metadata } from 'next'
import { assetUrl, getTeam } from '@/lib/strapi'
import Image from 'next/image'

export const metadata: Metadata = { title: 'Our Team — NRTech USA' }

export default async function Page() {
  const res = await getTeam()
  const hasData = !!res?.data
  const members = Array.isArray(res?.data?.attributes?.members) ? res.data.attributes.members : []
  return (
    <section className="section">
      <div className="container">
        <h1>Our Team</h1>
        {!hasData && (
          <p className="sub">Unable to load team data. Check Strapi URL configuration and permissions.</p>
        )}
        {hasData && members.length === 0 && (
          <p className="sub">No team members found. Ensure the Team single type has members and public permissions allow reading.</p>
        )}
        <div className="grid grid-3" style={{ marginTop: 12 }}>
          {members.map((m: any, i: number) => {
            const p = m?.photo?.data?.attributes
            const url = p?.url ? assetUrl(p.url)! : undefined
            const alt = p?.alternativeText || m?.name || 'Team member'
            return (
              <div key={i} className="card">
                {url ? <Image src={url} alt={alt} width={400} height={300} style={{ width: '100%', height: 'auto' }} /> : null}
                <h3>{m?.name || '(Name)'}</h3>
                <p>{m?.title || ''}</p>
                <p>{m?.bio || ''}</p>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
