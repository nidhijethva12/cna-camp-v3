"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ArrowRight, WhatsApp } from "@/components/ui/icons";
import { registrationPath } from "@/content/registration";
import { enquireHref } from "@/content/site";

const olympiadPages = { "/olympiad": "en", "/olympiad/gu": "gu" } as const;
const registerLabel = { en: "Register now", gu: "હમણાં રજિસ્ટર કરો" } as const;

/**
 * The phone's bottom bar: WhatsApp and "Contact us". On the Olympiad page, while registration is open,
 * the second button is "Register now" for that page's language; on the registration form it is hidden.
 */
export function MobileContactBar({ whatsappHref, olympiadOpen }: { whatsappHref: string; olympiadOpen: boolean }) {
  const pathname = usePathname().replace(/\/+$/, "") || "/";
  if (pathname === registrationPath.en || pathname === registrationPath.gu) return null;
  const lang = olympiadOpen ? olympiadPages[pathname as keyof typeof olympiadPages] : undefined;

  return (
    <nav
      className="fixed inset-x-0 bottom-0 z-40 grid grid-cols-2 border-t border-line bg-light pb-[env(safe-area-inset-bottom)] lg:hidden"
      aria-label="Quick contact"
    >
      <a
        href={whatsappHref}
        rel="noopener"
        target="_blank"
        className="flex h-16 items-center justify-center gap-2 font-semibold text-whatsapp-dark"
      >
        <WhatsApp className="text-[22px]" /> WhatsApp
      </a>
      {lang ? (
        <Link
          href={registrationPath[lang]}
          lang={lang}
          className="flex h-16 items-center justify-center gap-2 bg-primary text-center font-bold text-light"
        >
          {registerLabel[lang]} <ArrowRight />
        </Link>
      ) : (
        <Link href={enquireHref()} className="flex h-16 items-center justify-center gap-2 bg-primary font-bold text-light">
          Contact us <ArrowRight />
        </Link>
      )}
    </nav>
  );
}
