import Link from "next/link";
import type { LegalSection } from "@/components/layout/LegalPage";
import { site } from "@/content/site";
import type { SiteSettings } from "@/lib/content";

const linkClass = "font-semibold text-dark underline";
const name = site.legalName;
const trust = `${site.trust.name} (Reg. ${site.trust.registration})`;

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

// Plain-words drafts from CNA's existing terms. To be reviewed by CNA and a legal adviser before launch.
export const termsSections = (contact: SiteSettings): LegalSection[] => [
  {
    id: "about",
    title: "About these terms",
    body: [
      <>
        These terms apply to every camp, trek and nature trail run by {name} (CNA), Rajkot, backed by {trust}. CNA works on a{" "}
        <strong>no-profit-no-loss</strong> basis. Each camp is arranged only for the people who register for it.
      </>,
      "When you register, you (or your school, college or group leader on your behalf) accept these terms. If you register someone under 18, a parent or guardian must agree to them too.",
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
      "Send the group list, a registration form and a risk certificate for every member, your travel choice (train, bus, car or air) and the 25% advance.",
      "We hold a group meeting before the camp to explain activities, travel, food and camp rules.",
      "Individuals can join open batches when we announce them, with the same 25% advance.",
    ],
  },
  {
    id: "payments",
    title: "Payments",
    body: [
      "Our rates are based on hotel, transport and food prices at the time of booking. If fuel, food, hotel or airline rates go up before the trip, the new rates apply to travel, food and camp charges. We tell you before any change.",
    ],
    list: [
      <>
        <strong>25% advance</strong> when you register, ideally 2 to 3 months before the camp.
      </>,
      "The full fee within one month of registering.",
      <>
        <strong>Everything paid at least 3 days before departure.</strong>
      </>,
      "Our team shares payment details with you directly. They are never shown on public pages. Pay only to the account our team confirms.",
    ],
  },
  {
    id: "included",
    title: "What the fee covers",
    body: ["CNA provides stay, meals at camp, treks, activities and sightseeing as written in each camp’s programme."],
    list: [
      "Not included unless your programme says so: amusement park rides, entry fees, museums and optional activities such as skiing, paragliding or rafting. The participant or the institution pays for these.",
      "Food on the journey is not included. We can arrange it on request at extra cost.",
    ],
  },
  {
    id: "itinerary",
    title: "Itineraries can change",
    body: [
      "Each itinerary shows the likely plan. Weather, roads, strikes, natural events or the group’s fitness can change it before or during the trip. Our trip leaders may change any part of the schedule for the safety, comfort and well-being of the group. Their decision on the ground is final.",
    ],
  },
  {
    id: "safety",
    title: "Health, safety and insurance",
    list: [
      "A medical kit is kept at every camp and a doctor is available near the camp. Our volunteer staff and ambulance access are ready for emergencies.",
      "Trained volunteers travel with every group: male volunteers with boys’ groups, female volunteers with girls’ groups and both with mixed groups.",
      "Safety equipment is ISI-marked. Bedding in hotels and tents is washed and clean.",
      "For camps longer than 5 days, CNA arranges mediclaim cover for the camp period at its own cost (each member fills a form). For shorter trips we suggest personal travel insurance.",
      "Tell us about any medical condition, allergy or medicine before the trip. Participants must be fit for the activities they sign up for.",
      "Baggage and personal belongings stay at the owner’s risk.",
    ],
  },
  {
    id: "conduct",
    title: "Conduct and responsibility",
    body: [
      "The participant, and the school or institution that sends them, is responsible for the participant’s behaviour and valuables during the camp. Alcohol, smoking, drugs and unsafe behaviour are not allowed. Misconduct can lead to removal from the camp at the participant’s own cost, with no refund.",
    ],
  },
  {
    id: "liability",
    title: "Things outside our control",
    body: [
      "CNA is not responsible for delays, changes or extra costs caused by natural events, flight or train cancellations, vehicle breakdowns, weather, illness, landslides, political closures, strikes or any other cause beyond our reasonable control, or for loss, injury or damage arising from them. Any extra cost from such events (extra night, changed route) is shared by the group.",
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
    title: "Cancellation charges",
    body: ["If one person, or several people from a group, cancel for any reason, we keep this part of the camp fee:"],
    table: [
      ["When you cancel", "Charge"],
      ["2 months or more before the camp", "10%"],
      ["1 month before", "15%"],
      ["1 week before", "25%"],
      ["2 days before", "50%"],
      ["On the day of the camp", "100%"],
    ],
    after: ["Example: on a ₹10,000 camp fee, cancelling 1 month before costs ₹1,500. You get the rest back."],
  },
  {
    id: "how",
    title: "How to cancel",
    body: [
      <>
        Tell us in writing, on WhatsApp at{" "}
        <a className={linkClass} href={contact.whatsappHref} target="_blank" rel="noopener">
          {contact.phone}
        </a>{" "}
        or by email to <EmailLink contact={contact} />. The date we receive your message is your cancellation date. We reply to confirm.
      </>,
      "For a group, the group leader or institution sends the names of the members who are cancelling.",
    ],
  },
  {
    id: "refund",
    title: "Refunds",
    body: [
      "After the charge above, we refund the rest of the amount paid to the person or institution that paid it, by bank transfer or to the original payment method.",
      <>
        <strong>Refund timeline:</strong> within [number] working days of your cancellation date.
      </>,
      "Train or air tickets already booked follow the railway’s or airline’s own cancellation rules. Any refund from them is passed on to you when we receive it.",
    ],
  },
  {
    id: "cna",
    title: "If CNA changes or cancels",
    body: [
      <>
        If we have to cancel a camp, you choose: another date, or a refund of the money you paid us. Changes caused by weather, roads,
        strikes or other events outside our control are explained in our{" "}
        <Link className={linkClass} href="/terms#liability">
          terms &amp; conditions
        </Link>
        .
      </>,
    ],
  },
  {
    id: "olympiad",
    title: "Adventure Olympiad",
    body: [
      "Olympiad registration fees (₹90, ₹230, ₹320 or ₹923) are non-refundable in all cases, including a wrong group choice or not clearing a round.",
    ],
  },
];

// Written for India's Digital Personal Data Protection Act, 2023. Needs legal review.
export const privacySections = (contact: SiteSettings): LegalSection[] => [
  {
    id: "who",
    title: "Who we are",
    body: [
      `${name} (CNA), ${contact.address.full}, backed by ${site.trust.name}. Under the DPDP Act we are the “data fiduciary”: we decide what personal data is collected and why. You are the “data principal”. This policy covers our website, our forms, our camps and the Adventure Olympiad.`,
    ],
  },
  {
    id: "what",
    title: "What we collect",
    list: [
      <>
        <strong>Enquiry forms:</strong> name, phone or WhatsApp number, email (optional), group type and size, trip interest and your
        message.
      </>,
      <>
        <strong>Camp registration:</strong> participant details, emergency contact, medical and fitness information, parental consent for
        under-18s and the risk declaration.
      </>,
      <>
        <strong>Adventure Olympiad:</strong> student name, age group, school or college, class, contact number and payment confirmation.
      </>,
      <>
        <strong>Photos and videos</strong> taken at camps.
      </>,
    ],
    after: ["We collect only what we need for these purposes. We do not ask for card or bank details on this website."],
  },
  {
    id: "why",
    title: "Why we use it",
    list: [
      "To reply to your enquiry and plan your trip.",
      "To book travel, stay and permits for your camp.",
      "To keep you safe: medical and emergency details are used only for this.",
      "To run the Olympiad and contact selected students.",
      "To send camp news and offers, only if you agree. You can say stop at any time.",
    ],
  },
  {
    id: "consent",
    title: "Your consent",
    body: [
      "We use your data only with your consent, which you give by ticking the box on our forms. The box is never ticked for you. You can withdraw consent at any time by WhatsApp or email. Withdrawing does not undo what we did before, but we stop using your data from then on, except where the law needs us to keep it.",
    ],
  },
  {
    id: "children",
    title: "Children’s data",
    body: [
      "Under the DPDP Act, anyone under 18 is a child. For children, a parent or legal guardian (or the school, with the parent’s knowledge) gives consent before we collect their data. We use children’s data only to run the camp or the Olympiad safely. We do not track children’s behaviour online or show them targeted ads.",
    ],
  },
  {
    id: "share",
    title: "Who we share it with",
    body: [
      "Only with people who help run your trip, such as transport operators, hotels and campsites, camp partners and insurers, and only what they need for that trip. Our website and form tools may store data on servers run by our service providers. We do not sell your data. We share it with government authorities only when the law requires.",
    ],
  },
  {
    id: "photos",
    title: "Photos on our website and social media",
    body: [
      "We publish camp photos only with consent. For under-18s, we ask a parent or the school first. Want a photo of you or your child removed? Message us and we take it down from our website and our social pages.",
    ],
  },
  {
    id: "keep",
    title: "How long we keep it",
    body: [
      "Enquiries: up to [period]. Camp registration and safety records: for as long as needed for the camp and any legal requirement, up to [period]. Olympiad records: up to [period] after the final merit list. After that, we delete the data.",
    ],
  },
  {
    id: "rights",
    title: "Your rights",
    list: [
      "Ask for a summary of the data we hold about you and how we use it.",
      "Correct or update it.",
      "Ask us to delete it, once it is no longer needed for your trip or by law.",
      "Withdraw your consent.",
      "Name a person who can use these rights for you if you die or cannot act yourself.",
      "Complain to our grievance contact below. If you are not satisfied with our reply, complain to the Data Protection Board of India.",
    ],
    after: ["Under the same law, please give us correct information and do not file false complaints."],
  },
  {
    id: "security",
    title: "Keeping it safe",
    body: [
      "Forms are sent over a secure (HTTPS) connection. Only the CNA team members who need the data can see it. Payment details are never collected through public pages. If a data breach ever affects you, we will tell you and the Data Protection Board, as the law requires.",
    ],
  },
  {
    id: "grievance",
    title: "Grievance contact",
    body: [
      <>
        Email <EmailLink contact={contact} /> or call <PhoneLink contact={contact} />.
      </>,
      <>
        <strong>Grievance officer:</strong> [Name], [role], CNA
      </>,
      <>
        <strong>Response time:</strong> we reply within [number] days.
      </>,
    ],
  },
  {
    id: "changes",
    title: "Changes to this policy",
    body: [
      "If we change this policy, we update the date at the top of this page. For big changes, we tell people on our lists by WhatsApp or email.",
    ],
  },
];
