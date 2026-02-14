// ==========================================
// FINBudgetsPage.tsx
// Finance Manager — Budgets Page
// Full CRUD for budgets: Create, View, Edit (Draft only),
// Submit for Approval, Archive. KPI cards, filters, pagination.
// ==========================================

import React, { useState, useMemo } from "react";
import FinanceLayout from "../../layout/FinanceLayout";
import StatsCard from "../../components/ui/StatsCard";
import { TableToolbar } from "../../components/ui/TableToolbar";
import { StatusBadge } from "../../components/ui/StatusBadge";
import Pagination from "../../components/ui/Pagination";
import PageModal from "../../components/ui/PageModal";
import ConfirmationModal from "../../components/ui/ConfirmationModal";
import Toast from "../../components/ui/Toast";
import IconSelect from "../../components/ui/IconSelect";
import type { IconSelectOption } from "../../components/ui/IconSelect";
import InputGroup from "../../components/ui/InputGroup";
import SecondaryButton from "../../components/ui/SecondaryButton";
import PrimaryButton from "../../components/ui/PrimaryButton";
import BudgetUtilizationBar from "../../components/ui/BudgetUtilizationBar";
import {
  Wallet,
  PiggyBank,
  TrendingUp,
  Percent,
  Plus,
  Eye,
  Edit,
  Send,
  Archive,
  Calendar,
  FileText,
  Layers,
} from "lucide-react";

// ------------------------------------------
// Types
// ------------------------------------------
type BudgetStatus = "Draft" | "Pending" | "Approved" | "Locked";

interface BudgetBreakdown {
  materials: number;
  labor: number;
  wasteAllowance: number;
}

interface Budget {
  id: string;
  name: string;
  periodStart: string;
  periodEnd: string;
  totalBudget: number;
  spentAmount: number;
  status: BudgetStatus;
  breakdown: BudgetBreakdown;
  notes: string;
}

// ------------------------------------------
// Constants
// ------------------------------------------
const ITEMS_PER_PAGE = 6;

const formatCurrency = (n: number) =>
  new Intl.NumberFormat("en-PH", { style: "currency", currency: "PHP", minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(n);

const PERIOD_OPTIONS: IconSelectOption[] = [
  { value: "", label: "All Periods", icon: Calendar },
  { value: "Q1 2026", label: "Q1 2026", icon: Calendar },
  { value: "Q2 2026", label: "Q2 2026", icon: Calendar },
  { value: "Q3 2026", label: "Q3 2026", icon: Calendar },
  { value: "Q4 2026", label: "Q4 2026", icon: Calendar },
  { value: "H1 2026", label: "H1 2026", icon: Calendar },
  { value: "FY 2026", label: "FY 2026", icon: Calendar },
];

const STATUS_OPTIONS: IconSelectOption[] = [
  { value: "", label: "All Statuses", icon: Layers },
  { value: "Draft", label: "Draft", icon: FileText },
  { value: "Pending", label: "Pending", icon: Send },
  { value: "Approved", label: "Approved", icon: TrendingUp },
  { value: "Locked", label: "Locked", icon: Archive },
];

const getPeriodLabel = (start: string, end: string): string => {
  const s = new Date(start);
  const _e = new Date(end);
  const q = Math.floor((s.getMonth() + 1) / 3) + 1;
  const y = s.getFullYear();
  return `Q${q} ${y}`;
};

// ------------------------------------------
// Mock Data
// ------------------------------------------
const MOCK_BUDGETS: Budget[] = [
  { id: "BDG-2026-001", name: "Summer Collection 2026", periodStart: "2026-01-01", periodEnd: "2026-03-31", totalBudget: 2_450_000, spentAmount: 2_303_000, status: "Approved", breakdown: { materials: 1_470_000, labor: 735_000, wasteAllowance: 245_000 }, notes: "Main summer line — cotton blends, linens, lightweight fabrics." },
  { id: "BDG-2026-002", name: "Winter Essentials", periodStart: "2026-04-01", periodEnd: "2026-06-30", totalBudget: 1_850_000, spentAmount: 0, status: "Draft", breakdown: { materials: 1_110_000, labor: 555_000, wasteAllowance: 185_000 }, notes: "Heavy knits, wool blends, fleece." },
  { id: "BDG-2026-003", name: "Q1 Materials Procurement", periodStart: "2026-01-01", periodEnd: "2026-03-31", totalBudget: 1_200_000, spentAmount: 985_000, status: "Locked", breakdown: { materials: 1_200_000, labor: 0, wasteAllowance: 0 }, notes: "Raw fabrics, threads, zippers, buttons." },
  { id: "BDG-2026-004", name: "Denim Line Fall 2026", periodStart: "2026-07-01", periodEnd: "2026-09-30", totalBudget: 1_680_000, spentAmount: 0, status: "Draft", breakdown: { materials: 1_008_000, labor: 504_000, wasteAllowance: 168_000 }, notes: "Denim jackets, jeans, skirts." },
  { id: "BDG-2026-005", name: "Kids Wear Spring 2026", periodStart: "2026-01-01", periodEnd: "2026-03-31", totalBudget: 890_000, spentAmount: 756_500, status: "Approved", breakdown: { materials: 534_000, labor: 267_000, wasteAllowance: 89_000 }, notes: "Children's apparel — cotton, safe dyes." },
  { id: "BDG-2026-006", name: "Uniform & Corporate", periodStart: "2026-01-01", periodEnd: "2026-06-30", totalBudget: 650_000, spentAmount: 520_000, status: "Pending", breakdown: { materials: 390_000, labor: 195_000, wasteAllowance: 65_000 }, notes: "Corporate uniforms, school uniforms." },
  { id: "BDG-2026-007", name: "Equipment & Maintenance", periodStart: "2026-01-01", periodEnd: "2026-12-31", totalBudget: 420_000, spentAmount: 189_000, status: "Approved", breakdown: { materials: 0, labor: 252_000, wasteAllowance: 168_000 }, notes: "Sewing machines, cutting equipment, repairs." },
  { id: "BDG-2026-008", name: "Eco Fiber Pilot", periodStart: "2026-04-01", periodEnd: "2026-09-30", totalBudget: 380_000, spentAmount: 0, status: "Draft", breakdown: { materials: 228_000, labor: 114_000, wasteAllowance: 38_000 }, notes: "Recycled polyester, organic cotton trial." },
];

// ==========================================
// Component
// ==========================================
const FINBudgetsPage: React.FC = () => {
  const [budgets, setBudgets] = useState<Budget[]>(MOCK_BUDGETS);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterPeriod, setFilterPeriod] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);

  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isViewOpen, setIsViewOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [selectedBudget, setSelectedBudget] = useState<Budget | null>(null);

  const [submitForApprovalBudget, setSubmitForApprovalBudget] = useState<Budget | null>(null);
  const [archiveBudget, setArchiveBudget] = useState<Budget | null>(null);

  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);

  // Create/Edit form state
  const [formName, setFormName] = useState("");
  const [formPeriodStart, setFormPeriodStart] = useState("");
  const [formPeriodEnd, setFormPeriodEnd] = useState("");
  const [formMaterials, setFormMaterials] = useState("");
  const [formLabor, setFormLabor] = useState("");
  const [formWaste, setFormWaste] = useState("");
  const [formNotes, setFormNotes] = useState("");

  // ------------------------------------------
  // Computed
  // ------------------------------------------
  const totalAllocated = useMemo(() => budgets.reduce((s, b) => s + b.totalBudget, 0), [budgets]);
  const totalSpent = useMemo(() => budgets.reduce((s, b) => s + b.spentAmount, 0), [budgets]);
  const avgUtilization = useMemo(() => {
    const withSpend = budgets.filter((b) => b.totalBudget > 0 && b.spentAmount > 0);
    if (withSpend.length === 0) return 0;
    const sum = withSpend.reduce((s, b) => s + (b.spentAmount / b.totalBudget) * 100, 0);
    return Math.round(sum / withSpend.length);
  }, [budgets]);

  const filteredBudgets = useMemo(() => {
    let data = budgets;
    const q = searchQuery.toLowerCase().trim();
    if (q) {
      data = data.filter(
        (b) =>
          b.id.toLowerCase().includes(q) ||
          b.name.toLowerCase().includes(q) ||
          getPeriodLabel(b.periodStart, b.periodEnd).toLowerCase().includes(q)
      );
    }
    if (filterPeriod) {
      data = data.filter((b) => getPeriodLabel(b.periodStart, b.periodEnd) === filterPeriod);
    }
    if (filterStatus) {
      data = data.filter((b) => b.status === filterStatus);
    }
    return data;
  }, [budgets, searchQuery, filterPeriod, filterStatus]);

  const totalPages = Math.max(1, Math.ceil(filteredBudgets.length / ITEMS_PER_PAGE));
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = Math.min(startIndex + ITEMS_PER_PAGE, filteredBudgets.length);
  const paginatedBudgets = filteredBudgets.slice(startIndex, endIndex);

  const formTotal = useMemo(() => {
    const m = parseFloat(formMaterials) || 0;
    const l = parseFloat(formLabor) || 0;
    const w = parseFloat(formWaste) || 0;
    return m + l + w;
  }, [formMaterials, formLabor, formWaste]);

  // ------------------------------------------
  // Handlers
  // ------------------------------------------
  const resetForm = () => {
    setFormName("");
    setFormPeriodStart("");
    setFormPeriodEnd("");
    setFormMaterials("");
    setFormLabor("");
    setFormWaste("");
    setFormNotes("");
  };

  const openCreate = () => {
    resetForm();
    setSelectedBudget(null);
    setIsCreateOpen(true);
  };

  const openView = (b: Budget) => {
    setSelectedBudget(b);
    setIsViewOpen(true);
  };

  const openEdit = (b: Budget) => {
    if (b.status !== "Draft") return;
    setSelectedBudget(b);
    setFormName(b.name);
    setFormPeriodStart(b.periodStart);
    setFormPeriodEnd(b.periodEnd);
    setFormMaterials(String(b.breakdown.materials));
    setFormLabor(String(b.breakdown.labor));
    setFormWaste(String(b.breakdown.wasteAllowance));
    setFormNotes(b.notes);
    setIsEditOpen(true);
  };

  const handleCreate = () => {
    const total = formTotal;
    if (!formName || total <= 0) {
      setToast({ message: "Budget name and breakdown amounts are required.", type: "error" });
      return;
    }
    if (!formPeriodStart || !formPeriodEnd) {
      setToast({ message: "Period start and end dates are required.", type: "error" });
      return;
    }
    const newBudget: Budget = {
      id: `BDG-2026-${String(budgets.length + 1).padStart(3, "0")}`,
      name: formName,
      periodStart: formPeriodStart,
      periodEnd: formPeriodEnd,
      totalBudget: total,
      spentAmount: 0,
      status: "Draft",
      breakdown: {
        materials: parseFloat(formMaterials) || 0,
        labor: parseFloat(formLabor) || 0,
        wasteAllowance: parseFloat(formWaste) || 0,
      },
      notes: formNotes,
    };
    setBudgets((prev) => [newBudget, ...prev]);
    setToast({ message: `Budget ${newBudget.id} created successfully.`, type: "success" });
    setIsCreateOpen(false);
    resetForm();
  };

  const handleEdit = () => {
    if (!selectedBudget || selectedBudget.status !== "Draft") return;
    const total = formTotal;
    if (!formName || total <= 0) {
      setToast({ message: "Budget name and breakdown amounts are required.", type: "error" });
      return;
    }
    setBudgets((prev) =>
      prev.map((b) =>
        b.id === selectedBudget.id
          ? {
              ...b,
              name: formName,
              periodStart: formPeriodStart,
              periodEnd: formPeriodEnd,
              totalBudget: total,
              breakdown: {
                materials: parseFloat(formMaterials) || 0,
                labor: parseFloat(formLabor) || 0,
                wasteAllowance: parseFloat(formWaste) || 0,
              },
              notes: formNotes,
            }
          : b
      )
    );
    setToast({ message: `Budget ${selectedBudget.id} updated successfully.`, type: "success" });
    setIsEditOpen(false);
    setSelectedBudget(null);
    resetForm();
  };

  const handleSubmitForApproval = () => {
    if (submitForApprovalBudget) {
      setBudgets((prev) =>
        prev.map((b) => (b.id === submitForApprovalBudget.id ? { ...b, status: "Pending" as BudgetStatus } : b))
      );
      setToast({ message: `${submitForApprovalBudget.id} submitted for approval.`, type: "success" });
      setSubmitForApprovalBudget(null);
    }
  };

  const handleArchive = () => {
    if (archiveBudget) {
      setBudgets((prev) => prev.filter((b) => b.id !== archiveBudget.id));
      setToast({ message: `${archiveBudget.id} has been archived.`, type: "success" });
      setArchiveBudget(null);
    }
  };

  const filterLabel =
    filterPeriod || filterStatus
      ? [filterPeriod, filterStatus].filter(Boolean).join(" · ")
      : "Filters";

  return (
    <FinanceLayout>
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

      {/* Page Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Budgets</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Manage collection, line, and seasonal budgets — Manila Branch</p>
        </div>
        <PrimaryButton onClick={openCreate} className="!w-auto !py-2.5 !px-6 !rounded-xl !text-xs">
          <Plus size={16} strokeWidth={2.5} />
          Add Budget
        </PrimaryButton>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatsCard title="Total Budgets" value={budgets.length} icon={Wallet} color="bg-indigo-500" />
        <StatsCard title="Total Allocated" value={formatCurrency(totalAllocated)} icon={PiggyBank} color="bg-emerald-500" />
        <StatsCard title="Total Spent" value={formatCurrency(totalSpent)} icon={TrendingUp} color="bg-amber-500" />
        <StatsCard title="Avg Utilization" value={`${avgUtilization}%`} icon={Percent} color="bg-violet-500" />
      </div>

      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between mb-6">
        <TableToolbar
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          isFilterOpen={isFilterOpen}
          setIsFilterOpen={setIsFilterOpen}
          placeholder="Search by budget ID or name..."
          filterLabel={filterLabel}
        >
          <div className="p-3 space-y-2 min-w-[180px]">
            <IconSelect
              label="Period"
              value={filterPeriod}
              onChange={(v) => {
                setFilterPeriod(v);
                setCurrentPage(1);
              }}
              options={PERIOD_OPTIONS}
              placeholder="All Periods"
            />
            <IconSelect
              label="Status"
              value={filterStatus}
              onChange={(v) => {
                setFilterStatus(v);
                setCurrentPage(1);
              }}
              options={STATUS_OPTIONS}
              placeholder="All Statuses"
            />
          </div>
        </TableToolbar>
      </div>

      {/* Table */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700">
                <th className="px-6 py-3 text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Budget ID</th>
                <th className="px-6 py-3 text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Budget Name</th>
                <th className="px-6 py-3 text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Period</th>
                <th className="px-6 py-3 text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Total Budget</th>
                <th className="px-6 py-3 text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Spent</th>
                <th className="px-6 py-3 text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Remaining</th>
                <th className="px-6 py-3 text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider w-32">Utilization</th>
                <th className="px-6 py-3 text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider text-left">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
              {paginatedBudgets.map((b) => {
                const remaining = Math.max(0, b.totalBudget - b.spentAmount);
                return (
                  <tr key={b.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/50 transition-colors">
                    <td className="px-6 py-3 text-xs font-bold text-indigo-600 dark:text-indigo-400">{b.id}</td>
                    <td className="px-6 py-3 text-sm font-medium text-slate-800 dark:text-slate-200">{b.name}</td>
                    <td className="px-6 py-3 text-xs text-slate-600 dark:text-slate-400">{getPeriodLabel(b.periodStart, b.periodEnd)}</td>
                    <td className="px-6 py-3 text-sm font-semibold text-slate-800 dark:text-slate-200">{formatCurrency(b.totalBudget)}</td>
                    <td className="px-6 py-3 text-sm font-medium text-slate-700 dark:text-slate-300">{formatCurrency(b.spentAmount)}</td>
                    <td className="px-6 py-3 text-sm font-medium text-slate-700 dark:text-slate-300">{formatCurrency(remaining)}</td>
                    <td className="px-6 py-3 w-32">
                      <BudgetUtilizationBar spent={b.spentAmount} total={b.totalBudget} height="h-1.5" />
                    </td>
                    <td className="px-6 py-3">
                      <StatusBadge status={b.status} />
                    </td>
                    <td className="px-6 py-3 text-left">
                      <div className="flex justify-start items-center gap-1">
                        <button onClick={() => openView(b)} className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 rounded-lg transition-colors" title="View">
                          <Eye size={14} />
                        </button>
                        {b.status === "Draft" && (
                          <button onClick={() => openEdit(b)} className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors" title="Edit">
                            <Edit size={14} />
                          </button>
                        )}
                        {b.status === "Draft" && (
                          <button onClick={() => setSubmitForApprovalBudget(b)} className="p-1.5 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 rounded-lg transition-colors" title="Submit for Approval">
                            <Send size={14} />
                          </button>
                        )}
                        <button onClick={() => setArchiveBudget(b)} className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-900/20 rounded-lg transition-colors" title="Archive">
                          <Archive size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        {filteredBudgets.length === 0 && (
          <div className="px-6 py-16 text-center">
            <Wallet size={40} className="mx-auto text-slate-300 dark:text-slate-600 mb-3" />
            <p className="text-sm font-medium text-slate-500 dark:text-slate-400">No budgets found</p>
            <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">Try adjusting your search or filter criteria.</p>
          </div>
        )}
        <Pagination currentPage={currentPage} totalPages={totalPages} startIndex={startIndex} endIndex={endIndex} totalItems={filteredBudgets.length} onPageChange={setCurrentPage} />
      </div>

      {/* Create Budget Modal */}
      <PageModal
        isOpen={isCreateOpen}
        onClose={() => { setIsCreateOpen(false); resetForm(); }}
        title="Create Budget"
        subtitle="Add a new collection, line, or seasonal budget."
        maxWidth="max-w-2xl"
        footer={
          <div className="flex justify-end gap-3">
            <SecondaryButton onClick={() => { setIsCreateOpen(false); resetForm(); }}>Cancel</SecondaryButton>
            <PrimaryButton onClick={handleCreate} className="!w-auto !py-2.5 !px-6 !rounded-xl !text-xs">Create Budget</PrimaryButton>
          </div>
        }
      >
        <div className="p-3 bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-200 dark:border-indigo-800 rounded-xl">
          <p className="text-[11px] text-indigo-700 dark:text-indigo-400 font-medium">
            Total budget is auto-computed from the breakdown (Materials + Labor + Waste Allowance). Spent amount will be tracked from cost records.
          </p>
        </div>
        <InputGroup id="create-name" label="Budget Name (Collection/Line/Season)" value={formName} onChange={(e) => setFormName(e.target.value)} placeholder="e.g. Summer Collection 2026" icon={FileText} />
        <div className="grid grid-cols-2 gap-4">
          <InputGroup id="create-period-start" label="Period Start" type="date" value={formPeriodStart} onChange={(e) => setFormPeriodStart(e.target.value)} icon={Calendar} />
          <InputGroup id="create-period-end" label="Period End" type="date" value={formPeriodEnd} onChange={(e) => setFormPeriodEnd(e.target.value)} icon={Calendar} />
        </div>
        <div>
          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2 ml-1">Breakdown (₱)</p>
          <div className="grid grid-cols-3 gap-4">
            <InputGroup id="create-materials" label="Materials" type="number" value={formMaterials} onChange={(e) => setFormMaterials(e.target.value)} placeholder="0" icon={Layers} />
            <InputGroup id="create-labor" label="Labor" type="number" value={formLabor} onChange={(e) => setFormLabor(e.target.value)} placeholder="0" icon={TrendingUp} />
            <InputGroup id="create-waste" label="Waste Allowance" type="number" value={formWaste} onChange={(e) => setFormWaste(e.target.value)} placeholder="0" icon={Archive} />
          </div>
          <p className="text-[10px] text-slate-500 mt-1 ml-1">Total: {formatCurrency(formTotal)}</p>
        </div>
        <InputGroup id="create-notes" label="Notes" value={formNotes} onChange={(e) => setFormNotes(e.target.value)} placeholder="Optional notes..." icon={FileText} />
      </PageModal>

      {/* View Budget Modal */}
      <PageModal
        isOpen={isViewOpen}
        onClose={() => { setIsViewOpen(false); setSelectedBudget(null); }}
        title={selectedBudget?.name ?? "Budget Details"}
        subtitle={selectedBudget ? `${selectedBudget.id} · ${getPeriodLabel(selectedBudget.periodStart, selectedBudget.periodEnd)}` : undefined}
        badges={selectedBudget ? <StatusBadge status={selectedBudget.status} className="ml-2" /> : undefined}
        maxWidth="max-w-2xl"
        footer={
          <div className="flex justify-end gap-3">
            <SecondaryButton onClick={() => { setIsViewOpen(false); setSelectedBudget(null); }}>Close</SecondaryButton>
            {selectedBudget?.status === "Draft" && (
              <PrimaryButton onClick={() => { setIsViewOpen(false); openEdit(selectedBudget); }} className="!w-auto !py-2.5 !px-6 !rounded-xl !text-xs">Edit Budget</PrimaryButton>
            )}
          </div>
        }
      >
        {selectedBudget && (
          <>
            <BudgetUtilizationBar spent={selectedBudget.spentAmount} total={selectedBudget.totalBudget} showLabels height="h-2" />
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Period</p>
                <p className="text-sm font-medium text-slate-800 dark:text-slate-200">
                  {selectedBudget.periodStart} — {selectedBudget.periodEnd}
                </p>
              </div>
              <div>
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Total Budget</p>
                <p className="text-sm font-bold text-slate-800 dark:text-slate-200">{formatCurrency(selectedBudget.totalBudget)}</p>
              </div>
              <div>
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Spent</p>
                <p className="text-sm font-medium text-slate-700 dark:text-slate-300">{formatCurrency(selectedBudget.spentAmount)}</p>
              </div>
              <div>
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Remaining</p>
                <p className="text-sm font-medium text-slate-700 dark:text-slate-300">{formatCurrency(Math.max(0, selectedBudget.totalBudget - selectedBudget.spentAmount))}</p>
              </div>
            </div>
            <div>
              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2">Breakdown</p>
              <div className="grid grid-cols-3 gap-3 p-3 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl">
                <div>
                  <p className="text-[10px] text-slate-500 mb-0.5">Materials</p>
                  <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">{formatCurrency(selectedBudget.breakdown.materials)}</p>
                </div>
                <div>
                  <p className="text-[10px] text-slate-500 mb-0.5">Labor</p>
                  <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">{formatCurrency(selectedBudget.breakdown.labor)}</p>
                </div>
                <div>
                  <p className="text-[10px] text-slate-500 mb-0.5">Waste Allowance</p>
                  <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">{formatCurrency(selectedBudget.breakdown.wasteAllowance)}</p>
                </div>
              </div>
            </div>
            {selectedBudget.notes && (
              <div>
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Notes</p>
                <p className="text-sm text-slate-600 dark:text-slate-400">{selectedBudget.notes}</p>
              </div>
            )}
          </>
        )}
      </PageModal>

      {/* Edit Budget Modal */}
      <PageModal
        isOpen={isEditOpen}
        onClose={() => { setIsEditOpen(false); setSelectedBudget(null); resetForm(); }}
        title="Edit Budget"
        subtitle="Only Draft budgets can be edited."
        maxWidth="max-w-2xl"
        footer={
          <div className="flex justify-end gap-3">
            <SecondaryButton onClick={() => { setIsEditOpen(false); setSelectedBudget(null); resetForm(); }}>Cancel</SecondaryButton>
            <PrimaryButton onClick={handleEdit} className="!w-auto !py-2.5 !px-6 !rounded-xl !text-xs">Save Changes</PrimaryButton>
          </div>
        }
      >
        <div className="p-3 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl">
          <p className="text-[11px] text-amber-700 dark:text-amber-400 font-medium">
            Only Draft budgets can be edited. Submitted or approved budgets require a separate amendment process.
          </p>
        </div>
        <InputGroup id="edit-name" label="Budget Name (Collection/Line/Season)" value={formName} onChange={(e) => setFormName(e.target.value)} placeholder="e.g. Summer Collection 2026" icon={FileText} />
        <div className="grid grid-cols-2 gap-4">
          <InputGroup id="edit-period-start" label="Period Start" type="date" value={formPeriodStart} onChange={(e) => setFormPeriodStart(e.target.value)} icon={Calendar} />
          <InputGroup id="edit-period-end" label="Period End" type="date" value={formPeriodEnd} onChange={(e) => setFormPeriodEnd(e.target.value)} icon={Calendar} />
        </div>
        <div>
          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2 ml-1">Breakdown (₱)</p>
          <div className="grid grid-cols-3 gap-4">
            <InputGroup id="edit-materials" label="Materials" type="number" value={formMaterials} onChange={(e) => setFormMaterials(e.target.value)} placeholder="0" icon={Layers} />
            <InputGroup id="edit-labor" label="Labor" type="number" value={formLabor} onChange={(e) => setFormLabor(e.target.value)} placeholder="0" icon={TrendingUp} />
            <InputGroup id="edit-waste" label="Waste Allowance" type="number" value={formWaste} onChange={(e) => setFormWaste(e.target.value)} placeholder="0" icon={Archive} />
          </div>
          <p className="text-[10px] text-slate-500 mt-1 ml-1">Total: {formatCurrency(formTotal)}</p>
        </div>
        <InputGroup id="edit-notes" label="Notes" value={formNotes} onChange={(e) => setFormNotes(e.target.value)} placeholder="Optional notes..." icon={FileText} />
      </PageModal>

      {/* Submit for Approval Confirmation */}
      <ConfirmationModal
        isOpen={!!submitForApprovalBudget}
        onClose={() => setSubmitForApprovalBudget(null)}
        onConfirm={handleSubmitForApproval}
        title="Submit for Approval"
        message={submitForApprovalBudget ? `Submit budget "${submitForApprovalBudget.name}" (${submitForApprovalBudget.id}) for approval? It will move to Pending status.` : ""}
        confirmText="Submit"
      />

      {/* Archive Confirmation */}
      <ConfirmationModal
        isOpen={!!archiveBudget}
        onClose={() => setArchiveBudget(null)}
        onConfirm={handleArchive}
        title="Archive Budget"
        message={archiveBudget ? `Archive budget "${archiveBudget.name}" (${archiveBudget.id})? This action cannot be undone.` : ""}
        variant="danger"
        confirmText="Archive"
      />
    </FinanceLayout>
  );
};

export default FINBudgetsPage;
