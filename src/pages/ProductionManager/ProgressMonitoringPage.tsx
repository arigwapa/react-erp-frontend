// ==========================================
// ProgressMonitoringPage.tsx
// Production Manager — Progress Monitoring
// Read + Update only. Real-time visibility of
// manufacturing performance per work order.
// Dashboard-style table with progress bars
// and visual status indicators.
// ==========================================

import React, { useState, useMemo } from "react";
import ProductionLayout from "../../layout/ProductionLayout";
import StatsCard from "../../components/ui/StatsCard";
import { TableToolbar } from "../../components/ui/TableToolbar";
import { StatusBadge } from "../../components/ui/StatusBadge";
import Pagination from "../../components/ui/Pagination";
import PageModal from "../../components/ui/PageModal";
import ProgressBar from "../../components/ui/ProgressBar";
import Toast from "../../components/ui/Toast";
import InputGroup from "../../components/ui/InputGroup";
import IconSelect from "../../components/ui/IconSelect";
import SecondaryButton from "../../components/ui/SecondaryButton";
import PrimaryButton from "../../components/ui/PrimaryButton";
import {
  Activity,
  TrendingUp,
  AlertTriangle,
  Clock,
  Eye,
  Edit,
  Package,
  FileText,
  Archive,
} from "lucide-react";

// ------------------------------------------
// Types
// ------------------------------------------
interface MonitorEntry {
  id: string;
  woNumber: string;
  productName: string;
  productSku: string;
  plannedQty: number;
  producedQty: number;
  completionPct: number;
  delayDays: number;
  efficiencyRate: number;
  status: "On Track" | "At Risk" | "Delayed" | "Completed";
  startDate: string;
  endDate: string;
}

// ------------------------------------------
// Mock data
// ------------------------------------------
const mockEntries: MonitorEntry[] = [
  { id: "1", woNumber: "WO-102", productName: "Basic Tee", productSku: "SKU-001", plannedQty: 500, producedQty: 210, completionPct: 42, delayDays: 0, efficiencyRate: 88, status: "On Track", startDate: "2026-02-13", endDate: "2026-02-20" },
  { id: "2", woNumber: "WO-107", productName: "Joggers (Batch 2)", productSku: "SKU-004", plannedQty: 400, producedQty: 280, completionPct: 70, delayDays: 0, efficiencyRate: 92, status: "On Track", startDate: "2026-02-10", endDate: "2026-02-17" },
  { id: "3", woNumber: "WO-105", productName: "Denim Jacket", productSku: "SKU-005", plannedQty: 200, producedQty: 150, completionPct: 75, delayDays: 3, efficiencyRate: 65, status: "Delayed", startDate: "2026-02-01", endDate: "2026-02-10" },
  { id: "4", woNumber: "WO-109", productName: "Polo Shirt", productSku: "SKU-003", plannedQty: 300, producedQty: 120, completionPct: 40, delayDays: 1, efficiencyRate: 72, status: "At Risk", startDate: "2026-02-11", endDate: "2026-02-18" },
  { id: "5", woNumber: "WO-096", productName: "Joggers", productSku: "SKU-004", plannedQty: 600, producedQty: 600, completionPct: 100, delayDays: 0, efficiencyRate: 96, status: "Completed", startDate: "2026-02-12", endDate: "2026-02-18" },
  { id: "6", woNumber: "WO-099", productName: "Hoodie", productSku: "SKU-002", plannedQty: 450, producedQty: 450, completionPct: 100, delayDays: 0, efficiencyRate: 94, status: "Completed", startDate: "2026-02-08", endDate: "2026-02-14" },
];

const statusFilterOptions = [
  { value: "", label: "All Statuses" },
  { value: "On Track", label: "On Track" },
  { value: "At Risk", label: "At Risk" },
  { value: "Delayed", label: "Delayed" },
  { value: "Completed", label: "Completed" },
];

const ITEMS_PER_PAGE = 6;

// ------------------------------------------
// Helper
// ------------------------------------------
const getProgressStatus = (entry: MonitorEntry): "on-track" | "at-risk" | "delayed" | "completed" => {
  switch (entry.status) {
    case "On Track": return "on-track";
    case "At Risk": return "at-risk";
    case "Delayed": return "delayed";
    case "Completed": return "completed";
  }
};

const getStatusIndicator = (status: string) => {
  switch (status) {
    case "On Track": return <span className="flex items-center gap-1.5 text-[11px] font-bold text-emerald-600"><span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />On Track</span>;
    case "At Risk": return <span className="flex items-center gap-1.5 text-[11px] font-bold text-amber-600"><span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />At Risk</span>;
    case "Delayed": return <span className="flex items-center gap-1.5 text-[11px] font-bold text-rose-600"><span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />Delayed</span>;
    case "Completed": return <span className="flex items-center gap-1.5 text-[11px] font-bold text-indigo-600"><span className="w-2 h-2 rounded-full bg-indigo-500" />Completed</span>;
    default: return null;
  }
};

// ==========================================
// Component
// ==========================================
const ProgressMonitoringPage: React.FC = () => {
  const [entries, setEntries] = useState<MonitorEntry[]>(mockEntries);
  const [searchQuery, setSearchQuery] = useState("");
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [filterStatus, setFilterStatus] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  // Modal states
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [selectedEntry, setSelectedEntry] = useState<MonitorEntry | null>(null);
  const [isQuickUpdateOpen, setIsQuickUpdateOpen] = useState(false);
  const [updateEntry, setUpdateEntry] = useState<MonitorEntry | null>(null);
  const [updateQty, setUpdateQty] = useState("");
  const [updateNotes, setUpdateNotes] = useState("");

  // Toast
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);

  // KPI calculations
  const kpis = useMemo(() => ({
    active: entries.filter((e) => e.status !== "Completed").length,
    onTrack: entries.filter((e) => e.status === "On Track").length,
    atRisk: entries.filter((e) => e.status === "At Risk").length,
    delayed: entries.filter((e) => e.status === "Delayed").length,
  }), [entries]);

  // Filtered data
  const filtered = useMemo(() => {
    let data = [...entries];
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      data = data.filter(
        (e) =>
          e.woNumber.toLowerCase().includes(q) ||
          e.productName.toLowerCase().includes(q) ||
          e.productSku.toLowerCase().includes(q)
      );
    }
    if (filterStatus) {
      data = data.filter((e) => e.status === filterStatus);
    }
    return data;
  }, [entries, searchQuery, filterStatus]);

  // Pagination
  const totalPages = Math.max(1, Math.ceil(filtered.length / ITEMS_PER_PAGE));
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = Math.min(startIndex + ITEMS_PER_PAGE, filtered.length);
  const paginatedData = filtered.slice(startIndex, endIndex);

  const handleView = (entry: MonitorEntry) => {
    setSelectedEntry(entry);
    setIsDetailOpen(true);
  };

  const handleQuickUpdate = (entry: MonitorEntry) => {
    setUpdateEntry(entry);
    setUpdateQty(String(entry.producedQty));
    setUpdateNotes("");
    setIsQuickUpdateOpen(true);
  };

  const saveQuickUpdate = () => {
    if (!updateQty) {
      setToast({ message: "Please enter produced quantity.", type: "error" });
      return;
    }
    setToast({ message: `${updateEntry?.woNumber} progress updated to ${updateQty} pcs.`, type: "success" });
    setIsQuickUpdateOpen(false);
    setUpdateEntry(null);
  };

  return (
    <ProductionLayout>
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Progress Monitoring</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Real-time visibility of manufacturing performance</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatsCard title="Active Orders" value={kpis.active} icon={Activity} color="bg-indigo-500" />
        <StatsCard title="On Track" value={kpis.onTrack} icon={TrendingUp} color="bg-emerald-500" />
        <StatsCard title="At Risk" value={kpis.atRisk} icon={Clock} color="bg-amber-500" />
        <StatsCard title="Delayed" value={kpis.delayed} icon={AlertTriangle} color="bg-rose-500" />
      </div>

      {/* Toolbar */}
      <TableToolbar
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        isFilterOpen={isFilterOpen}
        setIsFilterOpen={setIsFilterOpen}
        placeholder="Search by WO#, Product, or SKU…"
      >
        <div className="p-3">
          <IconSelect label="Status" value={filterStatus} onChange={(v) => { setFilterStatus(v); setCurrentPage(1); }} options={statusFilterOptions} placeholder="All Statuses" />
        </div>
      </TableToolbar>

      {/* Monitoring Table */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700">
                <th className="px-6 py-3 text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Work Order</th>
                <th className="px-6 py-3 text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Product</th>
                <th className="px-6 py-3 text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Planned vs Produced</th>
                <th className="px-6 py-3 text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider w-40">Completion</th>
                <th className="px-6 py-3 text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Delay</th>
                <th className="px-6 py-3 text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Efficiency</th>
                <th className="px-6 py-3 text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider text-left">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
              {paginatedData.length > 0 ? (
                paginatedData.map((entry) => (
                  <tr key={entry.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/50 transition-colors">
                    <td className="px-6 py-3 text-xs font-bold text-indigo-600 dark:text-indigo-400">{entry.woNumber}</td>
                    <td className="px-6 py-3">
                      <p className="text-xs font-medium text-slate-800 dark:text-slate-200">{entry.productName}</p>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400">{entry.productSku}</p>
                    </td>
                    <td className="px-6 py-3">
                      <p className="text-xs font-bold text-slate-800 dark:text-slate-200">{entry.producedQty.toLocaleString()} / {entry.plannedQty.toLocaleString()}</p>
                    </td>
                    <td className="px-6 py-3">
                      <ProgressBar value={entry.completionPct} status={getProgressStatus(entry)} height="h-1.5" />
                    </td>
                    <td className="px-6 py-3">
                      <span className={`text-xs font-bold ${entry.delayDays > 0 ? "text-rose-600" : "text-emerald-600"}`}>
                        {entry.delayDays > 0 ? `${entry.delayDays}d late` : "On time"}
                      </span>
                    </td>
                    <td className="px-6 py-3">
                      <span className={`text-xs font-bold ${entry.efficiencyRate >= 85 ? "text-emerald-600" : entry.efficiencyRate >= 70 ? "text-amber-600" : "text-rose-600"}`}>
                        {entry.efficiencyRate}%
                      </span>
                    </td>
                    <td className="px-6 py-3"><StatusBadge status={entry.status} /></td>
                    <td className="px-6 py-3 text-left">
                      <div className="flex items-center justify-start gap-1">
                        <button onClick={() => handleView(entry)} className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 rounded-lg transition-colors" title="View Details"><Eye size={14} /></button>
                        {entry.status !== "Completed" && (
                          <button onClick={() => handleQuickUpdate(entry)} className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors" title="Quick Update"><Edit size={14} /></button>
                        )}
                        <button onClick={() => { setEntries((prev) => prev.filter((e) => e.id !== entry.id)); setToast({ message: `${entry.woNumber} moved to archive.`, type: "success" }); }} className="p-1.5 text-slate-400 hover:text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-900/20 rounded-lg transition-colors" title="Archive"><Archive size={14} /></button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={8} className="px-6 py-12 text-center text-sm text-slate-400 italic">No entries found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        <Pagination currentPage={currentPage} totalPages={totalPages} startIndex={startIndex} endIndex={endIndex} totalItems={filtered.length} onPageChange={setCurrentPage} />
      </div>

      {/* Detail Modal */}
      <PageModal
        isOpen={isDetailOpen}
        onClose={() => setIsDetailOpen(false)}
        title={selectedEntry?.woNumber || ""}
        subtitle={`${selectedEntry?.productSku} — ${selectedEntry?.productName}`}
        badges={selectedEntry ? <StatusBadge status={selectedEntry.status} /> : undefined}
      >
        {selectedEntry && (
          <div className="space-y-5">
            <ProgressBar value={selectedEntry.completionPct} label="Overall Completion" status={getProgressStatus(selectedEntry)} height="h-3" />

            <div className="grid grid-cols-2 gap-4">
              <div><label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Planned Qty</label><p className="text-sm font-bold text-slate-800 dark:text-slate-200 mt-1">{selectedEntry.plannedQty.toLocaleString()} pcs</p></div>
              <div><label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Produced Qty</label><p className="text-sm font-bold text-slate-800 dark:text-slate-200 mt-1">{selectedEntry.producedQty.toLocaleString()} pcs</p></div>
              <div><label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Delay Days</label><p className={`text-sm font-bold mt-1 ${selectedEntry.delayDays > 0 ? "text-rose-600" : "text-emerald-600"}`}>{selectedEntry.delayDays > 0 ? `${selectedEntry.delayDays} days late` : "On time"}</p></div>
              <div><label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Efficiency Rate</label><p className={`text-sm font-bold mt-1 ${selectedEntry.efficiencyRate >= 85 ? "text-emerald-600" : selectedEntry.efficiencyRate >= 70 ? "text-amber-600" : "text-rose-600"}`}>{selectedEntry.efficiencyRate}%</p></div>
              <div><label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Start Date</label><p className="text-sm text-slate-600 dark:text-slate-400 mt-1">{selectedEntry.startDate}</p></div>
              <div><label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">End Date</label><p className="text-sm text-slate-600 dark:text-slate-400 mt-1">{selectedEntry.endDate}</p></div>
            </div>

            {/* Status Legend */}
            <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-xl">
              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-3">Status Legend</p>
              <div className="grid grid-cols-2 gap-2">
                {getStatusIndicator("On Track")}
                {getStatusIndicator("At Risk")}
                {getStatusIndicator("Delayed")}
                {getStatusIndicator("Completed")}
              </div>
            </div>
          </div>
        )}
      </PageModal>

      {/* Quick Progress Update Modal */}
      <PageModal
        isOpen={isQuickUpdateOpen}
        onClose={() => { setIsQuickUpdateOpen(false); setUpdateEntry(null); }}
        title={`Quick Update — ${updateEntry?.woNumber}`}
        subtitle={`${updateEntry?.productName} · Current: ${updateEntry?.producedQty}/${updateEntry?.plannedQty}`}
        footer={
          <div className="flex items-center gap-3">
            <SecondaryButton onClick={() => { setIsQuickUpdateOpen(false); setUpdateEntry(null); }}>Cancel</SecondaryButton>
            <PrimaryButton onClick={saveQuickUpdate} className="!w-auto !py-2.5 !px-6 !rounded-xl !text-xs">Save Update</PrimaryButton>
          </div>
        }
      >
        {updateEntry && (
          <div className="space-y-4">
            <ProgressBar value={updateEntry.completionPct} label="Current Progress" status={getProgressStatus(updateEntry)} height="h-2.5" />
            <InputGroup id="update-qty" label="Produced Quantity" type="number" placeholder={`Current: ${updateEntry.producedQty} / Max: ${updateEntry.plannedQty}`} icon={Package} value={updateQty} onChange={(e) => setUpdateQty(e.target.value)} />
            <InputGroup id="update-notes" label="Notes (optional)" placeholder="Progress notes…" icon={FileText} value={updateNotes} onChange={(e) => setUpdateNotes(e.target.value)} />
          </div>
        )}
      </PageModal>
    </ProductionLayout>
  );
};

export default ProgressMonitoringPage;
