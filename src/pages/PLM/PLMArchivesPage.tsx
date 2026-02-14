// ==========================================
// PLMArchivesPage.tsx — PLM Manager Archives
// View and manage archived PLM records across
// Products, Tech Packs, BOMs, Materials, Releases.
// ==========================================

import { useState, useMemo, useEffect } from "react";
import {
  Archive,
  Package,
  FileText,
  Layers,
  BookOpen,
  Rocket,
  RotateCcw,
  Trash2,
  Calendar,
} from "lucide-react";

import PLMLayout from "../../layout/PLMLayout";
import { Card } from "../../components/ui/Card";
import TabBar from "../../components/ui/TabBar";
import type { Tab } from "../../components/ui/TabBar";
import { StatusBadge } from "../../components/ui/StatusBadge";
import { TableToolbar } from "../../components/ui/TableToolbar";
import Pagination from "../../components/ui/Pagination";
import ConfirmationModal from "../../components/ui/ConfirmationModal";
import Toast from "../../components/ui/Toast";

// ==========================================
// TYPES
// ==========================================

interface ArchivedProduct {
  id: string;
  name: string;
  sku: string;
  category: string;
  collection: string;
  archivedDate: string;
}

interface ArchivedTechPack {
  id: string;
  name: string;
  version: string;
  product: string;
  status: string;
  archivedDate: string;
}

interface ArchivedBOM {
  id: string;
  bomId: string;
  product: string;
  componentsCount: number;
  cost: string;
  archivedDate: string;
}

interface ArchivedMaterial {
  id: string;
  code: string;
  name: string;
  type: string;
  supplier: string;
  archivedDate: string;
}

interface ArchivedRelease {
  id: string;
  releaseId: string;
  product: string;
  releasedTo: string;
  status: string;
  archivedDate: string;
}

// ==========================================
// MOCK DATA
// ==========================================

const MOCK_PRODUCTS: ArchivedProduct[] = [
  { id: "AP-001", name: "Polo Shirt Classic", sku: "MNL-PLO-008", category: "Tops", collection: "SS 2025", archivedDate: "Jan 15, 2026" },
  { id: "AP-002", name: "Vintage Cardigan", sku: "MNL-CRD-009", category: "Knitwear", collection: "FW 2025", archivedDate: "Jan 10, 2026" },
  { id: "AP-003", name: "Legacy Chino Shorts", sku: "MNL-SHT-010", category: "Bottoms", collection: "SS 2025", archivedDate: "Jan 5, 2026" },
  { id: "AP-004", name: "Retro Windbreaker", sku: "MNL-WND-011", category: "Outerwear", collection: "FW 2025", archivedDate: "Dec 28, 2025" },
];

const MOCK_TECH_PACKS: ArchivedTechPack[] = [
  { id: "AT-001", name: "Classic Denim Jacket v1.0", version: "V1.0", product: "Classic Denim Jacket", status: "Archived", archivedDate: "Feb 1, 2026" },
  { id: "AT-002", name: "Floral Summer Dress v0.9", version: "V0.9", product: "Floral Summer Dress", status: "Archived", archivedDate: "Jan 28, 2026" },
  { id: "AT-003", name: "Basic Cotton Tee v2.0", version: "V2.0", product: "Basic Cotton Tee", status: "Archived", archivedDate: "Jan 20, 2026" },
  { id: "AT-004", name: "Wool Trench Coat v1.5", version: "V1.5", product: "Wool Trench Coat", status: "Archived", archivedDate: "Jan 15, 2026" },
];

const MOCK_BOMS: ArchivedBOM[] = [
  { id: "AB-001", bomId: "BOM-045", product: "Polo Shirt Classic", componentsCount: 12, cost: "₱1,245.00", archivedDate: "Jan 15, 2026" },
  { id: "AB-002", bomId: "BOM-042", product: "Vintage Cardigan", componentsCount: 18, cost: "₱2,890.00", archivedDate: "Jan 10, 2026" },
  { id: "AB-003", bomId: "BOM-038", product: "Legacy Chino Shorts", componentsCount: 8, cost: "₱890.00", archivedDate: "Jan 5, 2026" },
  { id: "AB-004", bomId: "BOM-035", product: "Retro Windbreaker", componentsCount: 15, cost: "₱1,650.00", archivedDate: "Dec 28, 2025" },
];

const MOCK_MATERIALS: ArchivedMaterial[] = [
  { id: "AM-001", code: "MAT-120", name: "Legacy Cotton Blend", type: "Fabric", supplier: "Textile Corp", archivedDate: "Jan 12, 2026" },
  { id: "AM-002", code: "MAT-118", name: "Discontinued Polyester", type: "Fabric", supplier: "Fiber Supply Co", archivedDate: "Jan 8, 2026" },
  { id: "AM-003", code: "MAT-115", name: "Old Style Buttons", type: "Trim", supplier: "Trim World", archivedDate: "Jan 3, 2026" },
  { id: "AM-004", code: "MAT-110", name: "Vintage Zipper", type: "Trim", supplier: "Hardware Plus", archivedDate: "Dec 30, 2025" },
];

const MOCK_RELEASES: ArchivedRelease[] = [
  { id: "AR-001", releaseId: "REL-022", product: "Polo Shirt Classic", releasedTo: "Production Line A", status: "Archived", archivedDate: "Jan 15, 2026" },
  { id: "AR-002", releaseId: "REL-019", product: "Vintage Cardigan", releasedTo: "Production Line B", status: "Archived", archivedDate: "Jan 10, 2026" },
  { id: "AR-003", releaseId: "REL-015", product: "Legacy Chino Shorts", releasedTo: "Production Line A", status: "Archived", archivedDate: "Jan 5, 2026" },
  { id: "AR-004", releaseId: "REL-012", product: "Retro Windbreaker", releasedTo: "Production Line C", status: "Archived", archivedDate: "Dec 28, 2025" },
];

// ==========================================
// CONSTANTS
// ==========================================

const ITEMS_PER_PAGE = 5;

const ARCHIVE_TABS: Tab[] = [
  { id: "products", label: "Products", icon: Package, count: MOCK_PRODUCTS.length },
  { id: "tech-packs", label: "Tech Packs", icon: FileText, count: MOCK_TECH_PACKS.length },
  { id: "boms", label: "BOMs", icon: Layers, count: MOCK_BOMS.length },
  { id: "materials", label: "Materials", icon: BookOpen, count: MOCK_MATERIALS.length },
  { id: "releases", label: "Releases", icon: Rocket, count: MOCK_RELEASES.length },
];

// ==========================================
// MAIN COMPONENT
// ==========================================

function PLMArchivesPage() {
  const [activeTab, setActiveTab] = useState("products");
  const [searchQuery, setSearchQuery] = useState("");
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);
  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    action: () => void;
    variant: "primary" | "danger";
    confirmText: string;
  }>({
    isOpen: false,
    title: "",
    message: "",
    action: () => {},
    variant: "primary",
    confirmText: "Confirm",
  });

  useEffect(() => {
    setCurrentPage(1);
  }, [activeTab, searchQuery]);

  // ------------------------------------------
  // COMPUTED: Filtered data by tab
  // ------------------------------------------
  const filteredData = useMemo(() => {
    const q = searchQuery.toLowerCase();

    switch (activeTab) {
      case "products":
        return MOCK_PRODUCTS.filter(
          (p) =>
            p.name.toLowerCase().includes(q) ||
            p.sku.toLowerCase().includes(q) ||
            p.category.toLowerCase().includes(q) ||
            p.collection.toLowerCase().includes(q)
        );
      case "tech-packs":
        return MOCK_TECH_PACKS.filter(
          (t) =>
            t.name.toLowerCase().includes(q) ||
            t.product.toLowerCase().includes(q) ||
            t.version.toLowerCase().includes(q)
        );
      case "boms":
        return MOCK_BOMS.filter(
          (b) =>
            b.bomId.toLowerCase().includes(q) ||
            b.product.toLowerCase().includes(q)
        );
      case "materials":
        return MOCK_MATERIALS.filter(
          (m) =>
            m.code.toLowerCase().includes(q) ||
            m.name.toLowerCase().includes(q) ||
            m.type.toLowerCase().includes(q) ||
            m.supplier.toLowerCase().includes(q)
        );
      case "releases":
        return MOCK_RELEASES.filter(
          (r) =>
            r.releaseId.toLowerCase().includes(q) ||
            r.product.toLowerCase().includes(q) ||
            r.releasedTo.toLowerCase().includes(q)
        );
      default:
        return [];
    }
  }, [activeTab, searchQuery]);

  const totalPages = Math.max(1, Math.ceil(filteredData.length / ITEMS_PER_PAGE));
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = Math.min(startIndex + ITEMS_PER_PAGE, filteredData.length);
  const paginatedData = filteredData.slice(startIndex, endIndex);

  // ------------------------------------------
  // HANDLERS: Restore & Delete (placeholder)
  // ------------------------------------------
  const handleRestore = (_item: unknown, label: string) => {
    setConfirmModal({
      isOpen: true,
      title: "Restore Item?",
      message: `Restore "${label}" from archive? It will be moved back to the active list.`,
      variant: "primary",
      confirmText: "Restore",
      action: () => {
        setConfirmModal((prev) => ({ ...prev, isOpen: false }));
        setToast({ message: `"${label}" restored successfully.`, type: "success" });
      },
    });
  };

  const handleDelete = (_item: unknown, label: string) => {
    setConfirmModal({
      isOpen: true,
      title: "Permanently Delete?",
      message: `Permanently delete "${label}"? This action cannot be undone.`,
      variant: "danger",
      confirmText: "Delete",
      action: () => {
        setConfirmModal((prev) => ({ ...prev, isOpen: false }));
        setToast({ message: `"${label}" permanently deleted.`, type: "success" });
      },
    });
  };

  // ------------------------------------------
  // RENDER: Table content by tab
  // ------------------------------------------
  const renderTableContent = () => {
    if (paginatedData.length === 0) {
      return (
        <tr>
          <td colSpan={6} className="px-6 py-16 text-center">
            <div className="flex flex-col items-center gap-2 text-slate-400">
              <Archive size={40} className="text-slate-300" />
              <p className="text-sm font-medium">No archived items found</p>
            </div>
          </td>
        </tr>
      );
    }

    switch (activeTab) {
      case "products":
        return (paginatedData as ArchivedProduct[]).map((p) => (
          <tr key={p.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/50 transition-colors">
            <td className="px-6 py-4 text-xs font-semibold text-slate-900 dark:text-white">{p.name}</td>
            <td className="px-6 py-4 text-xs font-mono text-slate-600 dark:text-slate-400">{p.sku}</td>
            <td className="px-6 py-4 text-xs text-slate-600 dark:text-slate-400">{p.category}</td>
            <td className="px-6 py-4 text-xs text-slate-600 dark:text-slate-400">{p.collection}</td>
            <td className="px-6 py-4 text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
              <Calendar size={12} />{p.archivedDate}
            </td>
            <td className="px-6 py-4">
              <div className="flex items-center gap-1">
                <button
                  onClick={() => handleRestore(p, p.name)}
                  className="p-1.5 text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                  title="Restore"
                >
                  <RotateCcw size={14} />
                </button>
                <button
                  onClick={() => handleDelete(p, p.name)}
                  className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                  title="Delete"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </td>
          </tr>
        ));

      case "tech-packs":
        return (paginatedData as ArchivedTechPack[]).map((t) => (
          <tr key={t.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/50 transition-colors">
            <td className="px-6 py-4 text-xs font-semibold text-slate-900 dark:text-white">{t.name}</td>
            <td className="px-6 py-4 text-xs font-mono text-indigo-600 dark:text-indigo-400">{t.version}</td>
            <td className="px-6 py-4 text-xs text-slate-600 dark:text-slate-400">{t.product}</td>
            <td className="px-6 py-4 text-xs"><StatusBadge status={t.status} /></td>
            <td className="px-6 py-4 text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
              <Calendar size={12} />{t.archivedDate}
            </td>
            <td className="px-6 py-4">
              <div className="flex items-center gap-1">
                <button
                  onClick={() => handleRestore(t, t.name)}
                  className="p-1.5 text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                  title="Restore"
                >
                  <RotateCcw size={14} />
                </button>
                <button
                  onClick={() => handleDelete(t, t.name)}
                  className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                  title="Delete"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </td>
          </tr>
        ));

      case "boms":
        return (paginatedData as ArchivedBOM[]).map((b) => (
          <tr key={b.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/50 transition-colors">
            <td className="px-6 py-4 text-xs font-mono font-bold text-indigo-600 dark:text-indigo-400">{b.bomId}</td>
            <td className="px-6 py-4 text-xs font-semibold text-slate-900 dark:text-white">{b.product}</td>
            <td className="px-6 py-4 text-xs text-slate-600 dark:text-slate-400">{b.componentsCount}</td>
            <td className="px-6 py-4 text-xs font-semibold text-slate-700 dark:text-slate-300">{b.cost}</td>
            <td className="px-6 py-4 text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
              <Calendar size={12} />{b.archivedDate}
            </td>
            <td className="px-6 py-4">
              <div className="flex items-center gap-1">
                <button
                  onClick={() => handleRestore(b, b.bomId)}
                  className="p-1.5 text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                  title="Restore"
                >
                  <RotateCcw size={14} />
                </button>
                <button
                  onClick={() => handleDelete(b, b.bomId)}
                  className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                  title="Delete"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </td>
          </tr>
        ));

      case "materials":
        return (paginatedData as ArchivedMaterial[]).map((m) => (
          <tr key={m.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/50 transition-colors">
            <td className="px-6 py-4 text-xs font-mono font-bold text-slate-700 dark:text-slate-300">{m.code}</td>
            <td className="px-6 py-4 text-xs font-semibold text-slate-900 dark:text-white">{m.name}</td>
            <td className="px-6 py-4 text-xs text-slate-600 dark:text-slate-400">{m.type}</td>
            <td className="px-6 py-4 text-xs text-slate-600 dark:text-slate-400">{m.supplier}</td>
            <td className="px-6 py-4 text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
              <Calendar size={12} />{m.archivedDate}
            </td>
            <td className="px-6 py-4">
              <div className="flex items-center gap-1">
                <button
                  onClick={() => handleRestore(m, m.name)}
                  className="p-1.5 text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                  title="Restore"
                >
                  <RotateCcw size={14} />
                </button>
                <button
                  onClick={() => handleDelete(m, m.name)}
                  className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                  title="Delete"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </td>
          </tr>
        ));

      case "releases":
        return (paginatedData as ArchivedRelease[]).map((r) => (
          <tr key={r.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/50 transition-colors">
            <td className="px-6 py-4 text-xs font-mono font-bold text-indigo-600 dark:text-indigo-400">{r.releaseId}</td>
            <td className="px-6 py-4 text-xs font-semibold text-slate-900 dark:text-white">{r.product}</td>
            <td className="px-6 py-4 text-xs text-slate-600 dark:text-slate-400">{r.releasedTo}</td>
            <td className="px-6 py-4 text-xs"><StatusBadge status={r.status} /></td>
            <td className="px-6 py-4 text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
              <Calendar size={12} />{r.archivedDate}
            </td>
            <td className="px-6 py-4">
              <div className="flex items-center gap-1">
                <button
                  onClick={() => handleRestore(r, r.releaseId)}
                  className="p-1.5 text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                  title="Restore"
                >
                  <RotateCcw size={14} />
                </button>
                <button
                  onClick={() => handleDelete(r, r.releaseId)}
                  className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                  title="Delete"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </td>
          </tr>
        ));

      default:
        return null;
    }
  };

  const renderTableHeaders = () => {
    switch (activeTab) {
      case "products":
        return (
          <>
            <th className="px-6 py-3 text-[10px] font-bold text-slate-500 uppercase tracking-wider">Name</th>
            <th className="px-6 py-3 text-[10px] font-bold text-slate-500 uppercase tracking-wider">SKU</th>
            <th className="px-6 py-3 text-[10px] font-bold text-slate-500 uppercase tracking-wider">Category</th>
            <th className="px-6 py-3 text-[10px] font-bold text-slate-500 uppercase tracking-wider">Collection</th>
            <th className="px-6 py-3 text-[10px] font-bold text-slate-500 uppercase tracking-wider">Archived Date</th>
            <th className="px-6 py-3 text-[10px] font-bold text-slate-500 uppercase tracking-wider text-left">Actions</th>
          </>
        );
      case "tech-packs":
        return (
          <>
            <th className="px-6 py-3 text-[10px] font-bold text-slate-500 uppercase tracking-wider">Name</th>
            <th className="px-6 py-3 text-[10px] font-bold text-slate-500 uppercase tracking-wider">Version</th>
            <th className="px-6 py-3 text-[10px] font-bold text-slate-500 uppercase tracking-wider">Product</th>
            <th className="px-6 py-3 text-[10px] font-bold text-slate-500 uppercase tracking-wider">Status</th>
            <th className="px-6 py-3 text-[10px] font-bold text-slate-500 uppercase tracking-wider">Archived Date</th>
            <th className="px-6 py-3 text-[10px] font-bold text-slate-500 uppercase tracking-wider text-left">Actions</th>
          </>
        );
      case "boms":
        return (
          <>
            <th className="px-6 py-3 text-[10px] font-bold text-slate-500 uppercase tracking-wider">BOM ID</th>
            <th className="px-6 py-3 text-[10px] font-bold text-slate-500 uppercase tracking-wider">Product</th>
            <th className="px-6 py-3 text-[10px] font-bold text-slate-500 uppercase tracking-wider">Components</th>
            <th className="px-6 py-3 text-[10px] font-bold text-slate-500 uppercase tracking-wider">Cost</th>
            <th className="px-6 py-3 text-[10px] font-bold text-slate-500 uppercase tracking-wider">Archived Date</th>
            <th className="px-6 py-3 text-[10px] font-bold text-slate-500 uppercase tracking-wider text-left">Actions</th>
          </>
        );
      case "materials":
        return (
          <>
            <th className="px-6 py-3 text-[10px] font-bold text-slate-500 uppercase tracking-wider">Code</th>
            <th className="px-6 py-3 text-[10px] font-bold text-slate-500 uppercase tracking-wider">Name</th>
            <th className="px-6 py-3 text-[10px] font-bold text-slate-500 uppercase tracking-wider">Type</th>
            <th className="px-6 py-3 text-[10px] font-bold text-slate-500 uppercase tracking-wider">Supplier</th>
            <th className="px-6 py-3 text-[10px] font-bold text-slate-500 uppercase tracking-wider">Archived Date</th>
            <th className="px-6 py-3 text-[10px] font-bold text-slate-500 uppercase tracking-wider text-left">Actions</th>
          </>
        );
      case "releases":
        return (
          <>
            <th className="px-6 py-3 text-[10px] font-bold text-slate-500 uppercase tracking-wider">Release ID</th>
            <th className="px-6 py-3 text-[10px] font-bold text-slate-500 uppercase tracking-wider">Product</th>
            <th className="px-6 py-3 text-[10px] font-bold text-slate-500 uppercase tracking-wider">Released To</th>
            <th className="px-6 py-3 text-[10px] font-bold text-slate-500 uppercase tracking-wider">Status</th>
            <th className="px-6 py-3 text-[10px] font-bold text-slate-500 uppercase tracking-wider">Archived Date</th>
            <th className="px-6 py-3 text-[10px] font-bold text-slate-500 uppercase tracking-wider text-left">Actions</th>
          </>
        );
      default:
        return null;
    }
  };

  return (
    <>
      <PLMLayout>
        <div className="max-w-7xl mx-auto space-y-6 pb-20">
          {/* Page Header */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <h1 className="text-3xl font-bold text-slate-900 dark:text-white tracking-tight">
                PLM Archives
              </h1>
              <p className="text-xs font-medium text-slate-500 dark:text-slate-400 mt-1">
                View and manage archived PLM records
              </p>
            </div>
          </div>

          {/* Tab Bar */}
          <TabBar tabs={ARCHIVE_TABS} activeTab={activeTab} onTabChange={setActiveTab} />

          {/* Archives Table */}
          <Card className="overflow-hidden">
            <div className="px-5 pt-5">
              <TableToolbar
                searchQuery={searchQuery}
                setSearchQuery={setSearchQuery}
                isFilterOpen={isFilterOpen}
                setIsFilterOpen={setIsFilterOpen}
                placeholder="Search archived items..."
                filterLabel="Filters"
              >
                <div className="p-3 text-xs text-slate-500 italic">No additional filters.</div>
              </TableToolbar>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead className="bg-slate-50/80 dark:bg-slate-800/50">
                  <tr>{renderTableHeaders()}</tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                  {renderTableContent()}
                </tbody>
              </table>
            </div>

            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              startIndex={startIndex}
              endIndex={endIndex}
              totalItems={filteredData.length}
              onPageChange={setCurrentPage}
            />
          </Card>
        </div>
      </PLMLayout>

      <ConfirmationModal
        isOpen={confirmModal.isOpen}
        onClose={() => setConfirmModal((prev) => ({ ...prev, isOpen: false }))}
        onConfirm={confirmModal.action}
        title={confirmModal.title}
        message={confirmModal.message}
        variant={confirmModal.variant}
        confirmText={confirmModal.confirmText}
      />

      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </>
  );
}

export default PLMArchivesPage;
