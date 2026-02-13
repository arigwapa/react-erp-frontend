// ==========================================
// WorkOrdersPage.tsx
// Production Manager — Work Orders (CRUD + Lifecycle)
// Represents actual manufacturing execution tied to
// a production plan. Supports: Create, Start, Update
// Progress, Complete, Cancel.
// ==========================================

import React, { useState, useMemo } from "react";
import ProductionLayout from "../../layout/ProductionLayout";
import StatsCard from "../../components/ui/StatsCard";
import { TableToolbar } from "../../components/ui/TableToolbar";
import { StatusBadge } from "../../components/ui/StatusBadge";
import Pagination from "../../components/ui/Pagination";
import PageModal from "../../components/ui/PageModal";
import ConfirmationModal from "../../components/ui/ConfirmationModal";
import Toast from "../../components/ui/Toast";
import IconSelect from "../../components/ui/IconSelect";
import InputGroup from "../../components/ui/InputGroup";
import ProgressBar from "../../components/ui/ProgressBar";
import SecondaryButton from "../../components/ui/SecondaryButton";
import PrimaryButton from "../../components/ui/PrimaryButton";
import {
  Hammer,
  Clock,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Plus,
  Eye,
  Edit,
  Play,
  Ban,
  Package,
  FileText,
  Calendar,
  TrendingUp,
  Archive,
} from "lucide-react";

// ------------------------------------------
// Types
// ------------------------------------------
interface WorkOrder {
  id: string;
  woNumber: string;
  planId: string;
  productSku: string;
  productName: string;
  quantity: number;
  producedQty: number;
  startDate: string;
  endDate: string;
  status: "Pending" | "Ongoing" | "Completed" | "Delayed" | "Cancelled";
  progress: number;
  notes: string;
  createdBy: string;
  createdAt: string;
}

// ------------------------------------------
// Mock data
// ------------------------------------------
const mockWorkOrders: WorkOrder[] = [
  { id: "1", woNumber: "WO-096", planId: "PP-005", productSku: "SKU-004", productName: "Joggers", quantity: 600, producedQty: 600, startDate: "2026-02-12", endDate: "2026-02-18", status: "Completed", progress: 100, notes: "Completed on schedule.", createdBy: "Maria Santos", createdAt: "2026-02-11" },
  { id: "2", woNumber: "WO-099", planId: "PP-003", productSku: "SKU-002", productName: "Hoodie", quantity: 450, producedQty: 450, startDate: "2026-02-08", endDate: "2026-02-14", status: "Completed", progress: 100, notes: "", createdBy: "Maria Santos", createdAt: "2026-02-07" },
  { id: "3", woNumber: "WO-101", planId: "PP-003", productSku: "SKU-002", productName: "Hoodie (Rework)", quantity: 15, producedQty: 0, startDate: "2026-02-14", endDate: "2026-02-15", status: "Pending", progress: 0, notes: "Rework from QA rejection — stitching defect.", createdBy: "Juan Cruz", createdAt: "2026-02-14" },
  { id: "4", woNumber: "WO-102", planId: "PP-001", productSku: "SKU-001", productName: "Basic Tee", quantity: 500, producedQty: 210, startDate: "2026-02-13", endDate: "2026-02-20", status: "Ongoing", progress: 42, notes: "", createdBy: "Maria Santos", createdAt: "2026-02-12" },
  { id: "5", woNumber: "WO-105", planId: "PP-004", productSku: "SKU-005", productName: "Denim Jacket", quantity: 200, producedQty: 150, startDate: "2026-02-01", endDate: "2026-02-10", status: "Delayed", progress: 75, notes: "Delayed due to fabric shortage.", createdBy: "Juan Cruz", createdAt: "2026-01-30" },
  { id: "6", woNumber: "WO-107", planId: "PP-005", productSku: "SKU-004", productName: "Joggers (Batch 2)", quantity: 400, producedQty: 280, startDate: "2026-02-10", endDate: "2026-02-17", status: "Ongoing", progress: 70, notes: "", createdBy: "Maria Santos", createdAt: "2026-02-09" },
  { id: "7", woNumber: "WO-108", planId: "PP-007", productSku: "SKU-007", productName: "Cargo Pants", quantity: 350, producedQty: 0, startDate: "2026-02-18", endDate: "2026-02-25", status: "Pending", progress: 0, notes: "Waiting for material delivery.", createdBy: "Maria Santos", createdAt: "2026-02-13" },
  { id: "8", woNumber: "WO-110", planId: "PP-001", productSku: "SKU-001", productName: "Basic Tee (Batch 2)", quantity: 500, producedQty: 0, startDate: "2026-02-15", endDate: "2026-02-22", status: "Pending", progress: 0, notes: "", createdBy: "Maria Santos", createdAt: "2026-02-13" },
];

const statusOptions = [
  { value: "", label: "All Statuses" },
  { value: "Pending", label: "Pending" },
  { value: "Ongoing", label: "Ongoing" },
  { value: "Completed", label: "Completed" },
  { value: "Delayed", label: "Delayed" },
  { value: "Cancelled", label: "Cancelled" },
];

const planOptions = [
  { value: "PP-001", label: "PP-001 — Basic Tee V2.0" },
  { value: "PP-002", label: "PP-002 — Polo Shirt V1.3" },
  { value: "PP-003", label: "PP-003 — Hoodie V1.1" },
  { value: "PP-005", label: "PP-005 — Joggers V2.0" },
  { value: "PP-007", label: "PP-007 — Cargo Pants V1.2" },
];

const ITEMS_PER_PAGE = 6;

// ------------------------------------------
// Helper: progress status
// ------------------------------------------
const getProgressStatus = (wo: WorkOrder): "on-track" | "at-risk" | "delayed" | "completed" | "default" => {
  if (wo.status === "Completed") return "completed";
  if (wo.status === "Delayed") return "delayed";
  if (wo.status === "Pending") return "default";
  if (wo.progress < 50) return "at-risk";
  return "on-track";
};

// ==========================================
// Component
// ==========================================
const WorkOrdersPage: React.FC = () => {
  const [workOrders, setWorkOrders] = useState<WorkOrder[]>(mockWorkOrders);
  const [searchQuery, setSearchQuery] = useState("");
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [filterStatus, setFilterStatus] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  // Modal states
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [selectedWO, setSelectedWO] = useState<WorkOrder | null>(null);
  const [isProgressOpen, setIsProgressOpen] = useState(false);
  const [progressWO, setProgressWO] = useState<WorkOrder | null>(null);
  const [startWO, setStartWO] = useState<WorkOrder | null>(null);
  const [completeWO, setCompleteWO] = useState<WorkOrder | null>(null);
  const [cancelWO, setCancelWO] = useState<WorkOrder | null>(null);

  // Form state
  const [formPlan, setFormPlan] = useState("");
  const [formQty, setFormQty] = useState("");
  const [formStartDate, setFormStartDate] = useState("");
  const [formNotes, setFormNotes] = useState("");

  // Progress update form
  const [progressProduced, setProgressProduced] = useState("");
  const [progressNotes, setProgressNotes] = useState("");

  // Cancel reason
  const [cancelReason, setCancelReason] = useState("");

  // Toast
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);

  // KPI calculations
  const kpis = useMemo(() => ({
    total: workOrders.length,
    pending: workOrders.filter((w) => w.status === "Pending").length,
    ongoing: workOrders.filter((w) => w.status === "Ongoing").length,
    completed: workOrders.filter((w) => w.status === "Completed").length,
    delayed: workOrders.filter((w) => w.status === "Delayed").length,
  }), [workOrders]);

  // Filtered data
  const filtered = useMemo(() => {
    let data = [...workOrders];
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      data = data.filter(
        (w) =>
          w.woNumber.toLowerCase().includes(q) ||
          w.planId.toLowerCase().includes(q) ||
          w.productName.toLowerCase().includes(q) ||
          w.productSku.toLowerCase().includes(q)
      );
    }
    if (filterStatus) {
      data = data.filter((w) => w.status === filterStatus);
    }
    return data;
  }, [workOrders, searchQuery, filterStatus]);

  // Pagination
  const totalPages = Math.max(1, Math.ceil(filtered.length / ITEMS_PER_PAGE));
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = Math.min(startIndex + ITEMS_PER_PAGE, filtered.length);
  const paginatedData = filtered.slice(startIndex, endIndex);

  const resetForm = () => {
    setFormPlan("");
    setFormQty("");
    setFormStartDate("");
    setFormNotes("");
  };

  const handleCreate = () => {
    resetForm();
    setIsFormOpen(true);
  };

  const handleSaveWO = () => {
    if (!formPlan || !formQty || !formStartDate) {
      setToast({ message: "Please fill in all required fields.", type: "error" });
      return;
    }
    setToast({ message: "Work order created successfully.", type: "success" });
    setIsFormOpen(false);
    resetForm();
  };

  const handleView = (wo: WorkOrder) => {
    setSelectedWO(wo);
    setIsDetailOpen(true);
  };

  const handleStartWO = (wo: WorkOrder) => {
    setStartWO(wo);
  };

  const confirmStart = () => {
    if (startWO) {
      setToast({ message: `${startWO.woNumber} started — status changed to Ongoing.`, type: "success" });
      setStartWO(null);
    }
  };

  const handleUpdateProgress = (wo: WorkOrder) => {
    setProgressWO(wo);
    setProgressProduced(String(wo.producedQty));
    setProgressNotes("");
    setIsProgressOpen(true);
  };

  const saveProgress = () => {
    if (!progressProduced) {
      setToast({ message: "Please enter produced quantity.", type: "error" });
      return;
    }
    setToast({ message: `${progressWO?.woNumber} progress updated.`, type: "success" });
    setIsProgressOpen(false);
    setProgressWO(null);
  };

  const handleComplete = (wo: WorkOrder) => {
    setCompleteWO(wo);
  };

  const confirmComplete = () => {
    if (completeWO) {
      setToast({ message: `${completeWO.woNumber} completed — sent to QA inspection & warehouse intake.`, type: "success" });
      setCompleteWO(null);
    }
  };

  const handleCancelWO = (wo: WorkOrder) => {
    setCancelReason("");
    setCancelWO(wo);
  };

  return (
    <ProductionLayout>
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

      {/* Page Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Work Orders</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Manufacturing execution tied to production plans</p>
        </div>
        <SecondaryButton icon={Plus} onClick={handleCreate}>Create Work Order</SecondaryButton>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
        <StatsCard title="Total Work Orders" value={kpis.total} icon={Hammer} color="bg-indigo-500" />
        <StatsCard title="Pending" value={kpis.pending} icon={Clock} color="bg-slate-500" />
        <StatsCard title="Ongoing" value={kpis.ongoing} icon={TrendingUp} color="bg-blue-500" />
        <StatsCard title="Completed" value={kpis.completed} icon={CheckCircle2} color="bg-emerald-500" />
        <StatsCard title="Delayed" value={kpis.delayed} icon={AlertTriangle} color="bg-rose-500" />
      </div>

      {/* Toolbar */}
      <TableToolbar
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        isFilterOpen={isFilterOpen}
        setIsFilterOpen={setIsFilterOpen}
        placeholder="Search by WO#, Plan ID, or Product…"
      >
        <div className="p-3">
          <IconSelect label="Status" value={filterStatus} onChange={(v) => { setFilterStatus(v); setCurrentPage(1); }} options={statusOptions} placeholder="All Statuses" />
        </div>
      </TableToolbar>

      {/* Table */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700">
                <th className="px-6 py-3 text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">WO No.</th>
                <th className="px-6 py-3 text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Plan ID</th>
                <th className="px-6 py-3 text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Product</th>
                <th className="px-6 py-3 text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Quantity</th>
                <th className="px-6 py-3 text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Dates</th>
                <th className="px-6 py-3 text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider w-36">Progress</th>
                <th className="px-6 py-3 text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider text-left">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
              {paginatedData.length > 0 ? (
                paginatedData.map((wo) => (
                  <tr key={wo.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/50 transition-colors">
                    <td className="px-6 py-3 text-xs font-bold text-indigo-600 dark:text-indigo-400">{wo.woNumber}</td>
                    <td className="px-6 py-3 text-xs text-slate-600 dark:text-slate-400">{wo.planId}</td>
                    <td className="px-6 py-3">
                      <p className="text-xs font-medium text-slate-800 dark:text-slate-200">{wo.productName}</p>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400">{wo.productSku}</p>
                    </td>
                    <td className="px-6 py-3">
                      <p className="text-xs font-bold text-slate-800 dark:text-slate-200">{wo.producedQty}/{wo.quantity}</p>
                    </td>
                    <td className="px-6 py-3">
                      <p className="text-[11px] text-slate-600 dark:text-slate-400">{wo.startDate}</p>
                      <p className="text-[10px] text-slate-400">to {wo.endDate}</p>
                    </td>
                    <td className="px-6 py-3"><StatusBadge status={wo.status} /></td>
                    <td className="px-6 py-3">
                      <ProgressBar value={wo.progress} status={getProgressStatus(wo)} height="h-1.5" />
                    </td>
                    <td className="px-6 py-3 text-left">
                      <div className="flex items-center justify-start gap-1">
                        <button onClick={() => handleView(wo)} className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 rounded-lg transition-colors" title="View WO"><Eye size={14} /></button>
                        {wo.status === "Pending" && (
                          <button
                            onClick={() => handleStartWO(wo)}
                            className="inline-flex items-center gap-1 whitespace-nowrap text-left.5 px-2.5 py-1.5 text-[11px] font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-900/30 dark:text-emerald-400 dark:hover:bg-emerald-900/50 border border-emerald-200 dark:border-emerald-800 rounded-lg transition-all active:scale-95"
                            title="Start"
                          >
                            <Play size={12} />
                            Start
                          </button>
                        )}
                        {(wo.status === "Ongoing" || wo.status === "Delayed") && (
                          <button onClick={() => handleUpdateProgress(wo)} className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors" title="Update Progress"><Edit size={14} /></button>
                        )}
                        {(wo.status === "Ongoing" || wo.status === "Delayed") && wo.progress >= 100 && (
                          <button
                            onClick={() => handleComplete(wo)}
                            className="inline-flex items-center gap-1 whitespace-nowrap text-left.5 px-2.5 py-1.5 text-[11px] font-semibold text-blue-700 bg-blue-50 hover:bg-blue-100 dark:bg-blue-900/30 dark:text-blue-400 dark:hover:bg-blue-900/50 border border-blue-200 dark:border-blue-800 rounded-lg transition-all active:scale-95"
                            title="Close"
                          >
                            <CheckCircle2 size={12} />
                            Close
                          </button>
                        )}
                        {wo.status !== "Completed" && wo.status !== "Cancelled" && (
                          <button onClick={() => handleCancelWO(wo)} className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-900/20 rounded-lg transition-colors" title="Cancel"><Ban size={14} /></button>
                        )}
                        <button onClick={() => { setWorkOrders((prev) => prev.filter((order) => order.id !== wo.id)); setToast({ message: `${wo.woNumber} moved to archive.`, type: "success" }); }} className="p-1.5 text-slate-400 hover:text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-900/20 rounded-lg transition-colors" title="Archive"><Archive size={14} /></button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={8} className="px-6 py-12 text-center text-sm text-slate-400 italic">No work orders found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        <Pagination currentPage={currentPage} totalPages={totalPages} startIndex={startIndex} endIndex={endIndex} totalItems={filtered.length} onPageChange={setCurrentPage} />
      </div>

      {/* Create Work Order Modal */}
      <PageModal
        isOpen={isFormOpen}
        onClose={() => { setIsFormOpen(false); resetForm(); }}
        title="Create Work Order"
        subtitle="Assign a manufacturing batch to a production plan"
        footer={
          <div className="flex items-center gap-3">
            <SecondaryButton onClick={() => { setIsFormOpen(false); resetForm(); }}>Cancel</SecondaryButton>
            <PrimaryButton onClick={handleSaveWO} className="!w-auto !py-2.5 !px-6 !rounded-xl !text-xs">Create Work Order</PrimaryButton>
          </div>
        }
      >
        <div className="space-y-1">
          <IconSelect label="Linked Production Plan" value={formPlan} onChange={setFormPlan} options={planOptions} placeholder="Select a production plan…" />
          <InputGroup id="wo-qty" label="Quantity (≤ planned)" type="number" placeholder="e.g. 500" icon={Package} value={formQty} onChange={(e) => setFormQty(e.target.value)} />
          <InputGroup id="wo-start" label="Start Date" type="date" icon={Calendar} value={formStartDate} onChange={(e) => setFormStartDate(e.target.value)} />
          <InputGroup id="wo-notes" label="Notes (optional)" placeholder="Instructions for the floor…" icon={FileText} value={formNotes} onChange={(e) => setFormNotes(e.target.value)} />
        </div>
      </PageModal>

      {/* Detail Modal */}
      <PageModal
        isOpen={isDetailOpen}
        onClose={() => setIsDetailOpen(false)}
        title={selectedWO?.woNumber || ""}
        subtitle={`${selectedWO?.productSku} — ${selectedWO?.productName} · Plan: ${selectedWO?.planId}`}
        badges={selectedWO ? <StatusBadge status={selectedWO.status} /> : undefined}
      >
        {selectedWO && (
          <div className="space-y-5">
            <ProgressBar value={selectedWO.progress} label="Overall Progress" status={getProgressStatus(selectedWO)} height="h-2.5" />
            <div className="grid grid-cols-2 gap-4">
              <div><label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Quantity</label><p className="text-sm font-bold text-slate-800 dark:text-slate-200 mt-1">{selectedWO.producedQty} / {selectedWO.quantity} pcs</p></div>
              <div><label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Remaining</label><p className="text-sm font-bold text-slate-800 dark:text-slate-200 mt-1">{selectedWO.quantity - selectedWO.producedQty} pcs</p></div>
              <div><label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Start Date</label><p className="text-sm text-slate-600 dark:text-slate-400 mt-1">{selectedWO.startDate}</p></div>
              <div><label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">End Date</label><p className="text-sm text-slate-600 dark:text-slate-400 mt-1">{selectedWO.endDate}</p></div>
              <div><label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Created By</label><p className="text-sm text-slate-600 dark:text-slate-400 mt-1">{selectedWO.createdBy}</p></div>
              <div><label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Created At</label><p className="text-sm text-slate-600 dark:text-slate-400 mt-1">{selectedWO.createdAt}</p></div>
            </div>
            {selectedWO.notes && (
              <div><label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Notes</label><p className="text-sm text-slate-600 dark:text-slate-400 mt-1 leading-relaxed">{selectedWO.notes}</p></div>
            )}
          </div>
        )}
      </PageModal>

      {/* Update Progress Modal */}
      <PageModal
        isOpen={isProgressOpen}
        onClose={() => { setIsProgressOpen(false); setProgressWO(null); }}
        title={`Update Progress — ${progressWO?.woNumber}`}
        subtitle={`${progressWO?.productName} · Current: ${progressWO?.producedQty}/${progressWO?.quantity}`}
        footer={
          <div className="flex items-center gap-3">
            <SecondaryButton onClick={() => { setIsProgressOpen(false); setProgressWO(null); }}>Cancel</SecondaryButton>
            <PrimaryButton onClick={saveProgress} className="!w-auto !py-2.5 !px-6 !rounded-xl !text-xs">Save Progress</PrimaryButton>
          </div>
        }
      >
        {progressWO && (
          <div className="space-y-4">
            <ProgressBar value={progressWO.progress} label="Current Progress" status={getProgressStatus(progressWO)} height="h-2.5" />
            <InputGroup id="produced-qty" label="Produced Quantity" type="number" placeholder={`Max: ${progressWO.quantity}`} icon={Package} value={progressProduced} onChange={(e) => setProgressProduced(e.target.value)} />
            <InputGroup id="progress-notes" label="Notes (optional)" placeholder="Progress update notes…" icon={FileText} value={progressNotes} onChange={(e) => setProgressNotes(e.target.value)} />
            <div className="p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl">
              <p className="text-[11px] text-blue-700 dark:text-blue-400 font-medium">System calculates progress %, remaining quantity, and delay indicator automatically.</p>
            </div>
          </div>
        )}
      </PageModal>

      {/* Start Confirmation */}
      <ConfirmationModal
        isOpen={!!startWO}
        onClose={() => setStartWO(null)}
        onConfirm={confirmStart}
        title="Start Work Order"
        message={`Start ${startWO?.woNumber}? Status will change to Ongoing and the timestamp will be recorded.`}
        confirmText="Start"
      />

      {/* Complete Confirmation */}
      <ConfirmationModal
        isOpen={!!completeWO}
        onClose={() => setCompleteWO(null)}
        onConfirm={confirmComplete}
        title="Complete Work Order"
        message={`Mark ${completeWO?.woNumber} as Completed? This will send the batch to QA Inspection and Warehouse Intake.`}
        confirmText="Complete"
      />

      {/* Cancel Modal */}
      <PageModal
        isOpen={!!cancelWO}
        onClose={() => setCancelWO(null)}
        title={`Cancel ${cancelWO?.woNumber}`}
        subtitle="This action requires a reason and will be audit logged"
        footer={
          <div className="flex items-center gap-3">
            <SecondaryButton onClick={() => setCancelWO(null)}>Keep Open</SecondaryButton>
            <button
              onClick={() => {
                if (!cancelReason.trim()) {
                  setToast({ message: "Please provide a cancellation reason.", type: "error" });
                  return;
                }
                setToast({ message: `${cancelWO?.woNumber} cancelled.`, type: "success" });
                setCancelWO(null);
              }}
              className="px-5 py-2.5 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-xl shadow-sm transition-colors"
            >
              Confirm Cancel
            </button>
          </div>
        }
      >
        <div className="space-y-4">
          <div className="p-3 bg-rose-50 dark:bg-rose-900/20 border border-rose-200 dark:border-rose-800 rounded-xl flex items-start gap-3">
            <XCircle size={16} className="text-rose-500 mt-0.5 shrink-0" />
            <p className="text-[11px] text-rose-700 dark:text-rose-400 font-medium">Cancelled work orders cannot be reopened. Only work orders that are not completed can be cancelled.</p>
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-slate-500">Cancellation Reason *</label>
            <textarea
              value={cancelReason}
              onChange={(e) => setCancelReason(e.target.value)}
              placeholder="Why is this work order being cancelled?"
              className="w-full px-4 py-3 text-sm border border-slate-200 dark:border-slate-600 rounded-xl bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all min-h-[80px] resize-none"
            />
          </div>
        </div>
      </PageModal>
    </ProductionLayout>
  );
};

export default WorkOrdersPage;
