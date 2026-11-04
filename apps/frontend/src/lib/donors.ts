import "server-only";
import { cache } from "react";
import { getCms } from "@/lib/payload";
import type { Media } from "@/payload-types";
import type { ImageRef } from "@/types/content";

export interface Donor {
  name: string;
  profession: string | null;
  company: string | null;
  amount: number | null;
  photo: ImageRef | null;
  isSample: boolean;
}

const toPhoto = (media: string | Media | null | undefined): ImageRef | null =>
  media && typeof media === "object" && media.url
    ? {
        src: media.url.replace(/^https?:\/\/[^/]+(?=\/api\/media\/)/, ""),
        alt: media.alt,
        focalX: media.focalX ?? undefined,
        focalY: media.focalY ?? undefined,
      }
    : null;

/** Donors for the home page strip, in the order set in the admin. The phone number is never read here. */
export const getDonors = cache(async (): Promise<Donor[]> => {
  const payload = await getCms();
  const { docs } = await payload.find({ collection: "donors", sort: "order", depth: 1, limit: 30, pagination: false });
  return docs.map((d) => ({
    name: d.name,
    profession: d.profession ?? null,
    company: d.company ?? null,
    amount: d.amount ?? null,
    photo: toPhoto(d.photo),
    isSample: Boolean(d.isSample),
  }));
});
