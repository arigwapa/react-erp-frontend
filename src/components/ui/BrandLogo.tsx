// ==========================================
// BrandLogo.tsx
// Displays the official Weave ERP logo (square, left-aligned),
// company name "WEAVE Co., Ltd.", and below it the role/branch
// indicator badge.
//
// Roles:
//   "super-admin"  → Purple badge: "Super Admin"
//   "branch-admin" → Amber badge:  "{branch} — {roleLabel}"
//
// The roleLabel prop lets each sidebar customise the label:
//   Admin sidebar   → "Manila — Admin"
//   PLM sidebar     → "Manila — PLM"
//   Finance sidebar → "Manila — Finance"
//   etc.
// ==========================================

import React from "react";
import {
  Shield,
  Briefcase,
  Layers,
  Factory,
  ClipboardCheck,
  Warehouse,
  DollarSign,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

import weaveLogo from "../../assets/Weave Logo.png";

// ------------------------------------------
// Role-label → icon mapping (for the badge)
// ------------------------------------------
const ROLE_ICON_MAP: Record<string, LucideIcon> = {
  Admin: Briefcase,
  PLM: Layers,
  Production: Factory,
  Quality: ClipboardCheck,
  Warehouse: Warehouse,
  Finance: DollarSign,
};

// ------------------------------------------
// Role-label → color mapping (for the badge)
// ------------------------------------------
const ROLE_COLOR_MAP: Record<string, string> = {
  Admin:
    "bg-amber-50 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-800",
  PLM:
    "bg-violet-50 dark:bg-violet-900/30 text-violet-700 dark:text-violet-400 border border-violet-200 dark:border-violet-800",
  Production:
    "bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 border border-blue-200 dark:border-blue-800",
  Quality:
    "bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800",
  Warehouse:
    "bg-cyan-50 dark:bg-cyan-900/30 text-cyan-700 dark:text-cyan-400 border border-cyan-200 dark:border-cyan-800",
  Finance:
    "bg-orange-50 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400 border border-orange-200 dark:border-orange-800",
};

// Default color for branch roles that don't have a specific mapping
const DEFAULT_BRANCH_COLOR =
  "bg-amber-50 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-800";

interface BrandLogoProps {
  className?: string;
  /** Role indicator: "super-admin" or "branch-admin" */
  role?: "super-admin" | "branch-admin";
  /** Branch name — shown when role is "branch-admin" */
  branch?: string;
  /**
   * Custom label for the role badge (e.g. "Admin", "PLM", "Finance").
   * Only used when role is "branch-admin".
   * Defaults to "Admin" if not provided.
   */
  roleLabel?: string;
}

const BrandLogo: React.FC<BrandLogoProps> = ({
  className = "",
  role,
  branch,
  roleLabel,
}) => {
  // Resolve the badge icon for branch roles
  const resolvedLabel = roleLabel || "Admin";
  const BadgeIcon: LucideIcon =
    role === "super-admin"
      ? Shield
      : ROLE_ICON_MAP[resolvedLabel] || Briefcase;

  // Resolve badge color
  const badgeColor =
    role === "super-admin"
      ? "bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800"
      : ROLE_COLOR_MAP[resolvedLabel] || DEFAULT_BRANCH_COLOR;

  return (
    <div className={`flex items-center gap-3 ${className}`}>
      {/* Square Logo — left side */}
      <div className="w-10 h-10 rounded-xl bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center overflow-hidden p-1 shrink-0">
        <img
          src={weaveLogo}
          alt="Weave Logo"
          className="w-full h-full object-contain"
        />
      </div>

      {/* Right side — Company name + Role badge stacked */}
      <div className="flex flex-col min-w-0">
        <span className="text-sm font-bold tracking-tight text-slate-800 dark:text-slate-100 leading-tight">
          WEAVE Co., Ltd.
        </span>

        {/* Role / Branch Indicator */}
        {role && (
          <div
            className={`flex items-center gap-1 mt-1 px-2 py-0.5 rounded-md text-[9px] font-bold uppercase tracking-wider w-fit ${badgeColor}`}
          >
            <BadgeIcon size={9} className="shrink-0" />
            {role === "super-admin" ? (
              <span>Super Admin</span>
            ) : (
              <span>
                {branch ? `${branch} — ` : ""}
                {resolvedLabel}
              </span>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default BrandLogo;
