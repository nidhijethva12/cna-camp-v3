"use client";

import { useRouter } from "next/navigation";
import { Translate } from "@/components/ui/icons";
import { Select } from "@/components/ui/Select";

export type OlympiadLang = "en" | "gu";

const olympiadPath: Record<OlympiadLang, string> = { en: "/olympiad", gu: "/olympiad/gu" };

const languages = [
  { value: "en", label: "English" },
  { value: "gu", label: "ગુજરાતી" },
];

/** Switches the Olympiad page between English and Gujarati; each language has its own address. */
export function LanguageSwitch({ lang, label }: { lang: OlympiadLang; label: string }) {
  const router = useRouter();

  return (
    <label className="flex items-center gap-2.5">
      <Translate aria-hidden="true" className="text-[22px] text-primary" />
      <span className="sr-only">{label}</span>
      <Select
        name="language"
        options={languages}
        value={lang}
        onValueChange={(v) => router.push(olympiadPath[v as OlympiadLang])}
        className="min-w-[150px] bg-light"
      />
    </label>
  );
}
