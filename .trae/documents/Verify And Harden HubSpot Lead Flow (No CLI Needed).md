## Clarification
- You do NOT need `@hubspot/cli` or `hs init` for this integration. Those are for building HubSpot apps/CMS assets. For our server-side capture using the CRM v3 API, a Private App with the right scopes is sufficient.

## Immediate Checks in HubSpot
- Confirm you’re in the same portal where the Private App was created.
- Private App scopes:
  - `crm.objects.contacts.read`, `crm.objects.contacts.write`
  - `crm.objects.notes.read`, `crm.objects.notes.write`
  - (Optional) `crm.objects.companies.read`, `crm.objects.companies.write` if we want company associations
- Review API logs: Settings → Integrations → Private Apps → [Your App] → Logs
  - Look for requests to:
    - `POST /crm/v3/objects/contacts`
    - `POST /crm/v3/objects/contacts/search`
    - `POST /crm/v3/objects/notes`
    - `POST /crm/v3/associations/note/contact/batch/create`
  - Note any 4xx/5xx codes and error messages (e.g., property validation for `hs_lead_status` or `lifecyclestage`).

## Plan: Harden Our Lead Endpoint
- Upsert strategy:
  - Try creating a Contact with minimal properties: `email` (required), and optionally `firstname`/`lastname`.
  - If create fails, search by email; if found, use that ID.
  - If still not found, retry minimal create (email only).
- Association guards:
  - Create a Note with full context.
  - Associate the Note to the Contact; only return success after a successful association.
- Error handling & observability:
  - Log non-OK HubSpot responses (status code + error body) on the server in development.
  - Return structured `error_code` to the client so the UI can show precise messages (e.g., `contact_create_failed`, `association_failed`).
- Optional company association (Stage 2.1):
  - If `company` is provided, search for a Company; create if missing; associate Contact↔Company.

## UI Feedback
- Show clear success only when contact + note association succeeds.
- Show actionable error copy when creation/association fails (e.g., “Could not create contact; please check email or try again later”).

## Expected Outcome
- Submissions consistently create/find a Contact, attach a Note, and report accurate status in the UI.
- If HubSpot rejects a property, the UI reports which step failed, and the server log shows the exact HubSpot error for quick fix.

If you approve, I’ll implement the upsert logic, stricter success criteria, detailed error handling, and optional company association.