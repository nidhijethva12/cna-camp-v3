import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { PageHead } from "@/components/layout/PageHead";
import { Lightbox } from "@/components/media/Lightbox";
import { Photo } from "@/components/media/Photo";
import { RegionChips } from "@/components/media/RegionChips";
import { VideoGrid } from "@/components/media/VideoGrid";
import { ArrowRight } from "@/components/ui/icons";
import { regionOrder, regions } from "@/content/site";
import { getHome, getTrips, getVideos } from "@/lib/content";
import { photoSrc } from "@/lib/photos";

export const metadata: Metadata = {
  title: { absolute: "Photos & Videos from Our Treks and Camps | CNA Camp" },
  description:
    "Real photos from CNA camps: river crossings, rappelling, snow days, Manali campus life and group trips. See what a CNA trip looks like before you book one.",
  openGraph: {
    title: "Moments from the trail | CNA Camp",
    description: "River crossings, rope days and campfire nights from real CNA camps.",
  },
  alternates: { canonical: "/gallery" },
};

export default async function GalleryPage() {
  const [trips, home, allVideos] = await Promise.all([getTrips(), getHome(), getVideos()]);
  const videos = allVideos.filter((v) => v.showInGallery);
  const albums = trips
    .filter((t) => t.gallery.length >= 3)
    .map((t) => ({ trip: t, photos: [...(t.img ? [t.img] : []), ...t.gallery.filter((g) => g.src !== t.img?.src)].slice(0, 8) }));
  const albumRegions = regionOrder.filter((r) => albums.some((a) => a.trip.region === r));
  const moments = home.gallery.photos;

  return (
    <>
      <PageHead
        img="cna/real/river-01"
        imgAlt="CNA campers crossing a river on a wooden bridge near Manali"
        eyebrow="Gallery"
        title="Moments from the trail"
        text="No models, no stock smiles. These are our campers on a wooden bridge over a cold river, in a lunch queue with a mountain behind them, halfway down a rock on a rope. Tap any photo to see it big."
      />

      <Lightbox>
        <section className="wrap mt-16">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="eyebrow">Our people</p>
              <h2 className="h-section mt-2">Real groups, real camps</h2>
            </div>
            <p className="max-w-md text-muted">
              Shot by our leaders and campers. Were you on a CNA trip? Send us your best photo on WhatsApp and we may add it here, with your
              name.
            </p>
          </div>
          <div className="gal mt-8 columns-2 gap-3 sm:columns-3 lg:columns-4">
            {moments.map((m) => (
              <button
                key={m.image.src}
                type="button"
                data-full={m.image.src}
                data-caption={m.caption}
                className="group relative mb-3 block w-full break-inside-avoid overflow-hidden rounded-card bg-soft"
                aria-label={`Open photo: ${m.caption}`}
              >
                <Image
                  src={m.image.src}
                  alt={m.caption}
                  width={m.image.width ?? 800}
                  height={m.image.height ?? 600}
                  sizes="(min-width: 1024px) 300px, (min-width: 640px) 33vw, 50vw"
                  className="h-auto w-full transition duration-500 group-hover:scale-[1.04]"
                />
                <span className="absolute inset-x-0 bottom-0 bg-linear-to-b from-transparent to-dark/75 p-3 pt-8 text-left text-[13.5px] font-medium text-light opacity-0 transition group-hover:opacity-100">
                  {m.caption}
                </span>
              </button>
            ))}
          </div>
        </section>

        {videos.length > 0 && (
          <section className="wrap mt-16">
            <div className="flex flex-wrap items-end justify-between gap-4">
              <div>
                <p className="eyebrow">Watch</p>
                <h2 className="h-section mt-2">Videos</h2>
              </div>
              <p className="max-w-md text-muted">Short clips from camp, filmed on phones by people who were there.</p>
            </div>
            <VideoGrid
              videos={videos}
              sizes="(min-width: 1024px) 230px, (min-width: 640px) 33vw, 50vw"
              className="mt-8 grid-cols-2 sm:grid-cols-3 lg:grid-cols-5"
            />
          </section>
        )}

        <section className="wrap mt-20">
          <div>
            <p className="eyebrow">Albums</p>
            <h2 className="h-section mt-2">Photos by trip</h2>
          </div>
          <RegionChips label="Albums by region" regions={albumRegions.map((r) => ({ id: r, label: regions[r].label }))} />
          {albumRegions.map((r) => (
            <div key={r} id={r} className="mt-12 scroll-mt-28">
              <p className="display text-[30px]">{regions[r].label}</p>
              <div className="mt-5 grid gap-8 lg:grid-cols-2">
                {albums
                  .filter((a) => a.trip.region === r)
                  .map(({ trip, photos }) => (
                    <article key={trip.slug}>
                      <div className="flex items-baseline justify-between gap-3">
                        <h3 className="h-card">{trip.name}</h3>
                        <Link href={`/trips/${trip.slug}`} className="shrink-0 text-[14px] font-semibold text-primary underline">
                          View trip <ArrowRight />
                        </Link>
                      </div>
                      <div className="gal mt-3 grid grid-cols-4 gap-2">
                        {photos.map((p, i) => (
                          <button
                            key={p.src}
                            type="button"
                            data-full={photoSrc(p)}
                            data-caption={trip.name}
                            className={`group relative aspect-square overflow-hidden rounded-tag bg-soft ${i === 0 ? "col-span-2 row-span-2" : ""}`}
                            aria-label={`Open ${trip.name} photo ${i + 1}`}
                          >
                            <Photo
                              img={p}
                              alt={p.alt || `${trip.name}, photo ${i + 1}`}
                              sizes={i === 0 ? "(min-width: 1024px) 290px, 50vw" : "(min-width: 1024px) 145px, 25vw"}
                              className="transition duration-500 group-hover:scale-[1.06]"
                            />
                          </button>
                        ))}
                      </div>
                    </article>
                  ))}
              </div>
            </div>
          ))}
          <p className="mt-12 rounded-card bg-soft p-5 text-[14px] text-muted">
            Some trip photos are place photos for now. We are replacing them with photos from our own camps.
          </p>
        </section>
      </Lightbox>
    </>
  );
}
