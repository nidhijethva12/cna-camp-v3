import type { Icon as PhosphorIcon, IconProps } from "@phosphor-icons/react";
import { ArrowDown as ArrowDownBase } from "@phosphor-icons/react/dist/ssr/ArrowDown";
import { ArrowLeft as ArrowLeftBase } from "@phosphor-icons/react/dist/ssr/ArrowLeft";
import { ArrowRight as ArrowRightBase } from "@phosphor-icons/react/dist/ssr/ArrowRight";
import { Camera as CameraBase } from "@phosphor-icons/react/dist/ssr/Camera";
import { CaretDown as CaretDownBase } from "@phosphor-icons/react/dist/ssr/CaretDown";
import { Check as CheckBase } from "@phosphor-icons/react/dist/ssr/Check";
import { CheckCircle as CheckCircleBase } from "@phosphor-icons/react/dist/ssr/CheckCircle";
import { Clock as ClockBase } from "@phosphor-icons/react/dist/ssr/Clock";
import { GraduationCap as GraduationCapBase } from "@phosphor-icons/react/dist/ssr/GraduationCap";
import { Leaf as LeafBase } from "@phosphor-icons/react/dist/ssr/Leaf";
import { List as ListBase } from "@phosphor-icons/react/dist/ssr/List";
import { MapPin as MapPinBase } from "@phosphor-icons/react/dist/ssr/MapPin";
import { Phone as PhoneBase } from "@phosphor-icons/react/dist/ssr/Phone";
import { Play as PlayBase } from "@phosphor-icons/react/dist/ssr/Play";
import { SealCheck as SealCheckBase } from "@phosphor-icons/react/dist/ssr/SealCheck";
import { Star as StarBase } from "@phosphor-icons/react/dist/ssr/Star";
import { Trophy as TrophyBase } from "@phosphor-icons/react/dist/ssr/Trophy";
import { Warning as WarningBase } from "@phosphor-icons/react/dist/ssr/Warning";
import { WarningCircle as WarningCircleBase } from "@phosphor-icons/react/dist/ssr/WarningCircle";
import { WhatsappLogo as WhatsappLogoBase } from "@phosphor-icons/react/dist/ssr/WhatsappLogo";
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
export const Camera = /* @__PURE__ */ decorative(CameraBase, { weight: "duotone" });
export const WhatsApp = /* @__PURE__ */ decorative(WhatsappLogoBase, { weight: "fill" });
export const Phone = /* @__PURE__ */ decorative(PhoneBase, { weight: "fill" });
export const MapPin = /* @__PURE__ */ decorative(MapPinBase, { weight: "fill" });
export const Warning = /* @__PURE__ */ decorative(WarningBase, { weight: "fill" });
export const WarningCircle = /* @__PURE__ */ decorative(WarningCircleBase, { weight: "fill" });
export const Clock = /* @__PURE__ */ decorative(ClockBase, { weight: "bold" });
export const Trophy = /* @__PURE__ */ decorative(TrophyBase, { weight: "fill" });
export const Leaf = /* @__PURE__ */ decorative(LeafBase, { weight: "fill" });
export const GraduationCap = /* @__PURE__ */ decorative(GraduationCapBase, { weight: "duotone" });
