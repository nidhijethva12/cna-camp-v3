import type { Metadata } from "next";
import { EnquiryForm } from "@/components/enquiry/EnquiryForm";
import { PageHead } from "@/components/layout/PageHead";
import { FaqList } from "@/components/ui/FaqList";
import { ArrowRight } from "@/components/ui/icons";
import { site } from "@/content/site";
import { getSiteSettings, type SiteSettings } from "@/lib/content";

export const metadata: Metadata = {
  title: { absolute: "Contact Us in Rajkot: Call, WhatsApp, Email | CNA Camp" },
  description:
    "Call or WhatsApp +91 70463 61009, email us or visit our Rajkot office by appointment. Ask about treks, camps and school groups. We reply within a day.",
  openGraph: {
    title: "Talk to CNA: call, WhatsApp or email",
    description: "Questions about a trip or a group? Reach a real person in Rajkot, usually within a day.",
  },
  alternates: { canonical: "/contact" },
};

const faqs = [
  { question: "What is the fastest way to reach you?", answer: "WhatsApp. We usually reply the same day." },
  { question: "Can I visit the office?", answer: "Yes, by appointment. Call first so the right person is there to meet you." },
  {
    question: "I am a teacher planning a school camp. Who do I talk to?",
    answer: "Call or WhatsApp the same number and say it is a school trip. We will guide you through dates, group size and permissions.",
  },
];

const contactWays = (contact: SiteSettings) => [
  { label: "Call", value: contact.phone, href: contact.phoneHref, note: "Mon to Sat, office hours" },
  { label: "WhatsApp", value: "Chat with us", href: contact.whatsappHref, note: "Fastest reply, usually the same day" },
  { label: "Email", value: contact.email, href: `mailto:${contact.email}`, note: "Trips, camps and group bookings" },
  ...(contact.trustEmail
    ? [{ label: "Trust email", value: contact.trustEmail, href: `mailto:${contact.trustEmail}`, note: site.trust.name }]
    : []),
];

export default async function ContactPage() {
  const contact = await getSiteSettings();
  const ways = contactWays(contact);

  return (
    <>
      <PageHead
        img="cna/real/group-05"
        imgAlt="CNA trip leaders talking with a group of campers at camp"
        eyebrow="Contact"
        title="Talk to a real person"
        text="Questions about a trip, a school group or a date? Send a message. The person who replies has been on these trips."
      >
        <p className="mt-3 text-[15px] font-medium text-light/75">Usually within a day, most often on WhatsApp.</p>
      </PageHead>
      <section className="wrap mt-12 grid gap-12 lg:grid-cols-[1fr_1.2fr]">
        <div className="space-y-4">
          {ways.map((w) => (
            <a
              key={w.label}
              href={w.href}
              target={w.href.startsWith("http") ? "_blank" : undefined}
              rel="noopener"
              className="lift flex items-center justify-between gap-4 rounded-card border border-line p-5 hover:border-dark"
            >
              <span className="min-w-0">
                <span className="eyebrow">{w.label}</span>
                <span className="mt-1 block text-[19px] font-bold break-all">{w.value}</span>
                <span className="text-[14px] text-muted">{w.note}</span>
              </span>
              <ArrowRight />
            </a>
          ))}
          <div className="overflow-hidden rounded-card border border-line">
            <iframe
              src={`https://www.google.com/maps?q=${encodeURIComponent(contact.address.full)}&output=embed`}
              title="Map of the CNA office in Rajkot"
              loading="lazy"
              className="block aspect-[16/9] w-full border-0 bg-soft"
            />
            <div className="p-5">
              <p className="eyebrow">Office</p>
              <p className="mt-2 font-semibold">{contact.address.full}</p>
              <p className="mt-1 text-[14px] text-muted">Visits by appointment. Please call before you come.</p>
              {contact.mapHref && (
                <a href={contact.mapHref} target="_blank" rel="noopener" className="btn btn-outline mt-4">
                  Open in Google Maps <ArrowRight />
                </a>
              )}
            </div>
          </div>
          <div id="payments" className="scroll-mt-28 rounded-card bg-soft p-5">
            <p className="eyebrow">Payments</p>
            <p className="mt-2">
              Book with a 25% advance once your batch is confirmed. The balance is due 3 days before departure. Our team shares payment
              details with you directly. We never post bank or UPI details on public pages, and we will never ask for your card PIN or OTP.
            </p>
          </div>
        </div>
        <div id="enquire" className="scroll-mt-28">
          <EnquiryForm />
        </div>
      </section>

      <section className="wrap mt-20 max-w-3xl">
        <p className="eyebrow">FAQs</p>
        <h2 className="h-section mt-3">Quick answers</h2>
        <FaqList faqs={faqs} className="mt-6" />
      </section>
    </>
  );
}
