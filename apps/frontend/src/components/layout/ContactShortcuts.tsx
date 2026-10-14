import Link from "next/link";
import { ArrowRight, WhatsApp } from "@/components/ui/icons";
import { enquireHref } from "@/content/site";
import { getSiteSettings } from "@/lib/content";

export async function ContactShortcuts() {
  const contact = await getSiteSettings();
  return (
    <>
      <a
        href={contact.whatsappHref}
        rel="noopener"
        target="_blank"
        className="fixed right-6 bottom-6 z-40 hidden h-14 w-14 items-center justify-center rounded-full bg-whatsapp text-light shadow-float transition hover:scale-105 lg:flex"
        aria-label="Chat on WhatsApp"
      >
        <WhatsApp className="text-[28px]" />
      </a>

      <nav
        className="fixed inset-x-0 bottom-0 z-40 grid grid-cols-2 border-t border-line bg-light pb-[env(safe-area-inset-bottom)] lg:hidden"
        aria-label="Quick contact"
      >
        <a
          href={contact.whatsappHref}
          rel="noopener"
          target="_blank"
          className="flex h-16 items-center justify-center gap-2 font-semibold text-whatsapp-dark"
        >
          <WhatsApp className="text-[22px]" /> WhatsApp
        </a>
        <Link href={enquireHref()} className="flex h-16 items-center justify-center gap-2 bg-primary font-bold text-light">
          Enquire now <ArrowRight />
        </Link>
      </nav>
    </>
  );
}
