"use client";

import { useState } from "react";

/** Copies `value` to the clipboard and says so for a moment. */
export function CopyButton({ value, label = "Copy", className = "" }: { value: string; label?: string; className?: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <button
      type="button"
      onClick={async () => {
        try {
          await navigator.clipboard.writeText(value);
          setCopied(true);
          setTimeout(() => setCopied(false), 2000);
        } catch {
          setCopied(false);
        }
      }}
      className={className}
    >
      <span aria-live="polite">{copied ? "Copied" : label}</span>
    </button>
  );
}
