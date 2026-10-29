import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { RichText } from "@/components/blog/RichText";
import { Photo } from "@/components/media/Photo";
import { BreadcrumbLd } from "@/components/seo/Breadcrumbs";
import { JsonLd } from "@/components/seo/JsonLd";
import { TripCard } from "@/components/trips/TripCard";
import { FaqList } from "@/components/ui/FaqList";
import { ArrowLeft } from "@/components/ui/icons";
import { site } from "@/content/site";
import { getPost, getPosts } from "@/lib/content";
import { formatDate } from "@/lib/format";
import { photoSrc } from "@/lib/photos";
import { absoluteUrl } from "@/lib/seo";

// Posts published later in the admin render on first visit, then stay cached.
export async function generateStaticParams() {
  return (await getPosts()).map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: PageProps<"/blog/[slug]">): Promise<Metadata> {
  const post = await getPost((await params).slug);
  if (!post) return {};
  const path = `/blog/${post.slug}`;
  const image = post.seo.image ?? post.cover;
  return {
    title: post.seo.title ? { absolute: post.seo.title } : post.title,
    description: post.seo.description ?? post.excerpt,
    alternates: { canonical: path },
    openGraph: {
      type: "article",
      url: path,
      title: post.seo.title ?? post.title,
      publishedTime: post.publishedAt,
      images: image ? [{ url: photoSrc(image), alt: image.alt }] : undefined,
    },
  };
}

export default async function PostPage({ params }: PageProps<"/blog/[slug]">) {
  const post = await getPost((await params).slug);
  if (!post) notFound();

  const path = `/blog/${post.slug}`;
  const articleLd = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: post.title,
    description: post.excerpt,
    datePublished: post.publishedAt,
    url: absoluteUrl(path),
    image: post.cover ? absoluteUrl(photoSrc(post.cover)) : undefined,
    author: post.author === "Team CNA" ? { "@type": "Organization", name: site.legalName } : { "@type": "Person", name: post.author },
    publisher: { "@id": absoluteUrl("/#organization") },
  };
  const faqLd = post.faqs.length
    ? {
        "@context": "https://schema.org",
        "@type": "FAQPage",
        mainEntity: post.faqs.map((f) => ({
          "@type": "Question",
          name: f.question,
          acceptedAnswer: { "@type": "Answer", text: f.answer },
        })),
      }
    : null;

  return (
    <>
      <article>
        <header className="wrap mt-12 max-w-5xl">
          <nav aria-label="Breadcrumb" className="text-[16px] font-semibold text-muted">
            <Link href="/blog" className="hover:text-primary">
              <ArrowLeft className="mr-1.5" />
              Blog
            </Link>
          </nav>
          <h1 className="display h-page mt-4">{post.title}</h1>
          <p className="lead mt-4 max-w-3xl">{post.excerpt}</p>
          <p className="mt-5 text-[14.5px] font-medium text-muted">
            <span className="font-semibold text-dark">{post.author}</span> ·{" "}
            <time dateTime={post.publishedAt}>{formatDate(post.publishedAt)}</time> · {site.name}
          </p>
        </header>

        {post.cover && (
          <div className="wrap mt-10 max-w-5xl">
            <div className="relative aspect-[16/9] overflow-hidden rounded-card bg-soft">
              <Photo img={post.cover} preload sizes="(min-width: 1024px) 1000px, 100vw" />
            </div>
          </div>
        )}

        <div className="wrap mt-10 max-w-3xl">
          <RichText data={post.content} />
        </div>

        {post.faqs.length > 0 && (
          <section className="wrap mt-16 max-w-3xl" aria-labelledby="faq-title">
            <h2 id="faq-title" className="h-sub">
              Questions we get asked
            </h2>
            <FaqList faqs={post.faqs} className="mt-4" />
          </section>
        )}
      </article>

      {post.relatedTrips.length > 0 && (
        <section className="wrap mt-20" aria-labelledby="related-title">
          <h2 id="related-title" className="display h-sub">
            Trips in this story
          </h2>
          <ul className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {post.relatedTrips.map((t) => (
              <li key={t.slug}>
                <TripCard trip={t} />
              </li>
            ))}
          </ul>
        </section>
      )}

      <JsonLd data={articleLd} />
      {faqLd && <JsonLd data={faqLd} />}
      <BreadcrumbLd
        items={[
          { name: "Home", path: "/" },
          { name: "Blog", path: "/blog" },
          { name: post.title, path },
        ]}
      />
    </>
  );
}
