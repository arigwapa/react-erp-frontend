// ==========================================
// ArchivesPage.tsx — Super Admin Archives
// Central archive for all system-wide archived items.
// Tabs: Users, Branches, Products, Work Orders, Inspections, Inventory, Budgets
// ==========================================

import { useState, useMemo } from "react";
import {
  Archive,
  Users,
  Building2,
  Package,
  Hammer,
  ClipboardCheck,
  Warehouse,
  DollarSign,
  Search,
  RotateCcw,
  Trash2,
  Calendar,
  Filter,
  ChevronDown,
} from "lucide-react";

import MainLayout from "../../layout/MainLayout";
import TabBar from "../../components/ui/TabBar";
import { StatusBadge } from "../../components/ui/StatusBadge";
import Pagination from "../../components/ui/Pagination";

// ==========================================
// TABS
// ==========================================
const TABS = [
  { id: "users", label: "Users", icon: Users, count: 4 },
  { id: "branches", label: "Branches", icon: Building2, count: 2 },
  { id: "products", label: "Products", icon: Package, count: 5 },
  { id: "work-orders", label: "Work Orders", icon: Hammer, count: 3 },
  { id: "inspections", label: "Inspections", icon: ClipboardCheck, count: 4 },
  { id: "inventory", label: "Inventory", icon: Warehouse, count: 3 },
  { id: "budgets", label: "Budgets", icon: DollarSign, count: 2 },
];

// ==========================================
// MOCK ARCHIVED DATA
// ==========================================
const ARCHIVED_USERS = [
  { id: 1, name: "Pedro Garcia", email: "pedro@erp.com", role: "PLM Manager", branch: "Branch A", archivedDate: "Jan 10, 2026", archivedBy: "Admin User" },
  { id: 2, name: "Lisa Tran", email: "lisa@erp.com", role: "QA Manager", branch: "Branch B", archivedDate: "Jan 5, 2026", archivedBy: "Admin User" },
  { id: 3, name: "Marco Reyes", email: "marco@erp.com", role: "Warehouse Manager", branch: "Branch A", archivedDate: "Dec 20, 2025", archivedBy: "Admin User" },
  { id: 4, name: "Sofia Cruz", email: "sofia@erp.com", role: "Finance Manager", branch: "Branch C", archivedDate: "Dec 15, 2025", archivedBy: "Admin User" },
];

const ARCHIVED_BRANCHES = [
  { id: 1, name: "Cebu Branch", code: "BR-CEB", location: "Cebu City", archivedDate: "Jan 8, 2026", archivedBy: "Admin User" },
  { id: 2, name: "Davao Branch", code: "BR-DAV", location: "Davao City", archivedDate: "Dec 28, 2025", archivedBy: "Admin User" },
];

const ARCHIVED_PRODUCTS = [
  { id: 1, name: "Summer Dress V1", sku: "SKU-SD001", category: "Dresses", collection: "Summer 2025", archivedDate: "Jan 12, 2026", archivedBy: "PLM Manager" },
  { id: 2, name: "Denim Jacket Classic", sku: "SKU-DJ002", category: "Jackets", collection: "Fall 2025", archivedDate: "Jan 8, 2026", archivedBy: "PLM Manager" },
  { id: 3, name: "Silk Blouse Pearl", sku: "SKU-SB003", category: "Tops", collection: "Spring 2025", archivedDate: "Dec 30, 2025", archivedBy: "PLM Manager" },
  { id: 4, name: "Linen Pants Relaxed", sku: "SKU-LP004", category: "Bottoms", collection: "Summer 2025", archivedDate: "Dec 22, 2025", archivedBy: "PLM Manager" },
  { id: 5, name: "Knit Sweater Cozy", sku: "SKU-KS005", category: "Knitwear", collection: "Winter 2025", archivedDate: "Dec 18, 2025", archivedBy: "PLM Manager" },
];

const ARCHIVED_WORK_ORDERS = [
  { id: 1, orderNo: "WO-2025-0089", product: "Summer Dress V1", qty: 500, status: "Completed", archivedDate: "Jan 14, 2026", archivedBy: "Production Manager" },
  { id: 2, orderNo: "WO-2025-0072", product: "Denim Jacket Classic", qty: 300, status: "Cancelled", archivedDate: "Jan 6, 2026", archivedBy: "Production Manager" },
  { id: 3, orderNo: "WO-2025-0065", product: "Silk Blouse Pearl", qty: 200, status: "Completed", archivedDate: "Dec 29, 2025", archivedBy: "Production Manager" },
];

const ARCHIVED_INSPECTIONS = [
  { id: 1, inspectionNo: "INS-2026-0034", product: "Summer Dress V1", type: "Final QC", result: "Passed", archivedDate: "Jan 13, 2026", archivedBy: "QA Manager" },
  { id: 2, inspectionNo: "INS-2026-0028", product: "Denim Jacket Classic", type: "Inline", result: "Failed", archivedDate: "Jan 7, 2026", archivedBy: "QA Manager" },
  { id: 3, inspectionNo: "INS-2025-0120", product: "Silk Blouse Pearl", type: "Final QC", result: "Passed", archivedDate: "Dec 30, 2025", archivedBy: "QA Manager" },
  { id: 4, inspectionNo: "INS-2025-0115", product: "Linen Pants Relaxed", type: "AQL", result: "Passed", archivedDate: "Dec 25, 2025", archivedBy: "QA Manager" },
];

const ARCHIVED_INVENTORY = [
  { id: 1, itemCode: "MAT-COT-001", name: "Cotton Fabric 60\"", category: "Raw Material", lastQty: "1,200 yds", archivedDate: "Jan 11, 2026", archivedBy: "Warehouse Manager" },
  { id: 2, itemCode: "MAT-SIL-002", name: "Silk Crepe 45\"", category: "Raw Material", lastQty: "350 yds", archivedDate: "Jan 4, 2026", archivedBy: "Warehouse Manager" },
  { id: 3, itemCode: "FG-SD-001", name: "Summer Dress V1 Batch", category: "Finished Goods", lastQty: "500 pcs", archivedDate: "Dec 28, 2025", archivedBy: "Warehouse Manager" },
];

const ARCHIVED_BUDGETS = [
  { id: 1, budgetName: "Summer 2025 Collection", amount: "$45,000", status: "Closed", period: "Q2 2025", archivedDate: "Jan 9, 2026", archivedBy: "Finance Manager" },
  { id: 2, budgetName: "Fall 2025 Production", amount: "$62,000", status: "Closed", period: "Q3 2025", archivedDate: "Dec 31, 2025", archivedBy: "Finance Manager" },
];

const ITEMS_PER_PAGE = 5;

// ==========================================
// COMPONENT
// ==========================================
const ArchivesPage = () => {
  const [activeTab, setActiveTab] = useState("users");
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  // Reset page on tab/search change
  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
    setCurrentPage(1);
    setSearchQuery("");
  };

  // Get data based on active tab
  const getData = () => {
    switch (activeTab) {
      case "users": return ARCHIVED_USERS;
      case "branches": return ARCHIVED_BRANCHES;
      case "products": return ARCHIVED_PRODUCTS;
      case "work-orders": return ARCHIVED_WORK_ORDERS;
      case "inspections": return ARCHIVED_INSPECTIONS;
      case "inventory": return ARCHIVED_INVENTORY;
      case "budgets": return ARCHIVED_BUDGETS;
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
  const renderUsersTable = () => (
    <table className="w-full text-left">
      <thead>
        <tr className="border-b border-slate-200">
          <th className="px-6 py-3 text-[10px] font-bold text-slate-500 uppercase tracking-wider">Name</th>
          <th className="px-6 py-3 text-[10px] font-bold text-slate-500 uppercase tracking-wider">Email</th>
          <th className="px-6 py-3 text-[10px] font-bold text-slate-500 uppercase tracking-wider">Role</th>
          <th className="px-6 py-3 text-[10px] font-bold text-slate-500 uppercase tracking-wider">Branch</th>
          <th className="px-6 py-3 text-[10px] font-bold text-slate-500 uppercase tracking-wider">Archived Date</th>
          <th className="px-6 py-3 text-[10px] font-bold text-slate-500 uppercase tracking-wider">Archived By</th>
          <th className="px-6 py-3 text-[10px] font-bold text-slate-500 uppercase tracking-wider text-left">Actions</th>
        </tr>
      </thead>
      <tbody className="divide-y divide-slate-100">
        {(pageData as typeof ARCHIVED_USERS).map((item) => (
          <tr key={item.id} className="hover:bg-slate-50/50 transition-colors">
            <td className="px-6 py-4 text-xs font-semibold text-slate-800">{item.name}</td>
            <td className="px-6 py-4 text-xs text-slate-500">{item.email}</td>
            <td className="px-6 py-4"><StatusBadge status={item.role} /></td>
            <td className="px-6 py-4 text-xs text-slate-500">{item.branch}</td>
            <td className="px-6 py-4 text-xs text-slate-500">{item.archivedDate}</td>
            <td className="px-6 py-4 text-xs text-slate-500">{item.archivedBy}</td>
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

  const renderBranchesTable = () => (
    <table className="w-full text-left">
      <thead>
        <tr className="border-b border-slate-200">
          <th className="px-6 py-3 text-[10px] font-bold text-slate-500 uppercase tracking-wider">Branch Name</th>
          <th className="px-6 py-3 text-[10px] font-bold text-slate-500 uppercase tracking-wider">Code</th>
          <th className="px-6 py-3 text-[10px] font-bold text-slate-500 uppercase tracking-wider">Location</th>
          <th className="px-6 py-3 text-[10px] font-bold text-slate-500 uppercase tracking-wider">Archived Date</th>
          <th className="px-6 py-3 text-[10px] font-bold text-slate-500 uppercase tracking-wider">Archived By</th>
          <th className="px-6 py-3 text-[10px] font-bold text-slate-500 uppercase tracking-wider text-left">Actions</th>
        </tr>
      </thead>
      <tbody className="divide-y divide-slate-100">
        {(pageData as typeof ARCHIVED_BRANCHES).map((item) => (
          <tr key={item.id} className="hover:bg-slate-50/50 transition-colors">
            <td className="px-6 py-4 text-xs font-semibold text-slate-800">{item.name}</td>
            <td className="px-6 py-4 text-xs text-slate-500 font-mono">{item.code}</td>
            <td className="px-6 py-4 text-xs text-slate-500">{item.location}</td>
            <td className="px-6 py-4 text-xs text-slate-500">{item.archivedDate}</td>
            <td className="px-6 py-4 text-xs text-slate-500">{item.archivedBy}</td>
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

  const renderProductsTable = () => (
    <table className="w-full text-left">
      <thead>
        <tr className="border-b border-slate-200">
          <th className="px-6 py-3 text-[10px] font-bold text-slate-500 uppercase tracking-wider">Product Name</th>
          <th className="px-6 py-3 text-[10px] font-bold text-slate-500 uppercase tracking-wider">SKU</th>
          <th className="px-6 py-3 text-[10px] font-bold text-slate-500 uppercase tracking-wider">Category</th>
          <th className="px-6 py-3 text-[10px] font-bold text-slate-500 uppercase tracking-wider">Collection</th>
          <th className="px-6 py-3 text-[10px] font-bold text-slate-500 uppercase tracking-wider">Archived Date</th>
          <th className="px-6 py-3 text-[10px] font-bold text-slate-500 uppercase tracking-wider text-left">Actions</th>
        </tr>
      </thead>
      <tbody className="divide-y divide-slate-100">
        {(pageData as typeof ARCHIVED_PRODUCTS).map((item) => (
          <tr key={item.id} className="hover:bg-slate-50/50 transition-colors">
            <td className="px-6 py-4 text-xs font-semibold text-slate-800">{item.name}</td>
            <td className="px-6 py-4 text-xs text-slate-500 font-mono">{item.sku}</td>
            <td className="px-6 py-4"><StatusBadge status={item.category} /></td>
            <td className="px-6 py-4 text-xs text-slate-500">{item.collection}</td>
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
            <td className="px-6 py-4 text-xs font-semibold text-slate-800 font-mono">{item.orderNo}</td>
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

  const renderInspectionsTable = () => (
    <table className="w-full text-left">
      <thead>
        <tr className="border-b border-slate-200">
          <th className="px-6 py-3 text-[10px] font-bold text-slate-500 uppercase tracking-wider">Inspection No.</th>
          <th className="px-6 py-3 text-[10px] font-bold text-slate-500 uppercase tracking-wider">Product</th>
          <th className="px-6 py-3 text-[10px] font-bold text-slate-500 uppercase tracking-wider">Type</th>
          <th className="px-6 py-3 text-[10px] font-bold text-slate-500 uppercase tracking-wider">Result</th>
          <th className="px-6 py-3 text-[10px] font-bold text-slate-500 uppercase tracking-wider">Archived Date</th>
          <th className="px-6 py-3 text-[10px] font-bold text-slate-500 uppercase tracking-wider text-left">Actions</th>
        </tr>
      </thead>
      <tbody className="divide-y divide-slate-100">
        {(pageData as typeof ARCHIVED_INSPECTIONS).map((item) => (
          <tr key={item.id} className="hover:bg-slate-50/50 transition-colors">
            <td className="px-6 py-4 text-xs font-semibold text-slate-800 font-mono">{item.inspectionNo}</td>
            <td className="px-6 py-4 text-xs text-slate-600">{item.product}</td>
            <td className="px-6 py-4 text-xs text-slate-500">{item.type}</td>
            <td className="px-6 py-4"><StatusBadge status={item.result} /></td>
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

  const renderInventoryTable = () => (
    <table className="w-full text-left">
      <thead>
        <tr className="border-b border-slate-200">
          <th className="px-6 py-3 text-[10px] font-bold text-slate-500 uppercase tracking-wider">Item Code</th>
          <th className="px-6 py-3 text-[10px] font-bold text-slate-500 uppercase tracking-wider">Item Name</th>
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

  const renderTable = () => {
    switch (activeTab) {
      case "users": return renderUsersTable();
      case "branches": return renderBranchesTable();
      case "products": return renderProductsTable();
      case "work-orders": return renderWorkOrdersTable();
      case "inspections": return renderInspectionsTable();
      case "inventory": return renderInventoryTable();
      case "budgets": return renderBudgetsTable();
      default: return null;
    }
  };

  return (
    <MainLayout>
      {/* Page Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center">
            <Archive size={20} className="text-slate-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-800">Archives</h1>
            <p className="text-sm text-slate-500">View and manage all archived records across the system</p>
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
            <p className="text-xs text-slate-400 mt-1">Items you archive will appear here</p>
          </div>
        )}
      </div>
    </MainLayout>
  );
};

export default ArchivesPage;
