# Security Review

**Review date:** 2026-10-24
**Scope:** Read-only repository review of the Next.js frontend, Payload CMS, backend service, and CI configuration. No live-site probing or production database/configuration access was performed.

## Findings

| # | Severity | File | Lines | Finding | Confidence |
|---|----------|------|-------|---------|------------|
| 1 | HIGH | `apps/frontend/src/cms/collections/Users.ts` | 38-63 | If the Payload `users` collection is empty on a publicly reachable deployment, an unauthenticated visitor may register as the first CMS user and gain admin access. The normal `create: () => false` access rule does not disable Payload's first-user setup flow. | 10/10 |

### 1. Payload first-user registration

**Impact:** The first registered account becomes the CMS administrator and may access protected CMS data, including enquiries and editable site content. This risk is conditional: the review did not verify whether a valid admin account already exists in production.

**Evidence:** The `Users` collection documents first-user setup and disables normal account creation. The Payload admin is configured to use this collection in `apps/frontend/src/payload.config.ts`; the REST catch-all at `apps/frontend/src/app/(payload)/api/[...slug]/route.ts` routes requests to Payload. The installed Payload 3.90.2 implementation exposes a first-user registration endpoint that allows registration while no user exists.

**Recommended action:**

1. Verify through a trusted administrative channel that a legitimate admin account already exists in the production CMS.
2. If the collection is empty, provision the admin through a controlled process before public exposure.
3. Disable or otherwise gate first-user registration after initial provisioning, and verify the endpoint rejects anonymous registration.

## Defense-in-depth recommendations

- **Content Security Policy:** `apps/frontend/next.config.ts` sets useful security headers and CSP directives, but its policies do not define `default-src` or `script-src`. This is not evidence of a current XSS vulnerability; a carefully tested least-privilege script policy would strengthen defense in depth. Account for Next.js scripts, analytics, and Payload admin behavior when introducing it.
- **Dependency monitoring:** `.github/workflows/ci.yml` installs locked dependencies and runs type, lint, and formatting checks, but does not include automated dependency advisory monitoring. Add an appropriate dependency update/advisory process.
- **Backend exposure:** The inspected NestJS service currently exposes only a static root response. If it becomes publicly reachable or gains data-bearing routes, add authentication and suitable edge controls before exposing those routes.

## Positive controls observed

- Payload collection access rules restrict normal user creation and require authentication for protected collections.
- CMS authentication configures login-attempt lockout, short token expiration, secure production cookies, and `SameSite=Strict`.
- The Payload GraphQL endpoint is disabled.
- The Next.js app configures security headers, including `nosniff`, frame protections, HSTS, and a Content Security Policy.
- The backend code inspected contains no data-bearing unauthenticated endpoint.

## Limitations

This report is based on repository inspection only. It does not establish whether the production database has an admin account, whether deployment protections or environment variables are correctly configured, or whether the live site emits the expected headers. The local environment file contains credentials; values are intentionally omitted from this report. Rotate any credentials if that file or workspace may have been exposed.
