// ==========================================
// AdminExportCenterPage.tsx — Branch Export Center
// Generate and download reports for this branch.
// Branch data only — no system-wide exports.
//
// 2 Tabs: Operational | Compliance
// Each export card: date range picker, format dropdown,
// Generate/Download buttons, last exported timestamp.
//
// Reusable UI: TabBar, Card, SecondaryButton, PrimaryButton,
//   PageModal, Toast, IconSelect
// ==========================================

import { useState, useRef, useEffect } from "react";

// --- Layout ---
import AdminLayout from "../../layout/AdminLayout";

// --- Icons ---
import {
  FileText,
  Download,
  Calendar,
  Factory,
  FileSpreadsheet,
  FileCode,
  CheckCircle,
  Loader2,
  Layers,
  Users,
  Eye,
  Clock,
  Info,
  BarChart3,
  Shield,
  ChevronDown,
  Check,
  Lock,
  ShieldCheck,
  Package,
  DollarSign,
} from "lucide-react";

// --- Reusable UI Components ---
import { Card } from "../../components/ui/Card";
import { StatusBadge } from "../../components/ui/StatusBadge";
import TabBar from "../../components/ui/TabBar";
import type { Tab } from "../../components/ui/TabBar";
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
  category: "operational" | "compliance";
}

// ==========================================
// CONSTANTS
// ==========================================

const FORMAT_OPTIONS = [
  { value: "PDF", label: "PDF", icon: FileText },
  { value: "Excel", label: "Excel", icon: FileSpreadsheet },
  { value: "CSV", label: "CSV (for logs)", icon: FileCode },
];

const DATE_RANGE_OPTIONS = [
  { value: "last-7", label: "Last 7 days" },
  { value: "last-30", label: "Last 30 days" },
  { value: "last-90", label: "Last 90 days" },
  { value: "ytd", label: "Year to Date" },
];

const EXPORT_TABS: Tab[] = [
  { id: "operational", label: "Operational", icon: BarChart3, count: 5 },
  { id: "compliance", label: "Compliance", icon: Shield, count: 2 },
];

/** All exportable reports */
const ALL_REPORTS: ReportDefinition[] = [
  // --- Operational ---
  { id: "plm", title: "PLM Product Summary", description: "Products, BOMs, revisions, and material specifications for this branch. Includes product readiness and release status.", icon: Layers, lastExported: "Feb 10, 2026 · 02:15 PM", category: "operational" },
  { id: "production", title: "Production Performance", description: "Work orders, completion rates, cycle times, delayed orders, and output vs planned quantities.", icon: Factory, lastExported: "Feb 11, 2026 · 09:30 AM", category: "operational" },
  { id: "quality", title: "QA Inspection Results", description: "Inspections, defect reports, CAPA records, approval/rejection rates, and compliance summaries.", icon: ShieldCheck, lastExported: "Feb 12, 2026 · 11:45 AM", category: "operational" },
  { id: "warehouse", title: "Inventory Status", description: "Current inventory levels, stock movements, low-stock alerts, adjustment history, and warehouse analytics.", icon: Package, lastExported: "Feb 9, 2026 · 04:20 PM", category: "operational" },
  { id: "finance", title: "Finance Summaries", description: "Budgets, cost breakdowns, profitability analysis, budget vs actual usage, and financial performance.", icon: DollarSign, lastExported: null, category: "operational" },
  // --- Compliance ---
  { id: "audit-logs", title: "Branch Audit Logs", description: "Complete audit trail of user actions, security events, and system changes within this branch.", icon: Shield, lastExported: "Feb 12, 2026 · 08:00 AM", category: "compliance" },
  { id: "user-activity", title: "User Activity History", description: "Login history, session data, role changes, and activity summaries for branch users only.", icon: Users, lastExported: "Feb 11, 2026 · 03:30 PM", category: "compliance" },
];

// ==========================================
// HELPERS
// ==========================================

const getIconBg = (id: string) => {
  switch (id) {
    case "plm": return "bg-purple-50 text-purple-500";
    case "production": return "bg-blue-50 text-blue-500";
    case "quality": return "bg-rose-50 text-rose-500";
    case "warehouse": return "bg-amber-50 text-amber-500";
    case "finance": return "bg-emerald-50 text-emerald-500";
    case "audit-logs": return "bg-indigo-50 text-indigo-500";
    case "user-activity": return "bg-slate-100 text-slate-500";
    default: return "bg-slate-50 text-slate-500";
  }
};

// ==========================================
// MAIN COMPONENT
// ==========================================

function AdminExportCenterPage() {
  const [activeTab, setActiveTab] = useState("operational");

  // --- Per-card state ---
  const [formats, setFormats] = useState<Record<string, ExportFormat>>(
    Object.fromEntries(ALL_REPORTS.map((r) => [r.id, r.id === "audit-logs" || r.id === "user-activity" ? "CSV" : "PDF"])) as Record<string, ExportFormat>
  );
  const [dateRanges, setDateRanges] = useState<Record<string, string>>(
    Object.fromEntries(ALL_REPORTS.map((r) => [r.id, r.category === "compliance" ? "last-7" : "last-30"])) as Record<string, string>
  );

  // --- Date dropdown ---
  const [openDateDropdown, setOpenDateDropdown] = useState<string | null>(null);
  const dateDropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dateDropdownRef.current && !dateDropdownRef.current.contains(event.target as Node)) setOpenDateDropdown(null);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // --- Loading ---
  const [loadingReportId, setLoadingReportId] = useState<string | null>(null);

  // --- Preview modal ---
  const [previewReport, setPreviewReport] = useState<{ report: ReportDefinition; format: ExportFormat; dateRange: string } | null>(null);

  // --- Toast ---
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);

  // --- Filter reports by tab ---
  const reports = ALL_REPORTS.filter((r) => r.category === activeTab);

  // --- Handlers ---
  const handleGenerate = (report: ReportDefinition) => {
    setLoadingReportId(report.id);
    const format = formats[report.id] ?? "PDF";
    const dateRange = dateRanges[report.id] ?? "last-30";
    setTimeout(() => {
      setLoadingReportId(null);
      setPreviewReport({ report, format, dateRange });
      setToast({ message: `${report.title} generated successfully. Preview ready.`, type: "success" });
    }, 1500);
  };

  const handleDownload = () => {
    if (!previewReport) return;
    setToast({ message: `Downloading ${previewReport.report.title} as ${previewReport.format}...`, type: "success" });
    setPreviewReport(null);
  };

  const getDateLabel = (value: string) => DATE_RANGE_OPTIONS.find((o) => o.value === value)?.label ?? value;

  return (
    <>
      <AdminLayout>
        <div className="max-w-7xl mx-auto space-y-6 pb-20">
          {/* ---- PAGE HEADER ---- */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Export Center</h1>
              <p className="text-xs font-medium text-slate-500 mt-1">Generate and download reports for this branch.</p>
            </div>
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full border border-amber-200 bg-amber-50 text-amber-800 text-xs font-semibold"><Lock size={12} />Branch: Manila (Locked)</div>
          </div>

          {/* ---- TAB BAR ---- */}
          <TabBar tabs={EXPORT_TABS} activeTab={activeTab} onTabChange={setActiveTab} />

          {/* ---- EXPORT CARDS GRID ---- */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {reports.map((report) => {
              const Icon = report.icon;
              const isLoading = loadingReportId === report.id;
              const format = formats[report.id] ?? "PDF";
              const dateRange = dateRanges[report.id] ?? "last-30";

              return (
                <Card key={report.id} className="flex flex-col overflow-hidden hover:shadow-md transition-shadow duration-200">
                  <div className="p-5 flex flex-col h-full space-y-4">
                    {/* Header */}
                    <div className="flex items-start gap-3">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${getIconBg(report.id)}`}><Icon size={20} /></div>
                      <div className="min-w-0">
                        <h3 className="text-sm font-bold text-slate-900 leading-tight">{report.title}</h3>
                        <p className="text-[11px] text-slate-500 mt-0.5 leading-relaxed line-clamp-2">{report.description}</p>
                      </div>
                    </div>

                    {/* Format selector */}
                    <div>
                      <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Format</label>
                      <IconSelect value={format} onChange={(val) => setFormats({ ...formats, [report.id]: val as ExportFormat })} options={FORMAT_OPTIONS} placeholder="Select format" />
                    </div>

                    {/* Date range selector */}
                    <div>
                      <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Date Range</label>
                      <div className="relative" ref={openDateDropdown === report.id ? dateDropdownRef : undefined}>
                        <button type="button" onClick={() => setOpenDateDropdown(openDateDropdown === report.id ? null : report.id)} className={`w-full flex items-center justify-between pl-9 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl transition-all outline-none text-xs font-medium cursor-pointer ${openDateDropdown === report.id ? "ring-2 ring-slate-300 border-slate-300 shadow-sm" : "hover:bg-slate-50"} text-slate-700`}>
                          <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={14} />
                          <span className="truncate">{getDateLabel(dateRange)}</span>
                          <ChevronDown size={14} className={`text-slate-400 transition-transform duration-200 shrink-0 ${openDateDropdown === report.id ? "rotate-180" : ""}`} />
                        </button>
                        {openDateDropdown === report.id && (
                          <ul role="listbox" className="absolute z-50 mt-1.5 w-full bg-white rounded-xl border border-slate-100 shadow-xl overflow-hidden">
                            <div className="p-1.5">{DATE_RANGE_OPTIONS.map((opt) => (
                              <li key={opt.value} role="none"><button type="button" role="option" aria-selected={dateRange === opt.value} onClick={() => { setDateRanges({ ...dateRanges, [report.id]: opt.value }); setOpenDateDropdown(null); }} className={`w-full text-left px-3 py-2 rounded-lg text-xs font-semibold transition-colors flex items-center justify-between ${dateRange === opt.value ? "bg-slate-100 text-slate-900" : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"}`}>{opt.label}{dateRange === opt.value && <Check size={13} className="text-emerald-500" strokeWidth={3} />}</button></li>
                            ))}</div>
                          </ul>
                        )}
                      </div>
                    </div>

                    {/* Action button */}
                    <div className="mt-auto pt-1">
                      <PrimaryButton onClick={() => handleGenerate(report)} disabled={isLoading} className="!w-full !py-2.5 !text-xs !rounded-xl">
                        {isLoading ? (<><Loader2 size={14} className="animate-spin" /> Generating...</>) : (<><Download size={14} /> Generate Export</>)}
                      </PrimaryButton>
                    </div>

                    {/* Last exported */}
                    <div className="flex items-center gap-2 pt-2 border-t border-slate-100">
                      {report.lastExported ? (<><Clock size={11} className="text-slate-400 shrink-0" /><span className="text-[10px] text-slate-400 font-medium">Last exported: {report.lastExported}</span></>) : (<><Info size={11} className="text-slate-400 shrink-0" /><span className="text-[10px] text-slate-400 font-medium">Not yet exported</span></>)}
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        </div>
      </AdminLayout>

      {/* ==================================================================
          EXPORT PREVIEW MODAL
          ================================================================== */}
      <PageModal isOpen={!!previewReport} onClose={() => setPreviewReport(null)} title="Export Preview" subtitle={previewReport ? `${previewReport.report.title} · ${previewReport.format} · ${getDateLabel(previewReport.dateRange)}` : undefined} badges={previewReport ? <StatusBadge status="Ready" /> : undefined} maxWidth="max-w-lg" footer={<div className="flex justify-between items-center w-full"><SecondaryButton onClick={() => setPreviewReport(null)}>Cancel</SecondaryButton><PrimaryButton onClick={handleDownload} className="!w-auto !py-2.5 !px-5 !text-xs !rounded-full"><Download size={14} /> Download Export</PrimaryButton></div>}>
        {previewReport && (
          <div className="space-y-6">
            {/* Ready notice */}
            <div className="flex items-start gap-3 p-4 bg-emerald-50 rounded-xl border border-emerald-200">
              <div className="p-2 bg-emerald-100 rounded-lg shrink-0"><CheckCircle size={18} className="text-emerald-600" /></div>
              <div><h4 className="text-sm font-bold text-emerald-900">Export ready for download</h4><p className="text-[11px] text-emerald-700 mt-1">Branch data only — no system-wide records. The file includes records for the selected date range.</p></div>
            </div>
            {/* Export details */}
            <div>
              <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2 mb-3"><Info size={13} className="text-slate-400" /> Export Details</h4>
              <div className="grid grid-cols-2 gap-4 border-t border-slate-100 pt-4">
                <div className="space-y-1"><span className="flex items-center gap-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider"><FileText size={10} /> Report</span><span className="text-sm font-semibold text-slate-700">{previewReport.report.title}</span></div>
                <div className="space-y-1"><span className="flex items-center gap-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider"><FileSpreadsheet size={10} /> Format</span><span className="text-sm font-semibold text-slate-700">{previewReport.format}</span></div>
                <div className="space-y-1"><span className="flex items-center gap-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider"><Calendar size={10} /> Date Range</span><span className="text-sm font-semibold text-slate-700">{getDateLabel(previewReport.dateRange)}</span></div>
                <div className="space-y-1"><span className="flex items-center gap-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider"><Eye size={10} /> Scope</span><span className="text-sm font-semibold text-slate-700">Current branch only</span></div>
              </div>
            </div>
            {/* Branch notice */}
            <div className="flex items-center gap-2 px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl"><Lock size={14} className="text-slate-400" /><span className="text-xs font-semibold text-slate-500">Branch: Manila (Fixed) — Cannot export system-wide data.</span></div>
          </div>
        )}
      </PageModal>

      {/* ---- TOAST ---- */}
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </>
  );
}

export default AdminExportCenterPage;
