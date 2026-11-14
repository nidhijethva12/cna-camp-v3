import "server-only";
import type { BackendResult } from "./backend";

/** What every Olympiad form action returns; values are echoed back because React resets forms. */
export interface FormState<F extends string = string, D = undefined> {
  status: "idle" | "success" | "error";
  message?: string;
  fieldErrors?: Partial<Record<F, string>>;
  values?: Partial<Record<F, string>>;
  data?: D;
}

/** A trimmed, length-capped text field. The API validates everything again. */
export const field = (fd: FormData, key: string, max = 200) =>
  String(fd.get(key) ?? "")
    .trim()
    .slice(0, max);

export const checked = (fd: FormData, key: string) => fd.get(key) === "on";

/** The anti-spam fields every public form forwards to the API. */
export const antiSpam = (fd: FormData) => ({ website: field(fd, "website"), turnstileToken: field(fd, "cf-turnstile-response", 2048) });

/** Turns an API answer into the form's state. */
export function toFormState<F extends string, D>(result: BackendResult<D>, values: Partial<Record<F, string>>): FormState<F, D> {
  if (result.ok) return { status: "success", data: result.data };
  const fieldErrors = result.fieldErrors as Partial<Record<F, string>> | undefined;
  return { status: "error", message: fieldErrors ? "Please check the highlighted fields." : result.message, fieldErrors, values };
}
