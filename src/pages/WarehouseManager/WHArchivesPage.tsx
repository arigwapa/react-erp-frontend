// ==========================================
// WHArchivesPage.tsx — Warehouse Manager Archives
// View and manage archived warehouse records.
// Tabs: Inventory Items, Stock Movements, Adjustments, Intake Records
// ==========================================

import { useState, useMemo } from "react";
import {
  Archive,
  Package,
  ArrowLeftRight,
  ClipboardEdit,
  PackageCheck,
  Search,
  RotateCcw,
  Trash2,
  Calendar,
  Filter,
  ChevronDown,
} from "lucide-react";

import WarehouseLayout from "../../layout/WarehouseLayout";
import TabBar from "../../components/ui/TabBar";
import { StatusBadge } from "../../components/ui/StatusBadge";
import Pagination from "../../components/ui/Pagination";

// ==========================================
// TABS
// ==========================================
const TABS = [
  { id: "inventory", label: "Inventory Items", icon: Package, count: 4 },
  { id: "movements", label: "Stock Movements", icon: ArrowLeftRight, count: 3 },
  { id: "adjustments", label: "Adjustments", icon: ClipboardEdit, count: 3 },
  { id: "intake", label: "Intake Records", icon: PackageCheck, count: 4 },
];

// ==========================================
// MOCK ARCHIVED DATA
// ==========================================
const ARCHIVED_INVENTORY = [
  { id: 1, itemCode: "MAT-COT-001", name: "Cotton Fabric 60\"", category: "Raw Material", lastQty: "1,200 yds", archivedDate: "Jan 11, 2026" },
  { id: 2, itemCode: "MAT-SIL-002", name: "Silk Crepe 45\"", category: "Raw Material", lastQty: "350 yds", archivedDate: "Jan 4, 2026" },
  { id: 3, itemCode: "FG-SD-001", name: "Summer Dress V1 Batch", category: "Finished Goods", lastQty: "500 pcs", archivedDate: "Dec 28, 2025" },
  { id: 4, itemCode: "MAT-DEN-003", name: "Denim Fabric 12oz", category: "Raw Material", lastQty: "800 yds", archivedDate: "Dec 15, 2025" },
];

const ARCHIVED_MOVEMENTS = [
  { id: 1, movementId: "MOV-2026-0123", item: "Cotton Fabric 60\"", type: "In", qty: 500, archivedDate: "Jan 12, 2026" },
  { id: 2, movementId: "MOV-2026-0118", item: "Summer Dress V1", type: "Out", qty: 200, archivedDate: "Jan 8, 2026" },
  { id: 3, movementId: "MOV-2026-0105", item: "Silk Crepe 45\"", type: "Transfer", qty: 150, archivedDate: "Dec 30, 2025" },
];

const ARCHIVED_ADJUSTMENTS = [
  { id: 1, adjustmentId: "ADJ-2026-0042", item: "Cotton Fabric 60\"", reason: "Damaged stock", qtyChange: -50, archivedDate: "Jan 10, 2026" },
  { id: 2, adjustmentId: "ADJ-2026-0038", item: "Denim Fabric 12oz", reason: "Count correction", qtyChange: 25, archivedDate: "Jan 5, 2026" },
  { id: 3, adjustmentId: "ADJ-2025-0195", item: "Silk Crepe 45\"", reason: "Expired batch", qtyChange: -30, archivedDate: "Dec 28, 2025" },
];

const ARCHIVED_INTAKE = [
  { id: 1, intakeId: "INT-2026-0089", workOrder: "WO-2025-0089", product: "Summer Dress V1", qty: 500, archivedDate: "Jan 14, 2026" },
  { id: 2, intakeId: "INT-2026-0072", workOrder: "WO-2025-0072", product: "Denim Jacket Classic", qty: 300, archivedDate: "Jan 6, 2026" },
  { id: 3, intakeId: "INT-2025-0165", workOrder: "WO-2025-0065", product: "Silk Blouse Pearl", qty: 200, archivedDate: "Dec 29, 2025" },
  { id: 4, intakeId: "INT-2025-0158", workOrder: "WO-2025-0058", product: "Linen Pants Relaxed", qty: 150, archivedDate: "Dec 22, 2025" },
];

const ITEMS_PER_PAGE = 5;

// ==========================================
// COMPONENT
// ==========================================
const WHArchivesPage = () => {
  const [activeTab, setActiveTab] = useState("inventory");
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
      case "inventory": return ARCHIVED_INVENTORY;
      case "movements": return ARCHIVED_MOVEMENTS;
      case "adjustments": return ARCHIVED_ADJUSTMENTS;
      case "intake": return ARCHIVED_INTAKE;
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
  const renderInventoryTable = () => (
    <table className="w-full text-left">
      <thead>
        <tr className="border-b border-slate-200">
          <th className="px-6 py-3 text-[10px] font-bold text-slate-500 uppercase tracking-wider">Item Code</th>
          <th className="px-6 py-3 text-[10px] font-bold text-slate-500 uppercase tracking-wider">Name</th>
          <th className="px-6 py-3 text-[10px] font-bold text-slate-500 uppercase tracking-wider">Category</th>
          <th className="px-6 py-3 text-[10px] font-bold text-slate-500 uppercase tracking-wider">Last Qty</th>
          <th className="px-6 py-3 text-[10px] font-bold text-slate-500 uppercase tracking-wider">Archived Date</th>
          <th className="px-6 py-3 text-[10px] font-bold text-slate-500 uppercase tracking-wider text-left">Actions</th>
        </tr>
      </thead>
      <tbody className="divide-y divide-slate-100">
        {(pageData as typeof ARCHIVED_INVENTORY).map((item) => (
          <tr key={item.id} className="hover:bg-slate-50/50 transition-colors">
            <td className="px-6 py-4 text-xs font-semibold text-slate-800 font-mono">{item.itemCode}</td>
            <td className="px-6 py-4 text-xs text-slate-600">{item.name}</td>
            <td className="px-6 py-4"><StatusBadge status={item.category} /></td>
            <td className="px-6 py-4 text-xs text-slate-500">{item.lastQty}</td>
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

  const renderMovementsTable = () => (
    <table className="w-full text-left">
      <thead>
        <tr className="border-b border-slate-200">
          <th className="px-6 py-3 text-[10px] font-bold text-slate-500 uppercase tracking-wider">Movement ID</th>
          <th className="px-6 py-3 text-[10px] font-bold text-slate-500 uppercase tracking-wider">Item</th>
          <th className="px-6 py-3 text-[10px] font-bold text-slate-500 uppercase tracking-wider">Type</th>
          <th className="px-6 py-3 text-[10px] font-bold text-slate-500 uppercase tracking-wider">Qty</th>
          <th className="px-6 py-3 text-[10px] font-bold text-slate-500 uppercase tracking-wider">Archived Date</th>
          <th className="px-6 py-3 text-[10px] font-bold text-slate-500 uppercase tracking-wider text-left">Actions</th>
        </tr>
      </thead>
      <tbody className="divide-y divide-slate-100">
        {(pageData as typeof ARCHIVED_MOVEMENTS).map((item) => (
          <tr key={item.id} className="hover:bg-slate-50/50 transition-colors">
            <td className="px-6 py-4 text-xs font-semibold text-slate-800 font-mono">{item.movementId}</td>
            <td className="px-6 py-4 text-xs text-slate-600">{item.item}</td>
            <td className="px-6 py-4"><StatusBadge status={item.type} /></td>
            <td className="px-6 py-4 text-xs text-slate-500">{item.qty.toLocaleString()}</td>
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

  const renderAdjustmentsTable = () => (
    <table className="w-full text-left">
      <thead>
        <tr className="border-b border-slate-200">
          <th className="px-6 py-3 text-[10px] font-bold text-slate-500 uppercase tracking-wider">Adjustment ID</th>
          <th className="px-6 py-3 text-[10px] font-bold text-slate-500 uppercase tracking-wider">Item</th>
          <th className="px-6 py-3 text-[10px] font-bold text-slate-500 uppercase tracking-wider">Reason</th>
          <th className="px-6 py-3 text-[10px] font-bold text-slate-500 uppercase tracking-wider">Qty Change</th>
          <th className="px-6 py-3 text-[10px] font-bold text-slate-500 uppercase tracking-wider">Archived Date</th>
          <th className="px-6 py-3 text-[10px] font-bold text-slate-500 uppercase tracking-wider text-left">Actions</th>
        </tr>
      </thead>
      <tbody className="divide-y divide-slate-100">
        {(pageData as typeof ARCHIVED_ADJUSTMENTS).map((item) => (
          <tr key={item.id} className="hover:bg-slate-50/50 transition-colors">
            <td className="px-6 py-4 text-xs font-semibold text-slate-800 font-mono">{item.adjustmentId}</td>
            <td className="px-6 py-4 text-xs text-slate-600">{item.item}</td>
            <td className="px-6 py-4 text-xs text-slate-500">{item.reason}</td>
            <td className={`px-6 py-4 text-xs font-medium ${item.qtyChange >= 0 ? "text-emerald-600" : "text-red-600"}`}>{item.qtyChange >= 0 ? "+" : ""}{item.qtyChange}</td>
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

  const renderIntakeTable = () => (
    <table className="w-full text-left">
      <thead>
        <tr className="border-b border-slate-200">
          <th className="px-6 py-3 text-[10px] font-bold text-slate-500 uppercase tracking-wider">Intake ID</th>
          <th className="px-6 py-3 text-[10px] font-bold text-slate-500 uppercase tracking-wider">Work Order</th>
          <th className="px-6 py-3 text-[10px] font-bold text-slate-500 uppercase tracking-wider">Product</th>
          <th className="px-6 py-3 text-[10px] font-bold text-slate-500 uppercase tracking-wider">Qty</th>
          <th className="px-6 py-3 text-[10px] font-bold text-slate-500 uppercase tracking-wider">Archived Date</th>
          <th className="px-6 py-3 text-[10px] font-bold text-slate-500 uppercase tracking-wider text-left">Actions</th>
        </tr>
      </thead>
      <tbody className="divide-y divide-slate-100">
        {(pageData as typeof ARCHIVED_INTAKE).map((item) => (
          <tr key={item.id} className="hover:bg-slate-50/50 transition-colors">
            <td className="px-6 py-4 text-xs font-semibold text-slate-800 font-mono">{item.intakeId}</td>
            <td className="px-6 py-4 text-xs text-slate-600 font-mono">{item.workOrder}</td>
            <td className="px-6 py-4 text-xs text-slate-600">{item.product}</td>
            <td className="px-6 py-4 text-xs text-slate-500">{item.qty.toLocaleString()}</td>
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
      case "inventory": return renderInventoryTable();
      case "movements": return renderMovementsTable();
      case "adjustments": return renderAdjustmentsTable();
      case "intake": return renderIntakeTable();
      default: return null;
    }
  };

  return (
    <WarehouseLayout>
      {/* Page Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center">
            <Archive size={20} className="text-slate-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-800">Warehouse Archives</h1>
            <p className="text-sm text-slate-500">View and manage archived warehouse records</p>
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
    </WarehouseLayout>
  );
};

export default WHArchivesPage;
