// ==========================================
// ProductionPage.tsx — Production Control
// Super Admin overview for cross-branch
// monitoring of active production lines,
// bottlenecks, and output efficiency.
// ==========================================

import { useState, useMemo } from "react";
import {
  Factory,
  Hammer,
  AlertTriangle,
  CheckCircle,
  StopCircle,
  RotateCcw,
  BarChart3,
  Calendar,
  Download,
  ShieldAlert,
  Eye,
  GitBranch,
  Clock,
  Package,
  User,
} from "lucide-react";

// ------------------------------------------
// Layout & Reusable UI Components
// ------------------------------------------
import MainLayout from "../../layout/MainLayout";
import { Card } from "../../components/ui/Card";
import StatsCard from "../../components/ui/StatsCard";
import { StatusBadge } from "../../components/ui/StatusBadge";
import { TableToolbar } from "../../components/ui/TableToolbar";
import Pagination from "../../components/ui/Pagination";
import SecondaryButton from "../../components/ui/SecondaryButton";
import ConfirmationModal from "../../components/ui/ConfirmationModal";
import PageModal from "../../components/ui/PageModal";
import ViewGapModal from "../../components/ui/ViewGapModal";
import Toast from "../../components/ui/Toast";

// ==========================================
// Types
// ==========================================
type WOStatus =
  | "Scheduled"
  | "In Progress"
  | "Completed"
  | "Cancelled"
  | "Delayed";

interface WorkOrder {
  id: string;
  woNumber: string;
  productName: string;
  sku: string;
  branch: string;
  startDate: string;
  dueDate: string;
  quantityPlanned: number;
  quantityProduced: number;
  status: WOStatus;
  efficiency: number; // Percentage (0–100)
  materials: { name: string; required: string; consumed: string }[];
}

// ==========================================
// Mock Data
// ==========================================
const MOCK_WORK_ORDERS: WorkOrder[] = [
  {
    id: "WO-1001",
    woNumber: "WO-2026-045",
    productName: "Classic Denim Jacket",
    sku: "DNM-JKT-001",
    branch: "Manila Main",
    startDate: "Feb 01, 2026",
    dueDate: "Feb 15, 2026",
    quantityPlanned: 500,
    quantityProduced: 120,
    status: "Delayed",
    efficiency: 65,
    materials: [
      { name: "Denim Fabric", required: "1000m", consumed: "300m" },
      { name: "Buttons", required: "3000 pcs", consumed: "600 pcs" },
    ],
  },
  {
    id: "WO-1002",
    woNumber: "WO-2026-046",
    productName: "Cotton Basic Tee",
    sku: "TEE-WHT-S",
    branch: "Cebu Factory",
    startDate: "Feb 05, 2026",
    dueDate: "Feb 10, 2026",
    quantityPlanned: 2000,
    quantityProduced: 2000,
    status: "Completed",
    efficiency: 98,
    materials: [
      { name: "Cotton Fabric", required: "1500m", consumed: "1480m" },
    ],
  },
  {
    id: "WO-1003",
    woNumber: "WO-2026-048",
    productName: "Silk Scarf",
    sku: "ACC-SLK-009",
    branch: "Davao Hub",
    startDate: "Feb 10, 2026",
    dueDate: "Feb 20, 2026",
    quantityPlanned: 300,
    quantityProduced: 50,
    status: "In Progress",
    efficiency: 92,
    materials: [{ name: "Silk", required: "400m", consumed: "60m" }],
  },
  {
    id: "WO-1004",
    woNumber: "WO-2026-049",
    productName: "Canvas Tote",
    sku: "BAG-TOT-001",
    branch: "Manila Main",
    startDate: "Feb 12, 2026",
    dueDate: "Feb 14, 2026",
    quantityPlanned: 150,
    quantityProduced: 0,
    status: "Scheduled",
    efficiency: 0,
    materials: [],
  },
  {
    id: "WO-1005",
    woNumber: "WO-2026-050",
    productName: "Polo Shirt Classic",
    sku: "PLO-BLU-M",
    branch: "Cebu Factory",
    startDate: "Feb 03, 2026",
    dueDate: "Feb 09, 2026",
    quantityPlanned: 1200,
    quantityProduced: 1200,
    status: "Completed",
    efficiency: 96,
    materials: [
      { name: "Pique Cotton", required: "900m", consumed: "880m" },
      { name: "Buttons", required: "2400 pcs", consumed: "2400 pcs" },
    ],
  },
  {
    id: "WO-1006",
    woNumber: "WO-2026-051",
    productName: "Cargo Utility Pants",
    sku: "CRG-PNT-KHK",
    branch: "Manila Main",
    startDate: "Feb 08, 2026",
    dueDate: "Feb 18, 2026",
    quantityPlanned: 800,
    quantityProduced: 340,
    status: "In Progress",
    efficiency: 88,
    materials: [
      { name: "Twill Fabric", required: "1200m", consumed: "500m" },
      { name: "Zippers", required: "800 pcs", consumed: "340 pcs" },
    ],
  },
  {
    id: "WO-1007",
    woNumber: "WO-2026-052",
    productName: "Winter Parka Jacket",
    sku: "WNT-PRK-BLK",
    branch: "Davao Hub",
    startDate: "Feb 15, 2026",
    dueDate: "Mar 01, 2026",
    quantityPlanned: 250,
    quantityProduced: 0,
    status: "Scheduled",
    efficiency: 0,
    materials: [],
  },
];

// ------------------------------------------
// Pagination Constants
// ------------------------------------------
const ITEMS_PER_PAGE = 5;

// ==========================================
// Main Component
// ==========================================
function ProductionPage() {
  // ------------------------------------------
  // State: Data & Filtering
  // ------------------------------------------
  const [workOrders, setWorkOrders] =
    useState<WorkOrder[]>(MOCK_WORK_ORDERS);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("All");
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);

  // ------------------------------------------
  // State: Manage Modal (Work Order detail view)
  // ------------------------------------------
  const [selectedWO, setSelectedWO] = useState<WorkOrder | null>(null);

  // ------------------------------------------
  // State: Material Gap Modal
  // Shows material shortage detail for a WO
  // ------------------------------------------
  const [gapWO, setGapWO] = useState<WorkOrder | null>(null);

  // ------------------------------------------
  // State: Toast & Confirmation Modal
  // ------------------------------------------
  const [toast, setToast] = useState<{
    message: string;
    type: "success" | "error";
  } | null>(null);

  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    action: () => void;
    variant: "primary" | "danger";
    confirmText: string;
  }>({
    isOpen: false,
    title: "",
    message: "",
    action: () => {},
    variant: "primary",
    confirmText: "Confirm",
  });

  // ------------------------------------------
  // Computed: KPI Metrics
  // Used by StatsCard components in the header
  // ------------------------------------------
  const metrics = useMemo(() => {
    const total = workOrders.length;
    const active = workOrders.filter(
      (w) => w.status === "In Progress" || w.status === "Scheduled",
    ).length;
    const delayed = workOrders.filter((w) => w.status === "Delayed").length;
    const completed = workOrders.filter(
      (w) => w.status === "Completed",
    ).length;

    // Avg Efficiency (excluding scheduled orders with 0%)
    const activeOrDone = workOrders.filter((w) => w.status !== "Scheduled");
    const avgEfficiency =
      activeOrDone.length > 0
        ? Math.round(
            activeOrDone.reduce((acc, curr) => acc + curr.efficiency, 0) /
              activeOrDone.length,
          )
        : 0;

    return { total, active, delayed, completed, avgEfficiency };
  }, [workOrders]);

  // ------------------------------------------
  // Computed: Filtered Work Orders
  // Matches search query and status filter
  // ------------------------------------------
  const filteredWOs = useMemo(() => {
    return workOrders.filter((wo) => {
      const matchesSearch =
        wo.woNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
        wo.productName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        wo.branch.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesStatus =
        filterStatus === "All" || wo.status === filterStatus;
      return matchesSearch && matchesStatus;
    });
  }, [workOrders, searchQuery, filterStatus]);

  // ------------------------------------------
  // Computed: Pagination
  // Slices filteredWOs for the current page
  // ------------------------------------------
  const totalPages = Math.max(
    1,
    Math.ceil(filteredWOs.length / ITEMS_PER_PAGE),
  );
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = Math.min(startIndex + ITEMS_PER_PAGE, filteredWOs.length);
  const paginatedWOs = filteredWOs.slice(startIndex, endIndex);

  // ------------------------------------------
  // Handler: Toast
  // ------------------------------------------
  const triggerToast = (message: string, type: "success" | "error") => {
    setToast({ message, type });
  };

  // ------------------------------------------
  // Handler: Export
  // ------------------------------------------
  const handleExport = () => {
    triggerToast("Exporting Production Log...", "success");
  };

  // ------------------------------------------
  // Handler: Update Work Order status
  // Also updates selectedWO if viewing that order
  // ------------------------------------------
  const updateWOStatus = (id: string, newStatus: WOStatus) => {
    setWorkOrders((prev) =>
      prev.map((w) => (w.id === id ? { ...w, status: newStatus } : w)),
    );
    setSelectedWO((prev) =>
      prev && prev.id === id ? { ...prev, status: newStatus } : prev,
    );
  };

  // ------------------------------------------
  // Handler: Force Complete (Super Admin)
  // Marks WO as Completed regardless of quantity
  // ------------------------------------------
  const handleForceComplete = (wo: WorkOrder) => {
    setConfirmModal({
      isOpen: true,
      title: "Force Complete Work Order?",
      message: `You are manually marking ${wo.woNumber} as Completed. This overrides pending quantity checks. Reason: 'Admin Override'.`,
      variant: "primary",
      confirmText: "Force Complete",
      action: () => {
        updateWOStatus(wo.id, "Completed");
        setConfirmModal((prev) => ({ ...prev, isOpen: false }));
        triggerToast(`Work Order ${wo.woNumber} force completed.`, "success");
      },
    });
  };

  // ------------------------------------------
  // Handler: Cancel Production (Super Admin)
  // Halts all operations and releases materials
  // ------------------------------------------
  const handleCancelProduction = (wo: WorkOrder) => {
    setConfirmModal({
      isOpen: true,
      title: "Cancel Production Run?",
      message:
        "This will halt all operations for this Work Order and release reserved materials. This action cannot be undone.",
      variant: "danger",
      confirmText: "Cancel Order",
      action: () => {
        updateWOStatus(wo.id, "Cancelled");
        setConfirmModal((prev) => ({ ...prev, isOpen: false }));
        triggerToast(`Work Order ${wo.woNumber} cancelled.`, "success");
      },
    });
  };

  // ------------------------------------------
  // Handler: Reopen Work Order (Super Admin)
  // Moves order back to In Progress
  // ------------------------------------------
  const handleReopen = (wo: WorkOrder) => {
    setConfirmModal({
      isOpen: true,
      title: "Reopen Work Order?",
      message:
        "This will move the order back to 'In Progress'. Ensure resources are still available.",
      variant: "primary",
      confirmText: "Reopen",
      action: () => {
        updateWOStatus(wo.id, "In Progress");
        setConfirmModal((prev) => ({ ...prev, isOpen: false }));
        triggerToast(`Work Order ${wo.woNumber} reopened.`, "success");
      },
    });
  };

  // ------------------------------------------
  // Helper: Calculate progress percentage
  // ------------------------------------------
  const getProgress = (wo: WorkOrder) =>
    wo.quantityPlanned > 0
      ? Math.round((wo.quantityProduced / wo.quantityPlanned) * 100)
      : 0;

  // ------------------------------------------
  // Helper: Progress bar color based on status
  // ------------------------------------------
  const getProgressColor = (wo: WorkOrder) => {
    if (wo.status === "Delayed") return "bg-rose-500";
    if (wo.status === "Completed") return "bg-emerald-500";
    return "bg-indigo-500";
  };

  // ==========================================
  // RENDER
  // ==========================================
  return (
    <>
      {/* ==========================================
          MAIN LAYOUT — Page content only
          All modals are rendered OUTSIDE MainLayout
          so their fixed backdrop covers the entire
          viewport (including sidebar).
          ========================================== */}
      <MainLayout>
        <div className="max-w-7xl mx-auto space-y-6 pb-20">
          {/* ==========================================
              SECTION 1: PAGE HEADER
              Title (no icon) + Subtitle + Export Button
              ========================================== */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <h1 className="text-3xl font-bold text-slate-900 tracking-tight">
                Production Control
              </h1>
              <p className="text-xs font-medium text-slate-500 mt-1">
                Cross-branch monitoring of active lines, bottlenecks, and
                output efficiency.
              </p>
            </div>

            {/* Export Button — uses SecondaryButton for consistent rounded-full design */}
            <SecondaryButton
              onClick={handleExport}
              icon={Download}
              ariaLabel="Export Production Log"
            >
              Export Production Log
            </SecondaryButton>
          </div>

          {/* ==========================================
              SECTION 2: KPI STATS CARDS
              Uses StatsCard component for consistent look
              ========================================== */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <StatsCard
              title="Active Jobs"
              value={metrics.active}
              icon={Hammer}
              color="bg-blue-500"
            />
            <StatsCard
              title="Delayed / At Risk"
              value={metrics.delayed}
              icon={AlertTriangle}
              color="bg-rose-500"
            />
            <StatsCard
              title="Avg Efficiency"
              value={`${metrics.avgEfficiency}%`}
              icon={BarChart3}
              color="bg-emerald-500"
            />
            <StatsCard
              title="Completed (Period)"
              value={metrics.completed}
              icon={CheckCircle}
              color="bg-indigo-500"
            />
          </div>

          {/* ==========================================
              SECTION 3: WORK ORDERS TABLE
              Card wraps toolbar, table, and pagination
              ========================================== */}
          <Card className="overflow-hidden">
            {/* 3a. TableToolbar — Search & Status Filter inside the Card */}
            <div className="px-5 pt-5">
              <TableToolbar
                searchQuery={searchQuery}
                setSearchQuery={(q) => {
                  setSearchQuery(q);
                  setCurrentPage(1);
                }}
                isFilterOpen={isFilterOpen}
                setIsFilterOpen={setIsFilterOpen}
                placeholder="Search WO #, Product, or Branch..."
                filterLabel={
                  filterStatus === "All" ? "All Statuses" : filterStatus
                }
              >
                {/* Status filter options — rendered inside TableToolbar's dropdown */}
                <div
                  className="p-1.5"
                  role="group"
                  aria-label="Filter by Status"
                >
                  {[
                    "All",
                    "In Progress",
                    "Delayed",
                    "Scheduled",
                    "Completed",
                    "Cancelled",
                  ].map((status) => (
                    <button
                      key={status}
                      role="option"
                      aria-selected={filterStatus === status}
                      onClick={() => {
                        setFilterStatus(status);
                        setIsFilterOpen(false);
                        setCurrentPage(1);
                      }}
                      className={`w-full text-left px-3 py-2 text-xs font-semibold rounded-lg transition-colors ${
                        filterStatus === status
                          ? "bg-slate-100 text-slate-900"
                          : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                      }`}
                    >
                      {status === "All" ? "All Statuses" : status}
                    </button>
                  ))}
                </div>
              </TableToolbar>
            </div>

            {/* 3b. Work Orders Data Table */}
            <div className="overflow-x-auto">
              <table
                className="w-full text-left border-collapse"
                aria-label="Production Work Orders"
              >
                {/* Table Header — text-xs (12px) font-bold for column titles */}
                <thead className="bg-slate-50/80">
                  <tr>
                    <th className="px-6 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider">
                      Order Details
                    </th>
                    <th className="px-6 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider">
                      Timeline & Branch
                    </th>
                    <th className="px-6 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider">
                      Progress
                    </th>
                    <th className="px-6 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider text-left">
                      Actions
                    </th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-100 text-sm">
                  {paginatedWOs.map((wo) => {
                    const progress = getProgress(wo);

                    return (
                      <tr
                        key={wo.id}
                        className="hover:bg-slate-50/50 transition-colors"
                      >
                        {/* Order Details: Product name, WO number, SKU */}
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-400 flex-shrink-0">
                              <Package size={18} />
                            </div>
                            <div>
                              <div className="font-semibold text-slate-900 text-sm">
                                {wo.productName}
                              </div>
                              <div className="text-[11px] text-slate-500 font-mono mt-0.5">
                                {wo.woNumber}
                              </div>
                              <div className="text-[10px] text-slate-400 mt-0.5">
                                SKU: {wo.sku}
                              </div>
                            </div>
                          </div>
                        </td>

                        {/* Timeline & Branch */}
                        <td className="px-6 py-4">
                          <div className="text-sm font-medium text-slate-700">
                            {wo.branch}
                          </div>
                          <div className="text-[11px] text-slate-500 flex items-center gap-1 mt-0.5">
                            <Calendar size={11} /> Due: {wo.dueDate}
                          </div>
                        </td>

                        {/* Progress: Bar with quantity count */}
                        <td className="px-6 py-4 w-48">
                          <div className="flex justify-between text-[11px] mb-1.5">
                            <span className="text-slate-500">
                              {wo.quantityProduced.toLocaleString()} /{" "}
                              {wo.quantityPlanned.toLocaleString()}
                            </span>
                            <span className="font-bold text-slate-800">
                              {progress}%
                            </span>
                          </div>
                          <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                            <div
                              className={`h-full rounded-full transition-all duration-500 ${getProgressColor(wo)}`}
                              style={{ width: `${progress}%` }}
                            />
                          </div>
                        </td>

                        {/* Status — uses StatusBadge */}
                        <td className="px-6 py-4">
                          <StatusBadge status={wo.status} />
                        </td>

                        {/* Actions: Manage button with Eye icon */}
                        <td className="px-6 py-4 text-left">
                          <button
                            onClick={() => setSelectedWO(wo)}
                            className="inline-flex items-center gap-1 whitespace-nowrap text-left.5 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors"
                            aria-label={`Manage WO ${wo.woNumber}`}
                          >
                            <Eye size={14} />
                            Manage
                          </button>
                        </td>
                      </tr>
                    );
                  })}

                  {/* Empty State */}
                  {filteredWOs.length === 0 && (
                    <tr>
                      <td
                        colSpan={5}
                        className="px-6 py-16 text-center text-slate-400 text-sm"
                      >
                        <div className="flex flex-col items-center gap-2">
                          <Factory size={32} className="text-slate-300" />
                          <p className="font-medium">
                            No work orders found
                          </p>
                          <p className="text-xs">
                            Try adjusting your search or filter criteria.
                          </p>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* 3c. Pagination — renders at the bottom of the Card */}
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              startIndex={startIndex}
              endIndex={endIndex}
              totalItems={filteredWOs.length}
              onPageChange={setCurrentPage}
            />
          </Card>
        </div>
      </MainLayout>

      {/* ==========================================
          MODALS — Rendered OUTSIDE MainLayout
          so their fixed backdrop + blur covers the
          entire viewport (including sidebar).
          Ordered bottom-to-top by z-index priority:
            1. Manage Modal (z-50)
            2. Material Gap DetailsModal (z-50, later DOM = on top)
            3. ConfirmationModal (z-50, last DOM = topmost)
            4. Toast (always on top)
          ========================================== */}

      {/* ---- SECTION 4: MANAGE WORK ORDER MODAL ---- */}
      {/* Centered modal for WO governance, metrics, materials */}
      {selectedWO && (
        <PageModal
          isOpen={!!selectedWO}
          onClose={() => setSelectedWO(null)}
          title={selectedWO.woNumber}
          badges={<StatusBadge status={selectedWO.status} className="!text-[10px] !py-0.5" />}
          subtitle={<>{selectedWO.productName} &bull; SKU: {selectedWO.sku}</>}
          ariaId="manage-modal-title"
        >
          {/* A. Super Admin Governance Zone */}
              {/* Highlighted section for admin-only override actions */}
              <div className="bg-slate-50 border border-indigo-100 rounded-xl p-5 relative overflow-hidden">
                <div className="absolute top-0 left-0 w-1 h-full bg-indigo-500" />
                <h3 className="text-xs font-bold text-indigo-900 uppercase tracking-wider flex items-center gap-2 mb-2">
                  <ShieldAlert size={14} />
                  Admin Intervention
                </h3>
                <p className="text-[11px] text-slate-500 mb-4">
                  These actions override standard workflow rules. All
                  interventions are logged in the audit trail.
                </p>

                {/* Governance action buttons — uses SecondaryButton */}
                <div className="flex flex-wrap gap-2">
                  <SecondaryButton
                    onClick={() => handleForceComplete(selectedWO)}
                    disabled={
                      selectedWO.status === "Completed" ||
                      selectedWO.status === "Cancelled"
                    }
                    icon={CheckCircle}
                    className="!px-3 !py-2 !text-[11px]"
                  >
                    Force Complete
                  </SecondaryButton>
                  <SecondaryButton
                    onClick={() => handleCancelProduction(selectedWO)}
                    disabled={
                      selectedWO.status === "Completed" ||
                      selectedWO.status === "Cancelled"
                    }
                    icon={StopCircle}
                    className="!px-3 !py-2 !text-[11px]"
                  >
                    Cancel Order
                  </SecondaryButton>
                  <SecondaryButton
                    onClick={() => handleReopen(selectedWO)}
                    disabled={
                      selectedWO.status === "In Progress" ||
                      selectedWO.status === "Scheduled"
                    }
                    icon={RotateCcw}
                    className="!px-3 !py-2 !text-[11px]"
                  >
                    Reopen Order
                  </SecondaryButton>
                </div>
              </div>

              {/* B. Production Metrics — output progress & efficiency */}
              <div>
                <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2 mb-3">
                  <BarChart3 size={14} className="text-slate-400" />
                  Production Metrics
                </h4>
                <div className="grid grid-cols-2 gap-4">
                  {/* Output Progress */}
                  <div className="p-4 bg-white border border-slate-200 rounded-xl">
                    <span className="flex items-center gap-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                      <Package size={10} /> Output Progress
                    </span>
                    <div className="mt-2 flex items-baseline gap-1">
                      <span className="text-lg font-bold text-slate-900">
                        {selectedWO.quantityProduced.toLocaleString()}
                      </span>
                      <span className="text-xs text-slate-500">
                        / {selectedWO.quantityPlanned.toLocaleString()} pcs
                      </span>
                    </div>
                    {/* Progress bar inside modal */}
                    <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden mt-2">
                      <div
                        className={`h-full rounded-full transition-all ${getProgressColor(selectedWO)}`}
                        style={{
                          width: `${getProgress(selectedWO)}%`,
                        }}
                      />
                    </div>
                  </div>

                  {/* Efficiency Rate */}
                  <div className="p-4 bg-white border border-slate-200 rounded-xl">
                    <span className="flex items-center gap-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                      <BarChart3 size={10} /> Efficiency Rate
                    </span>
                    <div className="mt-2 flex items-baseline gap-1">
                      <span
                        className={`text-lg font-bold ${
                          selectedWO.efficiency < 80
                            ? "text-rose-600"
                            : "text-emerald-600"
                        }`}
                      >
                        {selectedWO.efficiency}%
                      </span>
                    </div>
                    {/* Efficiency indicator */}
                    <p className="text-[10px] mt-1.5 font-medium">
                      {selectedWO.efficiency >= 90 ? (
                        <span className="text-emerald-600">
                          Excellent performance
                        </span>
                      ) : selectedWO.efficiency >= 80 ? (
                        <span className="text-blue-600">
                          On target
                        </span>
                      ) : selectedWO.efficiency > 0 ? (
                        <span className="text-rose-600">
                          Below target — review required
                        </span>
                      ) : (
                        <span className="text-slate-400">
                          Not started
                        </span>
                      )}
                    </p>
                  </div>
                </div>
              </div>

              {/* C. Material Utilization — read-only table */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                    <Factory size={14} className="text-slate-400" />
                    Material Utilization
                  </h4>
                  {/* View Gap button — opens material gap detail modal */}
                  {selectedWO.materials.length > 0 && (
                    <button
                      onClick={() => setGapWO(selectedWO)}
                      className="inline-flex items-center gap-1 whitespace-nowrap text-left text-[11px] font-bold text-indigo-600 hover:text-indigo-800 hover:bg-indigo-50 px-2 py-1 rounded-lg transition-colors"
                    >
                      <Eye size={12} />
                      View Gap
                    </button>
                  )}
                </div>
                <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
                  <table className="w-full text-sm text-left">
                    <thead className="bg-slate-50/80">
                      <tr>
                        <th className="px-4 py-2.5 text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                          Material
                        </th>
                        <th className="px-4 py-2.5 text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                          Planned
                        </th>
                        <th className="px-4 py-2.5 text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                          Consumed
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {selectedWO.materials.length > 0 ? (
                        selectedWO.materials.map((mat, idx) => (
                          <tr key={idx}>
                            <td className="px-4 py-2.5 font-medium text-slate-800 text-xs">
                              {mat.name}
                            </td>
                            <td className="px-4 py-2.5 text-slate-600 text-xs">
                              {mat.required}
                            </td>
                            <td className="px-4 py-2.5 text-slate-600 text-xs">
                              {mat.consumed}
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td
                            colSpan={3}
                            className="px-4 py-6 text-center text-slate-400 text-xs italic"
                          >
                            No material data linked to this order.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* D. Audit Info — timeline and branch metadata */}
              <div>
                <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2 mb-3">
                  <Clock size={14} className="text-slate-400" />
                  Timeline & Audit
                </h4>
                <div className="grid grid-cols-2 gap-4 text-sm border-t border-slate-100 pt-4">
                  <div className="space-y-1">
                    <span className="flex items-center gap-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                      <GitBranch size={10} /> Branch
                    </span>
                    <span className="text-sm font-semibold text-slate-700">
                      {selectedWO.branch}
                    </span>
                  </div>
                  <div className="space-y-1">
                    <span className="flex items-center gap-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                      <Calendar size={10} /> Start Date
                    </span>
                    <span className="text-sm font-semibold text-slate-700">
                      {selectedWO.startDate}
                    </span>
                  </div>
                  <div className="space-y-1">
                    <span className="flex items-center gap-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                      <Calendar size={10} /> Due Date
                    </span>
                    <span className="text-sm font-semibold text-slate-700">
                      {selectedWO.dueDate}
                    </span>
                  </div>
                  <div className="space-y-1">
                    <span className="flex items-center gap-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                      <User size={10} /> Last Updated
                    </span>
                    <span className="text-sm font-semibold text-slate-700">
                      Just now
                    </span>
                  </div>
                </div>
              </div>
          </PageModal>
      )}

      {/* ---- MATERIAL GAP DETAILS MODAL ---- */}
      {/* Renders AFTER manage modal so it stacks on top when both are open */}
      <ViewGapModal
        isOpen={!!gapWO}
        onClose={() => setGapWO(null)}
        title="Material Gap Analysis"
        itemId={gapWO?.woNumber || ""}
        headerIcon={
          <div className="p-2 bg-amber-50 rounded-xl">
            <AlertTriangle size={20} className="text-amber-600" />
          </div>
        }
        fields={[
          {
            label: "Product",
            value: gapWO?.productName || "",
            icon: Package,
          },
          {
            label: "Branch",
            value: gapWO?.branch || "",
            icon: GitBranch,
          },
          {
            label: "Status",
            value: gapWO ? <StatusBadge status={gapWO.status} /> : "",
            icon: Factory,
          },
          {
            label: "Due Date",
            value: gapWO?.dueDate || "",
            icon: Calendar,
          },
        ]}
      >
        {/* Material Gap Breakdown */}
        <div className="space-y-3">
          <p className="text-xs font-bold text-slate-700 uppercase tracking-wider">
            Material Consumption vs. Requirements
          </p>
          {gapWO && gapWO.materials.length > 0 ? (
            <div className="space-y-2">
              {gapWO.materials.map((mat, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between bg-white border border-slate-100 rounded-lg px-3 py-2"
                >
                  <span className="text-sm font-medium text-slate-700">
                    {mat.name}
                  </span>
                  <div className="text-xs text-slate-500">
                    <span className="font-semibold text-slate-800">
                      {mat.consumed}
                    </span>{" "}
                    / {mat.required}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-slate-500 italic">
              No material data available.
            </p>
          )}
          <div className="mt-3 flex items-center gap-2 text-xs text-amber-700 bg-amber-50 border border-amber-100 rounded-lg px-3 py-2">
            <AlertTriangle size={12} />
            <span className="font-medium">
              Review material consumption to identify shortages before the due
              date.
            </span>
          </div>
        </div>
      </ViewGapModal>

      {/* ---- CONFIRMATION MODAL ---- */}
      {/* Renders LAST so it always appears on top of everything */}
      <ConfirmationModal
        isOpen={confirmModal.isOpen}
        onClose={() => setConfirmModal((prev) => ({ ...prev, isOpen: false }))}
        onConfirm={confirmModal.action}
        title={confirmModal.title}
        message={confirmModal.message}
        variant={confirmModal.variant}
        confirmText={confirmModal.confirmText}
      />

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

export default ProductionPage;
