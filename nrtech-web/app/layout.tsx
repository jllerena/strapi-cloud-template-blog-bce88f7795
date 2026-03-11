import './globals.css'
import Link from 'next/link'
import type { ReactNode } from 'react'
import { getGlobal } from '@/lib/strapi'

export default async function RootLayout({ children }: { children: ReactNode }) {
  const g = await getGlobal()
  const ga = g?.data?.attributes || {}
  const nav = ga?.navigation || []
  const scheduleUrl = ga?.scheduleCtaUrl || '/schedule'
  const phone = ga?.contactPhone || '+1 (214) 212-6237'
  const email = ga?.contactEmail || 'sales@nrtechusa.co'
  const clarityId = process.env.NEXT_PUBLIC_CLARITY_ID
  const isProd = process.env.NODE_ENV === 'production'
  return (
    <html lang="en">
      <body>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;700&display=swap" rel="stylesheet" />
        {clarityId && isProd ? (
          <script
            dangerouslySetInnerHTML={{
              __html: `
              (function(c,l,a,r,i,t,y){
                c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};
                t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;
                y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);
              })(window, document, "clarity", "script", "${clarityId}");
            `,
            }}
          />
        ) : null}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'Organization',
              name: ga?.siteName || 'NRTech USA',
              url: process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000',
              contactPoint: [{ '@type': 'ContactPoint', telephone: phone, contactType: 'sales' }],
            }),
          }}
        />
        <header className="header">
          <div className="container nav">
            <a href="#main-content" className="skip-link">Skip to content</a>
            <Link className="logo" href="/"><span>{ga?.siteName || 'NRTech USA'}</span></Link>
            <nav className="nav-links" role="navigation" aria-label="Primary">
              {(nav.length ? nav : [
                { label: 'Solutions', href: '/solutions' },
                { label: 'Technical Library', href: '/technical-library' },
                { label: 'Why NRTech', href: '/why-nrtech' },
                { label: 'Certifications', href: '/certifications' },
                { label: 'Our Team', href: '/our-team' },
                { label: 'Tools', href: '/technical-library#tools' },
              ]).map((n: any, i: number) => (
                <Link key={i} href={n.href}>{n.label}</Link>
              ))}
              <Link className="cta" href={scheduleUrl}>Schedule Consultation</Link>
            </nav>
          </div>
        </header>
        <main id="main-content" role="main">{children}</main>
        <footer className="footer">
          <div className="container">
            <div className="actions" style={{ justifyContent: 'space-between' }}>
              <div>© {ga?.siteName || 'NRTech USA'}</div>
              <div className="actions">
                <a href={`tel:${phone}`}>{phone}</a>
                <a href={`mailto:${email}`}>{email}</a>
                <Link className="cta" href={scheduleUrl}>Schedule Consultation</Link>
              </div>
            </div>
          </div>
        </footer>
      </body>
    </html>
  )
}
