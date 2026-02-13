// ==========================================
// PLMExportCenterPage.tsx
// PLM Manager — Export Center (Branch Only)
// Generate and download PLM reports in PDF/Excel/CSV.
//
// Cards: Product Catalog, BOM Summary, Tech Pack Export,
//   Material Usage, Release Status, Revision History
// Each card: format selector, date range, generate button.
//
// Reusable UI: Card, SecondaryButton, PrimaryButton,
//   PageModal, Toast, IconSelect, StatusBadge
// ==========================================

import { useState, useRef, useEffect } from "react";

// --- Layout ---
import PLMLayout from "../../layout/PLMLayout";

// --- Icons ---
import {
  FileText,
  Download,
  Calendar,
  FileSpreadsheet,
  FileCode,
  CheckCircle,
  Loader2,
  Layers,
  Eye,
  Clock,
  Info,
  ChevronDown,
  Check,
  Lock,
  Package,
  BookOpen,
  GitBranch,
  Rocket,
  History,
} from "lucide-react";

// --- Reusable UI Components ---
import { Card } from "../../components/ui/Card";
import { StatusBadge } from "../../components/ui/StatusBadge";
import SecondaryButton from "../../components/ui/SecondaryButton";
import PrimaryButton from "../../components/ui/PrimaryButton";
import PageModal from "../../components/ui/PageModal";
import Toast from "../../components/ui/Toast";
import IconSelect from "../../components/ui/IconSelect";

// ==========================================
// TYPES
// ==========================================

type ExportFormat = "PDF" | "Excel" | "CSV";

interface ReportDefinition {
  id: string;
  title: string;
  description: string;
  icon: React.ElementType;
  lastExported: string | null;
}

// ==========================================
// CONSTANTS
// ==========================================

const FORMAT_OPTIONS = [
  { value: "PDF", label: "PDF", icon: FileText },
  { value: "Excel", label: "Excel", icon: FileSpreadsheet },
  { value: "CSV", label: "CSV", icon: FileCode },
];

const DATE_RANGE_OPTIONS = [
  { value: "last-7", label: "Last 7 days" },
  { value: "last-30", label: "Last 30 days" },
  { value: "last-90", label: "Last 90 days" },
  { value: "ytd", label: "Year to Date" },
];

/** PLM-specific exportable reports */
const ALL_REPORTS: ReportDefinition[] = [
  {
    id: "product-catalog",
    title: "Product Catalog Report",
    description:
      "Complete listing of all products, styles, and SKUs with status, categories, and seasonal data.",
    icon: Layers,
    lastExported: "Feb 10, 2026 · 02:15 PM",
  },
  {
    id: "bom-summary",
    title: "BOM Summary Report",
    description:
      "Bill of Materials for all products including component breakdown, quantities, and cost estimates.",
    icon: Package,
    lastExported: "Feb 11, 2026 · 09:30 AM",
  },
  {
    id: "tech-pack",
    title: "Tech Pack Export",
    description:
      "Tech pack details with versions, approval status, specifications, and construction notes.",
    icon: BookOpen,
    lastExported: "Feb 12, 2026 · 11:45 AM",
  },
  {
    id: "material-usage",
    title: "Material Usage Report",
    description:
      "Material consumption data, stock allocation per product, and supplier information.",
    icon: GitBranch,
    lastExported: "Feb 9, 2026 · 04:20 PM",
  },
  {
    id: "release-status",
    title: "Release Status Report",
    description:
      "Products released to production with approval timeline, release dates, and readiness status.",
    icon: Rocket,
    lastExported: null,
  },
  {
    id: "revision-history",
    title: "Revision History Report",
    description:
      "Complete revision log of product changes, BOM updates, and tech pack modifications.",
    icon: History,
    lastExported: "Feb 8, 2026 · 10:00 AM",
  },
];

// ==========================================
// HELPERS
// ==========================================

const getIconBg = (id: string) => {
  switch (id) {
    case "product-catalog":
      return "bg-indigo-50 text-indigo-500";
    case "bom-summary":
      return "bg-blue-50 text-blue-500";
    case "tech-pack":
      return "bg-purple-50 text-purple-500";
    case "material-usage":
      return "bg-emerald-50 text-emerald-500";
    case "release-status":
      return "bg-amber-50 text-amber-500";
    case "revision-history":
      return "bg-rose-50 text-rose-500";
    default:
      return "bg-slate-50 text-slate-500";
  }
};

// ==========================================
// MAIN COMPONENT
// ==========================================

function PLMExportCenterPage() {
  // --- Per-card state ---
  const [formats, setFormats] = useState<Record<string, ExportFormat>>(
    Object.fromEntries(ALL_REPORTS.map((r) => [r.id, "PDF"])) as Record<
      string,
      ExportFormat
    >,
  );
  const [dateRanges, setDateRanges] = useState<Record<string, string>>(
    Object.fromEntries(ALL_REPORTS.map((r) => [r.id, "last-30"])) as Record<
      string,
      string
    >,
  );

  // --- Date dropdown ---
  const [openDateDropdown, setOpenDateDropdown] = useState<string | null>(null);
  const dateDropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dateDropdownRef.current &&
        !dateDropdownRef.current.contains(event.target as Node)
      )
        setOpenDateDropdown(null);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // --- Loading ---
  const [loadingReportId, setLoadingReportId] = useState<string | null>(null);

  // --- Preview modal ---
  const [previewReport, setPreviewReport] = useState<{
    report: ReportDefinition;
    format: ExportFormat;
    dateRange: string;
  } | null>(null);

  // --- Toast ---
  const [toast, setToast] = useState<{
    message: string;
    type: "success" | "error";
  } | null>(null);

  // --- Handlers ---
  const handleGenerate = (report: ReportDefinition) => {
    setLoadingReportId(report.id);
    const format = formats[report.id] ?? "PDF";
    const dateRange = dateRanges[report.id] ?? "last-30";
    setTimeout(() => {
      setLoadingReportId(null);
      setPreviewReport({ report, format, dateRange });
      setToast({
        message: `${report.title} generated successfully. Preview ready.`,
        type: "success",
      });
    }, 1500);
  };

  const handleDownload = () => {
    if (!previewReport) return;
    setToast({
      message: `Downloading ${previewReport.report.title} as ${previewReport.format}...`,
      type: "success",
    });
    setPreviewReport(null);
  };

  const getDateLabel = (value: string) =>
    DATE_RANGE_OPTIONS.find((o) => o.value === value)?.label ?? value;

  return (
    <>
      <PLMLayout>
        <div className="max-w-7xl mx-auto space-y-6 pb-20">
          {/* ---- PAGE HEADER ---- */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <h1 className="text-3xl font-bold text-slate-900 dark:text-white tracking-tight">
                Export Center
              </h1>
              <p className="text-xs font-medium text-slate-500 dark:text-slate-400 mt-1">
                Generate and download PLM reports — Manila Branch only
              </p>
            </div>
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full border border-amber-200 bg-amber-50 text-amber-800 dark:border-amber-700 dark:bg-amber-900/30 dark:text-amber-300 text-xs font-semibold">
              <Lock size={12} />
              Branch: Manila
            </div>
          </div>

          {/* ---- EXPORT CARDS GRID ---- */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {ALL_REPORTS.map((report) => {
              const Icon = report.icon;
              const isLoading = loadingReportId === report.id;
              const format = formats[report.id] ?? "PDF";
              const dateRange = dateRanges[report.id] ?? "last-30";

              return (
                <Card
                  key={report.id}
                  className="flex flex-col overflow-hidden hover:shadow-md transition-shadow duration-200"
                >
                  <div className="p-5 flex flex-col h-full space-y-4">
                    {/* Header */}
                    <div className="flex items-start gap-3">
                      <div
                        className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${getIconBg(report.id)}`}
                      >
                        <Icon size={20} />
                      </div>
                      <div className="min-w-0">
                        <h3 className="text-sm font-bold text-slate-900 dark:text-white leading-tight">
                          {report.title}
                        </h3>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 leading-relaxed line-clamp-2">
                          {report.description}
                        </p>
                      </div>
                    </div>

                    {/* Format selector */}
                    <div>
                      <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                        Format
                      </label>
                      <IconSelect
                        value={format}
                        onChange={(val) =>
                          setFormats({
                            ...formats,
                            [report.id]: val as ExportFormat,
                          })
                        }
                        options={FORMAT_OPTIONS}
                        placeholder="Select format"
                      />
                    </div>

                    {/* Date range selector */}
                    <div>
                      <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                        Date Range
                      </label>
                      <div
                        className="relative"
                        ref={
                          openDateDropdown === report.id
                            ? dateDropdownRef
                            : undefined
                        }
                      >
                        <button
                          type="button"
                          onClick={() =>
                            setOpenDateDropdown(
                              openDateDropdown === report.id ? null : report.id,
                            )
                          }
                          className={`w-full flex items-center justify-between pl-9 pr-4 py-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-600 rounded-xl transition-all outline-none text-xs font-medium cursor-pointer ${openDateDropdown === report.id ? "ring-2 ring-slate-300 border-slate-300 shadow-sm" : "hover:bg-slate-50 dark:hover:bg-slate-700"} text-slate-700 dark:text-slate-300`}
                        >
                          <Calendar
                            className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
                            size={14}
                          />
                          <span className="truncate">
                            {getDateLabel(dateRange)}
                          </span>
                          <ChevronDown
                            size={14}
                            className={`text-slate-400 transition-transform duration-200 shrink-0 ${openDateDropdown === report.id ? "rotate-180" : ""}`}
                          />
                        </button>
                        {openDateDropdown === report.id && (
                          <ul
                            role="listbox"
                            className="absolute z-50 mt-1.5 w-full bg-white dark:bg-slate-800 rounded-xl border border-slate-100 dark:border-slate-600 shadow-xl overflow-hidden"
                          >
                            <div className="p-1.5">
                              {DATE_RANGE_OPTIONS.map((opt) => (
                                <li key={opt.value} role="none">
                                  <button
                                    type="button"
                                    role="option"
                                    aria-selected={dateRange === opt.value}
                                    onClick={() => {
                                      setDateRanges({
                                        ...dateRanges,
                                        [report.id]: opt.value,
                                      });
                                      setOpenDateDropdown(null);
                                    }}
                                    className={`w-full text-left px-3 py-2 rounded-lg text-xs font-semibold transition-colors flex items-center justify-between ${dateRange === opt.value ? "bg-slate-100 dark:bg-slate-700 text-slate-900 dark:text-white" : "text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700 hover:text-slate-900 dark:hover:text-white"}`}
                                  >
                                    {opt.label}
                                    {dateRange === opt.value && (
                                      <Check
                                        size={13}
                                        className="text-emerald-500"
                                        strokeWidth={3}
                                      />
                                    )}
                                  </button>
                                </li>
                              ))}
                            </div>
                          </ul>
                        )}
                      </div>
                    </div>

                    {/* Action button */}
                    <div className="mt-auto pt-1">
                      <PrimaryButton
                        onClick={() => handleGenerate(report)}
                        disabled={isLoading}
                        className="!w-full !py-2.5 !text-xs !rounded-xl"
                      >
                        {isLoading ? (
                          <>
                            <Loader2 size={14} className="animate-spin" />{" "}
                            Generating...
                          </>
                        ) : (
                          <>
                            <Download size={14} /> Generate Export
                          </>
                        )}
                      </PrimaryButton>
                    </div>

                    {/* Last exported */}
                    <div className="flex items-center gap-2 pt-2 border-t border-slate-100 dark:border-slate-700">
                      {report.lastExported ? (
                        <>
                          <Clock
                            size={11}
                            className="text-slate-400 shrink-0"
                          />
                          <span className="text-[10px] text-slate-400 font-medium">
                            Last exported: {report.lastExported}
                          </span>
                        </>
                      ) : (
                        <>
                          <Info size={11} className="text-slate-400 shrink-0" />
                          <span className="text-[10px] text-slate-400 font-medium">
                            Not yet exported
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>

          {/* ---- BRANCH NOTICE ---- */}
          <div className="p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl flex items-start gap-3">
            <Calendar size={16} className="text-blue-500 mt-0.5 shrink-0" />
            <div>
              <p className="text-xs font-bold text-blue-700 dark:text-blue-400">
                Branch-Scoped Exports
              </p>
              <p className="text-[11px] text-blue-600 dark:text-blue-400 mt-0.5">
                All data exports are limited to Manila branch. Cross-branch
                consolidation is available through Super Admin.
              </p>
            </div>
          </div>
        </div>
      </PLMLayout>

      {/* ==================================================================
          EXPORT PREVIEW MODAL
          ================================================================== */}
      <PageModal
        isOpen={!!previewReport}
        onClose={() => setPreviewReport(null)}
        title="Export Preview"
        subtitle={
          previewReport
            ? `${previewReport.report.title} · ${previewReport.format} · ${getDateLabel(previewReport.dateRange)}`
            : undefined
        }
        badges={previewReport ? <StatusBadge status="Ready" /> : undefined}
        maxWidth="max-w-lg"
        footer={
          <div className="flex justify-between items-center w-full">
            <SecondaryButton onClick={() => setPreviewReport(null)}>
              Cancel
            </SecondaryButton>
            <PrimaryButton
              onClick={handleDownload}
              className="!w-auto !py-2.5 !px-5 !text-xs !rounded-full"
            >
              <Download size={14} /> Download Export
            </PrimaryButton>
          </div>
        }
      >
        {previewReport && (
          <div className="space-y-6">
            {/* Ready notice */}
            <div className="flex items-start gap-3 p-4 bg-emerald-50 rounded-xl border border-emerald-200">
              <div className="p-2 bg-emerald-100 rounded-lg shrink-0">
                <CheckCircle size={18} className="text-emerald-600" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-emerald-900">
                  Export ready for download
                </h4>
                <p className="text-[11px] text-emerald-700 mt-1">
                  Branch data only — no system-wide records. The file includes
                  records for the selected date range.
                </p>
              </div>
            </div>
            {/* Export details */}
            <div>
              <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2 mb-3">
                <Info size={13} className="text-slate-400" /> Export Details
              </h4>
              <div className="grid grid-cols-2 gap-4 border-t border-slate-100 pt-4">
                <div className="space-y-1">
                  <span className="flex items-center gap-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                    <FileText size={10} /> Report
                  </span>
                  <span className="text-sm font-semibold text-slate-700">
                    {previewReport.report.title}
                  </span>
                </div>
                <div className="space-y-1">
                  <span className="flex items-center gap-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                    <FileSpreadsheet size={10} /> Format
                  </span>
                  <span className="text-sm font-semibold text-slate-700">
                    {previewReport.format}
                  </span>
                </div>
                <div className="space-y-1">
                  <span className="flex items-center gap-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                    <Calendar size={10} /> Date Range
                  </span>
                  <span className="text-sm font-semibold text-slate-700">
                    {getDateLabel(previewReport.dateRange)}
                  </span>
                </div>
                <div className="space-y-1">
                  <span className="flex items-center gap-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                    <Eye size={10} /> Scope
                  </span>
                  <span className="text-sm font-semibold text-slate-700">
                    Current branch only
                  </span>
                </div>
              </div>
            </div>
            {/* Branch notice */}
            <div className="flex items-center gap-2 px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl">
              <Lock size={14} className="text-slate-400" />
              <span className="text-xs font-semibold text-slate-500">
                Branch: Manila (Fixed) — Cannot export system-wide data.
              </span>
            </div>
          </div>
        )}
      </PageModal>

      {/* ---- TOAST ---- */}
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </>
  );
}

export default PLMExportCenterPage;
