// ==========================================
// AdminWarehousePage.tsx — Branch Admin Warehouse
// 3 tabs: Inventory | Stock Movements | Adjustment Approvals
// Branch scope only — Manila branch.
//
// Reusable UI: TabBar, TableToolbar, PageModal,
//   ConfirmationModal, Toast, InputGroup, IconSelect,
//   StatsCard, StatusBadge, Card, Pagination, Buttons
// ==========================================

import { useState, useMemo, useEffect } from "react";

// --- Layout ---
import AdminLayout from "../../layout/AdminLayout";

// --- Icons ---
import {
  Package,
  AlertTriangle,
  ClipboardList,
  DollarSign,
  Eye,
  Pencil,
  Plus,
  History,
  CheckCircle,
  XCircle,
  Lock,
  Calendar,
  User,
  Hash,
  ArrowUpRight,
  ArrowDownRight,
  ArrowLeftRight,
  Download,
  Layers,
  BarChart2,
  FileText,
  Tag,
  Archive,
} from "lucide-react";

// --- Reusable UI Components ---
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
import ConfirmationModal from "../../components/ui/ConfirmationModal";
import Toast from "../../components/ui/Toast";
import InputGroup from "../../components/ui/InputGroup";
import IconSelect from "../../components/ui/IconSelect";
import type { IconSelectOption } from "../../components/ui/IconSelect";

// ==========================================
// TYPES
// ==========================================

type InventoryStatus = "Good" | "Low" | "Critical";
type MovementType = "In" | "Out" | "Transfer";
type AdjustmentStatus = "Pending" | "Approved" | "Rejected";

interface InventoryItem {
  id: number;
  sku: string;
  name: string;
  category: string;
  quantity: number;
  minimumLevel: number;
  status: InventoryStatus;
  unitPrice: number;
  location: string;
  lastRestocked: string;
  supplier: string;
}

interface StockMovementRow {
  id: string;
  type: MovementType;
  materialName: string;
  materialSku: string;
  quantity: number;
  date: string;
  user: string;
  reference: string;
  notes: string;
}

interface AdjustmentRow {
  id: string;
  materialName: string;
  materialSku: string;
  currentQty: number;
  requestedChange: number;
  reason: string;
  requestedBy: string;
  date: string;
  status: AdjustmentStatus;
}

// ==========================================
// MOCK DATA (enriched for detail modals)
// ==========================================

const INVENTORY_MOCK: InventoryItem[] = [
  { id: 1, sku: "FAB-DNM-001", name: "Denim Fabric Roll", category: "Fabrics", quantity: 45, minimumLevel: 30, status: "Good", unitPrice: 850, location: "Rack A-12", lastRestocked: "Feb 10, 2026", supplier: "Manila Textiles Co." },
  { id: 2, sku: "THR-COT-205", name: "Cotton Thread Spool", category: "Threads", quantity: 12, minimumLevel: 25, status: "Critical", unitPrice: 45, location: "Shelf B-03", lastRestocked: "Jan 28, 2026", supplier: "Thread World Inc." },
  { id: 3, sku: "ZIP-MET-350", name: "Metal Zipper 12\"", category: "Fasteners", quantity: 28, minimumLevel: 20, status: "Low", unitPrice: 120, location: "Bin C-07", lastRestocked: "Feb 5, 2026", supplier: "ZipTech Philippines" },
  { id: 4, sku: "BTN-PLA-100", name: "Plastic Button Set", category: "Fasteners", quantity: 150, minimumLevel: 50, status: "Good", unitPrice: 15, location: "Bin C-08", lastRestocked: "Feb 8, 2026", supplier: "Button House PH" },
  { id: 5, sku: "FAB-COT-500", name: "Cotton Fabric Roll", category: "Fabrics", quantity: 8, minimumLevel: 15, status: "Critical", unitPrice: 650, location: "Rack A-15", lastRestocked: "Jan 20, 2026", supplier: "Manila Textiles Co." },
  { id: 6, sku: "ELT-LEA-001", name: "Leather Belt Strap", category: "Accessories", quantity: 35, minimumLevel: 20, status: "Good", unitPrice: 280, location: "Shelf D-01", lastRestocked: "Feb 12, 2026", supplier: "Leather Goods PH" },
  { id: 7, sku: "THR-POL-150", name: "Polyester Thread Spool", category: "Threads", quantity: 18, minimumLevel: 25, status: "Low", unitPrice: 38, location: "Shelf B-04", lastRestocked: "Feb 3, 2026", supplier: "Thread World Inc." },
];

const STOCK_MOVEMENTS_MOCK: StockMovementRow[] = [
  { id: "MOV-001", type: "In", materialName: "Denim Fabric Roll", materialSku: "FAB-DNM-001", quantity: 10, date: "Feb 12, 2026", user: "Maria Santos", reference: "PO-2026-045", notes: "Regular supplier delivery. Quality checked and approved." },
  { id: "MOV-002", type: "Out", materialName: "Cotton Thread Spool", materialSku: "THR-COT-205", quantity: -5, date: "Feb 11, 2026", user: "Juan Dela Cruz", reference: "WO-2026-102", notes: "Issued to production line for work order WO-2026-102." },
  { id: "MOV-003", type: "Transfer", materialName: "Metal Zipper 12\"", materialSku: "ZIP-MET-350", quantity: 8, date: "Feb 10, 2026", user: "Ana Reyes", reference: "TRF-015", notes: "Transferred from Cebu branch to replenish Manila stock." },
  { id: "MOV-004", type: "In", materialName: "Plastic Button Set", materialSku: "BTN-PLA-100", quantity: 50, date: "Feb 9, 2026", user: "Maria Santos", reference: "PO-2026-048", notes: "Bulk order received. Stored in Bin C-08." },
  { id: "MOV-005", type: "Out", materialName: "Cotton Fabric Roll", materialSku: "FAB-COT-500", quantity: -3, date: "Feb 8, 2026", user: "Juan Dela Cruz", reference: "WO-2026-098", notes: "Fabric issued for cutting. Critical stock — reorder needed." },
  { id: "MOV-006", type: "In", materialName: "Polyester Thread Spool", materialSku: "THR-POL-150", quantity: 20, date: "Feb 7, 2026", user: "Ana Reyes", reference: "PO-2026-044", notes: "Restocking from Thread World supplier." },
  { id: "MOV-007", type: "Transfer", materialName: "Leather Belt Strap", materialSku: "ELT-LEA-001", quantity: 5, date: "Feb 6, 2026", user: "Maria Santos", reference: "TRF-012", notes: "Internal transfer from finishing to warehouse." },
];

const ADJUSTMENTS_MOCK: AdjustmentRow[] = [
  { id: "ADJ-001", materialName: "Cotton Thread Spool", materialSku: "THR-COT-205", currentQty: 12, requestedChange: -5, reason: "Damaged items found during physical inspection. Units are unusable.", requestedBy: "Warehouse Staff", date: "Feb 12, 2026", status: "Pending" },
  { id: "ADJ-002", materialName: "Plastic Button Set", materialSku: "BTN-PLA-100", currentQty: 150, requestedChange: 20, reason: "Additional stock received but not reflected in system. Physical count mismatch.", requestedBy: "Warehouse Staff", date: "Feb 11, 2026", status: "Pending" },
  { id: "ADJ-003", materialName: "Cotton Fabric Roll", materialSku: "FAB-COT-500", currentQty: 8, requestedChange: 10, reason: "Correction after physical count revealed unrecorded inventory.", requestedBy: "Maria Santos", date: "Feb 10, 2026", status: "Pending" },
  { id: "ADJ-004", materialName: "Metal Zipper 12\"", materialSku: "ZIP-MET-350", currentQty: 28, requestedChange: -2, reason: "Defective units removed during quality check. Sent back to supplier.", requestedBy: "Juan Dela Cruz", date: "Feb 9, 2026", status: "Approved" },
  { id: "ADJ-005", materialName: "Denim Fabric Roll", materialSku: "FAB-DNM-001", currentQty: 45, requestedChange: -3, reason: "Sample cuttings for client presentation.", requestedBy: "Ana Reyes", date: "Feb 8, 2026", status: "Rejected" },
];

// ==========================================
// CONSTANTS
// ==========================================

const ITEMS_PER_PAGE = 5;

const WAREHOUSE_TABS: Tab[] = [
  { id: "inventory", label: "Inventory", icon: Package, count: INVENTORY_MOCK.filter((i) => i.status === "Critical" || i.status === "Low").length },
  { id: "movements", label: "Stock Movements", icon: History, count: STOCK_MOVEMENTS_MOCK.length },
  { id: "approvals", label: "Adjustment Approvals", icon: ClipboardList, count: ADJUSTMENTS_MOCK.filter((a) => a.status === "Pending").length },
];

const INV_STATUS_FILTERS = ["All Statuses", "Good", "Low", "Critical"];
const INV_CATEGORY_FILTERS = ["All Categories", "Fabrics", "Threads", "Fasteners", "Accessories"];
const MOV_TYPE_FILTERS = ["All Types", "In", "Out", "Transfer"];
const ADJ_STATUS_FILTERS = ["All Statuses", "Pending", "Approved", "Rejected"];

const INV_STATUS_OPTIONS: IconSelectOption[] = [
  { value: "Good", label: "Normal", icon: CheckCircle },
  { value: "Low", label: "Low Stock", icon: AlertTriangle },
  { value: "Critical", label: "Critical", icon: XCircle },
];

// ==========================================
// HELPERS
// ==========================================

function getStatusBadgeLabel(status: InventoryStatus): string {
  if (status === "Good") return "Normal";
  if (status === "Low") return "Low Stock";
  return "Critical";
}

function getStatusBadgeClasses(status: InventoryStatus): string {
  if (status === "Good") return "bg-emerald-50 text-emerald-700 border-emerald-200";
  if (status === "Low") return "bg-amber-50 text-amber-700 border-amber-200";
  return "bg-rose-50 text-rose-700 border-rose-200";
}

function getMovementIcon(type: MovementType) {
  if (type === "In") return ArrowDownRight;
  if (type === "Out") return ArrowUpRight;
  return ArrowLeftRight;
}

function getMovementColor(type: MovementType) {
  if (type === "In") return "bg-emerald-50 text-emerald-500";
  if (type === "Out") return "bg-rose-50 text-rose-500";
  return "bg-blue-50 text-blue-500";
}

// ==========================================
// MAIN COMPONENT
// ==========================================

function AdminWarehousePage() {
  // --- Tab ---
  const [activeTab, setActiveTab] = useState("inventory");

  // --- Inventory state ---
  const [inventory, setInventory] = useState<InventoryItem[]>(INVENTORY_MOCK);
  const [searchInv, setSearchInv] = useState("");
  const [filterInvOpen, setFilterInvOpen] = useState(false);
  const [filterInvStatus, setFilterInvStatus] = useState("All Statuses");
  const [pageInv, setPageInv] = useState(1);

  // --- Movements state ---
  const [movements, setMovements] = useState<StockMovementRow[]>(STOCK_MOVEMENTS_MOCK);
  const [searchMov, setSearchMov] = useState("");
  const [filterMovOpen, setFilterMovOpen] = useState(false);
  const [filterMovType, setFilterMovType] = useState("All Types");
  const [pageMov, setPageMov] = useState(1);

  // --- Adjustments state ---
  const [adjustments, setAdjustments] = useState<AdjustmentRow[]>(ADJUSTMENTS_MOCK);
  const [searchAdj, setSearchAdj] = useState("");
  const [filterAdjOpen, setFilterAdjOpen] = useState(false);
  const [filterAdjStatus, setFilterAdjStatus] = useState("All Statuses");
  const [pageAdj, setPageAdj] = useState(1);

  // --- Modals ---
  const [detailItem, setDetailItem] = useState<InventoryItem | null>(null);
  const [detailMovement, setDetailMovement] = useState<StockMovementRow | null>(null);
  const [detailAdjustment, setDetailAdjustment] = useState<AdjustmentRow | null>(null);

  // --- Edit Quantity ---
  const [editItem, setEditItem] = useState<InventoryItem | null>(null);
  const [formQty, setFormQty] = useState("");
  const [formStatus, setFormStatus] = useState("Good");
  const [formLocation, setFormLocation] = useState("");
  const [formMinLevel, setFormMinLevel] = useState("");

  // --- Add Item ---
  const [isAddItemOpen, setIsAddItemOpen] = useState(false);
  const [addName, setAddName] = useState("");
  const [addSku, setAddSku] = useState("");
  const [addCategory, setAddCategory] = useState("");
  const [addQty, setAddQty] = useState("");
  const [addMinLevel, setAddMinLevel] = useState("");
  const [addUnitPrice, setAddUnitPrice] = useState("");
  const [addLocation, setAddLocation] = useState("");
  const [addSupplier, setAddSupplier] = useState("");

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

  // --- Reset pagination ---
  useEffect(() => { setPageInv(1); }, [searchInv, filterInvStatus]);
  useEffect(() => { setPageMov(1); }, [searchMov, filterMovType]);
  useEffect(() => { setPageAdj(1); }, [searchAdj, filterAdjStatus]);

  // ==========================================
  // COMPUTED: Stats
  // ==========================================
  const totalSKUs = inventory.length;
  const lowStockCount = inventory.filter((i) => i.status === "Low" || i.status === "Critical").length;
  const pendingAdjCount = adjustments.filter((a) => a.status === "Pending").length;
  const stockValue = useMemo(() => inventory.reduce((sum, i) => sum + i.quantity * i.unitPrice, 0), [inventory]);

  // ==========================================
  // COMPUTED: Filtered — Inventory
  // ==========================================
  const filteredInv = useMemo(() => {
    const q = searchInv.toLowerCase();
    return inventory.filter((i) => {
      const matchSearch = i.name.toLowerCase().includes(q) || i.sku.toLowerCase().includes(q) || i.category.toLowerCase().includes(q);
      const matchStatus = filterInvStatus === "All Statuses" || i.status === filterInvStatus;
      return matchSearch && matchStatus;
    });
  }, [inventory, searchInv, filterInvStatus]);

  const invTotalPages = Math.max(1, Math.ceil(filteredInv.length / ITEMS_PER_PAGE));
  const invStart = (pageInv - 1) * ITEMS_PER_PAGE;
  const invEnd = Math.min(invStart + ITEMS_PER_PAGE, filteredInv.length);
  const paginatedInv = filteredInv.slice(invStart, invEnd);

  // ==========================================
  // COMPUTED: Filtered — Movements
  // ==========================================
  const filteredMov = useMemo(() => {
    const q = searchMov.toLowerCase();
    return movements.filter((m) => {
      const matchSearch = m.materialName.toLowerCase().includes(q) || m.materialSku.toLowerCase().includes(q) || m.id.toLowerCase().includes(q) || m.user.toLowerCase().includes(q);
      const matchType = filterMovType === "All Types" || m.type === filterMovType;
      return matchSearch && matchType;
    });
  }, [movements, searchMov, filterMovType]);

  const movTotalPages = Math.max(1, Math.ceil(filteredMov.length / ITEMS_PER_PAGE));
  const movStart = (pageMov - 1) * ITEMS_PER_PAGE;
  const movEnd = Math.min(movStart + ITEMS_PER_PAGE, filteredMov.length);
  const paginatedMov = filteredMov.slice(movStart, movEnd);

  // ==========================================
  // COMPUTED: Filtered — Adjustments
  // ==========================================
  const filteredAdj = useMemo(() => {
    const q = searchAdj.toLowerCase();
    return adjustments.filter((a) => {
      const matchSearch = a.materialName.toLowerCase().includes(q) || a.materialSku.toLowerCase().includes(q) || a.id.toLowerCase().includes(q) || a.requestedBy.toLowerCase().includes(q);
      const matchStatus = filterAdjStatus === "All Statuses" || a.status === filterAdjStatus;
      return matchSearch && matchStatus;
    });
  }, [adjustments, searchAdj, filterAdjStatus]);

  const adjTotalPages = Math.max(1, Math.ceil(filteredAdj.length / ITEMS_PER_PAGE));
  const adjStart = (pageAdj - 1) * ITEMS_PER_PAGE;
  const adjEnd = Math.min(adjStart + ITEMS_PER_PAGE, filteredAdj.length);
  const paginatedAdj = filteredAdj.slice(adjStart, adjEnd);

  // ==========================================
  // HANDLERS: Edit Item
  // ==========================================
  const openEditItem = (item: InventoryItem) => {
    setEditItem(item);
    setFormQty(String(item.quantity));
    setFormStatus(item.status);
    setFormLocation(item.location);
    setFormMinLevel(String(item.minimumLevel));
  };

  const handleSaveEditItem = () => {
    if (!editItem) return;
    const qty = parseInt(formQty, 10);
    const minLvl = parseInt(formMinLevel, 10);
    if (isNaN(qty) || qty < 0) { setToast({ message: "Please enter a valid quantity.", type: "error" }); return; }
    if (isNaN(minLvl) || minLvl < 0) { setToast({ message: "Please enter a valid minimum level.", type: "error" }); return; }
    setInventory((prev) => prev.map((i) => (i.id === editItem.id ? { ...i, quantity: qty, minimumLevel: minLvl, status: formStatus as InventoryStatus, location: formLocation || i.location } : i)));
    setToast({ message: `${editItem.name} updated successfully.`, type: "success" });
    setEditItem(null);
  };

  // ==========================================
  // HANDLERS: Add Item
  // ==========================================
  const openAddItem = () => {
    setAddName(""); setAddSku(""); setAddCategory(""); setAddQty(""); setAddMinLevel(""); setAddUnitPrice(""); setAddLocation(""); setAddSupplier(""); setIsAddItemOpen(true);
  };

  const handleSaveAddItem = () => {
    if (!addName.trim() || !addSku.trim() || !addCategory.trim()) { setToast({ message: "Please fill in all required fields.", type: "error" }); return; }
    const qty = parseInt(addQty, 10) || 0;
    const minLvl = parseInt(addMinLevel, 10) || 0;
    const price = parseFloat(addUnitPrice) || 0;
    const status: InventoryStatus = qty <= 0 ? "Critical" : qty < minLvl ? (qty < minLvl / 2 ? "Critical" : "Low") : "Good";
    const newItem: InventoryItem = { id: inventory.length + 1, sku: addSku, name: addName, category: addCategory, quantity: qty, minimumLevel: minLvl, status, unitPrice: price, location: addLocation || "Unassigned", lastRestocked: "Feb 13, 2026", supplier: addSupplier || "—" };
    setInventory((prev) => [newItem, ...prev]);
    setToast({ message: `${addName} added to inventory.`, type: "success" });
    setIsAddItemOpen(false);
  };

  // ==========================================
  // HANDLERS: Adjustments
  // ==========================================
  const handleApproveAdj = (row: AdjustmentRow) => {
    setConfirmModal({ isOpen: true, title: "Approve Adjustment?", message: `Approve ${row.id} for ${row.materialName} (${row.requestedChange > 0 ? "+" : ""}${row.requestedChange} units)?`, variant: "primary", confirmText: "Approve", action: () => { setAdjustments((prev) => prev.map((a) => (a.id === row.id ? { ...a, status: "Approved" as const } : a))); setToast({ message: `${row.id} approved.`, type: "success" }); setConfirmModal((c) => ({ ...c, isOpen: false })); } });
  };

  const handleRejectAdj = (row: AdjustmentRow) => {
    setConfirmModal({ isOpen: true, title: "Reject Adjustment?", message: `Reject ${row.id} for ${row.materialName}? This action cannot be undone.`, variant: "danger", confirmText: "Reject", action: () => { setAdjustments((prev) => prev.map((a) => (a.id === row.id ? { ...a, status: "Rejected" as const } : a))); setToast({ message: `${row.id} rejected.`, type: "success" }); setConfirmModal((c) => ({ ...c, isOpen: false })); } });
  };

  // ==========================================
  // RENDER
  // ==========================================
  return (
    <>
      <AdminLayout>
        <div className="max-w-7xl mx-auto space-y-6 pb-20">
          {/* ---- PAGE HEADER ---- */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Warehouse</h1>
              <p className="text-xs font-medium text-slate-500 mt-1">Manage inventory, stock movements, and adjustment approvals for this branch.</p>
            </div>
            <div className="flex items-center gap-3">
              <SecondaryButton onClick={() => setToast({ message: "Exporting warehouse report...", type: "success" })} icon={Download}>Export</SecondaryButton>
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-full border border-amber-200 bg-amber-50 text-amber-800 text-xs font-semibold"><Lock size={12} />Branch: Manila (Locked)</div>
            </div>
          </div>

          {/* ---- KPI STATS ---- */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <StatsCard title="Total SKUs" value={totalSKUs} icon={Package} color="bg-indigo-500" />
            <StatsCard title="Low Stock Items" value={lowStockCount} icon={AlertTriangle} color="bg-amber-500" />
            <StatsCard title="Pending Adjustments" value={pendingAdjCount} icon={ClipboardList} color="bg-orange-500" />
            <StatsCard title="Stock Value" value={`₱${stockValue.toLocaleString("en-PH", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`} icon={DollarSign} color="bg-emerald-500" />
          </div>

          {/* ---- TAB BAR ---- */}
          <TabBar tabs={WAREHOUSE_TABS} activeTab={activeTab} onTabChange={setActiveTab} />

          {/* ============================================================
              TAB 1: INVENTORY
              ============================================================ */}
          {activeTab === "inventory" && (
            <Card className="overflow-hidden">
              <div className="px-5 pt-5">
                <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between mb-4">
                  <div className="flex items-center gap-3 flex-1 w-full sm:w-auto">
                    <TableToolbar searchQuery={searchInv} setSearchQuery={setSearchInv} isFilterOpen={filterInvOpen} setIsFilterOpen={setFilterInvOpen} placeholder="Search inventory..." filterLabel={filterInvStatus === "All Statuses" ? "All Statuses" : filterInvStatus}>
                      <div className="p-1.5" role="group">{INV_STATUS_FILTERS.map((s) => (<button key={s} role="option" aria-selected={filterInvStatus === s} onClick={() => { setFilterInvStatus(s); setFilterInvOpen(false); }} className={`w-full text-left px-3 py-2 text-xs font-semibold rounded-lg transition-colors ${filterInvStatus === s ? "bg-slate-100 text-slate-900" : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"}`}>{s}</button>))}</div>
                    </TableToolbar>
                  </div>
                  <PrimaryButton onClick={openAddItem} className="!w-auto !py-2.5 !px-4 !text-xs !rounded-full"><Plus size={14} /> Add Item</PrimaryButton>
                </div>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead className="bg-slate-50/80">
                    <tr>
                      <th className="px-6 py-3 text-[10px] font-bold text-slate-500 uppercase tracking-wider">Material</th>
                      <th className="px-6 py-3 text-[10px] font-bold text-slate-500 uppercase tracking-wider hidden md:table-cell">Category</th>
                      <th className="px-6 py-3 text-[10px] font-bold text-slate-500 uppercase tracking-wider">Qty on Hand</th>
                      <th className="px-6 py-3 text-[10px] font-bold text-slate-500 uppercase tracking-wider hidden md:table-cell">Min Level</th>
                      <th className="px-6 py-3 text-[10px] font-bold text-slate-500 uppercase tracking-wider">Status</th>
                      <th className="px-6 py-3 text-[10px] font-bold text-slate-500 uppercase tracking-wider text-left">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-sm">
                    {paginatedInv.map((item) => (
                      <tr key={item.id} className="hover:bg-slate-50/50 transition-colors">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${item.status === "Critical" ? "bg-rose-50 text-rose-400" : item.status === "Low" ? "bg-amber-50 text-amber-400" : "bg-indigo-50 text-indigo-400"}`}><Package size={18} /></div>
                            <div className="min-w-0">
                              <div className="font-semibold text-slate-900 text-sm truncate">{item.name}</div>
                              <div className="text-[11px] text-slate-500 font-mono mt-0.5">{item.sku} · {item.location}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 hidden md:table-cell"><span className="inline-flex items-center gap-1 whitespace-nowrap text-left px-2 py-0.5 rounded-full text-[10px] font-semibold bg-slate-100 text-slate-600"><Tag size={10} /> {item.category}</span></td>
                        <td className="px-6 py-4">
                          <div className="text-sm font-bold text-slate-900">{item.quantity}</div>
                          {item.quantity <= item.minimumLevel && (<div className="text-[10px] text-rose-500 font-medium mt-0.5">Below min ({item.minimumLevel})</div>)}
                        </td>
                        <td className="px-6 py-4 text-xs text-slate-600 hidden md:table-cell">{item.minimumLevel}</td>
                        <td className="px-6 py-4"><span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-semibold border ${getStatusBadgeClasses(item.status)}`}>{getStatusBadgeLabel(item.status)}</span></td>
                        <td className="px-6 py-4 text-left">
                          <div className="flex justify-start items-center gap-1">
                            <button onClick={() => setDetailItem(item)} className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors" title="View Details"><Eye size={14} /></button>
                            <button onClick={() => openEditItem(item)} className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors" title="Edit"><Pencil size={14} /></button>
                            <button onClick={() => { setInventory(prev => prev.filter(i => i.id !== item.id)); setToast({ message: `Item ${item.name} has been archived.`, type: "success" }); }} className="p-1.5 text-slate-400 hover:text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-900/20 rounded-lg transition-colors" title="Archive"><Archive size={14} /></button>
                          </div>
                        </td>
                      </tr>
                    ))}
                    {filteredInv.length === 0 && (<tr><td colSpan={6} className="px-6 py-16 text-center text-slate-400 text-sm"><div className="flex flex-col items-center gap-2"><Package size={32} className="text-slate-300" /><p className="font-medium">No inventory items found</p><p className="text-xs">Try adjusting your search or filter criteria.</p></div></td></tr>)}
                  </tbody>
                </table>
              </div>
              <Pagination currentPage={pageInv} totalPages={invTotalPages} startIndex={invStart} endIndex={invEnd} totalItems={filteredInv.length} onPageChange={setPageInv} />
            </Card>
          )}

          {/* ============================================================
              TAB 2: STOCK MOVEMENTS
              ============================================================ */}
          {activeTab === "movements" && (
            <Card className="overflow-hidden">
              <div className="px-5 pt-5">
                <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between mb-4">
                  <TableToolbar searchQuery={searchMov} setSearchQuery={setSearchMov} isFilterOpen={filterMovOpen} setIsFilterOpen={setFilterMovOpen} placeholder="Search movements..." filterLabel={filterMovType === "All Types" ? "All Types" : filterMovType}>
                    <div className="p-1.5" role="group">{MOV_TYPE_FILTERS.map((s) => (<button key={s} role="option" aria-selected={filterMovType === s} onClick={() => { setFilterMovType(s); setFilterMovOpen(false); }} className={`w-full text-left px-3 py-2 text-xs font-semibold rounded-lg transition-colors ${filterMovType === s ? "bg-slate-100 text-slate-900" : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"}`}>{s}</button>))}</div>
                  </TableToolbar>
                </div>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead className="bg-slate-50/80">
                    <tr>
                      <th className="px-6 py-3 text-[10px] font-bold text-slate-500 uppercase tracking-wider">Movement</th>
                      <th className="px-6 py-3 text-[10px] font-bold text-slate-500 uppercase tracking-wider">Type</th>
                      <th className="px-6 py-3 text-[10px] font-bold text-slate-500 uppercase tracking-wider">Qty</th>
                      <th className="px-6 py-3 text-[10px] font-bold text-slate-500 uppercase tracking-wider hidden md:table-cell">Date</th>
                      <th className="px-6 py-3 text-[10px] font-bold text-slate-500 uppercase tracking-wider hidden lg:table-cell">User</th>
                      <th className="px-6 py-3 text-[10px] font-bold text-slate-500 uppercase tracking-wider text-left">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-sm">
                    {paginatedMov.map((m) => {
                      const MIcon = getMovementIcon(m.type);
                      return (
                        <tr key={m.id} className="hover:bg-slate-50/50 transition-colors">
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                              <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${getMovementColor(m.type)}`}><MIcon size={18} /></div>
                              <div className="min-w-0">
                                <div className="font-semibold text-slate-900 text-sm truncate">{m.materialName}</div>
                                <div className="text-[11px] text-slate-500 font-mono mt-0.5">{m.id} · {m.materialSku}</div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4"><span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold ${m.type === "In" ? "bg-emerald-50 text-emerald-700" : m.type === "Out" ? "bg-rose-50 text-rose-700" : "bg-blue-50 text-blue-700"}`}>{m.type}</span></td>
                          <td className="px-6 py-4"><span className={`text-sm font-bold ${m.quantity > 0 ? "text-emerald-600" : "text-rose-600"}`}>{m.quantity > 0 ? `+${m.quantity}` : m.quantity}</span></td>
                          <td className="px-6 py-4 text-xs text-slate-500 hidden md:table-cell">{m.date}</td>
                          <td className="px-6 py-4 text-xs text-slate-600 hidden lg:table-cell">{m.user}</td>
                          <td className="px-6 py-4 text-left">
                            <div className="flex justify-start items-center gap-1">
                              <button onClick={() => setDetailMovement(m)} className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors" title="View Details"><Eye size={14} /></button>
                              <button onClick={() => { setMovements(prev => prev.filter(mov => mov.id !== m.id)); setToast({ message: `Movement ${m.id} has been archived.`, type: "success" }); }} className="p-1.5 text-slate-400 hover:text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-900/20 rounded-lg transition-colors" title="Archive"><Archive size={14} /></button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                    {filteredMov.length === 0 && (<tr><td colSpan={6} className="px-6 py-16 text-center text-slate-400 text-sm"><div className="flex flex-col items-center gap-2"><History size={32} className="text-slate-300" /><p className="font-medium">No stock movements found</p><p className="text-xs">Try adjusting your search or filter criteria.</p></div></td></tr>)}
                  </tbody>
                </table>
              </div>
              <Pagination currentPage={pageMov} totalPages={movTotalPages} startIndex={movStart} endIndex={movEnd} totalItems={filteredMov.length} onPageChange={setPageMov} />
            </Card>
          )}

          {/* ============================================================
              TAB 3: ADJUSTMENT APPROVALS
              ============================================================ */}
          {activeTab === "approvals" && (
            <Card className="overflow-hidden">
              <div className="px-5 pt-5">
                <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between mb-4">
                  <TableToolbar searchQuery={searchAdj} setSearchQuery={setSearchAdj} isFilterOpen={filterAdjOpen} setIsFilterOpen={setFilterAdjOpen} placeholder="Search adjustments..." filterLabel={filterAdjStatus === "All Statuses" ? "All Statuses" : filterAdjStatus}>
                    <div className="p-1.5" role="group">{ADJ_STATUS_FILTERS.map((s) => (<button key={s} role="option" aria-selected={filterAdjStatus === s} onClick={() => { setFilterAdjStatus(s); setFilterAdjOpen(false); }} className={`w-full text-left px-3 py-2 text-xs font-semibold rounded-lg transition-colors ${filterAdjStatus === s ? "bg-slate-100 text-slate-900" : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"}`}>{s}</button>))}</div>
                  </TableToolbar>
                </div>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead className="bg-slate-50/80">
                    <tr>
                      <th className="px-6 py-3 text-[10px] font-bold text-slate-500 uppercase tracking-wider">Adjustment</th>
                      <th className="px-6 py-3 text-[10px] font-bold text-slate-500 uppercase tracking-wider">Change</th>
                      <th className="px-6 py-3 text-[10px] font-bold text-slate-500 uppercase tracking-wider hidden md:table-cell">Requested By</th>
                      <th className="px-6 py-3 text-[10px] font-bold text-slate-500 uppercase tracking-wider hidden lg:table-cell">Date</th>
                      <th className="px-6 py-3 text-[10px] font-bold text-slate-500 uppercase tracking-wider">Status</th>
                      <th className="px-6 py-3 text-[10px] font-bold text-slate-500 uppercase tracking-wider text-left">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-sm">
                    {paginatedAdj.map((a) => (
                      <tr key={a.id} className="hover:bg-slate-50/50 transition-colors">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${a.status === "Pending" ? "bg-orange-50 text-orange-400" : a.status === "Approved" ? "bg-emerald-50 text-emerald-400" : "bg-rose-50 text-rose-400"}`}><ClipboardList size={18} /></div>
                            <div className="min-w-0">
                              <div className="font-semibold text-slate-900 text-sm truncate">{a.materialName}</div>
                              <div className="text-[11px] text-slate-500 font-mono mt-0.5">{a.id} · {a.materialSku}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4"><span className={`text-sm font-bold ${a.requestedChange >= 0 ? "text-emerald-600" : "text-rose-600"}`}>{a.requestedChange >= 0 ? `+${a.requestedChange}` : a.requestedChange}</span></td>
                        <td className="px-6 py-4 text-xs text-slate-600 hidden md:table-cell">{a.requestedBy}</td>
                        <td className="px-6 py-4 text-xs text-slate-500 hidden lg:table-cell">{a.date}</td>
                        <td className="px-6 py-4"><StatusBadge status={a.status} /></td>
                        <td className="px-6 py-4 text-left">
                          <div className="flex justify-start items-center gap-1">
                            <button onClick={() => setDetailAdjustment(a)} className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors" title="View Details"><Eye size={14} /></button>
                            {a.status === "Pending" && (
                              <>
                                <button onClick={() => handleApproveAdj(a)} className="p-1.5 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors" title="Approve"><CheckCircle size={14} /></button>
                                <button onClick={() => handleRejectAdj(a)} className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors" title="Reject"><XCircle size={14} /></button>
                              </>
                            )}
                            <button onClick={() => { setAdjustments(prev => prev.filter(adj => adj.id !== a.id)); setToast({ message: `Adjustment ${a.id} has been archived.`, type: "success" }); }} className="p-1.5 text-slate-400 hover:text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-900/20 rounded-lg transition-colors" title="Archive"><Archive size={14} /></button>
                          </div>
                        </td>
                      </tr>
                    ))}
                    {filteredAdj.length === 0 && (<tr><td colSpan={6} className="px-6 py-16 text-center text-slate-400 text-sm"><div className="flex flex-col items-center gap-2"><ClipboardList size={32} className="text-slate-300" /><p className="font-medium">No adjustments found</p><p className="text-xs">Try adjusting your search or filter criteria.</p></div></td></tr>)}
                  </tbody>
                </table>
              </div>
              <Pagination currentPage={pageAdj} totalPages={adjTotalPages} startIndex={adjStart} endIndex={adjEnd} totalItems={filteredAdj.length} onPageChange={setPageAdj} />
            </Card>
          )}
        </div>
      </AdminLayout>

      {/* ==================================================================
          MODALS
          ================================================================== */}

      {/* ---- INVENTORY DETAIL (PageModal) ---- */}
      {detailItem && (
        <PageModal isOpen={!!detailItem} onClose={() => setDetailItem(null)} title={detailItem.name} badges={<span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-semibold border ${getStatusBadgeClasses(detailItem.status)}`}>{getStatusBadgeLabel(detailItem.status)}</span>} subtitle={<>{detailItem.sku} · {detailItem.category}</>} maxWidth="max-w-2xl" footer={<div className="flex justify-between items-center w-full"><SecondaryButton onClick={() => setDetailItem(null)}>Close</SecondaryButton><SecondaryButton onClick={() => { setDetailItem(null); openEditItem(detailItem); }} icon={Pencil}>Edit Item</SecondaryButton></div>}>
          {/* Quantity visual */}
          <div>
            <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2 mb-3"><BarChart2 size={14} className="text-slate-400" /> Stock Level</h4>
            <div className="bg-white border border-slate-200 rounded-xl p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-medium text-slate-500">Current stock</span>
                <span className="text-lg font-bold text-slate-900">{detailItem.quantity} <span className="text-xs font-normal text-slate-400">/ min {detailItem.minimumLevel}</span></span>
              </div>
              <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
                <div className={`h-full rounded-full transition-all ${detailItem.status === "Good" ? "bg-emerald-500" : detailItem.status === "Low" ? "bg-amber-500" : "bg-rose-500"}`} style={{ width: `${Math.min(100, (detailItem.quantity / Math.max(detailItem.minimumLevel * 2, 1)) * 100)}%` }} />
              </div>
              <div className="flex justify-between mt-2 text-[10px] text-slate-400"><span>0</span><span>Min: {detailItem.minimumLevel}</span></div>
            </div>
          </div>
          {/* Details Grid */}
          <div>
            <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2 mb-3"><Package size={14} className="text-slate-400" /> Item Details</h4>
            <div className="grid grid-cols-2 gap-4 border-t border-slate-100 pt-4">
              <div className="space-y-1"><span className="flex items-center gap-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider"><Hash size={10} /> SKU</span><span className="text-sm font-semibold text-slate-700 font-mono">{detailItem.sku}</span></div>
              <div className="space-y-1"><span className="flex items-center gap-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider"><Tag size={10} /> Category</span><span className="text-sm font-semibold text-slate-700">{detailItem.category}</span></div>
              <div className="space-y-1"><span className="flex items-center gap-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider"><Layers size={10} /> Location</span><span className="text-sm font-semibold text-slate-700">{detailItem.location}</span></div>
              <div className="space-y-1"><span className="flex items-center gap-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider"><DollarSign size={10} /> Unit Price</span><span className="text-sm font-semibold text-slate-700">₱{detailItem.unitPrice.toLocaleString()}</span></div>
              <div className="space-y-1"><span className="flex items-center gap-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider"><Calendar size={10} /> Last Restocked</span><span className="text-sm font-semibold text-slate-700">{detailItem.lastRestocked}</span></div>
              <div className="space-y-1"><span className="flex items-center gap-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider"><User size={10} /> Supplier</span><span className="text-sm font-semibold text-slate-700">{detailItem.supplier}</span></div>
            </div>
          </div>
          {/* Recent movements for this item */}
          <div>
            <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2 mb-3"><History size={14} className="text-slate-400" /> Recent Movements</h4>
            <div className="space-y-2">
              {movements.filter((m) => m.materialSku === detailItem.sku).slice(0, 4).map((mov) => {
                const MI = getMovementIcon(mov.type);
                return (
                  <div key={mov.id} className="flex items-center gap-3 p-3 bg-white border border-slate-100 rounded-xl">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${getMovementColor(mov.type)}`}><MI size={14} /></div>
                    <div className="flex-1 min-w-0"><span className="text-xs font-semibold text-slate-900">{mov.type}</span><span className="text-[10px] text-slate-500 ml-2">{mov.date} · {mov.user}</span></div>
                    <span className={`text-xs font-bold ${mov.quantity > 0 ? "text-emerald-600" : "text-rose-600"}`}>{mov.quantity > 0 ? `+${mov.quantity}` : mov.quantity}</span>
                  </div>
                );
              })}
              {movements.filter((m) => m.materialSku === detailItem.sku).length === 0 && (<p className="text-xs text-slate-400 py-4 text-center">No recent movements for this item.</p>)}
            </div>
          </div>
        </PageModal>
      )}

      {/* ---- MOVEMENT DETAIL (PageModal) ---- */}
      {detailMovement && (
        <PageModal isOpen={!!detailMovement} onClose={() => setDetailMovement(null)} title={`Movement ${detailMovement.id}`} badges={<span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-semibold ${detailMovement.type === "In" ? "bg-emerald-50 text-emerald-700" : detailMovement.type === "Out" ? "bg-rose-50 text-rose-700" : "bg-blue-50 text-blue-700"}`}>{detailMovement.type}</span>} subtitle={<>{detailMovement.materialName} · {detailMovement.materialSku}</>} maxWidth="max-w-lg">
          <div>
            <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2 mb-3"><History size={14} className="text-slate-400" /> Movement Details</h4>
            <div className="grid grid-cols-2 gap-4 border-t border-slate-100 pt-4">
              <div className="space-y-1"><span className="flex items-center gap-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider"><Hash size={10} /> Quantity</span><span className={`text-sm font-bold ${detailMovement.quantity > 0 ? "text-emerald-600" : "text-rose-600"}`}>{detailMovement.quantity > 0 ? `+${detailMovement.quantity}` : detailMovement.quantity}</span></div>
              <div className="space-y-1"><span className="flex items-center gap-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider"><Calendar size={10} /> Date</span><span className="text-sm font-semibold text-slate-700">{detailMovement.date}</span></div>
              <div className="space-y-1"><span className="flex items-center gap-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider"><User size={10} /> Processed By</span><span className="text-sm font-semibold text-slate-700">{detailMovement.user}</span></div>
              <div className="space-y-1"><span className="flex items-center gap-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider"><FileText size={10} /> Reference</span><span className="text-sm font-semibold text-slate-700 font-mono">{detailMovement.reference}</span></div>
            </div>
          </div>
          <div>
            <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2 mb-3"><FileText size={14} className="text-slate-400" /> Notes</h4>
            <p className="text-sm text-slate-700 leading-relaxed bg-white border border-slate-200 rounded-xl p-4">{detailMovement.notes}</p>
          </div>
        </PageModal>
      )}

      {/* ---- ADJUSTMENT DETAIL (PageModal) ---- */}
      {detailAdjustment && (
        <PageModal isOpen={!!detailAdjustment} onClose={() => setDetailAdjustment(null)} title={`Adjustment ${detailAdjustment.id}`} badges={<StatusBadge status={detailAdjustment.status} />} subtitle={<>{detailAdjustment.materialName} · {detailAdjustment.materialSku}</>} maxWidth="max-w-lg" footer={
          <div className="flex justify-between items-center w-full">
            <SecondaryButton onClick={() => setDetailAdjustment(null)}>Close</SecondaryButton>
            {detailAdjustment.status === "Pending" && (
              <div className="flex items-center gap-2">
                <SecondaryButton onClick={() => { setDetailAdjustment(null); handleRejectAdj(detailAdjustment); }} icon={XCircle}>Reject</SecondaryButton>
                <PrimaryButton onClick={() => { setDetailAdjustment(null); handleApproveAdj(detailAdjustment); }} className="!w-auto !py-2.5 !px-4 !text-xs !rounded-full"><CheckCircle size={14} /> Approve</PrimaryButton>
              </div>
            )}
          </div>
        }>
          <div>
            <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2 mb-3"><ClipboardList size={14} className="text-slate-400" /> Adjustment Details</h4>
            <div className="grid grid-cols-2 gap-4 border-t border-slate-100 pt-4">
              <div className="space-y-1"><span className="flex items-center gap-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider"><Hash size={10} /> Current Qty</span><span className="text-sm font-semibold text-slate-700">{detailAdjustment.currentQty}</span></div>
              <div className="space-y-1"><span className="flex items-center gap-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider"><Hash size={10} /> Requested Change</span><span className={`text-sm font-bold ${detailAdjustment.requestedChange >= 0 ? "text-emerald-600" : "text-rose-600"}`}>{detailAdjustment.requestedChange >= 0 ? `+${detailAdjustment.requestedChange}` : detailAdjustment.requestedChange}</span></div>
              <div className="space-y-1"><span className="flex items-center gap-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider"><User size={10} /> Requested By</span><span className="text-sm font-semibold text-slate-700">{detailAdjustment.requestedBy}</span></div>
              <div className="space-y-1"><span className="flex items-center gap-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider"><Calendar size={10} /> Date</span><span className="text-sm font-semibold text-slate-700">{detailAdjustment.date}</span></div>
            </div>
          </div>
          <div>
            <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2 mb-3"><FileText size={14} className="text-slate-400" /> Reason</h4>
            <p className="text-sm text-slate-700 leading-relaxed bg-white border border-slate-200 rounded-xl p-4">{detailAdjustment.reason}</p>
          </div>
          {detailAdjustment.status === "Pending" && (
            <div className="flex items-start gap-3 p-4 bg-orange-50 border border-orange-200 rounded-xl">
              <div className="p-2 bg-orange-100 rounded-lg"><AlertTriangle size={18} className="text-orange-600" /></div>
              <div><h4 className="text-xs font-bold text-orange-900 uppercase tracking-wider mb-1">Awaiting Approval</h4><p className="text-xs text-orange-700">This adjustment is pending Branch Admin review. Approve or reject using the buttons below.</p></div>
            </div>
          )}
        </PageModal>
      )}

      {/* ---- EDIT ITEM MODAL (PageModal + InputGroup + IconSelect) ---- */}
      {editItem && (
        <PageModal isOpen={!!editItem} onClose={() => setEditItem(null)} title="Edit Inventory Item" subtitle={`Editing ${editItem.name} (${editItem.sku})`} maxWidth="max-w-lg" footer={<div className="flex justify-end items-center gap-2 w-full"><SecondaryButton onClick={() => setEditItem(null)}>Cancel</SecondaryButton><PrimaryButton onClick={handleSaveEditItem} className="!w-auto !py-2.5 !px-6 !text-xs !rounded-full">Save Changes</PrimaryButton></div>}>
          <div className="grid grid-cols-2 gap-4">
            <InputGroup id="edit-qty" label="Quantity on Hand *" placeholder="e.g. 45" icon={Hash} type="number" value={formQty} onChange={(e) => setFormQty(e.target.value)} />
            <InputGroup id="edit-min" label="Minimum Level *" placeholder="e.g. 30" icon={AlertTriangle} type="number" value={formMinLevel} onChange={(e) => setFormMinLevel(e.target.value)} />
          </div>
          <IconSelect label="Status" value={formStatus} onChange={setFormStatus} options={INV_STATUS_OPTIONS} placeholder="Select status" />
          <InputGroup id="edit-location" label="Storage Location" placeholder="e.g. Rack A-12" icon={Layers} value={formLocation} onChange={(e) => setFormLocation(e.target.value)} />
          <div className="flex items-center gap-2 px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl"><Lock size={14} className="text-slate-400" /><span className="text-xs font-semibold text-slate-500">Branch: Manila (Fixed)</span></div>
        </PageModal>
      )}

      {/* ---- ADD ITEM MODAL (PageModal + InputGroup) ---- */}
      <PageModal isOpen={isAddItemOpen} onClose={() => setIsAddItemOpen(false)} title="Add Inventory Item" subtitle="Add a new material to the branch inventory." maxWidth="max-w-lg" footer={<div className="flex justify-end items-center gap-2 w-full"><SecondaryButton onClick={() => setIsAddItemOpen(false)}>Cancel</SecondaryButton><PrimaryButton onClick={handleSaveAddItem} className="!w-auto !py-2.5 !px-6 !text-xs !rounded-full">Add Item</PrimaryButton></div>}>
        <InputGroup id="add-name" label="Material Name *" placeholder="e.g. Denim Fabric Roll" icon={Package} value={addName} onChange={(e) => setAddName(e.target.value)} />
        <div className="grid grid-cols-2 gap-4">
          <InputGroup id="add-sku" label="SKU *" placeholder="e.g. FAB-DNM-001" icon={Hash} value={addSku} onChange={(e) => setAddSku(e.target.value)} />
          <InputGroup id="add-category" label="Category *" placeholder="e.g. Fabrics" icon={Tag} value={addCategory} onChange={(e) => setAddCategory(e.target.value)} />
        </div>
        <div className="grid grid-cols-3 gap-4">
          <InputGroup id="add-qty" label="Initial Qty" placeholder="0" icon={Package} type="number" value={addQty} onChange={(e) => setAddQty(e.target.value)} />
          <InputGroup id="add-min" label="Min Level" placeholder="0" icon={AlertTriangle} type="number" value={addMinLevel} onChange={(e) => setAddMinLevel(e.target.value)} />
          <InputGroup id="add-price" label="Unit Price" placeholder="0" icon={DollarSign} type="number" value={addUnitPrice} onChange={(e) => setAddUnitPrice(e.target.value)} />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <InputGroup id="add-location" label="Storage Location" placeholder="e.g. Rack A-12" icon={Layers} value={addLocation} onChange={(e) => setAddLocation(e.target.value)} />
          <InputGroup id="add-supplier" label="Supplier" placeholder="e.g. Manila Textiles" icon={User} value={addSupplier} onChange={(e) => setAddSupplier(e.target.value)} />
        </div>
        <div className="flex items-center gap-2 px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl"><Lock size={14} className="text-slate-400" /><span className="text-xs font-semibold text-slate-500">Branch: Manila (Fixed)</span></div>
      </PageModal>

      {/* ---- CONFIRMATION MODAL ---- */}
      <ConfirmationModal isOpen={confirmModal.isOpen} onClose={() => setConfirmModal((c) => ({ ...c, isOpen: false }))} onConfirm={confirmModal.action} title={confirmModal.title} message={confirmModal.message} variant={confirmModal.variant} confirmText={confirmModal.confirmText} />

      {/* ---- TOAST ---- */}
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </>
  );
}

export default AdminWarehousePage;
