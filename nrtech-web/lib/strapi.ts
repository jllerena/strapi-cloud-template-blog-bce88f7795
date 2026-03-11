export const STRAPI_URL = (
  process.env.STRAPI_URL ||
  process.env.NEXT_PUBLIC_STRAPI_URL ||
  'http://localhost:1337'
).replace(/\/$/, '')
const DEV = process.env.NODE_ENV !== 'production'

async function fetchApi(path: string) {
  const url = `${STRAPI_URL}${path}`
  try {
    const init: any = {}
    if (DEV) init.cache = 'no-store'
    else init.next = { revalidate: 120 }
    const res = await fetch(url, init)
    if (DEV) console.log('[API]', url, res.status)
    if (res.status === 404) return {}
    if (!res.ok) {
      let body: any = null
      try { body = await res.json() } catch {}
      if (DEV) console.error('[API ERROR]', url, res.status, body)
      throw new Error(`Failed ${path}`)
    }
    const json = await res.json()
    if (DEV) console.log('[API OK]', url, Array.isArray(json?.data) ? `items=${json.data.length}` : 'single')
    return json
  } catch (e) {
    if (DEV) console.error('[API EXCEPTION]', url, e)
    return {}
  }
}

export function getHomepage() {
  return fetchApi('/api/homepage?populate=*')
}

export function getWhy() {
  return fetchApi('/api/why-nrtech?populate=*')
}

export function getSolutions() {
  return fetchApi('/api/solutions?populate=*&sort=title:asc')
}

export function getSolutionBySlug(slug: string) {
  return fetchApi(`/api/solutions?filters[slug][$eq]=${encodeURIComponent(slug)}&populate=*`)
}

export function assetUrl(url?: string) {
  if (!url) return undefined
  if (url.startsWith('http')) return url
  return `${STRAPI_URL}${url}`
}

export function getGlobal() {
  return fetchApi('/api/global?populate=*')
}

export function getTeam() {
  return fetchApi('/api/team?populate=*')
}

export function getCaseStudies() {
  return fetchApi('/api/case-studies?populate=*&sort=title:asc')
}

export function getCaseStudyBySlug(slug: string) {
  return fetchApi(`/api/case-studies?filters[slug][$eq]=${encodeURIComponent(slug)}&populate=*`)
}

export function getResources() {
  return fetchApi('/api/technical-resources?populate=*&sort=title:asc')
}

export function getResourceBySlug(slug: string) {
  return fetchApi(`/api/technical-resources?filters[slug][$eq]=${encodeURIComponent(slug)}&populate=*`)
}

export function getComplianceGuides() {
  return fetchApi('/api/compliance-guides?populate=*&sort=title:asc')
}

export function getComplianceGuideBySlug(slug: string) {
  return fetchApi(`/api/compliance-guides?filters[slug][$eq]=${encodeURIComponent(slug)}&populate=*`)
}
