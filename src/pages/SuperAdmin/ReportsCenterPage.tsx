// ==========================================
// ReportsCenterPage.tsx — Reports Center
// Executive intelligence hub for consolidated
// analytics, performance metrics, and compliance
// summaries across all ERP modules.
// ==========================================

import { useState, useMemo, useRef, useEffect } from "react";
import {
  BarChart3,
  Calendar,
  Download,
  Layers,
  Factory,
  ShieldCheck,
  Package,
  DollarSign,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  Activity,
  FileText,
  Eye,
  GitBranch,
  Clock,
  Info,
  Database,
  ChevronDown,
  Check,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

// ------------------------------------------
// Layout & Reusable UI Components
// ------------------------------------------
import MainLayout from "../../layout/MainLayout";
import { Card } from "../../components/ui/Card";
import TabBar from "../../components/ui/TabBar";
import SecondaryButton from "../../components/ui/SecondaryButton";
import PageModal from "../../components/ui/PageModal";
import Toast from "../../components/ui/Toast";

// ==========================================
// Types
// ==========================================
type ModuleFilter =
  | "All"
  | "PLM"
  | "Production"
  | "Quality"
  | "Warehouse"
  | "Finance";

type DateRange =
  | "Today"
  | "7 Days"
  | "30 Days"
  | "This Quarter"
  | "Year to Date";

interface ReportMetric {
  id: string;
  title: string;
  value: string;
  trend: "up" | "down" | "neutral";
  trendValue: string;
  category: ModuleFilter;
  description: string;
  chartType: "bar" | "line" | "pie";
  detailedInsights?: string[];
  lastUpdated?: string;
}

// ==========================================
// Mock Data
// ==========================================
const REPORTS_DATA: ReportMetric[] = [
  {
    id: "PLM-01",
    title: "Product Readiness",
    value: "82%",
    trend: "up",
    trendValue: "+5% vs last month",
    category: "PLM",
    description: "Percentage of products with approved BOMs & Tech Packs.",
    chartType: "pie",
    detailedInsights: [
      "43 of 52 products have full BOM approval",
      "Tech Pack completion rate increased from 77% to 82%",
      "3 products blocked by pending QA checklists",
      "Seasonal collection FW2026 at 90% readiness",
    ],
    lastUpdated: "Feb 12, 2026",
  },
  {
    id: "PLM-02",
    title: "Missing BOMs",
    value: "14",
    trend: "down",
    trendValue: "-3 pending",
    category: "PLM",
    description: "Active styles missing Bill of Materials.",
    chartType: "bar",
    detailedInsights: [
      "8 drafts pending designer uploads",
      "4 awaiting supplier material confirmation",
      "2 blocked by costing team review",
      "Average resolution time: 4.2 days",
    ],
    lastUpdated: "Feb 12, 2026",
  },
  {
    id: "PROD-01",
    title: "WO Completion Rate",
    value: "94.5%",
    trend: "up",
    trendValue: "+1.2%",
    category: "Production",
    description: "Work orders completed on time vs scheduled.",
    chartType: "line",
    detailedInsights: [
      "67 of 71 work orders completed on schedule",
      "Average cycle time improved by 0.8 days",
      "Manila Main leading at 97% completion",
      "Cebu Factory at 91% — 2 delayed orders",
    ],
    lastUpdated: "Feb 11, 2026",
  },
  {
    id: "PROD-02",
    title: "Delayed Production",
    value: "8 Runs",
    trend: "down",
    trendValue: "+2 delays",
    category: "Production",
    description: "Active production lines behind schedule.",
    chartType: "bar",
    detailedInsights: [
      "3 delays caused by material shortages",
      "2 delays due to machine maintenance",
      "2 delays from quality hold (re-inspection)",
      "1 delay pending admin approval override",
    ],
    lastUpdated: "Feb 12, 2026",
  },
  {
    id: "QA-01",
    title: "Approval Rate",
    value: "88%",
    trend: "neutral",
    trendValue: "Stable",
    category: "Quality",
    description: "First-pass yield across all inspection points.",
    chartType: "line",
    detailedInsights: [
      "First-pass yield stable at 88% for 3 consecutive periods",
      "Stitching defects account for 42% of rejections",
      "Cebu Factory improved from 84% to 89%",
      "4 inspectors above 95% individual pass rate",
    ],
    lastUpdated: "Feb 12, 2026",
  },
  {
    id: "QA-02",
    title: "High Risk Defects",
    value: "3 Critical",
    trend: "down",
    trendValue: "Requires CAPA",
    category: "Quality",
    description: "Critical defects flagged in finished goods.",
    chartType: "bar",
    detailedInsights: [
      "1 zipper malfunction on Cargo Utility Pants batch",
      "1 button integrity failure on Denim Jackets",
      "1 color bleeding issue on Silk Scarf line",
      "All 3 have active CAPA mandates in progress",
    ],
    lastUpdated: "Feb 11, 2026",
  },
  {
    id: "WH-01",
    title: "Inventory Valuation",
    value: "$1.2M",
    trend: "up",
    trendValue: "+$50k",
    category: "Warehouse",
    description: "Total value of raw materials + finished goods.",
    chartType: "line",
    detailedInsights: [
      "Raw materials: $720K (60% of total)",
      "Finished goods: $480K (40% of total)",
      "Manila Main holds 45% of total inventory value",
      "Top SKU by value: Denim Fabric Roll at $112K",
    ],
    lastUpdated: "Feb 12, 2026",
  },
  {
    id: "WH-02",
    title: "Low Stock Alerts",
    value: "22 Items",
    trend: "down",
    trendValue: "+5 items",
    category: "Warehouse",
    description: "SKUs below safety stock levels.",
    chartType: "bar",
    detailedInsights: [
      "12 raw materials below 50% safety threshold",
      "6 finished goods at critical reorder level",
      "4 items with negative stock anomalies",
      "Replenishment orders placed for 15 of 22 items",
    ],
    lastUpdated: "Feb 12, 2026",
  },
  {
    id: "FIN-01",
    title: "Budget vs Actual",
    value: "96%",
    trend: "up",
    trendValue: "4% Under Budget",
    category: "Finance",
    description: "Overall spending utilization for current period.",
    chartType: "pie",
    detailedInsights: [
      "Total budget: $185,000 — Spent: $177,600",
      "Materials spending 2% under forecast",
      "Labor costs tracking exactly to plan",
      "Overhead reduced by 8% through process optimization",
    ],
    lastUpdated: "Feb 10, 2026",
  },
  {
    id: "FIN-02",
    title: "QA Impact Cost",
    value: "$12,450",
    trend: "down",
    trendValue: "+$2k Waste",
    category: "Finance",
    description: "Financial loss due to re-work and scrap.",
    chartType: "bar",
    detailedInsights: [
      "Re-work costs: $7,200 (58% of total waste)",
      "Scrap material: $3,800 (30%)",
      "Expedited shipping from delays: $1,450 (12%)",
      "Quality improvement target: reduce to <$8K next period",
    ],
    lastUpdated: "Feb 11, 2026",
  },
];

// ------------------------------------------
// Tab configuration
// ------------------------------------------
const MODULE_TABS = [
  { id: "All", label: "All Modules", icon: BarChart3, count: REPORTS_DATA.length },
  { id: "PLM", label: "PLM", icon: Layers, count: REPORTS_DATA.filter((r) => r.category === "PLM").length },
  { id: "Production", label: "Production", icon: Factory, count: REPORTS_DATA.filter((r) => r.category === "Production").length },
  { id: "Quality", label: "Quality", icon: ShieldCheck, count: REPORTS_DATA.filter((r) => r.category === "Quality").length },
  { id: "Warehouse", label: "Warehouse", icon: Package, count: REPORTS_DATA.filter((r) => r.category === "Warehouse").length },
  { id: "Finance", label: "Finance", icon: DollarSign, count: REPORTS_DATA.filter((r) => r.category === "Finance").length },
];

// ------------------------------------------
// Helper: Category theme (icon + colors)
// ------------------------------------------
const getCategoryTheme = (cat: ModuleFilter) => {
  switch (cat) {
    case "PLM":
      return { color: "text-purple-600", bg: "bg-purple-50", icon: Layers };
    case "Production":
      return { color: "text-blue-600", bg: "bg-blue-50", icon: Factory };
    case "Quality":
      return { color: "text-rose-600", bg: "bg-rose-50", icon: ShieldCheck };
    case "Warehouse":
      return { color: "text-amber-600", bg: "bg-amber-50", icon: Package };
    case "Finance":
      return { color: "text-emerald-600", bg: "bg-emerald-50", icon: DollarSign };
    default:
      return { color: "text-slate-600", bg: "bg-slate-50", icon: FileText };
  }
};

// ------------------------------------------
// Custom Dropdown Component
// Modern styled dropdown with round corners
// ------------------------------------------
interface DropdownOption {
  label: string;
  value: string;
}

const CustomDropdown = ({
  options,
  value,
  onChange,
  icon: Icon,
  ariaLabel,
}: {
  options: DropdownOption[];
  value: string;
  onChange: (val: string) => void;
  icon: LucideIcon;
  ariaLabel: string;
}) => {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  // Close on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const selected = options.find((o) => o.value === value);

  return (
    <div ref={ref} className="relative">
      {/* Trigger Button */}
      <button
        type="button"
        onClick={() => setOpen((p) => !p)}
        className={`
          flex items-center gap-2 pl-3 pr-2.5 py-2 
          bg-white border rounded-full text-xs font-semibold
          transition-all duration-200 cursor-pointer
          ${
            open
              ? "border-slate-300 ring-2 ring-slate-200 shadow-sm"
              : "border-slate-200 hover:border-slate-300 hover:shadow-sm"
          }
        `}
        aria-label={ariaLabel}
        aria-expanded={open}
        aria-haspopup="listbox"
      >
        <Icon size={13} className="text-slate-400 flex-shrink-0" />
        <span className="text-slate-700 whitespace-nowrap">
          {selected?.label || value}
        </span>
        <ChevronDown
          size={13}
          className={`text-slate-400 transition-transform duration-200 ${
            open ? "rotate-180" : ""
          }`}
        />
      </button>

      {/* Dropdown Panel */}
      {open && (
        <div
          className="absolute right-0 top-full mt-1.5 z-50 min-w-[180px] bg-white border border-slate-200 rounded-2xl shadow-xl overflow-hidden animate-in fade-in slide-in-from-top-1 duration-150"
          role="listbox"
          aria-label={ariaLabel}
        >
          <div className="py-1.5">
            {options.map((opt) => {
              const isSelected = opt.value === value;
              return (
                <button
                  key={opt.value}
                  type="button"
                  role="option"
                  aria-selected={isSelected}
                  onClick={() => {
                    onChange(opt.value);
                    setOpen(false);
                  }}
                  className={`
                    w-full flex items-center justify-between gap-3 px-4 py-2.5 text-xs font-medium
                    transition-colors duration-100
                    ${
                      isSelected
                        ? "bg-slate-50 text-slate-900 font-semibold"
                        : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                    }
                  `}
                >
                  <span>{opt.label}</span>
                  {isSelected && (
                    <Check size={13} className="text-indigo-500 flex-shrink-0" />
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

// ------------------------------------------
// Helper: Mini chart visualizations
// ------------------------------------------
const MiniChart = ({
  type,
  colorClass,
}: {
  type: "bar" | "line" | "pie";
  colorClass: string;
}) => {
  if (type === "bar") {
    return (
      <div className="flex items-end gap-0.5 h-7 w-14" aria-hidden="true">
        <div className={`w-2 rounded-t ${colorClass} opacity-30`} style={{ height: "35%" }} />
        <div className={`w-2 rounded-t ${colorClass} opacity-50`} style={{ height: "65%" }} />
        <div className={`w-2 rounded-t ${colorClass} opacity-70`} style={{ height: "45%" }} />
        <div className={`w-2 rounded-t ${colorClass} opacity-90`} style={{ height: "85%" }} />
      </div>
    );
  }
  if (type === "line") {
    return (
      <svg width="56" height="28" viewBox="0 0 56 28" className={colorClass} fill="none" aria-hidden="true">
        <path d="M2 24L16 14L28 19L54 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    );
  }
  return (
    <div
      className={`h-7 w-7 rounded-full border-[3px] border-current ${colorClass} opacity-50`}
      style={{ borderRightColor: "transparent" }}
      aria-hidden="true"
    />
  );
};

// ==========================================
// Main Component
// ==========================================
function ReportsCenter() {
  // ------------------------------------------
  // State
  // ------------------------------------------
  const [activeModule, setActiveModule] = useState<string>("All");
  const [dateRange, setDateRange] = useState<DateRange>("30 Days");
  const [selectedBranch, setSelectedBranch] = useState("All Branches");
  const [selectedReport, setSelectedReport] = useState<ReportMetric | null>(null);

  const [toast, setToast] = useState<{
    message: string;
    type: "success" | "error";
  } | null>(null);

  // ------------------------------------------
  // Computed: Filtered reports
  // ------------------------------------------
  const filteredReports = useMemo(() => {
    if (activeModule === "All") return REPORTS_DATA;
    return REPORTS_DATA.filter((r) => r.category === activeModule);
  }, [activeModule]);

  // ------------------------------------------
  // Handlers
  // ------------------------------------------
  const handleExport = () => {
    setToast({
      message: `Exporting ${activeModule === "All" ? "All Modules" : activeModule} Report for ${dateRange}...`,
      type: "success",
    });
  };

  // ==========================================
  // RENDER
  // ==========================================
  return (
    <>
      <MainLayout>
        <div className="max-w-7xl mx-auto space-y-6 pb-20">
          {/* ==========================================
              SECTION 1: PAGE HEADER
              Title (no icon) + Subtitle + Export Button
              ========================================== */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <h1 className="text-3xl font-bold text-slate-900 tracking-tight">
                Reports Center
              </h1>
              <p className="text-xs font-medium text-slate-500 mt-1">
                Executive intelligence hub — consolidated analytics,
                performance metrics, and compliance summaries.
              </p>
            </div>
            <SecondaryButton
              onClick={handleExport}
              icon={Download}
              ariaLabel="Export Summary"
            >
              Export Summary
            </SecondaryButton>
          </div>

          {/* ==========================================
              SECTION 2: TAB BAR
              Uses TabBar for module switching
              ========================================== */}
          <TabBar
            tabs={MODULE_TABS}
            activeTab={activeModule}
            onTabChange={setActiveModule}
          />

          {/* ==========================================
              SECTION 3: GLOBAL FILTERS
              Branch + Date Range dropdowns
              ========================================== */}
          <Card className="!p-0">
            <div className="px-5 py-3.5 flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="flex items-center gap-2 text-[11px] text-slate-400 font-bold uppercase tracking-wider">
                <BarChart3 size={13} />
                Showing {filteredReports.length} metric{filteredReports.length !== 1 ? "s" : ""}
                {activeModule !== "All" && (
                  <span className="text-slate-600 normal-case font-semibold">
                    — {activeModule}
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2">
                {/* Branch Dropdown */}
                <CustomDropdown
                  icon={GitBranch}
                  value={selectedBranch}
                  onChange={setSelectedBranch}
                  ariaLabel="Select Branch"
                  options={[
                    { label: "All Branches", value: "All Branches" },
                    { label: "Manila Main", value: "Manila Main" },
                    { label: "Cebu Factory", value: "Cebu Factory" },
                    { label: "Davao Hub", value: "Davao Hub" },
                  ]}
                />

                {/* Date Range Dropdown */}
                <CustomDropdown
                  icon={Calendar}
                  value={dateRange}
                  onChange={(val) => setDateRange(val as DateRange)}
                  ariaLabel="Select Date Range"
                  options={[
                    { label: "Today", value: "Today" },
                    { label: "7 Days", value: "7 Days" },
                    { label: "30 Days", value: "30 Days" },
                    { label: "This Quarter", value: "This Quarter" },
                    { label: "Year to Date", value: "Year to Date" },
                  ]}
                />
              </div>
            </div>
          </Card>

          {/* ==========================================
              SECTION 4: REPORT CARDS GRID
              ========================================== */}
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {filteredReports.map((report) => {
              const theme = getCategoryTheme(report.category as ModuleFilter);
              const Icon = theme.icon;

              return (
                <Card
                  key={report.id}
                  className="flex flex-col overflow-hidden hover:shadow-md transition-shadow duration-200"
                >
                  <div className="p-5 flex flex-col h-full">
                    {/* Card Header: Icon + Category + Alert */}
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${theme.bg} ${theme.color}`}
                        >
                          <Icon size={20} />
                        </div>
                        <div>
                          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                            {report.category}
                          </span>
                          <h3 className="text-sm font-bold text-slate-900 leading-tight">
                            {report.title}
                          </h3>
                        </div>
                      </div>
                      {/* Alert for critical quality trends */}
                      {report.category === "Quality" &&
                        report.trend === "down" && (
                          <div className="p-1.5 bg-rose-50 rounded-lg animate-pulse">
                            <AlertTriangle size={14} className="text-rose-500" />
                          </div>
                        )}
                    </div>

                    {/* Description */}
                    <p className="text-[11px] text-slate-500 leading-relaxed mb-4 line-clamp-2">
                      {report.description}
                    </p>

                    {/* Metric Value + Trend + Mini Chart */}
                    <div className="flex items-end justify-between mb-4">
                      <div>
                        <div className="text-2xl font-extrabold text-slate-900 tracking-tight">
                          {report.value}
                        </div>
                        <div
                          className={`flex items-center gap-1 text-[11px] font-bold mt-0.5 ${
                            report.trend === "up"
                              ? "text-emerald-600"
                              : report.trend === "down"
                                ? "text-rose-600"
                                : "text-slate-500"
                          }`}
                        >
                          {report.trend === "up" ? (
                            <TrendingUp size={11} />
                          ) : report.trend === "down" ? (
                            <TrendingDown size={11} />
                          ) : (
                            <Activity size={11} />
                          )}
                          {report.trendValue}
                        </div>
                      </div>
                      <MiniChart type={report.chartType} colorClass={theme.color} />
                    </div>

                    {/* ID + Last Updated */}
                    <div className="flex items-center gap-3 text-[10px] text-slate-400 mb-3">
                      <span className="font-mono">{report.id}</span>
                      {report.lastUpdated && (
                        <span className="flex items-center gap-1">
                          <Clock size={9} />
                          {report.lastUpdated}
                        </span>
                      )}
                    </div>

                    {/* Action Button */}
                    <div className="mt-auto pt-3 border-t border-slate-100">
                      <button
                        onClick={() => setSelectedReport(report)}
                        className="w-full inline-flex items-center justify-center gap-1.5 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 px-3 py-2 rounded-xl text-[11px] font-semibold transition-colors"
                        aria-label={`View details for ${report.title}`}
                      >
                        <Eye size={13} />
                        View Details
                      </button>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>

          {/* Empty State */}
          {filteredReports.length === 0 && (
            <Card className="!py-16">
              <div className="flex flex-col items-center gap-2 text-center">
                <BarChart3 size={32} className="text-slate-300" />
                <p className="text-sm font-medium text-slate-500">
                  No reports found
                </p>
                <p className="text-xs text-slate-400">
                  Try adjusting your module filter.
                </p>
              </div>
            </Card>
          )}
        </div>
      </MainLayout>

      {/* ==========================================
          MODALS — Rendered OUTSIDE MainLayout
          ========================================== */}

      {/* ---- VIEW DETAILS MODAL ---- */}
      {selectedReport && (() => {
        const theme = getCategoryTheme(selectedReport.category as ModuleFilter);
        const Icon = theme.icon;

        return (
          <PageModal
            isOpen
            onClose={() => setSelectedReport(null)}
            title={selectedReport.title}
            badges={
              <span
                className={`inline-flex items-center gap-1 whitespace-nowrap text-left.5 text-[10px] font-bold px-2.5 py-1 rounded-full ${theme.bg} ${theme.color}`}
              >
                <Icon size={11} />
                {selectedReport.category}
              </span>
            }
            subtitle={
              <>
                {selectedReport.id} &bull; {selectedBranch} &bull; {dateRange}
              </>
            }
            maxWidth="max-w-lg"
            ariaId="report-details-modal"
          >
            {/* A. Description */}
            <div>
              <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2 mb-2">
                <Info size={13} className="text-slate-400" />
                Overview
              </h4>
              <p className="text-sm text-slate-600 leading-relaxed">
                {selectedReport.description}
              </p>
            </div>

            {/* B. Key Metric — prominent display */}
            <div className="bg-slate-50 rounded-xl p-4 border border-slate-100">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                    Current Value
                  </span>
                  <p className="text-3xl font-extrabold text-slate-900 mt-1">
                    {selectedReport.value}
                  </p>
                  <div
                    className={`flex items-center gap-1 text-xs font-bold mt-1 ${
                      selectedReport.trend === "up"
                        ? "text-emerald-600"
                        : selectedReport.trend === "down"
                          ? "text-rose-600"
                          : "text-slate-500"
                    }`}
                  >
                    {selectedReport.trend === "up" ? (
                      <TrendingUp size={12} />
                    ) : selectedReport.trend === "down" ? (
                      <TrendingDown size={12} />
                    ) : (
                      <Activity size={12} />
                    )}
                    {selectedReport.trendValue}
                  </div>
                </div>
                <div className={`p-3 rounded-xl ${theme.bg}`}>
                  <MiniChart type={selectedReport.chartType} colorClass={theme.color} />
                </div>
              </div>
            </div>

            {/* C. Detailed Insights */}
            {selectedReport.detailedInsights &&
              selectedReport.detailedInsights.length > 0 && (
                <div>
                  <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2 mb-3">
                    <Database size={13} className="text-slate-400" />
                    Key Insights
                  </h4>
                  <div className="space-y-2">
                    {selectedReport.detailedInsights.map((insight, idx) => (
                      <div
                        key={idx}
                        className="flex items-start gap-2.5 bg-white border border-slate-100 rounded-xl px-3.5 py-2.5"
                      >
                        <div className="w-5 h-5 rounded-full bg-slate-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                          <span className="text-[9px] font-bold text-slate-500">
                            {idx + 1}
                          </span>
                        </div>
                        <p className="text-xs text-slate-600 leading-relaxed">
                          {insight}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

            {/* D. Metadata */}
            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 bg-white border border-slate-200 rounded-xl">
                <span className="flex items-center gap-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  <Clock size={10} /> Last Updated
                </span>
                <p className="text-sm font-semibold text-slate-700 mt-1.5">
                  {selectedReport.lastUpdated || "N/A"}
                </p>
              </div>
              <div className="p-3 bg-white border border-slate-200 rounded-xl">
                <span className="flex items-center gap-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  <GitBranch size={10} /> Branch
                </span>
                <p className="text-sm font-semibold text-slate-700 mt-1.5">
                  {selectedBranch}
                </p>
              </div>
              <div className="p-3 bg-white border border-slate-200 rounded-xl">
                <span className="flex items-center gap-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  <Calendar size={10} /> Date Range
                </span>
                <p className="text-sm font-semibold text-slate-700 mt-1.5">
                  {dateRange}
                </p>
              </div>
              <div className="p-3 bg-white border border-slate-200 rounded-xl">
                <span className="flex items-center gap-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  <BarChart3 size={10} /> Chart Type
                </span>
                <p className="text-sm font-semibold text-slate-700 mt-1.5 capitalize">
                  {selectedReport.chartType}
                </p>
              </div>
            </div>

            {/* E. Warning for critical trends */}
            {selectedReport.trend === "down" && (
              <div className="flex items-start gap-2.5 text-xs text-amber-700 bg-amber-50 border border-amber-100 rounded-xl px-4 py-3">
                <AlertTriangle size={14} className="mt-0.5 flex-shrink-0" />
                <div>
                  <p className="font-bold">Negative Trend Detected</p>
                  <p className="text-[11px] mt-0.5 text-amber-600">
                    This metric shows a declining trend. Review the detailed
                    insights and consider corrective actions.
                  </p>
                </div>
              </div>
            )}
          </PageModal>
        );
      })()}

      {/* ---- TOAST NOTIFICATION ---- */}
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

export default ReportsCenter;
