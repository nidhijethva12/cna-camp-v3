# Adventure Olympiad 2.0: Razorpay and WhatsApp (Meta) setup

Everything CNA needs to set up so the website can take fees and send WhatsApp messages. Approvals take days, so start both today. When a step gives you a key, put it in the **Olympiad API** project: `apps/backend/.env` locally, and in Vercel → the API project → Settings → Environment Variables (Production and Preview). Only the Turnstile *site* key (Part C) goes in the website project. Never send keys over WhatsApp or email.

`<api>` below is the Olympiad API's address once it is deployed on Vercel, for example `https://api.cnacamp.com` or `https://cnacamp-api.vercel.app`.

The site works without these keys while they are pending: payments show "not set up yet", and WhatsApp messages are logged but not sent.

---

## Part A · Razorpay (registration fees)

### A1. Account and activation

1. Sign up at **dashboard.razorpay.com** with the email of the organisation that will receive the fees.
   - **Decide first:** do the fees go to Saurashtra Education & Charitable Trust or to Climber Nature Adventure Club? The account, PAN and bank account must all be in that one name.
2. Complete **Account activation (KYC)**:
   - business type (Trust / Society / Partnership …), PAN of the organisation, the trust registration certificate (E-5718/2000), the authorised signatory's PAN and Aadhaar;
   - the bank account for settlements (current account in the organisation's name), and a cancelled cheque;
   - **Website details:** `https://cnacamp.com`. Razorpay checks that these pages exist and are reachable: Contact us (`/contact`), Terms (`/terms`), Privacy (`/privacy`), Refund / cancellation (`/cancellation`). The Olympiad fee is non-refundable, so ask us to add an "Olympiad fees" line to the refund page before you submit.
3. Activation usually takes 2 to 5 working days. Test mode works straight away, so we build and test meanwhile.

### A2. Settings to check

- **Payment capture:** Settings → Payment capture → **Automatic** (the default). The site marks a fee paid only when the payment is captured.
- **Payment methods:** keep UPI, cards, net banking and wallets on.
- **Business name and logo** on the checkout: "Adventure Olympiad · CNA", with the club logo.

### A3. API keys

Settings → API Keys → **Generate key**. Do this once in **Test mode** now, and again in **Live mode** after activation.

| Razorpay shows | Put in the API's env as |
|---|---|
| Key Id (`rzp_test_…`, later `rzp_live_…`) | `RAZORPAY_KEY_ID` |
| Key Secret (shown only once) | `RAZORPAY_KEY_SECRET` |

### A4. Webhook (the server's proof of payment)

Settings → Webhooks → **Add new webhook**:

| Field | Value |
|---|---|
| Webhook URL | `https://<api>/olympiad/webhooks/razorpay` |
| Secret | a long random string (create one with `node -e "console.log(require('crypto').randomBytes(24).toString('hex'))"`) |
| Alert email | the CNA admin email |
| Active events | `payment.captured`, `payment.failed`, `order.paid` |

Put the same secret in `RAZORPAY_WEBHOOK_SECRET`. Add the webhook in both Test and Live mode. For local testing, a tunnel (e.g. `ngrok http 3000`) gives a public URL to use in the Test-mode webhook.

### A5. Test before going live

In Test mode, pay with UPI ID `success@razorpay` (fails with `failure@razorpay`), or the test cards in Razorpay docs → Payments → Test card details. Check that the registration turns **Paid** in the admin, and that the confirmation arrives.

---

## Part B · WhatsApp Business Platform (Meta Cloud API)

### B1. Business account

1. Go to **business.facebook.com** and create (or use) the CNA business portfolio.
2. Settings → Business info → **Start verification**. Keep the organisation documents ready (registration certificate, PAN or GST, a utility bill or bank statement with the address), plus the domain `cnacamp.com`. Without verification, the site can message only 250 people a day.
3. Billing: WhatsApp Manager → Payment settings → add a card. Meta charges per conversation (marketing costs more than utility; check current India rates).

### B2. App and phone number

1. At **developers.facebook.com** → My Apps → **Create app** → type **Business** → connect it to the CNA business portfolio → add the **WhatsApp** product.
2. WhatsApp → API setup → **Add phone number**:
   - use a number that is **not** active in the WhatsApp or WhatsApp Business app (delete the WhatsApp account on it first if needed); a landline with voice OTP works too;
   - display name: **CNA Camp** or **Climber Nature Adventure Club** (it must match the name on the website, or Meta rejects it);
   - category: Education; add the logo, website and address.
3. From the API setup page, copy:

| Meta shows | Put in the API's env as |
|---|---|
| Phone number ID | `WHATSAPP_PHONE_NUMBER_ID` |
| WhatsApp Business Account ID | `WHATSAPP_BUSINESS_ACCOUNT_ID` |
| App settings → Basic → **App secret** | `WHATSAPP_APP_SECRET` |

### B3. Permanent access token

The token on the API setup page expires in 24 hours, so make a permanent one:

1. business.facebook.com → Settings → Users → **System users** → Add → name `cnacamp-website`, role **Admin**.
2. **Assign assets:** the app (full control) and the WhatsApp account (full control).
3. **Generate token** → choose the app → expiry **Never** → permissions `whatsapp_business_messaging` and `whatsapp_business_management`.
4. Put it in `WHATSAPP_ACCESS_TOKEN`.

### B4. Webhook (delivery ticks and STOP replies)

App → WhatsApp → Configuration → Webhook → **Edit**:

| Field | Value |
|---|---|
| Callback URL | `https://<api>/olympiad/webhooks/whatsapp` |
| Verify token | any long random string; also put it in `WHATSAPP_VERIFY_TOKEN` |

Then, under Webhook fields, **Subscribe** to `messages`. The API must already be deployed with the verify token for the check to pass.

### B5. Message templates

Bulk and first-contact messages can only use approved templates. Create each one in WhatsApp Manager → **Message templates** → Create template. Use exactly these names (the code calls them by name), language **English**, and the sample values shown (Meta needs a sample for each `{{n}}`). If you also want Gujarati, create a second copy of a template with the same name and language **Gujarati**.

Meta's rules, to avoid rejection: a variable can't be the very first or last thing in the body; two variables can't sit side by side; links go in buttons, not in the text.

| # | Name | Category | Body | Footer | Button | Samples |
|---|---|---|---|---|---|---|
| 1 | `olympiad_reminder_confirm` | Utility | Hi {{1}}, thank you! You are on the Adventure Olympiad 2.0 list. We will message you here the day registration opens, {{2}}. Team CNA, Rajkot. | Reply STOP to stop updates | – | Riya · 15 Nov 2026 |
| 2 | `olympiad_registration_open` | Marketing | Hi {{1}}, registration for Adventure Olympiad 2.0 is open now. The last date is {{2}}, 11:59 PM. Tap the button below to register. | Reply STOP to stop updates | URL, static: **Register now** → `https://cnacamp.com/olympiad/register` | Riya · 14 Dec 2026 |
| 3 | `olympiad_registration_confirmed` | Utility | Hi {{1}}, your Adventure Olympiad 2.0 registration is confirmed. Registration number: {{2}}. Group: {{3}}. Fee paid: ₹{{4}}. Quiz links will come on this WhatsApp number. Team CNA, Rajkot. | Keep this number safe | – | Riya · AO2-A-1001 · A · 90 |
| 4 | `olympiad_fee_pending` | Utility | Hi {{1}}, your Adventure Olympiad 2.0 form is saved, but the fee of ₹{{2}} is not paid yet. Please pay before {{3}} to confirm your seat. | Reply STOP to stop updates | URL, **dynamic**: **Pay now** → `https://cnacamp.com/olympiad/pay/{{1}}` | Riya · 230 · 31 Dec 2026 · button sample `abc123` |
| 5 | `olympiad_round_link` | Utility | Hi {{1}}, your Round {{2}} quiz is on {{3}} at {{4}}. Tap the button below at that time to open your quiz. All the best, Team CNA. | – | URL, **dynamic**: **Open quiz** → `https://cnacamp.com/olympiad/go/{{1}}` | Riya · 1 · 22 Jan 2027 · 11:00 AM · button `abc123` |
| 6 | `olympiad_result_out` | Utility | Hi {{1}}, the Round {{2}} result of Adventure Olympiad 2.0 is out. Your status: {{3}}. Full details are on the notice board. | – | URL, static: **Notice board** → `https://cnacamp.com/olympiad#notices` | Riya · 1 · Selected |
| 7 | `olympiad_parent_consent` | Utility | Hello {{1}}, {{2}} has registered your child {{3}} for Adventure Olympiad 2.0. As parent or guardian, please tap the button below to give your consent. | Team CNA, Rajkot | URL, **dynamic**: **Give consent** → `https://cnacamp.com/olympiad/consent/{{1}}` | Mehul Shah · Govt. Secondary School, Rajkot · Riya Shah · button `abc123` |
| 8 | `olympiad_ambassador_approved` | Utility | Hi {{1}}, you are now an Adventure Olympiad 2.0 Ambassador. Your code is {{2}}. Open your dashboard to get your link and QR code. Every paid registration with your code is counted. | Team CNA, Rajkot | URL, static: **Open dashboard** → `https://cnacamp.com/ambassador-dashboard` | Pinal · CNA-AMB-0007 |
| 9 | `olympiad_school_approved` | Utility | Hi {{1}}, {{2}} is approved as an Adventure Olympiad 2.0 School Partner. Your school code is {{3}}. Open your dashboard to add students. | Team CNA, Rajkot | URL, static: **Open dashboard** → `https://cnacamp.com/school-dashboard` | Pinal Trivedi · Shree Vidya Mandir · SCH-RJK-012 |

Approval usually takes from a few minutes to 2 days. If Meta moves a Utility template to Marketing, accept it: it still works, it just costs more.

### B6. Sending limits

New numbers can start conversations with 250 people per day. After business verification and good message quality this rises to 1,000, then 10,000, then 100,000. Before sending "Registration is open" to the whole reminder list, check the current limit in WhatsApp Manager → Phone numbers → **Messaging limit**.

---

## Part C · Other keys for the Olympiad backend

| Key | Goes in | Where it comes from |
|---|---|---|
| `NEXT_PUBLIC_TURNSTILE_SITE_KEY` | website | dash.cloudflare.com → Turnstile → Add widget → domain `cnacamp.com` (plus `localhost` for testing), mode **Managed**. This is the spam check on the public forms. |
| `TURNSTILE_SECRET_KEY` | API | the same Turnstile widget's secret key. |
| `BACKEND_API_KEY` | both | one long random string (same command as in A4), identical in both projects. The website uses it to call the API; nobody else can. |
| `BACKEND_URL` | website | the API's address (`https://<api>`). |
| `SITE_URL` | API | the website's address (`https://cnacamp.com`), used in links inside messages. |
| `OLYMPIAD_TOKEN_SECRET` | API | any long random string. It signs dashboard sessions, consent links, payment links and unsubscribe links. If it changes, everyone is logged out and old links stop working. |
| `MONGODB_*` | API | the same database values the website already uses. |
| `SMTP_*`, `EMAIL_FROM_*` | both | the website's enquiry emails and the API's Olympiad emails. For bulk Olympiad email, move from Gmail to a sending service on a cnacamp.com address (Zoho ZeptoMail, Amazon SES or Brevo), with the SPF, DKIM and DMARC records they give you added to the domain's DNS. Only these values change, no code. |

## Checklist to send back to the developer

- [ ] Which organisation receives the fees (Trust or Club)
- [ ] Razorpay Test keys + webhook secret, later the Live keys
- [ ] WhatsApp phone number ID, business account ID, app secret, permanent token, verify token
- [ ] Templates 1 to 9 submitted (and approved)
- [ ] Turnstile site key and secret
- [ ] Sender email on cnacamp.com
