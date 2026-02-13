// ==========================================
// DashboardStatsCard.tsx
// A reusable stats card designed for dashboard KPI grids.
// Features: themed icon, trend indicator with arrow,
// optional subtext, and a decorative background glow.
// ==========================================

import React from "react";
import { ArrowUpRight, ArrowDownRight, type LucideIcon } from "lucide-react";

// ------------------------------------------
// Types
// ------------------------------------------

/** Available color themes for the card */
export type DashboardCardTheme = "indigo" | "blue" | "emerald" | "cyan";

export interface DashboardStatsCardProps {
  /** Card title (e.g. "Total Users") */
  title: string;
  /** Primary display value (e.g. "2,543") */
  value: string;
  /** Lucide icon to display */
  icon: LucideIcon;
  /** Color theme that controls icon, trend, and glow colors */
  colorTheme: DashboardCardTheme;
  /** Optional trend label (e.g. "+12%", "Stable") */
  trend?: string;
  /** Whether the trend is positive (green arrow) or negative (red arrow) */
  trendUp?: boolean;
  /** Optional small description below the value */
  subText?: string;
}

// ------------------------------------------
// Theme Configuration
// Maps each color theme to its Tailwind classes
// ------------------------------------------
const THEME_STYLES: Record<
  DashboardCardTheme,
  { bg: string; bgSoft: string; text: string }
> = {
  indigo: {
    bg: "bg-indigo-500",
    bgSoft: "bg-indigo-50",
    text: "text-indigo-600",
  },
  blue: {
    bg: "bg-blue-500",
    bgSoft: "bg-blue-50",
    text: "text-blue-600",
  },
  emerald: {
    bg: "bg-emerald-500",
    bgSoft: "bg-emerald-50",
    text: "text-emerald-600",
  },
  cyan: {
    bg: "bg-cyan-600",
    bgSoft: "bg-cyan-50",
    text: "text-cyan-600",
  },
};

// ------------------------------------------
// Component
// ------------------------------------------
const DashboardStatsCard: React.FC<DashboardStatsCardProps> = ({
  title,
  value,
  icon: Icon,
  colorTheme,
  trend,
  trendUp,
  subText,
}) => {
  const theme = THEME_STYLES[colorTheme];

  return (
    <div
      className="group relative overflow-hidden bg-white p-5 rounded-2xl border border-slate-100 shadow-[0_2px_10px_-3px_rgba(6,81,237,0.1)] hover:shadow-lg transition-all duration-300 hover:-translate-y-1"
      role="article"
      aria-labelledby={`stat-${title.replace(/\s+/g, "-").toLowerCase()}`}
    >
      {/* Top Row: Icon + Trend Pill */}
      <div className="flex justify-between items-start mb-3">
        {/* Themed Icon */}
        <div
          className={`p-2.5 rounded-2xl ${theme.bgSoft} ${theme.text}`}
          aria-hidden="true"
        >
          <Icon size={20} />
        </div>

        {/* Trend Indicator (only rendered if trend prop exists) */}
        {trend && (
          <div
            className={`flex items-center gap-1 text-[10px] font-bold px-2.5 py-1 rounded-full ${
              trendUp
                ? "bg-emerald-50 text-emerald-600"
                : "bg-rose-50 text-rose-600"
            }`}
            role="status"
            aria-label={`Trending ${trendUp ? "up" : "down"} by ${trend}`}
          >
            {trendUp ? (
              <ArrowUpRight size={12} aria-hidden="true" />
            ) : (
              <ArrowDownRight size={12} aria-hidden="true" />
            )}
            <span>{trend}</span>
          </div>
        )}
      </div>

      {/* Content: Title, Value, SubText */}
      <div>
        <p
          id={`stat-${title.replace(/\s+/g, "-").toLowerCase()}`}
          className="text-slate-500 text-xs font-medium mb-1"
        >
          {title}
        </p>
        <h3 className="text-xl font-bold text-slate-800 tracking-tight">
          {value}
        </h3>
        {subText && (
          <p className="text-[10px] text-slate-400 mt-2 font-medium">
            {subText}
          </p>
        )}
      </div>

      {/* Decorative Gradient Blob (background glow effect) */}
      <div
        className={`absolute -right-6 -bottom-6 w-24 h-24 rounded-full ${theme.bg} opacity-5 group-hover:opacity-10 transition-opacity blur-2xl pointer-events-none`}
        aria-hidden="true"
      />
    </div>
  );
};

export default DashboardStatsCard;
