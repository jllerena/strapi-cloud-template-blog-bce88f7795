import { LeadForm } from '@/components/LeadForm'

export default function Page() {
  return (
    <section className="section">
      <div className="container">
        <h1>Schedule Consultation</h1>
        <p>Tell us a bit about your application. We’ll follow up within 48 hours.</p>
        <LeadForm context="consultation" />
      </div>
    </section>
  )
}

