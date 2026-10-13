import type { Icon as PhosphorIcon } from "@phosphor-icons/react";
import { Alarm } from "@phosphor-icons/react/dist/ssr/Alarm";
import { Boot } from "@phosphor-icons/react/dist/ssr/Boot";
import { Bus } from "@phosphor-icons/react/dist/ssr/Bus";
import { Certificate } from "@phosphor-icons/react/dist/ssr/Certificate";
import { ChalkboardTeacher } from "@phosphor-icons/react/dist/ssr/ChalkboardTeacher";
import { DeviceMobileSlash } from "@phosphor-icons/react/dist/ssr/DeviceMobileSlash";
import { Exam } from "@phosphor-icons/react/dist/ssr/Exam";
import { Flag } from "@phosphor-icons/react/dist/ssr/Flag";
import { FlowerLotus } from "@phosphor-icons/react/dist/ssr/FlowerLotus";
import { ForkKnife } from "@phosphor-icons/react/dist/ssr/ForkKnife";
import { GraduationCap } from "@phosphor-icons/react/dist/ssr/GraduationCap";
import { Lightning } from "@phosphor-icons/react/dist/ssr/Lightning";
import { MapPin } from "@phosphor-icons/react/dist/ssr/MapPin";
import { Mountains } from "@phosphor-icons/react/dist/ssr/Mountains";
import { NotePencil } from "@phosphor-icons/react/dist/ssr/NotePencil";
import { Planet } from "@phosphor-icons/react/dist/ssr/Planet";
import { Sun } from "@phosphor-icons/react/dist/ssr/Sun";
import { Tent } from "@phosphor-icons/react/dist/ssr/Tent";
import { Train } from "@phosphor-icons/react/dist/ssr/Train";
import { Tree } from "@phosphor-icons/react/dist/ssr/Tree";
import { Trophy } from "@phosphor-icons/react/dist/ssr/Trophy";
import { UsersThree } from "@phosphor-icons/react/dist/ssr/UsersThree";
import { Waves } from "@phosphor-icons/react/dist/ssr/Waves";

const featureIcons = {
  alarm: Alarm,
  boot: Boot,
  bus: Bus,
  certificate: Certificate,
  chalkboard: ChalkboardTeacher,
  exam: Exam,
  flag: Flag,
  forkKnife: ForkKnife,
  graduationCap: GraduationCap,
  lightning: Lightning,
  lotus: FlowerLotus,
  mapPin: MapPin,
  mountains: Mountains,
  noPhone: DeviceMobileSlash,
  notePencil: NotePencil,
  planet: Planet,
  sun: Sun,
  tent: Tent,
  train: Train,
  tree: Tree,
  trophy: Trophy,
  users: UsersThree,
  waves: Waves,
} satisfies Record<string, PhosphorIcon>;

export type FeatureIconName = keyof typeof featureIcons;

const tones = {
  light: "bg-primary-soft text-primary",
  soft: "bg-light text-primary shadow-card",
  dark: "bg-light/10 text-secondary ring-1 ring-light/15",
  accent: "bg-secondary text-dark",
};

const sizes = {
  md: "h-12 w-12 text-[26px]",
  lg: "h-16 w-16 text-[34px]",
};

interface FeatureIconProps {
  name: FeatureIconName;
  tone?: keyof typeof tones;
  size?: keyof typeof sizes;
  round?: boolean;
  className?: string;
}

/** Duotone icon on a rounded tile, for feature cards driven by content data. */
export function FeatureIcon({ name, tone = "light", size = "md", round = false, className = "" }: FeatureIconProps) {
  const Glyph = featureIcons[name];
  return (
    <span
      aria-hidden="true"
      className={`inline-flex shrink-0 items-center justify-center ${round ? "rounded-full" : "rounded-card"} ${tones[tone]} ${sizes[size]} ${className}`}
    >
      <Glyph weight="duotone" focusable="false" />
    </span>
  );
}
