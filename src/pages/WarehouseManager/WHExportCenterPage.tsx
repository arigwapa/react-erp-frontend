// ==========================================
// WHExportCenterPage.tsx
// Warehouse Manager — Export Center (Branch Only)
// Allows exporting inventory reports in PDF/Excel.
// ==========================================

import React, { useState } from "react";
import WarehouseLayout from "../../layout/WarehouseLayout";
import Toast from "../../components/ui/Toast";
import {
  FileText,
  FileSpreadsheet,
  Package,
  ArrowLeftRight,
  ClipboardEdit,
  DollarSign,
  Clock,
  BarChart3,
  Lock,
} from "lucide-react";

// ------------------------------------------
// Export Items Data
// ------------------------------------------
const exportItems = [
  {
    id: "1",
    title: "Inventory Valuation Report",
    description:
      "Current stock quantities, unit costs, and total valuation for all materials and finished goods.",
    icon: DollarSign,
    iconColor: "text-emerald-600",
    iconBg: "bg-emerald-50 dark:bg-emerald-900/30",
    formats: ["PDF", "Excel"],
  },
  {
    id: "2",
    title: "Stock Movement History",
    description:
      "Complete record of all stock-in, stock-out, transfers, and adjustments with references.",
    icon: ArrowLeftRight,
    iconColor: "text-blue-600",
    iconBg: "bg-blue-50 dark:bg-blue-900/30",
    formats: ["PDF", "Excel"],
  },
  {
    id: "3",
    title: "Low-Stock & Out-of-Stock Report",
    description:
      "Items below minimum threshold, reorder recommendations, and stock alert history.",
    icon: Package,
    iconColor: "text-amber-600",
    iconBg: "bg-amber-50 dark:bg-amber-900/30",
    formats: ["PDF", "Excel"],
  },
  {
    id: "4",
    title: "Adjustment Summary Report",
    description:
      "All stock adjustments with approval statuses, reasons, and audit trail.",
    icon: ClipboardEdit,
    iconColor: "text-violet-600",
    iconBg: "bg-violet-50 dark:bg-violet-900/30",
    formats: ["PDF", "Excel"],
  },
  {
    id: "5",
    title: "Slow-Moving Items Report",
    description:
      "Items with no movement for 30+ days, aging analysis, and recommendations.",
    icon: Clock,
    iconColor: "text-rose-600",
    iconBg: "bg-rose-50 dark:bg-rose-900/30",
    formats: ["PDF", "Excel"],
  },
  {
    id: "6",
    title: "Warehouse KPI Dashboard Export",
    description:
      "Full warehouse KPI snapshot including stock health, movement volumes, and accuracy rates.",
    icon: BarChart3,
    iconColor: "text-indigo-600",
    iconBg: "bg-indigo-50 dark:bg-indigo-900/30",
    formats: ["PDF"],
  },
];

// ==========================================
// Component
// ==========================================
const WHExportCenterPage: React.FC = () => {
  const [toast, setToast] = useState<{
    message: string;
    type: "success" | "error";
  } | null>(null);

  // Default dates
  const [filterDateFrom, setFilterDateFrom] = useState("2026-01-01");
  const [filterDateTo, setFilterDateTo] = useState("2026-02-13");

  const handleExport = (title: string, format: string) => {
    setToast({
      message: `Exporting "${title}" as ${format}…`,
      type: "success",
    });

    // Logic to actually trigger download would go here
    setTimeout(() => setToast(null), 3000); // Auto-hide toast after 3s
  };

  return (
    <WarehouseLayout>
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}

      <div className="max-w-7xl mx-auto space-y-6 pb-20">
        {/* Page Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 dark:text-white tracking-tight">
              Export Center
            </h1>
            <p className="text-xs font-medium text-slate-500 dark:text-slate-400 mt-1">
              Download warehouse reports — Manila Branch only
            </p>
          </div>
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full border border-amber-200 bg-amber-50 text-amber-800 dark:border-amber-700 dark:bg-amber-900/30 dark:text-amber-300 text-xs font-semibold">
            <Lock size={12} />
            Branch: Manila
          </div>
        </div>

        {/* Date Range Settings */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl p-5">
          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-4">
            Export Settings
          </p>
          <div className="flex flex-wrap items-center gap-4">
            {/* FROM DATE INPUT */}
            <div className="flex items-center gap-2">
              <label
                htmlFor="dateFrom"
                className="text-xs font-semibold text-slate-500"
              >
                From:
              </label>
              <input
                id="dateFrom"
                type="date"
                value={filterDateFrom}
                onChange={(e) => setFilterDateFrom(e.target.value)}
                className="px-3 py-2 text-xs border border-slate-200 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
              />
            </div>

            {/* TO DATE INPUT */}
            <div className="flex items-center gap-2">
              <label
                htmlFor="dateTo"
                className="text-xs font-semibold text-slate-500"
              >
                To:
              </label>
              <input
                id="dateTo"
                type="date"
                value={filterDateTo}
                onChange={(e) => setFilterDateTo(e.target.value)}
                className="px-3 py-2 text-xs border border-slate-200 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
              />
            </div>
          </div>
        </div>

        {/* Export Cards Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {exportItems.map((item) => {
            const Icon = item.icon;
            return (
              <div
                key={item.id}
                className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl overflow-hidden shadow-[0_1px_6px_-2px_rgba(0,0,0,0.05)] hover:shadow-[0_4px_16px_-4px_rgba(0,0,0,0.08)] transition-shadow duration-300"
              >
                <div className="px-5 py-4 border-b border-slate-100 dark:border-slate-700 flex items-center gap-3">
                  <div
                    className={`w-8 h-8 rounded-xl ${item.iconBg} flex items-center justify-center`}
                  >
                    <Icon size={16} className={item.iconColor} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                      {item.title}
                    </h3>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                      {item.description}
                    </p>
                  </div>
                </div>
                <div className="p-5 flex items-center gap-3">
                  {item.formats.map((format) => (
                    <button
                      key={format}
                      onClick={() => handleExport(item.title, format)}
                      className="inline-flex items-center gap-2 px-4 py-2.5 text-xs font-semibold border border-slate-200 dark:border-slate-600 rounded-xl bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 hover:border-slate-300 transition-all shadow-sm active:scale-95"
                    >
                      {format === "PDF" ? (
                        <FileText size={14} className="text-rose-500" />
                      ) : (
                        <FileSpreadsheet
                          size={14}
                          className="text-emerald-500"
                        />
                      )}
                      Export {format}
                    </button>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </WarehouseLayout>
  );
};

export default WHExportCenterPage;
