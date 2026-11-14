# Adventure Olympiad 2.0: backend design

Status: in build · updated 28 Oct 2026 · registration opens 15 Nov 2026

Sources: `03 Backend plan + master list` (backend plan docx, 32-column master list xlsx), `04 School and Ambassador Plan` (docx), and the demo screens `admin.html`, `schools.html`, `ambassador.html`. The page design (design B) is already built in `apps/frontend`.

## 1. Principles

- **Two apps, one database.** Decided 28 Oct 2026:
  - **`apps/backend` (NestJS, deployed on Vercel)** is the Olympiad API. It does every public Olympiad read and write and sends every WhatsApp, email and Razorpay call.
  - **`apps/frontend` (Next.js)** renders the pages. Its server actions call the API. It also keeps the Payload admin, where CNA views and edits the same collections in MongoDB Atlas (`cnacamp`).
- **Only the website's server talks to the API.** Every API route needs the shared `BACKEND_API_KEY`, which never reaches a browser; the visitor's IP is passed on in `x-client-ip`. The Razorpay and WhatsApp webhooks are the only open routes, and they check signatures.
- **Payload owns the shapes, the API follows them.** The admin defines the collections and their indexes; `apps/backend/src/olympiad/schemas.ts` mirrors the field names. Admin-side steps that need the API (a new partner code, the approval message) call it from Payload hooks.
- **The server decides money.** The fee comes from settings + group + verified school, never from the browser. A registration counts as paid only after Razorpay's signed webhook; the browser's callback is checked but never marks it paid.
- **One person, one row.** The master list is one collection, and its export matches the 32-column Excel exactly.
- **DPDP Act 2023.** Collect only the listed fields, keep consent proof, honour STOP and unsubscribe at once, and delete on request.

### Who does what

| Step | Where |
|---|---|
| Remind me, School / Ambassador request, registration + Razorpay order | API (`/olympiad/reminders`, `/partner-requests`, `/registrations`) |
| Payment confirmation | API: Razorpay webhook (`/webhooks/razorpay`) marks it paid; the browser callback (`/payments/confirm`) only checks the signature and reports the status |
| WhatsApp and email, delivery ticks, STOP | API (`MessagingService`, `/webhooks/whatsapp`) |
| Partner link opens (`/olympiad/r/<code>`) | website route → API `/links/open` |
| Dashboard login and data (`/ambassador-dashboard`, `/school-dashboard`) | website pages → API `/partners/:kind/login`, `/partners/:kind/me` |
| Approving a partner, setting its password | Payload admin; the code and welcome message come from the API |
| Page content: dates, fees, notices | website reads Payload |

## 2. Data model

All new collections sit in a new admin group, **Olympiad**. Each one has an `edition` field (`"2.0"`) so the next Olympiad reuses the code.

### 2.1 `olympiadSettings` (global)

| Field | Type | Notes |
|---|---|---|
| `registrationMode` | select: `auto` / `open` / `closed` | `auto` follows the dates below; `open` lets CNA open early |
| `opensAt`, `closesAt`, `feeLastDate` | date (IST) | 15 Nov 2026 00:00 · 14 Dec 2026 23:59 · 31 Dec 2026 |
| `fees` | group per group A–D: `govt`, `other` (₹) | A 90/230 · B 105/369 · C 639 · D 1963; replaces the hard-coded fees in `content/olympiad.ts` |
| `consentText`, `consentVersion` | text | the exact wording saved with each consent |
| `retainUntil` | date | personal data is purged after this (≈ Mar 2027) |

`lib/olympiad.ts` gets `registrationState(settings, now)`, which returns `soon | open | closed`. The page and every server action use it, so the "Remind me" to "Register now" switch and the server checks can never disagree.

### 2.2 `olympiadPeople`: the master list

One document per person. A "Remind me" creates a `reminder` row. Registering turns the same row into a `registered` row.

| Group | Fields (column in the Excel) |
|---|---|
| Who | `regId` (Reg. ID), `type` reminder / registered, `joinedAt`, `name`, `whatsapp` (+91XXXXXXXXXX), `email` |
| Group and school | `group` A–D, `std`, `dob`, `institution` (school / college / job for D), `schoolType` (Government, Non-government, Semi-government, College, Not a student), `city`, `district`, `parentName`, `parentPhone`, `quizLanguage` gu / en |
| Payment | `fee`, `paymentStatus` pending / paid / failed, `payment` (→ `olympiadPayments`), `paidAt` |
| Source | `school` (→ `olympiadSchools`), `ambassador` (→ `olympiadAmbassadors`), `source` direct / school / ambassador, `code` (as typed) |
| Progress | `rounds.r1` … `rounds.r5` (Appeared / Absent / Selected / Not selected), `scholarshipPct` |
| Consent | `consent { at, version, ipHash }`, `parentConsent { at, via, ipHash }` (under 18) |
| Messages | `whatsappStopped`, `emailStopped`, `lastMessage { template, channel, status, at }`, `notes` |

**IDs.** `REM-501…` for reminders and `AO2-A-1001…` for registrations. They come from an atomic `$inc` on a small `olympiadCounters` collection, so two people paying at the same second never get the same number. The prefix uses the group and the number keeps counting across groups, as in the sample rows.

**Indexes.** `whatsapp`, `type`, `group`, `paymentStatus`, `city`, `schoolType`, `school`, `ambassador`, `createdAt`, and `regId` (unique, sparse). Duplicate guard: name + dob + parentPhone (see the sibling decision in §8).

### 2.3 `olympiadPayments`

`razorpayOrderId` (unique), `razorpayPaymentId`, `amount` (paise), `mode` single / bulk, `people[]` (→ `olympiadPeople`), `paidBy` participant / parent / school, `status` created / paid / failed, `receiptNo`, `raw` (webhook payload, hidden). A bulk school payment is one row linking many people.

### 2.4 `olympiadSchools` and `olympiadAmbassadors`

- **Schools:** `name`, `udise` (unique), `type` govt / grant-in-aid / private / college, `district`, `principal`, `coordinator { name, whatsapp, email }`, `schoolCode` (SCH-RJK-012), `status` pending / approved / blocked, `classLinkToken`.
- **Ambassadors:** `name`, `whatsapp` (unique), `email`, `city`, `role`, `code` (CNA-AMB-0142), `status`, `linkOpens` (counter), `milestones[] { level, givenAt, note }`.

The code and its link are created on approval, in a `beforeChange` hook. Blocking a school or Ambassador pauses its code at once.

### 2.5 `notices` (existing, extended)

Add `type` (important / last date / PDF / result), `date`, `file` (an uploaded PDF in Blob), `pinned`, and `edition`. The Olympiad page board then reads from the CMS instead of `content/olympiad.ts`. CNA posts notices without a deploy, and `revalidateSite` already refreshes the page.

### 2.6 `olympiadMessages` (send log)

`campaign` (template, channel, filter used, sentBy, count), and one row per recipient: `person`, `providerId`, `status` queued / sent / delivered / read / failed, `error`. The master list shows only `lastMessage`, and the full history lives here.

### 2.7 `users` (existing, changed)

Today there is one admin account and new accounts are blocked. The plan asks for **Admin** (send and export) and **Viewer** (read only) roles, plus 2FA:

- add `role` admin / viewer, and let an admin invite accounts;
- master-list read for both roles; send, export and delete for admin only (collection and endpoint access functions);
- 2FA: TOTP on login (authenticator app). Payload has no built-in 2FA, so this is a small custom step (an `otplib` check in a `beforeLogin` hook plus a setup screen) or a vetted plugin. Decide in §8.

## 3. Public flows

### 3.1 Remind me (before 15 Nov)

`actions/olympiad/remind.ts` follows the `submitEnquiry` pattern:

1. Turnstile token check (Cloudflare), a honeypot, and the same `ipHash` rate limit.
2. Validation: name 2–80 characters (letters), WhatsApp `^[6-9]\d{9}$` → `+91…`, email, optional "who is it for", consent required.
3. Upsert on `whatsapp`. **Same number again: update the row and send nothing.**
4. Return "Thank you, {first name}". After the response (`after()`): send the WhatsApp confirmation template and the "stay tuned" email, then record `lastMessage`.

The modal already built in `components/olympiad/Remind.tsx` switches from client-only validation to `useActionState` on this action.

### 3.2 Register and pay (from 15 Nov)

`/olympiad/register?code=…` is one form with group-aware fields. The flow:

1. Server action validates, works out the group from class or age, and computes the fee from `olympiadSettings.fees`. The government fee applies only with an approved government school code (see §8).
2. Upsert the person (a reminder row becomes `registered`) with `paymentStatus: pending`.
3. Create a Razorpay order (server, amount in paise, `notes.personIds`), save `olympiadPayments`, and return the order id to the browser.
4. Razorpay Checkout runs in the browser. Its success callback sends `razorpay_signature` to a verify action (HMAC-SHA256 with the key secret) for an instant thank-you screen.
5. **The source of truth is the webhook** `POST /api/olympiad/razorpay` (signature checked with the webhook secret, idempotent on payment id). On `payment.captured` / `order.paid`: mark the payment and its people `paid`, assign `regId`, and queue the confirmation WhatsApp and the receipt email.
6. Unpaid rows stay `pending` and get the "Fee pending" template before `feeLastDate`.

### 3.3 School Partner

- **Sign-up** (`/olympiad/schools`): a server action creates a `pending` school. CNA approves it in the admin, which creates the code, the class link and a WhatsApp to the coordinator.
- **Login:** the coordinator's WhatsApp number plus a one-time code (WhatsApp authentication template). The OTP is stored hashed, with a 10-minute expiry and 5 attempts. On success we set a signed, httpOnly, SameSite=Strict session cookie (`olympiad_session`, 8 h). This is separate from the Payload admin login.
- **Dashboard** (`/olympiad/schools/dashboard`): shows only this school's people. Students are added by:
  - an Excel upload from our template, parsed on the server (row limit, type checks, group set from class); or
  - the class link, `/olympiad/register?school=<token>`, which parents fill in.
- **Bulk payment:** one Razorpay order for the selected pending students; the webhook marks all of them paid.
- **Parent consent** for under-18s: each parent gets a WhatsApp link `/olympiad/consent/<signed token>`. One tap records `parentConsent`.

### 3.4 Olympiad Ambassador

- Sign-up at `/olympiad/ambassador` → CNA approval → code, link `/olympiad/register?code=CNA-AMB-0142` and QR code.
- Link opens are counted on the register page (by ipHash, deduplicated per day).
- Dashboard (same OTP login): opens, registered, paid and next milestone. **Counts only, never anyone's personal details.** Only paid registrations count.

### 3.5 Unsubscribe and STOP

- Every email carries `/olympiad/unsubscribe/<signed token>`, which sets `emailStopped` in one click.
- The WhatsApp webhook `POST /api/olympiad/whatsapp` (signature checked) stores delivery status in `olympiadMessages`. An incoming "STOP" sets `whatsappStopped`.

## 4. Admin: the master list

Payload's own list view stays for editing single records. A custom admin view **Olympiad → Master list** follows `admin.html`:

- counts row (Everyone, Reminder only, Registered, Paid, Group A–D), where clicking a count filters the list;
- filters for search (name, phone, email, school, Reg. ID), type, group, payment, school type, city and quiz status, all combinable, kept in the URL;
- tick rows or "Select everyone in this list", then **Send WhatsApp** / **Send email** (admin only). The dialog shows the count and groups, a template picker, `{name}` and a preview, "Send a test to me", then "Send to N people". People with STOP set are skipped and the number shown excludes them;
- **Export Excel** of the current filter in exactly the 32 columns and order of the master format (`.xlsx` via `exceljs`, built on the server, admin only);
- approve and block schools and Ambassadors, Ambassador leaderboard, mark milestone rewards.

## 5. Messaging

| | Choice | Why |
|---|---|---|
| WhatsApp | WhatsApp Business Platform, via Meta Cloud API or a BSP (AiSensy / Interakt / WATI) | Bulk sends need Meta-approved templates. Approval takes days, so **submit the 6 templates now** |
| Email | Keep the Payload nodemailer adapter; switch the SMTP account from Gmail to ZeptoMail, SES or Brevo on a cnacamp.com sender with SPF, DKIM and DMARC | No code change: only `SMTP_*` and `EMAIL_FROM_*` |
| Queue | Payload's built-in jobs queue (`jobs.tasks`), one task per batch of 50 recipients, run by a cron call to `/api/payload-jobs/run` | The admin page returns at once; retries and failures are stored |

All provider calls sit behind `lib/olympiad/messaging.ts` (`sendWhatsAppTemplate`, `sendEmail`), so changing the BSP touches one file.

Note: Vercel Cron on the Hobby plan runs once a day. For timely bulk sends we need Vercel Pro (per-minute cron), or an external scheduler such as Upstash QStash or cron-job.org calling the run endpoint with a secret.

## 6. Security and privacy

- Public writes go through server actions or signed webhooks only. Every new collection has `create: () => false` for the public API.
- Turnstile, honeypot and ipHash rate limits on every public form. OTP attempts are capped.
- Webhooks check signatures with a timing-safe compare and are idempotent. Raw bodies are read before parsing.
- Signed tokens (HMAC with `OLYMPIAD_TOKEN_SECRET`, with expiry) for class links, consent, unsubscribe and sessions.
- Scopes: a school session reads only `school = its id`; an Ambassador gets aggregate counts only; Viewer can't send, export or delete.
- Consent proof: text version, timestamp and ipHash on every person; parent consent separately.
- Retention: a scheduled job deletes personal fields after `retainUntil`, and the admin can delete a person on request.
- Money: amounts come only from settings; the webhook amount must equal the order amount; a paid status never comes from the client alone.

## 7. New environment variables

```
TURNSTILE_SITE_KEY / TURNSTILE_SECRET_KEY
RAZORPAY_KEY_ID / RAZORPAY_KEY_SECRET / RAZORPAY_WEBHOOK_SECRET
WHATSAPP_PROVIDER, WHATSAPP_TOKEN, WHATSAPP_PHONE_ID (or BSP key), WHATSAPP_WEBHOOK_SECRET
OLYMPIAD_TOKEN_SECRET          # signs links, OTP sessions and unsubscribe tokens
CRON_SECRET                    # protects the jobs run endpoint
```

All of these are added to `.env.example` and checked with `requireEnv` where they are used, so a missing key fails loudly rather than silently.

## 8. Conflicts in the source documents: decisions needed

1. **Government fee for direct registrations.** The page and master list let any student pick "Government school" (₹90 / ₹105). The school plan says the lower fee applies only through an approved government school. *Recommendation: allow it directly with a declaration, and flag those rows for a check. Otherwise most government school students, who usually register through parents, pay the higher fee.*
2. **Siblings sharing one WhatsApp number.** The master list is "unique WhatsApp number", but a parent with two children has one number. *Recommendation: unique on WhatsApp + name + dob for registrations; reminders stay unique on WhatsApp.*
3. **Storing the IP for consent.** The backend plan says "save text, time and IP". The site currently stores only a keyed hash. *Recommendation: keep the hash. It proves the same device without holding a raw IP.*
4. **2FA method:** an authenticator app (TOTP) or an email code.
5. **WhatsApp provider and sending number.**
6. **Sender email** on cnacamp.com.
7. **Hosting plan:** Vercel Pro, or an external cron for the send queue.
8. **Who gets Admin and who gets Viewer.**
9. From the School & Ambassador plan:
   - Ambassador rewards and milestone numbers;
   - can a school pay once for everyone;
   - who approves schools;
   - can coordinators see results;
   - schools outside Gujarat.

## 9. Build order

| Phase | Ready by | Scope |
|---|---|---|
| 0 | now | Submit the WhatsApp templates; set up Razorpay, Turnstile and the email sender (needs CNA accounts) |
| 1 | 3 Nov | `olympiadSettings`, `olympiadPeople`, counters, extended `notices` (page reads the CMS), Remind-me action + confirmation email, master list view with counts, filters and Excel export |
| 2 | 12 Nov | Roles + 2FA, registration form + Razorpay (order, verify, webhook), referral code field, Reg. IDs, confirmation messages, automatic open on 15 Nov |
| 3 | 20 Nov | Bulk WhatsApp/email with queue, provider webhooks, STOP and unsubscribe, fee-pending campaign |
| 4 | 30 Nov | School Partner: sign-up, approval, OTP login, dashboard, class link, Excel upload, bulk payment, parent consent |
| 5 | 7 Dec | Ambassador: sign-up, approval, code/link/QR, dashboard, leaderboard, milestones |
| 6 | Jan 2027 | Rounds and results on the master list, quiz-link and result campaigns, scholarship %, retention purge |

Phases 1 and 2 are the hard deadline: without them nobody can register on 15 Nov. Phases 4 and 5 can go live during the registration window, as the school plan allows.
