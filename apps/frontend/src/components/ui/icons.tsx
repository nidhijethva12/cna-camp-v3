import type { Icon as PhosphorIcon, IconProps } from "@phosphor-icons/react";
import { ArrowDown as ArrowDownBase } from "@phosphor-icons/react/dist/ssr/ArrowDown";
import { ArrowLeft as ArrowLeftBase } from "@phosphor-icons/react/dist/ssr/ArrowLeft";
import { ArrowRight as ArrowRightBase } from "@phosphor-icons/react/dist/ssr/ArrowRight";
import { Camera as CameraBase } from "@phosphor-icons/react/dist/ssr/Camera";
import { CaretDown as CaretDownBase } from "@phosphor-icons/react/dist/ssr/CaretDown";
import { Check as CheckBase } from "@phosphor-icons/react/dist/ssr/Check";
import { CheckCircle as CheckCircleBase } from "@phosphor-icons/react/dist/ssr/CheckCircle";
import { Clock as ClockBase } from "@phosphor-icons/react/dist/ssr/Clock";
import { Gauge as GaugeBase } from "@phosphor-icons/react/dist/ssr/Gauge";
import { GraduationCap as GraduationCapBase } from "@phosphor-icons/react/dist/ssr/GraduationCap";
import { Leaf as LeafBase } from "@phosphor-icons/react/dist/ssr/Leaf";
import { List as ListBase } from "@phosphor-icons/react/dist/ssr/List";
import { MapPin as MapPinBase } from "@phosphor-icons/react/dist/ssr/MapPin";
import { Mountains as MountainsBase } from "@phosphor-icons/react/dist/ssr/Mountains";
import { Pause as PauseBase } from "@phosphor-icons/react/dist/ssr/Pause";
import { Phone as PhoneBase } from "@phosphor-icons/react/dist/ssr/Phone";
import { Play as PlayBase } from "@phosphor-icons/react/dist/ssr/Play";
import { SealCheck as SealCheckBase } from "@phosphor-icons/react/dist/ssr/SealCheck";
import { Star as StarBase } from "@phosphor-icons/react/dist/ssr/Star";
import { Trophy as TrophyBase } from "@phosphor-icons/react/dist/ssr/Trophy";
import { Warning as WarningBase } from "@phosphor-icons/react/dist/ssr/Warning";
import { WarningCircle as WarningCircleBase } from "@phosphor-icons/react/dist/ssr/WarningCircle";
import { X as XBase } from "@phosphor-icons/react/dist/ssr/X";
import { XCircle as XCircleBase } from "@phosphor-icons/react/dist/ssr/XCircle";

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
export const Menu = /* @__PURE__ */ decorative(ListBase, { weight: "bold" });
export const Close = /* @__PURE__ */ decorative(XBase, { weight: "bold" });
export const Check = /* @__PURE__ */ decorative(CheckBase, { weight: "bold" });
export const CheckCircle = /* @__PURE__ */ decorative(CheckCircleBase, { weight: "fill" });
export const XCircle = /* @__PURE__ */ decorative(XCircleBase, { weight: "fill" });
export const SealCheck = /* @__PURE__ */ decorative(SealCheckBase, { weight: "fill" });
export const Star = /* @__PURE__ */ decorative(StarBase, { weight: "fill" });
export const Play = /* @__PURE__ */ decorative(PlayBase, { weight: "fill" });
export const Pause = /* @__PURE__ */ decorative(PauseBase, { weight: "fill" });
export const Camera = /* @__PURE__ */ decorative(CameraBase, { weight: "duotone" });
export const Phone = /* @__PURE__ */ decorative(PhoneBase, { weight: "fill" });
export const MapPin = /* @__PURE__ */ decorative(MapPinBase, { weight: "fill" });
export const Warning = /* @__PURE__ */ decorative(WarningBase, { weight: "fill" });
export const WarningCircle = /* @__PURE__ */ decorative(WarningCircleBase, { weight: "fill" });
export const Clock = /* @__PURE__ */ decorative(ClockBase, { weight: "bold" });
export const Mountains = /* @__PURE__ */ decorative(MountainsBase, { weight: "bold" });
export const Gauge = /* @__PURE__ */ decorative(GaugeBase, { weight: "bold" });
export const Trophy = /* @__PURE__ */ decorative(TrophyBase, { weight: "fill" });
export const Leaf = /* @__PURE__ */ decorative(LeafBase, { weight: "fill" });
export const GraduationCap = /* @__PURE__ */ decorative(GraduationCapBase, { weight: "duotone" });

/** The official WhatsApp glyph from the approved design; brand marks are drawn as the brand draws them, not from Phosphor. */
export function WhatsApp({ className }: { className?: string }) {
  return (
    <svg width="1em" height="1em" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" focusable="false" className={className ? `icon ${className}` : "icon"}>
      <path d="M12 2a10 10 0 0 0-8.6 15.1L2 22l5-1.3A10 10 0 1 0 12 2zm0 18.2a8.2 8.2 0 0 1-4.2-1.2l-.3-.2-3 .8.8-2.9-.2-.3A8.2 8.2 0 1 1 12 20.2zm4.5-6.1c-.2-.1-1.5-.7-1.7-.8-.2-.1-.4-.1-.6.1l-.8 1c-.1.2-.3.2-.5.1a6.7 6.7 0 0 1-3.3-2.9c-.3-.4.2-.4.7-1.3.1-.2 0-.3 0-.5l-.8-1.8c-.2-.5-.4-.4-.6-.4h-.5a1 1 0 0 0-.7.3 3 3 0 0 0-.9 2.2 5.2 5.2 0 0 0 1.1 2.7 11.8 11.8 0 0 0 4.5 4c1.7.7 2.3.8 3.2.6.5-.1 1.5-.6 1.7-1.2.2-.6.2-1.1.1-1.2l-.4-.3z" />
    </svg>
  );
}
