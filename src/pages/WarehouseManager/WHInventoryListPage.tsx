// ==========================================
// WHInventoryListPage.tsx
// Warehouse Manager — Inventory List (Core CRUD)
// Master view of all materials and finished goods
// quantities in the branch. Supports: Create, Edit
// minimum level/description, Disable item.
// Quantity changes ONLY via stock movements/adjustments.
// ==========================================

import React, { useState, useMemo } from "react";
import WarehouseLayout from "../../layout/WarehouseLayout";
import StatsCard from "../../components/ui/StatsCard";
import { TableToolbar } from "../../components/ui/TableToolbar";
import { StatusBadge } from "../../components/ui/StatusBadge";
import Pagination from "../../components/ui/Pagination";
import PageModal from "../../components/ui/PageModal";
import ConfirmationModal from "../../components/ui/ConfirmationModal";
import Toast from "../../components/ui/Toast";
import IconSelect from "../../components/ui/IconSelect";
import InputGroup from "../../components/ui/InputGroup";
import InventoryLevelBar from "../../components/ui/InventoryLevelBar";
import SecondaryButton from "../../components/ui/SecondaryButton";
import PrimaryButton from "../../components/ui/PrimaryButton";
import {
  Package,
  AlertTriangle,
  PackageX,
  CheckCircle2,
  Plus,
  Eye,
  Edit,
  Ban,
  Layers,
  Ruler,
  FileText,
  Hash,
  Archive,
} from "lucide-react";

// ------------------------------------------
// Types
// ------------------------------------------
interface InventoryItem {
  id: string;
  itemCode: string;
  itemName: string;
  type: "Raw Material" | "Finished Good";
  unit: string;
  quantityOnHand: number;
  minimumLevel: number;
  status: "Normal" | "Low Stock" | "Out of Stock" | "Disabled";
  lastMovementDate: string;
  description: string;
}

// ------------------------------------------
// Mock data
// ------------------------------------------
const mockInventory: InventoryItem[] = [
  { id: "1", itemCode: "MAT-001", itemName: "Cotton Fabric", type: "Raw Material", unit: "meters", quantityOnHand: 15, minimumLevel: 100, status: "Low Stock", lastMovementDate: "2026-02-13", description: "Premium cotton for basic tee production" },
  { id: "2", itemCode: "MAT-002", itemName: "Denim Fabric", type: "Raw Material", unit: "rolls", quantityOnHand: 85, minimumLevel: 50, status: "Normal", lastMovementDate: "2026-02-12", description: "Heavy-weight denim for jackets" },
  { id: "3", itemCode: "MAT-003", itemName: "Polyester Thread", type: "Raw Material", unit: "spools", quantityOnHand: 120, minimumLevel: 100, status: "Normal", lastMovementDate: "2026-02-13", description: "Industrial polyester thread" },
  { id: "4", itemCode: "MAT-004", itemName: "Silk Fabric", type: "Raw Material", unit: "rolls", quantityOnHand: 30, minimumLevel: 25, status: "Normal", lastMovementDate: "2026-02-11", description: "Premium silk for dress production" },
  { id: "5", itemCode: "MAT-005", itemName: "Elastic Band", type: "Raw Material", unit: "rolls", quantityOnHand: 0, minimumLevel: 40, status: "Out of Stock", lastMovementDate: "2026-02-10", description: "2-inch elastic for waistbands" },
  { id: "6", itemCode: "MAT-006", itemName: "Zipper (Metal)", type: "Raw Material", unit: "pcs", quantityOnHand: 500, minimumLevel: 200, status: "Normal", lastMovementDate: "2026-02-13", description: "Metal zippers for jackets" },
  { id: "7", itemCode: "MAT-007", itemName: "Button (Shell)", type: "Raw Material", unit: "pcs", quantityOnHand: 1200, minimumLevel: 500, status: "Normal", lastMovementDate: "2026-02-12", description: "Shell buttons for shirts" },
  { id: "8", itemCode: "SKU-001", itemName: "Basic Tee V2.0", type: "Finished Good", unit: "pcs", quantityOnHand: 210, minimumLevel: 100, status: "Normal", lastMovementDate: "2026-02-13", description: "Basic cotton t-shirt" },
  { id: "9", itemCode: "SKU-002", itemName: "Hoodie V1.1", type: "Finished Good", unit: "pcs", quantityOnHand: 450, minimumLevel: 150, status: "Normal", lastMovementDate: "2026-02-12", description: "Cotton-blend hoodie" },
  { id: "10", itemCode: "SKU-004", itemName: "Joggers V2.0", type: "Finished Good", unit: "pcs", quantityOnHand: 0, minimumLevel: 100, status: "Out of Stock", lastMovementDate: "2026-02-08", description: "Stretch jogger pants" },
  { id: "11", itemCode: "MAT-008", itemName: "Linen Blend", type: "Raw Material", unit: "meters", quantityOnHand: 45, minimumLevel: 60, status: "Low Stock", lastMovementDate: "2026-02-09", description: "Linen-cotton blend fabric" },
  { id: "12", itemCode: "SKU-005", itemName: "Denim Jacket V1.0", type: "Finished Good", unit: "pcs", quantityOnHand: 150, minimumLevel: 80, status: "Normal", lastMovementDate: "2026-02-10", description: "Heavy-weight denim jacket" },
];

const typeOptions = [
  { value: "", label: "All Types" },
  { value: "Raw Material", label: "Raw Material" },
  { value: "Finished Good", label: "Finished Good" },
];

const statusOptions = [
  { value: "", label: "All Statuses" },
  { value: "Normal", label: "Normal" },
  { value: "Low Stock", label: "Low Stock" },
  { value: "Out of Stock", label: "Out of Stock" },
];

const unitOptions = [
  { value: "meters", label: "Meters" },
  { value: "rolls", label: "Rolls" },
  { value: "spools", label: "Spools" },
  { value: "pcs", label: "Pieces" },
  { value: "kg", label: "Kilograms" },
  { value: "yards", label: "Yards" },
];

const itemTypeOptions = [
  { value: "Raw Material", label: "Raw Material" },
  { value: "Finished Good", label: "Finished Good" },
];

const ITEMS_PER_PAGE = 8;

// ==========================================
// Component
// ==========================================
const WHInventoryListPage: React.FC = () => {
  const [inventory, setInventory] = useState<InventoryItem[]>(mockInventory);
  const [searchQuery, setSearchQuery] = useState("");
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [filterType, setFilterType] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  // Modal states
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<InventoryItem | null>(null);
  const [disableItem, setDisableItem] = useState<InventoryItem | null>(null);

  // Create form state
  const [formName, setFormName] = useState("");
  const [formType, setFormType] = useState("");
  const [formUnit, setFormUnit] = useState("");
  const [formMinLevel, setFormMinLevel] = useState("");
  const [formInitialQty, setFormInitialQty] = useState("");
  const [formDescription, setFormDescription] = useState("");

  // Edit form state
  const [editMinLevel, setEditMinLevel] = useState("");
  const [editDescription, setEditDescription] = useState("");

  // Toast
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);

  // KPIs
  const kpis = useMemo(() => ({
    total: inventory.filter((i) => i.status !== "Disabled").length,
    normal: inventory.filter((i) => i.status === "Normal").length,
    low: inventory.filter((i) => i.status === "Low Stock").length,
    outOfStock: inventory.filter((i) => i.status === "Out of Stock").length,
  }), [inventory]);

  // Filtered data
  const filtered = useMemo(() => {
    let data = inventory.filter((i) => i.status !== "Disabled");
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      data = data.filter(
        (i) =>
          i.itemCode.toLowerCase().includes(q) ||
          i.itemName.toLowerCase().includes(q)
      );
    }
    if (filterType) data = data.filter((i) => i.type === filterType);
    if (filterStatus) data = data.filter((i) => i.status === filterStatus);
    return data;
  }, [inventory, searchQuery, filterType, filterStatus]);

  // Pagination
  const totalPages = Math.max(1, Math.ceil(filtered.length / ITEMS_PER_PAGE));
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = Math.min(startIndex + ITEMS_PER_PAGE, filtered.length);
  const paginatedData = filtered.slice(startIndex, endIndex);

  // Handlers
  const resetCreateForm = () => {
    setFormName(""); setFormType(""); setFormUnit(""); setFormMinLevel(""); setFormInitialQty(""); setFormDescription("");
  };

  const handleCreate = () => {
    resetCreateForm();
    setIsCreateOpen(true);
  };

  const handleSaveCreate = () => {
    if (!formName || !formType || !formUnit || !formMinLevel) {
      setToast({ message: "Please fill in all required fields.", type: "error" });
      return;
    }
    setToast({ message: `Inventory item "${formName}" created successfully.`, type: "success" });
    setIsCreateOpen(false);
    resetCreateForm();
  };

  const handleView = (item: InventoryItem) => {
    setSelectedItem(item);
    setIsDetailOpen(true);
  };

  const handleEdit = (item: InventoryItem) => {
    setSelectedItem(item);
    setEditMinLevel(String(item.minimumLevel));
    setEditDescription(item.description);
    setIsEditOpen(true);
  };

  const handleSaveEdit = () => {
    if (!editMinLevel) {
      setToast({ message: "Minimum level is required.", type: "error" });
      return;
    }
    setToast({ message: `${selectedItem?.itemCode} updated successfully.`, type: "success" });
    setIsEditOpen(false);
    setSelectedItem(null);
  };

  const handleDisable = (item: InventoryItem) => {
    setDisableItem(item);
  };

  const confirmDisable = () => {
    if (disableItem) {
      setToast({ message: `${disableItem.itemCode} — ${disableItem.itemName} has been disabled.`, type: "success" });
      setDisableItem(null);
    }
  };

  return (
    <WarehouseLayout>
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

      {/* Page Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Inventory List</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Master view of all materials and finished goods — Manila Branch</p>
        </div>
        <SecondaryButton icon={Plus} onClick={handleCreate}>Add Inventory Item</SecondaryButton>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatsCard title="Total Items" value={kpis.total} icon={Package} color="bg-indigo-500" />
        <StatsCard title="Normal Stock" value={kpis.normal} icon={CheckCircle2} color="bg-emerald-500" />
        <StatsCard title="Low Stock" value={kpis.low} icon={AlertTriangle} color="bg-amber-500" />
        <StatsCard title="Out of Stock" value={kpis.outOfStock} icon={PackageX} color="bg-rose-500" />
      </div>

      {/* Toolbar */}
      <TableToolbar
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        isFilterOpen={isFilterOpen}
        setIsFilterOpen={setIsFilterOpen}
        placeholder="Search by item code or name…"
      >
        <div className="p-3 space-y-2">
          <IconSelect label="Type" value={filterType} onChange={(v) => { setFilterType(v); setCurrentPage(1); }} options={typeOptions} placeholder="All Types" />
          <IconSelect label="Status" value={filterStatus} onChange={(v) => { setFilterStatus(v); setCurrentPage(1); }} options={statusOptions} placeholder="All Statuses" />
        </div>
      </TableToolbar>

      {/* Table */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700">
                <th className="px-6 py-3 text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Item Code</th>
                <th className="px-6 py-3 text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Item Name</th>
                <th className="px-6 py-3 text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Type</th>
                <th className="px-6 py-3 text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Unit</th>
                <th className="px-6 py-3 text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Qty on Hand</th>
                <th className="px-6 py-3 text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider w-28">Level</th>
                <th className="px-6 py-3 text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Last Movement</th>
                <th className="px-6 py-3 text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider text-left">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
              {paginatedData.length > 0 ? (
                paginatedData.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/50 transition-colors">
                    <td className="px-6 py-3 text-xs font-bold text-indigo-600 dark:text-indigo-400">{item.itemCode}</td>
                    <td className="px-6 py-3 text-xs font-medium text-slate-800 dark:text-slate-200">{item.itemName}</td>
                    <td className="px-6 py-3">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-bold ${item.type === "Raw Material" ? "bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400" : "bg-purple-50 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400"}`}>
                        {item.type}
                      </span>
                    </td>
                    <td className="px-6 py-3 text-xs text-slate-600 dark:text-slate-400">{item.unit}</td>
                    <td className="px-6 py-3 text-xs font-bold text-slate-800 dark:text-slate-200">{item.quantityOnHand.toLocaleString()}</td>
                    <td className="px-6 py-3">
                      <InventoryLevelBar current={item.quantityOnHand} minimum={item.minimumLevel} />
                    </td>
                    <td className="px-6 py-3"><StatusBadge status={item.status} /></td>
                    <td className="px-6 py-3 text-[11px] text-slate-500 dark:text-slate-400">{item.lastMovementDate}</td>
                    <td className="px-6 py-3 text-left">
                      <div className="flex items-center justify-start gap-1">
                        <button onClick={() => handleView(item)} className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 rounded-lg transition-colors" title="View"><Eye size={14} /></button>
                        <button onClick={() => handleEdit(item)} className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors" title="Edit"><Edit size={14} /></button>
                        <button onClick={() => handleDisable(item)} className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-900/20 rounded-lg transition-colors" title="Disable"><Ban size={14} /></button>
                        <button onClick={() => { setInventory(prev => prev.filter(x => x.id !== item.id)); setToast({ message: "Item archived successfully", type: "success" }); }} className="p-1.5 text-slate-400 hover:text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-900/20 rounded-lg transition-colors" title="Archive"><Archive size={14} /></button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={9} className="px-6 py-12 text-center text-sm text-slate-400 italic">No inventory items found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        <Pagination currentPage={currentPage} totalPages={totalPages} startIndex={startIndex} endIndex={endIndex} totalItems={filtered.length} onPageChange={setCurrentPage} />
      </div>

      {/* Create Inventory Item Modal */}
      <PageModal
        isOpen={isCreateOpen}
        onClose={() => { setIsCreateOpen(false); resetCreateForm(); }}
        title="Add Inventory Item"
        subtitle="Register a new material or finished good in the branch warehouse"
        footer={
          <div className="flex items-center gap-3">
            <SecondaryButton onClick={() => { setIsCreateOpen(false); resetCreateForm(); }}>Cancel</SecondaryButton>
            <PrimaryButton onClick={handleSaveCreate} className="!w-auto !py-2.5 !px-6 !rounded-xl !text-xs">Create Item</PrimaryButton>
          </div>
        }
      >
        <div className="space-y-1">
          <InputGroup id="inv-name" label="Item Name *" placeholder="e.g. Cotton Fabric" icon={Package} value={formName} onChange={(e) => setFormName(e.target.value)} />
          <IconSelect label="Item Type *" value={formType} onChange={setFormType} options={itemTypeOptions} placeholder="Select type…" />
          <IconSelect label="Unit *" value={formUnit} onChange={setFormUnit} options={unitOptions} placeholder="Select unit…" />
          <InputGroup id="inv-min" label="Minimum Level *" type="number" placeholder="e.g. 100" icon={Layers} value={formMinLevel} onChange={(e) => setFormMinLevel(e.target.value)} />
          <InputGroup id="inv-init" label="Initial Quantity" type="number" placeholder="e.g. 500" icon={Hash} value={formInitialQty} onChange={(e) => setFormInitialQty(e.target.value)} />
          <InputGroup id="inv-desc" label="Description (optional)" placeholder="Brief description…" icon={FileText} value={formDescription} onChange={(e) => setFormDescription(e.target.value)} />
          <div className="p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl">
            <p className="text-[11px] text-blue-700 dark:text-blue-400 font-medium">Item code will be auto-generated based on type. Items are scoped to the current branch.</p>
          </div>
        </div>
      </PageModal>

      {/* Detail Modal */}
      <PageModal
        isOpen={isDetailOpen}
        onClose={() => { setIsDetailOpen(false); setSelectedItem(null); }}
        title={selectedItem ? `${selectedItem.itemCode} — ${selectedItem.itemName}` : ""}
        subtitle={selectedItem?.type}
        badges={selectedItem ? <StatusBadge status={selectedItem.status} /> : undefined}
      >
        {selectedItem && (
          <div className="space-y-5">
            <InventoryLevelBar current={selectedItem.quantityOnHand} minimum={selectedItem.minimumLevel} height="h-2.5" showLabels />
            <div className="grid grid-cols-2 gap-4">
              <div><label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Quantity on Hand</label><p className="text-sm font-bold text-slate-800 dark:text-slate-200 mt-1">{selectedItem.quantityOnHand.toLocaleString()} {selectedItem.unit}</p></div>
              <div><label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Minimum Level</label><p className="text-sm font-bold text-slate-800 dark:text-slate-200 mt-1">{selectedItem.minimumLevel.toLocaleString()} {selectedItem.unit}</p></div>
              <div><label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Unit</label><p className="text-sm text-slate-600 dark:text-slate-400 mt-1">{selectedItem.unit}</p></div>
              <div><label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Last Movement</label><p className="text-sm text-slate-600 dark:text-slate-400 mt-1">{selectedItem.lastMovementDate}</p></div>
            </div>
            {selectedItem.description && (
              <div><label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Description</label><p className="text-sm text-slate-600 dark:text-slate-400 mt-1 leading-relaxed">{selectedItem.description}</p></div>
            )}
            <div className="p-3 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl">
              <p className="text-[11px] text-amber-700 dark:text-amber-400 font-medium">Quantity cannot be directly edited. Use Stock Movements or Stock Adjustments to change quantities (audit rule).</p>
            </div>
          </div>
        )}
      </PageModal>

      {/* Edit Modal */}
      <PageModal
        isOpen={isEditOpen}
        onClose={() => { setIsEditOpen(false); setSelectedItem(null); }}
        title={`Edit — ${selectedItem?.itemCode}`}
        subtitle={selectedItem?.itemName}
        footer={
          <div className="flex items-center gap-3">
            <SecondaryButton onClick={() => { setIsEditOpen(false); setSelectedItem(null); }}>Cancel</SecondaryButton>
            <PrimaryButton onClick={handleSaveEdit} className="!w-auto !py-2.5 !px-6 !rounded-xl !text-xs">Save Changes</PrimaryButton>
          </div>
        }
      >
        {selectedItem && (
          <div className="space-y-1">
            <InputGroup id="edit-min" label="Minimum Level" type="number" placeholder="e.g. 100" icon={Ruler} value={editMinLevel} onChange={(e) => setEditMinLevel(e.target.value)} />
            <div className="flex flex-col gap-1.5 mb-5">
              <label className="text-xs font-semibold text-slate-500">Description</label>
              <textarea
                value={editDescription}
                onChange={(e) => setEditDescription(e.target.value)}
                placeholder="Update description…"
                className="w-full px-4 py-3 text-sm border border-slate-200 dark:border-slate-600 rounded-xl bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all min-h-[80px] resize-none"
              />
            </div>
            <div className="p-3 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl">
              <p className="text-[11px] text-amber-700 dark:text-amber-400 font-medium">Only minimum level and description can be edited. Quantity changes require a stock movement or adjustment.</p>
            </div>
          </div>
        )}
      </PageModal>

      {/* Disable Confirmation Modal */}
      <ConfirmationModal
        isOpen={!!disableItem}
        onClose={() => setDisableItem(null)}
        onConfirm={confirmDisable}
        title="Disable Inventory Item"
        message={`Disable ${disableItem?.itemCode} — ${disableItem?.itemName}? This prevents future use but keeps historical records intact.`}
        variant="danger"
        confirmText="Disable Item"
      />
    </WarehouseLayout>
  );
};

export default WHInventoryListPage;
