// ==========================================
// ProductionPlansPage.tsx
// Production Manager — Production Plans (CRUD)
// Translate released PLM versions into scheduled
// production batches. Table with filters, create/
// update/cancel plan, validation rules.
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
import SecondaryButton from "../../components/ui/SecondaryButton";
import PrimaryButton from "../../components/ui/PrimaryButton";
import {
  ClipboardList,
  Hammer,
  CheckCircle2,
  Plus,
  Eye,
  Edit,
  Ban,
  FileText,
  Calendar,
  Package,
  Archive,
} from "lucide-react";

// ------------------------------------------
// Types
// ------------------------------------------
interface ProductionPlan {
  id: string;
  planId: string;
  productSku: string;
  productName: string;
  version: string;
  plannedQty: number;
  startDate: string;
  targetEndDate: string;
  status: "Planned" | "In Progress" | "Completed" | "Cancelled";
  notes: string;
  createdBy: string;
  createdAt: string;
}

// ------------------------------------------
// Mock data
// ------------------------------------------
const mockPlans: ProductionPlan[] = [
  { id: "1", planId: "PP-001", productSku: "SKU-001", productName: "Basic Tee", version: "V2.0", plannedQty: 500, startDate: "2026-02-15", targetEndDate: "2026-02-22", status: "Planned", notes: "Priority batch for spring collection.", createdBy: "Maria Santos", createdAt: "2026-02-10" },
  { id: "2", planId: "PP-002", productSku: "SKU-003", productName: "Polo Shirt", version: "V1.3", plannedQty: 300, startDate: "2026-02-16", targetEndDate: "2026-02-20", status: "Planned", notes: "", createdBy: "Maria Santos", createdAt: "2026-02-11" },
  { id: "3", planId: "PP-003", productSku: "SKU-002", productName: "Hoodie", version: "V1.1", plannedQty: 450, startDate: "2026-02-08", targetEndDate: "2026-02-15", status: "In Progress", notes: "Using recycled cotton blend.", createdBy: "Maria Santos", createdAt: "2026-02-05" },
  { id: "4", planId: "PP-004", productSku: "SKU-005", productName: "Denim Jacket", version: "V1.0", plannedQty: 200, startDate: "2026-02-01", targetEndDate: "2026-02-10", status: "Completed", notes: "Delivered to warehouse.", createdBy: "Juan Cruz", createdAt: "2026-01-28" },
  { id: "5", planId: "PP-005", productSku: "SKU-004", productName: "Joggers", version: "V2.0", plannedQty: 600, startDate: "2026-02-12", targetEndDate: "2026-02-19", status: "In Progress", notes: "", createdBy: "Maria Santos", createdAt: "2026-02-09" },
  { id: "6", planId: "PP-006", productSku: "SKU-006", productName: "Tank Top", version: "V1.0", plannedQty: 800, startDate: "2026-02-05", targetEndDate: "2026-02-12", status: "Cancelled", notes: "Client cancelled order.", createdBy: "Juan Cruz", createdAt: "2026-02-02" },
  { id: "7", planId: "PP-007", productSku: "SKU-007", productName: "Cargo Pants", version: "V1.2", plannedQty: 350, startDate: "2026-02-18", targetEndDate: "2026-02-25", status: "Planned", notes: "Awaiting material delivery.", createdBy: "Maria Santos", createdAt: "2026-02-13" },
];

const statusOptions = [
  { value: "", label: "All Statuses" },
  { value: "Planned", label: "Planned" },
  { value: "In Progress", label: "In Progress" },
  { value: "Completed", label: "Completed" },
  { value: "Cancelled", label: "Cancelled" },
];

const versionOptions = [
  { value: "SKU-001|V2.0", label: "Basic Tee — V2.0" },
  { value: "SKU-003|V1.3", label: "Polo Shirt — V1.3" },
  { value: "SKU-002|V1.1", label: "Hoodie — V1.1" },
  { value: "SKU-007|V1.2", label: "Cargo Pants — V1.2" },
];

const ITEMS_PER_PAGE = 6;

// ==========================================
// Component
// ==========================================
const ProductionPlansPage: React.FC = () => {
  const [plans, setPlans] = useState<ProductionPlan[]>(mockPlans);
  const [searchQuery, setSearchQuery] = useState("");
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [filterStatus, setFilterStatus] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  // Modal states
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingPlan, setEditingPlan] = useState<ProductionPlan | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<ProductionPlan | null>(null);
  const [cancelPlan, setCancelPlan] = useState<ProductionPlan | null>(null);

  // Form state
  const [formVersion, setFormVersion] = useState("");
  const [formQty, setFormQty] = useState("");
  const [formStartDate, setFormStartDate] = useState("");
  const [formEndDate, setFormEndDate] = useState("");
  const [formNotes, setFormNotes] = useState("");

  // Toast
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);

  // KPI calculations
  const kpis = useMemo(() => ({
    total: plans.length,
    planned: plans.filter((p) => p.status === "Planned").length,
    inProgress: plans.filter((p) => p.status === "In Progress").length,
    completed: plans.filter((p) => p.status === "Completed").length,
  }), [plans]);

  // Filtered data
  const filtered = useMemo(() => {
    let data = [...plans];
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      data = data.filter(
        (p) =>
          p.planId.toLowerCase().includes(q) ||
          p.productSku.toLowerCase().includes(q) ||
          p.productName.toLowerCase().includes(q)
      );
    }
    if (filterStatus) {
      data = data.filter((p) => p.status === filterStatus);
    }
    return data;
  }, [plans, searchQuery, filterStatus]);

  // Pagination
  const totalPages = Math.max(1, Math.ceil(filtered.length / ITEMS_PER_PAGE));
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = Math.min(startIndex + ITEMS_PER_PAGE, filtered.length);
  const paginatedData = filtered.slice(startIndex, endIndex);

  const resetForm = () => {
    setFormVersion("");
    setFormQty("");
    setFormStartDate("");
    setFormEndDate("");
    setFormNotes("");
    setEditingPlan(null);
  };

  const handleCreate = () => {
    resetForm();
    setIsFormOpen(true);
  };

  const handleEdit = (plan: ProductionPlan) => {
    setEditingPlan(plan);
    setFormVersion(`${plan.productSku}|${plan.version}`);
    setFormQty(String(plan.plannedQty));
    setFormStartDate(plan.startDate);
    setFormEndDate(plan.targetEndDate);
    setFormNotes(plan.notes);
    setIsFormOpen(true);
  };

  const handleView = (plan: ProductionPlan) => {
    setSelectedPlan(plan);
    setIsDetailOpen(true);
  };

  const handleSave = () => {
    if (!formVersion || !formQty || !formStartDate || !formEndDate) {
      setToast({ message: "Please fill in all required fields.", type: "error" });
      return;
    }
    const action = editingPlan ? "updated" : "created";
    setToast({ message: `Production plan ${action} successfully.`, type: "success" });
    setIsFormOpen(false);
    resetForm();
  };

  const handleCancel = (plan: ProductionPlan) => {
    if (plan.status !== "Planned") {
      setToast({ message: "Only Planned status can be cancelled.", type: "error" });
      return;
    }
    setCancelPlan(plan);
  };

  const confirmCancel = () => {
    if (cancelPlan) {
      setToast({ message: `${cancelPlan.planId} cancelled successfully.`, type: "success" });
      setCancelPlan(null);
    }
  };

  return (
    <ProductionLayout>
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

      {/* Page Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Production Plans</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Translate released PLM versions into scheduled production batches</p>
        </div>
        <SecondaryButton icon={Plus} onClick={handleCreate}>Create Plan</SecondaryButton>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatsCard title="Total Plans" value={kpis.total} icon={ClipboardList} color="bg-indigo-500" />
        <StatsCard title="Planned" value={kpis.planned} icon={FileText} color="bg-slate-500" />
        <StatsCard title="In Progress" value={kpis.inProgress} icon={Hammer} color="bg-blue-500" />
        <StatsCard title="Completed" value={kpis.completed} icon={CheckCircle2} color="bg-emerald-500" />
      </div>

      {/* Toolbar */}
      <TableToolbar
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        isFilterOpen={isFilterOpen}
        setIsFilterOpen={setIsFilterOpen}
        placeholder="Search by Plan ID, SKU, or Product…"
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
                <th className="px-6 py-3 text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Plan ID</th>
                <th className="px-6 py-3 text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Product SKU / Name</th>
                <th className="px-6 py-3 text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Version</th>
                <th className="px-6 py-3 text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Planned Qty</th>
                <th className="px-6 py-3 text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Start Date</th>
                <th className="px-6 py-3 text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Target End</th>
                <th className="px-6 py-3 text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider text-left">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
              {paginatedData.length > 0 ? (
                paginatedData.map((plan) => (
                  <tr key={plan.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/50 transition-colors">
                    <td className="px-6 py-3 text-xs font-bold text-indigo-600 dark:text-indigo-400">{plan.planId}</td>
                    <td className="px-6 py-3">
                      <p className="text-xs font-medium text-slate-800 dark:text-slate-200">{plan.productName}</p>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400">{plan.productSku}</p>
                    </td>
                    <td className="px-6 py-3 text-xs font-bold text-slate-700 dark:text-slate-300">{plan.version}</td>
                    <td className="px-6 py-3 text-xs font-bold text-slate-800 dark:text-slate-200">{plan.plannedQty.toLocaleString()}</td>
                    <td className="px-6 py-3 text-[11px] text-slate-600 dark:text-slate-400">{plan.startDate}</td>
                    <td className="px-6 py-3 text-[11px] text-slate-600 dark:text-slate-400">{plan.targetEndDate}</td>
                    <td className="px-6 py-3"><StatusBadge status={plan.status} /></td>
                    <td className="px-6 py-3 text-left">
                      <div className="flex items-center justify-start gap-1">
                        <button onClick={() => handleView(plan)} className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 rounded-lg transition-colors" title="View"><Eye size={14} /></button>
                        {plan.status === "Planned" && (
                          <>
                            <button onClick={() => handleEdit(plan)} className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors" title="Edit"><Edit size={14} /></button>
                            <button onClick={() => handleCancel(plan)} className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-900/20 rounded-lg transition-colors" title="Cancel"><Ban size={14} /></button>
                          </>
                        )}
                        <button onClick={() => { setPlans((prev) => prev.filter((p) => p.id !== plan.id)); setToast({ message: `${plan.planId} moved to archive.`, type: "success" }); }} className="p-1.5 text-slate-400 hover:text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-900/20 rounded-lg transition-colors" title="Archive"><Archive size={14} /></button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={8} className="px-6 py-12 text-center text-sm text-slate-400 italic">No production plans found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        <Pagination currentPage={currentPage} totalPages={totalPages} startIndex={startIndex} endIndex={endIndex} totalItems={filtered.length} onPageChange={setCurrentPage} />
      </div>

      {/* Create / Edit Modal */}
      <PageModal
        isOpen={isFormOpen}
        onClose={() => { setIsFormOpen(false); resetForm(); }}
        title={editingPlan ? `Edit ${editingPlan.planId}` : "Create Production Plan"}
        subtitle={editingPlan ? `${editingPlan.productSku} — ${editingPlan.productName}` : "Schedule a new production batch from a released PLM version"}
        footer={
          <div className="flex items-center gap-3">
            <SecondaryButton onClick={() => { setIsFormOpen(false); resetForm(); }}>Cancel</SecondaryButton>
            <PrimaryButton onClick={handleSave} className="!w-auto !py-2.5 !px-6 !rounded-xl !text-xs">{editingPlan ? "Update Plan" : "Create Plan"}</PrimaryButton>
          </div>
        }
      >
        <div className="space-y-1">
          <IconSelect
            label="Product Version (Approved & Released)"
            value={formVersion}
            onChange={setFormVersion}
            options={versionOptions}
            placeholder="Select product version…"
          />
          <InputGroup id="planned-qty" label="Planned Quantity" type="number" placeholder="e.g. 500" icon={Package} value={formQty} onChange={(e) => setFormQty(e.target.value)} />
          <InputGroup id="start-date" label="Start Date" type="date" icon={Calendar} value={formStartDate} onChange={(e) => setFormStartDate(e.target.value)} />
          <InputGroup id="end-date" label="Target End Date" type="date" icon={Calendar} value={formEndDate} onChange={(e) => setFormEndDate(e.target.value)} />
          <InputGroup id="notes" label="Notes (optional)" placeholder="Additional instructions or context…" icon={FileText} value={formNotes} onChange={(e) => setFormNotes(e.target.value)} />
        </div>

        {/* Validation note */}
        <div className="mt-4 p-3 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl">
          <p className="text-[11px] text-amber-700 dark:text-amber-400 font-medium">Only approved & released PLM versions can be scheduled for production.</p>
        </div>
      </PageModal>

      {/* Detail Modal */}
      <PageModal
        isOpen={isDetailOpen}
        onClose={() => setIsDetailOpen(false)}
        title={selectedPlan?.planId || ""}
        subtitle={`${selectedPlan?.productSku} — ${selectedPlan?.productName}`}
        badges={selectedPlan ? <StatusBadge status={selectedPlan.status} /> : undefined}
      >
        {selectedPlan && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div><label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Version</label><p className="text-sm font-bold text-slate-800 dark:text-slate-200 mt-1">{selectedPlan.version}</p></div>
              <div><label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Planned Quantity</label><p className="text-sm font-bold text-slate-800 dark:text-slate-200 mt-1">{selectedPlan.plannedQty.toLocaleString()} pcs</p></div>
              <div><label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Start Date</label><p className="text-sm text-slate-600 dark:text-slate-400 mt-1">{selectedPlan.startDate}</p></div>
              <div><label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Target End Date</label><p className="text-sm text-slate-600 dark:text-slate-400 mt-1">{selectedPlan.targetEndDate}</p></div>
              <div><label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Created By</label><p className="text-sm text-slate-600 dark:text-slate-400 mt-1">{selectedPlan.createdBy}</p></div>
              <div><label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Created At</label><p className="text-sm text-slate-600 dark:text-slate-400 mt-1">{selectedPlan.createdAt}</p></div>
            </div>
            {selectedPlan.notes && (
              <div><label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Notes</label><p className="text-sm text-slate-600 dark:text-slate-400 mt-1 leading-relaxed">{selectedPlan.notes}</p></div>
            )}
          </div>
        )}
      </PageModal>

      {/* Cancel Confirmation */}
      <ConfirmationModal
        isOpen={!!cancelPlan}
        onClose={() => setCancelPlan(null)}
        onConfirm={confirmCancel}
        title="Cancel Production Plan"
        message={`Are you sure you want to cancel ${cancelPlan?.planId}? This action cannot be undone. Only plans with no work orders can be cancelled.`}
        variant="danger"
        confirmText="Cancel Plan"
      />
    </ProductionLayout>
  );
};

export default ProductionPlansPage;
