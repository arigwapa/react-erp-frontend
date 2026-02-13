// ==========================================
// ProductionArchivesPage.tsx — Production Manager Archives
// View and manage archived production records.
// Tabs: Production Plans, Work Orders, Progress Logs, Handovers
// ==========================================

import { useState, useMemo } from "react";
import {
  Archive,
  ClipboardList,
  Hammer,
  Activity,
  PackageCheck,
  Search,
  RotateCcw,
  Trash2,
  Calendar,
  Filter,
  ChevronDown,
} from "lucide-react";

import ProductionLayout from "../../layout/ProductionLayout";
import TabBar from "../../components/ui/TabBar";
import type { Tab } from "../../components/ui/TabBar";
import { StatusBadge } from "../../components/ui/StatusBadge";
import Pagination from "../../components/ui/Pagination";

// ==========================================
// TABS
// ==========================================
const TABS: Tab[] = [
  { id: "plans", label: "Production Plans", icon: ClipboardList, count: 3 },
  { id: "work-orders", label: "Work Orders", icon: Hammer, count: 4 },
  { id: "progress-logs", label: "Progress Logs", icon: Activity, count: 3 },
  { id: "handovers", label: "Handovers", icon: PackageCheck, count: 3 },
];

// ==========================================
// MOCK ARCHIVED DATA
// ==========================================
const ARCHIVED_PLANS = [
  { id: 1, planId: "PP-2025-012", name: "Summer Collection Phase 1", collection: "Summer 2025", status: "Completed", archivedDate: "Jan 14, 2026" },
  { id: 2, planId: "PP-2025-009", name: "Fall Production Run", collection: "Fall 2025", status: "Archived", archivedDate: "Jan 8, 2026" },
  { id: 3, planId: "PP-2025-006", name: "Winter Prep Batch", collection: "Winter 2025", status: "Cancelled", archivedDate: "Dec 28, 2025" },
];

const ARCHIVED_WORK_ORDERS = [
  { id: 1, orderNo: "WO-2025-0089", product: "Summer Dress V1", qty: 500, status: "Completed", archivedDate: "Jan 14, 2026" },
  { id: 2, orderNo: "WO-2025-0072", product: "Denim Jacket Classic", qty: 300, status: "Cancelled", archivedDate: "Jan 6, 2026" },
  { id: 3, orderNo: "WO-2025-0065", product: "Silk Blouse Pearl", qty: 200, status: "Completed", archivedDate: "Dec 29, 2025" },
  { id: 4, orderNo: "WO-2025-0058", product: "Linen Pants Relaxed", qty: 150, status: "Completed", archivedDate: "Dec 22, 2025" },
];

const ARCHIVED_PROGRESS_LOGS = [
  { id: 1, logId: "PL-2025-0456", workOrder: "WO-2025-0089", stage: "Cutting", completion: 100, archivedDate: "Jan 14, 2026" },
  { id: 2, logId: "PL-2025-0442", workOrder: "WO-2025-0072", stage: "Sewing", completion: 65, archivedDate: "Jan 6, 2026" },
  { id: 3, logId: "PL-2025-0431", workOrder: "WO-2025-0065", stage: "Finishing", completion: 100, archivedDate: "Dec 29, 2025" },
];

const ARCHIVED_HANDOVERS = [
  { id: 1, handoverId: "HO-2025-089", workOrder: "WO-2025-0089", handoverTo: "Warehouse", status: "Completed", archivedDate: "Jan 14, 2026" },
  { id: 2, handoverId: "HO-2025-072", workOrder: "WO-2025-0072", handoverTo: "QA Team", status: "Cancelled", archivedDate: "Jan 6, 2026" },
  { id: 3, handoverId: "HO-2025-065", workOrder: "WO-2025-0065", handoverTo: "Warehouse", status: "Completed", archivedDate: "Dec 29, 2025" },
];

const ITEMS_PER_PAGE = 5;

// ==========================================
// COMPONENT
// ==========================================
const ProductionArchivesPage = () => {
  const [activeTab, setActiveTab] = useState("plans");
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
      case "plans": return ARCHIVED_PLANS;
      case "work-orders": return ARCHIVED_WORK_ORDERS;
      case "progress-logs": return ARCHIVED_PROGRESS_LOGS;
      case "handovers": return ARCHIVED_HANDOVERS;
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
  const renderPlansTable = () => (
    <table className="w-full text-left">
      <thead>
        <tr className="border-b border-slate-200">
          <th className="px-6 py-3 text-[10px] font-bold text-slate-500 uppercase tracking-wider">Plan ID</th>
          <th className="px-6 py-3 text-[10px] font-bold text-slate-500 uppercase tracking-wider">Name</th>
          <th className="px-6 py-3 text-[10px] font-bold text-slate-500 uppercase tracking-wider">Collection</th>
          <th className="px-6 py-3 text-[10px] font-bold text-slate-500 uppercase tracking-wider">Status</th>
          <th className="px-6 py-3 text-[10px] font-bold text-slate-500 uppercase tracking-wider">Archived Date</th>
          <th className="px-6 py-3 text-[10px] font-bold text-slate-500 uppercase tracking-wider text-left">Actions</th>
        </tr>
      </thead>
      <tbody className="divide-y divide-slate-100">
        {(pageData as typeof ARCHIVED_PLANS).map((item) => (
          <tr key={item.id} className="hover:bg-slate-50/50 transition-colors">
            <td className="px-6 py-4 text-xs font-mono font-semibold text-slate-800">{item.planId}</td>
            <td className="px-6 py-4 text-xs text-slate-600">{item.name}</td>
            <td className="px-6 py-4 text-xs text-slate-500">{item.collection}</td>
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

  const renderWorkOrdersTable = () => (
    <table className="w-full text-left">
      <thead>
        <tr className="border-b border-slate-200">
          <th className="px-6 py-3 text-[10px] font-bold text-slate-500 uppercase tracking-wider">Order No.</th>
          <th className="px-6 py-3 text-[10px] font-bold text-slate-500 uppercase tracking-wider">Product</th>
          <th className="px-6 py-3 text-[10px] font-bold text-slate-500 uppercase tracking-wider">Qty</th>
          <th className="px-6 py-3 text-[10px] font-bold text-slate-500 uppercase tracking-wider">Status</th>
          <th className="px-6 py-3 text-[10px] font-bold text-slate-500 uppercase tracking-wider">Archived Date</th>
          <th className="px-6 py-3 text-[10px] font-bold text-slate-500 uppercase tracking-wider text-left">Actions</th>
        </tr>
      </thead>
      <tbody className="divide-y divide-slate-100">
        {(pageData as typeof ARCHIVED_WORK_ORDERS).map((item) => (
          <tr key={item.id} className="hover:bg-slate-50/50 transition-colors">
            <td className="px-6 py-4 text-xs font-mono font-semibold text-slate-800">{item.orderNo}</td>
            <td className="px-6 py-4 text-xs text-slate-600">{item.product}</td>
            <td className="px-6 py-4 text-xs text-slate-500">{item.qty.toLocaleString()}</td>
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

  const renderProgressLogsTable = () => (
    <table className="w-full text-left">
      <thead>
        <tr className="border-b border-slate-200">
          <th className="px-6 py-3 text-[10px] font-bold text-slate-500 uppercase tracking-wider">Log ID</th>
          <th className="px-6 py-3 text-[10px] font-bold text-slate-500 uppercase tracking-wider">Work Order</th>
          <th className="px-6 py-3 text-[10px] font-bold text-slate-500 uppercase tracking-wider">Stage</th>
          <th className="px-6 py-3 text-[10px] font-bold text-slate-500 uppercase tracking-wider">Completion %</th>
          <th className="px-6 py-3 text-[10px] font-bold text-slate-500 uppercase tracking-wider">Archived Date</th>
          <th className="px-6 py-3 text-[10px] font-bold text-slate-500 uppercase tracking-wider text-left">Actions</th>
        </tr>
      </thead>
      <tbody className="divide-y divide-slate-100">
        {(pageData as typeof ARCHIVED_PROGRESS_LOGS).map((item) => (
          <tr key={item.id} className="hover:bg-slate-50/50 transition-colors">
            <td className="px-6 py-4 text-xs font-mono font-semibold text-slate-800">{item.logId}</td>
            <td className="px-6 py-4 text-xs text-slate-600">{item.workOrder}</td>
            <td className="px-6 py-4 text-xs text-slate-500">{item.stage}</td>
            <td className="px-6 py-4 text-xs text-slate-500">{item.completion}%</td>
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

  const renderHandoversTable = () => (
    <table className="w-full text-left">
      <thead>
        <tr className="border-b border-slate-200">
          <th className="px-6 py-3 text-[10px] font-bold text-slate-500 uppercase tracking-wider">Handover ID</th>
          <th className="px-6 py-3 text-[10px] font-bold text-slate-500 uppercase tracking-wider">Work Order</th>
          <th className="px-6 py-3 text-[10px] font-bold text-slate-500 uppercase tracking-wider">Handover To</th>
          <th className="px-6 py-3 text-[10px] font-bold text-slate-500 uppercase tracking-wider">Status</th>
          <th className="px-6 py-3 text-[10px] font-bold text-slate-500 uppercase tracking-wider">Archived Date</th>
          <th className="px-6 py-3 text-[10px] font-bold text-slate-500 uppercase tracking-wider text-left">Actions</th>
        </tr>
      </thead>
      <tbody className="divide-y divide-slate-100">
        {(pageData as typeof ARCHIVED_HANDOVERS).map((item) => (
          <tr key={item.id} className="hover:bg-slate-50/50 transition-colors">
            <td className="px-6 py-4 text-xs font-mono font-semibold text-slate-800">{item.handoverId}</td>
            <td className="px-6 py-4 text-xs text-slate-600">{item.workOrder}</td>
            <td className="px-6 py-4 text-xs text-slate-500">{item.handoverTo}</td>
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

  const renderTable = () => {
    switch (activeTab) {
      case "plans": return renderPlansTable();
      case "work-orders": return renderWorkOrdersTable();
      case "progress-logs": return renderProgressLogsTable();
      case "handovers": return renderHandoversTable();
      default: return null;
    }
  };

  return (
    <ProductionLayout>
      {/* Page Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center">
            <Archive size={20} className="text-slate-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-800">Production Archives</h1>
            <p className="text-sm text-slate-500">View and manage archived production records</p>
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
    </ProductionLayout>
  );
};

export default ProductionArchivesPage;
