// ==========================================
// WarehousePage.tsx — Warehouse Governance
// Super Admin overview for global inventory
// visibility, negative stock correction,
// and high-value adjustment approvals.
// ==========================================

import { useState, useMemo } from "react";
import {
  Package,
  AlertTriangle,
  TrendingDown,
  AlertOctagon,
  ShieldCheck,
  History,
  Download,
  DollarSign,
  ClipboardList,
  CheckCircle,
  Ban,
  Eye,
  GitBranch,
  Calendar,
  User,
  BarChart2,
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
type StockStatus = "Good" | "Low" | "Critical" | "Negative";
type MovementType = "In" | "Out" | "Transfer" | "Adjustment";

interface StockMovement {
  id: string;
  type: MovementType;
  quantity: number;
  date: string;
  user: string;
  reason: string;
}

interface InventoryItem {
  id: string;
  name: string;
  sku: string;
  category: "Raw Material" | "Finished Good";
  branch: string;
  quantity: number;
  safetyStock: number;
  unitPrice: number;
  status: StockStatus;
  lastUpdated: string;
  pendingAdjustment?: {
    id: string;
    qtyChange: number;
    reason: string;
    requestedBy: string;
  } | null;
  history: StockMovement[];
}

// ==========================================
// Mock Data
// ==========================================
const MOCK_INVENTORY: InventoryItem[] = [
  {
    id: "INV-001",
    name: "Denim Fabric Roll (Indigo)",
    sku: "MAT-DNM-IND",
    category: "Raw Material",
    branch: "Manila Main",
    quantity: -15,
    safetyStock: 100,
    unitPrice: 15.5,
    status: "Negative",
    lastUpdated: "Feb 11, 2026",
    pendingAdjustment: null,
    history: [
      {
        id: "MV-101",
        type: "Out",
        quantity: 200,
        date: "Feb 10",
        user: "Sys",
        reason: "Production WO-99",
      },
    ],
  },
  {
    id: "INV-002",
    name: "Cotton Thread (White)",
    sku: "MAT-THR-WHT",
    branch: "Cebu Factory",
    category: "Raw Material",
    quantity: 45,
    safetyStock: 50,
    unitPrice: 2.1,
    status: "Low",
    lastUpdated: "Feb 09, 2026",
    pendingAdjustment: {
      id: "ADJ-999",
      qtyChange: 500,
      reason: "Supplier Bonus (Unverified)",
      requestedBy: "J. Doe",
    },
    history: [],
  },
  {
    id: "INV-003",
    name: "Classic Denim Jacket (M)",
    sku: "PRD-DNM-JKT-M",
    branch: "Davao Hub",
    category: "Finished Good",
    quantity: 120,
    safetyStock: 20,
    unitPrice: 45.0,
    status: "Good",
    lastUpdated: "Feb 12, 2026",
    pendingAdjustment: null,
    history: [],
  },
  {
    id: "INV-004",
    name: "Metal Buttons (Silver)",
    sku: "MAT-BTN-SLV",
    branch: "Manila Main",
    category: "Raw Material",
    quantity: 5,
    safetyStock: 200,
    unitPrice: 0.15,
    status: "Critical",
    lastUpdated: "Feb 08, 2026",
    pendingAdjustment: null,
    history: [],
  },
  {
    id: "INV-005",
    name: "Pique Cotton Fabric (Blue)",
    sku: "MAT-PQE-BLU",
    branch: "Cebu Factory",
    category: "Raw Material",
    quantity: 310,
    safetyStock: 150,
    unitPrice: 8.75,
    status: "Good",
    lastUpdated: "Feb 10, 2026",
    pendingAdjustment: null,
    history: [
      {
        id: "MV-102",
        type: "In",
        quantity: 200,
        date: "Feb 09",
        user: "Warehouse A",
        reason: "Supplier delivery PO-445",
      },
    ],
  },
  {
    id: "INV-006",
    name: "YKK Zippers (Black 7in)",
    sku: "MAT-ZIP-BLK7",
    branch: "Manila Main",
    category: "Raw Material",
    quantity: 82,
    safetyStock: 100,
    unitPrice: 0.45,
    status: "Low",
    lastUpdated: "Feb 07, 2026",
    pendingAdjustment: null,
    history: [],
  },
  {
    id: "INV-007",
    name: "Cotton Basic Tee (L)",
    sku: "PRD-TEE-WHT-L",
    branch: "Davao Hub",
    category: "Finished Good",
    quantity: 540,
    safetyStock: 50,
    unitPrice: 12.0,
    status: "Good",
    lastUpdated: "Feb 11, 2026",
    pendingAdjustment: null,
    history: [
      {
        id: "MV-103",
        type: "Transfer",
        quantity: 100,
        date: "Feb 11",
        user: "Logistics",
        reason: "Branch transfer to Manila",
      },
    ],
  },
];

// ------------------------------------------
// Pagination Constants
// ------------------------------------------
const ITEMS_PER_PAGE = 5;

// ==========================================
// Main Component
// ==========================================
function WarehousePage() {
  // ------------------------------------------
  // State: Data & Filtering
  // ------------------------------------------
  const [inventory, setInventory] = useState<InventoryItem[]>(MOCK_INVENTORY);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterBranch, setFilterBranch] = useState<string>("All");
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);

  // ------------------------------------------
  // State: Audit/Manage Modal
  // ------------------------------------------
  const [selectedItem, setSelectedItem] = useState<InventoryItem | null>(null);

  // ------------------------------------------
  // State: View Gap Modal (Stock level gap)
  // ------------------------------------------
  const [gapItem, setGapItem] = useState<InventoryItem | null>(null);

  // ------------------------------------------
  // State: Review Queue Modal
  // Shows all items with pending adjustments
  // ------------------------------------------
  const [showReviewQueue, setShowReviewQueue] = useState(false);

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
  // ------------------------------------------
  const metrics = useMemo(() => {
    const totalItems = inventory.length;
    const negativeStock = inventory.filter((i) => i.quantity < 0).length;
    const lowStock = inventory.filter(
      (i) => i.status === "Low" || i.status === "Critical",
    ).length;
    const pendingApprovals = inventory.filter(
      (i) => i.pendingAdjustment !== null,
    ).length;
    const totalValuation = inventory.reduce((acc, item) => {
      const qty = item.quantity > 0 ? item.quantity : 0;
      return acc + qty * item.unitPrice;
    }, 0);

    return { totalItems, negativeStock, lowStock, pendingApprovals, totalValuation };
  }, [inventory]);

  // ------------------------------------------
  // Computed: Filtered Inventory
  // ------------------------------------------
  const filteredItems = useMemo(() => {
    return inventory.filter((item) => {
      const matchesSearch =
        item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.sku.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.branch.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesBranch =
        filterBranch === "All" || item.branch === filterBranch;
      return matchesSearch && matchesBranch;
    });
  }, [inventory, searchQuery, filterBranch]);

  // ------------------------------------------
  // Computed: Pagination
  // ------------------------------------------
  const totalPages = Math.max(
    1,
    Math.ceil(filteredItems.length / ITEMS_PER_PAGE),
  );
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = Math.min(startIndex + ITEMS_PER_PAGE, filteredItems.length);
  const paginatedItems = filteredItems.slice(startIndex, endIndex);

  // ------------------------------------------
  // Computed: Items with pending adjustments
  // Used by the Review Queue modal
  // ------------------------------------------
  const pendingItems = useMemo(
    () => inventory.filter((i) => i.pendingAdjustment !== null),
    [inventory],
  );

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
    triggerToast("Exporting Valuation Report...", "success");
  };

  // ------------------------------------------
  // Handler: Update inventory item
  // ------------------------------------------
  const updateItem = (id: string, updates: Partial<InventoryItem>) => {
    setInventory((prev) =>
      prev.map((i) => (i.id === id ? { ...i, ...updates } : i)),
    );
    setSelectedItem((prev) =>
      prev && prev.id === id ? { ...prev, ...updates } : prev,
    );
  };

  // ------------------------------------------
  // Handler: Fix Negative Stock (Reset to 0)
  // ------------------------------------------
  const handleFixNegativeStock = (item: InventoryItem) => {
    setConfirmModal({
      isOpen: true,
      title: "Correct Negative Inventory?",
      message: `This will reset the stock count of ${item.sku} from ${item.quantity} to 0. A 'System Correction' log will be generated.`,
      variant: "danger",
      confirmText: "Reset to Zero",
      action: () => {
        updateItem(item.id, { quantity: 0, status: "Critical" });
        setConfirmModal((prev) => ({ ...prev, isOpen: false }));
        triggerToast(`Inventory corrected for ${item.sku}.`, "success");
      },
    });
  };

  // ------------------------------------------
  // Handler: Approve Pending Adjustment
  // ------------------------------------------
  const handleApproveAdjustment = (item: InventoryItem) => {
    if (!item.pendingAdjustment) return;
    const newQty = item.quantity + item.pendingAdjustment.qtyChange;

    setConfirmModal({
      isOpen: true,
      title: "Approve Large Adjustment?",
      message: `You are approving a change of ${item.pendingAdjustment.qtyChange > 0 ? "+" : ""}${item.pendingAdjustment.qtyChange} units. New Total: ${newQty}.`,
      variant: "primary",
      confirmText: "Approve",
      action: () => {
        updateItem(item.id, {
          quantity: newQty,
          pendingAdjustment: null,
          status:
            newQty <= 0
              ? "Critical"
              : newQty < item.safetyStock
                ? "Low"
                : "Good",
        });
        setConfirmModal((prev) => ({ ...prev, isOpen: false }));
        triggerToast(`Adjustment approved for ${item.sku}.`, "success");
      },
    });
  };

  // ------------------------------------------
  // Handler: Reject Pending Adjustment
  // ------------------------------------------
  const handleRejectAdjustment = (item: InventoryItem) => {
    setConfirmModal({
      isOpen: true,
      title: "Reject Adjustment Request?",
      message: "The pending adjustment will be discarded.",
      variant: "danger",
      confirmText: "Reject",
      action: () => {
        updateItem(item.id, { pendingAdjustment: null });
        setConfirmModal((prev) => ({ ...prev, isOpen: false }));
        triggerToast("Adjustment request rejected.", "success");
      },
    });
  };

  // ------------------------------------------
  // Helper: Stock level bar color
  // ------------------------------------------
  const getStockBarColor = (item: InventoryItem) => {
    if (item.quantity < 0) return "bg-rose-500";
    if (item.status === "Critical") return "bg-orange-500";
    if (item.status === "Low") return "bg-amber-500";
    return "bg-emerald-500";
  };

  // ------------------------------------------
  // Helper: Stock level percentage (clamped 0–100)
  // ------------------------------------------
  const getStockPercent = (item: InventoryItem) => {
    if (item.safetyStock <= 0) return item.quantity > 0 ? 100 : 0;
    const pct = Math.round((item.quantity / item.safetyStock) * 100);
    return Math.max(0, Math.min(pct, 100));
  };

  // ==========================================
  // RENDER
  // ==========================================
  return (
    <>
      {/* ==========================================
          MAIN LAYOUT — Page content only
          All modals rendered OUTSIDE MainLayout
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
                Warehouse Governance
              </h1>
              <p className="text-xs font-medium text-slate-500 mt-1">
                Global inventory visibility, negative stock correction, and
                high-value approvals.
              </p>
            </div>

            {/* Export Button — uses SecondaryButton for consistent rounded-full design */}
            <SecondaryButton
              onClick={handleExport}
              icon={Download}
              ariaLabel="Export Valuation Report"
            >
              Export Report
            </SecondaryButton>
          </div>

          {/* ==========================================
              SECTION 2: KPI STATS CARDS
              Uses StatsCard component for consistent look
              ========================================== */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <StatsCard
              title="Total Valuation"
              value={`$${metrics.totalValuation.toLocaleString(undefined, { minimumFractionDigits: 2 })}`}
              icon={DollarSign}
              color="bg-indigo-500"
            />
            <StatsCard
              title="Negative Stock"
              value={metrics.negativeStock}
              icon={AlertOctagon}
              color="bg-rose-500"
            />
            <StatsCard
              title="Low Stock Alerts"
              value={metrics.lowStock}
              icon={TrendingDown}
              color="bg-amber-500"
            />
            <StatsCard
              title="Pending Approvals"
              value={metrics.pendingApprovals}
              icon={ShieldCheck}
              color="bg-blue-500"
            />
          </div>

          {/* ==========================================
              SECTION 3: GOVERNANCE QUEUE BANNER
              Shows only when there are pending adjustments
              ========================================== */}
          {metrics.pendingApprovals > 0 && (
            <Card className="!border-blue-200 !bg-blue-50/50">
              <div className="p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-100 rounded-xl text-blue-600">
                    <ClipboardList size={20} />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-blue-900">
                      Governance Action Required
                    </h3>
                    <p className="text-xs text-blue-700">
                      You have {metrics.pendingApprovals} stock adjustment
                      {metrics.pendingApprovals > 1 ? "s" : ""} waiting for
                      Super Admin approval.
                    </p>
                  </div>
                </div>
                <SecondaryButton
                  onClick={() => setShowReviewQueue(true)}
                  icon={Eye}
                  className="!px-3 !py-2 !text-[11px]"
                >
                  Review Queue
                </SecondaryButton>
              </div>
            </Card>
          )}

          {/* ==========================================
              SECTION 4: INVENTORY TABLE
              Card wraps toolbar, table, and pagination
              ========================================== */}
          <Card className="overflow-hidden">
            {/* 4a. TableToolbar — Search & Branch Filter inside the Card */}
            <div className="px-5 pt-5">
              <TableToolbar
                searchQuery={searchQuery}
                setSearchQuery={(q) => {
                  setSearchQuery(q);
                  setCurrentPage(1);
                }}
                isFilterOpen={isFilterOpen}
                setIsFilterOpen={setIsFilterOpen}
                placeholder="Search SKU, Name, or Branch..."
                filterLabel={
                  filterBranch === "All" ? "All Branches" : filterBranch
                }
              >
                {/* Branch filter options */}
                <div
                  className="p-1.5"
                  role="group"
                  aria-label="Filter by Branch"
                >
                  {[
                    "All",
                    "Manila Main",
                    "Cebu Factory",
                    "Davao Hub",
                  ].map((branch) => (
                    <button
                      key={branch}
                      role="option"
                      aria-selected={filterBranch === branch}
                      onClick={() => {
                        setFilterBranch(branch);
                        setIsFilterOpen(false);
                        setCurrentPage(1);
                      }}
                      className={`w-full text-left px-3 py-2 text-xs font-semibold rounded-lg transition-colors ${
                        filterBranch === branch
                          ? "bg-slate-100 text-slate-900"
                          : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                      }`}
                    >
                      {branch === "All" ? "All Branches" : branch}
                    </button>
                  ))}
                </div>
              </TableToolbar>
            </div>

            {/* 4b. Inventory Data Table */}
            <div className="overflow-x-auto">
              <table
                className="w-full text-left border-collapse"
                aria-label="Inventory List"
              >
                {/* Table Header — text-xs (12px) font-bold */}
                <thead className="bg-slate-50/80">
                  <tr>
                    <th className="px-6 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider">
                      Item Details
                    </th>
                    <th className="px-6 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider">
                      Branch
                    </th>
                    <th className="px-6 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider">
                      Stock Level
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
                  {paginatedItems.map((item) => (
                    <tr
                      key={item.id}
                      className="hover:bg-slate-50/50 transition-colors"
                    >
                      {/* Item Details: Name, SKU, category pill */}
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-400 flex-shrink-0">
                            <Package size={18} />
                          </div>
                          <div>
                            <div className="font-semibold text-slate-900 text-sm">
                              {item.name}
                            </div>
                            <div className="text-[11px] text-slate-500 font-mono mt-0.5">
                              {item.sku}
                            </div>
                            <span className="inline-flex mt-1 text-[10px] px-2 py-0.5 bg-slate-100 text-slate-600 rounded-full font-medium">
                              {item.category}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Branch & Last Updated */}
                      <td className="px-6 py-4">
                        <div className="text-sm font-medium text-slate-700">
                          {item.branch}
                        </div>
                        <div className="text-[11px] text-slate-500 mt-0.5">
                          Updated: {item.lastUpdated}
                        </div>
                      </td>

                      {/* Stock Level — quantity with progress bar */}
                      <td className="px-6 py-4 w-44">
                        <div className="flex justify-between text-[11px] mb-1.5">
                          <span
                            className={`font-bold ${item.quantity < 0 ? "text-rose-600" : "text-slate-800"}`}
                          >
                            {item.quantity.toLocaleString()}
                          </span>
                          <span className="text-slate-400">
                            / {item.safetyStock.toLocaleString()}
                          </span>
                        </div>
                        <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all duration-500 ${getStockBarColor(item)}`}
                            style={{
                              width: `${getStockPercent(item)}%`,
                            }}
                          />
                        </div>
                      </td>

                      {/* Status — uses StatusBadge + pending approval pill */}
                      <td className="px-6 py-4">
                        <div className="flex flex-col gap-1.5">
                          <StatusBadge status={item.status} />
                          {item.pendingAdjustment && (
                            <span className="inline-flex items-center gap-1 whitespace-nowrap text-left text-[10px] font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-full w-fit">
                              <ShieldCheck size={10} /> Approval Needed
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Actions: Audit/Manage button with Eye icon */}
                      <td className="px-6 py-4 text-left">
                        <button
                          onClick={() => setSelectedItem(item)}
                          className="inline-flex items-center gap-1 whitespace-nowrap text-left.5 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors"
                          aria-label={`Audit ${item.sku}`}
                        >
                          <Eye size={14} />
                          Manage
                        </button>
                      </td>
                    </tr>
                  ))}

                  {/* Empty State */}
                  {filteredItems.length === 0 && (
                    <tr>
                      <td
                        colSpan={5}
                        className="px-6 py-16 text-center text-slate-400 text-sm"
                      >
                        <div className="flex flex-col items-center gap-2">
                          <Package size={32} className="text-slate-300" />
                          <p className="font-medium">No items found</p>
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

            {/* 4c. Pagination */}
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              startIndex={startIndex}
              endIndex={endIndex}
              totalItems={filteredItems.length}
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
            1. Audit/Manage Modal (z-50)
            2. View Gap / Review Queue DetailsModal (z-50, later DOM)
            3. ConfirmationModal (z-50, last DOM = topmost)
            4. Toast (always on top)
          ========================================== */}

      {/* ---- SECTION 5: AUDIT/MANAGE MODAL ---- */}
      {/* Centered modal for inventory governance, stock info, movements */}
      {selectedItem && (
        <PageModal
          isOpen={!!selectedItem}
          onClose={() => setSelectedItem(null)}
          title={selectedItem.sku}
          badges={<StatusBadge status={selectedItem.status} className="!text-[10px] !py-0.5" />}
          subtitle={<>{selectedItem.name} &bull; {selectedItem.category}</>}
          ariaId="audit-modal-title"
        >
              {/* A. Governance Zone — only shows when action needed */}
              {(selectedItem.status === "Negative" ||
                selectedItem.pendingAdjustment) && (
                <div className="bg-slate-50 border border-indigo-100 rounded-xl p-5 relative overflow-hidden">
                  <div className="absolute top-0 left-0 w-1 h-full bg-indigo-500" />
                  <h3 className="text-xs font-bold text-indigo-900 uppercase tracking-wider flex items-center gap-2 mb-2">
                    <ShieldCheck size={14} />
                    Super Admin Governance
                  </h3>
                  <p className="text-[11px] text-slate-500 mb-4">
                    Critical actions require your approval. All interventions
                    are logged.
                  </p>

                  <div className="space-y-3">
                    {/* Negative Stock Alert */}
                    {selectedItem.quantity < 0 && (
                      <div className="flex items-center justify-between bg-rose-50 p-3 rounded-xl border border-rose-100">
                        <div>
                          <p className="text-sm font-bold text-rose-800">
                            Negative Stock Anomaly
                          </p>
                          <p className="text-[11px] text-rose-600">
                            Current Qty: {selectedItem.quantity}. System data
                            integrity risk.
                          </p>
                        </div>
                        <SecondaryButton
                          onClick={() =>
                            handleFixNegativeStock(selectedItem)
                          }
                          icon={AlertTriangle}
                          className="!px-3 !py-2 !text-[11px] !border-rose-200 !text-rose-700 hover:!bg-rose-50"
                        >
                          Reset to Zero
                        </SecondaryButton>
                      </div>
                    )}

                    {/* Pending Adjustment */}
                    {selectedItem.pendingAdjustment && (
                      <div className="bg-blue-50 p-4 rounded-xl border border-blue-100">
                        <p className="text-sm font-bold text-blue-900">
                          Pending Adjustment Request
                        </p>
                        <p className="text-[11px] text-blue-700 mt-1">
                          User{" "}
                          <strong>
                            {selectedItem.pendingAdjustment.requestedBy}
                          </strong>{" "}
                          requests change:{" "}
                          <span className="font-mono font-bold">
                            {selectedItem.pendingAdjustment.qtyChange > 0
                              ? "+"
                              : ""}
                            {selectedItem.pendingAdjustment.qtyChange}
                          </span>
                        </p>
                        <p className="text-[11px] text-blue-600 italic mt-1">
                          &quot;{selectedItem.pendingAdjustment.reason}&quot;
                        </p>
                        <div className="flex gap-2 mt-3">
                          <SecondaryButton
                            onClick={() =>
                              handleApproveAdjustment(selectedItem)
                            }
                            icon={CheckCircle}
                            className="!px-3 !py-2 !text-[11px] flex-1"
                          >
                            Approve
                          </SecondaryButton>
                          <SecondaryButton
                            onClick={() =>
                              handleRejectAdjustment(selectedItem)
                            }
                            icon={Ban}
                            className="!px-3 !py-2 !text-[11px] !border-rose-200 !text-rose-600 flex-1"
                          >
                            Reject
                          </SecondaryButton>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* B. Stock Info — physical stock & financial value */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                    <BarChart2 size={14} className="text-slate-400" />
                    Stock Information
                  </h4>
                  <button
                    onClick={() => setGapItem(selectedItem)}
                    className="inline-flex items-center gap-1 whitespace-nowrap text-left text-[11px] font-bold text-indigo-600 hover:text-indigo-800 hover:bg-indigo-50 px-2 py-1 rounded-lg transition-colors"
                  >
                    <Eye size={12} />
                    View Gap
                  </button>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 bg-white border border-slate-200 rounded-xl">
                    <span className="flex items-center gap-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                      <Package size={10} /> Physical Stock
                    </span>
                    <p
                      className={`text-xl font-bold mt-2 ${selectedItem.quantity < 0 ? "text-rose-600" : "text-slate-900"}`}
                    >
                      {selectedItem.quantity.toLocaleString()}
                    </p>
                    <p className="text-[10px] text-slate-400 mt-1">
                      Safety Stock: {selectedItem.safetyStock.toLocaleString()}
                    </p>
                  </div>
                  <div className="p-4 bg-white border border-slate-200 rounded-xl">
                    <span className="flex items-center gap-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                      <DollarSign size={10} /> Financial Value
                    </span>
                    <p className="text-xl font-bold text-slate-900 mt-2">
                      $
                      {(
                        Math.max(0, selectedItem.quantity) *
                        selectedItem.unitPrice
                      ).toLocaleString(undefined, {
                        minimumFractionDigits: 2,
                      })}
                    </p>
                    <p className="text-[10px] text-slate-400 mt-1">
                      @ ${selectedItem.unitPrice} / unit
                    </p>
                  </div>
                </div>
              </div>

              {/* C. Movement History */}
              <div>
                <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2 mb-3">
                  <History size={14} className="text-slate-400" />
                  Recent Movements
                </h4>
                <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
                  <table className="w-full text-sm text-left">
                    <thead className="bg-slate-50/80">
                      <tr>
                        <th className="px-4 py-2.5 text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                          Type
                        </th>
                        <th className="px-4 py-2.5 text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                          Qty
                        </th>
                        <th className="px-4 py-2.5 text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                          Details
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {selectedItem.history.length > 0 ? (
                        selectedItem.history.map((move) => (
                          <tr key={move.id}>
                            <td className="px-4 py-2.5">
                              <StatusBadge
                                status={move.type}
                                className="!text-[10px] !py-0.5 !px-2"
                              />
                            </td>
                            <td className="px-4 py-2.5 font-mono text-xs text-slate-700">
                              {move.quantity.toLocaleString()}
                            </td>
                            <td className="px-4 py-2.5">
                              <div className="text-xs text-slate-800">
                                {move.reason}
                              </div>
                              <div className="text-[10px] text-slate-400">
                                {move.date} by {move.user}
                              </div>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td
                            colSpan={3}
                            className="px-4 py-6 text-center text-slate-400 text-xs italic"
                          >
                            No recent movement logs.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* D. Item Metadata */}
              <div>
                <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2 mb-3">
                  <ClipboardList size={14} className="text-slate-400" />
                  Item Details
                </h4>
                <div className="grid grid-cols-2 gap-4 text-sm border-t border-slate-100 pt-4">
                  <div className="space-y-1">
                    <span className="flex items-center gap-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                      <GitBranch size={10} /> Branch
                    </span>
                    <span className="text-sm font-semibold text-slate-700">
                      {selectedItem.branch}
                    </span>
                  </div>
                  <div className="space-y-1">
                    <span className="flex items-center gap-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                      <Calendar size={10} /> Last Updated
                    </span>
                    <span className="text-sm font-semibold text-slate-700">
                      {selectedItem.lastUpdated}
                    </span>
                  </div>
                  <div className="space-y-1">
                    <span className="flex items-center gap-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                      <Package size={10} /> Category
                    </span>
                    <span className="text-sm font-semibold text-slate-700">
                      {selectedItem.category}
                    </span>
                  </div>
                  <div className="space-y-1">
                    <span className="flex items-center gap-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                      <User size={10} /> ID
                    </span>
                    <span className="text-sm font-semibold text-slate-700 font-mono">
                      {selectedItem.id}
                    </span>
                  </div>
                </div>
              </div>
        </PageModal>
      )}

      {/* ---- VIEW GAP DETAILS MODAL ---- */}
      {/* Shows stock level gap analysis for an inventory item */}
      <ViewGapModal
        isOpen={!!gapItem}
        onClose={() => setGapItem(null)}
        title="Stock Level Gap Analysis"
        itemId={gapItem?.sku || ""}
        headerIcon={
          <div className="p-2 bg-amber-50 rounded-xl">
            <AlertTriangle size={20} className="text-amber-600" />
          </div>
        }
        fields={[
          {
            label: "Item",
            value: gapItem?.name || "",
            icon: Package,
          },
          {
            label: "Branch",
            value: gapItem?.branch || "",
            icon: GitBranch,
          },
          {
            label: "Status",
            value: gapItem ? (
              <StatusBadge status={gapItem.status} />
            ) : (
              ""
            ),
            icon: BarChart2,
          },
          {
            label: "Category",
            value: gapItem?.category || "",
            icon: Package,
          },
        ]}
      >
        <div className="space-y-3">
          <p className="text-xs font-bold text-slate-700 uppercase tracking-wider">
            Stock vs Safety Stock
          </p>
          {gapItem && (
            <>
              <div className="flex items-center justify-between bg-white border border-slate-100 rounded-lg px-3 py-2">
                <span className="text-sm font-medium text-slate-700">
                  Current Stock
                </span>
                <span
                  className={`text-sm font-bold ${gapItem.quantity < 0 ? "text-rose-600" : "text-slate-800"}`}
                >
                  {gapItem.quantity.toLocaleString()} units
                </span>
              </div>
              <div className="flex items-center justify-between bg-white border border-slate-100 rounded-lg px-3 py-2">
                <span className="text-sm font-medium text-slate-700">
                  Safety Stock Target
                </span>
                <span className="text-sm font-bold text-slate-800">
                  {gapItem.safetyStock.toLocaleString()} units
                </span>
              </div>
              <div className="flex items-center justify-between bg-white border border-slate-100 rounded-lg px-3 py-2">
                <span className="text-sm font-medium text-slate-700">
                  Gap / Surplus
                </span>
                <span
                  className={`text-sm font-bold ${
                    gapItem.quantity >= gapItem.safetyStock
                      ? "text-emerald-600"
                      : "text-rose-600"
                  }`}
                >
                  {gapItem.quantity >= gapItem.safetyStock
                    ? `+${(gapItem.quantity - gapItem.safetyStock).toLocaleString()} surplus`
                    : `${(gapItem.quantity - gapItem.safetyStock).toLocaleString()} deficit`}
                </span>
              </div>
              {gapItem.quantity < gapItem.safetyStock && (
                <div className="mt-3 flex items-center gap-2 text-xs text-amber-700 bg-amber-50 border border-amber-100 rounded-lg px-3 py-2">
                  <AlertTriangle size={12} />
                  <span className="font-medium">
                    Stock is below safety threshold. Replenishment recommended.
                  </span>
                </div>
              )}
            </>
          )}
        </div>
      </ViewGapModal>

      {/* ---- REVIEW QUEUE MODAL ---- */}
      {/* Shows all items with pending adjustments for bulk review */}
      <PageModal
        isOpen={showReviewQueue}
        onClose={() => setShowReviewQueue(false)}
        title="Adjustment Review Queue"
        subtitle={<>{pendingItems.length} pending approval{pendingItems.length !== 1 ? "s" : ""}</>}
        badges={
          <div className="p-2 bg-blue-50 rounded-xl">
            <ClipboardList size={20} className="text-blue-600" />
          </div>
        }
        maxWidth="max-w-lg"
        ariaId="review-queue-title"
        footer={<SecondaryButton onClick={() => setShowReviewQueue(false)}>Close</SecondaryButton>}
      >
        <div className="space-y-3">
          {pendingItems.length > 0 ? (
                pendingItems.map((item) => (
                  <div
                    key={item.id}
                    className="bg-white border border-slate-200 rounded-xl p-4 space-y-3"
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="text-sm font-semibold text-slate-900">
                          {item.name}
                        </p>
                        <p className="text-[11px] text-slate-500 font-mono">
                          {item.sku} &bull; {item.branch}
                        </p>
                      </div>
                      <StatusBadge
                        status={item.status}
                        className="!text-[10px] !py-0.5"
                      />
                    </div>
                    {item.pendingAdjustment && (
                      <>
                        <div className="bg-blue-50 rounded-lg px-3 py-2 text-xs text-blue-800">
                          <span className="font-bold">
                            {item.pendingAdjustment.requestedBy}
                          </span>{" "}
                          requests{" "}
                          <span className="font-mono font-bold">
                            {item.pendingAdjustment.qtyChange > 0
                              ? "+"
                              : ""}
                            {item.pendingAdjustment.qtyChange}
                          </span>{" "}
                          units &mdash;{" "}
                          <span className="italic">
                            &quot;{item.pendingAdjustment.reason}&quot;
                          </span>
                        </div>
                        <div className="flex gap-2">
                          <SecondaryButton
                            onClick={() => {
                              handleApproveAdjustment(item);
                              setShowReviewQueue(false);
                            }}
                            icon={CheckCircle}
                            className="!px-3 !py-1.5 !text-[11px] flex-1"
                          >
                            Approve
                          </SecondaryButton>
                          <SecondaryButton
                            onClick={() => {
                              handleRejectAdjustment(item);
                              setShowReviewQueue(false);
                            }}
                            icon={Ban}
                            className="!px-3 !py-1.5 !text-[11px] !border-rose-200 !text-rose-600 flex-1"
                          >
                            Reject
                          </SecondaryButton>
                        </div>
                      </>
                    )}
                  </div>
                ))
              ) : (
                <div className="py-8 text-center text-slate-400 text-sm">
                  <CheckCircle size={28} className="mx-auto text-emerald-400 mb-2" />
                  <p className="font-medium">All clear</p>
                  <p className="text-xs">No pending adjustments to review.</p>
                </div>
              )}
        </div>
      </PageModal>

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

export default WarehousePage;
