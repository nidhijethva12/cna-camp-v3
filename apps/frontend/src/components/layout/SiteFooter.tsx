import Image from "next/image";
import Link from "next/link";
import { footerNav, site } from "@/content/site";
import { FacebookBrand, Fire, InstagramBrand, YoutubeLogo } from "@/components/ui/icons";
import { getPosts, getSiteSettings } from "@/lib/content";
import { FooterGroup } from "./FooterGroup";

const SOCIAL_ICONS: Record<string, (props: { className?: string }) => React.ReactNode> = {
  Instagram: InstagramBrand,
  Facebook: FacebookBrand,
  YouTube: YoutubeLogo,
};

export async function SiteFooter() {
  const [contact, posts] = await Promise.all([getSiteSettings(), getPosts()]);
  // Instagram and Facebook always show; Facebook links out once its URL is added in Site settings.
  // Other platforms appear only when they have a link.
  const links = new Map(contact.social.map((s) => [s.label, s.href]));
  const social = [
    { label: "Instagram", href: links.get("Instagram") ?? null },
    { label: "Facebook", href: links.get("Facebook") ?? null },
    ...contact.social.filter((s) => s.href && !["Instagram", "Facebook"].includes(s.label)),
  ];
  const resources = posts.length ? footerNav.resources : footerNav.resources.filter((l) => l.href !== "/blog");
  return (
    <footer className="mt-24 bg-dark text-light">
      <div className="wrap grid gap-0 py-12 md:grid-cols-2 md:gap-10 md:py-16 lg:grid-cols-[1.5fr_1fr_0.8fr_0.8fr_1.3fr]">
        <div className="pb-6 md:pb-0">
          <div className="flex items-center gap-3">
            <Image src="/img/logo.png" alt="" width={56} height={56} className="h-14 w-14" />
            <p className="display text-2xl">
              Climber Nature
              <br />
              Adventure Club
            </p>
          </div>
          <p className="mt-5 max-w-sm text-light/70">
            Treks, camps and outdoor learning from Rajkot since 1997. Backed by {site.trust.name}.
          </p>
          <div className="mt-6 flex gap-4">
            {social.map((s) => {
              const Icon = SOCIAL_ICONS[s.label] ?? InstagramBrand;
              const className = "flex items-center justify-center text-[36px] transition";
              return s.href ? (
                <a
                  key={s.label}
                  href={s.href}
                  aria-label={s.label}
                  title={s.label}
                  className={`${className} hover:scale-110`}
                  rel="noopener"
                  target="_blank"
                >
                  <Icon />
                </a>
              ) : (
                <span
                  key={s.label}
                  role="img"
                  aria-label={`${s.label} (coming soon)`}
                  title={`${s.label}: coming soon`}
                  className={`${className} opacity-50`}
                >
                  <Icon />
                </span>
              );
            })}
          </div>
        </div>

        <FooterLinks title="Trips by region" links={footerNav.regions} />
        <FooterLinks title="Company" links={footerNav.company} />
        <FooterLinks title="Resources" links={resources} />

        <FooterGroup title="Talk to us">
          <address className="space-y-3 text-light/85 not-italic">
            <p>
              <a href={contact.phoneHref} className="font-mono hover:text-secondary">
                {contact.phone}
              </a>
            </p>
            <p>
              <a href={`mailto:${contact.email}`} className="break-all hover:text-secondary">
                {contact.email}
              </a>
            </p>
            <p className="text-sm text-light/60">{contact.address.full}</p>
          </address>
        </FooterGroup>
      </div>

      <div className="border-t border-light/10">
        <div className="wrap flex flex-col gap-3 py-6 text-[13.5px] font-medium text-light/50 md:flex-row md:items-center md:justify-between">
          <span>
            © {new Date().getFullYear()} {site.legalName}
          </span>
          <span className="flex flex-wrap gap-4">
            {footerNav.legal.map((l) => (
              <Link key={l.href} href={l.href} className="hover:text-light">
                {l.label}
              </Link>
            ))}
          </span>
        </div>
      </div>
    </footer>
  );
}

function FooterLinks({ title, links }: { title: string; links: { label: string; href: string; hot?: boolean }[] }) {
  return (
    <FooterGroup title={title}>
      <ul className="space-y-2" aria-label={title}>
        {links.map((l) => (
          <li key={l.href}>
            <Link href={l.href} className="inline-flex items-center gap-2 py-1 hover:text-secondary lg:py-0">
              {l.label}
              {l.hot && (
                <span className="hot-badge inline-flex items-center gap-1 rounded-full bg-primary px-2 py-0.5 text-[11px] font-bold tracking-wide text-light uppercase">
                  <Fire className="flame text-[13px] text-secondary" />
                  Hot
                </span>
              )}
            </Link>
          </li>
        ))}
      </ul>
    </FooterGroup>
  );
}
