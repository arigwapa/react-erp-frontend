// ==========================================
// PLMPage.tsx — Product Lifecycle Management
// Super Admin overview for monitoring product
// lifecycle, enforcing governance, and ensuring
// compliance across all branches.
// ==========================================

import { useState, useMemo } from "react";
import {
  Package,
  FileText,
  AlertTriangle,
  CheckCircle,
  Lock,
  Unlock,
  History,
  Eye,
  ArrowUpRight,
  ShieldAlert,
  Download,
  GitBranch,
  Calendar,
  User,
  Clock,
  Layers,
} from "lucide-react";

// ------------------------------------------
// Layout & Reusable UI Components
// ------------------------------------------
import MainLayout from "../../layout/MainLayout";
import { Card } from "../../components/ui/Card";
import StatsCard from "../../components/ui/StatsCard";
import { StatusBadge } from "../../components/ui/StatusBadge";
import { TableToolbar } from "../../components/ui/TableToolbar";
import Pagination from "../../components/ui/Pagination";
import SecondaryButton from "../../components/ui/SecondaryButton";
import ConfirmationModal from "../../components/ui/ConfirmationModal";
import PageModal from "../../components/ui/PageModal";
import ViewGapModal from "../../components/ui/ViewGapModal";
import Toast from "../../components/ui/Toast";

// ==========================================
// Types
// ==========================================
type LifecycleStage = "Draft" | "Under Review" | "Production" | "Archived";

interface Product {
  id: string;
  sku: string;
  name: string;
  branch: string;
  season: string;
  stage: LifecycleStage;
  version: number;
  isLocked: boolean;
  hasBOM: boolean; // Bill of Materials
  hasTechPack: boolean;
  hasQAChecklist: boolean;
  lastModified: string;
  modifiedBy: string;
}

// ==========================================
// Mock Data
// ==========================================
const MOCK_PRODUCTS: Product[] = [
  {
    id: "P-101",
    sku: "DNM-JKT-001",
    name: "Classic Denim Jacket",
    branch: "Manila Main",
    season: "FW 2026",
    stage: "Production",
    version: 3,
    isLocked: true,
    hasBOM: true,
    hasTechPack: true,
    hasQAChecklist: true,
    lastModified: "Feb 10, 2026",
    modifiedBy: "Des. Team A",
  },
  {
    id: "P-102",
    sku: "SMR-DRS-042",
    name: "Floral Summer Dress",
    branch: "Cebu Warehouse",
    season: "SS 2026",
    stage: "Under Review",
    version: 1,
    isLocked: false,
    hasBOM: true,
    hasTechPack: true,
    hasQAChecklist: false,
    lastModified: "Feb 11, 2026",
    modifiedBy: "Prod. Manager",
  },
  {
    id: "P-103",
    sku: "BSC-TEE-WHT",
    name: "Basic Cotton Tee",
    branch: "Manila Main",
    season: "Core",
    stage: "Draft",
    version: 1,
    isLocked: false,
    hasBOM: false,
    hasTechPack: false,
    hasQAChecklist: false,
    lastModified: "Feb 09, 2026",
    modifiedBy: "Intern J",
  },
  {
    id: "P-104",
    sku: "WTR-COAT-BLK",
    name: "Wool Trench Coat",
    branch: "Davao",
    season: "FW 2026",
    stage: "Under Review",
    version: 2,
    isLocked: false,
    hasBOM: true,
    hasTechPack: true,
    hasQAChecklist: true,
    lastModified: "Feb 08, 2026",
    modifiedBy: "Sr. Designer",
  },
  {
    id: "P-105",
    sku: "LNR-SHT-BLU",
    name: "Linen Button-Down Shirt",
    branch: "Cebu Warehouse",
    season: "SS 2026",
    stage: "Production",
    version: 2,
    isLocked: true,
    hasBOM: true,
    hasTechPack: true,
    hasQAChecklist: true,
    lastModified: "Feb 07, 2026",
    modifiedBy: "Des. Team B",
  },
  {
    id: "P-106",
    sku: "KNT-SWT-GRY",
    name: "Knit Crew Sweater",
    branch: "Manila Main",
    season: "FW 2026",
    stage: "Draft",
    version: 1,
    isLocked: false,
    hasBOM: false,
    hasTechPack: true,
    hasQAChecklist: false,
    lastModified: "Feb 06, 2026",
    modifiedBy: "Intern K",
  },
  {
    id: "P-107",
    sku: "CRG-PNT-KHK",
    name: "Cargo Utility Pants",
    branch: "Davao",
    season: "Core",
    stage: "Production",
    version: 4,
    isLocked: true,
    hasBOM: true,
    hasTechPack: true,
    hasQAChecklist: true,
    lastModified: "Feb 05, 2026",
    modifiedBy: "Sr. Designer",
  },
];

// ------------------------------------------
// Pagination Constants
// ------------------------------------------
const ITEMS_PER_PAGE = 5;

// ==========================================
// Main Component
// ==========================================
function PLMPage() {
  // ------------------------------------------
  // State: Data & Filtering
  // ------------------------------------------
  const [products, setProducts] = useState<Product[]>(MOCK_PRODUCTS);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStage, setFilterStage] = useState<string>("All");
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);

  // ------------------------------------------
  // State: Inspect Modal
  // ------------------------------------------
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  // ------------------------------------------
  // State: View Gap Modal (Compliance Detail)
  // ------------------------------------------
  const [viewGapProduct, setViewGapProduct] = useState<Product | null>(null);
  const [viewGapField, setViewGapField] = useState<string>("");

  // ------------------------------------------
  // State: Toast & Confirmation Modal
  // ------------------------------------------
  const [toast, setToast] = useState<{
    message: string;
    type: "success" | "error";
  } | null>(null);

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

  // ------------------------------------------
  // Computed: KPI Metrics
  // Used by StatsCard components in the header
  // ------------------------------------------
  const metrics = useMemo(
    () => ({
      total: products.length,
      delayed: products.filter(
        (p) => p.stage === "Under Review" && !p.isLocked,
      ).length,
      complianceIssues: products.filter(
        (p) => !p.hasBOM || !p.hasQAChecklist,
      ).length,
      productionReady: products.filter((p) => p.stage === "Production").length,
    }),
    [products],
  );

  // ------------------------------------------
  // Computed: Filtered Products
  // Matches search query and stage filter
  // ------------------------------------------
  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      const matchesSearch =
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.sku.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.branch.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesStage = filterStage === "All" || p.stage === filterStage;
      return matchesSearch && matchesStage;
    });
  }, [products, searchQuery, filterStage]);

  // ------------------------------------------
  // Computed: Pagination
  // Slices filteredProducts for the current page
  // ------------------------------------------
  const totalPages = Math.max(
    1,
    Math.ceil(filteredProducts.length / ITEMS_PER_PAGE),
  );
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = Math.min(
    startIndex + ITEMS_PER_PAGE,
    filteredProducts.length,
  );
  const paginatedProducts = filteredProducts.slice(startIndex, endIndex);

  // ------------------------------------------
  // Handler: Toast
  // ------------------------------------------
  const triggerToast = (message: string, type: "success" | "error") => {
    setToast({ message, type });
  };

  // ------------------------------------------
  // Handler: Export
  // ------------------------------------------
  const handleExport = () => {
    triggerToast("Exporting PLM Report...", "success");
  };

  // ------------------------------------------
  // Handler: Force Release to Production
  // Overrides the approval process (Super Admin)
  // ------------------------------------------
  const handleForceApprove = (product: Product) => {
    setConfirmModal({
      isOpen: true,
      title: "Force Release to Production?",
      message: `You are about to override the approval process for ${product.sku}. This action will be logged in the audit trail.`,
      variant: "primary",
      confirmText: "Force Release",
      action: () => {
        setProducts((prev) =>
          prev.map((p) =>
            p.id === product.id
              ? {
                  ...p,
                  stage: "Production" as LifecycleStage,
                  isLocked: true,
                }
              : p,
          ),
        );
        setSelectedProduct((prev) =>
          prev && prev.id === product.id
            ? {
                ...prev,
                stage: "Production" as LifecycleStage,
                isLocked: true,
              }
            : prev,
        );
        setConfirmModal((prev) => ({ ...prev, isOpen: false }));
        triggerToast(
          `Product ${product.sku} forced to Production status.`,
          "success",
        );
      },
    });
  };

  // ------------------------------------------
  // Handler: Toggle Lock/Unlock Version
  // Prevents or allows further edits (Super Admin)
  // ------------------------------------------
  const handleToggleLock = (product: Product) => {
    const isLocking = !product.isLocked;
    setConfirmModal({
      isOpen: true,
      title: isLocking ? "Lock Product Version?" : "Unlock Product Version?",
      message: isLocking
        ? "Locking this version prevents any further edits by regular users."
        : "Unlocking allows users to modify specs. This may affect consistency.",
      variant: isLocking ? "primary" : "danger",
      confirmText: isLocking ? "Lock Version" : "Unlock",
      action: () => {
        setProducts((prev) =>
          prev.map((p) =>
            p.id === product.id ? { ...p, isLocked: isLocking } : p,
          ),
        );
        setSelectedProduct((prev) =>
          prev && prev.id === product.id
            ? { ...prev, isLocked: isLocking }
            : prev,
        );
        setConfirmModal((prev) => ({ ...prev, isOpen: false }));
        triggerToast(
          `Product version ${isLocking ? "locked" : "unlocked"}.`,
          "success",
        );
      },
    });
  };

  // ------------------------------------------
  // Handler: Revert to Draft
  // Sends product back for revision (Super Admin)
  // ------------------------------------------
  const handleRevert = (product: Product) => {
    setConfirmModal({
      isOpen: true,
      title: "Revert to Draft?",
      message:
        "This will send the product back to the design team for revision. Reason: 'Admin Rejection'.",
      variant: "danger",
      confirmText: "Revert Status",
      action: () => {
        setProducts((prev) =>
          prev.map((p) =>
            p.id === product.id
              ? {
                  ...p,
                  stage: "Draft" as LifecycleStage,
                  isLocked: false,
                }
              : p,
          ),
        );
        setSelectedProduct((prev) =>
          prev && prev.id === product.id
            ? {
                ...prev,
                stage: "Draft" as LifecycleStage,
                isLocked: false,
              }
            : prev,
        );
        setConfirmModal((prev) => ({ ...prev, isOpen: false }));
        triggerToast(`Product ${product.sku} reverted to Draft.`, "success");
      },
    });
  };

  // ------------------------------------------
  // Handler: View Gap (opens DetailsModal
  // for a specific missing compliance item)
  // ------------------------------------------
  const handleViewGap = (product: Product, field: string) => {
    setViewGapProduct(product);
    setViewGapField(field);
  };

  // ------------------------------------------
  // Helper: Compliance checklist items
  // Returns array of { label, complete, field }
  // ------------------------------------------
  const getComplianceItems = (product: Product) => [
    {
      label: "Bill of Materials (BOM)",
      complete: product.hasBOM,
      field: "BOM",
    },
    {
      label: "Tech Pack Upload",
      complete: product.hasTechPack,
      field: "Tech Pack",
    },
    {
      label: "QA Checklist",
      complete: product.hasQAChecklist,
      field: "QA Checklist",
    },
  ];

  // ------------------------------------------
  // Helper: Check if all compliance items pass
  // ------------------------------------------
  const isFullyCompliant = (product: Product) =>
    product.hasBOM && product.hasTechPack && product.hasQAChecklist;

  // ==========================================
  // RENDER
  // ==========================================
  return (
    <>
      {/* ==========================================
          MAIN LAYOUT — Page content only
          All modals are rendered OUTSIDE MainLayout
          so their fixed backdrop covers the entire
          viewport (including sidebar).
          ========================================== */}
      <MainLayout>
        <div className="max-w-7xl mx-auto space-y-6 pb-20">
        {/* ==========================================
            SECTION 1: PAGE HEADER
            Title (no icon) + Subtitle + Export Button
            ========================================== */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 tracking-tight">
              Global PLM Overview
            </h1>
            <p className="text-xs font-medium text-slate-500 mt-1">
              Monitor product lifecycle, enforce governance, and ensure
              compliance across all branches.
            </p>
          </div>

          {/* Export Button — uses SecondaryButton for consistent rounded-full design */}
          <SecondaryButton
            onClick={handleExport}
            icon={Download}
            ariaLabel="Export PLM Report"
          >
            Export Report
          </SecondaryButton>
        </div>

        {/* ==========================================
            SECTION 2: KPI STATS CARDS
            Uses StatsCard component for consistent look
            ========================================== */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <StatsCard
            title="Total SKUs"
            value={metrics.total}
            icon={Package}
            color="bg-slate-500"
          />
          <StatsCard
            title="Awaiting Review"
            value={metrics.delayed}
            icon={History}
            color="bg-amber-500"
          />
          <StatsCard
            title="Compliance Alerts"
            value={metrics.complianceIssues}
            icon={ShieldAlert}
            color="bg-rose-500"
          />
          <StatsCard
            title="Production Ready"
            value={metrics.productionReady}
            icon={CheckCircle}
            color="bg-emerald-500"
          />
        </div>

        {/* ==========================================
            SECTION 3: PRODUCTS TABLE
            Card wraps toolbar, table, and pagination
            ========================================== */}
        <Card className="overflow-hidden">
          {/* 3a. TableToolbar — Search & Stage Filter inside the Card */}
          <div className="px-5 pt-5">
            <TableToolbar
              searchQuery={searchQuery}
              setSearchQuery={(q) => {
                setSearchQuery(q);
                setCurrentPage(1);
              }}
              isFilterOpen={isFilterOpen}
              setIsFilterOpen={setIsFilterOpen}
              placeholder="Search by SKU, Name, or Branch..."
              filterLabel={
                filterStage === "All" ? "All Stages" : filterStage
              }
            >
              {/* Stage filter options — rendered inside TableToolbar's dropdown */}
              <div
                className="p-1.5"
                role="group"
                aria-label="Filter by Lifecycle Stage"
              >
                {["All", "Draft", "Under Review", "Production", "Archived"].map(
                  (stage) => (
                    <button
                      key={stage}
                      role="option"
                      aria-selected={filterStage === stage}
                      onClick={() => {
                        setFilterStage(stage);
                        setIsFilterOpen(false);
                        setCurrentPage(1);
                      }}
                      className={`w-full text-left px-3 py-2 text-xs font-semibold rounded-lg transition-colors ${
                        filterStage === stage
                          ? "bg-slate-100 text-slate-900"
                          : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                      }`}
                    >
                      {stage === "All" ? "All Stages" : stage}
                    </button>
                  ),
                )}
              </div>
            </TableToolbar>
          </div>

          {/* 3b. Products Data Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              {/* Table Header — text-xs (12px) font-bold for column titles */}
              <thead className="bg-slate-50/80">
                <tr>
                  <th className="px-6 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider">
                    Product Info
                  </th>
                  <th className="px-6 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider">
                    Context
                  </th>
                  <th className="px-6 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider">
                    Lifecycle Status
                  </th>
                  <th className="px-6 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider">
                    Compliance
                  </th>
                  <th className="px-6 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider text-left">
                    Actions
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100 text-sm">
                {paginatedProducts.map((product) => (
                  <tr
                    key={product.id}
                    className="hover:bg-slate-50/50 transition-colors"
                  >
                    {/* Product Info: Name, SKU, thumbnail placeholder */}
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-400 flex-shrink-0">
                          <Package size={18} />
                        </div>
                        <div>
                          <div className="font-semibold text-slate-900 text-sm">
                            {product.name}
                          </div>
                          <div className="text-[11px] text-slate-500 font-mono mt-0.5">
                            {product.sku}
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Context: Branch, Season, Version */}
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-slate-700">
                        {product.branch}
                      </div>
                      <div className="text-[11px] text-slate-500 mt-0.5">
                        {product.season} &bull; v{product.version}
                      </div>
                    </td>

                    {/* Lifecycle Status — uses StatusBadge + Lock icon */}
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <StatusBadge status={product.stage} />
                        {product.isLocked && (
                          <Lock
                            size={12}
                            className="text-slate-400"
                            aria-label="Version locked"
                          />
                        )}
                      </div>
                    </td>

                    {/* Compliance: Shows "Complete" badge or missing item pills */}
                    <td className="px-6 py-4">
                      {isFullyCompliant(product) ? (
                        <span className="inline-flex items-center gap-1 whitespace-nowrap text-left text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full">
                          <CheckCircle size={12} /> Complete
                        </span>
                      ) : (
                        <div className="flex flex-wrap gap-1.5">
                          {!product.hasBOM && (
                            <span
                              className="inline-flex items-center gap-1 whitespace-nowrap text-left text-[10px] font-bold text-rose-600 bg-rose-50 px-2 py-0.5 rounded-full"
                              title="Missing BOM"
                            >
                              <AlertTriangle size={10} /> BOM
                            </span>
                          )}
                          {!product.hasTechPack && (
                            <span
                              className="inline-flex items-center gap-1 whitespace-nowrap text-left text-[10px] font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full"
                              title="Missing Tech Pack"
                            >
                              <FileText size={10} /> Tech Pack
                            </span>
                          )}
                          {!product.hasQAChecklist && (
                            <span
                              className="inline-flex items-center gap-1 whitespace-nowrap text-left text-[10px] font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full"
                              title="Missing QA Checklist"
                            >
                              <FileText size={10} /> QA
                            </span>
                          )}
                        </div>
                      )}
                    </td>

                    {/* Actions: Inspect button with Eye icon */}
                    <td className="px-6 py-4 text-left">
                      <button
                        onClick={() => setSelectedProduct(product)}
                        className="inline-flex items-center gap-1 whitespace-nowrap text-left.5 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors"
                        aria-label={`Inspect ${product.sku}`}
                      >
                        <Eye size={14} />
                        Inspect
                      </button>
                    </td>
                  </tr>
                ))}

                {/* Empty State */}
                {filteredProducts.length === 0 && (
                  <tr>
                    <td
                      colSpan={5}
                      className="px-6 py-16 text-center text-slate-400 text-sm"
                    >
                      <div className="flex flex-col items-center gap-2">
                        <Package size={32} className="text-slate-300" />
                        <p className="font-medium">No products found</p>
                        <p className="text-xs">
                          Try adjusting your search or filter criteria.
                        </p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* 3c. Pagination — renders at the bottom of the Card */}
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            startIndex={startIndex}
            endIndex={endIndex}
            totalItems={filteredProducts.length}
            onPageChange={setCurrentPage}
          />
        </Card>

      </div>
      </MainLayout>

      {/* ==========================================
          MODALS — Rendered OUTSIDE MainLayout
          so their fixed backdrop + blur covers the
          entire viewport (including sidebar).
          Ordered bottom-to-top by z-index priority:
            1. Inspect Modal (z-50)
            2. View Gap DetailsModal (z-50, later DOM = on top)
            3. ConfirmationModal (z-50, last DOM = topmost)
            4. Toast (always on top)
          ========================================== */}

      {/* ---- SECTION 4: PRODUCT INSPECT MODAL ---- */}
      {/* Centered modal for product governance, specs, compliance, materials */}
      {selectedProduct && (
        <PageModal
          isOpen={!!selectedProduct}
          onClose={() => setSelectedProduct(null)}
          title={selectedProduct.name}
          badges={<StatusBadge status={selectedProduct.stage} className="!text-[10px] !py-0.5" />}
          subtitle={<>SKU: {selectedProduct.sku} &bull; Version: {selectedProduct.version}</>}
          ariaId="inspect-modal-title"
        >
          <div className="space-y-6">
              {/* A. Super Admin Governance Zone */}
              {/* Highlighted section for admin-only override actions */}
              <div className="bg-slate-50 border border-indigo-100 rounded-xl p-5 relative overflow-hidden">
                <div className="absolute top-0 left-0 w-1 h-full bg-indigo-500" />
                <h3 className="text-xs font-bold text-indigo-900 uppercase tracking-wider flex items-center gap-2 mb-2">
                  <ShieldAlert size={14} />
                  Admin Governance Actions
                </h3>
                <p className="text-[11px] text-slate-500 mb-4">
                  As Super Admin, you can override standard workflows. All
                  actions are audited.
                </p>

                {/* Governance action buttons — uses SecondaryButton */}
                <div className="flex flex-wrap gap-2">
                  <SecondaryButton
                    onClick={() => handleForceApprove(selectedProduct)}
                    disabled={selectedProduct.stage === "Production"}
                    icon={ArrowUpRight}
                    className="!px-3 !py-2 !text-[11px]"
                  >
                    Force Release
                  </SecondaryButton>
                  <SecondaryButton
                    onClick={() => handleToggleLock(selectedProduct)}
                    icon={selectedProduct.isLocked ? Unlock : Lock}
                    className="!px-3 !py-2 !text-[11px]"
                  >
                    {selectedProduct.isLocked
                      ? "Unlock Version"
                      : "Lock Version"}
                  </SecondaryButton>
                  <SecondaryButton
                    onClick={() => handleRevert(selectedProduct)}
                    disabled={selectedProduct.stage === "Draft"}
                    icon={History}
                    className="!px-3 !py-2 !text-[11px]"
                  >
                    Revert to Draft
                  </SecondaryButton>
                </div>
              </div>

              {/* B. Technical Specifications — read-only info grid */}
              <div>
                <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2 mb-3">
                  <FileText size={14} className="text-slate-400" />
                  Technical Specifications
                </h4>
                <div className="grid grid-cols-2 gap-4 text-sm border-t border-slate-100 pt-4">
                  <div className="space-y-1">
                    <span className="flex items-center gap-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                      <Calendar size={10} /> Season
                    </span>
                    <span className="text-sm font-semibold text-slate-700">
                      {selectedProduct.season}
                    </span>
                  </div>
                  <div className="space-y-1">
                    <span className="flex items-center gap-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                      <GitBranch size={10} /> Origin Branch
                    </span>
                    <span className="text-sm font-semibold text-slate-700">
                      {selectedProduct.branch}
                    </span>
                  </div>
                  <div className="space-y-1">
                    <span className="flex items-center gap-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                      <Clock size={10} /> Last Modified
                    </span>
                    <span className="text-sm font-semibold text-slate-700">
                      {selectedProduct.lastModified}
                    </span>
                  </div>
                  <div className="space-y-1">
                    <span className="flex items-center gap-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                      <User size={10} /> Modified By
                    </span>
                    <span className="text-sm font-semibold text-slate-700">
                      {selectedProduct.modifiedBy}
                    </span>
                  </div>
                </div>
              </div>

              {/* C. Compliance Check — shows pass/fail with View Gap button */}
              <div>
                <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2 mb-3">
                  <CheckCircle size={14} className="text-slate-400" />
                  Readiness & Compliance
                </h4>
                <div className="bg-white border border-slate-200 rounded-xl divide-y divide-slate-100 overflow-hidden">
                  {getComplianceItems(selectedProduct).map((item) => (
                    <div
                      key={item.field}
                      className="px-4 py-3 flex items-center justify-between"
                    >
                      <div className="flex items-center gap-3">
                        {/* Green dot = complete, Red dot = missing */}
                        <div
                          className={`w-2 h-2 rounded-full flex-shrink-0 ${
                            item.complete
                              ? "bg-emerald-500"
                              : "bg-rose-500"
                          }`}
                        />
                        <span className="text-sm text-slate-700">
                          {item.label}
                        </span>
                      </div>
                      {item.complete ? (
                        <span className="text-[11px] font-semibold text-emerald-600">
                          Complete
                        </span>
                      ) : (
                        <button
                          onClick={() =>
                            handleViewGap(selectedProduct, item.field)
                          }
                          className="inline-flex items-center gap-1 whitespace-nowrap text-left text-[11px] font-bold text-indigo-600 hover:text-indigo-800 hover:bg-indigo-50 px-2 py-1 rounded-lg transition-colors"
                        >
                          <Eye size={12} />
                          View Gap
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* D. Materials Snapshot — mock data preview */}
              <div>
                <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-3">
                  Materials Snapshot
                </h4>
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 text-center text-sm text-slate-500">
                  <p className="italic text-xs">
                    Previewing material list for {selectedProduct.sku}...
                  </p>
                  <div className="mt-3 flex justify-center flex-wrap gap-2">
                    <span className="bg-white border border-slate-200 px-3 py-1.5 rounded-full text-xs font-medium text-slate-700">
                      Cotton 100%
                    </span>
                    <span className="bg-white border border-slate-200 px-3 py-1.5 rounded-full text-xs font-medium text-slate-700">
                      Poly Thread
                    </span>
                    <span className="bg-white border border-slate-200 px-3 py-1.5 rounded-full text-xs font-medium text-slate-700">
                      YKK Zippers
                    </span>
                  </div>
                </div>
              </div>
            </div>
        </PageModal>
      )}

      {/* ---- VIEW GAP DETAILS MODAL ---- */}
      {/* Renders AFTER inspect modal so it stacks on top when both are open */}
      <ViewGapModal
        isOpen={!!viewGapProduct}
        onClose={() => {
          setViewGapProduct(null);
          setViewGapField("");
        }}
        title={`${viewGapField} Gap Analysis`}
        itemId={viewGapProduct?.sku || ""}
        headerIcon={
          <div className="p-2 bg-amber-50 rounded-xl">
            <AlertTriangle size={20} className="text-amber-600" />
          </div>
        }
        fields={[
          {
            label: "Product",
            value: viewGapProduct?.name || "",
            icon: Package,
          },
          {
            label: "Branch",
            value: viewGapProduct?.branch || "",
            icon: GitBranch,
          },
          {
            label: "Stage",
            value: viewGapProduct ? (
              <StatusBadge status={viewGapProduct.stage} />
            ) : (
              ""
            ),
            icon: Layers,
          },
          {
            label: "Version",
            value: `v${viewGapProduct?.version || 0}`,
            icon: History,
          },
        ]}
      >
        {/* Gap Analysis Description */}
        <div className="space-y-2">
          <p className="text-xs font-bold text-slate-700 uppercase tracking-wider">
            Missing: {viewGapField}
          </p>
          <p className="text-sm text-slate-600">
            This product is missing the{" "}
            <span className="font-semibold">{viewGapField}</span>{" "}
            documentation. Please ensure the design team uploads or completes
            this requirement before advancing the product to the next lifecycle
            stage.
          </p>
          <div className="mt-3 flex items-center gap-2 text-xs text-amber-700 bg-amber-50 border border-amber-100 rounded-lg px-3 py-2">
            <AlertTriangle size={12} />
            <span className="font-medium">
              This item blocks production readiness compliance.
            </span>
          </div>
        </div>
      </ViewGapModal>

      {/* ---- CONFIRMATION MODAL ---- */}
      {/* Renders LAST so it always appears on top of everything */}
      <ConfirmationModal
        isOpen={confirmModal.isOpen}
        onClose={() => setConfirmModal((prev) => ({ ...prev, isOpen: false }))}
        onConfirm={confirmModal.action}
        title={confirmModal.title}
        message={confirmModal.message}
        variant={confirmModal.variant}
        confirmText={confirmModal.confirmText}
      />

      {/* ---- TOAST NOTIFICATION ---- */}
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </>
  );
}

export default PLMPage;
