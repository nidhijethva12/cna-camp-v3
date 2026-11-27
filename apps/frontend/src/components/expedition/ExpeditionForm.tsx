"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef, useState, useTransition, type ReactNode } from "react";
import {
  confirmExpeditionPayment,
  registerForExpedition,
  resendExpeditionLink,
  type ExpeditionField,
  type ExpeditionOrder,
} from "@/actions/expedition";
import { openCheckout } from "@/components/olympiad/razorpayCheckout";
import { Honeypot, Turnstile } from "@/components/olympiad/Turnstile";
import { ArrowRight } from "@/components/ui/icons";
import { Select } from "@/components/ui/Select";
import { expedition } from "@/content/expedition";
import type { ExpeditionState } from "@/lib/expedition";
import { DISTRICTS } from "@/lib/olympiad/rules";
import { ExpeditionDone } from "./ExpeditionDone";

const RECEIPT_KEY = "expedition-receipt";
const CONFIRM_EVERY_MS = 3000;
const CONFIRM_FOR_MS = 90_000;
const districtOptions = DISTRICTS.map(([name]) => ({ value: name, label: name }));

const blank = { name: "", whatsapp: "", district: "", age: "", gender: "", agree: false };
type Values = typeof blank;
type Errors = Partial<Record<ExpeditionField, string>>;

/** What can be checked before sending; the server checks everything again. */
function check(v: Values, minAge: number): Errors {
  const errors: Errors = {};
  if (v.name.trim().length < 3) errors.name = "Enter your full name.";
  if (!/^[6-9]\d{9}$/.test(v.whatsapp)) errors.whatsapp = "Enter a 10 digit mobile number.";
  if (!v.district) errors.district = "Choose your district.";
  const age = Number(v.age);
  if (!v.age || !Number.isInteger(age) || age < 1 || age > 90) errors.age = "Enter your age.";
  else if (age < minAge) errors.age = `You must be ${minAge} or older to register.`;
  if (!v.gender) errors.gender = "Choose one.";
  if (!v.agree) errors.agree = "Please tick the box to continue.";
  return errors;
}

/**
 * The Yatra registration: one short screen, then Razorpay, then the registration ID. A payment that
 * stops (closed window, failed) comes back to the filled form's summary to try again.
 */
export function ExpeditionForm({
  state,
  opens,
  closes,
  payee,
}: {
  state: ExpeditionState;
  /** "29 November 2026, 6:06 PM" and the closing time, in India time. */
  opens: string;
  closes: string;
  /** Who the fee is paid to, shown on the payment step. */
  payee: string;
}) {
  const router = useRouter();
  const form = useRef<HTMLFormElement>(null);
  const [values, setValues] = useState<Values>(blank);
  const [errors, setErrors] = useState<Errors>({});
  const [message, setMessage] = useState("");
  const [already, setAlready] = useState(false);
  const [resent, setResent] = useState("");
  const [order, setOrder] = useState<ExpeditionOrder | null>(null);
  const [paying, setPaying] = useState<"idle" | "open" | "confirming">("idle");
  const [receipt, setReceipt] = useState<string | null>(null);
  const [pending, start] = useTransition();
  const fee = `Rs ${state.fee}`;

  // A reload right after paying comes back to the registration ID, not to an empty form.
  useEffect(() => {
    try {
      const saved = window.sessionStorage.getItem(RECEIPT_KEY);
      // eslint-disable-next-line react-hooks/set-state-in-effect -- session storage can only be read after the page has loaded
      if (saved) setReceipt(saved);
    } catch {
      // Storage is blocked: the thank-you screen simply does not survive a reload.
    }
  }, []);

  const set = <K extends keyof Values>(key: K, value: Values[K]) => {
    setValues((v) => ({ ...v, [key]: value }));
    setErrors((e) => ({ ...e, [key]: undefined }));
    if (key === "whatsapp") setAlready(false);
  };

  const done = (token: string) => {
    try {
      window.sessionStorage.setItem(RECEIPT_KEY, token);
    } catch {
      // Not saved; the screen still shows now.
    }
    setReceipt(token);
  };

  const pay = (current: ExpeditionOrder) => {
    if (!current.order) return;
    setMessage("");
    setPaying("open");
    void openCheckout(
      current.order,
      { name: "Sindhu Darshan Yatra · CNA", description: `Registration fee · ${payee}`, prefill: current.prefill },
      {
        onPaid: async (payment) => {
          setPaying("confirming");
          const until = Date.now() + CONFIRM_FOR_MS;
          for (;;) {
            const result = await confirmExpeditionPayment(payment);
            if (result.ok && result.paid && result.receiptToken) return done(result.receiptToken);
            if (!result.ok || Date.now() > until) {
              setPaying("idle");
              setMessage(
                "Your payment is being confirmed. The Zoom link will come on your WhatsApp number in a few minutes. Please do not pay again.",
              );
              return;
            }
            await new Promise((resolve) => setTimeout(resolve, CONFIRM_EVERY_MS));
          }
        },
        onStopped: () => {
          setPaying("idle");
          setMessage("Payment not completed. Try again.");
        },
      },
    );
  };

  const submit = () => {
    const found = check(values, state.minAge);
    setErrors(found);
    setMessage("");
    setAlready(false);
    setResent("");
    if (Object.keys(found).length) return;
    const data = new FormData(form.current ?? undefined);
    start(async () => {
      const result = await registerForExpedition({
        ...values,
        website: String(data.get("website") ?? ""),
        turnstileToken: String(data.get("cf-turnstile-response") ?? ""),
      });
      if (!result.ok) {
        // The box under the number says it, with the way forward, so the field does not repeat it.
        setErrors(result.alreadyRegistered ? {} : (result.fieldErrors ?? {}));
        setAlready(Boolean(result.alreadyRegistered));
        if (!result.alreadyRegistered) setMessage(result.message);
        return;
      }
      setOrder(result);
      if (result.order) pay(result);
    });
  };

  const sendAgain = () => {
    setResent("");
    start(async () => {
      const result = await resendExpeditionLink(values.whatsapp);
      if (!result.ok) setResent(result.message);
      else if (result.status === "sent") setResent(`The Zoom link is sent again to WhatsApp ${result.to}.`);
      else if (result.status === "waiting")
        setResent("You are registered. The Zoom link is not ready yet; it will come on your WhatsApp number before the meeting.");
      else setResent("You are registered, but the message could not be sent just now. Please try again in a few minutes.");
    });
  };

  if (receipt) return <ExpeditionDone receiptToken={receipt} payee={payee} />;

  if (state.phase === "before") {
    return (
      <Panel>
        <p className="display h-sub">Registration opens soon</p>
        <p className="mt-2 text-muted">
          Registration opens on <b className="text-dark">{opens}</b>. The form will show here at that minute.
        </p>
        <Countdown to={state.opensAt} onZero={() => router.refresh()} />
      </Panel>
    );
  }
  if (state.phase === "closed") {
    return (
      <Panel>
        <p className="display h-sub">Registration closed</p>
        <p className="mt-2 text-muted">Registration for the Zoom meeting closed on {closes}.</p>
      </Panel>
    );
  }

  if (order) {
    return (
      <Panel>
        <p className="display h-sub">Pay the registration fee</p>
        <div className="mt-5 rounded-card bg-soft p-5">
          <p className="text-[14px] text-muted">Your form is saved. You are registered once the fee is paid.</p>
          <p className="mt-1 font-display text-[20px] font-extrabold">{order.name}</p>
          <p className="mt-1 text-[15px]">
            Registration fee <b className="font-display">Rs {order.fee}</b> · paid to {payee}
          </p>
        </div>
        {message && (
          <p role="alert" className="mt-4 rounded-card bg-primary-soft px-3 py-2.5 text-[14px] text-primary">
            {message}
          </p>
        )}
        {order.order ? (
          <button type="button" onClick={() => pay(order)} disabled={paying !== "idle"} className="btn btn-primary mt-5 w-full">
            {paying === "confirming" ? "Confirming your payment…" : paying === "open" ? "Opening the payment…" : `Pay Rs ${order.fee}`}
            <ArrowRight />
          </button>
        ) : (
          <p role="status" className="mt-4 rounded-card border border-line p-4 text-[15px]">
            Online payment is not available right now. Please try again in a few minutes.
          </p>
        )}
        <button
          type="button"
          disabled={paying !== "idle"}
          onClick={() => {
            setOrder(null);
            setMessage("");
          }}
          className="mt-4 block w-full text-center text-[14.5px] font-bold text-primary underline disabled:opacity-50"
        >
          Change my details
        </button>
        <p className="mt-3 text-center text-[13px] text-muted">Secure payment by Razorpay: UPI, card, net banking or wallet.</p>
      </Panel>
    );
  }

  const error = (field: ExpeditionField) =>
    errors[field] ? (
      <span id={`exp-${field}-error`} className="mt-1.5 block text-[13px] text-primary-hover">
        {errors[field]}
      </span>
    ) : null;
  const aria = (field: ExpeditionField) => ({
    "aria-invalid": errors[field] ? true : undefined,
    "aria-describedby": errors[field] ? `exp-${field}-error` : undefined,
  });

  return (
    <form
      ref={form}
      noValidate
      onSubmit={(e) => {
        e.preventDefault();
        submit();
      }}
      className="relative rounded-card border border-dark bg-light p-6 sm:p-8"
    >
      <p className="display h-sub">{expedition.form.title}</p>
      <p className="mt-2 text-[15px] text-muted">{expedition.form.lead}</p>
      <Honeypot />

      <div className="mt-6 grid gap-4">
        <label className="block">
          <Label>Full name</Label>
          <input
            required
            value={values.name}
            onChange={(e) => set("name", e.target.value)}
            autoComplete="name"
            maxLength={60}
            className="field mt-2"
            {...aria("name")}
          />
          {error("name")}
        </label>

        <label className="block">
          <Label>WhatsApp number</Label>
          <span className="mt-2 flex">
            <span className="field flex w-auto shrink-0 items-center rounded-r-none border-r-0 bg-soft text-muted">+91</span>
            <input
              required
              value={values.whatsapp}
              onChange={(e) => set("whatsapp", e.target.value.replace(/\D/g, "").slice(0, 10))}
              type="tel"
              inputMode="numeric"
              autoComplete="tel-national"
              maxLength={10}
              className="field min-w-0 flex-1 rounded-l-none"
              {...aria("whatsapp")}
            />
          </span>
          <span className="mt-1.5 block text-[13px] text-muted">The Zoom link goes to this number.</span>
          {error("whatsapp")}
        </label>

        {already && (
          <div role="status" className="rounded-card border border-line bg-soft p-4 text-[15px]">
            <p className="font-bold">This number is already registered.</p>
            <button type="button" onClick={sendAgain} disabled={pending} className="btn btn-outline mt-3">
              {pending ? "Sending…" : "Send the Zoom link again"}
            </button>
            {resent && <p className="mt-3 text-[14px] text-muted">{resent}</p>}
          </div>
        )}

        <div className="grid gap-4 sm:grid-cols-[1fr_120px]">
          <div>
            <Label>District (Gujarat)</Label>
            <Select
              name="district"
              options={districtOptions}
              emptyLabel="Choose your district"
              value={values.district}
              onValueChange={(v) => set("district", v)}
              className="mt-2"
              {...aria("district")}
            />
            {error("district")}
          </div>
          <label className="block">
            <Label>Age</Label>
            <input
              required
              value={values.age}
              onChange={(e) => set("age", e.target.value.replace(/\D/g, "").slice(0, 2))}
              inputMode="numeric"
              maxLength={2}
              className="field mt-2"
              {...aria("age")}
            />
            {error("age")}
          </label>
        </div>

        <fieldset {...aria("gender")}>
          <legend className="eyebrow">
            Gender
            <Star />
          </legend>
          <div className="mt-2 grid gap-2 sm:grid-cols-3">
            {expedition.form.genders.map(([value, text]) => (
              <label
                key={value}
                className={`flex cursor-pointer items-center gap-2.5 rounded-card border-[1.5px] px-3.5 py-3 text-[15px] ${values.gender === value ? "border-dark bg-soft font-bold" : "border-line"}`}
              >
                <input
                  type="radio"
                  name="gender"
                  value={value}
                  checked={values.gender === value}
                  onChange={() => set("gender", value)}
                  className="accent-primary"
                />
                {text}
              </label>
            ))}
          </div>
          {error("gender")}
        </fieldset>

        <div>
          <label className="flex cursor-pointer gap-3 text-[14.5px]">
            <input
              type="checkbox"
              checked={values.agree}
              onChange={(e) => set("agree", e.target.checked)}
              className="mt-1 h-4.5 w-4.5 shrink-0 accent-primary"
              {...aria("agree")}
            />
            <span>{expedition.form.agree(state.fee)}</span>
          </label>
          {error("agree")}
        </div>
      </div>

      <Turnstile className="mt-5" />

      {message && (
        <p role="alert" className="mt-4 rounded-card bg-primary-soft px-3 py-2.5 text-[14px] text-primary">
          {message}
        </p>
      )}

      <button type="submit" disabled={pending} className="btn btn-primary mt-5 w-full">
        {pending ? "Saving…" : `Register and pay ${fee}`}
        <ArrowRight />
      </button>
      <p className="mt-3 text-center text-[13px] text-muted">{expedition.form.privacy}</p>
    </form>
  );
}

function Panel({ children }: { children: ReactNode }) {
  return <div className="rounded-card border border-dark bg-light p-6 sm:p-8">{children}</div>;
}

const Star = () => (
  <span aria-hidden="true" className="ml-0.5 text-danger">
    *
  </span>
);

function Label({ children }: { children: ReactNode }) {
  return (
    <span className="eyebrow">
      {children}
      <Star />
    </span>
  );
}

/** Days, hours, minutes and seconds to the opening minute; refreshes the page when it arrives. */
function Countdown({ to, onZero }: { to: string; onZero: () => void }) {
  const target = Date.parse(to);
  const [left, setLeft] = useState<number | null>(null);
  const fired = useRef(false);

  useEffect(() => {
    const tick = () => {
      const ms = target - Date.now();
      setLeft(Math.max(0, ms));
      if (ms <= 0 && !fired.current) {
        fired.current = true;
        onZero();
      }
    };
    tick();
    const timer = window.setInterval(tick, 1000);
    return () => window.clearInterval(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- `onZero` is a fresh function on every render
  }, [target]);

  if (left === null) return null;
  const total = Math.floor(left / 1000);
  const parts: [number, string][] = [
    [Math.floor(total / 86400), "days"],
    [Math.floor((total % 86400) / 3600), "hours"],
    [Math.floor((total % 3600) / 60), "min"],
    [total % 60, "sec"],
  ];
  return (
    <div className="mt-5 grid grid-cols-4 gap-2 text-center" role="timer" aria-label="Time until registration opens">
      {parts.map(([n, unit]) => (
        <div key={unit} className="rounded-card bg-soft px-2 py-3">
          <p className="font-display text-[26px] font-extrabold tabular-nums">{String(n).padStart(2, "0")}</p>
          <p className="text-[12.5px] text-muted">{unit}</p>
        </div>
      ))}
    </div>
  );
}
