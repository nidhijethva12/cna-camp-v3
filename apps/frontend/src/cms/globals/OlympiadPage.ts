import type { Field, GlobalConfig } from "payload";
import { anyone, canEdit, hiddenFromAuthors } from "../access";
import { revalidateSiteGlobal } from "../hooks/revalidate";

type TextOptions = { label?: string; description?: string; optional?: boolean };

/** Words shown on the page: saved separately for English and Gujarati. */
const text = (name: string, { label, description, optional }: TextOptions = {}): Field => ({
  name,
  label,
  type: "text",
  localized: true,
  required: !optional,
  admin: description ? { description } : undefined,
});

const long = (name: string, { label, description, optional }: TextOptions = {}): Field => ({
  name,
  label,
  type: "textarea",
  localized: true,
  required: !optional,
  admin: description ? { description } : undefined,
});

/** Links and file paths: the same in both languages. */
const link = (name: string, description: string, optional = false): Field => ({
  name,
  type: "text",
  required: !optional,
  admin: { description },
});

const row = (...fields: Field[]): Field => ({ type: "row", fields });

const textList = (name: string, label: string, description?: string): Field => ({
  name,
  label,
  type: "array",
  admin: description ? { description } : undefined,
  fields: [text("text")],
});

const sectionText = (name: string, label: string, withLead = true): Field => ({
  name,
  label,
  type: "group",
  fields: [
    row(text("eyebrow", { description: "Small line above the heading." }), text("title")),
    ...(withLead ? [long("lead", { optional: true })] : []),
  ],
});

const groupIds = ["A", "B", "C", "D", "E"].map((id) => ({ label: `Group ${id}`, value: id }));

export const OlympiadPage: GlobalConfig = {
  slug: "olympiad-page",
  label: "Olympiad page",
  admin: {
    hidden: hiddenFromAuthors,
    group: "Olympiad",
    description:
      "Every piece of text on the Olympiad page. Switch the language at the top right to edit the Gujarati. An empty Gujarati box shows the English.",
  },
  access: { read: anyone, update: canEdit },
  hooks: revalidateSiteGlobal,
  fields: [
    {
      type: "tabs",
      tabs: [
        {
          label: "Hero & meta",
          fields: [
            row(
              text("name", { description: "Name of the Olympiad, e.g. Adventure Olympiad 2.0" }),
              text("eyebrow", { description: "Small line above the name." }),
            ),
            long("intro", { description: "Short paragraph under the name." }),
            row(
              text("opensOn", { label: "Opens on", description: "Date registration opens, as shown, e.g. 15 Nov 2026" }),
              text("motto", { description: "Line in the top bar, e.g. ।। विद्यार्थी देवो भव ।।" }),
            ),
            {
              name: "meta",
              label: "Search and sharing",
              type: "group",
              admin: { description: "What Google and WhatsApp show for this page." },
              fields: [
                text("title", { description: "Browser tab and Google title." }),
                long("description", { description: "Google description, about 150 characters." }),
                text("ogTitle", { label: "Share title", description: "Title when the link is shared." }),
                long("ogDescription", { label: "Share description" }),
              ],
            },
          ],
        },
        {
          label: "Notice board & dates",
          fields: [
            {
              name: "notice",
              label: "Main notice",
              type: "group",
              admin: { description: "The official notice pinned at the top of the notice board." },
              fields: [
                text("title"),
                text("meta", { label: "Details", description: "Notice number, date and language." }),
                link("href", "PDF link, e.g. /docs/olympiad-2-notice.pdf"),
              ],
            },
            {
              name: "dates",
              label: "Key dates",
              type: "array",
              admin: { description: "In date order." },
              fields: [
                row(text("when", { description: "e.g. 15 Nov to 14 Dec 2026" }), text("title")),
                text("note", { optional: true }),
                { name: "key", label: "Highlight this date", type: "checkbox", defaultValue: false },
              ],
            },
          ],
        },
        {
          label: "How it works",
          fields: [
            {
              name: "steps",
              type: "array",
              admin: { description: "The steps from registration to the merit list." },
              fields: [row(text("title"), text("when")), long("text")],
            },
            {
              name: "glance",
              label: "The quiz at a glance",
              type: "array",
              fields: [
                row(
                  {
                    name: "icon",
                    type: "select",
                    required: true,
                    options: ["questions", "timer", "star", "language", "book"].map((v) => ({
                      label: v[0].toUpperCase() + v.slice(1),
                      value: v,
                    })),
                  },
                  text("value", { description: "Big text, e.g. 60 minutes" }),
                  text("label", { description: "Small text under it." }),
                ),
              ],
            },
          ],
        },
        {
          label: "Groups",
          fields: [
            {
              name: "groups",
              type: "array",
              admin: { description: "One entry per group, A to D." },
              fields: [
                row(
                  { name: "groupId", label: "Group", type: "select", required: true, options: groupIds },
                  text("name", { description: "e.g. Group A" }),
                  text("short", { description: "e.g. Std 8 and 9" }),
                ),
                text("title"),
                long("who", { label: "Who can join" }),
                text("finder", { description: "What the group finder dropdown says for this group." }),
                {
                  name: "fees",
                  type: "array",
                  fields: [row(text("label"), text("amount", { description: "As shown, e.g. ₹90" }))],
                },
                text("feeSummary", { label: "Fee in one line" }),
                text("quiz"),
                long("prize"),
                {
                  name: "journey",
                  type: "array",
                  admin: { description: "From the first round to the final camp." },
                  fields: [
                    row(text("year", { optional: true, description: "e.g. 2026-27" }), text("title")),
                    text("note", { optional: true }),
                    { name: "goal", label: "Final goal", type: "checkbox", defaultValue: false },
                  ],
                },
              ],
            },
          ],
        },
        {
          label: "Schools & teachers",
          fields: [
            {
              name: "partners",
              type: "array",
              admin: { description: "The school and ambassador cards." },
              fields: [
                row(
                  {
                    name: "kind",
                    type: "select",
                    required: true,
                    options: [
                      { label: "School", value: "school" },
                      { label: "Ambassador", value: "ambassador" },
                    ],
                    admin: { description: "Which sign-up form the button opens." },
                  },
                  {
                    name: "icon",
                    type: "select",
                    required: true,
                    options: [
                      { label: "School", value: "school" },
                      { label: "Ambassador", value: "ambassador" },
                    ],
                  },
                ),
                row(text("title"), text("cta", { label: "Button" })),
                text("who"),
                textList("points", "Points"),
              ],
            },
          ],
        },
        {
          label: "Scholarships",
          fields: [
            {
              name: "scholarships",
              type: "array",
              fields: [
                row(
                  link("img", "Photo path, e.g. /img/olympiad/ketankumar-trivedi.webp"),
                  link("focus", "Photo position, e.g. object-[center_25%]"),
                ),
                text("alt", { label: "Photo description", description: "For screen readers and Google." }),
                text("kicker", { description: "Small line above the name." }),
                text("name"),
                text("life"),
                long("quote"),
                row(text("award", { description: "e.g. 60 to 100%" }), text("awardFor", { label: "Award for" })),
                {
                  name: "facts",
                  type: "array",
                  fields: [text("label", { description: "e.g. Education" }), long("value")],
                },
                {
                  name: "pdf",
                  label: "PDF",
                  type: "group",
                  fields: [row(text("label"), link("href", "Full web address of the PDF."))],
                },
              ],
            },
          ],
        },
        {
          label: "Prizes",
          fields: [
            {
              name: "prizes",
              type: "array",
              fields: [
                link("img", "Photo path, e.g. /img/olympiad/ladakh-trek.webp"),
                text("alt", { label: "Photo description", description: "For screen readers and Google." }),
                row(text("groups", { description: "e.g. Groups A, B and C" }), text("title")),
                long("text"),
                row(text("place"), text("meta", { description: "e.g. 2026-27" })),
                {
                  name: "link",
                  type: "group",
                  admin: { description: "Optional button. Leave the link empty to hide it." },
                  fields: [row(text("label", { optional: true }), link("href", "e.g. /trips/astro-adventure-manali", true))],
                },
              ],
            },
          ],
        },
        {
          label: "Rules & registration",
          fields: [
            {
              name: "rules",
              type: "array",
              admin: { description: "The bold start is followed straight by the rest, so begin the rest with a space or comma." },
              fields: [row(text("lead", { label: "Bold start" }), text("rest"))],
            },
            textList("keepReady", "Keep these ready", "Checklist next to the registration box."),
            {
              name: "remindOptions",
              label: "Reminder choices",
              type: "array",
              admin: { description: "Choices in the “remind me” form." },
              fields: [
                row(
                  { name: "value", type: "text", required: true, admin: { description: "Saved code, e.g. A or school. Do not change." } },
                  text("label"),
                ),
              ],
            },
          ],
        },
        {
          label: "FAQs",
          fields: [
            {
              name: "faqs",
              label: "FAQs",
              type: "array",
              fields: [text("question"), long("answer")],
            },
          ],
        },
        {
          label: "Labels",
          name: "ui",
          description: "Headings, buttons and small labels around the content.",
          fields: [
            row(text("language"), text("contactUs", { label: "Contact us" }), text("seeGroups", { label: "See the groups" })),
            {
              name: "bar",
              label: "Top bar",
              type: "group",
              fields: [row(text("opens"), text("details"))],
            },
            {
              name: "scholarshipLine",
              type: "group",
              admin: { description: "Hero line, e.g. with up to · 100% · scholarship" },
              fields: [row(text("before"), text("value"), text("after"))],
            },
            {
              name: "heroBadge",
              type: "group",
              fields: [row(text("title"), text("text"))],
            },
            {
              name: "joint",
              label: "Joint initiative",
              type: "group",
              fields: [row(text("label"), text("trustLine"), text("cnaLine"))],
            },
            {
              name: "nav",
              label: "Section menu",
              type: "group",
              fields: [
                row(text("notices"), text("how"), text("groups"), text("partners")),
                row(text("scholarships"), text("prizes"), text("rules"), text("faq", { label: "FAQ" })),
              ],
            },
            {
              name: "sections",
              label: "Section headings",
              type: "group",
              fields: [
                sectionText("notices", "Notice board"),
                sectionText("how", "How it works"),
                sectionText("groups", "Groups"),
                sectionText("partners", "Schools and teachers"),
                sectionText("scholarships", "Scholarships"),
                sectionText("prizes", "Prizes"),
                sectionText("rules", "Rules"),
                sectionText("faq", "FAQs"),
              ],
            },
            {
              name: "noticeBoard",
              type: "group",
              fields: [
                row(text("title"), text("from"), text("live"), text("official")),
                row(text("viewPdf", { label: "View PDF" }), text("newTab", { label: "Opens in a new tab" })),
                text("moreTitle"),
                long("moreText"),
              ],
            },
            row(text("keyDates"), text("glanceLabel", { label: "Quiz at a glance" })),
            {
              name: "register",
              label: "Registration box",
              type: "group",
              fields: [row(text("eyebrow"), text("title")), long("text"), row(text("help"), text("keepReady"))],
            },
            {
              name: "help",
              label: "Help box",
              type: "group",
              fields: [
                text("title"),
                long("text"),
                row(text("whatsapp", { label: "WhatsApp button" }), text("call", { label: "Call button" }), text("trustEmail")),
                text("whatsappMessage", { description: "Pre-filled WhatsApp message." }),
              ],
            },
            {
              name: "picker",
              label: "Group finder",
              type: "group",
              fields: [
                row(text("participant"), text("choose"), text("empty")),
                row(text("thisIs"), text("fee"), text("quiz"), text("prize")),
                row(text("journey"), text("group"), text("tabsLabel")),
              ],
            },
          ],
        },
      ],
    },
  ],
};
