## Decisiones y Alcance
- Frontend: Next.js 14 (App Router, TypeScript) desplegado en tu VPS.
- Backend: Strapi como CMS interno (no público), expuesto solo al frontend/servidor.
- Integraciones: HubSpot (token personal). Sin Calendly ni GA4. Clarity se integra en Fase 2.
- Activos: usar `/data/uploads/official/` y maquetado de `/html` como guía visual para Fase 1.
- Prioridad Fase 1: `/`, `/why-nrtech`, 4 páginas bajo `/solutions`.

## Modelado mínimo en Strapi (Fase 1)
- Single Types:
  - `homepage`: hero (h1, sub), CTAs, tabla comparativa, tarjetas "Who We Serve", carrusel testimonios, métricas, últimos case studies (placeholder), lead magnet.
  - `why-nrtech`: hero, secciones problema/historia/ventajas, bloque equipo (placeholder Fase 2).
  - `global`: navegación, footer (teléfono, email, CTA), SEO por defecto.
- Collection Types:
  - `solution`: slug + título + hero + resumen + bullets/beneficios + CTA; 4 entradas: `regional-blenders`, `bio-based-additives`, `custom-formulation`, `aftermarket-private-label`.
  - `testimonial` (opcional Fase 1 si queremos dinamizar el carrusel).
- Componentes:
  - `shared.hero` (ya existe `shared.seo`; creamos hero), `shared.metric`, `shared.testimonial`, `shared.cta`, `shared.comparisonRow`, `shared.personaCard`, `shared.leadMagnet`, `shared.media` (ya existe) y `shared.progress` (para más adelante).
- Permisos: solo lectura pública de contenido necesario para el frontend; Strapi detrás de firewall o red interna. CORS solo para el dominio del frontend.

## Frontend (Next.js) — Implementación Fase 1
- Rutas:
  - `/` (usa `homepage`)
  - `/why-nrtech` (usa `why-nrtech`)
  - `/solutions/[slug]` (dinámica desde `solution`)
- UI y estilos:
  - Seguir estructura y clases de `/html/index.html`, `/html/why.html`, `/html/solutions.html`. Replicar layout responsive, navegación, CTA sticky.
  - Paleta y tipografías del plan (Inter + Roboto Mono), imágenes WebP cuando sea posible.
- Obtención de datos:
  - REST de Strapi (tipado con d.ts). Revalidación ISR (p.ej. 60–300s) para buen rendimiento.
- Formularios (solo botón/CTA en Fase 1):
  - Botones de "Schedule Consultation" apuntan a `/schedule` placeholder o directamente a HubSpot landing (si aplica en Fase 2). Captación real se implementa en Fase 2.
- SEO técnico:
  - Meta/head por página, OpenGraph, JSON-LD básico (Organization + WebSite). Sitemap y robots.

## Integración HubSpot (preparación en Fase 1)
- Variables de entorno Next.js: `HUBSPOT_PRIVATE_APP_TOKEN` (no exponer en cliente). Endpoint interno `/api/lead` para Fase 2.
- Añadir tracking de clic en CTA como evento (simple, sin GA4; registro local por ahora si se requiere).

## Activos y Media
- Importar a Strapi media de `/data/uploads/official/` (logo, hero imágenes, video) y referenciar desde `homepage/why/solutions`.
- Optimización: conversión a WebP y tamaños responsivos en el frontend.

## Seguridad y Red
- Strapi accesible solo desde la red del servidor (o protegido por IP/Basic Auth). CORS mínimo.
- Variables en `.env` de Next.js en el VPS, sin exponer tokens.

## Entorno y Despliegue (VPS)
- Next.js: Node LTS, PM2 o systemd, reverse proxy Nginx con SSL. Build CI sencillo: `git pull` → `pnpm install` → `pnpm build` → `pm2 restart`.
- Strapi: se mantiene en el VPS actual; sin endpoints públicos salvo los necesarios.

## Cronograma Fase 1 (2–3 semanas)
- Días 1–2: Modelado Strapi mínimo, carga de media, seed inicial de 4 soluciones.
- Días 3–7: Frontend `/`, `/why-nrtech`, `/solutions/[slug]` siguiendo `/html`.
- Días 8–10: SEO técnico, rendimiento (Lighthouse), accesibilidad (WCAG AA básico).
- Días 11–12: QA cross-browser/dispositivos, correcciones.
- Día 13–14: Deploy en VPS, verificación producción.

## Entregables Fase 1
- Esquemas Strapi para `homepage`, `why-nrtech`, `solution`, `global` con contenido base.
- Frontend Next.js con 3 secciones principales operativas y diseño según mockups.
- Navegación/CTA funcionales, SEO técnico base, assets optimizados.

## Próximos (Fase 2)
- Página `/schedule-consultation` con formulario + API HubSpot.
- Technical Library (case studies, resources) y descargas gated.
- Microsoft Clarity, testimonios dinámicos, calculators.

¿Confirmas este alcance y orden para comenzar Fase 1? Si sí, inicio creando los tipos en Strapi y el esqueleto del proyecto Next.js, y cargo los activos oficiales en la Media Library.