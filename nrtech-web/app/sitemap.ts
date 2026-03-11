import type { MetadataRoute } from 'next'

const S = process.env.STRAPI_URL || 'http://localhost:1337'
const BASE = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'

async function getSlugs(path: string) {
  try {
    const r = await fetch(`${S}${path}`, { next: { revalidate: 300 } })
    const j = await r.json()
    return (j?.data || []).map((d: any) => d?.attributes?.slug).filter(Boolean)
  } catch {
    return []
  }
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [solutions, cs, res, cg] = await Promise.all([
    getSlugs('/api/solutions?fields[0]=slug&pagination[pageSize]=100'),
    getSlugs('/api/case-studies?fields[0]=slug&pagination[pageSize]=100'),
    getSlugs('/api/technical-resources?fields[0]=slug&pagination[pageSize]=100'),
    getSlugs('/api/compliance-guides?fields[0]=slug&pagination[pageSize]=100'),
  ])
  const now = new Date()
  const staticPages = ['/', '/why-nrtech', '/solutions', '/technical-library', '/schedule', '/tools/friction-calculator', '/tools/cold-flow-calculator']
  const dynamicPages = [
    ...solutions.map((s) => `/solutions/${s}`),
    ...cs.map((s) => `/technical-library/case-studies/${s}`),
    ...res.map((s) => `/technical-library/resources/${s}`),
    ...cg.map((s) => `/technical-library/compliance-guides/${s}`),
  ]
  return [...staticPages, ...dynamicPages].map((p) => ({ url: `${BASE}${p}`, lastModified: now }))
}
