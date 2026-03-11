import { STRAPI_URL } from './strapi'

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'

export function pickSeo(a?: any, g?: any) {
  const s = a?.seo || g?.defaultSeo || {}
  const title = s?.metaTitle || g?.siteName || 'NRTech USA'
  const description = s?.metaDescription || ''
  const ogImage = s?.shareImage?.data?.attributes?.url
  const imageUrl = ogImage ? (ogImage.startsWith('http') ? ogImage : `${STRAPI_URL}${ogImage}`) : undefined
  return { title, description, imageUrl }
}

export function absoluteUrl(pathname: string) {
  try {
    return new URL(pathname, SITE_URL).toString()
  } catch {
    return SITE_URL
  }
}

export function isStaging() {
  const env = process.env.NEXT_PUBLIC_ENV || ''
  const site = SITE_URL
  return env.toLowerCase() === 'staging' || site.includes('localhost')
}
