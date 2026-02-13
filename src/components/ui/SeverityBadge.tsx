// ==========================================
// SeverityBadge.tsx — Reusable Severity Badge
// Displays Low / Medium / High severity with
// color-coded styling. Used in QA inspection,
// defect management, and CAPA pages.
// ==========================================

import React from "react";

// ------------------------------------------
// Types
// ------------------------------------------
export type Severity = "Low" | "Medium" | "High";

interface SeverityBadgeProps {
  severity: Severity;
  className?: string;
}

// ------------------------------------------
// Style Map
// ------------------------------------------
const SEVERITY_STYLES: Record<Severity, string> = {
  Low: "bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
  Medium: "bg-amber-50 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
  High: "bg-rose-50 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400",
};

// ------------------------------------------
// Component
// ------------------------------------------
const SeverityBadge: React.FC<SeverityBadgeProps> = ({ severity, className = "" }) => {
  return (
    <span
      className={`
        inline-flex items-center px-2.5 py-1 rounded-full w-fit
        text-xs font-medium capitalize
        ${SEVERITY_STYLES[severity]}
        ${className}
      `}
    >
      {severity}
    </span>
  );
};

export default SeverityBadge;
