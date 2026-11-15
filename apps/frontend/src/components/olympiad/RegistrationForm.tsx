"use client";

import { useEffect, useRef, useState, useTransition, type ReactNode } from "react";
import { submitRegistration, type RegistrationResult } from "@/actions/olympiad/registration";
import { registrationPath, registrationText, type RegistrationText, type RegLang } from "@/content/registration";
import { ArrowLeft, ArrowRight, Camera, CheckCircle, FileText, Translate } from "@/components/ui/icons";
import { Select } from "@/components/ui/Select";
import { compressImage } from "@/lib/olympiad/compressImage";
import {
  ACHIEVEMENT_OTHER,
  emptyRegistration,
  FIELD_STEP,
  firstIncompleteStep,
  shape,
  STEP_COUNT,
  stepErrors,
  toLatinDigits,
  type RegistrationField,
  type RegistrationInput,
} from "@/lib/olympiad/registration";
import {
  ACHIEVEMENTS,
  ADULT_WORK,
  FORM_SCHOOL_TYPES,
  classesFor,
  DISTRICTS,
  feeFor,
  istToday,
  MIN_AGE,
  type Fees,
  type GroupId,
  type QuizSlot,
} from "@/lib/olympiad/rules";
import { sniffFile, UPLOAD_ACCEPT, uploadProblem } from "@/lib/olympiad/uploads";
import { rulesEn, rulesGu, rulesIntro, rulesIntroGu } from "@/content/olympiadRules";
import { PaymentStep } from "./PaymentStep";
import { RegistrationDone } from "./RegistrationDone";
import { Honeypot, Turnstile } from "./Turnstile";

type FileKey = "photo" | "aadhaarCard" | "schoolIdCard";
type Errors = Partial<Record<RegistrationField, string>>;

const LANGUAGES = [
  { value: "en", label: "English" },
  { value: "gu", label: "ગુજરાતી" },
];
const rupees = (n: number) => `₹${n.toLocaleString("en-IN")}`;
const onlyDigits = (v: string, max: number) => toLatinDigits(v).replace(/\D/g, "").slice(0, max);
const aadhaarView = (v: string) => onlyDigits(v, 12).replace(/(\d{4})(?=\d)/g, "$1 ");
const longDate = (iso: string) =>
  iso ? new Date(`${iso}T00:00`).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" }) : "";

/** The latest birth date that is 13 years old today, for the date picker. */
function latestBirthDate() {
  const today = istToday();
  const d = new Date(today.getFullYear() - MIN_AGE, today.getMonth(), today.getDate());
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

/** The fee for the group so far; null until the group, the school type and (if asked) the Std 6 to 8 answer are known. */
function feeOf(fees: Fees, input: RegistrationInput) {
  const { group, minor, govt, waiting } = shape(input);
  if (!group) return null;
  if (minor && !input.schoolType) return null;
  if (waiting) return null;
  return feeFor(fees, group, govt);
}

/** Adventure Olympiad 2.0 registration in five short steps; the group and fee follow from the answers. */
export function RegistrationForm({
  fees,
  lang: initialLang,
  initial,
  invite,
  quizSlots,
  rules,
  phone,
}: {
  fees: Fees;
  lang: RegLang;
  /** Answers a school already gave, when the parent opens the school's invitation link. */
  initial?: Partial<RegistrationInput>;
  invite?: string;
  /** Quiz dates and times from the admin; Std 10, Std 12 and Group C pick one. */
  quizSlots: QuizSlot[];
  /** The Rules and Terms PDFs the consent links to. */
  rules: { gu: string; en: string };
  /** CNA's help number, shown on the done screen. */
  phone?: string;
}) {
  const [lang, setLang] = useState<RegLang>(initialLang);
  const t = registrationText[lang];
  const [input, setInput] = useState<RegistrationInput>({ ...emptyRegistration, ...initial });
  const [files, setFiles] = useState<Partial<Record<FileKey, File>>>({});
  const [errors, setErrors] = useState<Errors>({});
  const [step, setStep] = useState(1);
  const [maxStep, setMaxStep] = useState(1);
  const [fromReview, setFromReview] = useState(false);
  const [message, setMessage] = useState("");
  const [result, setResult] = useState<Extract<RegistrationResult, { ok: true }> | null>(null);
  const [pending, startTransition] = useTransition();
  // A new key after a failed send gives Turnstile a fresh one-time token.
  const [attempt, setAttempt] = useState(0);
  // The agree tick unlocks only after the review list has been scrolled to its end.
  const [reviewSeen, setReviewSeen] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);

  const s = shape(input);
  const fee = feeOf(fees, input);
  // "Someone else" fills in the form as the guardian; the labels say so.
  const guardian = input.parentWho === "other";
  const has = { photo: Boolean(files.photo), aadhaarCard: Boolean(files.aadhaarCard), schoolIdCard: Boolean(files.schoolIdCard) };

  const set = <K extends keyof RegistrationInput>(key: K, value: RegistrationInput[K]) => {
    setInput((prev) => {
      const next = { ...prev, [key]: value };
      // Who fills in the form follows who is alive: both, either parent; one, that parent; neither, a guardian.
      if (key === "fatherAlive" || key === "motherAlive") {
        const was = prev.parentWho;
        next.parentWho =
          next.fatherAlive && next.motherAlive
            ? was === "father" || was === "mother"
              ? was
              : ""
            : next.fatherAlive
              ? "father"
              : next.motherAlive
                ? "mother"
                : "other";
        if (next.parentWho !== was) next.parentName = "";
      }
      const parentFrom =
        key === "parentWho" ||
        key === "fatherName" ||
        key === "motherName" ||
        key === "surname" ||
        key === "fatherAlive" ||
        key === "motherAlive";
      if (parentFrom && (next.parentWho === "father" || next.parentWho === "mother")) {
        next.parentName = [next.parentWho === "father" ? next.fatherName : next.motherName, next.surname].filter(Boolean).join(" ");
      }
      return next;
    });
    setErrors((prev) => ({ ...prev, [key]: undefined, group: undefined }));
  };

  const go = (n: number) => {
    // Arriving at the review (again) means reading it (again) before agreeing.
    if (n === STEP_COUNT) {
      setReviewSeen(false);
      setInput((prev) => ({ ...prev, agree: false }));
    }
    setStep(n);
    setMaxStep((m) => Math.max(m, n));
    setMessage("");
    window.scrollTo({ top: formRef.current ? formRef.current.offsetTop - 100 : 0, behavior: "smooth" });
  };

  const check = (n: number) => {
    const found = stepErrors(n, input, has, lang, quizSlots);
    setErrors(found);
    if (Object.keys(found).length) {
      requestAnimationFrame(() => formRef.current?.querySelector("[data-bad]")?.scrollIntoView({ behavior: "smooth", block: "center" }));
      return false;
    }
    return true;
  };

  const next = () => {
    if (!check(step)) return;
    if (fromReview) {
      const incomplete = firstIncompleteStep({ ...input, agree: true }, has, quizSlots);
      if (incomplete && incomplete < STEP_COUNT) {
        check(incomplete);
        return go(incomplete);
      }
      setFromReview(false);
      return go(STEP_COUNT);
    }
    if (step < STEP_COUNT) return go(step + 1);
    submit();
  };

  const back = () => {
    if (fromReview) {
      setFromReview(false);
      return go(STEP_COUNT);
    }
    if (step > 1) go(step - 1);
  };

  const pickFile = async (key: FileKey, file: File | undefined) => {
    if (!file) return;
    const ready = await compressImage(file);
    // The same checks the server makes: the real type from the file's first bytes, then the size.
    const problem = uploadProblem(key, await sniffFile(ready), ready.size);
    if (problem) {
      setFiles((prev) => ({ ...prev, [key]: undefined }));
      setErrors((prev) => ({ ...prev, [key]: t.errors[problem] }));
      return;
    }
    setFiles((prev) => ({ ...prev, [key]: ready }));
    setErrors((prev) => ({ ...prev, [key]: undefined }));
  };

  const submit = () => {
    const form = formRef.current;
    if (!form) return;
    const fd = new FormData(form);
    fd.set("input", JSON.stringify(input));
    fd.set("lang", lang);
    if (invite) fd.set("invite", invite);
    for (const [key, file] of Object.entries(files)) if (file && (key !== "schoolIdCard" || s.proof)) fd.set(key, file);
    startTransition(async () => {
      const answer = await submitRegistration(fd);
      if (answer.ok) {
        setResult(answer);
        window.scrollTo({ top: 0, behavior: "smooth" });
        return;
      }
      setAttempt((n) => n + 1);
      setMessage(answer.message);
      if (answer.fieldErrors) {
        setErrors(answer.fieldErrors);
        const at = Math.min(...Object.keys(answer.fieldErrors).map((f) => FIELD_STEP[f as RegistrationField] ?? STEP_COUNT));
        if (at < STEP_COUNT) go(at);
      }
    });
  };

  const switchLanguage = (next: RegLang) => {
    setLang(next);
    setMessage("");
    if (Object.keys(errors).length) setErrors(stepErrors(step, input, has, next, quizSlots));
    window.history.replaceState(null, "", registrationPath[next] + window.location.search);
  };

  if (result) {
    // The receipt comes from the saved registration: right away for a free one, after Razorpay confirms a paid one.
    const done = (receiptToken: string) => <RegistrationDone receiptToken={receiptToken} lang={lang} phone={phone} rules={rules} />;
    if (!result.paid) return <PaymentStep summary={result} t={t.payment} done={done} />;
    return result.receiptToken ? done(result.receiptToken) : null;
  }

  const err = (f: RegistrationField) => errors[f];
  const bad = (f: RegistrationField) => (errors[f] ? { "data-bad": true } : {});
  const nextLabel =
    step === STEP_COUNT ? (fee === 0 ? t.common.register : t.common.pay(fee ?? 0)) : fromReview ? t.common.backToReview : t.common.next;

  return (
    <div lang={lang} className={`overflow-clip rounded-card border border-line bg-light shadow-card ${lang === "gu" ? "lang-gu" : ""}`}>
      <header className="bg-dark px-5 pt-7 pb-6 text-light sm:px-8">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="font-display text-[13px] font-bold tracking-[0.14em] text-secondary uppercase">Adventure Olympiad 2.0</p>
            <h1 className="mt-2 font-display text-[clamp(26px,4vw,34px)] leading-tight font-extrabold">{t.header.title}</h1>
            <p className="mt-1.5 text-[15px] text-light/75">{t.header.subtitle}</p>
          </div>
          <label className="flex items-center gap-2">
            <Translate aria-hidden="true" className="text-[20px] text-secondary" />
            <span className="sr-only">{t.languageLabel}</span>
            <Select
              name="language"
              options={LANGUAGES}
              value={lang}
              onValueChange={(v) => switchLanguage(v as RegLang)}
              className="min-w-[132px] bg-light text-dark"
            />
          </label>
        </div>
        <ol className="mt-5 grid grid-cols-5 gap-1.5" aria-label="Steps">
          {t.header.steps.map((label, i) => {
            const n = i + 1;
            const state = n === step ? "on" : n <= maxStep ? "done" : "todo";
            return (
              <li key={label} className="min-w-0">
                <button
                  type="button"
                  disabled={state !== "done"}
                  aria-current={state === "on" ? "step" : undefined}
                  onClick={() => {
                    if (maxStep === STEP_COUNT && n < STEP_COUNT) setFromReview(true);
                    go(n);
                  }}
                  className="grid w-full gap-2 text-left disabled:cursor-default"
                >
                  <span className={`h-1 rounded-full ${state === "todo" ? "bg-light/20" : "bg-primary"}`} />
                  <span
                    className={`truncate text-[12.5px] max-[420px]:sr-only sm:text-[13px] ${state === "on" ? "font-bold text-light" : state === "done" ? "text-light/75 hover:text-light" : "text-light/45"}`}
                  >
                    {n} · {n === 3 && s.adult ? t.header.aboutYou : label}
                  </span>
                </button>
              </li>
            );
          })}
        </ol>
      </header>

      <form
        ref={formRef}
        noValidate
        onSubmit={(e) => {
          e.preventDefault();
          next();
        }}
        className="grid gap-6 px-5 py-7 sm:px-8"
      >
        <Honeypot />

        {step === 1 && (
          <>
            <StepHead title={t.step1.title} text={t.step1.text} />
            <Choice
              label={t.step1.who}
              required
              columns={3}
              value={input.who}
              error={err("who")}
              onChange={(v) => set("who", v)}
              options={(["student", "teacher", "adult"] as const).map((v) => ({ value: v, ...t.step1.whoOptions[v] }))}
            />
            <Field label={t.step1.dob} required error={err("dob")} hint={t.step1.dobHint}>
              <input
                type="date"
                max={latestBirthDate()}
                value={input.dob}
                onChange={(e) => set("dob", e.target.value)}
                className="field"
                {...bad("dob")}
              />
            </Field>
            {s.student && (
              <Choice
                label={t.step1.schoolType}
                required
                value={input.schoolType}
                error={err("schoolType")}
                hint={t.step1.schoolTypeHint}
                onChange={(v) => set("schoolType", v)}
                columns={3}
                options={FORM_SCHOOL_TYPES.map((v) => ({ value: v, label: t.step1.schoolTypes[v] }))}
              />
            )}
            {s.asksStd6to8 && (
              <Choice
                label={t.step1.std6to8}
                required
                value={input.govtStd6to8}
                error={err("govtStd6to8")}
                hint={t.step1.std6to8Hint}
                onChange={(v) => set("govtStd6to8", v)}
                options={(["yes", "no"] as const).map((v) => ({ value: v, label: t.step1.std6to8Options[v] }))}
              />
            )}
            <GroupBox
              group={s.group}
              warning={(s.warning && t.group.warnings[s.warning]) || err("group")}
              pending={s.waiting ? t.group.answerAbove : undefined}
              t={t}
            />
          </>
        )}

        {step === 2 && (
          <>
            <StepHead title={t.step2.title} text={t.step2.text} onBack={back} t={t} />
            <div className="grid gap-4 sm:grid-cols-2">
              <Text
                label={t.step2.firstName}
                value={input.firstName}
                error={err("firstName")}
                placeholder={t.step2.placeholders.firstName}
                autoComplete="given-name"
                onChange={(v) => set("firstName", v)}
              />
              {!s.orphan && (
                <Text
                  label={t.step2.fatherName}
                  value={input.fatherName}
                  error={err("fatherName")}
                  placeholder={t.step2.placeholders.fatherName}
                  onChange={(v) => set("fatherName", v)}
                />
              )}
              <Text
                label={t.step2.surname}
                value={input.surname}
                error={err("surname")}
                placeholder={t.step2.placeholders.surname}
                autoComplete="family-name"
                onChange={(v) => set("surname", v)}
              />
              {!s.orphan && (
                <Text
                  label={t.step2.motherName}
                  value={input.motherName}
                  error={err("motherName")}
                  placeholder={t.step2.placeholders.motherName}
                  onChange={(v) => set("motherName", v)}
                />
              )}
            </div>
            {s.student && (
              <fieldset className="grid gap-2">
                <legend className="text-[15px] font-bold">{t.step2.alive}</legend>
                <span className="text-[13px] text-muted">{t.step2.aliveHint}</span>
                <div className="grid gap-2 sm:grid-cols-2">
                  <Tick boxed checked={input.fatherAlive} onChange={(v) => set("fatherAlive", v)}>
                    {t.step2.fatherAlive}
                  </Tick>
                  <Tick boxed checked={input.motherAlive} onChange={(v) => set("motherAlive", v)}>
                    {t.step2.motherAlive}
                  </Tick>
                </div>
                {!input.fatherAlive && !input.motherAlive && (
                  <p className="rounded-card bg-soft px-3.5 py-2.5 text-[14px] font-semibold">{t.step2.orphan}</p>
                )}
              </fieldset>
            )}
            <hr className="border-line" />
            <div className="grid gap-4 sm:grid-cols-2">
              <Text
                label={t.step2.mobile}
                type="tel"
                phone
                value={input.mobile}
                error={err("mobile")}
                placeholder={t.common.tenDigit}
                autoComplete="tel-national"
                onChange={(v) => set("mobile", onlyDigits(v, 10))}
              />
              <Text
                label={t.step2.email}
                type="email"
                value={input.email}
                error={err("email")}
                placeholder="name@gmail.com"
                autoComplete="email"
                onChange={(v) => set("email", v.trim())}
              />
            </div>
            <Tick checked={input.whatsappSame} onChange={(v) => set("whatsappSame", v)}>
              {t.step2.whatsappSame}
            </Tick>
            {!input.whatsappSame && (
              <Text
                label={t.step2.whatsapp}
                type="tel"
                phone
                value={input.whatsapp}
                error={err("whatsapp")}
                placeholder={t.common.tenDigit}
                hint={t.step2.whatsappHint}
                onChange={(v) => set("whatsapp", onlyDigits(v, 10))}
              />
            )}
            <p className="-mt-2 text-[13px] text-muted">
              <b className="text-dark">{t.step2.whatsappOnly}</b> {t.step2.emailNote}
            </p>
            <hr className="border-line" />
            <Text
              label={t.step2.address}
              value={input.address}
              error={err("address")}
              placeholder={t.step2.addressPlaceholder}
              autoComplete="street-address"
              onChange={(v) => set("address", v)}
            />
            <div className="grid gap-4 sm:grid-cols-[2fr_1fr]">
              <Field label={t.step2.district} required error={err("district")}>
                <Select
                  name="district"
                  emptyLabel={t.common.select}
                  options={DISTRICTS.map(([d]) => ({ value: d, label: d }))}
                  value={input.district}
                  onValueChange={(v) => set("district", v)}
                  aria-invalid={err("district") ? true : undefined}
                />
              </Field>
              <Text
                label={t.step2.pin}
                type="tel"
                value={input.pin}
                error={err("pin")}
                placeholder="360002"
                autoComplete="postal-code"
                onChange={(v) => set("pin", onlyDigits(v, 6))}
              />
            </div>
            {s.quiz && (
              <Choice
                label={t.step2.quiz}
                required
                value={input.quizLanguage}
                error={err("quizLanguage")}
                onChange={(v) => set("quizLanguage", v)}
                options={[
                  { value: "gu", label: "ગુજરાતી" },
                  { value: "en", label: "English" },
                ]}
              />
            )}
            {s.quiz && (
              <Choice
                label={t.step2.quizWindow}
                required
                value={input.quizWindow}
                error={err("quizWindow")}
                onChange={(v) => set("quizWindow", v as RegistrationInput["quizWindow"])}
                options={Object.entries(t.step2.quizWindows).map(([value, label]) => ({ value, label }))}
              />
            )}
            {s.minor && (
              <>
                <hr className="border-line" />
                {/* Both parents alive: father or mother. One alive: that parent only. Neither: only a guardian, no choice. */}
                {(input.fatherAlive || input.motherAlive) && (
                  <Choice
                    label={t.step2.parent}
                    required
                    columns={2}
                    value={input.parentWho}
                    error={err("parentWho")}
                    hint={t.step2.parentHint}
                    onChange={(v) => set("parentWho", v)}
                    options={(["father", "mother", "other"] as const)
                      .filter((v) => (v === "father" ? input.fatherAlive : v === "mother" ? input.motherAlive : false))
                      .map((v) => ({ value: v, label: t.step2.parents[v] }))}
                  />
                )}
                <Text
                  label={guardian ? t.step2.guardianName : t.step2.parentName}
                  value={input.parentName}
                  error={err("parentName")}
                  onChange={(v) => set("parentName", v)}
                />
                <Tick checked={input.parentSameMobile} onChange={(v) => set("parentSameMobile", v)}>
                  {guardian ? t.step2.guardianSameMobile : t.step2.parentSameMobile}
                </Tick>
                {!input.parentSameMobile && (
                  <Text
                    label={guardian ? t.step2.guardianMobile : t.step2.parentMobile}
                    type="tel"
                    phone
                    value={input.parentMobile}
                    error={err("parentMobile")}
                    placeholder={t.common.tenDigit}
                    onChange={(v) => set("parentMobile", onlyDigits(v, 10))}
                  />
                )}
              </>
            )}
          </>
        )}

        {step === 3 && (
          <>
            <StepHead title={s.adult ? t.step3.titleAdult : t.step3.titleSchool} onBack={back} t={t} />
            {!s.adult && (
              <Text
                label={s.teacher ? t.step3.schoolTeacher : t.step3.schoolStudent}
                value={input.school}
                error={err("school")}
                placeholder={t.step3.schoolPlaceholder}
                onChange={(v) => set("school", v)}
              />
            )}
            {s.student && (
              <>
                <div className="grid gap-4 sm:grid-cols-2">
                  <Field label={t.step3.std} required error={err("std")}>
                    <Select
                      name="std"
                      emptyLabel={t.common.select}
                      options={classesFor(s.group).map((c) => ({ value: c, label: c }))}
                      value={input.std}
                      onValueChange={(v) => set("std", v)}
                      aria-invalid={err("std") ? true : undefined}
                    />
                  </Field>
                  {s.proof && (
                    <Text
                      label={t.step3.schoolId}
                      optional
                      optionalLabel={t.common.optional}
                      value={input.schoolId}
                      error={err("schoolId")}
                      placeholder={t.step3.schoolIdPlaceholder}
                      onChange={(v) => set("schoolId", v)}
                    />
                  )}
                </div>
                {s.slot && quizSlots.length > 0 && (
                  <fieldset className="grid gap-2" {...(err("quizDate") || err("quizTime") ? { "data-bad": true } : {})}>
                    <legend className="mb-2 text-[15px] font-bold">
                      {t.step3.quizSlot}
                      <span className="ml-0.5 text-primary">*</span>
                    </legend>
                    <div className="grid gap-3 sm:grid-cols-2">
                      <Select
                        name="quizDate"
                        aria-label={t.step3.quizDate}
                        emptyLabel={t.step3.quizDate}
                        options={quizSlots.map((d) => ({ value: d.date, label: d.date }))}
                        value={input.quizDate}
                        onValueChange={(v) => {
                          set("quizDate", v);
                          set("quizTime", "");
                        }}
                        aria-invalid={err("quizDate") ? true : undefined}
                      />
                      <Select
                        name="quizTime"
                        aria-label={t.step3.quizTime}
                        emptyLabel={t.step3.quizTime}
                        options={(quizSlots.find((d) => d.date === input.quizDate)?.times ?? []).map((time) => ({
                          value: time,
                          label: time,
                        }))}
                        value={input.quizTime}
                        onValueChange={(v) => set("quizTime", v)}
                        aria-invalid={err("quizTime") ? true : undefined}
                      />
                    </div>
                    <span className="text-[13px] text-muted">{t.step3.quizSlotHint}</span>
                    {(err("quizDate") || err("quizTime")) && (
                      <span className="text-[13px] font-medium text-danger">{err("quizDate") || err("quizTime")}</span>
                    )}
                  </fieldset>
                )}
                {s.proof && (
                  <Upload
                    label={t.step3.idCard}
                    icon="card"
                    title={t.step3.idCardTitle}
                    note={t.step3.idCardNote}
                    t={t}
                    accept={UPLOAD_ACCEPT.schoolIdCard}
                    file={files.schoolIdCard}
                    error={err("schoolIdCard")}
                    onPick={(f) => pickFile("schoolIdCard", f)}
                  />
                )}
                <hr className="border-line" />
                <Choice
                  label={t.step3.contact}
                  required
                  value={input.contactRole}
                  error={err("contactRole")}
                  onChange={(v) => set("contactRole", v)}
                  options={(["Principal", "Class teacher"] as const).map((v) => ({ value: v, label: t.step3.contactRoles[v] }))}
                />
                <div className="grid gap-4 sm:grid-cols-2">
                  <Text
                    label={t.step3.contactName(input.contactRole ? t.step3.contactRoles[input.contactRole] : "")}
                    value={input.contactName}
                    error={err("contactName")}
                    onChange={(v) => set("contactName", v)}
                  />
                  <Text
                    label={t.step2.mobile}
                    type="tel"
                    phone
                    value={input.contactMobile}
                    error={err("contactMobile")}
                    placeholder={t.common.tenDigit}
                    onChange={(v) => set("contactMobile", onlyDigits(v, 10))}
                  />
                </div>
              </>
            )}
            {s.teacher && (
              <>
                <Choice
                  label={t.step3.teacher}
                  required
                  value={input.teacherStatus}
                  error={err("teacherStatus")}
                  onChange={(v) => set("teacherStatus", v)}
                  options={(["current", "retired"] as const).map((v) => ({ value: v, label: t.step3.teacherStatus[v] }))}
                />
                <Text
                  label={t.step3.subject}
                  optional
                  optionalLabel={t.common.optional}
                  value={input.subject}
                  placeholder={t.step3.subjectPlaceholder}
                  onChange={(v) => set("subject", v)}
                />
              </>
            )}
            {s.adult && (
              <Field label={t.step3.work} required error={err("work")}>
                <Select
                  name="work"
                  emptyLabel={t.common.select}
                  options={ADULT_WORK.map((w) => ({ value: w, label: t.step3.workOptions[w] ?? w }))}
                  value={input.work}
                  onValueChange={(v) => set("work", v)}
                  aria-invalid={err("work") ? true : undefined}
                />
              </Field>
            )}
            <hr className="border-line" />
            <fieldset className="grid gap-2.5">
              <legend className="text-[15px] font-bold">{t.step3.achievements}</legend>
              <p className="text-[13px] text-muted">{t.step3.achievementsHint}</p>
              <div className="grid gap-2 sm:grid-cols-2">
                {[...ACHIEVEMENTS, ACHIEVEMENT_OTHER].map((a) => (
                  <Tick
                    key={a}
                    boxed
                    checked={input.achievements.includes(a)}
                    onChange={(on) => set("achievements", on ? [...input.achievements, a] : input.achievements.filter((x) => x !== a))}
                  >
                    {a === ACHIEVEMENT_OTHER ? t.step3.otherAchievement : a}
                  </Tick>
                ))}
              </div>
              {input.achievements.includes(ACHIEVEMENT_OTHER) && (
                <Text
                  label={t.step3.yourAchievement}
                  value={input.achievementOther}
                  error={err("achievementOther")}
                  placeholder={t.step3.achievementPlaceholder}
                  onChange={(v) => set("achievementOther", v)}
                />
              )}
              <p className="rounded-card border border-primary/25 bg-primary-soft px-3.5 py-3 text-[14px] text-muted">
                <b className="text-dark">{t.step3.certLead}</b> {t.step3.cert}
              </p>
            </fieldset>
          </>
        )}

        {step === 4 && (
          <>
            <StepHead title={t.step4.title} text={t.step4.text} onBack={back} t={t} />
            <Upload
              label={t.step4.photo}
              icon="camera"
              title={t.step4.photoTitle}
              note={t.step4.photoNote}
              t={t}
              accept={UPLOAD_ACCEPT.photo}
              file={files.photo}
              error={err("photo")}
              onPick={(f) => pickFile("photo", f)}
            />
            <Text
              label={t.step4.aadhaar}
              type="tel"
              value={aadhaarView(input.aadhaar)}
              error={err("aadhaar")}
              placeholder="XXXX XXXX XXXX"
              autoComplete="off"
              hint={t.step4.aadhaarHint}
              onChange={(v) => set("aadhaar", onlyDigits(v, 12))}
            />
            <Upload
              label={t.step4.aadhaarCard}
              icon="card"
              title={t.step4.aadhaarCardTitle}
              note={t.step4.aadhaarCardNote}
              t={t}
              accept={UPLOAD_ACCEPT.aadhaarCard}
              file={files.aadhaarCard}
              error={err("aadhaarCard")}
              onPick={(f) => pickFile("aadhaarCard", f)}
            />
            {(s.group === "D" || s.group === "E") && (
              <p className="rounded-card border border-primary/25 bg-primary-soft px-3.5 py-3 text-[14px]">{t.step4.adultId}</p>
            )}
          </>
        )}

        {step === STEP_COUNT && (
          <>
            <StepHead title={t.step5.title} text={t.step5.text} onBack={back} t={t} />
            <Review
              input={input}
              files={files}
              t={t}
              onEdit={(n) => {
                setFromReview(true);
                go(n);
              }}
            />
            {s.group && fee !== null && (
              <div
                className={`flex items-center justify-between gap-4 rounded-card p-4.5 ${fee === 0 ? "border border-success/30 bg-success/10" : "bg-dark text-light"}`}
              >
                <div className="grid min-w-0 gap-0.5">
                  <span className={`text-[14px] ${fee === 0 ? "text-muted" : "text-light/75"}`}>
                    {fee === 0 ? t.step5.feeYours : t.step5.feeToPay}
                  </span>
                  <b className="font-display">
                    Group {s.group}
                    {s.minor && input.schoolType ? ` · ${t.step1.schoolTypes[input.schoolType]}` : ""}
                  </b>
                </div>
                <span
                  className={`font-display text-[30px] font-extrabold whitespace-nowrap tabular-nums ${fee === 0 ? "text-success" : "text-secondary"}`}
                >
                  {fee === 0 ? t.common.free : rupees(fee)}
                </span>
              </div>
            )}
            <p className="-mt-3 text-[13px] text-muted">{fee === 0 ? t.step5.freeNote : t.step5.payNote}</p>
            <RulesBox lang={lang} t={t} onRead={() => setReviewSeen(true)} />
            {reviewSeen ? (
              <Tick boxed small checked={input.agree} error={err("agree")} onChange={(v) => set("agree", v)}>
                {t.step5.agreeBefore}
                <a href={rules.gu} target="_blank" rel="noopener" className="font-semibold text-dark underline">
                  {t.step5.rulesGu}
                </a>
                {" / "}
                <a href={rules.en} target="_blank" rel="noopener" className="font-semibold text-dark underline">
                  {t.step5.rulesEn}
                </a>
                {t.step5.agreeAfter}
                {s.minor && t.step5.parentAgree}
                {t.step5.privacyBefore}
                <a href="/privacy" target="_blank" className="font-semibold text-dark underline">
                  {t.step5.privacy}
                </a>
                {t.step5.privacyAfter}
              </Tick>
            ) : (
              <p className="rounded-card border border-dashed border-line px-4 py-3 text-[13px] text-muted" {...bad("agree")}>
                {t.step5.readFirst}
                {err("agree") && <span className="mt-1 block font-medium text-danger">{err("agree")}</span>}
              </p>
            )}
            <Turnstile key={attempt} />
          </>
        )}

        {message && (
          <p role="alert" className="rounded-card bg-primary-soft px-4 py-3 text-[15px] text-primary-hover">
            {message}
          </p>
        )}

        {/* On phones the fee and the Next button stay in view at the bottom of the screen. */}
        <div className="flex items-center gap-3 border-t border-line pt-5 max-lg:sticky max-lg:bottom-0 max-lg:z-20 max-lg:-mx-5 max-lg:-mb-7 max-lg:bg-light max-lg:px-5 max-lg:pb-[calc(12px+env(safe-area-inset-bottom))] max-lg:shadow-[0_-6px_16px_-10px_var(--color-dark)] sm:max-lg:-mx-8 sm:max-lg:px-8">
          <div className="min-w-0 flex-1 leading-tight">
            <small className="block text-[12.5px] text-muted">{s.group ? t.common.groupFee(s.group) : t.common.yourFee}</small>
            <b className={`font-display text-[19px] font-extrabold whitespace-nowrap tabular-nums ${fee === 0 ? "text-success" : ""}`}>
              {fee === null ? "—" : fee === 0 ? t.common.free : rupees(fee)}
            </b>
          </div>
          {step > 1 && (
            <button type="button" onClick={back} className="btn btn-outline max-sm:px-4">
              <ArrowLeft /> <span className="max-[420px]:sr-only">{t.common.back}</span>
            </button>
          )}
          <button type="submit" disabled={pending || (step === STEP_COUNT && !input.agree)} className="btn btn-primary">
            {pending ? t.common.wait : nextLabel}
            {!pending && step < STEP_COUNT && <ArrowRight />}
          </button>
        </div>
      </form>
    </div>
  );
}

function StepHead({ title, text, onBack, t }: { title: string; text?: string; onBack?: () => void; t?: RegistrationText }) {
  return (
    <div className="grid gap-1">
      {onBack && (
        <button
          type="button"
          onClick={onBack}
          className="mb-1 inline-flex w-max items-center gap-1.5 text-[14px] font-bold text-muted hover:text-primary"
        >
          <ArrowLeft /> {t?.common.back}
        </button>
      )}
      <h2 className="font-display text-[clamp(22px,3vw,26px)] leading-tight font-extrabold">{title}</h2>
      {text && <p className="text-[15px] text-muted">{text}</p>}
    </div>
  );
}

function Field({
  label,
  required,
  optional,
  optionalLabel = "(optional)",
  error,
  hint,
  children,
}: {
  label: string;
  required?: boolean;
  optional?: boolean;
  optionalLabel?: string;
  error?: string;
  hint?: string;
  children: ReactNode;
}) {
  return (
    <label className="grid min-w-0 content-start gap-2" {...(error ? { "data-bad": true } : {})}>
      <span className="text-[15px] leading-snug font-bold">
        {label}
        {required && <span className="ml-0.5 text-primary">*</span>}
        {optional && <span className="ml-1 font-normal text-muted">{optionalLabel}</span>}
      </span>
      {children}
      {hint && <span className="text-[13px] text-muted">{hint}</span>}
      {error && <span className="text-[13px] font-medium text-danger">{error}</span>}
    </label>
  );
}

function Text({
  label,
  value,
  onChange,
  error,
  hint,
  optional,
  optionalLabel,
  type = "text",
  phone,
  placeholder,
  autoComplete,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  error?: string;
  hint?: string;
  optional?: boolean;
  optionalLabel?: string;
  type?: "text" | "tel" | "email";
  /** Indian mobile number: a fixed +91 shows before the 10 digits typed. */
  phone?: boolean;
  placeholder?: string;
  autoComplete?: string;
}) {
  return (
    <Field label={label} required={!optional} optional={optional} optionalLabel={optionalLabel} error={error} hint={hint}>
      <span className="relative block">
        {phone && (
          <span aria-hidden="true" className="pointer-events-none absolute inset-y-0 left-3.5 flex items-center font-medium text-muted">
            +91
          </span>
        )}
        <input
          type={type}
          inputMode={type === "tel" ? "numeric" : undefined}
          value={value}
          placeholder={placeholder}
          autoComplete={autoComplete}
          maxLength={200}
          onChange={(e) => onChange(e.target.value)}
          aria-invalid={error ? true : undefined}
          className={`field ${phone ? "pl-12!" : ""} ${error ? "border-danger" : ""}`}
        />
      </span>
    </Field>
  );
}

function Choice<V extends string>({
  label,
  options,
  value,
  onChange,
  error,
  hint,
  required,
  columns = 2,
}: {
  label: string;
  options: { value: V; label: string; note?: string }[];
  value: V | "";
  onChange: (v: V) => void;
  error?: string;
  hint?: string;
  required?: boolean;
  columns?: 2 | 3;
}) {
  return (
    <div role="group" aria-label={label} className="grid gap-2" {...(error ? { "data-bad": true } : {})}>
      <span className="text-[15px] font-bold">
        {label}
        {required && <span className="ml-0.5 text-primary">*</span>}
      </span>
      <div className={`grid gap-2 ${columns === 3 ? "grid-cols-3" : "grid-cols-2"}`}>
        {options.map((o) => (
          <button
            key={o.value}
            type="button"
            aria-pressed={value === o.value}
            onClick={() => onChange(o.value)}
            className={`grid min-h-13 place-content-center rounded-card border-[1.5px] px-2 py-2.5 text-center text-[15px] leading-tight font-bold transition aria-pressed:border-dark aria-pressed:bg-dark aria-pressed:text-light ${error ? "border-danger" : "border-line hover:border-muted/40"}`}
          >
            {o.label}
            {o.note && <small className="mt-0.5 block text-[12px] font-medium opacity-70">{o.note}</small>}
          </button>
        ))}
      </div>
      {hint && <span className="text-[13px] text-muted">{hint}</span>}
      {error && <span className="text-[13px] font-medium text-danger">{error}</span>}
    </div>
  );
}

function Tick({
  checked,
  onChange,
  boxed,
  small,
  disabled,
  note,
  error,
  children,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
  boxed?: boolean;
  small?: boolean;
  disabled?: boolean;
  /** Shown under the tick, e.g. why it can't be ticked yet. */
  note?: string;
  error?: string;
  children: ReactNode;
}) {
  return (
    <div {...(error ? { "data-bad": true } : {})}>
      <label
        className={`flex items-start gap-3 ${small ? "text-[13px]" : "text-[15px]"} leading-snug ${disabled ? "cursor-not-allowed opacity-55" : "cursor-pointer"} ${boxed ? `rounded-card border-[1.5px] p-3.5 ${error ? "border-danger" : checked ? "border-dark" : "border-line hover:border-muted/40"}` : ""}`}
      >
        <input
          type="checkbox"
          checked={checked}
          disabled={disabled}
          onChange={(e) => onChange(e.target.checked)}
          className="mt-0.5 h-5 w-5 shrink-0 accent-primary disabled:cursor-not-allowed"
        />
        <span>{children}</span>
      </label>
      {note && <span className="mt-1.5 block text-[13px] font-medium text-muted">{note}</span>}
      {error && <span className="mt-1.5 block text-[13px] font-medium text-danger">{error}</span>}
    </div>
  );
}

/** The Rules and Terms in the form's language, in a scrollable box. Reaching its end counts as read and shows the agree tick. */
function RulesBox({ lang, t, onRead }: { lang: RegLang; t: RegistrationText; onRead: () => void }) {
  const box = useRef<HTMLDivElement>(null);
  const intro = lang === "gu" ? rulesIntroGu : rulesIntro;
  const sections = lang === "gu" ? rulesGu : rulesEn;
  useEffect(() => {
    const el = box.current;
    if (!el) return;
    const check = () => {
      if (el.scrollTop + el.clientHeight < el.scrollHeight - 12) return;
      onRead();
      el.removeEventListener("scroll", check);
    };
    check();
    el.addEventListener("scroll", check, { passive: true });
    return () => el.removeEventListener("scroll", check);
    // Watches once per visit to the review step; onRead only flips a flag.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  return (
    <section aria-labelledby="rules-title" className="grid gap-2">
      <h3 id="rules-title" className="font-display text-[15px] font-extrabold">
        {t.step5.rulesTitle}
      </h3>
      <div
        ref={box}
        tabIndex={0}
        role="region"
        aria-label={t.step5.rulesTitle}
        lang={lang}
        className="max-h-[440px] overflow-y-auto overscroll-contain rounded-card border border-line bg-soft px-4 py-3.5 text-[13px] leading-relaxed focus-visible:outline-2 focus-visible:outline-primary"
      >
        <p className="font-display text-[14.5px] font-extrabold">{intro.title}</p>
        <p className="text-[12px] text-muted">{intro.meta}</p>
        <p className="mt-2 font-semibold">{intro.lead}</p>
        {sections.map((sec) => (
          <div key={sec.title} className="mt-3.5">
            <p className="font-display text-[13.5px] font-bold">{sec.title}</p>
            {sec.blocks.map((b, i) =>
              "list" in b ? (
                <ul key={i} className="mt-1.5 grid list-disc gap-1 pl-5">
                  {b.list.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              ) : (
                <p key={i} className="mt-1.5">
                  {b.text}
                </p>
              ),
            )}
          </div>
        ))}
        <p className="mt-5 border-t border-line pt-3 text-[12px] text-muted">{t.step5.rulesFooter}</p>
      </div>
    </section>
  );
}

function Upload({
  label,
  title,
  note,
  accept,
  file,
  error,
  icon,
  onPick,
  t,
}: {
  label?: string;
  title: string;
  note: string;
  accept: string;
  file?: File;
  error?: string;
  icon: "camera" | "card";
  onPick: (f: File | undefined) => void;
  t: RegistrationText;
}) {
  const Icon = icon === "camera" ? Camera : FileText;
  return (
    <div className="grid gap-2" {...(error ? { "data-bad": true } : {})}>
      {label && (
        <span className="text-[15px] font-bold">
          {label}
          <span className="ml-0.5 text-primary">*</span>
        </span>
      )}
      <label
        className={`relative flex cursor-pointer items-center gap-3.5 rounded-card border-[1.5px] p-3.5 focus-within:outline-2 focus-within:outline-primary ${file ? "border-success/40 bg-success/10" : error ? "border-danger" : "border-dashed border-muted/40 hover:border-dark"}`}
      >
        <input
          type="file"
          accept={accept}
          className="absolute inset-0 cursor-pointer opacity-0"
          onChange={(e) => {
            onPick(e.target.files?.[0]);
            // Picking the same file again (after fixing it) still triggers a change.
            e.target.value = "";
          }}
        />
        <span className="grid h-11 w-11 shrink-0 place-items-center rounded-card bg-soft text-[22px]">
          {file ? <CheckCircle className="text-success" /> : <Icon />}
        </span>
        <span className="grid min-w-0 gap-0.5">
          <b className="text-[15px]">{title}</b>
          <span className="truncate text-[13px] text-muted">{file ? file.name : note}</span>
        </span>
        <span className={`ml-auto shrink-0 text-[14px] font-bold ${file ? "text-success" : "text-primary"}`}>
          {file ? t.common.change : t.common.upload}
        </span>
      </label>
      {error && <span className="text-[13px] font-medium text-danger">{error}</span>}
    </div>
  );
}

function GroupBox({ group, warning, pending, t }: { group: GroupId | ""; warning?: string; pending?: string; t: RegistrationText }) {
  const tone = group ? "border-success/30 bg-success/10" : warning ? "border-danger/30 bg-danger/5" : "border-line bg-soft";
  return (
    <div
      className={`flex items-center gap-3.5 rounded-card border px-4 py-3.5 ${tone}`}
      {...(warning && !group ? { "data-bad": true } : {})}
    >
      <span
        className={`grid h-12 w-12 shrink-0 place-items-center rounded-card border font-display text-[22px] font-extrabold ${group ? "border-success bg-success text-light" : warning ? "border-line bg-light text-danger" : "border-line bg-light text-muted"}`}
      >
        {group || (warning ? "!" : "?")}
      </span>
      <span className="grid min-w-0 gap-0.5">
        <b className="font-display">{group ? t.group.yours(group) : warning ? t.group.undecided : t.group.empty}</b>
        <span className="text-[14px] text-muted">{group ? t.group.summary[group] : warning || pending || t.group.fillAbove}</span>
      </span>
    </div>
  );
}

/** Every answer, grouped by the step that asks it; the review shows it and the PDF prints it. */
function reviewSections(input: RegistrationInput, files: Partial<Record<FileKey, File>>, t: RegistrationText) {
  const s = shape(input);
  const r = t.review;
  const achievements = input.achievements.map((a) => (a === ACHIEVEMENT_OTHER ? input.achievementOther || t.step3.otherAchievement : a));
  const aadhaar = onlyDigits(input.aadhaar, 12);
  const sections: { step: number; title: string; rows: (false | "" | [string, string])[] }[] = [
    {
      step: 1,
      title: r.sections.group,
      rows: [
        [r.participant, input.who === "adult" ? r.adult : input.who ? t.step1.whoOptions[input.who].label : ""],
        [r.dob, longDate(input.dob)],
        s.student && [r.schoolType, input.schoolType ? t.step1.schoolTypes[input.schoolType] : ""],
        s.asksStd6to8 && [r.std6to8, input.govtStd6to8 ? t.step1.std6to8Options[input.govtStd6to8] : ""],
        [r.group, s.group ? `${s.group} · ${t.group.summary[s.group]}` : ""],
      ],
    },
    {
      step: 2,
      title: r.sections.details,
      rows: [
        [r.name, [input.firstName, s.orphan ? "" : input.fatherName, input.surname].filter(Boolean).join(" ")],
        !s.orphan && [r.mother, input.motherName],
        [r.mobile, input.mobile],
        [r.whatsapp, input.whatsappSame ? input.mobile : input.whatsapp],
        [r.email, input.email],
        [r.address, [input.address, input.district, input.pin].filter(Boolean).join(", ")],
        s.quiz && [r.quiz, input.quizLanguage === "gu" ? "ગુજરાતી" : input.quizLanguage === "en" ? "English" : ""],
        s.quiz && [r.quizWindow, t.step2.quizWindows[input.quizWindow] ?? ""],
        s.student && [
          r.parents,
          input.fatherAlive && input.motherAlive
            ? r.bothAlive
            : input.fatherAlive
              ? r.onlyFather
              : input.motherAlive
                ? r.onlyMother
                : r.orphanRow,
        ],
        s.minor && [
          input.parentWho === "other" ? r.guardian : r.parent,
          `${input.parentName} · ${input.parentSameMobile ? input.mobile : input.parentMobile}`,
        ],
      ],
    },
    {
      step: 3,
      title: s.adult ? r.sections.aboutYou : r.sections.school,
      rows: [
        !s.adult && [r.school, input.school],
        s.student && [r.std, input.std],
        s.slot && input.quizDate && [r.quizSlot, `${input.quizDate} · ${input.quizTime}`],
        s.proof && input.schoolId.trim() && [r.schoolId, input.schoolId],
        s.proof && [r.idCard, files.schoolIdCard?.name ?? ""],
        s.student && [
          input.contactRole ? t.step3.contactRoles[input.contactRole] : r.contact,
          `${input.contactName} · ${input.contactMobile}`,
        ],
        s.teacher && [
          r.teacher,
          `${input.teacherStatus ? t.step3.teacherStatus[input.teacherStatus] : ""}${input.subject ? ` · ${input.subject}` : ""}`,
        ],
        s.adult && [r.work, t.step3.workOptions[input.work] ?? input.work],
        [r.achievements, achievements.length ? achievements.join(", ") : r.none],
      ],
    },
    {
      step: 4,
      title: r.sections.documents,
      rows: [
        [r.photo, files.photo?.name ?? ""],
        [r.aadhaar, aadhaar ? `XXXX XXXX ${aadhaar.slice(-4)}` : ""],
        [r.aadhaarCard, files.aadhaarCard?.name ?? ""],
      ],
    },
  ];
  return sections.map((sec) => ({ ...sec, rows: sec.rows.filter((row): row is [string, string] => Boolean(row)) }));
}

function Review({
  input,
  files,
  onEdit,
  t,
}: {
  input: RegistrationInput;
  files: Partial<Record<FileKey, File>>;
  onEdit: (step: number) => void;
  t: RegistrationText;
}) {
  const r = t.review;
  return (
    <div className="grid gap-3">
      {reviewSections(input, files, t).map((sec) => (
        <div key={sec.step} className="overflow-hidden rounded-card border border-line">
          <h3 className="flex items-center justify-between bg-soft px-4 py-3 font-display text-[15px] font-extrabold">
            {sec.title}
            <button type="button" onClick={() => onEdit(sec.step)} className="font-sans text-[14px] font-bold text-primary hover:underline">
              {r.edit}
            </button>
          </h3>
          <dl className="px-4 py-1">
            {sec.rows.map(([k, v]) => (
              <div key={k} className="grid gap-0.5 border-b border-line py-2.5 text-[15px] last:border-0 sm:grid-cols-[160px_1fr] sm:gap-3">
                <dt className="text-muted">{k}</dt>
                <dd className={`min-w-0 font-medium [overflow-wrap:anywhere] ${v ? "" : "text-danger"}`}>{v || r.empty}</dd>
              </div>
            ))}
          </dl>
        </div>
      ))}
    </div>
  );
}
