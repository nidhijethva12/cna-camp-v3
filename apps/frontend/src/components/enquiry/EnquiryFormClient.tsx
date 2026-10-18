"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useActionState, useState, type ReactNode } from "react";
import { submitEnquiry, type EnquiryField, type EnquiryState } from "@/actions/enquiry";
import { ArrowRight, CheckCircle } from "@/components/ui/icons";
import { Select } from "@/components/ui/Select";
import { travellerTypes } from "@/content/site";

export interface EnquiryFormProps {
  trips: { slug: string; name: string }[];
  /** For the "anything urgent, call" line after sending. */
  phone: { label: string; href: string };
  /** Trip pages pre-select their own trip. */
  defaultTrip?: string;
}

const initialState: EnquiryState = { status: "idle" };
const CONSENT_HINT = "Please accept the consent above to send your enquiry.";

const options = (list: readonly string[]) => list.map((x) => ({ value: x, label: x }));

/** The site's one enquiry form: every "Enquire" leads here, so every lead has the same fields. */
export function EnquiryFormClient({ trips, phone, defaultTrip = "" }: EnquiryFormProps) {
  const [state, formAction, pending] = useActionState(submitEnquiry, initialState);
  const [consent, setConsent] = useState(false);
  const pathname = usePathname();
  const blocked = !consent && !pending;

  const err = (f: EnquiryField) => state.fieldErrors?.[f];
  const v = state.values ?? {};
  const aria = (f: EnquiryField) => ({
    "aria-invalid": err(f) ? true : undefined,
    "aria-describedby": err(f) ? `enq-${f}-error` : undefined,
  });

  return (
    <form
      action={(fd) => {
        setConsent(false);
        formAction(fd);
      }}
      className="relative rounded-card border border-dark bg-light p-6 sm:p-8"
      noValidate
    >
      <p className="display h-sub">Send us an enquiry</p>
      <p className="mt-2 text-[15px] text-muted">Tell us a little. We reply by email within a day.</p>

      <input type="hidden" name="sourcePath" value={pathname} />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute h-px w-px overflow-hidden whitespace-nowrap opacity-0 [clip-path:inset(50%)]"
      >
        <label>
          Website <input type="text" name="website" tabIndex={-1} autoComplete="off" />
        </label>
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        <Field label="Your name" field="name" error={err("name")}>
          <input required name="name" defaultValue={v.name} autoComplete="name" maxLength={80} className="field mt-2" {...aria("name")} />
        </Field>
        <Field label="Phone / WhatsApp" field="phone" error={err("phone")}>
          <input
            required
            name="phone"
            defaultValue={v.phone}
            type="tel"
            autoComplete="tel"
            inputMode="tel"
            maxLength={16}
            className="field mt-2"
            {...aria("phone")}
          />
        </Field>

        <Field label="Email" field="email" error={err("email")} className="sm:col-span-2">
          <input
            required
            name="email"
            type="email"
            defaultValue={v.email}
            autoComplete="email"
            inputMode="email"
            maxLength={120}
            className="field mt-2"
            {...aria("email")}
          />
        </Field>

        <Field label="Trip" field="trip" error={err("trip")}>
          <Select
            name="trip"
            emptyLabel="Not sure yet, suggest one"
            options={trips.map((t) => ({ value: t.slug, label: t.name }))}
            defaultValue={v.trip ?? defaultTrip}
            className="mt-2"
            {...aria("trip")}
          />
        </Field>
        <Field label="Who’s travelling" field="travellerType" error={err("travellerType")}>
          <Select
            name="travellerType"
            options={options(travellerTypes)}
            defaultValue={v.travellerType}
            className="mt-2"
            {...aria("travellerType")}
          />
        </Field>

        <Field label="Message (optional)" field="message" error={err("message")} className="sm:col-span-2">
          <textarea
            name="message"
            maxLength={1000}
            placeholder="Month, number of people, anything we should know"
            defaultValue={v.message}
            className="field mt-2 min-h-24"
          />
        </Field>
        <div className="sm:col-span-2">
          <label className="flex items-start gap-3 text-[14px]">
            <input
              type="checkbox"
              name="consent"
              required
              onChange={(e) => setConsent(e.target.checked)}
              className="mt-1 h-5 w-5 shrink-0 accent-primary"
              {...aria("consent")}
            />
            <span className="text-muted">
              I agree that CNA can contact me about this enquiry, as per the{" "}
              <Link href="/privacy" className="underline">
                privacy policy
              </Link>
              . For anyone under 18, a parent or teacher fills this form.
            </span>
          </label>
          <FieldError field="consent" message={err("consent")} />
        </div>
      </div>

      {state.status === "success" && (
        <div role="status" className="mt-5 rounded-card border border-success bg-light px-4 py-3 text-[15px]">
          <p className="flex items-center gap-2 font-bold text-success">
            <CheckCircle className="text-[20px]" />
            Thanks! Your enquiry is with us.
          </p>
          <p className="mt-1 text-muted">
            We will reply to your email within a day. For anything urgent, call{" "}
            <a href={phone.href} className="font-semibold text-dark underline">
              {phone.label}
            </a>
            .
          </p>
        </div>
      )}

      {state.status === "error" && state.message && (
        <p role="alert" className="mt-5 rounded-card bg-primary-soft px-4 py-3 text-[15px] text-primary-hover">
          {state.message}
        </p>
      )}

      {/* A disabled button gets no hover events, so the tooltip sits on its wrapper; phones get the line below instead. */}
      <span className="group relative mt-6 inline-block w-full sm:w-auto">
        <button
          type="submit"
          disabled={pending || !consent}
          aria-describedby={blocked ? "enq-consent-hint" : undefined}
          className="btn btn-primary w-full disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
        >
          {pending ? "Sending…" : "Send enquiry"}
          {!pending && <ArrowRight />}
        </button>
        {blocked && (
          <span
            role="tooltip"
            className="pointer-events-none absolute top-1/2 left-full ml-3 hidden w-max max-w-60 -translate-y-1/2 rounded-tag bg-dark px-3 py-2 text-[13px] leading-snug text-light shadow-float sm:group-hover:block"
          >
            {CONSENT_HINT}
          </span>
        )}
      </span>
      {blocked && (
        <p id="enq-consent-hint" className="mt-2 text-[13px] text-muted sm:sr-only">
          {CONSENT_HINT}
        </p>
      )}
    </form>
  );
}

function Field({
  label,
  field,
  error,
  className = "",
  children,
}: {
  label: string;
  field: EnquiryField;
  error?: string;
  className?: string;
  children: ReactNode;
}) {
  return (
    <label className={`block ${className}`}>
      <span className="eyebrow">{label}</span>
      {children}
      <FieldError field={field} message={error} />
    </label>
  );
}

function FieldError({ field, message }: { field: EnquiryField; message?: string }) {
  if (!message) return null;
  return (
    <span id={`enq-${field}-error`} className="mt-1.5 block text-[13px] text-primary-hover">
      {message}
    </span>
  );
}
