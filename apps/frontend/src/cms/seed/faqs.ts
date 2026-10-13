import type { Faq } from "../../types/content";

export const faqs: Faq[] = [
  {
    question: "Who can join a CNA trip?",
    answer:
      "Schools (Std 9 and above), colleges, families, friends, girls-only groups, corporate teams, teachers, NGOs and clubs. Solo travellers can join from 18. Every trip page says who it suits.",
  },
  {
    question: "Can I join alone?",
    answer: "Yes. If you are 18 or older, you can join any open batch. You travel with the group and our trip leaders from day one.",
  },
  {
    question: "I have never trekked. Can I come?",
    answer:
      "Yes. Many of our trips are made for beginners. If you can walk 5 to 6 km at an easy pace, you can start with a camp or a nature trail.",
  },
  {
    question: "Can families join?",
    answer: "Yes. Families of all ages are welcome on most camps and nature trails. Tell us your group and we will suggest the right trip.",
  },
  {
    question: "Is CNA a tour company?",
    answer:
      "No. CNA is an eco-tourism and adventure club, backed by Saurashtra Education & Charitable Trust. Our trips are about nature, learning and adventure, on a no-profit-no-loss model.",
  },
  {
    question: "Do you have your own campsites?",
    answer:
      "Yes. Our own campus in Manali (Vashisht) and a partner campus at Bet Dwarka. For other places we choose stays that suit the group and the season.",
  },
  {
    question: "How do I book?",
    answer:
      "Send an enquiry or WhatsApp us. We confirm the batch, you pay 25% to hold your seat, and the balance is due 3 days before departure.",
  },
  {
    question: "What is the cancellation policy?",
    answer:
      "10% charge if you cancel 2 months before, 15% one month before, 25% one week before, 50% two days before and 100% on the same day. The full policy has the details.",
  },
  {
    question: "Do you plan custom group trips?",
    answer:
      "Yes. Schools, colleges, families, companies and clubs can pick their own dates and places. Use the custom trip form on the Group Trips page.",
  },
  {
    question: "Do I need to be fit?",
    answer:
      "For camps and nature trails, normal fitness is enough. For high-altitude treks we share a simple 4-week prep plan after you book.",
  },
];

/** The first six appear on the home page; the rest on the About page. */
export const HOME_FAQ_COUNT = 6;

/** Questions the final copy replaced; the content script removes them from the CMS. */
export const RETIRED_FAQ_QUESTIONS = ["Is it safe for first-timers?"];
