import Image from "next/image";
import Link from "next/link";
import { enquireHref, mainNav, site } from "@/content/site";
import { getSiteSettings } from "@/lib/content";
import { DesktopNav } from "./DesktopNav";
import { MobileNav } from "./MobileNav";

const afterBatches = mainNav.findIndex((item) => item.href === "/batches") + 1;
const nav = [...mainNav.slice(0, afterBatches), { label: "Olympiad", href: "/olympiad" }, ...mainNav.slice(afterBatches)];

export async function SiteHeader() {
  const contact = await getSiteSettings();
  return (
    <>
      <header className="sticky top-0 z-40 border-b border-line bg-light/95 backdrop-blur">
        <div className="wrap flex h-[72px] items-center justify-between gap-6">
          <Link href="/" className="flex shrink-0 items-center gap-3" aria-label={`${site.legalName} home`}>
            <Image src="/img/logo.png" alt="" width={56} height={56} className="h-14 w-14" />
            <span className="display text-[17px] leading-[1.1] sm:text-[19px]">
              Climber Nature
              <br />
              Adventure Club
            </span>
          </Link>

          <DesktopNav items={nav} />

          <div className="flex items-center gap-2">
            <a href={contact.phoneHref} className="hidden font-mono text-[13px] whitespace-nowrap 2xl:block">
              {contact.phone}
            </a>
            <Link href={enquireHref()} className="btn btn-primary hidden py-3! sm:inline-flex">
              Contact us
            </Link>
            <MobileNav items={nav} contact={{ phone: contact.phone, phoneHref: contact.phoneHref, whatsappHref: contact.whatsappHref }} />
          </div>
        </div>
      </header>
    </>
  );
}
