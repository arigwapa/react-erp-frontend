// ==========================================
// ProgressBar.tsx — Reusable Progress Bar
// Displays a horizontal progress bar with
// percentage label, customizable colors, and
// status-based color presets (on-track, at-risk,
// delayed). Used in production monitoring,
// work orders, and dashboards.
// ==========================================

import React from "react";

// ------------------------------------------
// Props Interface
// ------------------------------------------
interface ProgressBarProps {
  /** Current progress percentage (0–100) */
  value: number;
  /** Label shown on the left (optional) */
  label?: string;
  /** Show percentage text on the right */
  showPercent?: boolean;
  /** Bar height class — defaults to "h-2" */
  height?: string;
  /** Color preset based on status */
  status?: "on-track" | "at-risk" | "delayed" | "completed" | "default";
  /** Custom bar color class (overrides status) */
  barColor?: string;
  /** Additional class name */
  className?: string;
}

// ------------------------------------------
// Status-to-color mapping
// ------------------------------------------
const STATUS_COLORS: Record<string, string> = {
  "on-track": "bg-emerald-500",
  "at-risk": "bg-amber-500",
  delayed: "bg-rose-500",
  completed: "bg-indigo-500",
  default: "bg-blue-500",
};

const STATUS_TEXT_COLORS: Record<string, string> = {
  "on-track": "text-emerald-700 dark:text-emerald-400",
  "at-risk": "text-amber-700 dark:text-amber-400",
  delayed: "text-rose-700 dark:text-rose-400",
  completed: "text-indigo-700 dark:text-indigo-400",
  default: "text-blue-700 dark:text-blue-400",
};

// ------------------------------------------
// Component
// ------------------------------------------
const ProgressBar: React.FC<ProgressBarProps> = ({
  value,
  label,
  showPercent = true,
  height = "h-2",
  status = "default",
  barColor,
  className = "",
}) => {
  const clampedValue = Math.min(100, Math.max(0, value));
  const color = barColor || STATUS_COLORS[status];
  const textColor = STATUS_TEXT_COLORS[status];

  return (
    <div className={`w-full ${className}`}>
      {/* Label + Percentage */}
      {(label || showPercent) && (
        <div className="flex items-center justify-between mb-1.5">
          {label && (
            <span className="text-[11px] font-medium text-slate-600 dark:text-slate-400">
              {label}
            </span>
          )}
          {showPercent && (
            <span className={`text-[11px] font-bold ${textColor}`}>
              {clampedValue}%
            </span>
          )}
        </div>
      )}

      {/* Track */}
      <div className={`w-full bg-slate-100 dark:bg-slate-800 rounded-full ${height} overflow-hidden`}>
        <div
          className={`${height} rounded-full transition-all duration-500 ease-out ${color}`}
          style={{ width: `${clampedValue}%` }}
          role="progressbar"
          aria-valuenow={clampedValue}
          aria-valuemin={0}
          aria-valuemax={100}
        />
      </div>
    </div>
  );
};

export default ProgressBar;
