// ==========================================
// PLMReportsPage.tsx — PLM Reports
// Branch-scoped reporting page with:
//   Product Status Summary, Revision History,
//   Product Readiness Report.
// Filters for date range, category, status.
// Export to PDF/Excel.
// ==========================================

import { useState } from "react";
import {
  BarChart3,
  Package,
  History,
  CheckCircle,
  XCircle,
  FileText,
  Download,
  Lock,
  Calendar,
  Layers,
  AlertTriangle,
} from "lucide-react";

// ------------------------------------------
// Layout & Reusable UI
// ------------------------------------------
import PLMLayout from "../../layout/PLMLayout";
import StatsCard from "../../components/ui/StatsCard";
import SecondaryButton from "../../components/ui/SecondaryButton";
import ReportCard from "../../components/ui/ReportCard";
import { StatusBadge } from "../../components/ui/StatusBadge";
import Toast from "../../components/ui/Toast";
import IconSelect from "../../components/ui/IconSelect";
import type { IconSelectOption } from "../../components/ui/IconSelect";

// ==========================================
// MOCK DATA
// ==========================================

const PRODUCT_STATUS_SUMMARY = [
  { category: "Outerwear", active: 2, archived: 0 },
  { category: "Tops", active: 2, archived: 1 },
  { category: "Bottoms", active: 1, archived: 0 },
  { category: "Dresses", active: 1, archived: 0 },
  { category: "Knitwear", active: 1, archived: 0 },
];

const REVISION_HISTORY = [
  { sku: "MNL-JKT-001", name: "Classic Denim Jacket", versions: 3, latestVersion: "V2.1", latestApproval: "Draft" },
  { sku: "MNL-DRS-002", name: "Floral Summer Dress", versions: 2, latestVersion: "V1.1", latestApproval: "Draft" },
  { sku: "MNL-TEE-003", name: "Basic Cotton Tee", versions: 3, latestVersion: "V3.0", latestApproval: "Approved" },
  { sku: "MNL-COAT-004", name: "Wool Trench Coat", versions: 2, latestVersion: "V2.0", latestApproval: "Rejected" },
  { sku: "MNL-SHT-005", name: "Linen Button-Down Shirt", versions: 2, latestVersion: "V2.0", latestApproval: "Approved" },
  { sku: "MNL-SWT-006", name: "Knit Crew Sweater", versions: 1, latestVersion: "V1.0", latestApproval: "Draft" },
  { sku: "MNL-PNT-007", name: "Cargo Utility Pants", versions: 4, latestVersion: "V4.0", latestApproval: "Approved" },
];

const READINESS_REPORT = [
  { sku: "MNL-TEE-003", name: "Basic Cotton Tee", approved: true, bomComplete: true, released: true },
  { sku: "MNL-PNT-007", name: "Cargo Utility Pants", approved: true, bomComplete: true, released: true },
  { sku: "MNL-SHT-005", name: "Linen Button-Down Shirt", approved: true, bomComplete: true, released: false },
  { sku: "MNL-JKT-001", name: "Classic Denim Jacket", approved: false, bomComplete: true, released: false },
  { sku: "MNL-DRS-002", name: "Floral Summer Dress", approved: false, bomComplete: false, released: false },
  { sku: "MNL-SWT-006", name: "Knit Crew Sweater", approved: false, bomComplete: false, released: false },
];

const CATEGORY_OPTIONS: IconSelectOption[] = [
  { value: "All", label: "All Categories", icon: Package },
  { value: "Outerwear", label: "Outerwear", icon: Package },
  { value: "Tops", label: "Tops", icon: Package },
  { value: "Bottoms", label: "Bottoms", icon: Package },
  { value: "Dresses", label: "Dresses", icon: Package },
  { value: "Knitwear", label: "Knitwear", icon: Package },
];

// ==========================================
// MAIN COMPONENT
// ==========================================

function PLMReportsPage() {
  // ------------------------------------------
  // STATE
  // ------------------------------------------
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);
  const [categoryFilter, setCategoryFilter] = useState("All");

  // ------------------------------------------
  // HANDLERS
  // ------------------------------------------
  const handleExport = (format: string) => {
    setToast({ message: `Exporting PLM Report as ${format}... (branch data only)`, type: "success" });
  };

  // ==========================================
  // RENDER
  // ==========================================
  return (
    <>
      <PLMLayout>
        <div className="max-w-7xl mx-auto space-y-6 pb-20">
          {/* Page Header */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <h1 className="text-3xl font-bold text-slate-900 dark:text-white tracking-tight">PLM Reports</h1>
              <p className="text-xs font-medium text-slate-500 dark:text-slate-400 mt-1">Product status summary, revision history, and readiness reports for this branch.</p>
            </div>
            <div className="flex items-center gap-3">
              <SecondaryButton onClick={() => handleExport("PDF")} icon={Download}>Export PDF</SecondaryButton>
              <SecondaryButton onClick={() => handleExport("Excel")} icon={Download}>Export Excel</SecondaryButton>
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-full border border-amber-200 bg-amber-50 text-amber-800 dark:border-amber-700 dark:bg-amber-900/30 dark:text-amber-300 text-xs font-semibold"><Lock size={12} />Branch: Manila</div>
            </div>
          </div>

          {/* Summary Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <StatsCard title="Total Products" value={7} icon={Package} color="bg-indigo-500" />
            <StatsCard title="Total Versions" value={17} icon={History} color="bg-blue-500" />
            <StatsCard title="Ready for Release" value={3} icon={CheckCircle} color="bg-emerald-500" />
            <StatsCard title="Blocked" value={3} icon={AlertTriangle} color="bg-rose-500" />
          </div>

          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-end">
            <div className="w-full sm:w-64">
              <IconSelect label="Category Filter" value={categoryFilter} onChange={setCategoryFilter} options={CATEGORY_OPTIONS} placeholder="Select category" />
            </div>
          </div>

          {/* ---- REPORT 1: PRODUCT STATUS SUMMARY ---- */}
          <ReportCard title="Product Status Summary" icon={BarChart3} iconColor="text-indigo-600" onExport={() => handleExport("PDF")} exportLabel="Export PDF">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-slate-700">
                    <th className="py-2 text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Category</th>
                    <th className="py-2 text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider text-center">Active</th>
                    <th className="py-2 text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider text-center">Archived</th>
                    <th className="py-2 text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider text-center">Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                  {PRODUCT_STATUS_SUMMARY.filter((r) => categoryFilter === "All" || r.category === categoryFilter).map((row) => (
                    <tr key={row.category} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/50">
                      <td className="py-3 text-sm font-medium text-slate-800 dark:text-slate-200">{row.category}</td>
                      <td className="py-3 text-sm font-bold text-emerald-600 dark:text-emerald-400 text-center">{row.active}</td>
                      <td className="py-3 text-sm font-bold text-slate-500 dark:text-slate-400 text-center">{row.archived}</td>
                      <td className="py-3 text-sm font-bold text-slate-900 dark:text-white text-center">{row.active + row.archived}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </ReportCard>

          {/* ---- REPORT 2: REVISION HISTORY ---- */}
          <ReportCard title="Revision History Report" icon={History} iconColor="text-blue-600" iconBg="bg-blue-50 dark:bg-blue-900/30" onExport={() => handleExport("Excel")} exportLabel="Export Excel">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-slate-700">
                    <th className="py-2 text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">SKU</th>
                    <th className="py-2 text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Product Name</th>
                    <th className="py-2 text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider text-center">Versions</th>
                    <th className="py-2 text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Latest</th>
                    <th className="py-2 text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Approval</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                  {REVISION_HISTORY.map((row) => (
                    <tr key={row.sku} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/50">
                      <td className="py-3 text-xs font-mono font-bold text-indigo-600 dark:text-indigo-400">{row.sku}</td>
                      <td className="py-3 text-sm font-medium text-slate-800 dark:text-slate-200">{row.name}</td>
                      <td className="py-3 text-sm font-bold text-slate-900 dark:text-white text-center">{row.versions}</td>
                      <td className="py-3 text-xs font-mono font-bold text-slate-700 dark:text-slate-300">{row.latestVersion}</td>
                      <td className="py-3"><StatusBadge status={row.latestApproval} /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </ReportCard>

          {/* ---- REPORT 3: PRODUCT READINESS ---- */}
          <ReportCard title="Product Readiness Report" icon={CheckCircle} iconColor="text-emerald-600" iconBg="bg-emerald-50 dark:bg-emerald-900/30" onExport={() => handleExport("PDF")} exportLabel="Export PDF">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-slate-700">
                    <th className="py-2 text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">SKU</th>
                    <th className="py-2 text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Product Name</th>
                    <th className="py-2 text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider text-center">Approved</th>
                    <th className="py-2 text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider text-center">BOM Complete</th>
                    <th className="py-2 text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider text-center">Released</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                  {READINESS_REPORT.map((row) => (
                    <tr key={row.sku} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/50">
                      <td className="py-3 text-xs font-mono font-bold text-indigo-600 dark:text-indigo-400">{row.sku}</td>
                      <td className="py-3 text-sm font-medium text-slate-800 dark:text-slate-200">{row.name}</td>
                      <td className="py-3 text-center">{row.approved ? <CheckCircle size={16} className="text-emerald-500 inline" /> : <XCircle size={16} className="text-rose-400 inline" />}</td>
                      <td className="py-3 text-center">{row.bomComplete ? <CheckCircle size={16} className="text-emerald-500 inline" /> : <XCircle size={16} className="text-rose-400 inline" />}</td>
                      <td className="py-3 text-center">{row.released ? <CheckCircle size={16} className="text-emerald-500 inline" /> : <XCircle size={16} className="text-slate-300 dark:text-slate-600 inline" />}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </ReportCard>
        </div>
      </PLMLayout>

      {/* ---- TOAST ---- */}
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </>
  );
}

export default PLMReportsPage;
