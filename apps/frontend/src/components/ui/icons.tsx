import type { Icon as PhosphorIcon, IconProps } from "@phosphor-icons/react";
import { ArrowDown as ArrowDownBase } from "@phosphor-icons/react/dist/ssr/ArrowDown";
import { ArrowLeft as ArrowLeftBase } from "@phosphor-icons/react/dist/ssr/ArrowLeft";
import { ArrowRight as ArrowRightBase } from "@phosphor-icons/react/dist/ssr/ArrowRight";
import { BookOpen as BookOpenBase } from "@phosphor-icons/react/dist/ssr/BookOpen";
import { CalendarBlank as CalendarBlankBase } from "@phosphor-icons/react/dist/ssr/CalendarBlank";
import { Camera as CameraBase } from "@phosphor-icons/react/dist/ssr/Camera";
import { CaretDown as CaretDownBase } from "@phosphor-icons/react/dist/ssr/CaretDown";
import { CaretRight as CaretRightBase } from "@phosphor-icons/react/dist/ssr/CaretRight";
import { Check as CheckBase } from "@phosphor-icons/react/dist/ssr/Check";
import { CheckCircle as CheckCircleBase } from "@phosphor-icons/react/dist/ssr/CheckCircle";
import { Clock as ClockBase } from "@phosphor-icons/react/dist/ssr/Clock";
import { Envelope as EnvelopeBase } from "@phosphor-icons/react/dist/ssr/Envelope";
import { FileText as FileTextBase } from "@phosphor-icons/react/dist/ssr/FileText";
import { Fire as FireBase } from "@phosphor-icons/react/dist/ssr/Fire";
import { Gauge as GaugeBase } from "@phosphor-icons/react/dist/ssr/Gauge";
import { GraduationCap as GraduationCapBase } from "@phosphor-icons/react/dist/ssr/GraduationCap";
import { Leaf as LeafBase } from "@phosphor-icons/react/dist/ssr/Leaf";
import { List as ListBase } from "@phosphor-icons/react/dist/ssr/List";
import { ListChecks as ListChecksBase } from "@phosphor-icons/react/dist/ssr/ListChecks";
import { MapPin as MapPinBase } from "@phosphor-icons/react/dist/ssr/MapPin";
import { Megaphone as MegaphoneBase } from "@phosphor-icons/react/dist/ssr/Megaphone";
import { Mountains as MountainsBase } from "@phosphor-icons/react/dist/ssr/Mountains";
import { Pause as PauseBase } from "@phosphor-icons/react/dist/ssr/Pause";
import { Phone as PhoneBase } from "@phosphor-icons/react/dist/ssr/Phone";
import { Play as PlayBase } from "@phosphor-icons/react/dist/ssr/Play";
import { SealCheck as SealCheckBase } from "@phosphor-icons/react/dist/ssr/SealCheck";
import { ShieldCheck as ShieldCheckBase } from "@phosphor-icons/react/dist/ssr/ShieldCheck";
import { Star as StarBase } from "@phosphor-icons/react/dist/ssr/Star";
import { Tent as TentBase } from "@phosphor-icons/react/dist/ssr/Tent";
import { Timer as TimerBase } from "@phosphor-icons/react/dist/ssr/Timer";
import { Translate as TranslateBase } from "@phosphor-icons/react/dist/ssr/Translate";
import { Trophy as TrophyBase } from "@phosphor-icons/react/dist/ssr/Trophy";
import { UserCircleCheck as UserCircleCheckBase } from "@phosphor-icons/react/dist/ssr/UserCircleCheck";
import { UsersThree as UsersThreeBase } from "@phosphor-icons/react/dist/ssr/UsersThree";
import { Warning as WarningBase } from "@phosphor-icons/react/dist/ssr/Warning";
import { WarningCircle as WarningCircleBase } from "@phosphor-icons/react/dist/ssr/WarningCircle";
import { X as XBase } from "@phosphor-icons/react/dist/ssr/X";
import { XCircle as XCircleBase } from "@phosphor-icons/react/dist/ssr/XCircle";
import { YoutubeLogo as YoutubeLogoBase } from "@phosphor-icons/react/dist/ssr/YoutubeLogo";

export type { IconProps };

/** Icons are decorative by default and inherit size from font-size and colour from the text colour token. */
function decorative(Base: PhosphorIcon, { className: baseClass, ...defaults }: IconProps = {}) {
  function DecorativeIcon({ className, ...props }: IconProps) {
    const classes = ["icon", baseClass, className].filter(Boolean).join(" ");
    return <Base aria-hidden="true" focusable="false" {...defaults} {...props} className={classes} />;
  }
  DecorativeIcon.displayName = Base.displayName;
  return DecorativeIcon;
}

export const ArrowRight = /* @__PURE__ */ decorative(ArrowRightBase, { weight: "bold", className: "icon-nudge" });
export const ArrowLeft = /* @__PURE__ */ decorative(ArrowLeftBase, { weight: "bold" });
export const ArrowDown = /* @__PURE__ */ decorative(ArrowDownBase, { weight: "bold" });
export const CaretDown = /* @__PURE__ */ decorative(CaretDownBase, { weight: "bold" });
export const CaretRight = /* @__PURE__ */ decorative(CaretRightBase, { weight: "bold" });
export const Menu = /* @__PURE__ */ decorative(ListBase, { weight: "bold" });
export const Close = /* @__PURE__ */ decorative(XBase, { weight: "bold" });
export const Check = /* @__PURE__ */ decorative(CheckBase, { weight: "bold" });
export const CheckCircle = /* @__PURE__ */ decorative(CheckCircleBase, { weight: "fill" });
export const XCircle = /* @__PURE__ */ decorative(XCircleBase, { weight: "fill" });
export const SealCheck = /* @__PURE__ */ decorative(SealCheckBase, { weight: "fill" });
export const Star = /* @__PURE__ */ decorative(StarBase, { weight: "fill" });
export const Fire = /* @__PURE__ */ decorative(FireBase, { weight: "fill" });
export const YoutubeLogo = /* @__PURE__ */ decorative(YoutubeLogoBase, { weight: "fill" });
export const Play = /* @__PURE__ */ decorative(PlayBase, { weight: "fill" });
export const Pause = /* @__PURE__ */ decorative(PauseBase, { weight: "fill" });
export const Camera = /* @__PURE__ */ decorative(CameraBase, { weight: "duotone" });
export const Phone = /* @__PURE__ */ decorative(PhoneBase, { weight: "fill" });
export const Megaphone = /* @__PURE__ */ decorative(MegaphoneBase, { weight: "fill" });
export const MapPin = /* @__PURE__ */ decorative(MapPinBase, { weight: "fill" });
export const Warning = /* @__PURE__ */ decorative(WarningBase, { weight: "fill" });
export const WarningCircle = /* @__PURE__ */ decorative(WarningCircleBase, { weight: "fill" });
export const Clock = /* @__PURE__ */ decorative(ClockBase, { weight: "bold" });
export const Mountains = /* @__PURE__ */ decorative(MountainsBase, { weight: "bold" });
export const Gauge = /* @__PURE__ */ decorative(GaugeBase, { weight: "bold" });
export const Trophy = /* @__PURE__ */ decorative(TrophyBase, { weight: "fill" });
export const Leaf = /* @__PURE__ */ decorative(LeafBase, { weight: "fill" });
export const UsersThree = /* @__PURE__ */ decorative(UsersThreeBase, { weight: "fill" });
export const Tent = /* @__PURE__ */ decorative(TentBase, { weight: "fill" });
export const ShieldCheck = /* @__PURE__ */ decorative(ShieldCheckBase, { weight: "fill" });
export const GraduationCap = /* @__PURE__ */ decorative(GraduationCapBase, { weight: "duotone" });
export const BookOpen = /* @__PURE__ */ decorative(BookOpenBase, { weight: "bold" });
export const CalendarBlank = /* @__PURE__ */ decorative(CalendarBlankBase, { weight: "bold" });
export const Envelope = /* @__PURE__ */ decorative(EnvelopeBase, { weight: "bold" });
export const FileText = /* @__PURE__ */ decorative(FileTextBase, { weight: "bold" });
export const ListChecks = /* @__PURE__ */ decorative(ListChecksBase, { weight: "bold" });
export const Timer = /* @__PURE__ */ decorative(TimerBase, { weight: "bold" });
export const Translate = /* @__PURE__ */ decorative(TranslateBase, { weight: "bold" });
export const UserCircleCheck = /* @__PURE__ */ decorative(UserCircleCheckBase, { weight: "bold" });

/** The official WhatsApp glyph from the approved design; brand marks are drawn as the brand draws them, not from Phosphor. */
export function WhatsApp({ className }: { className?: string }) {
  return (
    <svg
      width="1em"
      height="1em"
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden="true"
      focusable="false"
      className={className ? `icon ${className}` : "icon"}
    >
      <path d="M12 2a10 10 0 0 0-8.6 15.1L2 22l5-1.3A10 10 0 1 0 12 2zm0 18.2a8.2 8.2 0 0 1-4.2-1.2l-.3-.2-3 .8.8-2.9-.2-.3A8.2 8.2 0 1 1 12 20.2zm4.5-6.1c-.2-.1-1.5-.7-1.7-.8-.2-.1-.4-.1-.6.1l-.8 1c-.1.2-.3.2-.5.1a6.7 6.7 0 0 1-3.3-2.9c-.3-.4.2-.4.7-1.3.1-.2 0-.3 0-.5l-.8-1.8c-.2-.5-.4-.4-.6-.4h-.5a1 1 0 0 0-.7.3 3 3 0 0 0-.9 2.2 5.2 5.2 0 0 0 1.1 2.7 11.8 11.8 0 0 0 4.5 4c1.7.7 2.3.8 3.2.6.5-.1 1.5-.6 1.7-1.2.2-.6.2-1.1.1-1.2l-.4-.3z" />
    </svg>
  );
}

/** Instagram's official glyph in its brand gradient. */
export function InstagramBrand({ className }: { className?: string }) {
  return (
    <svg
      width="1em"
      height="1em"
      viewBox="0 0 24 24"
      aria-hidden="true"
      focusable="false"
      className={className ? `icon ${className}` : "icon"}
    >
      <defs>
        <radialGradient id="ig-brand" cx="30%" cy="107%" r="150%">
          <stop offset="0" stopColor="var(--color-instagram-yellow)" />
          <stop offset="0.1" stopColor="var(--color-instagram-yellow)" />
          <stop offset="0.5" stopColor="var(--color-instagram-pink)" />
          <stop offset="1" stopColor="var(--color-instagram-purple)" />
        </radialGradient>
      </defs>
      <rect width="24" height="24" rx="6" fill="url(#ig-brand)" />
      <rect x="5" y="5" width="14" height="14" rx="4" fill="none" stroke="var(--color-light)" strokeWidth="1.8" />
      <circle cx="12" cy="12" r="3.3" fill="none" stroke="var(--color-light)" strokeWidth="1.8" />
      <circle cx="16.4" cy="7.6" r="1.1" fill="var(--color-light)" />
    </svg>
  );
}

/** Facebook's official "f" logo in brand blue. */
export function FacebookBrand({ className }: { className?: string }) {
  return (
    <svg
      width="1em"
      height="1em"
      viewBox="0 0 24 24"
      aria-hidden="true"
      focusable="false"
      className={className ? `icon ${className}` : "icon"}
    >
      <circle cx="12" cy="12" r="12" fill="var(--color-facebook)" />
      <path
        d="M13.4 24v-8.4h2.8l.4-3.3h-3.2v-2.1c0-.9.3-1.6 1.6-1.6h1.7V5.7c-.3 0-1.3-.1-2.5-.1-2.5 0-4.2 1.5-4.2 4.3v2.4H7.2v3.3H10V24z"
        fill="var(--color-light)"
      />
    </svg>
  );
}
