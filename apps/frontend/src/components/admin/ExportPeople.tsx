"use client";

const BASE = "/api/olympiad-people/export";

/** "Export to Excel" above the master list; the file follows the filters applied to the list. */
export function ExportPeople() {
  return (
    <div className="cna-export">
      <a
        href={BASE}
        download
        className="btn btn--style-secondary btn--size-small"
        onClick={(e) => {
          const filters = [...new URLSearchParams(window.location.search)].filter(([key]) => key.startsWith("where") || key === "search");
          e.currentTarget.href = filters.length ? `${BASE}?${new URLSearchParams(filters)}` : BASE;
        }}
      >
        Export to Excel
      </a>
      <span>Uses the filters and search above. Aadhaar shows only the last 4 digits.</span>
    </div>
  );
}
