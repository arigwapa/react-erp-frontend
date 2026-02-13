// ==========================================
// QAArchivesPage.tsx — Quality Manager Archives
// View and manage archived quality records.
// Tabs: Inspections, Defects, Approvals, CAPA, Checklists
// ==========================================

import { useState, useMemo } from "react";
import {
  Archive,
  ClipboardList,
  Bug,
  CheckCircle2,
  ShieldAlert,
  ListChecks,
  Search,
  RotateCcw,
  Trash2,
  Calendar,
  Filter,
  ChevronDown,
} from "lucide-react";

import QALayout from "../../layout/QALayout";
import TabBar from "../../components/ui/TabBar";
import type { Tab } from "../../components/ui/TabBar";
import { StatusBadge } from "../../components/ui/StatusBadge";
import Pagination from "../../components/ui/Pagination";

// ==========================================
// TABS
// ==========================================
const TABS: Tab[] = [
  { id: "inspections", label: "Inspections", icon: ClipboardList, count: 4 },
  { id: "defects", label: "Defects", icon: Bug, count: 3 },
  { id: "approvals", label: "Approvals", icon: CheckCircle2, count: 3 },
  { id: "capa", label: "CAPA", icon: ShieldAlert, count: 3 },
  { id: "checklists", label: "Checklists", icon: ListChecks, count: 4 },
];

// ==========================================
// MOCK ARCHIVED DATA
// ==========================================
const ARCHIVED_INSPECTIONS = [
  { id: 1, inspectionNo: "INS-2026-0034", product: "Summer Dress V1", type: "Final QC", result: "Passed", archivedDate: "Jan 13, 2026" },
  { id: 2, inspectionNo: "INS-2026-0028", product: "Denim Jacket Classic", type: "Inline", result: "Failed", archivedDate: "Jan 7, 2026" },
  { id: 3, inspectionNo: "INS-2025-0120", product: "Silk Blouse Pearl", type: "Final QC", result: "Passed", archivedDate: "Dec 30, 2025" },
  { id: 4, inspectionNo: "INS-2025-0115", product: "Linen Pants Relaxed", type: "AQL", result: "Passed", archivedDate: "Dec 25, 2025" },
];

const ARCHIVED_DEFECTS = [
  { id: 1, defectId: "DEF-2025-089", product: "Summer Dress V1", severity: "High", status: "Resolved", archivedDate: "Jan 12, 2026" },
  { id: 2, defectId: "DEF-2025-076", product: "Denim Jacket Classic", severity: "Medium", status: "Resolved", archivedDate: "Jan 5, 2026" },
  { id: 3, defectId: "DEF-2025-062", product: "Silk Blouse Pearl", severity: "Low", status: "Closed", archivedDate: "Dec 28, 2025" },
];

const ARCHIVED_APPROVALS = [
  { id: 1, approvalId: "APR-2025-156", product: "Summer Dress V1", decision: "Approved", decidedBy: "QA Lead", archivedDate: "Jan 14, 2026" },
  { id: 2, approvalId: "APR-2025-142", product: "Denim Jacket Classic", decision: "Rejected", decidedBy: "QA Manager", archivedDate: "Jan 8, 2026" },
  { id: 3, approvalId: "APR-2025-128", product: "Silk Blouse Pearl", decision: "Approved", decidedBy: "QA Lead", archivedDate: "Dec 30, 2025" },
];

const ARCHIVED_CAPA = [
  { id: 1, capaId: "CAPA-2025-034", issue: "Stitching defects in batch", type: "Corrective", status: "Closed", archivedDate: "Jan 11, 2026" },
  { id: 2, capaId: "CAPA-2025-028", issue: "Fabric shrinkage variance", type: "Preventive", status: "Closed", archivedDate: "Jan 4, 2026" },
  { id: 3, capaId: "CAPA-2025-021", issue: "Color consistency deviation", type: "Corrective", status: "Completed", archivedDate: "Dec 27, 2025" },
];

const ARCHIVED_CHECKLISTS = [
  { id: 1, checklistId: "CL-2025-012", name: "Final QC Garment", category: "Final Inspection", itemCount: 24, archivedDate: "Jan 10, 2026" },
  { id: 2, checklistId: "CL-2025-009", name: "Inline Sewing Check", category: "Inline QC", itemCount: 18, archivedDate: "Jan 3, 2026" },
  { id: 3, checklistId: "CL-2025-006", name: "Raw Material Receipt", category: "Incoming", itemCount: 12, archivedDate: "Dec 26, 2025" },
  { id: 4, checklistId: "CL-2025-003", name: "Packaging Standards", category: "Pre-Ship", itemCount: 15, archivedDate: "Dec 20, 2025" },
];

const ITEMS_PER_PAGE = 5;

// ==========================================
// COMPONENT
// ==========================================
const QAArchivesPage = () => {
  const [activeTab, setActiveTab] = useState("inspections");
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
      case "inspections": return ARCHIVED_INSPECTIONS;
      case "defects": return ARCHIVED_DEFECTS;
      case "approvals": return ARCHIVED_APPROVALS;
      case "capa": return ARCHIVED_CAPA;
      case "checklists": return ARCHIVED_CHECKLISTS;
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
            <td className="px-6 py-4 text-xs font-mono font-semibold text-slate-800">{item.inspectionNo}</td>
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

  const renderDefectsTable = () => (
    <table className="w-full text-left">
      <thead>
        <tr className="border-b border-slate-200">
          <th className="px-6 py-3 text-[10px] font-bold text-slate-500 uppercase tracking-wider">Defect ID</th>
          <th className="px-6 py-3 text-[10px] font-bold text-slate-500 uppercase tracking-wider">Product</th>
          <th className="px-6 py-3 text-[10px] font-bold text-slate-500 uppercase tracking-wider">Severity</th>
          <th className="px-6 py-3 text-[10px] font-bold text-slate-500 uppercase tracking-wider">Status</th>
          <th className="px-6 py-3 text-[10px] font-bold text-slate-500 uppercase tracking-wider">Archived Date</th>
          <th className="px-6 py-3 text-[10px] font-bold text-slate-500 uppercase tracking-wider text-left">Actions</th>
        </tr>
      </thead>
      <tbody className="divide-y divide-slate-100">
        {(pageData as typeof ARCHIVED_DEFECTS).map((item) => (
          <tr key={item.id} className="hover:bg-slate-50/50 transition-colors">
            <td className="px-6 py-4 text-xs font-mono font-semibold text-slate-800">{item.defectId}</td>
            <td className="px-6 py-4 text-xs text-slate-600">{item.product}</td>
            <td className="px-6 py-4"><StatusBadge status={item.severity} /></td>
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

  const renderApprovalsTable = () => (
    <table className="w-full text-left">
      <thead>
        <tr className="border-b border-slate-200">
          <th className="px-6 py-3 text-[10px] font-bold text-slate-500 uppercase tracking-wider">Approval ID</th>
          <th className="px-6 py-3 text-[10px] font-bold text-slate-500 uppercase tracking-wider">Product</th>
          <th className="px-6 py-3 text-[10px] font-bold text-slate-500 uppercase tracking-wider">Decision</th>
          <th className="px-6 py-3 text-[10px] font-bold text-slate-500 uppercase tracking-wider">Decided By</th>
          <th className="px-6 py-3 text-[10px] font-bold text-slate-500 uppercase tracking-wider">Archived Date</th>
          <th className="px-6 py-3 text-[10px] font-bold text-slate-500 uppercase tracking-wider text-left">Actions</th>
        </tr>
      </thead>
      <tbody className="divide-y divide-slate-100">
        {(pageData as typeof ARCHIVED_APPROVALS).map((item) => (
          <tr key={item.id} className="hover:bg-slate-50/50 transition-colors">
            <td className="px-6 py-4 text-xs font-mono font-semibold text-slate-800">{item.approvalId}</td>
            <td className="px-6 py-4 text-xs text-slate-600">{item.product}</td>
            <td className="px-6 py-4"><StatusBadge status={item.decision} /></td>
            <td className="px-6 py-4 text-xs text-slate-500">{item.decidedBy}</td>
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

  const renderCAPATable = () => (
    <table className="w-full text-left">
      <thead>
        <tr className="border-b border-slate-200">
          <th className="px-6 py-3 text-[10px] font-bold text-slate-500 uppercase tracking-wider">CAPA ID</th>
          <th className="px-6 py-3 text-[10px] font-bold text-slate-500 uppercase tracking-wider">Issue</th>
          <th className="px-6 py-3 text-[10px] font-bold text-slate-500 uppercase tracking-wider">Type</th>
          <th className="px-6 py-3 text-[10px] font-bold text-slate-500 uppercase tracking-wider">Status</th>
          <th className="px-6 py-3 text-[10px] font-bold text-slate-500 uppercase tracking-wider">Archived Date</th>
          <th className="px-6 py-3 text-[10px] font-bold text-slate-500 uppercase tracking-wider text-left">Actions</th>
        </tr>
      </thead>
      <tbody className="divide-y divide-slate-100">
        {(pageData as typeof ARCHIVED_CAPA).map((item) => (
          <tr key={item.id} className="hover:bg-slate-50/50 transition-colors">
            <td className="px-6 py-4 text-xs font-mono font-semibold text-slate-800">{item.capaId}</td>
            <td className="px-6 py-4 text-xs text-slate-600">{item.issue}</td>
            <td className="px-6 py-4 text-xs text-slate-500">{item.type}</td>
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

  const renderChecklistsTable = () => (
    <table className="w-full text-left">
      <thead>
        <tr className="border-b border-slate-200">
          <th className="px-6 py-3 text-[10px] font-bold text-slate-500 uppercase tracking-wider">Checklist ID</th>
          <th className="px-6 py-3 text-[10px] font-bold text-slate-500 uppercase tracking-wider">Name</th>
          <th className="px-6 py-3 text-[10px] font-bold text-slate-500 uppercase tracking-wider">Category</th>
          <th className="px-6 py-3 text-[10px] font-bold text-slate-500 uppercase tracking-wider">Item Count</th>
          <th className="px-6 py-3 text-[10px] font-bold text-slate-500 uppercase tracking-wider">Archived Date</th>
          <th className="px-6 py-3 text-[10px] font-bold text-slate-500 uppercase tracking-wider text-left">Actions</th>
        </tr>
      </thead>
      <tbody className="divide-y divide-slate-100">
        {(pageData as typeof ARCHIVED_CHECKLISTS).map((item) => (
          <tr key={item.id} className="hover:bg-slate-50/50 transition-colors">
            <td className="px-6 py-4 text-xs font-mono font-semibold text-slate-800">{item.checklistId}</td>
            <td className="px-6 py-4 text-xs text-slate-600">{item.name}</td>
            <td className="px-6 py-4 text-xs text-slate-500">{item.category}</td>
            <td className="px-6 py-4 text-xs text-slate-500">{item.itemCount}</td>
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
      case "inspections": return renderInspectionsTable();
      case "defects": return renderDefectsTable();
      case "approvals": return renderApprovalsTable();
      case "capa": return renderCAPATable();
      case "checklists": return renderChecklistsTable();
      default: return null;
    }
  };

  return (
    <QALayout>
      {/* Page Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center">
            <Archive size={20} className="text-slate-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-800">Quality Archives</h1>
            <p className="text-sm text-slate-500">View and manage archived quality records</p>
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
    </QALayout>
  );
};

export default QAArchivesPage;
