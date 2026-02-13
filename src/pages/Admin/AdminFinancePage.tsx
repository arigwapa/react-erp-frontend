// ==========================================
// AdminFinancePage.tsx — Branch Admin Finance
// 3 tabs: Budgets | Costing & Profitability | Financial Reports
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
  DollarSign,
  PieChart,
  TrendingUp,
  AlertTriangle,
  FileText,
  Download,
  BarChart4,
  Eye,
  Pencil,
  Plus,
  Lock,
  CheckCircle,
  Package,
  Hash,
  Calendar,
  User,
  Layers,
  XCircle,
  Wallet,
  Receipt,
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

type BudgetStatus = "Within Budget" | "At Risk" | "Over Budget";

interface BudgetItem {
  id: string;
  category: string;
  allocated: number;
  used: number;
  remaining: number;
  status: BudgetStatus;
  lastUpdated: string;
  owner: string;
  notes: string;
}

interface ProductCostItem {
  id: string;
  product: string;
  sku: string;
  materialsCost: number;
  laborCost: number;
  qaDefectsCost: number;
  totalCost: number;
  revenue: number;
  profitMarginPct: number;
  unitsProduced: number;
  costPerUnit: number;
}

interface ExpenseSummaryItem {
  id: string;
  category: string;
  budget: number;
  actual: number;
  variance: number;
  variancePct: number;
  status: "Under" | "On Track" | "Over";
  period: string;
}

// ==========================================
// HELPERS
// ==========================================

const ITEMS_PER_PAGE = 5;

const formatCurrency = (n: number) =>
  new Intl.NumberFormat("en-PH", { style: "currency", currency: "PHP", minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(n);

const getBudgetStatus = (used: number, allocated: number): BudgetStatus => {
  if (allocated === 0) return "Within Budget";
  if (used > allocated) return "Over Budget";
  const pct = (used / allocated) * 100;
  if (pct >= 80) return "At Risk";
  return "Within Budget";
};

const getProgressBarColor = (status: BudgetStatus) => {
  if (status === "Over Budget") return "bg-rose-500";
  if (status === "At Risk") return "bg-amber-500";
  return "bg-emerald-500";
};

const getBudgetIconBg = (status: BudgetStatus) => {
  if (status === "Over Budget") return "bg-rose-50 text-rose-400";
  if (status === "At Risk") return "bg-amber-50 text-amber-400";
  return "bg-emerald-50 text-emerald-400";
};

const getMarginColor = (pct: number) => {
  if (pct > 25) return "text-emerald-600";
  if (pct >= 15) return "text-amber-600";
  return "text-rose-600";
};

// ==========================================
// MOCK DATA (enriched for detail modals)
// ==========================================

const MOCK_BUDGETS: BudgetItem[] = [
  { id: "BDG-001", category: "Materials", allocated: 120000, used: 98500, remaining: 21500, status: "Within Budget", lastUpdated: "Feb 12, 2026", owner: "Maria Santos", notes: "Materials procurement budget for Q1. Includes raw fabrics, threads, and accessories from approved suppliers." },
  { id: "BDG-002", category: "Labor", allocated: 85000, used: 72000, remaining: 13000, status: "At Risk", lastUpdated: "Feb 11, 2026", owner: "Juan Dela Cruz", notes: "Labor costs including overtime for production line staff. Approaching limit due to increased orders." },
  { id: "BDG-003", category: "Overhead", allocated: 45000, used: 38200, remaining: 6800, status: "At Risk", lastUpdated: "Feb 10, 2026", owner: "Ana Reyes", notes: "Utilities, rent, and administrative expenses for Manila branch facility." },
  { id: "BDG-004", category: "Equipment", allocated: 60000, used: 51200, remaining: 8800, status: "At Risk", lastUpdated: "Feb 9, 2026", owner: "Maria Santos", notes: "Equipment maintenance and minor purchases. Sewing machine repairs consuming majority." },
  { id: "BDG-005", category: "Marketing", allocated: 25000, used: 26800, remaining: 0, status: "Over Budget", lastUpdated: "Feb 8, 2026", owner: "Sarah Lim", notes: "Marketing spend exceeded due to unplanned trade show participation. Requires reallocation approval." },
  { id: "BDG-006", category: "R&D", allocated: 35000, used: 22100, remaining: 12900, status: "Within Budget", lastUpdated: "Feb 7, 2026", owner: "Juan Dela Cruz", notes: "Research and development for new eco-fiber product line. On track for Q1 target." },
].map((b) => ({ ...b, status: getBudgetStatus(b.used, b.allocated), remaining: Math.max(0, b.allocated - b.used) }));

const MOCK_PRODUCTS: ProductCostItem[] = [
  { id: "PC-001", product: "Classic Weave Blanket", sku: "BLK-CW-001", materialsCost: 4200, laborCost: 1800, qaDefectsCost: 120, totalCost: 6120, revenue: 8900, profitMarginPct: 31, unitsProduced: 45, costPerUnit: 136 },
  { id: "PC-002", product: "Premium Throw Pillow", sku: "PLW-PT-002", materialsCost: 1850, laborCost: 950, qaDefectsCost: 80, totalCost: 2880, revenue: 4200, profitMarginPct: 31, unitsProduced: 120, costPerUnit: 24 },
  { id: "PC-003", product: "Standard Runner Rug", sku: "RUG-SR-003", materialsCost: 3100, laborCost: 1400, qaDefectsCost: 200, totalCost: 4700, revenue: 5800, profitMarginPct: 19, unitsProduced: 30, costPerUnit: 157 },
  { id: "PC-004", product: "Luxury Bed Cover", sku: "BDC-LX-004", materialsCost: 6800, laborCost: 3200, qaDefectsCost: 150, totalCost: 10150, revenue: 13500, profitMarginPct: 25, unitsProduced: 20, costPerUnit: 508 },
  { id: "PC-005", product: "Eco Fiber Mat", sku: "MAT-EF-005", materialsCost: 1200, laborCost: 800, qaDefectsCost: 250, totalCost: 2250, revenue: 2480, profitMarginPct: 9, unitsProduced: 60, costPerUnit: 38 },
  { id: "PC-006", product: "Artisan Wall Hanging", sku: "WHL-AW-006", materialsCost: 2400, laborCost: 1600, qaDefectsCost: 90, totalCost: 4090, revenue: 5200, profitMarginPct: 21, unitsProduced: 15, costPerUnit: 273 },
];

const MOCK_EXPENSES: ExpenseSummaryItem[] = [
  { id: "EXP-001", category: "Materials", budget: 120000, actual: 98500, variance: -21500, variancePct: -17.9, status: "Under", period: "Q1 2026" },
  { id: "EXP-002", category: "Labor", budget: 85000, actual: 72000, variance: -13000, variancePct: -15.3, status: "Under", period: "Q1 2026" },
  { id: "EXP-003", category: "Overhead", budget: 45000, actual: 38200, variance: -6800, variancePct: -15.1, status: "Under", period: "Q1 2026" },
  { id: "EXP-004", category: "Equipment", budget: 60000, actual: 51200, variance: -8800, variancePct: -14.7, status: "Under", period: "Q1 2026" },
  { id: "EXP-005", category: "Marketing", budget: 25000, actual: 26800, variance: 1800, variancePct: 7.2, status: "Over", period: "Q1 2026" },
  { id: "EXP-006", category: "R&D", budget: 35000, actual: 22100, variance: -12900, variancePct: -36.9, status: "Under", period: "Q1 2026" },
];

// ==========================================
// CONSTANTS
// ==========================================

const FINANCE_TABS: Tab[] = [
  { id: "budgets", label: "Budgets", icon: Wallet, count: MOCK_BUDGETS.filter((b) => b.status === "Over Budget" || b.status === "At Risk").length },
  { id: "costing", label: "Costing & Profitability", icon: PieChart, count: MOCK_PRODUCTS.length },
  { id: "reports", label: "Financial Reports", icon: FileText, count: MOCK_EXPENSES.filter((e) => e.status === "Over").length },
];

const BUDGET_STATUS_FILTERS = ["All Statuses", "Within Budget", "At Risk", "Over Budget"];
const MARGIN_FILTERS = ["All Margins", "Healthy (>25%)", "Moderate (15-25%)", "Low (<15%)"];
const EXPENSE_STATUS_FILTERS = ["All Statuses", "Under", "On Track", "Over"];

const BUDGET_STATUS_OPTIONS: IconSelectOption[] = [
  { value: "Within Budget", label: "Within Budget", icon: CheckCircle },
  { value: "At Risk", label: "At Risk", icon: AlertTriangle },
  { value: "Over Budget", label: "Over Budget", icon: XCircle },
];

// ==========================================
// MAIN COMPONENT
// ==========================================

const AdminFinancePage = () => {
  // --- Tab ---
  const [activeTab, setActiveTab] = useState("budgets");

  // --- Budgets state ---
  const [budgets, setBudgets] = useState<BudgetItem[]>(MOCK_BUDGETS);
  const [searchBdg, setSearchBdg] = useState("");
  const [filterBdgOpen, setFilterBdgOpen] = useState(false);
  const [filterBdgStatus, setFilterBdgStatus] = useState("All Statuses");
  const [pageBdg, setPageBdg] = useState(1);

  // --- Costing state ---
  const [searchCost, setSearchCost] = useState("");
  const [filterCostOpen, setFilterCostOpen] = useState(false);
  const [filterCostMargin, setFilterCostMargin] = useState("All Margins");
  const [pageCost, setPageCost] = useState(1);

  // --- Reports state ---
  const [searchRpt, setSearchRpt] = useState("");
  const [filterRptOpen, setFilterRptOpen] = useState(false);
  const [filterRptStatus, setFilterRptStatus] = useState("All Statuses");
  const [pageRpt, setPageRpt] = useState(1);

  // --- Modals ---
  const [detailBudget, setDetailBudget] = useState<BudgetItem | null>(null);
  const [detailProduct, setDetailProduct] = useState<ProductCostItem | null>(null);
  const [detailExpense, setDetailExpense] = useState<ExpenseSummaryItem | null>(null);

  // --- Edit Budget ---
  const [editBudget, setEditBudget] = useState<BudgetItem | null>(null);
  const [formAllocated, setFormAllocated] = useState("");
  const [formUsed, setFormUsed] = useState("");
  const [formOwner, setFormOwner] = useState("");
  const [formNotes, setFormNotes] = useState("");

  // --- Add Budget ---
  const [isAddBdgOpen, setIsAddBdgOpen] = useState(false);
  const [addCategory, setAddCategory] = useState("");
  const [addAllocated, setAddAllocated] = useState("");
  const [addOwner, setAddOwner] = useState("");
  const [addNotes, setAddNotes] = useState("");

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
  useEffect(() => { setPageBdg(1); }, [searchBdg, filterBdgStatus]);
  useEffect(() => { setPageCost(1); }, [searchCost, filterCostMargin]);
  useEffect(() => { setPageRpt(1); }, [searchRpt, filterRptStatus]);

  // ==========================================
  // COMPUTED: Stats
  // ==========================================
  const metrics = useMemo(() => {
    const totalBudget = budgets.reduce((s, b) => s + b.allocated, 0);
    const actualSpend = budgets.reduce((s, b) => s + b.used, 0);
    const totalRevenue = MOCK_PRODUCTS.reduce((s, p) => s + p.revenue, 0);
    const totalCost = MOCK_PRODUCTS.reduce((s, p) => s + p.totalCost, 0);
    const grossProfit = totalRevenue - totalCost;
    const profitMarginPct = totalRevenue > 0 ? Math.round((grossProfit / totalRevenue) * 100) : 0;
    return { totalBudget, actualSpend, totalRevenue, profitMarginPct };
  }, [budgets]);

  // ==========================================
  // COMPUTED: Filtered — Budgets
  // ==========================================
  const filteredBdg = useMemo(() => {
    const q = searchBdg.toLowerCase();
    return budgets.filter((b) => {
      const matchSearch = b.category.toLowerCase().includes(q) || b.id.toLowerCase().includes(q) || b.owner.toLowerCase().includes(q);
      const matchStatus = filterBdgStatus === "All Statuses" || b.status === filterBdgStatus;
      return matchSearch && matchStatus;
    });
  }, [budgets, searchBdg, filterBdgStatus]);

  const bdgTotalPages = Math.max(1, Math.ceil(filteredBdg.length / ITEMS_PER_PAGE));
  const bdgStart = (pageBdg - 1) * ITEMS_PER_PAGE;
  const bdgEnd = Math.min(bdgStart + ITEMS_PER_PAGE, filteredBdg.length);
  const paginatedBdg = filteredBdg.slice(bdgStart, bdgEnd);

  // ==========================================
  // COMPUTED: Filtered — Costing
  // ==========================================
  const filteredCost = useMemo(() => {
    const q = searchCost.toLowerCase();
    return MOCK_PRODUCTS.filter((p) => {
      const matchSearch = p.product.toLowerCase().includes(q) || p.sku.toLowerCase().includes(q);
      let matchMargin = true;
      if (filterCostMargin === "Healthy (>25%)") matchMargin = p.profitMarginPct > 25;
      else if (filterCostMargin === "Moderate (15-25%)") matchMargin = p.profitMarginPct >= 15 && p.profitMarginPct <= 25;
      else if (filterCostMargin === "Low (<15%)") matchMargin = p.profitMarginPct < 15;
      return matchSearch && matchMargin;
    });
  }, [searchCost, filterCostMargin]);

  const costTotalPages = Math.max(1, Math.ceil(filteredCost.length / ITEMS_PER_PAGE));
  const costStart = (pageCost - 1) * ITEMS_PER_PAGE;
  const costEnd = Math.min(costStart + ITEMS_PER_PAGE, filteredCost.length);
  const paginatedCost = filteredCost.slice(costStart, costEnd);

  const costingSummary = useMemo(() => {
    const totalRevenue = MOCK_PRODUCTS.reduce((s, p) => s + p.revenue, 0);
    const totalCost = MOCK_PRODUCTS.reduce((s, p) => s + p.totalCost, 0);
    const grossProfit = totalRevenue - totalCost;
    const avgMargin = MOCK_PRODUCTS.length > 0 ? Math.round(MOCK_PRODUCTS.reduce((s, p) => s + p.profitMarginPct, 0) / MOCK_PRODUCTS.length) : 0;
    return { totalRevenue, totalCost, grossProfit, avgMargin };
  }, []);

  // ==========================================
  // COMPUTED: Filtered — Reports
  // ==========================================
  const filteredRpt = useMemo(() => {
    const q = searchRpt.toLowerCase();
    return MOCK_EXPENSES.filter((e) => {
      const matchSearch = e.category.toLowerCase().includes(q) || e.id.toLowerCase().includes(q);
      const matchStatus = filterRptStatus === "All Statuses" || e.status === filterRptStatus;
      return matchSearch && matchStatus;
    });
  }, [searchRpt, filterRptStatus]);

  const rptTotalPages = Math.max(1, Math.ceil(filteredRpt.length / ITEMS_PER_PAGE));
  const rptStart = (pageRpt - 1) * ITEMS_PER_PAGE;
  const rptEnd = Math.min(rptStart + ITEMS_PER_PAGE, filteredRpt.length);
  const paginatedRpt = filteredRpt.slice(rptStart, rptEnd);

  const reportsSummary = useMemo(() => {
    const totalExpense = MOCK_EXPENSES.reduce((s, e) => s + e.actual, 0);
    const totalBudget = MOCK_EXPENSES.reduce((s, e) => s + e.budget, 0);
    const budgetVsActualPct = totalBudget > 0 ? Math.round((totalExpense / totalBudget) * 100) : 0;
    return { totalExpense, totalBudget, budgetVsActualPct };
  }, []);

  // ==========================================
  // HANDLERS: Edit Budget
  // ==========================================
  const openEditBudget = (item: BudgetItem) => {
    setEditBudget(item);
    setFormAllocated(String(item.allocated));
    setFormUsed(String(item.used));
    setFormOwner(item.owner);
    setFormNotes(item.notes);
  };

  const handleSaveEditBudget = () => {
    if (!editBudget) return;
    const alloc = parseInt(formAllocated, 10);
    const used = parseInt(formUsed, 10);
    if (isNaN(alloc) || alloc < 0) { setToast({ message: "Please enter a valid allocated amount.", type: "error" }); return; }
    if (isNaN(used) || used < 0) { setToast({ message: "Please enter a valid used amount.", type: "error" }); return; }
    setBudgets((prev) => prev.map((b) => (b.id === editBudget.id ? { ...b, allocated: alloc, used, remaining: Math.max(0, alloc - used), status: getBudgetStatus(used, alloc), owner: formOwner || b.owner, notes: formNotes || b.notes, lastUpdated: "Feb 13, 2026" } : b)));
    setToast({ message: `${editBudget.category} budget updated successfully.`, type: "success" });
    setEditBudget(null);
  };

  // ==========================================
  // HANDLERS: Add Budget
  // ==========================================
  const openAddBudget = () => {
    setAddCategory(""); setAddAllocated(""); setAddOwner(""); setAddNotes(""); setIsAddBdgOpen(true);
  };

  const handleSaveAddBudget = () => {
    if (!addCategory.trim()) { setToast({ message: "Please enter a budget category.", type: "error" }); return; }
    const alloc = parseInt(addAllocated, 10) || 0;
    const newBdg: BudgetItem = { id: `BDG-${String(budgets.length + 1).padStart(3, "0")}`, category: addCategory, allocated: alloc, used: 0, remaining: alloc, status: "Within Budget", lastUpdated: "Feb 13, 2026", owner: addOwner || "—", notes: addNotes || "—" };
    setBudgets((prev) => [newBdg, ...prev]);
    setToast({ message: `${addCategory} budget created.`, type: "success" });
    setIsAddBdgOpen(false);
  };

  // ==========================================
  // HANDLERS: Approve Budget
  // ==========================================
  const handleApproveBudget = (item: BudgetItem) => {
    setConfirmModal({ isOpen: true, title: "Approve Budget?", message: `Approve the budget allocation for "${item.category}" (${formatCurrency(item.allocated)})?`, variant: "primary", confirmText: "Approve", action: () => { setToast({ message: `Budget for ${item.category} approved.`, type: "success" }); setConfirmModal((p) => ({ ...p, isOpen: false })); } });
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
              <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Finance</h1>
              <p className="text-xs font-medium text-slate-500 mt-1">Monitor budgets, costing, and financial reports for this branch.</p>
            </div>
            <div className="flex items-center gap-3">
              <SecondaryButton onClick={() => setToast({ message: "Exporting financial report...", type: "success" })} icon={Download}>Export</SecondaryButton>
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-full border border-amber-200 bg-amber-50 text-amber-800 text-xs font-semibold"><Lock size={12} />Branch: Manila (Locked)</div>
            </div>
          </div>

          {/* ---- KPI STATS ---- */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <StatsCard title="Total Budget" value={formatCurrency(metrics.totalBudget)} icon={DollarSign} color="bg-indigo-500" />
            <StatsCard title="Actual Spend" value={formatCurrency(metrics.actualSpend)} icon={PieChart} color="bg-blue-500" />
            <StatsCard title="Revenue" value={formatCurrency(metrics.totalRevenue)} icon={TrendingUp} color="bg-emerald-500" />
            <StatsCard title="Profit Margin" value={`${metrics.profitMarginPct}%`} icon={BarChart4} color="bg-amber-500" trend={metrics.profitMarginPct >= 25 ? "Healthy" : "Below target"} trendUp={metrics.profitMarginPct >= 25} />
          </div>

          {/* ---- TAB BAR ---- */}
          <TabBar tabs={FINANCE_TABS} activeTab={activeTab} onTabChange={setActiveTab} />

          {/* ============================================================
              TAB 1: BUDGETS
              ============================================================ */}
          {activeTab === "budgets" && (
            <Card className="overflow-hidden">
              <div className="px-5 pt-5">
                <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between mb-4">
                  <div className="flex items-center gap-3 flex-1 w-full sm:w-auto">
                    <TableToolbar searchQuery={searchBdg} setSearchQuery={setSearchBdg} isFilterOpen={filterBdgOpen} setIsFilterOpen={setFilterBdgOpen} placeholder="Search budgets..." filterLabel={filterBdgStatus === "All Statuses" ? "All Statuses" : filterBdgStatus}>
                      <div className="p-1.5" role="group">{BUDGET_STATUS_FILTERS.map((s) => (<button key={s} role="option" aria-selected={filterBdgStatus === s} onClick={() => { setFilterBdgStatus(s); setFilterBdgOpen(false); }} className={`w-full text-left px-3 py-2 text-xs font-semibold rounded-lg transition-colors ${filterBdgStatus === s ? "bg-slate-100 text-slate-900" : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"}`}>{s}</button>))}</div>
                    </TableToolbar>
                  </div>
                  <PrimaryButton onClick={openAddBudget} className="!w-auto !py-2.5 !px-4 !text-xs !rounded-full"><Plus size={14} /> Add Budget</PrimaryButton>
                </div>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead className="bg-slate-50/80">
                    <tr>
                      <th className="px-6 py-3 text-[10px] font-bold text-slate-500 uppercase tracking-wider">Budget</th>
                      <th className="px-6 py-3 text-[10px] font-bold text-slate-500 uppercase tracking-wider">Allocated</th>
                      <th className="px-6 py-3 text-[10px] font-bold text-slate-500 uppercase tracking-wider hidden md:table-cell">Used</th>
                      <th className="px-6 py-3 text-[10px] font-bold text-slate-500 uppercase tracking-wider hidden lg:table-cell">Remaining</th>
                      <th className="px-6 py-3 text-[10px] font-bold text-slate-500 uppercase tracking-wider">Progress</th>
                      <th className="px-6 py-3 text-[10px] font-bold text-slate-500 uppercase tracking-wider text-left">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-sm">
                    {paginatedBdg.map((row) => {
                      const progressPct = row.allocated > 0 ? Math.min(100, Math.round((row.used / row.allocated) * 100)) : 0;
                      return (
                        <tr key={row.id} className="hover:bg-slate-50/50 transition-colors">
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                              <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${getBudgetIconBg(row.status)}`}><Wallet size={18} /></div>
                              <div className="min-w-0">
                                <div className="font-semibold text-slate-900 text-sm truncate">{row.category}</div>
                                <div className="text-[11px] text-slate-500 font-mono mt-0.5">{row.id} · {row.owner}</div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 text-sm font-bold text-slate-900">{formatCurrency(row.allocated)}</td>
                          <td className="px-6 py-4 text-sm font-semibold text-slate-700 hidden md:table-cell">{formatCurrency(row.used)}</td>
                          <td className="px-6 py-4 text-sm font-semibold text-slate-700 hidden lg:table-cell">{formatCurrency(row.remaining)}</td>
                          <td className="px-6 py-4 w-36">
                            <div className="flex justify-between text-[10px] mb-1"><span className="text-slate-400">Used</span><span className="font-bold text-slate-700">{progressPct}%</span></div>
                            <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden"><div className={`h-full rounded-full transition-all ${getProgressBarColor(row.status)}`} style={{ width: `${progressPct}%` }} /></div>
                          </td>
                          <td className="px-6 py-4 text-left">
                            <div className="flex justify-start items-center gap-1">
                              <button onClick={() => setDetailBudget(row)} className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors" title="View Details"><Eye size={14} /></button>
                              <button onClick={() => openEditBudget(row)} className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors" title="Edit"><Pencil size={14} /></button>
                              <button onClick={() => handleApproveBudget(row)} className="p-1.5 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors" title="Approve"><CheckCircle size={14} /></button>
                              <button onClick={() => { setBudgets(prev => prev.filter(b => b.id !== row.id)); setToast({ message: `Budget ${row.category} has been archived.`, type: "success" }); }} className="p-1.5 text-slate-400 hover:text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-900/20 rounded-lg transition-colors" title="Archive"><Archive size={14} /></button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                    {filteredBdg.length === 0 && (<tr><td colSpan={6} className="px-6 py-16 text-center text-slate-400 text-sm"><div className="flex flex-col items-center gap-2"><Wallet size={32} className="text-slate-300" /><p className="font-medium">No budget categories found</p><p className="text-xs">Try adjusting your search or filter criteria.</p></div></td></tr>)}
                  </tbody>
                </table>
              </div>
              <Pagination currentPage={pageBdg} totalPages={bdgTotalPages} startIndex={bdgStart} endIndex={bdgEnd} totalItems={filteredBdg.length} onPageChange={setPageBdg} />
            </Card>
          )}

          {/* ============================================================
              TAB 2: COSTING & PROFITABILITY
              ============================================================ */}
          {activeTab === "costing" && (
            <>
              {/* Mini summary cards */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Card className="p-4"><p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Total Revenue</p><p className="text-lg font-bold text-slate-900">{formatCurrency(costingSummary.totalRevenue)}</p></Card>
                <Card className="p-4"><p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Total Cost</p><p className="text-lg font-bold text-slate-900">{formatCurrency(costingSummary.totalCost)}</p></Card>
                <Card className="p-4"><p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Gross Profit</p><p className="text-lg font-bold text-emerald-600">{formatCurrency(costingSummary.grossProfit)}</p></Card>
                <Card className="p-4"><p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Avg Margin</p><p className={`text-lg font-bold ${getMarginColor(costingSummary.avgMargin)}`}>{costingSummary.avgMargin}%</p></Card>
              </div>
              <Card className="overflow-hidden">
                <div className="px-5 pt-5">
                  <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between mb-4">
                    <TableToolbar searchQuery={searchCost} setSearchQuery={setSearchCost} isFilterOpen={filterCostOpen} setIsFilterOpen={setFilterCostOpen} placeholder="Search products..." filterLabel={filterCostMargin === "All Margins" ? "All Margins" : filterCostMargin}>
                      <div className="p-1.5" role="group">{MARGIN_FILTERS.map((s) => (<button key={s} role="option" aria-selected={filterCostMargin === s} onClick={() => { setFilterCostMargin(s); setFilterCostOpen(false); }} className={`w-full text-left px-3 py-2 text-xs font-semibold rounded-lg transition-colors ${filterCostMargin === s ? "bg-slate-100 text-slate-900" : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"}`}>{s}</button>))}</div>
                    </TableToolbar>
                  </div>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead className="bg-slate-50/80">
                      <tr>
                        <th className="px-6 py-3 text-[10px] font-bold text-slate-500 uppercase tracking-wider">Product</th>
                        <th className="px-6 py-3 text-[10px] font-bold text-slate-500 uppercase tracking-wider hidden md:table-cell">Total Cost</th>
                        <th className="px-6 py-3 text-[10px] font-bold text-slate-500 uppercase tracking-wider">Revenue</th>
                        <th className="px-6 py-3 text-[10px] font-bold text-slate-500 uppercase tracking-wider">Margin</th>
                        <th className="px-6 py-3 text-[10px] font-bold text-slate-500 uppercase tracking-wider text-left">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-sm">
                      {paginatedCost.map((row) => (
                        <tr key={row.id} className="hover:bg-slate-50/50 transition-colors">
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-400 shrink-0"><Package size={18} /></div>
                              <div className="min-w-0">
                                <div className="font-semibold text-slate-900 text-sm truncate">{row.product}</div>
                                <div className="text-[11px] text-slate-500 font-mono mt-0.5">{row.sku} · {row.unitsProduced} units</div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 text-sm font-semibold text-slate-700 hidden md:table-cell">{formatCurrency(row.totalCost)}</td>
                          <td className="px-6 py-4 text-sm font-bold text-emerald-600">{formatCurrency(row.revenue)}</td>
                          <td className="px-6 py-4">
                            <span className={`text-sm font-bold ${getMarginColor(row.profitMarginPct)}`}>{row.profitMarginPct}%</span>
                            <div className="w-16 bg-slate-100 rounded-full h-1 mt-1 overflow-hidden"><div className={`h-full rounded-full ${row.profitMarginPct > 25 ? "bg-emerald-500" : row.profitMarginPct >= 15 ? "bg-amber-500" : "bg-rose-500"}`} style={{ width: `${Math.min(100, row.profitMarginPct * 2)}%` }} /></div>
                          </td>
                          <td className="px-6 py-4 text-left">
                            <div className="flex justify-start items-center gap-1">
                              <button onClick={() => setDetailProduct(row)} className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors" title="View Details"><Eye size={14} /></button>
                              <button onClick={() => { setToast({ message: `Product ${row.product} has been archived.`, type: "success" }); }} className="p-1.5 text-slate-400 hover:text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-900/20 rounded-lg transition-colors" title="Archive"><Archive size={14} /></button>
                            </div>
                          </td>
                        </tr>
                      ))}
                      {filteredCost.length === 0 && (<tr><td colSpan={5} className="px-6 py-16 text-center text-slate-400 text-sm"><div className="flex flex-col items-center gap-2"><Package size={32} className="text-slate-300" /><p className="font-medium">No products found</p><p className="text-xs">Try adjusting your search or filter criteria.</p></div></td></tr>)}
                    </tbody>
                  </table>
                </div>
                <Pagination currentPage={pageCost} totalPages={costTotalPages} startIndex={costStart} endIndex={costEnd} totalItems={filteredCost.length} onPageChange={setPageCost} />
              </Card>
            </>
          )}

          {/* ============================================================
              TAB 3: FINANCIAL REPORTS
              ============================================================ */}
          {activeTab === "reports" && (
            <>
              {/* Report summary cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card className="p-4"><p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Total Expense</p><p className="text-lg font-bold text-slate-900">{formatCurrency(reportsSummary.totalExpense)}</p></Card>
                <Card className="p-4">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Budget Utilization</p>
                  <p className="text-lg font-bold text-slate-900">{reportsSummary.budgetVsActualPct}%</p>
                  <div className="w-full bg-slate-100 rounded-full h-1.5 mt-2 overflow-hidden"><div className={`h-full rounded-full transition-all ${reportsSummary.budgetVsActualPct > 100 ? "bg-rose-500" : reportsSummary.budgetVsActualPct >= 80 ? "bg-amber-500" : "bg-emerald-500"}`} style={{ width: `${Math.min(100, reportsSummary.budgetVsActualPct)}%` }} /></div>
                </Card>
                <Card className="p-4"><p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Revenue Trend</p><p className="text-lg font-bold text-emerald-600 flex items-center gap-1"><TrendingUp size={18} /> Upward</p></Card>
              </div>
              <Card className="overflow-hidden">
                <div className="px-5 pt-5">
                  <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between mb-4">
                    <TableToolbar searchQuery={searchRpt} setSearchQuery={setSearchRpt} isFilterOpen={filterRptOpen} setIsFilterOpen={setFilterRptOpen} placeholder="Search expenses..." filterLabel={filterRptStatus === "All Statuses" ? "All Statuses" : filterRptStatus}>
                      <div className="p-1.5" role="group">{EXPENSE_STATUS_FILTERS.map((s) => (<button key={s} role="option" aria-selected={filterRptStatus === s} onClick={() => { setFilterRptStatus(s); setFilterRptOpen(false); }} className={`w-full text-left px-3 py-2 text-xs font-semibold rounded-lg transition-colors ${filterRptStatus === s ? "bg-slate-100 text-slate-900" : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"}`}>{s}</button>))}</div>
                    </TableToolbar>
                  </div>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead className="bg-slate-50/80">
                      <tr>
                        <th className="px-6 py-3 text-[10px] font-bold text-slate-500 uppercase tracking-wider">Category</th>
                        <th className="px-6 py-3 text-[10px] font-bold text-slate-500 uppercase tracking-wider">Budget</th>
                        <th className="px-6 py-3 text-[10px] font-bold text-slate-500 uppercase tracking-wider">Actual</th>
                        <th className="px-6 py-3 text-[10px] font-bold text-slate-500 uppercase tracking-wider hidden md:table-cell">Variance</th>
                        <th className="px-6 py-3 text-[10px] font-bold text-slate-500 uppercase tracking-wider">Status</th>
                        <th className="px-6 py-3 text-[10px] font-bold text-slate-500 uppercase tracking-wider text-left">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-sm">
                      {paginatedRpt.map((row) => (
                        <tr key={row.id} className="hover:bg-slate-50/50 transition-colors">
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                              <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${row.status === "Over" ? "bg-rose-50 text-rose-400" : "bg-emerald-50 text-emerald-400"}`}><Receipt size={18} /></div>
                              <div className="min-w-0">
                                <div className="font-semibold text-slate-900 text-sm truncate">{row.category}</div>
                                <div className="text-[11px] text-slate-500 font-mono mt-0.5">{row.id} · {row.period}</div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 text-sm font-semibold text-slate-700">{formatCurrency(row.budget)}</td>
                          <td className="px-6 py-4 text-sm font-bold text-slate-900">{formatCurrency(row.actual)}</td>
                          <td className="px-6 py-4 hidden md:table-cell"><span className={`text-sm font-bold ${row.variance <= 0 ? "text-emerald-600" : "text-rose-600"}`}>{row.variance > 0 ? "+" : ""}{formatCurrency(row.variance)} ({row.variancePct > 0 ? "+" : ""}{row.variancePct}%)</span></td>
                          <td className="px-6 py-4"><StatusBadge status={row.status === "Over" ? "Over budget" : row.status === "On Track" ? "On track" : "Under budget"} /></td>
                          <td className="px-6 py-4 text-left">
                            <div className="flex justify-start items-center gap-1">
                              <button onClick={() => setDetailExpense(row)} className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors" title="View Details"><Eye size={14} /></button>
                              <button onClick={() => { setToast({ message: `Expense ${row.category} has been archived.`, type: "success" }); }} className="p-1.5 text-slate-400 hover:text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-900/20 rounded-lg transition-colors" title="Archive"><Archive size={14} /></button>
                            </div>
                          </td>
                        </tr>
                      ))}
                      {filteredRpt.length === 0 && (<tr><td colSpan={6} className="px-6 py-16 text-center text-slate-400 text-sm"><div className="flex flex-col items-center gap-2"><FileText size={32} className="text-slate-300" /><p className="font-medium">No expense categories found</p><p className="text-xs">Try adjusting your search or filter criteria.</p></div></td></tr>)}
                    </tbody>
                  </table>
                </div>
                <Pagination currentPage={pageRpt} totalPages={rptTotalPages} startIndex={rptStart} endIndex={rptEnd} totalItems={filteredRpt.length} onPageChange={setPageRpt} />
              </Card>

              {/* Profitability summary bars */}
              <Card className="p-6">
                <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-4 flex items-center gap-2"><BarChart4 size={14} className="text-slate-400" /> Profitability Summary</h3>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between text-xs font-semibold text-slate-600 mb-1"><span>Revenue vs Cost</span><span>{costingSummary.totalRevenue > 0 ? Math.round((costingSummary.grossProfit / costingSummary.totalRevenue) * 100) : 0}% margin</span></div>
                    <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden"><div className="h-full bg-emerald-500 rounded-full transition-all" style={{ width: `${costingSummary.totalRevenue > 0 ? Math.min(100, (costingSummary.grossProfit / costingSummary.totalRevenue) * 100) : 0}%` }} /></div>
                  </div>
                  <div>
                    <div className="flex justify-between text-xs font-semibold text-slate-600 mb-1"><span>Budget Utilization</span><span>{reportsSummary.budgetVsActualPct}%</span></div>
                    <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden"><div className={`h-full rounded-full transition-all ${reportsSummary.budgetVsActualPct > 100 ? "bg-rose-500" : reportsSummary.budgetVsActualPct >= 80 ? "bg-amber-500" : "bg-emerald-500"}`} style={{ width: `${Math.min(100, reportsSummary.budgetVsActualPct)}%` }} /></div>
                  </div>
                </div>
              </Card>
            </>
          )}
        </div>
      </AdminLayout>

      {/* ==================================================================
          MODALS
          ================================================================== */}

      {/* ---- BUDGET DETAIL (PageModal) ---- */}
      {detailBudget && (
        <PageModal isOpen={!!detailBudget} onClose={() => setDetailBudget(null)} title={`Budget: ${detailBudget.category}`} badges={<StatusBadge status={detailBudget.status} />} subtitle={<>{detailBudget.id} · Owner: {detailBudget.owner}</>} maxWidth="max-w-2xl" footer={<div className="flex justify-between items-center w-full"><SecondaryButton onClick={() => setDetailBudget(null)}>Close</SecondaryButton><SecondaryButton onClick={() => { setDetailBudget(null); openEditBudget(detailBudget); }} icon={Pencil}>Edit Budget</SecondaryButton></div>}>
          {/* Progress visual */}
          <div>
            <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2 mb-3"><BarChart4 size={14} className="text-slate-400" /> Budget Utilization</h4>
            <div className="bg-white border border-slate-200 rounded-xl p-4">
              <div className="flex items-center justify-between mb-2"><span className="text-xs font-medium text-slate-500">Used of allocated</span><span className="text-lg font-bold text-slate-900">{formatCurrency(detailBudget.used)} <span className="text-xs font-normal text-slate-400">/ {formatCurrency(detailBudget.allocated)}</span></span></div>
              <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden"><div className={`h-full rounded-full transition-all ${getProgressBarColor(detailBudget.status)}`} style={{ width: `${detailBudget.allocated > 0 ? Math.min(100, Math.round((detailBudget.used / detailBudget.allocated) * 100)) : 0}%` }} /></div>
              <div className="flex justify-between mt-2 text-[10px] text-slate-400"><span>₱0</span><span>Remaining: {formatCurrency(detailBudget.remaining)}</span></div>
            </div>
          </div>
          {/* Details Grid */}
          <div>
            <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2 mb-3"><Wallet size={14} className="text-slate-400" /> Budget Details</h4>
            <div className="grid grid-cols-2 gap-4 border-t border-slate-100 pt-4">
              <div className="space-y-1"><span className="flex items-center gap-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider"><Hash size={10} /> Budget ID</span><span className="text-sm font-semibold text-slate-700 font-mono">{detailBudget.id}</span></div>
              <div className="space-y-1"><span className="flex items-center gap-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider"><Layers size={10} /> Category</span><span className="text-sm font-semibold text-slate-700">{detailBudget.category}</span></div>
              <div className="space-y-1"><span className="flex items-center gap-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider"><User size={10} /> Owner</span><span className="text-sm font-semibold text-slate-700">{detailBudget.owner}</span></div>
              <div className="space-y-1"><span className="flex items-center gap-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider"><Calendar size={10} /> Last Updated</span><span className="text-sm font-semibold text-slate-700">{detailBudget.lastUpdated}</span></div>
            </div>
          </div>
          {/* Notes */}
          <div>
            <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2 mb-3"><FileText size={14} className="text-slate-400" /> Notes</h4>
            <p className="text-sm text-slate-700 leading-relaxed bg-white border border-slate-200 rounded-xl p-4">{detailBudget.notes}</p>
          </div>
          {/* Warning if over/at risk */}
          {detailBudget.status !== "Within Budget" && (
            <div className={`flex items-start gap-3 p-4 rounded-xl border ${detailBudget.status === "Over Budget" ? "bg-rose-50 border-rose-200" : "bg-amber-50 border-amber-200"}`}>
              <div className={`p-2 rounded-lg ${detailBudget.status === "Over Budget" ? "bg-rose-100" : "bg-amber-100"}`}><AlertTriangle size={18} className={detailBudget.status === "Over Budget" ? "text-rose-600" : "text-amber-600"} /></div>
              <div><h4 className={`text-xs font-bold uppercase tracking-wider mb-1 ${detailBudget.status === "Over Budget" ? "text-rose-900" : "text-amber-900"}`}>{detailBudget.status}</h4><p className={`text-xs ${detailBudget.status === "Over Budget" ? "text-rose-700" : "text-amber-700"}`}>{detailBudget.status === "Over Budget" ? "This budget has exceeded its allocation. Consider requesting reallocation from finance." : "This budget is approaching its limit. Monitor closely to avoid overrun."}</p></div>
            </div>
          )}
        </PageModal>
      )}

      {/* ---- PRODUCT COST DETAIL (PageModal) ---- */}
      {detailProduct && (
        <PageModal isOpen={!!detailProduct} onClose={() => setDetailProduct(null)} title={detailProduct.product} badges={<span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-semibold border ${detailProduct.profitMarginPct > 25 ? "bg-emerald-50 text-emerald-700 border-emerald-200" : detailProduct.profitMarginPct >= 15 ? "bg-amber-50 text-amber-700 border-amber-200" : "bg-rose-50 text-rose-700 border-rose-200"}`}>{detailProduct.profitMarginPct}% margin</span>} subtitle={<>{detailProduct.sku} · {detailProduct.unitsProduced} units produced</>} maxWidth="max-w-2xl">
          {/* Cost Breakdown */}
          <div>
            <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2 mb-3"><PieChart size={14} className="text-slate-400" /> Cost Breakdown</h4>
            <div className="space-y-3 border-t border-slate-100 pt-4">
              {[
                { label: "Materials", value: detailProduct.materialsCost, color: "bg-blue-500", pct: Math.round((detailProduct.materialsCost / detailProduct.totalCost) * 100) },
                { label: "Labor", value: detailProduct.laborCost, color: "bg-indigo-500", pct: Math.round((detailProduct.laborCost / detailProduct.totalCost) * 100) },
                { label: "QA Defects", value: detailProduct.qaDefectsCost, color: "bg-rose-500", pct: Math.round((detailProduct.qaDefectsCost / detailProduct.totalCost) * 100) },
              ].map((item) => (
                <div key={item.label}>
                  <div className="flex justify-between text-xs mb-1"><span className="font-medium text-slate-600">{item.label}</span><span className="font-bold text-slate-900">{formatCurrency(item.value)} ({item.pct}%)</span></div>
                  <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden"><div className={`h-full rounded-full ${item.color}`} style={{ width: `${item.pct}%` }} /></div>
                </div>
              ))}
            </div>
          </div>
          {/* Financial Summary */}
          <div>
            <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2 mb-3"><DollarSign size={14} className="text-slate-400" /> Financial Summary</h4>
            <div className="grid grid-cols-2 gap-4 border-t border-slate-100 pt-4">
              <div className="space-y-1"><span className="flex items-center gap-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider"><DollarSign size={10} /> Total Cost</span><span className="text-sm font-bold text-slate-900">{formatCurrency(detailProduct.totalCost)}</span></div>
              <div className="space-y-1"><span className="flex items-center gap-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider"><TrendingUp size={10} /> Revenue</span><span className="text-sm font-bold text-emerald-600">{formatCurrency(detailProduct.revenue)}</span></div>
              <div className="space-y-1"><span className="flex items-center gap-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider"><BarChart4 size={10} /> Gross Profit</span><span className="text-sm font-bold text-emerald-600">{formatCurrency(detailProduct.revenue - detailProduct.totalCost)}</span></div>
              <div className="space-y-1"><span className="flex items-center gap-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider"><Hash size={10} /> Cost Per Unit</span><span className="text-sm font-bold text-slate-700">{formatCurrency(detailProduct.costPerUnit)}</span></div>
            </div>
          </div>
          {/* Low margin warning */}
          {detailProduct.profitMarginPct < 15 && (
            <div className="flex items-start gap-3 p-4 bg-rose-50 border border-rose-200 rounded-xl">
              <div className="p-2 bg-rose-100 rounded-lg"><AlertTriangle size={18} className="text-rose-600" /></div>
              <div><h4 className="text-xs font-bold text-rose-900 uppercase tracking-wider mb-1">Low Profit Margin</h4><p className="text-xs text-rose-700">This product has a profit margin below 15%. Review cost drivers and pricing strategy.</p></div>
            </div>
          )}
        </PageModal>
      )}

      {/* ---- EXPENSE DETAIL (PageModal) ---- */}
      {detailExpense && (
        <PageModal isOpen={!!detailExpense} onClose={() => setDetailExpense(null)} title={`Expense: ${detailExpense.category}`} badges={<StatusBadge status={detailExpense.status === "Over" ? "Over budget" : detailExpense.status === "On Track" ? "On track" : "Under budget"} />} subtitle={<>{detailExpense.id} · {detailExpense.period}</>} maxWidth="max-w-lg">
          <div>
            <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2 mb-3"><Receipt size={14} className="text-slate-400" /> Expense Details</h4>
            <div className="grid grid-cols-2 gap-4 border-t border-slate-100 pt-4">
              <div className="space-y-1"><span className="flex items-center gap-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider"><DollarSign size={10} /> Budgeted</span><span className="text-sm font-semibold text-slate-700">{formatCurrency(detailExpense.budget)}</span></div>
              <div className="space-y-1"><span className="flex items-center gap-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider"><DollarSign size={10} /> Actual</span><span className="text-sm font-bold text-slate-900">{formatCurrency(detailExpense.actual)}</span></div>
              <div className="space-y-1"><span className="flex items-center gap-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider"><TrendingUp size={10} /> Variance</span><span className={`text-sm font-bold ${detailExpense.variance <= 0 ? "text-emerald-600" : "text-rose-600"}`}>{detailExpense.variance > 0 ? "+" : ""}{formatCurrency(detailExpense.variance)}</span></div>
              <div className="space-y-1"><span className="flex items-center gap-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider"><BarChart4 size={10} /> Variance %</span><span className={`text-sm font-bold ${detailExpense.variancePct <= 0 ? "text-emerald-600" : "text-rose-600"}`}>{detailExpense.variancePct > 0 ? "+" : ""}{detailExpense.variancePct}%</span></div>
            </div>
          </div>
          {/* Utilization bar */}
          <div>
            <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2 mb-3"><BarChart4 size={14} className="text-slate-400" /> Utilization</h4>
            <div className="bg-white border border-slate-200 rounded-xl p-4">
              <div className="flex items-center justify-between mb-2"><span className="text-xs font-medium text-slate-500">Actual vs Budget</span><span className="text-sm font-bold text-slate-900">{detailExpense.budget > 0 ? Math.round((detailExpense.actual / detailExpense.budget) * 100) : 0}%</span></div>
              <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden"><div className={`h-full rounded-full transition-all ${detailExpense.status === "Over" ? "bg-rose-500" : "bg-emerald-500"}`} style={{ width: `${Math.min(110, detailExpense.budget > 0 ? Math.round((detailExpense.actual / detailExpense.budget) * 100) : 0)}%` }} /></div>
            </div>
          </div>
        </PageModal>
      )}

      {/* ---- EDIT BUDGET MODAL (PageModal + InputGroup) ---- */}
      {editBudget && (
        <PageModal isOpen={!!editBudget} onClose={() => setEditBudget(null)} title="Edit Budget" subtitle={`Editing ${editBudget.category} (${editBudget.id})`} maxWidth="max-w-lg" footer={<div className="flex justify-end items-center gap-2 w-full"><SecondaryButton onClick={() => setEditBudget(null)}>Cancel</SecondaryButton><PrimaryButton onClick={handleSaveEditBudget} className="!w-auto !py-2.5 !px-6 !text-xs !rounded-full">Save Changes</PrimaryButton></div>}>
          <div className="grid grid-cols-2 gap-4">
            <InputGroup id="edit-allocated" label="Allocated Amount (₱) *" placeholder="e.g. 120000" icon={DollarSign} type="number" value={formAllocated} onChange={(e) => setFormAllocated(e.target.value)} />
            <InputGroup id="edit-used" label="Used Amount (₱) *" placeholder="e.g. 98500" icon={DollarSign} type="number" value={formUsed} onChange={(e) => setFormUsed(e.target.value)} />
          </div>
          <InputGroup id="edit-owner" label="Budget Owner" placeholder="e.g. Maria Santos" icon={User} value={formOwner} onChange={(e) => setFormOwner(e.target.value)} />
          <div className="flex flex-col gap-1.5">
            <label htmlFor="edit-notes" className="text-xs font-semibold text-slate-500 tracking-wide">Notes</label>
            <textarea id="edit-notes" rows={3} placeholder="Budget notes..." value={formNotes} onChange={(e) => setFormNotes(e.target.value)} className="w-full px-4 py-3 text-sm font-medium bg-white/50 backdrop-blur-sm border border-slate-200 rounded-xl outline-none transition-all focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 placeholder:text-slate-400 hover:border-slate-300 resize-none" />
          </div>
          <div className="flex items-center gap-2 px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl"><Lock size={14} className="text-slate-400" /><span className="text-xs font-semibold text-slate-500">Branch: Manila (Fixed)</span></div>
        </PageModal>
      )}

      {/* ---- ADD BUDGET MODAL (PageModal + InputGroup + IconSelect) ---- */}
      <PageModal isOpen={isAddBdgOpen} onClose={() => setIsAddBdgOpen(false)} title="Add Budget" subtitle="Create a new budget category for this branch." maxWidth="max-w-lg" footer={<div className="flex justify-end items-center gap-2 w-full"><SecondaryButton onClick={() => setIsAddBdgOpen(false)}>Cancel</SecondaryButton><PrimaryButton onClick={handleSaveAddBudget} className="!w-auto !py-2.5 !px-6 !text-xs !rounded-full">Create Budget</PrimaryButton></div>}>
        <InputGroup id="add-cat" label="Budget Category *" placeholder="e.g. Packaging" icon={Layers} value={addCategory} onChange={(e) => setAddCategory(e.target.value)} />
        <InputGroup id="add-alloc" label="Allocated Amount (₱) *" placeholder="e.g. 50000" icon={DollarSign} type="number" value={addAllocated} onChange={(e) => setAddAllocated(e.target.value)} />
        <InputGroup id="add-owner" label="Budget Owner" placeholder="e.g. Maria Santos" icon={User} value={addOwner} onChange={(e) => setAddOwner(e.target.value)} />
        <div className="flex flex-col gap-1.5">
          <label htmlFor="add-notes" className="text-xs font-semibold text-slate-500 tracking-wide">Notes</label>
          <textarea id="add-notes" rows={3} placeholder="Budget description and notes..." value={addNotes} onChange={(e) => setAddNotes(e.target.value)} className="w-full px-4 py-3 text-sm font-medium bg-white/50 backdrop-blur-sm border border-slate-200 rounded-xl outline-none transition-all focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 placeholder:text-slate-400 hover:border-slate-300 resize-none" />
        </div>
        <div className="flex items-center gap-2 px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl"><Lock size={14} className="text-slate-400" /><span className="text-xs font-semibold text-slate-500">Branch: Manila (Fixed)</span></div>
      </PageModal>

      {/* ---- CONFIRMATION MODAL ---- */}
      <ConfirmationModal isOpen={confirmModal.isOpen} onClose={() => setConfirmModal((p) => ({ ...p, isOpen: false }))} onConfirm={confirmModal.action} title={confirmModal.title} message={confirmModal.message} variant={confirmModal.variant} confirmText={confirmModal.confirmText} />

      {/* ---- TOAST ---- */}
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </>
  );
};

export default AdminFinancePage;
