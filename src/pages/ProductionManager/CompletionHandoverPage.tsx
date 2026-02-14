// ==========================================
// CompletionHandoverPage.tsx
// Production Manager — Completion & Handover
// Formal transition: Production → QA → Warehouse → Finance.
// Shows completed work orders with QA status,
// warehouse intake status, and action buttons.
// ==========================================

import React, { useState, useMemo } from "react";
import ProductionLayout from "../../layout/ProductionLayout";
import StatsCard from "../../components/ui/StatsCard";
import { TableToolbar } from "../../components/ui/TableToolbar";
import { StatusBadge } from "../../components/ui/StatusBadge";
import Pagination from "../../components/ui/Pagination";
import PageModal from "../../components/ui/PageModal";
import ConfirmationModal from "../../components/ui/ConfirmationModal";
import Toast from "../../components/ui/Toast";
import ChecklistItem from "../../components/ui/ChecklistItem";
import IconSelect from "../../components/ui/IconSelect";
import {
  PackageCheck,
  ShieldCheck,
  Warehouse,
  Eye,
  Send,
  ClipboardCheck,
  FileCheck,
} from "lucide-react";

// ------------------------------------------
// Types
// ------------------------------------------
interface CompletedOrder {
  id: string;
  woNumber: string;
  productSku: string;
  productName: string;
  producedQty: number;
  completionDate: string;
  qaStatus: "Not Sent" | "Pending QA" | "Passed" | "Failed" | "Rework";
  warehouseStatus: "Not Sent" | "Pending Intake" | "Received" | "Rejected";
}

// ------------------------------------------
// Mock data
// ------------------------------------------
const mockOrders: CompletedOrder[] = [
  { id: "1", woNumber: "WO-096", productSku: "SKU-004", productName: "Joggers", producedQty: 600, completionDate: "2026-02-18", qaStatus: "Passed", warehouseStatus: "Received" },
  { id: "2", woNumber: "WO-099", productSku: "SKU-002", productName: "Hoodie", producedQty: 450, completionDate: "2026-02-14", qaStatus: "Passed", warehouseStatus: "Pending Intake" },
  { id: "3", woNumber: "WO-094", productSku: "SKU-008", productName: "Windbreaker", producedQty: 250, completionDate: "2026-02-12", qaStatus: "Failed", warehouseStatus: "Not Sent" },
  { id: "4", woNumber: "WO-091", productSku: "SKU-001", productName: "Basic Tee", producedQty: 1000, completionDate: "2026-02-10", qaStatus: "Passed", warehouseStatus: "Received" },
  { id: "5", woNumber: "WO-088", productSku: "SKU-003", productName: "Polo Shirt", producedQty: 300, completionDate: "2026-02-08", qaStatus: "Pending QA", warehouseStatus: "Not Sent" },
  { id: "6", woNumber: "WO-085", productSku: "SKU-006", productName: "Tank Top", producedQty: 800, completionDate: "2026-02-06", qaStatus: "Passed", warehouseStatus: "Received" },
];

const qaFilterOptions = [
  { value: "", label: "All QA Status" },
  { value: "Not Sent", label: "Not Sent" },
  { value: "Pending QA", label: "Pending QA" },
  { value: "Passed", label: "Passed" },
  { value: "Failed", label: "Failed" },
];

const ITEMS_PER_PAGE = 6;

// ==========================================
// Component
// ==========================================
const CompletionHandoverPage: React.FC = () => {
  const [orders] = useState<CompletedOrder[]>(mockOrders);
  const [searchQuery, setSearchQuery] = useState("");
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [filterQA, setFilterQA] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  // Modal states
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<CompletedOrder | null>(null);
  const [sendToQA, setSendToQA] = useState<CompletedOrder | null>(null);
  const [sendToWarehouse, setSendToWarehouse] = useState<CompletedOrder | null>(null);

  // Toast
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);

  // KPI calculations
  const kpis = useMemo(() => ({
    total: orders.length,
    qaPassed: orders.filter((o) => o.qaStatus === "Passed").length,
    warehouseReceived: orders.filter((o) => o.warehouseStatus === "Received").length,
    pendingActions: orders.filter((o) => o.qaStatus === "Not Sent" || (o.qaStatus === "Passed" && o.warehouseStatus !== "Received")).length,
  }), [orders]);

  // Filtered data
  const filtered = useMemo(() => {
    let data = [...orders];
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      data = data.filter(
        (o) =>
          o.woNumber.toLowerCase().includes(q) ||
          o.productName.toLowerCase().includes(q) ||
          o.productSku.toLowerCase().includes(q)
      );
    }
    if (filterQA) {
      data = data.filter((o) => o.qaStatus === filterQA);
    }
    return data;
  }, [orders, searchQuery, filterQA]);

  // Pagination
  const totalPages = Math.max(1, Math.ceil(filtered.length / ITEMS_PER_PAGE));
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = Math.min(startIndex + ITEMS_PER_PAGE, filtered.length);
  const paginatedData = filtered.slice(startIndex, endIndex);

  const handleView = (order: CompletedOrder) => {
    setSelectedOrder(order);
    setIsDetailOpen(true);
  };

  const handleSendToQA = (order: CompletedOrder) => {
    setSendToQA(order);
  };

  const confirmSendToQA = () => {
    if (sendToQA) {
      setToast({ message: `${sendToQA.woNumber} sent to QA inspection successfully.`, type: "success" });
      setSendToQA(null);
    }
  };

  const handleSendToWarehouse = (order: CompletedOrder) => {
    setSendToWarehouse(order);
  };

  const confirmSendToWarehouse = () => {
    if (sendToWarehouse) {
      setToast({ message: `${sendToWarehouse.woNumber} warehouse receipt confirmed.`, type: "success" });
      setSendToWarehouse(null);
    }
  };

  // QA badge styling
  const getQABadge = (status: string) => {
    switch (status) {
      case "Not Sent": return "bg-slate-100 text-slate-600";
      case "Pending QA": return "bg-amber-50 text-amber-700";
      case "Passed": return "bg-emerald-50 text-emerald-700";
      case "Failed": return "bg-rose-50 text-rose-700";
      case "Rework": return "bg-orange-50 text-orange-700";
      default: return "bg-slate-100 text-slate-600";
    }
  };

  const getWarehouseBadge = (status: string) => {
    switch (status) {
      case "Not Sent": return "bg-slate-100 text-slate-600";
      case "Pending Intake": return "bg-amber-50 text-amber-700";
      case "Received": return "bg-emerald-50 text-emerald-700";
      case "Rejected": return "bg-rose-50 text-rose-700";
      default: return "bg-slate-100 text-slate-600";
    }
  };

  return (
    <ProductionLayout>
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Completion & Handover</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Formal transition from Production to QA, Warehouse, and Finance</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatsCard title="Completed Orders" value={kpis.total} icon={PackageCheck} color="bg-indigo-500" />
        <StatsCard title="QA Passed" value={kpis.qaPassed} icon={ShieldCheck} color="bg-emerald-500" />
        <StatsCard title="Warehouse Received" value={kpis.warehouseReceived} icon={Warehouse} color="bg-blue-500" />
        <StatsCard title="Pending Actions" value={kpis.pendingActions} icon={FileCheck} color="bg-amber-500" />
      </div>

      {/* Toolbar */}
      <TableToolbar
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        isFilterOpen={isFilterOpen}
        setIsFilterOpen={setIsFilterOpen}
        placeholder="Search by WO#, Product, or SKU…"
      >
        <div className="p-3">
          <IconSelect label="QA Status" value={filterQA} onChange={(v) => { setFilterQA(v); setCurrentPage(1); }} options={qaFilterOptions} placeholder="All QA Status" />
        </div>
      </TableToolbar>

      {/* Table */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700">
                <th className="px-6 py-3 text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">WO No.</th>
                <th className="px-6 py-3 text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Product</th>
                <th className="px-6 py-3 text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Produced Qty</th>
                <th className="px-6 py-3 text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Completion Date</th>
                <th className="px-6 py-3 text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">QA Status</th>
                <th className="px-6 py-3 text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Warehouse Status</th>
                <th className="px-6 py-3 text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider text-left">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
              {paginatedData.length > 0 ? (
                paginatedData.map((order) => (
                  <tr key={order.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/50 transition-colors">
                    <td className="px-6 py-3 text-xs font-bold text-indigo-600 dark:text-indigo-400">{order.woNumber}</td>
                    <td className="px-6 py-3">
                      <p className="text-xs font-medium text-slate-800 dark:text-slate-200">{order.productName}</p>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400">{order.productSku}</p>
                    </td>
                    <td className="px-6 py-3 text-xs font-bold text-slate-800 dark:text-slate-200">{order.producedQty.toLocaleString()} pcs</td>
                    <td className="px-6 py-3 text-[11px] text-slate-600 dark:text-slate-400">{order.completionDate}</td>
                    <td className="px-6 py-3">
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${getQABadge(order.qaStatus)}`}>{order.qaStatus}</span>
                    </td>
                    <td className="px-6 py-3">
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${getWarehouseBadge(order.warehouseStatus)}`}>{order.warehouseStatus}</span>
                    </td>
                    <td className="px-6 py-3 text-left">
                      <div className="flex items-center justify-start gap-1">
                        <button onClick={() => handleView(order)} className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 rounded-lg transition-colors" title="View Details"><Eye size={14} /></button>
                        {order.qaStatus === "Not Sent" && (
                          <button
                            onClick={() => handleSendToQA(order)}
                            className="inline-flex items-center gap-1 whitespace-nowrap text-left.5 px-2.5 py-1.5 text-[11px] font-semibold text-blue-700 bg-blue-50 hover:bg-blue-100 dark:bg-blue-900/30 dark:text-blue-400 dark:hover:bg-blue-900/50 border border-blue-200 dark:border-blue-800 rounded-lg transition-all active:scale-95"
                            title="Send to QA"
                          >
                            <Send size={12} />
                            Send to QA
                          </button>
                        )}
                        {order.qaStatus === "Passed" && order.warehouseStatus !== "Received" && (
                          <button
                            onClick={() => handleSendToWarehouse(order)}
                            className="inline-flex items-center gap-1 whitespace-nowrap text-left.5 px-2.5 py-1.5 text-[11px] font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-900/30 dark:text-emerald-400 dark:hover:bg-emerald-900/50 border border-emerald-200 dark:border-emerald-800 rounded-lg transition-all active:scale-95"
                            title="Confirm Receipt"
                          >
                            <ClipboardCheck size={12} />
                            Confirm Receipt
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-sm text-slate-400 italic">No completed orders found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        <Pagination currentPage={currentPage} totalPages={totalPages} startIndex={startIndex} endIndex={endIndex} totalItems={filtered.length} onPageChange={setCurrentPage} />
      </div>

      {/* Detail Modal with Handover Checklist */}
      <PageModal
        isOpen={isDetailOpen}
        onClose={() => setIsDetailOpen(false)}
        title={selectedOrder?.woNumber || ""}
        subtitle={`${selectedOrder?.productSku} — ${selectedOrder?.productName}`}
        badges={selectedOrder ? <StatusBadge status="Completed" /> : undefined}
      >
        {selectedOrder && (
          <div className="space-y-5">
            <div className="grid grid-cols-2 gap-4">
              <div><label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Produced Quantity</label><p className="text-sm font-bold text-slate-800 dark:text-slate-200 mt-1">{selectedOrder.producedQty.toLocaleString()} pcs</p></div>
              <div><label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Completion Date</label><p className="text-sm text-slate-600 dark:text-slate-400 mt-1">{selectedOrder.completionDate}</p></div>
            </div>

            {/* Handover Checklist */}
            <div>
              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-3">Handover Checklist</p>
              <div className="bg-slate-50 dark:bg-slate-800 rounded-xl overflow-hidden divide-y divide-slate-200 dark:divide-slate-700">
                <ChecklistItem label="Production Completed" passed={true} description={`Work order completed on ${selectedOrder.completionDate}`} />
                <ChecklistItem label="Sent to QA Inspection" passed={selectedOrder.qaStatus !== "Not Sent"} description={selectedOrder.qaStatus === "Not Sent" ? "Not yet sent to QA" : `QA Status: ${selectedOrder.qaStatus}`} />
                <ChecklistItem label="QA Inspection Passed" passed={selectedOrder.qaStatus === "Passed"} description={selectedOrder.qaStatus === "Failed" ? "QA inspection failed — rework may be required" : selectedOrder.qaStatus === "Passed" ? "Quality check passed" : "Awaiting QA result"} />
                <ChecklistItem label="Warehouse Intake Confirmed" passed={selectedOrder.warehouseStatus === "Received"} description={selectedOrder.warehouseStatus === "Received" ? "Items received in warehouse" : "Not yet received by warehouse"} />
              </div>
            </div>

            {/* Status Summary */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">QA Status</label>
                <div className="mt-1"><span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${getQABadge(selectedOrder.qaStatus)}`}>{selectedOrder.qaStatus}</span></div>
              </div>
              <div>
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Warehouse Status</label>
                <div className="mt-1"><span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${getWarehouseBadge(selectedOrder.warehouseStatus)}`}>{selectedOrder.warehouseStatus}</span></div>
              </div>
            </div>
          </div>
        )}
      </PageModal>

      {/* Send to QA Confirmation */}
      <ConfirmationModal
        isOpen={!!sendToQA}
        onClose={() => setSendToQA(null)}
        onConfirm={confirmSendToQA}
        title="Send to QA Inspection"
        message={`Send ${sendToQA?.woNumber} (${sendToQA?.producedQty} pcs) to QA inspection? The batch will be queued for quality review.`}
        confirmText="Send to QA"
      />

      {/* Warehouse Receipt Confirmation */}
      <ConfirmationModal
        isOpen={!!sendToWarehouse}
        onClose={() => setSendToWarehouse(null)}
        onConfirm={confirmSendToWarehouse}
        title="Confirm Warehouse Receipt"
        message={`Confirm that ${sendToWarehouse?.woNumber} (${sendToWarehouse?.producedQty} pcs) has been received by the warehouse?`}
        confirmText="Confirm Receipt"
      />
    </ProductionLayout>
  );
};

export default CompletionHandoverPage;
