/** Sender identity in every Olympiad email. */
const site = {
  name: 'CNA Camp',
  legalName: 'Climber Nature Adventure Club',
} as const;

const escapeHtml = (value: string) =>
  value.replace(
    /[&<>"']/g,
    (c) =>
      ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[
        c
      ]!,
  );

interface Block {
  /** Plain paragraphs; escaped. */
  lines: string[];
  /** Optional button. */
  action?: { label: string; href: string };
  /** Small print under the signature, e.g. the unsubscribe link. */
  footer?: { text: string; href?: string; label?: string };
}

/** The same simple layout as the enquiry confirmation, as both text and HTML. */
function render(
  subject: string,
  greeting: string,
  { lines, action, footer }: Block,
) {
  const text = [
    greeting,
    '',
    ...lines.flatMap((l) => [l, '']),
    ...(action ? [`${action.label}: ${action.href}`, ''] : []),
    `Team ${site.name}`,
    site.legalName,
    ...(footer
      ? ['', footer.href ? `${footer.text} ${footer.href}` : footer.text]
      : []),
  ].join('\n');

  const html = `<!doctype html>
<html lang="en">
  <body style="margin:0;padding:24px;background:#f6f4ef;font-family:Arial,Helvetica,sans-serif;color:#1f1f1f;font-size:16px;line-height:1.6">
    <div style="max-width:560px;margin:0 auto;background:#ffffff;border-radius:12px;padding:32px">
      <p style="margin:0 0 16px">${escapeHtml(greeting)}</p>
      ${lines.map((l) => `<p style="margin:0 0 16px">${escapeHtml(l)}</p>`).join('\n      ')}
      ${
        action
          ? `<p style="margin:8px 0 24px"><a href="${escapeHtml(action.href)}" style="display:inline-block;background:#cf4510;color:#ffffff;text-decoration:none;font-weight:bold;padding:12px 20px;border-radius:6px">${escapeHtml(action.label)}</a></p>`
          : ''
      }
      <p style="margin:0">Team ${site.name}<br><span style="color:#6b6b6b">${site.legalName}</span></p>
    </div>
    ${
      footer
        ? `<p style="max-width:560px;margin:16px auto 0;font-size:13px;color:#6b6b6b;text-align:center">${escapeHtml(footer.text)}${
            footer.href
              ? ` <a href="${escapeHtml(footer.href)}" style="color:#6b6b6b">${escapeHtml(footer.label ?? footer.href)}</a>`
              : ''
          }</p>`
        : ''
    }
  </body>
</html>`;
  return { subject, text, html };
}

const hi = (name: string) => `Hi ${name.split(' ')[0]},`;

export const reminderEmail = (p: {
  name: string;
  opensOn: string;
  pageUrl: string;
  phone: string;
  unsubscribeUrl: string;
}) =>
  render('You are on the list for Adventure Olympiad 2.0', hi(p.name), {
    lines: [
      'Thank you! You are on the Adventure Olympiad 2.0 list.',
      `Registration opens on ${p.opensOn}. We will message you on WhatsApp that day, so you don't miss it.`,
      `Until then, the groups, fees, dates and prizes are all on the Olympiad page. Questions? Call or WhatsApp ${p.phone}.`,
    ],
    action: { label: 'See the Olympiad page', href: p.pageUrl },
    footer: {
      text: "Don't want Olympiad emails?",
      href: p.unsubscribeUrl,
      label: 'Unsubscribe',
    },
  });

export const registrationEmail = (p: {
  name: string;
  regId: string;
  group: string;
  fee: number;
  paymentId: string;
  receiptUrl: string;
  pageUrl: string;
  unsubscribeUrl: string;
}) =>
  render(
    `Registration confirmed: ${p.regId} · Adventure Olympiad 2.0`,
    hi(p.name),
    {
      lines: [
        'Your Adventure Olympiad 2.0 registration is confirmed.',
        `Registration ID: ${p.regId}`,
        p.fee > 0
          ? `Group: ${p.group} · Fee paid: ₹${p.fee} · Razorpay payment ID: ${p.paymentId}`
          : `Group: ${p.group} · Free registration`,
        'Download your registration receipt (PDF) from the button below. Quiz links and times will come on your WhatsApp number, and results are posted on the notice board of the Olympiad page.',
      ],
      action: { label: 'Download the receipt', href: p.receiptUrl },
      footer: {
        text: "Don't want Olympiad emails?",
        href: p.unsubscribeUrl,
        label: 'Unsubscribe',
      },
    },
  );

export const partnerApprovedEmail = (p: {
  kind: 'school' | 'ambassador';
  name: string;
  code: string;
  dashboardUrl: string;
  /** One-time link to choose a password; absent when CNA already set one. */
  setPasswordUrl?: string;
  shareUrl?: string;
}) => {
  const login = p.setPasswordUrl
    ? 'Choose your dashboard password with the button below. The link works once, for 7 days. After that, log in with this email address and your password.'
    : 'Log in to your dashboard with this email address and the password the CNA team shared with you.';
  const action = p.setPasswordUrl
    ? { label: 'Choose your password', href: p.setPasswordUrl }
    : {
        label:
          p.kind === 'school'
            ? 'Open the school dashboard'
            : 'Open your dashboard',
        href: p.dashboardUrl,
      };
  return p.kind === 'school'
    ? render(`Approved: your school code is ${p.code}`, hi(p.name), {
        lines: [
          `Your school is now an Adventure Olympiad 2.0 School Partner. Your school code is ${p.code}.`,
          login,
          `On the school dashboard (${p.dashboardUrl}) you can share the class link, add students and follow payments.`,
        ],
        action,
      })
    : render(`You are an Olympiad Ambassador: ${p.code}`, hi(p.name), {
        lines: [
          `Welcome! You are now an Adventure Olympiad 2.0 Ambassador. Your code is ${p.code}.`,
          ...(p.shareUrl ? [`Your personal link: ${p.shareUrl}`] : []),
          login,
          `Every paid registration with your code is counted on your dashboard (${p.dashboardUrl}), and CNA recognises you at each milestone.`,
        ],
        action,
      });
};

/** "Forgot your password?" from a dashboard login. */
export const passwordResetEmail = (p: {
  name: string;
  setPasswordUrl: string;
}) =>
  render('Choose a new dashboard password', hi(p.name), {
    lines: [
      'Someone asked for a new password for your Adventure Olympiad 2.0 dashboard.',
      'Choose a new one with the button below. The link works once, for 7 days. If you did not ask, ignore this email: your password stays the same.',
    ],
    action: { label: 'Choose a new password', href: p.setPasswordUrl },
  });

/** To the CNA team when a school or Ambassador signs up on the website. */
export const partnerSignupEmail = (p: {
  kind: 'school' | 'ambassador';
  name: string;
  detail: string;
  adminUrl: string;
}) =>
  render(
    p.kind === 'school'
      ? `New School Partner sign-up: ${p.name}`
      : `New Ambassador sign-up: ${p.name}`,
    'Hello CNA team,',
    {
      lines: [
        p.kind === 'school'
          ? `${p.name} signed up as a School Partner on the website.`
          : `${p.name} signed up as an Olympiad Ambassador on the website.`,
        p.detail,
        'Check the details, then set the status to Approved. Approving gives them their code and emails them a link to choose their dashboard password.',
      ],
      action: { label: 'Open in the admin', href: p.adminUrl },
    },
  );

/** To the parent of a student the school added from Excel: finish the form with the documents. */
export const studentInviteEmail = (p: {
  parentName: string;
  studentName: string;
  schoolName: string;
  registerUrl: string;
}) =>
  render(
    `${p.schoolName}: complete ${p.studentName}'s Adventure Olympiad 2.0 registration`,
    `Hi ${p.parentName.split(' ')[0] || 'Parent'},`,
    {
      lines: [
        `${p.schoolName} has added ${p.studentName} for Adventure Olympiad 2.0, a nature and science quiz that can take students to a camp in the Himalaya.`,
        'Please complete the registration with the button below. The details the school gave are already filled in; you add the photo, the Aadhaar number and card, and give your consent. It takes about 3 minutes.',
        'The registration form opens on the dates shown on the Olympiad page. If it is not open yet, keep this email and use the same button then.',
      ],
      action: { label: 'Complete the registration', href: p.registerUrl },
    },
  );
