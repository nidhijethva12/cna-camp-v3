import type { Metadata } from "next";
import Link from "next/link";
import { PostCard } from "@/components/blog/PostCard";
import { PageHead } from "@/components/layout/PageHead";
import { getPosts, getSiteSettings } from "@/lib/content";

export const metadata: Metadata = {
  title: { absolute: "Trekking Tips, Packing Lists & Camp Guides | CNA Camp" },
  description:
    "Beginner trek guides, Himalayan packing lists, Gujarat weekend nature spots and school camp safety tips, from a Rajkot club with 1,000+ camps behind it.",
  openGraph: {
    title: "Stories and tips from the trail | CNA Camp",
    description: "Practical guides on first treks, packing and safe camps, from people who lead them.",
  },
  alternates: { canonical: "/blog" },
};

export default async function BlogPage() {
  const [posts, contact] = await Promise.all([getPosts(), getSiteSettings()]);

  return (
    <>
      <PageHead
        img="cna/real/trek-02"
        imgAlt="A line of trekkers walking up a green Himalayan hillside"
        eyebrow="Blog"
        title="Stories from the trail"
        text="What 20+ years of camps have taught us about packing, preparing and picking the right place. Written by people who still lead the walks."
      />
      <section className="wrap mt-12">
        {posts.length ? (
          <ul className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {posts.map((p) => (
              <li key={p.slug} className="reveal">
                <PostCard post={p} />
              </li>
            ))}
          </ul>
        ) : (
          <p className="rounded-card border border-line p-6 text-muted">
            The first stories are on their way. Meanwhile,{" "}
            <Link href="/trips" className="font-semibold text-primary underline">
              browse our trips
            </Link>
            .
          </p>
        )}
        <p className="mt-12 rounded-card bg-soft p-5 text-muted">
          Got a question you want us to write about?{" "}
          <a href={contact.whatsappHref} target="_blank" rel="noopener" className="font-semibold text-primary underline">
            WhatsApp us
          </a>
          , and we may answer it in the next post.
        </p>
      </section>
    </>
  );
}
