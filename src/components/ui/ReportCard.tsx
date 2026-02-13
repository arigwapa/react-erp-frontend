// ==========================================
// ReportCard.tsx — Reusable Report Summary Card
// Displays a report section with title, icon,
// a data table or summary content, and optional
// export action. Used in the Reports page.
// ==========================================

import React from "react";
import type { LucideIcon } from "lucide-react";
import { Download } from "lucide-react";

// ------------------------------------------
// Props Interface
// ------------------------------------------
interface ReportCardProps {
  /** Report title */
  title: string;
  /** Lucide icon for the header */
  icon: LucideIcon;
  /** Header accent color class */
  iconColor?: string;
  /** Background color for the icon container */
  iconBg?: string;
  /** Report body content */
  children: React.ReactNode;
  /** Optional export callback */
  onExport?: () => void;
  /** Optional export button label */
  exportLabel?: string;
}

// ------------------------------------------
// Component
// ------------------------------------------
const ReportCard: React.FC<ReportCardProps> = ({
  title,
  icon: Icon,
  iconColor = "text-indigo-600",
  iconBg = "bg-indigo-50 dark:bg-indigo-900/30",
  children,
  onExport,
  exportLabel = "Export",
}) => {
  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl overflow-hidden">
      {/* Header */}
      <div className="px-5 py-4 border-b border-slate-100 dark:border-slate-700 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className={`w-8 h-8 rounded-xl ${iconBg} flex items-center justify-center`}>
            <Icon size={16} className={iconColor} />
          </div>
          <h3 className="text-sm font-bold text-slate-900 dark:text-white">{title}</h3>
        </div>
        {onExport && (
          <button
            onClick={onExport}
            className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 px-2.5 py-1.5 rounded-lg transition-colors whitespace-nowrap text-left"
          >
            <Download size={12} />
            {exportLabel}
          </button>
        )}
      </div>

      {/* Body */}
      <div className="p-5">{children}</div>
    </div>
  );
};

export default ReportCard;
