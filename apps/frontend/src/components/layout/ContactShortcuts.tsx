import { WhatsApp } from "@/components/ui/icons";
import { getSiteSettings } from "@/lib/content";
import { MobileContactBar } from "./MobileContactBar";

/** WhatsApp on desktop; on phones a bottom bar with WhatsApp and a main action for the page. */
export async function ContactShortcuts({ olympiadOpen }: { olympiadOpen: boolean }) {
  const contact = await getSiteSettings();
  return (
    <>
      <a
        href={contact.whatsappHref}
        rel="noopener"
        target="_blank"
        data-contact-shortcut
        className="fixed right-6 bottom-6 z-40 hidden h-14 w-14 items-center justify-center rounded-full bg-whatsapp text-light shadow-float transition hover:scale-105 lg:flex"
        aria-label="Chat on WhatsApp"
      >
        <WhatsApp className="text-[28px]" />
      </a>

      <MobileContactBar whatsappHref={contact.whatsappHref} olympiadOpen={olympiadOpen} />
    </>
  );
}
