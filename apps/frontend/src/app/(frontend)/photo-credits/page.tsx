import type { Metadata } from "next";
import { PageHead } from "@/components/layout/PageHead";
import { photoCredits } from "@/content/credits";
import { getTrips } from "@/lib/content";

export const metadata: Metadata = {
  title: { absolute: "Photo Credits | CNA Camp" },
  description:
    "Credits for the Creative Commons photos used on the CNA Camp website, with photographer names and licences. We are replacing them with our own trip photos.",
  openGraph: {
    title: "Photo credits | CNA Camp",
    description: "Thank you to the photographers whose Creative Commons photos we use.",
  },
  alternates: { canonical: "/photo-credits" },
};

const otherSlots: Record<string, string> = {
  "campus-dwarka": "Bet Dwarka campus",
  "campus-hingolgadh": "Hingolgadh camp",
  "olympiad-popup": "Olympiad pop-up",
  "olympiad-hero": "Olympiad page",
};

export default async function PhotoCreditsPage() {
  const trips = await getTrips();
  const usedOn = (slot: string) => trips.find((t) => t.slug === slot)?.name ?? otherSlots[slot] ?? slot;
  return (
    <>
      <PageHead
        img="cna/real/land-05"
        imgAlt="A misty deodar forest in Himachal"
        eyebrow="Photo credits"
        title="Photo credits"
        text="Some photos on this site come from photographers who share their work under Creative Commons and Unsplash licences. Thank you to each of them. We are replacing them with photos from our own trips, one place at a time."
      />
      <section className="wrap mt-12">
        <div className="overflow-x-auto rounded-card border border-line">
          <table className="w-full min-w-[640px] text-left text-[14px]">
            <thead className="bg-soft text-[13.5px] font-medium text-muted">
              <tr>
                <th className="p-3">Used on</th>
                <th className="p-3">Photo</th>
                <th className="p-3">By</th>
                <th className="p-3">Licence</th>
              </tr>
            </thead>
            <tbody>
              {photoCredits.map((c) => (
                <tr key={`${c.slot}-${c.source}`} className="border-t border-line">
                  <td className="p-3 font-semibold">{usedOn(c.slot)}</td>
                  <td className="p-3">
                    <a href={c.source} target="_blank" rel="noopener nofollow" className="text-primary underline">
                      {c.title}
                    </a>
                  </td>
                  <td className="p-3">{c.creator}</td>
                  <td className="p-3">{c.license}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="mt-4 text-[14px] text-muted">
          Photos are resized and compressed for the web. Licence texts:{" "}
          <a href="https://creativecommons.org/licenses/" target="_blank" rel="noopener" className="underline">
            creativecommons.org/licenses
          </a>{" "}
          and{" "}
          <a href="https://unsplash.com/license" target="_blank" rel="noopener" className="underline">
            unsplash.com/license
          </a>
          .
        </p>
      </section>
    </>
  );
}
