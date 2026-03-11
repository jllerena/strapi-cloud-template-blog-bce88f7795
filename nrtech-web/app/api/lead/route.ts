import { NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'

function readTokenFallback() {
  try {
    const p = path.join(process.cwd(), '..', '.env')
    if (!fs.existsSync(p)) return ''
    const txt = fs.readFileSync(p, 'utf8')
    const lines = txt.split(/\r?\n/)
    for (const line of lines) {
      if (line.startsWith('HUBSPOT_PRIVATE_APP_TOKEN=')) return line.split('=')[1].trim()
      if (line.startsWith('HUBSPOT_PRIVATE_APP_KEY=')) return line.split('=')[1].trim()
    }
    return ''
  } catch {
    return ''
  }
}

const HUBSPOT_TOKEN = process.env.HUBSPOT_PRIVATE_APP_TOKEN || process.env.HUBSPOT_PRIVATE_APP_KEY || readTokenFallback() || ''
const DEV = process.env.NODE_ENV !== 'production'

async function hsFetch(url: string, init: RequestInit) {
  const headers = {
    Authorization: `Bearer ${HUBSPOT_TOKEN}`,
    'Content-Type': 'application/json',
    ...(init.headers as any),
  }
  const res = await fetch(url, { ...init, headers })
  let body: any = null
  try {
    body = await res.json()
  } catch {}
  if (!res.ok && DEV) {
    // Log status and error body for debugging; never log token
    console.error('HubSpot error', res.status, body || (await res.text()).slice(0, 500))
  }
  return { ok: res.ok, status: res.status, body }
}

type FetchResult = { ok: boolean; status: number; body: any }

async function createContactMinimal(email: string, firstname?: string, lastname?: string): Promise<{ id?: string; last?: FetchResult }> {
  const props: Record<string, any> = { email }
  if (firstname) props.firstname = firstname
  if (lastname) props.lastname = lastname
  const r = await hsFetch('https://api.hubapi.com/crm/v3/objects/contacts', {
    method: 'POST',
    body: JSON.stringify({ properties: props }),
  })
  if (r.ok) return { id: r.body?.id as string | undefined, last: r }
  return { last: r }
}

async function searchContactByEmail(email: string) {
  const r = await hsFetch('https://api.hubapi.com/crm/v3/objects/contacts/search', {
    method: 'POST',
    body: JSON.stringify({
      filterGroups: [{ filters: [{ propertyName: 'email', operator: 'EQ', value: email }] }],
      properties: ['email'],
      limit: 1,
    }),
  })
  if (r.ok) return r.body?.results?.[0]?.id as string | undefined
  return undefined
}

async function createNote(text: string, title?: string) {
  const r = await hsFetch('https://api.hubapi.com/crm/v3/objects/notes', {
    method: 'POST',
    body: JSON.stringify({ properties: { hs_note_body: text, hs_timestamp: Date.now(), ...(title ? { hs_note_title: title } : {}) } }),
  })
  if (r.ok) return r.body?.id as string | undefined
  return undefined
}

async function associateNoteToContact(noteId: string, contactId: string) {
  const r = await hsFetch('https://api.hubapi.com/crm/v3/associations/note/contact/batch/create', {
    method: 'POST',
    body: JSON.stringify({ inputs: [{ from: { id: noteId }, to: { id: contactId }, type: 'note_to_contact' }] }),
  })
  return r.ok
}

async function searchCompanyByName(name: string) {
  const r = await hsFetch('https://api.hubapi.com/crm/v3/objects/companies/search', {
    method: 'POST',
    body: JSON.stringify({
      filterGroups: [{ filters: [{ propertyName: 'name', operator: 'EQ', value: name }] }],
      properties: ['name'],
      limit: 1,
    }),
  })
  if (r.ok) return r.body?.results?.[0]?.id as string | undefined
  return undefined
}

async function createCompany(name: string) {
  const r = await hsFetch('https://api.hubapi.com/crm/v3/objects/companies', {
    method: 'POST',
    body: JSON.stringify({ properties: { name } }),
  })
  if (r.ok) return r.body?.id as string | undefined
  return undefined
}

async function associateContactToCompany(contactId: string, companyId: string) {
  const r = await hsFetch('https://api.hubapi.com/crm/v3/associations/contact/company/batch/create', {
    method: 'POST',
    body: JSON.stringify({ inputs: [{ from: { id: contactId }, to: { id: companyId }, type: 'contact_to_company' }] }),
  })
  return r.ok
}

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const {
      name = '',
      company = '',
      email = '',
      phone = '',
      title = '',
      volume = '',
      interest = '',
      message = '',
      source = 'website',
      context = 'general',
    } = body || {}

    if (!HUBSPOT_TOKEN) {
      return NextResponse.json({ ok: false, error: 'missing_hubspot_token', error_code: 'missing_hubspot_token' }, { status: 500 })
    }
    if (!email) {
      return NextResponse.json({ ok: false, error: 'email_required', error_code: 'email_required' }, { status: 400 })
    }

    const [firstname, ...rest] = String(name).trim().split(' ')
    const lastname = rest.join(' ') || ' '

    // Upsert contact with minimal properties to avoid property validation issues
    let lastErr: FetchResult | undefined
    let res1 = await createContactMinimal(email, firstname, lastname)
    let contactId: string | undefined = res1.id
    if (!contactId) lastErr = res1.last
    if (!contactId) contactId = await searchContactByEmail(email)
    if (!contactId) {
      const res2 = await createContactMinimal(email)
      contactId = res2.id
      if (!contactId) lastErr = res2.last
    }
    if (!contactId) {
      return NextResponse.json({ ok: false, error: 'contact_create_failed', error_code: 'contact_create_failed', hubspot_status: lastErr?.status, hubspot_error: lastErr?.body }, { status: 502 })
    }

    // Create a note with full context and associate to contact
    const noteText = `Lead (${context})\n\nCompany: ${company}\nPhone: ${phone}\nTitle: ${title}\nVolume: ${volume}\nInterest: ${interest}\nSource: ${source}\n\nMessage:\n${message}`
    const noteId = await createNote(noteText, `Website Lead — ${context}`)
    if (!noteId) {
      return NextResponse.json({ ok: false, error: 'note_create_failed', error_code: 'note_create_failed' }, { status: 502 })
    }
    const associated = await associateNoteToContact(noteId, contactId)
    if (!associated) {
      return NextResponse.json({ ok: false, error: 'association_failed', error_code: 'association_failed' }, { status: 502 })
    }

    let companyId: string | undefined
    let companyAssociation: boolean | undefined
    if (company && company.trim()) {
      companyId = await searchCompanyByName(company.trim())
      if (!companyId) companyId = await createCompany(company.trim())
      if (companyId) companyAssociation = await associateContactToCompany(contactId, companyId)
      // Also associate the note to the company so it appears on both timelines
      if (companyId && noteId) {
        await hsFetch('https://api.hubapi.com/crm/v3/associations/note/company/batch/create', {
          method: 'POST',
          body: JSON.stringify({ inputs: [{ from: { id: noteId }, to: { id: companyId }, type: 'note_to_company' }] }),
        })
      }
    }

    return NextResponse.json({ ok: true, contactId, noteId, companyId, companyAssociation })
  } catch (e) {
    return NextResponse.json({ ok: false, error: 'unexpected', error_code: 'unexpected' }, { status: 500 })
  }
}
