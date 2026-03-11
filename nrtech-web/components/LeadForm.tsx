"use client"
import { useState } from 'react'

type BaseProps = {
  context: string
  onSuccess?: () => void
  submitLabel?: string
}

export function LeadForm({ context, onSuccess, submitLabel = 'Submit' }: BaseProps) {
  const [loading, setLoading] = useState(false)
  const [ok, setOk] = useState(false)
  const [error, setError] = useState<string | null>(null)
  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    setError(null)
    const fd = new FormData(e.currentTarget)
    const payload = Object.fromEntries(fd.entries()) as any
    payload.context = context
    try {
      const r = await fetch('/api/lead', { method: 'POST', body: JSON.stringify(payload), headers: { 'Content-Type': 'application/json' } })
      const j = await r.json()
      if (r.ok && j.ok) {
        setOk(true)
        onSuccess?.()
      } else {
        setError(j?.error_code || j?.error || 'Something went wrong')
      }
    } catch (e) {
      setError('Network error')
    } finally {
      setLoading(false)
    }
  }
  return (
    <form onSubmit={onSubmit} className="card" style={{ marginTop: 12, display: 'grid', gap: 8 }} aria-label="Lead form">
      <div className="grid" style={{ gridTemplateColumns: '1fr 1fr', gap: 12 }}>
        <label>Name*<input name="name" aria-required="true" required /></label>
        <label>Company*<input name="company" aria-required="true" required /></label>
        <label>Email*<input name="email" type="email" aria-required="true" required /></label>
        <label>Phone<input name="phone" /></label>
        <label>Role/Title<input name="title" /></label>
        <label>Current Volume<input name="volume" /></label>
      </div>
      <label>Primary Interest<input name="interest" /></label>
      <label>Brief description<textarea name="message" rows={4} /></label>
      <div className="actions">
        <button className="btn btn-primary" disabled={loading} type="submit">{loading ? 'Sending…' : submitLabel}</button>
      </div>
      {ok && <div style={{ color: 'green' }}>Thanks! We will contact you shortly.</div>}
      {error && <div style={{ color: 'crimson' }}>Submission failed: {error}</div>}
    </form>
  )
}

export function LeadDownloadForm({ fileUrl, context }: { fileUrl: string; context: string }) {
  const [downloading, setDownloading] = useState(false)
  return (
    <LeadForm
      context={context}
      submitLabel={downloading ? 'Downloading…' : 'Submit & Download'}
      onSuccess={() => {
        setDownloading(true)
        window.location.href = fileUrl
      }}
    />
  )
}
