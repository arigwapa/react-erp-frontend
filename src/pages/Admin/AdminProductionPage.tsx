// ==========================================
// AdminProductionPage.tsx — Branch Admin Production
// 3 tabs: Production Plans | Work Orders | Progress Monitoring
// Branch scope only — Manila branch.
//
// Reusable UI: TabBar, TableToolbar, PageModal, DetailsModal,
//   ConfirmationModal, Toast, InputGroup, IconSelect,
//   StatsCard, StatusBadge, Card, Pagination, Buttons
// ==========================================

import { useState, useMemo, useEffect } from "react";

// --- Layout ---
import AdminLayout from "../../layout/AdminLayout";

// --- Icons ---
import {
  Factory,
  ClipboardList,
  AlertTriangle,
  CheckCircle,
  BarChart3,
  Calendar,
  Eye,
  Pencil,
  Plus,
  Package,
  Lock,
  Clock,
  User,
  XCircle,
  PlayCircle,
  Square,
  Download,
  FileText,
  Hash,
  Target,
  TrendingUp,
  Archive,
} from "lucide-react";

// --- Reusable UI Components (from components/ui) ---
import { Card } from "../../components/ui/Card";
import StatsCard from "../../components/ui/StatsCard";
import { StatusBadge } from "../../components/ui/StatusBadge";
import TabBar from "../../components/ui/TabBar";
import type { Tab } from "../../components/ui/TabBar";
import { TableToolbar } from "../../components/ui/TableToolbar";
import Pagination from "../../components/ui/Pagination";
import PrimaryButton from "../../components/ui/PrimaryButton";
import SecondaryButton from "../../components/ui/SecondaryButton";
import PageModal from "../../components/ui/PageModal";
import DetailsModal from "../../components/ui/DetailsModal";
import ConfirmationModal from "../../components/ui/ConfirmationModal";
import Toast from "../../components/ui/Toast";
import InputGroup from "../../components/ui/InputGroup";
import IconSelect from "../../components/ui/IconSelect";
import type { IconSelectOption } from "../../components/ui/IconSelect";

// ==========================================
// TYPES
// ==========================================

type PlanStatus = "Draft" | "Active" | "Completed" | "Cancelled";
type WOStatus = "Ongoing" | "Completed" | "Delayed";

interface ProductionPlan {
  id: string;
  product: string;
  plannedQty: number;
  startDate: string;
  targetDate: string;
  status: PlanStatus;
  assignedTeam: string;
  priority: "High" | "Medium" | "Low";
  notes: string;
}

interface WorkOrder {
  id: string;
  linkedPlanId: string;
  product: string;
  quantity: number;
  startDate: string;
  endDate: string;
  status: WOStatus;
  assignedTo: string;
  priority: "High" | "Medium" | "Low";
  notes: string;
  progress: number;
  outputVsTarget: string;
  delayStatus: "On track" | "Warning" | "Delayed";
}

// ==========================================
// MOCK DATA (enriched for detail modals)
// ==========================================

const MOCK_PLANS: ProductionPlan[] = [
  { id: "PP-2026-001", product: "Classic Denim Jacket", plannedQty: 200, startDate: "Feb 1, 2026", targetDate: "Feb 15, 2026", status: "Active", assignedTeam: "Production Team A", priority: "High", notes: "Priority batch for FW 2026 season launch. Materials pre-ordered and allocated." },
  { id: "PP-2026-002", product: "Cotton Basic Tee", plannedQty: 500, startDate: "Feb 5, 2026", targetDate: "Feb 12, 2026", status: "Completed", assignedTeam: "Production Team B", priority: "Medium", notes: "Core collection restock. All units completed and passed QA." },
  { id: "PP-2026-003", product: "Silk Scarf Collection", plannedQty: 150, startDate: "Feb 10, 2026", targetDate: "Feb 20, 2026", status: "Active", assignedTeam: "Production Team C", priority: "High", notes: "Delicate materials — handle with care. Silk sourced from approved supplier." },
  { id: "PP-2026-004", product: "Polo Shirt Classic", plannedQty: 300, startDate: "Feb 12, 2026", targetDate: "Feb 22, 2026", status: "Draft", assignedTeam: "Production Team A", priority: "Medium", notes: "Awaiting final BOM approval from PLM before production start." },
  { id: "PP-2026-005", product: "Canvas Tote Bag", plannedQty: 180, startDate: "Feb 8, 2026", targetDate: "Feb 18, 2026", status: "Active", assignedTeam: "Production Team B", priority: "Low", notes: "Accessories line — canvas sourced locally. Low complexity." },
  { id: "PP-2026-006", product: "Winter Parka Jacket", plannedQty: 100, startDate: "Feb 15, 2026", targetDate: "Feb 28, 2026", status: "Cancelled", assignedTeam: "Production Team C", priority: "High", notes: "Cancelled due to material supply chain delay from overseas vendor." },
];

const MOCK_WORK_ORDERS: WorkOrder[] = [
  { id: "WO-2026-045", linkedPlanId: "PP-2026-001", product: "Classic Denim Jacket", quantity: 200, startDate: "Feb 1, 2026", endDate: "Feb 15, 2026", status: "Ongoing", assignedTo: "Production Team A", priority: "High", notes: "Fabric cutting completed. Currently in sewing phase.", progress: 65, outputVsTarget: "130/200", delayStatus: "On track" },
  { id: "WO-2026-046", linkedPlanId: "PP-2026-002", product: "Cotton Basic Tee", quantity: 500, startDate: "Feb 5, 2026", endDate: "Feb 10, 2026", status: "Completed", assignedTo: "Production Team B", priority: "Medium", notes: "All units completed and QA passed. Ready for shipment.", progress: 100, outputVsTarget: "500/500", delayStatus: "On track" },
  { id: "WO-2026-047", linkedPlanId: "PP-2026-003", product: "Silk Scarf Collection", quantity: 150, startDate: "Feb 10, 2026", endDate: "Feb 20, 2026", status: "Delayed", assignedTo: "Production Team C", priority: "High", notes: "Material delivery delayed by 2 days. Revised completion: Feb 22.", progress: 30, outputVsTarget: "45/150", delayStatus: "Delayed" },
  { id: "WO-2026-048", linkedPlanId: "PP-2026-005", product: "Canvas Tote Bag", quantity: 180, startDate: "Feb 8, 2026", endDate: "Feb 18, 2026", status: "Ongoing", assignedTo: "Production Team B", priority: "Low", notes: "Stitching phase, minor adjustments on handle attachment.", progress: 55, outputVsTarget: "99/180", delayStatus: "Warning" },
  { id: "WO-2026-049", linkedPlanId: "PP-2026-001", product: "Classic Denim Jacket (Batch 2)", quantity: 100, startDate: "Feb 12, 2026", endDate: "Feb 19, 2026", status: "Ongoing", assignedTo: "Production Team A", priority: "High", notes: "Second batch — materials allocated from remaining stock.", progress: 20, outputVsTarget: "20/100", delayStatus: "On track" },
  { id: "WO-2026-050", linkedPlanId: "PP-2026-004", product: "Polo Shirt Classic", quantity: 300, startDate: "Feb 14, 2026", endDate: "Feb 24, 2026", status: "Ongoing", assignedTo: "Production Team A", priority: "Medium", notes: "Pending BOM final approval. Pre-cutting started.", progress: 0, outputVsTarget: "0/300", delayStatus: "On track" },
  { id: "WO-2026-051", linkedPlanId: "PP-2026-003", product: "Silk Scarf (Rework)", quantity: 50, startDate: "Feb 11, 2026", endDate: "Feb 14, 2026", status: "Completed", assignedTo: "Production Team C", priority: "Medium", notes: "Rework batch for QA-rejected items. All corrected.", progress: 100, outputVsTarget: "50/50", delayStatus: "On track" },
];

// ==========================================
// CONSTANTS
// ==========================================

const ITEMS_PER_PAGE = 5;

const PRODUCTION_TABS: Tab[] = [
  { id: "plans", label: "Production Plans", icon: ClipboardList, count: MOCK_PLANS.filter((p) => p.status === "Active").length },
  { id: "orders", label: "Work Orders", icon: Factory, count: MOCK_WORK_ORDERS.filter((w) => w.status === "Ongoing").length },
  { id: "progress", label: "Progress Monitoring", icon: BarChart3 },
];

const PLAN_STATUS_FILTERS = ["All Statuses", "Draft", "Active", "Completed", "Cancelled"];
const WO_STATUS_FILTERS = ["All Statuses", "Ongoing", "Completed", "Delayed"];

const PLAN_STATUS_OPTIONS: IconSelectOption[] = [
  { value: "Draft", label: "Draft", icon: FileText },
  { value: "Active", label: "Active", icon: PlayCircle },
  { value: "Completed", label: "Completed", icon: CheckCircle },
  { value: "Cancelled", label: "Cancelled", icon: XCircle },
];

const PRIORITY_OPTIONS: IconSelectOption[] = [
  { value: "High", label: "High", icon: AlertTriangle },
  { value: "Medium", label: "Medium", icon: Target },
  { value: "Low", label: "Low", icon: TrendingUp },
];

// ==========================================
// MAIN COMPONENT
// ==========================================

const AdminProductionPage = () => {
  // --- Tab ---
  const [activeTab, setActiveTab] = useState("plans");

  // --- Plans state ---
  const [plans, setPlans] = useState<ProductionPlan[]>(MOCK_PLANS);
  const [searchPlans, setSearchPlans] = useState("");
  const [filterPlansOpen, setFilterPlansOpen] = useState(false);
  const [filterPlanStatus, setFilterPlanStatus] = useState("All Statuses");
  const [pagePlans, setPagePlans] = useState(1);

  // --- Work Orders state ---
  const [workOrders, setWorkOrders] = useState<WorkOrder[]>(MOCK_WORK_ORDERS);
  const [searchOrders, setSearchOrders] = useState("");
  const [filterOrdersOpen, setFilterOrdersOpen] = useState(false);
  const [filterWOStatus, setFilterWOStatus] = useState("All Statuses");
  const [pageOrders, setPageOrders] = useState(1);

  // --- Progress state ---
  const [searchProgress, setSearchProgress] = useState("");
  const [filterProgressOpen, setFilterProgressOpen] = useState(false);
  const [pageProgress, setPageProgress] = useState(1);

  // --- Modal: Plan Detail ---
  const [detailPlan, setDetailPlan] = useState<ProductionPlan | null>(null);

  // --- Modal: Work Order Detail ---
  const [detailWO, setDetailWO] = useState<WorkOrder | null>(null);

  // --- Modal: Edit Plan Form ---
  const [isEditPlanOpen, setIsEditPlanOpen] = useState(false);
  const [editingPlan, setEditingPlan] = useState<ProductionPlan | null>(null);
  const [formProduct, setFormProduct] = useState("");
  const [formPlannedQty, setFormPlannedQty] = useState("");
  const [formStartDate, setFormStartDate] = useState("");
  const [formTargetDate, setFormTargetDate] = useState("");
  const [formPlanStatus, setFormPlanStatus] = useState("Draft");
  const [formPriority, setFormPriority] = useState("Medium");
  const [formNotes, setFormNotes] = useState("");
  const [formTeam, setFormTeam] = useState("");

  // --- Toast & Confirm ---
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);
  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    action: () => void;
    variant: "primary" | "danger";
    confirmText: string;
  }>({ isOpen: false, title: "", message: "", action: () => {}, variant: "primary", confirmText: "Confirm" });

  // --- Reset pagination on filter changes ---
  useEffect(() => { setPagePlans(1); }, [searchPlans, filterPlanStatus]);
  useEffect(() => { setPageOrders(1); }, [searchOrders, filterWOStatus]);
  useEffect(() => { setPageProgress(1); }, [searchProgress]);

  // ==========================================
  // COMPUTED: Stats
  // ==========================================
  const stats = useMemo(() => ({
    totalPlans: plans.length,
    activeWO: workOrders.filter((w) => w.status === "Ongoing").length,
    delayed: workOrders.filter((w) => w.status === "Delayed").length,
    completedThisMonth: workOrders.filter((w) => w.status === "Completed").length,
  }), [plans, workOrders]);

  // ==========================================
  // COMPUTED: Filtered & Paginated — Plans
  // ==========================================
  const filteredPlans = useMemo(() => {
    const q = searchPlans.toLowerCase();
    return plans.filter((p) => {
      const matchSearch = p.id.toLowerCase().includes(q) || p.product.toLowerCase().includes(q);
      const matchStatus = filterPlanStatus === "All Statuses" || p.status === filterPlanStatus;
      return matchSearch && matchStatus;
    });
  }, [plans, searchPlans, filterPlanStatus]);

  const plansTotalPages = Math.max(1, Math.ceil(filteredPlans.length / ITEMS_PER_PAGE));
  const plansStart = (pagePlans - 1) * ITEMS_PER_PAGE;
  const plansEnd = Math.min(plansStart + ITEMS_PER_PAGE, filteredPlans.length);
  const paginatedPlans = filteredPlans.slice(plansStart, plansEnd);

  // ==========================================
  // COMPUTED: Filtered & Paginated — Work Orders
  // ==========================================
  const filteredOrders = useMemo(() => {
    const q = searchOrders.toLowerCase();
    return workOrders.filter((w) => {
      const matchSearch = w.id.toLowerCase().includes(q) || w.product.toLowerCase().includes(q);
      const matchStatus = filterWOStatus === "All Statuses" || w.status === filterWOStatus;
      return matchSearch && matchStatus;
    });
  }, [workOrders, searchOrders, filterWOStatus]);

  const ordersTotalPages = Math.max(1, Math.ceil(filteredOrders.length / ITEMS_PER_PAGE));
  const ordersStart = (pageOrders - 1) * ITEMS_PER_PAGE;
  const ordersEnd = Math.min(ordersStart + ITEMS_PER_PAGE, filteredOrders.length);
  const paginatedOrders = filteredOrders.slice(ordersStart, ordersEnd);

  // ==========================================
  // COMPUTED: Filtered & Paginated — Progress
  // ==========================================
  const filteredProgress = useMemo(() => {
    const q = searchProgress.toLowerCase();
    return workOrders.filter((w) => w.id.toLowerCase().includes(q) || w.product.toLowerCase().includes(q));
  }, [workOrders, searchProgress]);

  const progressTotalPages = Math.max(1, Math.ceil(filteredProgress.length / ITEMS_PER_PAGE));
  const progressStart = (pageProgress - 1) * ITEMS_PER_PAGE;
  const progressEnd = Math.min(progressStart + ITEMS_PER_PAGE, filteredProgress.length);
  const paginatedProgress = filteredProgress.slice(progressStart, progressEnd);

  // ==========================================
  // HELPERS
  // ==========================================
  const getProgressBarColor = (wo: WorkOrder) => {
    if (wo.delayStatus === "Delayed") return "bg-rose-500";
    if (wo.delayStatus === "Warning") return "bg-amber-500";
    return "bg-emerald-500";
  };

  const getPriorityBadge = (priority: string) => {
    const styles = priority === "High" ? "bg-rose-50 text-rose-700" : priority === "Medium" ? "bg-amber-50 text-amber-700" : "bg-blue-50 text-blue-700";
    return <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-medium ${styles}`}>{priority}</span>;
  };

  // ==========================================
  // HANDLERS: Edit Plan Form
  // ==========================================
  const openEditPlan = (plan: ProductionPlan) => {
    setEditingPlan(plan);
    setFormProduct(plan.product);
    setFormPlannedQty(String(plan.plannedQty));
    setFormStartDate(plan.startDate);
    setFormTargetDate(plan.targetDate);
    setFormPlanStatus(plan.status);
    setFormPriority(plan.priority);
    setFormNotes(plan.notes);
    setFormTeam(plan.assignedTeam);
    setIsEditPlanOpen(true);
  };

  const openAddPlan = () => {
    setEditingPlan(null);
    setFormProduct("");
    setFormPlannedQty("");
    setFormStartDate("");
    setFormTargetDate("");
    setFormPlanStatus("Draft");
    setFormPriority("Medium");
    setFormNotes("");
    setFormTeam("");
    setIsEditPlanOpen(true);
  };

  const handleSavePlan = () => {
    if (!formProduct.trim() || !formPlannedQty.trim()) {
      setToast({ message: "Please fill in all required fields.", type: "error" });
      return;
    }
    if (editingPlan) {
      setPlans((prev) =>
        prev.map((p) =>
          p.id === editingPlan.id
            ? { ...p, product: formProduct, plannedQty: parseInt(formPlannedQty) || p.plannedQty, startDate: formStartDate || p.startDate, targetDate: formTargetDate || p.targetDate, status: formPlanStatus as PlanStatus, priority: formPriority as ProductionPlan["priority"], notes: formNotes, assignedTeam: formTeam }
            : p
        )
      );
      setToast({ message: `Plan ${editingPlan.id} updated successfully.`, type: "success" });
    } else {
      const newPlan: ProductionPlan = {
        id: `PP-2026-${String(plans.length + 1).padStart(3, "0")}`,
        product: formProduct,
        plannedQty: parseInt(formPlannedQty) || 0,
        startDate: formStartDate || "TBD",
        targetDate: formTargetDate || "TBD",
        status: formPlanStatus as PlanStatus,
        assignedTeam: formTeam || "Unassigned",
        priority: formPriority as ProductionPlan["priority"],
        notes: formNotes,
      };
      setPlans((prev) => [newPlan, ...prev]);
      setToast({ message: `Plan ${newPlan.id} created successfully.`, type: "success" });
    }
    setIsEditPlanOpen(false);
  };

  // ==========================================
  // HANDLERS: Plan Actions
  // ==========================================
  const handleCancelPlan = (plan: ProductionPlan) => {
    setConfirmModal({
      isOpen: true,
      title: "Cancel Production Plan?",
      message: `Cancel plan ${plan.id} (${plan.product})? This action cannot be undone.`,
      variant: "danger",
      confirmText: "Cancel Plan",
      action: () => {
        setPlans((prev) => prev.map((p) => (p.id === plan.id ? { ...p, status: "Cancelled" as PlanStatus } : p)));
        setConfirmModal((prev) => ({ ...prev, isOpen: false }));
        setToast({ message: `Plan ${plan.id} cancelled.`, type: "success" });
      },
    });
  };

  // ==========================================
  // HANDLERS: Work Order Actions
  // ==========================================
  const handleUpdateWOStatus = (wo: WorkOrder, newStatus: WOStatus) => {
    setWorkOrders((prev) => prev.map((w) => (w.id === wo.id ? { ...w, status: newStatus, delayStatus: newStatus === "Delayed" ? "Delayed" as const : w.delayStatus } : w)));
    setToast({ message: `Work order ${wo.id} status updated to ${newStatus}.`, type: "success" });
  };

  const handleCloseWorkOrder = (wo: WorkOrder) => {
    setConfirmModal({
      isOpen: true,
      title: "Close Work Order?",
      message: `Close work order ${wo.id} (${wo.product})? It will be marked as completed.`,
      variant: "primary",
      confirmText: "Close Work Order",
      action: () => {
        setWorkOrders((prev) => prev.map((w) => (w.id === wo.id ? { ...w, status: "Completed" as WOStatus, progress: 100, delayStatus: "On track" as const } : w)));
        setConfirmModal((prev) => ({ ...prev, isOpen: false }));
        setToast({ message: `Work order ${wo.id} closed successfully.`, type: "success" });
      },
    });
  };

  // ==========================================
  // RENDER
  // ==========================================
  return (
    <>
      <AdminLayout>
        <div className="max-w-7xl mx-auto space-y-6 pb-20">
          {/* ============================================================
              PAGE HEADER
              ============================================================ */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Production</h1>
              <p className="text-xs font-medium text-slate-500 mt-1">
                Manage production plans, work orders, and monitor progress for this branch.
              </p>
            </div>
            <div className="flex items-center gap-3">
              <SecondaryButton onClick={() => setToast({ message: "Exporting production report...", type: "success" })} icon={Download}>Export</SecondaryButton>
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-full border border-amber-200 bg-amber-50 text-amber-800 text-xs font-semibold">
                <Lock size={12} />
                Branch: Manila (Locked)
              </div>
            </div>
          </div>

          {/* ============================================================
              KPI STATS CARDS
              ============================================================ */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <StatsCard title="Total Plans" value={stats.totalPlans} icon={ClipboardList} color="bg-indigo-500" />
            <StatsCard title="Active Work Orders" value={stats.activeWO} icon={Factory} color="bg-blue-500" />
            <StatsCard title="Delayed" value={stats.delayed} icon={AlertTriangle} color="bg-rose-500" />
            <StatsCard title="Completed This Month" value={stats.completedThisMonth} icon={CheckCircle} color="bg-emerald-500" />
          </div>

          {/* ============================================================
              TAB BAR (reusable TabBar with icons & counts)
              ============================================================ */}
          <TabBar tabs={PRODUCTION_TABS} activeTab={activeTab} onTabChange={setActiveTab} />

          {/* ============================================================
              TAB 1: PRODUCTION PLANS
              ============================================================ */}
          {activeTab === "plans" && (
            <Card className="overflow-hidden">
              <div className="px-5 pt-5">
                <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between mb-4">
                  <div className="flex items-center gap-3 flex-1 w-full sm:w-auto">
                    <TableToolbar
                      searchQuery={searchPlans}
                      setSearchQuery={setSearchPlans}
                      isFilterOpen={filterPlansOpen}
                      setIsFilterOpen={setFilterPlansOpen}
                      placeholder="Search Plan ID or Product..."
                      filterLabel={filterPlanStatus === "All Statuses" ? "All Statuses" : filterPlanStatus}
                    >
                      <div className="p-1.5" role="group" aria-label="Filter by Status">
                        {PLAN_STATUS_FILTERS.map((s) => (
                          <button key={s} role="option" aria-selected={filterPlanStatus === s} onClick={() => { setFilterPlanStatus(s); setFilterPlansOpen(false); }} className={`w-full text-left px-3 py-2 text-xs font-semibold rounded-lg transition-colors ${filterPlanStatus === s ? "bg-slate-100 text-slate-900" : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"}`}>{s}</button>
                        ))}
                      </div>
                    </TableToolbar>
                  </div>
                  <PrimaryButton onClick={openAddPlan} className="!w-auto !py-2.5 !px-4 !text-xs !rounded-full">
                    <Plus size={14} /> Create Plan
                  </PrimaryButton>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse" aria-label="Production Plans">
                  <thead className="bg-slate-50/80">
                    <tr>
                      <th className="px-6 py-3 text-[10px] font-bold text-slate-500 uppercase tracking-wider">Plan Info</th>
                      <th className="px-6 py-3 text-[10px] font-bold text-slate-500 uppercase tracking-wider hidden md:table-cell">Priority</th>
                      <th className="px-6 py-3 text-[10px] font-bold text-slate-500 uppercase tracking-wider">Qty</th>
                      <th className="px-6 py-3 text-[10px] font-bold text-slate-500 uppercase tracking-wider hidden md:table-cell">Schedule</th>
                      <th className="px-6 py-3 text-[10px] font-bold text-slate-500 uppercase tracking-wider">Status</th>
                      <th className="px-6 py-3 text-[10px] font-bold text-slate-500 uppercase tracking-wider text-left">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-sm">
                    {paginatedPlans.map((plan) => (
                      <tr key={plan.id} className="hover:bg-slate-50/50 transition-colors">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-400 shrink-0"><ClipboardList size={18} /></div>
                            <div className="min-w-0">
                              <div className="font-semibold text-slate-900 text-sm truncate">{plan.product}</div>
                              <div className="text-[11px] text-slate-500 font-mono mt-0.5">{plan.id} · {plan.assignedTeam}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 hidden md:table-cell">{getPriorityBadge(plan.priority)}</td>
                        <td className="px-6 py-4 text-sm font-bold text-slate-800">{plan.plannedQty}</td>
                        <td className="px-6 py-4 hidden md:table-cell">
                          <div className="text-xs text-slate-600">{plan.startDate}</div>
                          <div className="text-[10px] text-slate-400 mt-0.5">→ {plan.targetDate}</div>
                        </td>
                        <td className="px-6 py-4"><StatusBadge status={plan.status} /></td>
                        <td className="px-6 py-4 text-left">
                          <div className="flex justify-start items-center gap-1">
                            <button onClick={() => setDetailPlan(plan)} className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors" title="View Details"><Eye size={14} /></button>
                            <button onClick={() => openEditPlan(plan)} disabled={plan.status === "Cancelled"} className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors disabled:opacity-40 disabled:cursor-not-allowed" title="Edit"><Pencil size={14} /></button>
                            <button onClick={() => handleCancelPlan(plan)} disabled={plan.status === "Cancelled" || plan.status === "Completed"} className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors disabled:opacity-40 disabled:cursor-not-allowed" title="Cancel Plan"><XCircle size={14} /></button>
                            <button onClick={() => { setPlans(prev => prev.filter(p => p.id !== plan.id)); setToast({ message: `Plan ${plan.id} has been archived.`, type: "success" }); }} className="p-1.5 text-slate-400 hover:text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-900/20 rounded-lg transition-colors" title="Archive"><Archive size={14} /></button>
                          </div>
                        </td>
                      </tr>
                    ))}
                    {filteredPlans.length === 0 && (
                      <tr><td colSpan={6} className="px-6 py-16 text-center text-slate-400 text-sm"><div className="flex flex-col items-center gap-2"><ClipboardList size={32} className="text-slate-300" /><p className="font-medium">No production plans found</p><p className="text-xs">Try adjusting your search or filter criteria.</p></div></td></tr>
                    )}
                  </tbody>
                </table>
              </div>
              <Pagination currentPage={pagePlans} totalPages={plansTotalPages} startIndex={plansStart} endIndex={plansEnd} totalItems={filteredPlans.length} onPageChange={setPagePlans} />
            </Card>
          )}

          {/* ============================================================
              TAB 2: WORK ORDERS
              ============================================================ */}
          {activeTab === "orders" && (
            <Card className="overflow-hidden">
              <div className="px-5 pt-5">
                <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between mb-4">
                  <div className="flex items-center gap-3 flex-1 w-full sm:w-auto">
                    <TableToolbar
                      searchQuery={searchOrders}
                      setSearchQuery={setSearchOrders}
                      isFilterOpen={filterOrdersOpen}
                      setIsFilterOpen={setFilterOrdersOpen}
                      placeholder="Search WO Number or Product..."
                      filterLabel={filterWOStatus === "All Statuses" ? "All Statuses" : filterWOStatus}
                    >
                      <div className="p-1.5" role="group" aria-label="Filter by Status">
                        {WO_STATUS_FILTERS.map((s) => (
                          <button key={s} role="option" aria-selected={filterWOStatus === s} onClick={() => { setFilterWOStatus(s); setFilterOrdersOpen(false); }} className={`w-full text-left px-3 py-2 text-xs font-semibold rounded-lg transition-colors ${filterWOStatus === s ? "bg-slate-100 text-slate-900" : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"}`}>{s}</button>
                        ))}
                      </div>
                    </TableToolbar>
                  </div>
                  <PrimaryButton onClick={() => setToast({ message: "Create work order form coming soon.", type: "success" })} className="!w-auto !py-2.5 !px-4 !text-xs !rounded-full">
                    <Plus size={14} /> Create Work Order
                  </PrimaryButton>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse" aria-label="Work Orders">
                  <thead className="bg-slate-50/80">
                    <tr>
                      <th className="px-6 py-3 text-[10px] font-bold text-slate-500 uppercase tracking-wider">Work Order</th>
                      <th className="px-6 py-3 text-[10px] font-bold text-slate-500 uppercase tracking-wider hidden md:table-cell">Priority</th>
                      <th className="px-6 py-3 text-[10px] font-bold text-slate-500 uppercase tracking-wider">Qty</th>
                      <th className="px-6 py-3 text-[10px] font-bold text-slate-500 uppercase tracking-wider hidden md:table-cell">Schedule</th>
                      <th className="px-6 py-3 text-[10px] font-bold text-slate-500 uppercase tracking-wider">Status</th>
                      <th className="px-6 py-3 text-[10px] font-bold text-slate-500 uppercase tracking-wider text-left">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-sm">
                    {paginatedOrders.map((wo) => (
                      <tr key={wo.id} className="hover:bg-slate-50/50 transition-colors">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center text-blue-400 shrink-0"><Factory size={18} /></div>
                            <div className="min-w-0">
                              <div className="font-semibold text-slate-900 text-sm truncate">{wo.product}</div>
                              <div className="text-[11px] text-slate-500 font-mono mt-0.5">{wo.id} · Plan: {wo.linkedPlanId}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 hidden md:table-cell">{getPriorityBadge(wo.priority)}</td>
                        <td className="px-6 py-4 text-sm font-bold text-slate-800">{wo.quantity}</td>
                        <td className="px-6 py-4 hidden md:table-cell">
                          <div className="text-xs text-slate-600">{wo.startDate}</div>
                          <div className="text-[10px] text-slate-400 mt-0.5">→ {wo.endDate}</div>
                        </td>
                        <td className="px-6 py-4"><StatusBadge status={wo.status} /></td>
                        <td className="px-6 py-4 text-left">
                          <div className="flex justify-start items-center gap-1">
                            <button onClick={() => setDetailWO(wo)} className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors" title="View Details"><Eye size={14} /></button>
                            {wo.status === "Ongoing" && (
                              <>
                                <button onClick={() => handleUpdateWOStatus(wo, "Delayed")} className="p-1.5 text-slate-400 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-colors" title="Mark Delayed"><AlertTriangle size={14} /></button>
                                <button onClick={() => handleCloseWorkOrder(wo)} className="inline-flex items-center gap-1 whitespace-nowrap text-left px-2.5 py-1.5 text-xs font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 rounded-lg transition-colors" title="Close"><Square size={12} /> Close</button>
                              </>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                    {filteredOrders.length === 0 && (
                      <tr><td colSpan={6} className="px-6 py-16 text-center text-slate-400 text-sm"><div className="flex flex-col items-center gap-2"><Factory size={32} className="text-slate-300" /><p className="font-medium">No work orders found</p><p className="text-xs">Try adjusting your search or filter criteria.</p></div></td></tr>
                    )}
                  </tbody>
                </table>
              </div>
              <Pagination currentPage={pageOrders} totalPages={ordersTotalPages} startIndex={ordersStart} endIndex={ordersEnd} totalItems={filteredOrders.length} onPageChange={setPageOrders} />
            </Card>
          )}

          {/* ============================================================
              TAB 3: PROGRESS MONITORING
              ============================================================ */}
          {activeTab === "progress" && (
            <Card className="overflow-hidden">
              <div className="px-5 pt-5">
                <TableToolbar
                  searchQuery={searchProgress}
                  setSearchQuery={setSearchProgress}
                  isFilterOpen={filterProgressOpen}
                  setIsFilterOpen={setFilterProgressOpen}
                  placeholder="Search WO or Product..."
                  filterLabel="Filters"
                >
                  <div className="p-3 text-xs text-slate-500 italic">No additional filters available.</div>
                </TableToolbar>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse" aria-label="Progress Monitoring">
                  <thead className="bg-slate-50/80">
                    <tr>
                      <th className="px-6 py-3 text-[10px] font-bold text-slate-500 uppercase tracking-wider">Work Order</th>
                      <th className="px-6 py-3 text-[10px] font-bold text-slate-500 uppercase tracking-wider">Completion</th>
                      <th className="px-6 py-3 text-[10px] font-bold text-slate-500 uppercase tracking-wider hidden md:table-cell">Output vs Target</th>
                      <th className="px-6 py-3 text-[10px] font-bold text-slate-500 uppercase tracking-wider">Delay Status</th>
                      <th className="px-6 py-3 text-[10px] font-bold text-slate-500 uppercase tracking-wider">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-sm">
                    {paginatedProgress.map((wo) => (
                      <tr key={wo.id} className="hover:bg-slate-50/50 transition-colors">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${wo.delayStatus === "Delayed" ? "bg-rose-50 text-rose-400" : wo.delayStatus === "Warning" ? "bg-amber-50 text-amber-400" : "bg-emerald-50 text-emerald-400"}`}><BarChart3 size={18} /></div>
                            <div className="min-w-0">
                              <div className="font-semibold text-slate-900 text-sm truncate">{wo.product}</div>
                              <div className="text-[11px] text-slate-500 font-mono mt-0.5">{wo.id}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 w-44">
                          <div className="flex justify-between text-[11px] mb-1.5">
                            <span className="text-slate-500">Progress</span>
                            <span className="font-bold text-slate-800">{wo.progress}%</span>
                          </div>
                          <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                            <div className={`h-full rounded-full transition-all duration-500 ${getProgressBarColor(wo)}`} style={{ width: `${wo.progress}%` }} />
                          </div>
                        </td>
                        <td className="px-6 py-4 text-sm font-medium text-slate-700 hidden md:table-cell">{wo.outputVsTarget}</td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-medium ${wo.delayStatus === "Delayed" ? "bg-rose-50 text-rose-700" : wo.delayStatus === "Warning" ? "bg-amber-50 text-amber-700" : "bg-emerald-50 text-emerald-700"}`}>{wo.delayStatus}</span>
                        </td>
                        <td className="px-6 py-4"><StatusBadge status={wo.status} /></td>
                      </tr>
                    ))}
                    {filteredProgress.length === 0 && (
                      <tr><td colSpan={5} className="px-6 py-16 text-center text-slate-400 text-sm"><div className="flex flex-col items-center gap-2"><BarChart3 size={32} className="text-slate-300" /><p className="font-medium">No work orders to monitor</p><p className="text-xs">Try adjusting your search.</p></div></td></tr>
                    )}
                  </tbody>
                </table>
              </div>
              <Pagination currentPage={pageProgress} totalPages={progressTotalPages} startIndex={progressStart} endIndex={progressEnd} totalItems={filteredProgress.length} onPageChange={setPageProgress} />
            </Card>
          )}
        </div>
      </AdminLayout>

      {/* ==================================================================
          MODALS — Rendered outside AdminLayout (portals handle stacking)
          ================================================================== */}

      {/* ---- PLAN DETAIL MODAL (PageModal) ---- */}
      {detailPlan && (
        <PageModal
          isOpen={!!detailPlan}
          onClose={() => setDetailPlan(null)}
          title={detailPlan.product}
          badges={<><StatusBadge status={detailPlan.status} className="!text-[10px] !py-0.5" />{getPriorityBadge(detailPlan.priority)}</>}
          subtitle={<>Plan ID: {detailPlan.id} · {detailPlan.assignedTeam}</>}
          maxWidth="max-w-2xl"
          footer={
            <div className="flex justify-between items-center w-full">
              <SecondaryButton onClick={() => setDetailPlan(null)}>Close</SecondaryButton>
              <SecondaryButton onClick={() => { setDetailPlan(null); openEditPlan(detailPlan); }} icon={Pencil} disabled={detailPlan.status === "Cancelled"}>Edit Plan</SecondaryButton>
            </div>
          }
        >
          {/* Schedule */}
          <div>
            <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2 mb-3"><Calendar size={14} className="text-slate-400" /> Schedule</h4>
            <div className="grid grid-cols-2 gap-4 border-t border-slate-100 pt-4">
              <div className="space-y-1"><span className="flex items-center gap-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider"><Calendar size={10} /> Start Date</span><span className="text-sm font-semibold text-slate-700">{detailPlan.startDate}</span></div>
              <div className="space-y-1"><span className="flex items-center gap-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider"><Calendar size={10} /> Target Date</span><span className="text-sm font-semibold text-slate-700">{detailPlan.targetDate}</span></div>
              <div className="space-y-1"><span className="flex items-center gap-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider"><Hash size={10} /> Planned Quantity</span><span className="text-sm font-semibold text-slate-700">{detailPlan.plannedQty} units</span></div>
              <div className="space-y-1"><span className="flex items-center gap-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider"><User size={10} /> Assigned Team</span><span className="text-sm font-semibold text-slate-700">{detailPlan.assignedTeam}</span></div>
            </div>
          </div>

          {/* Notes */}
          <div>
            <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2 mb-3"><FileText size={14} className="text-slate-400" /> Notes</h4>
            <p className="text-sm text-slate-700 leading-relaxed bg-white border border-slate-200 rounded-xl p-4">{detailPlan.notes || "No notes available."}</p>
          </div>

          {/* Linked Work Orders */}
          <div>
            <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2 mb-3"><Factory size={14} className="text-slate-400" /> Linked Work Orders</h4>
            <div className="space-y-2">
              {workOrders.filter((w) => w.linkedPlanId === detailPlan.id).length > 0 ? (
                workOrders.filter((w) => w.linkedPlanId === detailPlan.id).map((wo) => (
                  <div key={wo.id} className="flex items-center justify-between p-3 bg-white border border-slate-200 rounded-xl">
                    <div className="flex items-center gap-3">
                      <span className="font-mono text-xs font-bold text-indigo-600">{wo.id}</span>
                      <span className="text-sm text-slate-700">{wo.product}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <StatusBadge status={wo.status} />
                      <span className="text-xs font-bold text-slate-500">{wo.progress}%</span>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-sm text-slate-400 italic py-4 text-center">No work orders linked to this plan.</p>
              )}
            </div>
          </div>
        </PageModal>
      )}

      {/* ---- WORK ORDER DETAIL MODAL (DetailsModal) ---- */}
      {detailWO && (
        <PageModal
          isOpen={!!detailWO}
          onClose={() => setDetailWO(null)}
          title={`Work Order ${detailWO.id}`}
          badges={<><StatusBadge status={detailWO.status} className="!text-[10px] !py-0.5" />{getPriorityBadge(detailWO.priority)}</>}
          subtitle={<>{detailWO.product} · Plan: {detailWO.linkedPlanId}</>}
          maxWidth="max-w-2xl"
        >
          {/* Progress Section */}
          <div>
            <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2 mb-3"><BarChart3 size={14} className="text-slate-400" /> Progress</h4>
            <div className="p-4 bg-white border border-slate-200 rounded-xl space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-slate-500">Completion</span>
                <span className="font-bold text-slate-900">{detailWO.progress}%</span>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
                <div className={`h-full rounded-full transition-all ${getProgressBarColor(detailWO)}`} style={{ width: `${detailWO.progress}%` }} />
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-500">Output vs Target</span>
                <span className="font-bold text-slate-900">{detailWO.outputVsTarget}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-500">Delay Status</span>
                <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-medium ${detailWO.delayStatus === "Delayed" ? "bg-rose-50 text-rose-700" : detailWO.delayStatus === "Warning" ? "bg-amber-50 text-amber-700" : "bg-emerald-50 text-emerald-700"}`}>{detailWO.delayStatus}</span>
              </div>
            </div>
          </div>

          {/* Details Grid */}
          <div>
            <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2 mb-3"><Package size={14} className="text-slate-400" /> Details</h4>
            <div className="grid grid-cols-2 gap-4 border-t border-slate-100 pt-4">
              <div className="space-y-1"><span className="flex items-center gap-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider"><Hash size={10} /> Quantity</span><span className="text-sm font-semibold text-slate-700">{detailWO.quantity} units</span></div>
              <div className="space-y-1"><span className="flex items-center gap-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider"><User size={10} /> Assigned To</span><span className="text-sm font-semibold text-slate-700">{detailWO.assignedTo}</span></div>
              <div className="space-y-1"><span className="flex items-center gap-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider"><Calendar size={10} /> Start Date</span><span className="text-sm font-semibold text-slate-700">{detailWO.startDate}</span></div>
              <div className="space-y-1"><span className="flex items-center gap-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider"><Calendar size={10} /> End Date</span><span className="text-sm font-semibold text-slate-700">{detailWO.endDate}</span></div>
            </div>
          </div>

          {/* Notes */}
          <div>
            <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2 mb-3"><Clock size={14} className="text-slate-400" /> Production Notes</h4>
            <p className="text-sm text-slate-700 leading-relaxed bg-white border border-slate-200 rounded-xl p-4">{detailWO.notes || "No notes available."}</p>
          </div>
        </PageModal>
      )}

      {/* ---- EDIT/ADD PLAN FORM MODAL (PageModal + InputGroup + IconSelect) ---- */}
      <PageModal
        isOpen={isEditPlanOpen}
        onClose={() => setIsEditPlanOpen(false)}
        title={editingPlan ? "Edit Production Plan" : "Create Production Plan"}
        subtitle={editingPlan ? `Editing ${editingPlan.id}` : "Create a new production plan for this branch."}
        maxWidth="max-w-lg"
        footer={
          <div className="flex justify-end items-center gap-2 w-full">
            <SecondaryButton onClick={() => setIsEditPlanOpen(false)}>Cancel</SecondaryButton>
            <PrimaryButton onClick={handleSavePlan} className="!w-auto !py-2.5 !px-6 !text-xs !rounded-full">
              {editingPlan ? "Save Changes" : "Create Plan"}
            </PrimaryButton>
          </div>
        }
      >
        <InputGroup id="plan-product" label="Product *" placeholder="e.g. Classic Denim Jacket" icon={Package} value={formProduct} onChange={(e) => setFormProduct(e.target.value)} />
        <div className="grid grid-cols-2 gap-4">
          <InputGroup id="plan-qty" label="Planned Quantity *" type="number" placeholder="e.g. 200" icon={Hash} value={formPlannedQty} onChange={(e) => setFormPlannedQty(e.target.value)} />
          <InputGroup id="plan-team" label="Assigned Team" placeholder="e.g. Production Team A" icon={User} value={formTeam} onChange={(e) => setFormTeam(e.target.value)} />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <InputGroup id="plan-start" label="Start Date" placeholder="e.g. Feb 15, 2026" icon={Calendar} value={formStartDate} onChange={(e) => setFormStartDate(e.target.value)} />
          <InputGroup id="plan-target" label="Target Date" placeholder="e.g. Feb 28, 2026" icon={Calendar} value={formTargetDate} onChange={(e) => setFormTargetDate(e.target.value)} />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <IconSelect label="Status" value={formPlanStatus} onChange={setFormPlanStatus} options={PLAN_STATUS_OPTIONS} placeholder="Select status" />
          <IconSelect label="Priority" value={formPriority} onChange={setFormPriority} options={PRIORITY_OPTIONS} placeholder="Select priority" />
        </div>
        <div className="flex flex-col gap-1.5">
          <label htmlFor="plan-notes" className="text-xs font-semibold text-slate-500 tracking-wide">Notes</label>
          <textarea id="plan-notes" rows={3} placeholder="Production notes..." value={formNotes} onChange={(e) => setFormNotes(e.target.value)} className="w-full px-4 py-3 text-sm font-medium bg-white/50 backdrop-blur-sm border border-slate-200 rounded-xl outline-none transition-all focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 placeholder:text-slate-400 hover:border-slate-300 resize-none" />
        </div>
        <div className="flex items-center gap-2 px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl">
          <Lock size={14} className="text-slate-400" />
          <span className="text-xs font-semibold text-slate-500">Branch: Manila (Fixed)</span>
        </div>
      </PageModal>

      {/* ---- CONFIRMATION MODAL ---- */}
      <ConfirmationModal
        isOpen={confirmModal.isOpen}
        onClose={() => setConfirmModal((prev) => ({ ...prev, isOpen: false }))}
        onConfirm={confirmModal.action}
        title={confirmModal.title}
        message={confirmModal.message}
        variant={confirmModal.variant}
        confirmText={confirmModal.confirmText}
      />

      {/* ---- TOAST ---- */}
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </>
  );
};

export default AdminProductionPage;
