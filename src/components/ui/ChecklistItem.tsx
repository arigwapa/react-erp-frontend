// ==========================================
// ChecklistItem.tsx — Reusable Checklist Row
// Displays a pass/fail checklist item with
// label, status dot, and optional description.
// Used for release validation checklists,
// compliance readiness, and approval gates.
// ==========================================

import React from "react";
import { CheckCircle, XCircle } from "lucide-react";

// ------------------------------------------
// Props Interface
// ------------------------------------------
interface ChecklistItemProps {
  /** Label text for the checklist row */
  label: string;
  /** Whether this item passes the check */
  passed: boolean;
  /** Optional description text below the label */
  description?: string;
}

// ------------------------------------------
// Component
// ------------------------------------------
const ChecklistItem: React.FC<ChecklistItemProps> = ({
  label,
  passed,
  description,
}) => {
  return (
    <div className="flex items-start gap-3 px-4 py-3">
      <div className="mt-0.5 shrink-0">
        {passed ? (
          <CheckCircle size={16} className="text-emerald-500" />
        ) : (
          <XCircle size={16} className="text-rose-500" />
        )}
      </div>
      <div className="min-w-0 flex-1">
        <p className={`text-sm font-medium ${passed ? "text-slate-700 dark:text-slate-300" : "text-rose-700 dark:text-rose-400"}`}>
          {label}
        </p>
        {description && (
          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
            {description}
          </p>
        )}
      </div>
      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0 ${
        passed
          ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400"
          : "bg-rose-50 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400"
      }`}>
        {passed ? "Pass" : "Fail"}
      </span>
    </div>
  );
};

export default ChecklistItem;
