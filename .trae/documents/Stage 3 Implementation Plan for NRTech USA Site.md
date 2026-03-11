## Objectives
- Refine visuals, finalize content population and accessibility, improve performance/SEO, and ready the site for production deployment.

## Visual Refinement
- Align typography, spacing, and color usage across Home, Why NRTech, Solutions, Library, Tools, and Leads.
- Standardize components: hero sections, cards, tables, metrics, testimonials, CTAs.
- Enhance navigation: add Tools menu entry, improve mobile menu behavior and header/footer consistency.

## Content Population
- Fill Strapi content: homepage blocks, advantages/personas, solutions benefits, case studies (3–5), resources (2+), compliance entries.
- Upload and assign official media to relevant fields; ensure image alt text, captions.
- Review copy for clarity and technical accuracy.

## Accessibility (WCAG AA)
- Alt text for all images; semantic headings and landmarks.
- Keyboard navigation, focus outlines, skip links.
- ARIA labels for forms; label inputs and ensure error messaging.
- Color contrast checks for brand palette.

## Performance & CLS
- Image optimization: confirm `next/image` usage everywhere; set sizes/priority; use real blur placeholders and appropriate widths.
- Minimize layout shifts: fixed aspect ratios for media; avoid late-loading fonts blocking render.
- Bundle hygiene: tree-shake unused code, minimize client-only components.
- Lighthouse pass with target scores (Performance ≥ 90, Accessibility ≥ 90).

## SEO Finalization
- Complete per-page metadata on remaining routes (solutions list, library indexes already done).
- Verify JSON‑LD coverage: Organization, BreadcrumbList; add FAQ/Product schema where applicable.
- Canonicals and robots policies for staging vs production.
- Internal linking: pillar→cluster and cluster→pillar patterns; cross-link case studies and solutions.

## Analytics & Monitoring
- Integrate Microsoft Clarity (production only, env‑guarded).
- Optional: enhance `/leads` dashboard with simple auth (basic token or IP-block) to avoid public access.
- Confirm GA4 decision (skip for now per earlier guidance).

## Lead Capture Enhancements
- Add success and failure variants with clear guidance; optional “view contact in HubSpot” link using portal ID.
- Optional: associate downloads to Companies when company field present.

## Deployment & Config
- Prepare VPS deployment scripts: build/start with PM2 or systemd; Nginx reverse proxy + SSL.
- Configure CORS in Strapi for production domain; set NEXT_PUBLIC_SITE_URL to production.
- Environment management: `.env.local` (frontend) and `.env` (Strapi) with secrets handled securely.

## QA & Acceptance
- Functional tests: forms submit, downloads gated, content renders with populated data.
- Cross‑browser: Chrome, Safari, Firefox, Edge; responsive checks.
- Performance & SEO checks: Lighthouse, structured data validators, sitemap/robots.
- Accessibility checklist passes.

## Milestones & Timeline (approx.)
- Week 1: Visual/UI refinement; navigation updates; content population kickoff.
- Week 2: Accessibility, performance tuning; SEO/meta completion; Clarity integration.
- Week 3: Deployment prep; environment & CORS; QA; production launch readiness.

## Deliverables
- Refined UI and consistent components across all pages.
- Fully populated content in Strapi with alt text and SEO fields.
- Accessibility and performance improvements validated.
- SEO metadata and JSON‑LD completed; sitemap/robots verified.
- Clarity integrated (production only) and `/leads` optionally guarded.
- VPS deployment configured; site ready for production.

Confirm to proceed and I’ll start with UI refinement + accessibility while coordinating content population (images/alt text and copy), then move into performance/SEO and deployment prep.