"use client";

import { useState } from "react";
import { Select } from "@/components/ui/Select";

type Group = "A" | "B" | "C";

const ages: Record<Group, string> = { A: "8+ to 16 years", B: "16+ to 18 years", C: "18+ to 30 years" };

const groupFor = (std: string): Group => (std === "col" ? "C" : Number(std) <= 9 ? "A" : "B");

/** Government school students pay the lower fee in Groups A and B. */
const feeFor = (group: Group, govt: boolean) =>
  group === "A" ? (govt ? "₹90" : "₹230") : group === "B" ? (govt ? "₹230" : "₹320") : "₹320";

/** Helper only: the organisers make the final eligibility check. */
export function GroupFinder() {
  const [role, setRole] = useState("student");
  const [std, setStd] = useState("");
  const [govt, setGovt] = useState("no");

  const teacher = role === "teacher";
  const group = std ? groupFor(std) : null;
  const scholarship =
    group && group !== "C" && govt === "yes"
      ? { text: "Scholarship 1 · K.S. Sir Lavkumar Khachar:", pct: "100%" }
      : group === "C" && govt === "yes"
        ? {
            text: "Scholarship 2 · Sir Dr. Ketankumar Trivedi:",
            pct: "up to 70%",
            note: " (if you now study in a govt. or grant-aided college)",
          }
        : { text: "Scholarship 2 · Sir Dr. Ketankumar Trivedi:", pct: "up to 60%" };

  return (
    <div id="finder" className="mt-8 grid scroll-mt-32 gap-6 rounded-card bg-dark p-6 text-light sm:p-8 lg:grid-cols-[1fr_1.1fr]">
      <div>
        <p className="text-[13.5px] font-medium text-secondary">Not sure?</p>
        <h2 className="display h-sub mt-2">Which group am I?</h2>
        <p className="mt-2 text-light/70">Answer 3 quick questions. We show your group, fee and scholarship.</p>
        <form className="mt-6 grid items-end gap-4 sm:grid-cols-2" onSubmit={(e) => e.preventDefault()}>
          <label className="block sm:col-span-2">
            <span className="eyebrow text-secondary!">I am a</span>
            <Select
              name="role"
              options={[
                { value: "student", label: "Student" },
                { value: "teacher", label: "Nature, adventure or sports person" },
              ]}
              value={role}
              onValueChange={setRole}
              className="mt-2 text-dark"
            />
          </label>
          {!teacher && (
            <>
              <label className="block">
                <span className="eyebrow text-secondary!">Class in 2025-26</span>
                <Select
                  name="std"
                  emptyLabel="Choose"
                  options={[
                    ...["4", "5", "6", "7", "8", "9", "10", "11", "12"].map((s) => ({ value: s, label: `Std ${s}` })),
                    { value: "col", label: "College / university" },
                  ]}
                  value={std}
                  onValueChange={setStd}
                  className="mt-2 text-dark"
                />
              </label>
              <label className="block">
                <span className="eyebrow text-secondary!">Government school student?</span>
                <Select
                  name="govt"
                  options={[
                    { value: "no", label: "No" },
                    { value: "yes", label: "Yes" },
                  ]}
                  value={govt}
                  onValueChange={setGovt}
                  className="mt-2 text-dark"
                />
              </label>
            </>
          )}
        </form>
      </div>
      <div className="rounded-card bg-light/5 p-6" aria-live="polite">
        {teacher ? (
          <>
            <p className="text-[13.5px] font-medium text-secondary">Your group</p>
            <p className="display mt-1 text-[56px] leading-none">D</p>
            <p className="mt-3 font-bold">Nature, adventure &amp; sports persons (18+)</p>
            <p className="mt-1 text-light/70">No exam. Direct selection as a volunteer or escort.</p>
            <p className="mt-4 text-[22px] font-bold text-secondary">Fee ₹923</p>
          </>
        ) : group ? (
          <>
            <p className="text-[13.5px] font-medium text-secondary">Your group</p>
            <p className="display mt-1 text-[56px] leading-none">{group}</p>
            <p className="mt-3 font-bold">Age {ages[group]}</p>
            <p className="mt-3 text-light/80">
              {scholarship.text} <strong>{scholarship.pct}</strong>
              {scholarship.note}
            </p>
            <p className="mt-4 text-[22px] font-bold text-secondary">Fee {feeFor(group, govt === "yes")}</p>
            <p className="mt-4 text-[13px] text-light/50">
              Apply for only one scholarship. Your age must match the group. Organisers make the final check.
            </p>
          </>
        ) : (
          <p className="text-light/60">Choose your class to see your group.</p>
        )}
      </div>
    </div>
  );
}
