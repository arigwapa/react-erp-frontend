// ==========================================
// QAChecklistsPage.tsx
// Quality Manager — Quality Standards & Checklists
// QA Manager can manage checklists (branch-level).
// CRUD: Create, Edit, Disable, Assign to category.
// ==========================================

import React, { useState, useMemo } from "react";
import QALayout from "../../layout/QALayout";
import { TableToolbar } from "../../components/ui/TableToolbar";
import { StatusBadge } from "../../components/ui/StatusBadge";
import Pagination from "../../components/ui/Pagination";
import PageModal from "../../components/ui/PageModal";
import ConfirmationModal from "../../components/ui/ConfirmationModal";
import Toast from "../../components/ui/Toast";
import IconSelect from "../../components/ui/IconSelect";
import InputGroup from "../../components/ui/InputGroup";
import SecondaryButton from "../../components/ui/SecondaryButton";
import PrimaryButton from "../../components/ui/PrimaryButton";
import {
  ListChecks,
  Plus,
  Eye,
  Edit,
  Ban,
  FileText,
  Archive,
} from "lucide-react";

// ------------------------------------------
// Types
// ------------------------------------------
interface ChecklistItem {
  criteria: string;
  passRule: string;
  weight: number;
}

interface Checklist {
  id: string;
  checklistId: string;
  name: string;
  productCategory: string;
  version: string;
  status: "Active" | "Disabled" | "Draft";
  items: ChecklistItem[];
  createdDate: string;
  updatedDate: string;
}

// ------------------------------------------
// Mock data
// ------------------------------------------
const mockChecklists: Checklist[] = [
  { id: "1", checklistId: "CL-001", name: "Basic Garment QC", productCategory: "T-Shirts", version: "V2.1", status: "Active", items: [
    { criteria: "Fabric weight within tolerance", passRule: "Pass/Fail", weight: 15 },
    { criteria: "Stitching straight and even", passRule: "Pass/Fail", weight: 20 },
    { criteria: "No loose threads", passRule: "Pass/Fail", weight: 10 },
    { criteria: "Color matches approved swatch", passRule: "Pass/Fail", weight: 15 },
    { criteria: "Label placement correct", passRule: "Pass/Fail", weight: 10 },
    { criteria: "Size measurements within spec", passRule: "±1cm tolerance", weight: 20 },
    { criteria: "No stains or marks", passRule: "Pass/Fail", weight: 10 },
  ], createdDate: "2026-01-15", updatedDate: "2026-02-10" },
  { id: "2", checklistId: "CL-002", name: "Knitted Garment QC", productCategory: "Hoodies & Sweaters", version: "V1.4", status: "Active", items: [
    { criteria: "Knit tension consistent", passRule: "Pass/Fail", weight: 15 },
    { criteria: "Stitching quality (seams)", passRule: "Pass/Fail", weight: 20 },
    { criteria: "Fabric pilling test", passRule: "Grade 3+ required", weight: 10 },
    { criteria: "Color fastness check", passRule: "Grade 4+ required", weight: 15 },
    { criteria: "Size measurements", passRule: "±1.5cm tolerance", weight: 20 },
    { criteria: "Ribbing consistency", passRule: "Pass/Fail", weight: 10 },
    { criteria: "Zipper/button function", passRule: "Pass/Fail", weight: 10 },
  ], createdDate: "2026-01-20", updatedDate: "2026-02-08" },
  { id: "3", checklistId: "CL-003", name: "Denim QC", productCategory: "Jeans & Denim", version: "V1.2", status: "Active", items: [
    { criteria: "Denim weight check", passRule: "Pass/Fail", weight: 10 },
    { criteria: "Seam strength test", passRule: "Pass/Fail", weight: 20 },
    { criteria: "Rivet and button durability", passRule: "Pass/Fail", weight: 15 },
    { criteria: "Wash test compliance", passRule: "Pass/Fail", weight: 15 },
    { criteria: "Measurements", passRule: "±1cm tolerance", weight: 20 },
    { criteria: "Color consistency", passRule: "Pass/Fail", weight: 10 },
    { criteria: "No fabric tears", passRule: "Pass/Fail", weight: 10 },
  ], createdDate: "2026-01-25", updatedDate: "2026-02-05" },
  { id: "4", checklistId: "CL-004", name: "Outerwear QC", productCategory: "Jackets & Coats", version: "V1.0", status: "Draft", items: [
    { criteria: "Waterproofing test", passRule: "IPX4 minimum", weight: 20 },
    { criteria: "Insulation loft check", passRule: "Pass/Fail", weight: 15 },
    { criteria: "Zipper stress test", passRule: "500+ cycles", weight: 15 },
    { criteria: "Seam sealing integrity", passRule: "Pass/Fail", weight: 20 },
    { criteria: "Size measurements", passRule: "±1.5cm tolerance", weight: 15 },
    { criteria: "Finishing quality", passRule: "Pass/Fail", weight: 15 },
  ], createdDate: "2026-02-10", updatedDate: "2026-02-10" },
  { id: "5", checklistId: "CL-005", name: "Basic Garment QC (Legacy)", productCategory: "T-Shirts", version: "V1.0", status: "Disabled", items: [
    { criteria: "Stitching quality", passRule: "Pass/Fail", weight: 25 },
    { criteria: "Color check", passRule: "Pass/Fail", weight: 25 },
    { criteria: "Size check", passRule: "Pass/Fail", weight: 25 },
    { criteria: "General appearance", passRule: "Pass/Fail", weight: 25 },
  ], createdDate: "2025-06-01", updatedDate: "2026-01-14" },
];

const statusOptions = [
  { value: "", label: "All Statuses" },
  { value: "Active", label: "Active" },
  { value: "Draft", label: "Draft" },
  { value: "Disabled", label: "Disabled" },
];

const categoryOptions = [
  { value: "T-Shirts", label: "T-Shirts" },
  { value: "Hoodies & Sweaters", label: "Hoodies & Sweaters" },
  { value: "Jeans & Denim", label: "Jeans & Denim" },
  { value: "Jackets & Coats", label: "Jackets & Coats" },
  { value: "Polo Shirts", label: "Polo Shirts" },
  { value: "Joggers & Bottoms", label: "Joggers & Bottoms" },
];

const ITEMS_PER_PAGE = 6;

// ==========================================
// Component
// ==========================================
const QAChecklistsPage: React.FC = () => {
  const [checklists, setChecklists] = useState<Checklist[]>(mockChecklists);
  const [searchQuery, setSearchQuery] = useState("");
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [filterStatus, setFilterStatus] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  // Modal states
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [selectedChecklist, setSelectedChecklist] = useState<Checklist | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [disableItem, setDisableItem] = useState<Checklist | null>(null);

  // Form state
  const [formName, setFormName] = useState("");
  const [formCategory, setFormCategory] = useState("");
  const [formVersion, setFormVersion] = useState("");
  const [formItems, setFormItems] = useState("");

  // Toast
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);

  // Filtered data
  const filtered = useMemo(() => {
    let data = [...checklists];
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      data = data.filter(
        (c) =>
          c.checklistId.toLowerCase().includes(q) ||
          c.name.toLowerCase().includes(q) ||
          c.productCategory.toLowerCase().includes(q)
      );
    }
    if (filterStatus) data = data.filter((c) => c.status === filterStatus);
    return data;
  }, [checklists, searchQuery, filterStatus]);

  // Pagination
  const totalPages = Math.max(1, Math.ceil(filtered.length / ITEMS_PER_PAGE));
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = Math.min(startIndex + ITEMS_PER_PAGE, filtered.length);
  const paginatedData = filtered.slice(startIndex, endIndex);

  const resetForm = () => {
    setFormName("");
    setFormCategory("");
    setFormVersion("");
    setFormItems("");
  };

  const handleCreate = () => {
    resetForm();
    setIsEditing(false);
    setIsFormOpen(true);
  };

  const handleEdit = (checklist: Checklist) => {
    setFormName(checklist.name);
    setFormCategory(checklist.productCategory);
    setFormVersion(checklist.version);
    setFormItems(checklist.items.map((i) => `${i.criteria} | ${i.passRule} | ${i.weight}`).join("\n"));
    setIsEditing(true);
    setIsFormOpen(true);
  };

  const handleSave = () => {
    if (!formName || !formCategory) {
      setToast({ message: "Please fill in required fields.", type: "error" });
      return;
    }
    setToast({ message: isEditing ? "Checklist updated." : "Checklist created.", type: "success" });
    setIsFormOpen(false);
    resetForm();
  };

  const handleView = (checklist: Checklist) => {
    setSelectedChecklist(checklist);
    setIsDetailOpen(true);
  };

  const handleDisable = (checklist: Checklist) => {
    setDisableItem(checklist);
  };

  const confirmDisable = () => {
    if (disableItem) {
      setToast({ message: `${disableItem.checklistId} has been disabled.`, type: "success" });
      setDisableItem(null);
    }
  };

  return (
    <QALayout>
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

      {/* Page Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Quality Standards & Checklists</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Manage inspection checklists and quality criteria — branch scope</p>
        </div>
        <SecondaryButton icon={Plus} onClick={handleCreate}>Create Checklist</SecondaryButton>
      </div>

      {/* Toolbar */}
      <TableToolbar
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        isFilterOpen={isFilterOpen}
        setIsFilterOpen={setIsFilterOpen}
        placeholder="Search by name, ID, or category…"
      >
        <div className="p-3">
          <IconSelect label="Status" value={filterStatus} onChange={(v) => { setFilterStatus(v); setCurrentPage(1); }} options={statusOptions} placeholder="All Statuses" />
        </div>
      </TableToolbar>

      {/* Table */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700">
                <th className="px-6 py-3 text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">ID</th>
                <th className="px-6 py-3 text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Name</th>
                <th className="px-6 py-3 text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Category</th>
                <th className="px-6 py-3 text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Version</th>
                <th className="px-6 py-3 text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Items</th>
                <th className="px-6 py-3 text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Updated</th>
                <th className="px-6 py-3 text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider text-left">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
              {paginatedData.length > 0 ? (
                paginatedData.map((cl) => (
                  <tr key={cl.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/50 transition-colors">
                    <td className="px-6 py-3 text-xs font-bold text-indigo-600 dark:text-indigo-400">{cl.checklistId}</td>
                    <td className="px-6 py-3 text-xs font-medium text-slate-800 dark:text-slate-200">{cl.name}</td>
                    <td className="px-6 py-3 text-xs text-slate-600 dark:text-slate-400">{cl.productCategory}</td>
                    <td className="px-6 py-3 text-xs font-bold text-slate-800 dark:text-slate-200">{cl.version}</td>
                    <td className="px-6 py-3 text-xs text-slate-600 dark:text-slate-400">{cl.items.length}</td>
                    <td className="px-6 py-3"><StatusBadge status={cl.status} /></td>
                    <td className="px-6 py-3 text-[11px] text-slate-600 dark:text-slate-400">{cl.updatedDate}</td>
                    <td className="px-6 py-3 text-left">
                      <div className="flex items-center justify-start gap-1">
                        <button onClick={() => handleView(cl)} className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 rounded-lg transition-colors" title="View"><Eye size={14} /></button>
                        {cl.status !== "Disabled" && (
                          <button onClick={() => handleEdit(cl)} className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors" title="Edit"><Edit size={14} /></button>
                        )}
                        {cl.status === "Active" && (
                          <button onClick={() => handleDisable(cl)} className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-900/20 rounded-lg transition-colors" title="Disable"><Ban size={14} /></button>
                        )}
                        <button onClick={() => { setChecklists(prev => prev.filter(x => x.id !== cl.id)); setToast({ message: "Item archived successfully", type: "success" }); }} className="p-1.5 text-slate-400 hover:text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-900/20 rounded-lg transition-colors" title="Archive"><Archive size={14} /></button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={8} className="px-6 py-12 text-center text-sm text-slate-400 italic">No checklists found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        <Pagination currentPage={currentPage} totalPages={totalPages} startIndex={startIndex} endIndex={endIndex} totalItems={filtered.length} onPageChange={setCurrentPage} />
      </div>

      {/* Detail Modal */}
      <PageModal
        isOpen={isDetailOpen}
        onClose={() => setIsDetailOpen(false)}
        title={selectedChecklist?.name || ""}
        subtitle={`${selectedChecklist?.checklistId} · ${selectedChecklist?.productCategory} · ${selectedChecklist?.version}`}
        badges={selectedChecklist ? <StatusBadge status={selectedChecklist.status} /> : undefined}
        maxWidth="max-w-3xl"
      >
        {selectedChecklist && (
          <div className="space-y-5">
            <div className="grid grid-cols-3 gap-4">
              <div><label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Created</label><p className="text-sm text-slate-600 dark:text-slate-400 mt-1">{selectedChecklist.createdDate}</p></div>
              <div><label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Last Updated</label><p className="text-sm text-slate-600 dark:text-slate-400 mt-1">{selectedChecklist.updatedDate}</p></div>
              <div><label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Total Criteria</label><p className="text-sm font-bold text-slate-800 dark:text-slate-200 mt-1">{selectedChecklist.items.length}</p></div>
            </div>

            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-3">Checklist Items</h3>
              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden">
                <table className="w-full">
                  <thead>
                    <tr className="bg-slate-50 dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700">
                      <th className="px-4 py-2 text-[10px] font-bold text-slate-500 uppercase text-left">#</th>
                      <th className="px-4 py-2 text-[10px] font-bold text-slate-500 uppercase text-left">Criteria</th>
                      <th className="px-4 py-2 text-[10px] font-bold text-slate-500 uppercase text-left">Pass Rule</th>
                      <th className="px-4 py-2 text-[10px] font-bold text-slate-500 uppercase text-left">Weight</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                    {selectedChecklist.items.map((item, idx) => (
                      <tr key={idx} className="hover:bg-slate-50/50">
                        <td className="px-4 py-2 text-xs text-slate-400">{idx + 1}</td>
                        <td className="px-4 py-2 text-xs text-slate-700 dark:text-slate-300">{item.criteria}</td>
                        <td className="px-4 py-2 text-xs text-slate-600 dark:text-slate-400">{item.passRule}</td>
                        <td className="px-4 py-2 text-xs font-bold text-slate-800 dark:text-slate-200 text-left">{item.weight}%</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </PageModal>

      {/* Create / Edit Modal */}
      <PageModal
        isOpen={isFormOpen}
        onClose={() => { setIsFormOpen(false); resetForm(); }}
        title={isEditing ? "Edit Checklist" : "Create Checklist"}
        subtitle={isEditing ? "Update checklist criteria and rules" : "Define a new checklist template"}
        maxWidth="max-w-3xl"
        footer={
          <div className="flex items-center gap-3">
            <SecondaryButton onClick={() => { setIsFormOpen(false); resetForm(); }}>Cancel</SecondaryButton>
            <PrimaryButton onClick={handleSave} className="!w-auto !py-2.5 !px-6 !rounded-xl !text-xs">{isEditing ? "Update" : "Create"}</PrimaryButton>
          </div>
        }
      >
        <div className="space-y-1">
          <InputGroup id="cl-name" label="Checklist Name *" placeholder="e.g. Basic Garment QC" icon={ListChecks} value={formName} onChange={(e) => setFormName(e.target.value)} />
          <IconSelect label="Product Category *" value={formCategory} onChange={setFormCategory} options={categoryOptions} placeholder="Select category…" />
          <InputGroup id="cl-ver" label="Version" placeholder="e.g. V2.1" icon={FileText} value={formVersion} onChange={(e) => setFormVersion(e.target.value)} />
          <div className="flex flex-col gap-1.5 mb-5">
            <label className="text-xs font-semibold text-slate-500">Checklist Items (one per line: Criteria | Pass Rule | Weight)</label>
            <textarea
              value={formItems}
              onChange={(e) => setFormItems(e.target.value)}
              placeholder={"Fabric weight within tolerance | Pass/Fail | 15\nStitching straight and even | Pass/Fail | 20"}
              className="w-full px-4 py-3 text-xs border border-slate-200 dark:border-slate-600 rounded-xl bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all min-h-[150px] resize-none font-mono"
            />
          </div>
        </div>
      </PageModal>

      {/* Disable Confirmation */}
      <ConfirmationModal
        isOpen={!!disableItem}
        onClose={() => setDisableItem(null)}
        onConfirm={confirmDisable}
        title="Disable Checklist"
        message={`Disable "${disableItem?.name}" (${disableItem?.checklistId})? This version will no longer be available for new inspections.`}
        variant="danger"
        confirmText="Disable"
      />
    </QALayout>
  );
};

export default QAChecklistsPage;
