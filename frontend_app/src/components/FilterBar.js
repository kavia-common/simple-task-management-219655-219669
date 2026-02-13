import React from "react";

const FILTERS = [
  { key: "all", label: "All" },
  { key: "active", label: "Active" },
  { key: "completed", label: "Completed" },
];

// PUBLIC_INTERFACE
export default function FilterBar({ value, onChange, counts }) {
  /** Filter selector for task list. */
  return (
    <div className="filterBar" role="toolbar" aria-label="Task filters">
      <div className="filterBar-left">
        <span className="filterBar-label">Filter:</span>
        <div className="segmented" role="group" aria-label="Select filter">
          {FILTERS.map((f) => {
            const active = value === f.key;
            return (
              <button
                key={f.key}
                type="button"
                className={`segmented-btn ${active ? "isActive" : ""}`}
                onClick={() => onChange(f.key)}
                aria-pressed={active}
              >
                {f.label}
              </button>
            );
          })}
        </div>
      </div>

      <div className="filterBar-right" aria-label="Task counts">
        <span className="pill" title="Active tasks">
          Active: <strong>{counts.active}</strong>
        </span>
        <span className="pill" title="Completed tasks">
          Done: <strong>{counts.completed}</strong>
        </span>
        <span className="pill" title="All tasks">
          Total: <strong>{counts.total}</strong>
        </span>
      </div>
    </div>
  );
}
