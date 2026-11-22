"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { setDashboardLanguage } from "@/actions/olympiad/language";
import type { OlympiadLang } from "@/components/olympiad/LanguageSwitch";
import { Translate } from "@/components/ui/icons";
import { Select } from "@/components/ui/Select";

const languages = [
  { value: "en", label: "English" },
  { value: "gu", label: "ગુજરાતી" },
];

/** English / Gujarati on a dashboard or its login: the choice is remembered and the page shows again in it. */
export function DashboardLanguage({ lang, label }: { lang: OlympiadLang; label: string }) {
  const router = useRouter();
  const [pending, start] = useTransition();
  return (
    <label className={`flex items-center gap-2.5 ${pending ? "opacity-60" : ""}`}>
      <Translate aria-hidden="true" className="text-[22px] text-primary" />
      <span className="sr-only">{label}</span>
      <Select
        name="language"
        options={languages}
        value={lang}
        onValueChange={(next) =>
          start(async () => {
            await setDashboardLanguage(next);
            router.refresh();
          })
        }
        className="min-w-[140px] bg-light"
      />
    </label>
  );
}
