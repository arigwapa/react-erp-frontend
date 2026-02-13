// ==========================================
// FINArchivesPage.tsx — Finance Manager Archives
// View and manage archived financial records.
// Tabs: Budgets, Cost Records, COGS Reviews, Variance Reports
// ==========================================

import { useState, useMemo } from "react";
import {
  Archive,
  Wallet,
  Calculator,
  FileSearch,
  AlertTriangle,
  Search,
  RotateCcw,
  Trash2,
  Calendar,
  Filter,
  ChevronDown,
} from "lucide-react";

import FinanceLayout from "../../layout/FinanceLayout";
import TabBar from "../../components/ui/TabBar";
import { StatusBadge } from "../../components/ui/StatusBadge";
import Pagination from "../../components/ui/Pagination";

// ==========================================
// TABS
// ==========================================
const TABS = [
  { id: "budgets", label: "Budgets", icon: Wallet, count: 4 },
  { id: "cost-records", label: "Cost Records", icon: Calculator, count: 3 },
  { id: "cogs-reviews", label: "COGS Reviews", icon: FileSearch, count: 3 },
  { id: "variance", label: "Variance Reports", icon: AlertTriangle, count: 4 },
];

// ==========================================
// MOCK ARCHIVED DATA
// ==========================================
const ARCHIVED_BUDGETS = [
  { id: 1, budgetName: "Summer 2025 Collection", amount: "$45,000", status: "Closed", period: "Q2 2025", archivedDate: "Jan 9, 2026" },
  { id: 2, budgetName: "Fall 2025 Production", amount: "$62,000", status: "Closed", period: "Q3 2025", archivedDate: "Dec 31, 2025" },
  { id: 3, budgetName: "Winter 2025 Materials", amount: "$28,500", status: "Closed", period: "Q4 2025", archivedDate: "Dec 20, 2025" },
  { id: 4, budgetName: "Spring 2026 Launch", amount: "$55,000", status: "Archived", period: "Q1 2026", archivedDate: "Jan 12, 2026" },
];

const ARCHIVED_COST_RECORDS = [
  { id: 1, recordId: "CR-2026-0156", workOrder: "WO-2025-0089", totalCost: "$12,450", status: "Audited", archivedDate: "Jan 14, 2026" },
  { id: 2, recordId: "CR-2026-0142", workOrder: "WO-2025-0072", totalCost: "$8,920", status: "Audited", archivedDate: "Jan 6, 2026" },
  { id: 3, recordId: "CR-2025-0298", workOrder: "WO-2025-0065", totalCost: "$6,780", status: "Audited", archivedDate: "Dec 29, 2025" },
];

const ARCHIVED_COGS_REVIEWS = [
  { id: 1, reviewId: "COGS-2026-0089", workOrder: "WO-2025-0089", cogsCost: "$12.45", variance: "+2.3%", archivedDate: "Jan 14, 2026" },
  { id: 2, reviewId: "COGS-2026-0072", workOrder: "WO-2025-0072", cogsCost: "$29.73", variance: "-1.1%", archivedDate: "Jan 6, 2026" },
  { id: 3, reviewId: "COGS-2025-0165", workOrder: "WO-2025-0065", cogsCost: "$33.90", variance: "+0.5%", archivedDate: "Dec 29, 2025" },
];

const ARCHIVED_VARIANCE_REPORTS = [
  { id: 1, reportId: "VR-2026-Q1", period: "Q1 2026", budgetAmt: "$55,000", actualAmt: "$52,300", variancePct: "-4.9%", archivedDate: "Jan 15, 2026" },
  { id: 2, reportId: "VR-2025-Q4", period: "Q4 2025", budgetAmt: "$48,000", actualAmt: "$49,200", variancePct: "+2.5%", archivedDate: "Jan 8, 2026" },
  { id: 3, reportId: "VR-2025-Q3", period: "Q3 2025", budgetAmt: "$62,000", actualAmt: "$61,800", variancePct: "-0.3%", archivedDate: "Dec 31, 2025" },
  { id: 4, reportId: "VR-2025-Q2", period: "Q2 2025", budgetAmt: "$45,000", actualAmt: "$44,100", variancePct: "-2.0%", archivedDate: "Dec 22, 2025" },
];

const ITEMS_PER_PAGE = 5;

// ==========================================
// COMPONENT
// ==========================================
const FINArchivesPage = () => {
  const [activeTab, setActiveTab] = useState("budgets");
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
    setCurrentPage(1);
    setSearchQuery("");
  };

  const getData = () => {
    switch (activeTab) {
      case "budgets": return ARCHIVED_BUDGETS;
      case "cost-records": return ARCHIVED_COST_RECORDS;
      case "cogs-reviews": return ARCHIVED_COGS_REVIEWS;
      case "variance": return ARCHIVED_VARIANCE_REPORTS;
      default: return [];
    }
  };

  const filteredData = useMemo(() => {
    const data = getData();
    if (!searchQuery.trim()) return data;
    const q = searchQuery.toLowerCase();
    return data.filter((item) =>
      Object.values(item).some((val) =>
        String(val).toLowerCase().includes(q)
      )
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab, searchQuery]);

  const totalPages = Math.max(1, Math.ceil(filteredData.length / ITEMS_PER_PAGE));
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = Math.min(startIndex + ITEMS_PER_PAGE, filteredData.length);
  const pageData = filteredData.slice(startIndex, endIndex);

  // ==========================================
  // TABLE RENDERERS
  // ==========================================
  const renderBudgetsTable = () => (
    <table className="w-full text-left">
      <thead>
        <tr className="border-b border-slate-200">
          <th className="px-6 py-3 text-[10px] font-bold text-slate-500 uppercase tracking-wider">Budget Name</th>
          <th className="px-6 py-3 text-[10px] font-bold text-slate-500 uppercase tracking-wider">Amount</th>
          <th className="px-6 py-3 text-[10px] font-bold text-slate-500 uppercase tracking-wider">Status</th>
          <th className="px-6 py-3 text-[10px] font-bold text-slate-500 uppercase tracking-wider">Period</th>
          <th className="px-6 py-3 text-[10px] font-bold text-slate-500 uppercase tracking-wider">Archived Date</th>
          <th className="px-6 py-3 text-[10px] font-bold text-slate-500 uppercase tracking-wider text-left">Actions</th>
        </tr>
      </thead>
      <tbody className="divide-y divide-slate-100">
        {(pageData as typeof ARCHIVED_BUDGETS).map((item) => (
          <tr key={item.id} className="hover:bg-slate-50/50 transition-colors">
            <td className="px-6 py-4 text-xs font-semibold text-slate-800">{item.budgetName}</td>
            <td className="px-6 py-4 text-xs font-bold text-slate-700">{item.amount}</td>
            <td className="px-6 py-4"><StatusBadge status={item.status} /></td>
            <td className="px-6 py-4 text-xs text-slate-500">{item.period}</td>
            <td className="px-6 py-4 text-xs text-slate-500">{item.archivedDate}</td>
            <td className="px-6 py-4 text-left">
              <div className="flex items-center justify-start gap-2">
                <button className="p-1.5 text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors" title="Restore"><RotateCcw size={14} /></button>
                <button className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg transition-colors" title="Delete Permanently"><Trash2 size={14} /></button>
              </div>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );

  const renderCostRecordsTable = () => (
    <table className="w-full text-left">
      <thead>
        <tr className="border-b border-slate-200">
          <th className="px-6 py-3 text-[10px] font-bold text-slate-500 uppercase tracking-wider">Record ID</th>
          <th className="px-6 py-3 text-[10px] font-bold text-slate-500 uppercase tracking-wider">Work Order</th>
          <th className="px-6 py-3 text-[10px] font-bold text-slate-500 uppercase tracking-wider">Total Cost</th>
          <th className="px-6 py-3 text-[10px] font-bold text-slate-500 uppercase tracking-wider">Status</th>
          <th className="px-6 py-3 text-[10px] font-bold text-slate-500 uppercase tracking-wider">Archived Date</th>
          <th className="px-6 py-3 text-[10px] font-bold text-slate-500 uppercase tracking-wider text-left">Actions</th>
        </tr>
      </thead>
      <tbody className="divide-y divide-slate-100">
        {(pageData as typeof ARCHIVED_COST_RECORDS).map((item) => (
          <tr key={item.id} className="hover:bg-slate-50/50 transition-colors">
            <td className="px-6 py-4 text-xs font-semibold text-slate-800 font-mono">{item.recordId}</td>
            <td className="px-6 py-4 text-xs text-slate-600 font-mono">{item.workOrder}</td>
            <td className="px-6 py-4 text-xs font-bold text-slate-700">{item.totalCost}</td>
            <td className="px-6 py-4"><StatusBadge status={item.status} /></td>
            <td className="px-6 py-4 text-xs text-slate-500">{item.archivedDate}</td>
            <td className="px-6 py-4 text-left">
              <div className="flex items-center justify-start gap-2">
                <button className="p-1.5 text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors" title="Restore"><RotateCcw size={14} /></button>
                <button className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg transition-colors" title="Delete Permanently"><Trash2 size={14} /></button>
              </div>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );

  const renderCOGSReviewsTable = () => (
    <table className="w-full text-left">
      <thead>
        <tr className="border-b border-slate-200">
          <th className="px-6 py-3 text-[10px] font-bold text-slate-500 uppercase tracking-wider">Review ID</th>
          <th className="px-6 py-3 text-[10px] font-bold text-slate-500 uppercase tracking-wider">Work Order</th>
          <th className="px-6 py-3 text-[10px] font-bold text-slate-500 uppercase tracking-wider">COGS Cost</th>
          <th className="px-6 py-3 text-[10px] font-bold text-slate-500 uppercase tracking-wider">Variance</th>
          <th className="px-6 py-3 text-[10px] font-bold text-slate-500 uppercase tracking-wider">Archived Date</th>
          <th className="px-6 py-3 text-[10px] font-bold text-slate-500 uppercase tracking-wider text-left">Actions</th>
        </tr>
      </thead>
      <tbody className="divide-y divide-slate-100">
        {(pageData as typeof ARCHIVED_COGS_REVIEWS).map((item) => (
          <tr key={item.id} className="hover:bg-slate-50/50 transition-colors">
            <td className="px-6 py-4 text-xs font-semibold text-slate-800 font-mono">{item.reviewId}</td>
            <td className="px-6 py-4 text-xs text-slate-600 font-mono">{item.workOrder}</td>
            <td className="px-6 py-4 text-xs font-bold text-slate-700">{item.cogsCost}</td>
            <td className={`px-6 py-4 text-xs font-medium ${item.variance.startsWith("+") ? "text-red-600" : "text-emerald-600"}`}>{item.variance}</td>
            <td className="px-6 py-4 text-xs text-slate-500">{item.archivedDate}</td>
            <td className="px-6 py-4 text-left">
              <div className="flex items-center justify-start gap-2">
                <button className="p-1.5 text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors" title="Restore"><RotateCcw size={14} /></button>
                <button className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg transition-colors" title="Delete Permanently"><Trash2 size={14} /></button>
              </div>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );

  const renderVarianceTable = () => (
    <table className="w-full text-left">
      <thead>
        <tr className="border-b border-slate-200">
          <th className="px-6 py-3 text-[10px] font-bold text-slate-500 uppercase tracking-wider">Report ID</th>
          <th className="px-6 py-3 text-[10px] font-bold text-slate-500 uppercase tracking-wider">Period</th>
          <th className="px-6 py-3 text-[10px] font-bold text-slate-500 uppercase tracking-wider">Budget Amt</th>
          <th className="px-6 py-3 text-[10px] font-bold text-slate-500 uppercase tracking-wider">Actual Amt</th>
          <th className="px-6 py-3 text-[10px] font-bold text-slate-500 uppercase tracking-wider">Variance %</th>
          <th className="px-6 py-3 text-[10px] font-bold text-slate-500 uppercase tracking-wider">Archived Date</th>
          <th className="px-6 py-3 text-[10px] font-bold text-slate-500 uppercase tracking-wider text-left">Actions</th>
        </tr>
      </thead>
      <tbody className="divide-y divide-slate-100">
        {(pageData as typeof ARCHIVED_VARIANCE_REPORTS).map((item) => (
          <tr key={item.id} className="hover:bg-slate-50/50 transition-colors">
            <td className="px-6 py-4 text-xs font-semibold text-slate-800 font-mono">{item.reportId}</td>
            <td className="px-6 py-4 text-xs text-slate-600">{item.period}</td>
            <td className="px-6 py-4 text-xs text-slate-500">{item.budgetAmt}</td>
            <td className="px-6 py-4 text-xs text-slate-500">{item.actualAmt}</td>
            <td className={`px-6 py-4 text-xs font-medium ${item.variancePct.startsWith("+") ? "text-red-600" : "text-emerald-600"}`}>{item.variancePct}</td>
            <td className="px-6 py-4 text-xs text-slate-500">{item.archivedDate}</td>
            <td className="px-6 py-4 text-left">
              <div className="flex items-center justify-start gap-2">
                <button className="p-1.5 text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors" title="Restore"><RotateCcw size={14} /></button>
                <button className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg transition-colors" title="Delete Permanently"><Trash2 size={14} /></button>
              </div>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );

  const renderTable = () => {
    switch (activeTab) {
      case "budgets": return renderBudgetsTable();
      case "cost-records": return renderCostRecordsTable();
      case "cogs-reviews": return renderCOGSReviewsTable();
      case "variance": return renderVarianceTable();
      default: return null;
    }
  };

  return (
    <FinanceLayout>
      {/* Page Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center">
            <Archive size={20} className="text-slate-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-800">Finance Archives</h1>
            <p className="text-sm text-slate-500">View and manage archived financial records</p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="mb-6 overflow-x-auto">
        <TabBar tabs={TABS} activeTab={activeTab} onTabChange={handleTabChange} />
      </div>

      {/* Search & Filter Bar */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6 items-start sm:items-center justify-between">
        <div className="flex flex-1 items-center gap-3 w-full sm:w-auto">
          <div className="relative group flex-1 sm:flex-none">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-slate-900 transition-colors" size={14} />
            <input
              type="text"
              placeholder="Search archives..."
              value={searchQuery}
              onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
              className="w-full sm:w-64 pl-9 pr-4 py-2 text-xs font-medium bg-slate-50 border border-slate-200 rounded-full outline-none focus:bg-white focus:ring-2 focus:ring-slate-200 focus:border-slate-400 transition-all placeholder:text-slate-400"
            />
          </div>
          <div className="relative">
            <button
              onClick={() => setIsFilterOpen(!isFilterOpen)}
              className={`flex items-center gap-2 px-4 py-2 text-xs font-medium border rounded-full transition-all ${isFilterOpen ? "bg-slate-900 text-white border-slate-900" : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50"}`}
            >
              <Filter size={14} />
              <span>Filters</span>
              <ChevronDown size={12} className={`transition-transform ${isFilterOpen ? "rotate-180" : ""}`} />
            </button>
            {isFilterOpen && (
              <div className="absolute top-full left-0 mt-2 w-48 bg-white rounded-lg shadow-xl border border-slate-200 z-20 overflow-hidden">
                <button className="w-full px-4 py-2.5 text-xs text-left hover:bg-slate-50 flex items-center gap-2"><Calendar size={14} /> Last 7 days</button>
                <button className="w-full px-4 py-2.5 text-xs text-left hover:bg-slate-50 flex items-center gap-2"><Calendar size={14} /> Last 30 days</button>
                <button className="w-full px-4 py-2.5 text-xs text-left hover:bg-slate-50 flex items-center gap-2"><Calendar size={14} /> Last 90 days</button>
              </div>
            )}
          </div>
        </div>
        <div className="text-xs text-slate-500 font-medium">
          {filteredData.length} archived {filteredData.length === 1 ? "item" : "items"}
        </div>
      </div>

      {/* Table Card */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        {pageData.length > 0 ? (
          <>
            <div className="overflow-x-auto">{renderTable()}</div>
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              startIndex={startIndex}
              endIndex={endIndex}
              totalItems={filteredData.length}
              onPageChange={setCurrentPage}
            />
          </>
        ) : (
          <div className="py-16 text-center">
            <Archive size={40} className="mx-auto text-slate-300 mb-3" />
            <p className="text-sm font-semibold text-slate-500">No archived items found</p>
          </div>
        )}
      </div>
    </FinanceLayout>
  );
};

export default FINArchivesPage;
