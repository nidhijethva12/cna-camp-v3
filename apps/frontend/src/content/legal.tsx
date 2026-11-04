import Link from "next/link";
import type { LegalSection } from "@/components/layout/LegalPage";
import { site } from "@/content/site";
import type { SiteSettings } from "@/lib/content";

const linkClass = "font-semibold text-dark underline";
const name = site.legalName;
const trust = `${site.trust.name} (Reg. ${site.trust.registration})`;

/** The privacy policy's grievance officer, "Name, Role". Shown before the Trust's name once filled in. */
const grievanceOfficer = "";

const PhoneLink = ({ contact }: { contact: SiteSettings }) => (
  <a className={linkClass} href={contact.phoneHref}>
    {contact.phone}
  </a>
);
const EmailLink = ({ contact }: { contact: SiteSettings }) => (
  <a className={linkClass} href={`mailto:${contact.email}`}>
    {contact.email}
  </a>
);
const WhatsAppLink = ({ contact }: { contact: SiteSettings }) => (
  <a className={linkClass} href={contact.whatsappHref} target="_blank" rel="noopener">
    {contact.phone}
  </a>
);

export const termsSections = (contact: SiteSettings): LegalSection[] => [
  {
    id: "about",
    title: "About these terms",
    body: [
      <>
        These terms apply to every camp, trek, nature trail and the Adventure Olympiad offered on cnacamp.com by {name} (CNA), Rajkot,
        backed by {trust}, {contact.address.full}. CNA works on a <strong>no-profit-no-loss</strong> basis.
      </>,
      "When you register or pay on this website, you (or your school, college or group leader on your behalf) accept these terms. If you register someone under 18, a parent or guardian must agree to them too.",
    ],
  },
  {
    id: "booking",
    title: "How booking works",
    list: [
      "Choose a camp and contact us by phone, WhatsApp or email. We send the programme in writing.",
      "Fix the dates and the number of days with us.",
      <>
        <strong>Group camps need at least 50 members.</strong> A group of fewer than 50 pays the charges for 50. Very large groups (100 to
        1,000) travel in batches.
      </>,
      "Send the group list, a registration form and a risk certificate for every member, your travel choice and the 25% advance.",
      "We hold a group meeting before the camp to explain activities, travel, food and camp rules.",
      "Individuals can join open batches when we announce them, with the same 25% advance.",
    ],
  },
  {
    id: "payments",
    title: "Prices and payments",
    list: [
      "All prices are in Indian Rupees (₹) and are shown on each camp page and on the Olympiad page.",
      "Adventure Olympiad fees are paid online on cnacamp.com through Razorpay, using UPI, debit or credit card, or net banking. We never see or store your card or bank details.",
      `All payments are received by ${site.trust.name}, Rajkot. Camp and trek fees are paid by bank transfer or UPI to the Trust account our team shares with you. These details are never shown on public pages.`,
      <>
        <strong>Camps:</strong> 25% advance when you register, the full fee within one month of registering, and{" "}
        <strong>everything paid at least 3 days before departure.</strong>
      </>,
      "Our rates are based on hotel, transport and food prices at the time of booking. If these go up before the trip, we tell you before any change.",
      <>
        Online Olympiad payments get a receipt by email from <EmailLink contact={contact} />. For camp payments, our team confirms on
        WhatsApp or email.
      </>,
    ],
  },
  {
    id: "included",
    title: "What the fee covers",
    body: [
      "CNA provides stay, meals at camp, treks, activities and sightseeing as written in each camp’s programme. Not included unless the programme says so: amusement rides, entry fees, museums and optional activities such as skiing, paragliding or rafting. Food on the journey is not included.",
    ],
  },
  {
    id: "itinerary",
    title: "Itineraries can change",
    body: [
      "Weather, roads, strikes, natural events or the group’s fitness can change the plan before or during the trip. Our trip leaders may change any part of the schedule for the safety and well-being of the group. Their decision on the ground is final.",
    ],
  },
  {
    id: "safety",
    title: "Health and safety",
    list: [
      "A medical kit is kept at every camp and a doctor is available near the camp.",
      "Trained volunteers and trek leaders travel with every group: male volunteers with boys’ groups, female volunteers with girls’ groups and both with mixed groups.",
      "Safety equipment is ISI-marked.",
      "Tell us about any medical condition, allergy or medicine before the trip.",
      "Baggage and personal belongings stay at the owner’s risk.",
    ],
  },
  {
    id: "conduct",
    title: "Conduct and responsibility",
    body: [
      "The participant, and the school or institution that sends them, is responsible for the participant’s behaviour and valuables. Alcohol, smoking, drugs and unsafe behaviour are not allowed. Misconduct can lead to removal from the camp at the participant’s own cost, with no refund.",
    ],
  },
  {
    id: "liability",
    title: "Things outside our control",
    body: [
      "CNA is not responsible for delays, changes or extra costs caused by natural events, train or flight cancellations, vehicle breakdowns, weather, illness, landslides, closures, strikes or any other cause beyond our reasonable control. Any extra cost from such events is shared by the group.",
    ],
  },
  {
    id: "olympiad",
    title: "Adventure Olympiad",
    list: [
      <>
        The Adventure Olympiad is an Eco-STEM quiz and scholarship scheme. Groups, fees, dates, rounds and scholarships are as per the
        official notice on the{" "}
        <Link className={linkClass} href="/olympiad">
          Olympiad page
        </Link>
        .
      </>,
      "Registration is online only. Each person gets one Registration ID by email and WhatsApp.",
      <>
        The registration fee is non-refundable, as explained in our{" "}
        <Link className={linkClass} href="/cancellation#olympiad">
          Cancellation and refund policy
        </Link>
        .
      </>,
      "You must give correct details. A wrong age, group or school type can cancel the registration without refund.",
      "Selection is not only on quiz marks. The Trust also looks at past activities, medical fitness and teachers’ opinion. Certificates for achievements ticked in the form must be shown at Round 4. The institution’s decision is final.",
    ],
  },
  {
    id: "law",
    title: "Jurisdiction",
    body: ["These terms follow the laws of India. Any dispute is subject to the courts of Rajkot, Gujarat."],
  },
  {
    id: "contact",
    title: "Questions",
    body: [
      <>
        Call or WhatsApp <PhoneLink contact={contact} />, or email <EmailLink contact={contact} />.
      </>,
    ],
  },
];

export const cancellationSections = (contact: SiteSettings): LegalSection[] => [
  {
    id: "charges",
    title: "Camp cancellation charges",
    body: ["If one person, or several people from a group, cancel for any reason, we keep this part of the amount paid so far:"],
    table: [
      ["When you cancel", "Charge"],
      ["28 days or more before the camp", "30%"],
      ["14 to 27 days before", "60%"],
      ["3 to 13 days before", "80%"],
      ["2 days or less before, or on the day of the camp", "100%"],
    ],
    after: [
      "The charge is a percentage of the amount you have paid so far, and depends on how many days before the camp start date we receive your cancellation. Example: for a camp starting on 15 Dec 2026, cancelling on or before 17 Nov costs 30%, from 18 Nov to 1 Dec costs 60%, from 2 Dec to 12 Dec costs 80%, and from 13 Dec to the camp day costs 100%. If you have paid ₹10,000 and cancel on 20 Nov, the charge is ₹6,000 and ₹4,000 comes back.",
    ],
  },
  {
    id: "how",
    title: "How to cancel",
    body: [
      <>
        Tell us in writing, on WhatsApp at <WhatsAppLink contact={contact} /> or by email to <EmailLink contact={contact} />, with your
        name, camp and payment details. The date we receive your message is your cancellation date. We reply to confirm. For a group, the
        group leader or institution sends the names of the members who are cancelling.
      </>,
    ],
  },
  {
    id: "refund",
    title: "Refunds",
    list: [
      <>
        Camp and trek refunds are made <strong>within 60 working days</strong> of your cancellation date, by bank transfer to the account
        that paid.
      </>,
      "Online payments on cnacamp.com (Adventure Olympiad, through Razorpay) are refunded to the same card, UPI or bank account used to pay. Your bank may take a few more days to show it in your account.",
      "Train or air tickets already booked follow the railway’s or airline’s own rules. Any refund from them is passed on to you when we receive it.",
    ],
  },
  {
    id: "failed",
    title: "Failed or double payments",
    body: [
      <>
        This applies to online payments on cnacamp.com (Adventure Olympiad). If money is deducted but the payment fails, or you are charged
        twice, the extra amount is returned in full to the same payment method, usually within 5 to 7 working days. Write to{" "}
        <EmailLink contact={contact} /> with the payment ID if you do not see it.
      </>,
    ],
  },
  {
    id: "cna",
    title: "If CNA changes or cancels",
    body: [
      <>
        If we cancel a camp, you choose: another date, or a full refund of the money you paid us. Changes caused by weather, roads, strikes
        or other events outside our control are explained in our{" "}
        <Link className={linkClass} href="/terms#liability">
          Terms and conditions
        </Link>
        .
      </>,
    ],
  },
  {
    id: "olympiad",
    title: "Adventure Olympiad",
    list: [
      "Olympiad registration fees are non-refundable once the registration is complete, including a wrong group choice, not taking the quiz or not clearing a round.",
      "Fees (official notice): Group A ₹0 (government school) or ₹230; Group B ₹156 (government school) or ₹369; Group C ₹651; Group D ₹1,651; Group E ₹963.",
      "Exceptions: a failed or double payment (section 4) is returned in full. If the Trust cancels the Olympiad, the full fee is refunded.",
    ],
  },
];

// Written for India's Digital Personal Data Protection Act, 2023 (DPDP Act).
export const privacySections = (contact: SiteSettings): LegalSection[] => [
  {
    id: "who",
    title: "Who we are",
    body: [
      `${name} (CNA), backed by ${trust}, ${contact.address.full}. Under the DPDP Act we are the data fiduciary. You are the data principal. This policy covers our website, forms, camps and the Adventure Olympiad.`,
    ],
  },
  {
    id: "what",
    title: "What we collect",
    list: [
      <>
        <strong>Enquiry forms:</strong> name, phone or WhatsApp number, email, group type and size, trip interest and your message.
      </>,
      <>
        <strong>Camp registration:</strong> participant details, emergency contact, medical and fitness details, parent consent for
        under-18s and the risk declaration.
      </>,
      <>
        <strong>Adventure Olympiad registration:</strong> name, parents’ names, birth date, mobile and WhatsApp number, email, address,
        district, school or college, class, school ID number (government school students), principal or class teacher name and number, extra
        achievements, participant photo, Aadhaar number and Aadhaar card copy, and the payment status.
      </>,
      <>
        <strong>Payments:</strong> payment ID, amount and status from Razorpay, for online Olympiad payments. We never see or store your
        card, UPI PIN or bank login.
      </>,
      <>
        <strong>Photos and videos</strong> taken at camps.
      </>,
    ],
  },
  {
    id: "why",
    title: "Why we use it",
    list: [
      "To reply to your enquiry and plan your trip.",
      "To book travel, stay and permits for your camp.",
      "To keep you safe. Medical and emergency details are used only for this.",
      "To run the Olympiad: check age and group, send quiz links and results, and contact selected participants.",
      "Aadhaar is used only to check identity and age. It is never shared for any other purpose.",
      "To send camp news and offers, only if you agree. You can say stop at any time.",
    ],
  },
  {
    id: "consent",
    title: "Your consent",
    body: [
      "We use your data only with your consent, which you give by ticking the box on our forms. The box is never ticked for you. You can withdraw consent at any time by WhatsApp or email.",
    ],
  },
  {
    id: "children",
    title: "Children’s data",
    body: [
      "Under the DPDP Act, anyone under 18 is a child. For children, a parent or legal guardian gives consent in the form before we collect their data. We use children’s data only to run the camp or the Olympiad safely. We do not track children online or show them targeted ads.",
    ],
  },
  {
    id: "share",
    title: "Who we share it with",
    list: [
      "Razorpay, to process online Olympiad payments.",
      "Transport operators, hotels, campsites, camp partners and insurers, only what they need for your trip.",
      "Our website, email and storage service providers, who keep the data on their servers for us.",
      "Government authorities, only when the law requires.",
    ],
    after: ["We do not sell your data."],
  },
  {
    id: "photos",
    title: "Photos on our website and social media",
    body: [
      "We publish camp photos only with consent. For under-18s, we ask a parent or the school first. Want a photo removed? Message us and we take it down.",
    ],
  },
  {
    id: "keep",
    title: "How long we keep it",
    list: [
      "Enquiries: up to 1 year.",
      "Camp registration and safety records: up to 3 years after the camp, or longer if the law needs it.",
      "Olympiad records, including Aadhaar copies and photos: up to 1 year after the final merit list. Payment records are kept as long as tax law needs. The Olympiad form asks for your consent to keep this data for this period.",
    ],
    after: ["After that, we delete the data."],
  },
  {
    id: "rights",
    title: "Your rights",
    body: [
      "You can ask for a summary of your data, correct it, ask us to delete it, withdraw consent, name a person to act for you, and complain to our grievance officer. If you are not satisfied, you can complain to the Data Protection Board of India.",
    ],
  },
  {
    id: "security",
    title: "Keeping it safe",
    body: [
      "Forms are sent over a secure (HTTPS) connection. Olympiad data is kept in CNA’s own secure database. Aadhaar numbers and documents are stored encrypted. Only the CNA team members who need the data can see it. If a data breach affects you, we will tell you and the Data Protection Board, as the law requires.",
    ],
  },
  {
    id: "grievance",
    title: "Grievance officer",
    body: [
      <>
        <strong>Grievance officer:</strong> {grievanceOfficer ? `${grievanceOfficer}, ` : ""}
        {site.trust.name}, Rajkot. Email <EmailLink contact={contact} /> or call <PhoneLink contact={contact} />. We reply within 7 working
        days.
      </>,
    ],
  },
  {
    id: "changes",
    title: "Changes to this policy",
    body: ["If we change this policy, we update the date at the top. For big changes, we tell people on our lists by WhatsApp or email."],
  },
];
