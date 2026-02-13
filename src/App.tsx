import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/Login";
import ForgotPasswordPage from "./pages/ForgotPassword";

// ==========================================
// Super Admin Pages
// ==========================================
import SuperAdminDashboard from "./pages/Dashboard/SuperAdminDashboard";
import NotificationsPage from "./pages/SuperAdmin/NotificationsPage";
import UserManagementPage from "./pages/SuperAdmin/UserManagementPage";
import RolesPermissionsPage from "./pages/SuperAdmin/RolesPermissionsPage";
import BranchManagementPage from "./pages/SuperAdmin/BranchManagementPage";
import AuditLogsPage from "./pages/SuperAdmin/AuditLogsPage";
import SystemSettingsPage from "./pages/SuperAdmin/SystemSettingsPage";
import PLMPage from "./pages/SuperAdmin/PLMPage";
import QualityPage from "./pages/SuperAdmin/QualityPage";
import ProductionPage from "./pages/SuperAdmin/ProductionPage";
import WarehousePage from "./pages/SuperAdmin/WarehousePage";
import FinancePage from "./pages/SuperAdmin/FinancePage";
import ReportsCenterPage from "./pages/SuperAdmin/ReportsCenterPage";
import ExportCenterPage from "./pages/SuperAdmin/ExportCenterPage";
import ArchivesPage from "./pages/SuperAdmin/ArchivesPage";
import ProfilePage from "./pages/SuperAdmin/ProfilePage";

// ==========================================
// PLM Manager Pages
// ==========================================
import PLMDashboard from "./pages/Dashboard/PLMDashboard";
import PLMNotificationsPage from "./pages/PLM/PLMNotificationsPage";
import PLMProductsPage from "./pages/PLM/PLMProductsPage";
import PLMTechPackPage from "./pages/PLM/PLMTechPackPage";
import PLMBomPage from "./pages/PLM/PLMBomPage";
import PLMMaterialsPage from "./pages/PLM/PLMMaterialsPage";
import PLMReleasePage from "./pages/PLM/PLMReleasePage";
import PLMReportsPage from "./pages/PLM/PLMReportsPage";
import PLMExportCenterPage from "./pages/PLM/PLMExportCenterPage";
import PLMArchivesPage from "./pages/PLM/PLMArchivesPage";
import PLMProfilePage from "./pages/PLM/PLMProfilePage";

// ==========================================
// Production Manager Pages
// ==========================================
import ProductionDashboard from "./pages/Dashboard/ProductionDashboard";
import ProductionNotificationsPage from "./pages/ProductionManager/ProductionNotificationsPage";
import ProductionPlansPage from "./pages/ProductionManager/ProductionPlansPage";
import WorkOrdersPage from "./pages/ProductionManager/WorkOrdersPage";
import ProgressMonitoringPage from "./pages/ProductionManager/ProgressMonitoringPage";
import CompletionHandoverPage from "./pages/ProductionManager/CompletionHandoverPage";
import ProductionReportsPage from "./pages/ProductionManager/ProductionReportsPage";
import ProductionExportCenterPage from "./pages/ProductionManager/ExportCenterPage";
import ProductionArchivesPage from "./pages/ProductionManager/ProductionArchivesPage";
import ProductionProfilePage from "./pages/ProductionManager/ProductionProfilePage";

// ==========================================
// Quality Manager Pages
// ==========================================
import QADashboard from "./pages/Dashboard/QADashboard";
import QANotificationsPage from "./pages/QualityManager/QANotificationsPage";
import QAInspectionQueuePage from "./pages/QualityManager/QAInspectionQueuePage";
import QAInspectionRecordsPage from "./pages/QualityManager/QAInspectionRecordsPage";
import QADefectManagementPage from "./pages/QualityManager/QADefectManagementPage";
import QAApprovalsPage from "./pages/QualityManager/QAApprovalsPage";
import QACAPAPage from "./pages/QualityManager/QACAPAPage";
import QAChecklistsPage from "./pages/QualityManager/QAChecklistsPage";
import QAReportsPage from "./pages/QualityManager/QAReportsPage";
import QAExportCenterPage from "./pages/QualityManager/QAExportCenterPage";
import QAArchivesPage from "./pages/QualityManager/QAArchivesPage";
import QAProfilePage from "./pages/QualityManager/QAProfilePage";

// ==========================================
// Warehouse Manager Pages
// ==========================================
import WHDashboard from "./pages/Dashboard/WHDashboard";
import WHNotificationsPage from "./pages/WarehouseManager/WHNotificationsPage";
import WHInventoryListPage from "./pages/WarehouseManager/WHInventoryListPage";
import WHStockMovementsPage from "./pages/WarehouseManager/WHStockMovementsPage";
import WHStockAdjustmentsPage from "./pages/WarehouseManager/WHStockAdjustmentsPage";
import WHProductionIntakePage from "./pages/WarehouseManager/WHProductionIntakePage";
import WHReportsPage from "./pages/WarehouseManager/WHReportsPage";
import WHExportCenterPage from "./pages/WarehouseManager/WHExportCenterPage";
import WHArchivesPage from "./pages/WarehouseManager/WHArchivesPage";
import WHProfilePage from "./pages/WarehouseManager/WHProfilePage";

// ==========================================
// Branch Admin Pages
// ==========================================
import AdminDashboard from "./pages/Dashboard/AdminDashboard";
import AdminNotificationsPage from "./pages/Admin/AdminNotificationsPage";
import AdminUserManagementPage from "./pages/Admin/AdminUserManagementPage";
import AdminRolesPermissionsPage from "./pages/Admin/AdminRolesPermissionsPage";
import AdminAuditLogsPage from "./pages/Admin/AdminAuditLogsPage";
import AdminPLMPage from "./pages/Admin/AdminPLMPage";
import AdminProductionPage from "./pages/Admin/AdminProductionPage";
import AdminQualityPage from "./pages/Admin/AdminQualityPage";
import AdminWarehousePage from "./pages/Admin/AdminWarehousePage";
import AdminFinancePage from "./pages/Admin/AdminFinancePage";
import AdminReportsCenterPage from "./pages/Admin/AdminReportsCenterPage";
import AdminExportCenterPage from "./pages/Admin/AdminExportCenterPage";
import AdminArchivesPage from "./pages/Admin/AdminArchivesPage";
import AdminProfilePage from "./pages/Admin/AdminProfilePage";

// ==========================================
// Finance Manager Pages
// ==========================================
import FINDashboard from "./pages/Dashboard/FINDashboard";
import FINNotificationsPage from "./pages/FinanceManager/FINNotificationsPage";
import FINBudgetsPage from "./pages/FinanceManager/FINBudgetsPage";
import FINBudgetApprovalsPage from "./pages/FinanceManager/FINBudgetApprovalsPage";
import FINSpendingLimitsPage from "./pages/FinanceManager/FINSpendingLimitsPage";
import FINAutoCOGSPage from "./pages/FinanceManager/FINAutoCOGSPage";
import FINCOGSReviewPage from "./pages/FinanceManager/FINCOGSReviewPage";
import FINProfitabilityPage from "./pages/FinanceManager/FINProfitabilityPage";
import FINCostValidationPage from "./pages/FinanceManager/FINCostValidationPage";
import FINVariancePage from "./pages/FinanceManager/FINVariancePage";
import FINPeriodLockingPage from "./pages/FinanceManager/FINPeriodLockingPage";
import FINReportsPage from "./pages/FinanceManager/FINReportsPage";
import FINExportCenterPage from "./pages/FinanceManager/FINExportCenterPage";
import FINArchivesPage from "./pages/FinanceManager/FINArchivesPage";
import FINProfilePage from "./pages/FinanceManager/FINProfilePage";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* ==========================================
            AUTH ROUTES
            ========================================== */}

        {/* 1. Login */}
        <Route path="/" element={<Login />} />

        {/* 2. Forgot Password */}
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />

        {/* ==========================================
            SUPER ADMIN ROUTES (/admin/*)
            ========================================== */}

        {/* 3. Super Admin Dashboard */}
        <Route path="/admin/dashboard" element={<SuperAdminDashboard />} />

        {/* 4. Notification */}
        <Route path="/admin/notification" element={<NotificationsPage />} />

        {/* 5. User Management */}
        <Route path="/admin/user-management" element={<UserManagementPage />} />

        {/* 6. Roles & Permissions */}
        <Route
          path="/admin/roles-permissions"
          element={<RolesPermissionsPage />}
        />

        {/* 7. Branch Management */}
        <Route
          path="/admin/branch-management"
          element={<BranchManagementPage />}
        />

        {/* 8. Audit Logs */}
        <Route path="/admin/audit-logs" element={<AuditLogsPage />} />

        {/* 9. System Settings */}
        <Route path="/admin/system-settings" element={<SystemSettingsPage />} />

        {/* 10. Product Lifecycle Management */}
        <Route path="/admin/plm" element={<PLMPage />} />

        {/* 11. Production */}
        <Route path="/admin/production" element={<ProductionPage />} />

        {/* 12. Quality */}
        <Route path="/admin/quality" element={<QualityPage />} />

        {/* 13. Warehouse */}
        <Route path="/admin/warehouse" element={<WarehousePage />} />

        {/* 14. Finance */}
        <Route path="/admin/finance" element={<FinancePage />} />

        {/* 15. Reports Center */}
        <Route path="/admin/reports-center" element={<ReportsCenterPage />} />

        {/* 16. Export Center */}
        <Route path="/admin/export-center" element={<ExportCenterPage />} />

        {/* 16b. Archives */}
        <Route path="/admin/archives" element={<ArchivesPage />} />

        {/* 17. Super Admin Profile */}
        <Route path="/profile" element={<ProfilePage />} />

        {/* ==========================================
            PLM MANAGER ROUTES (/plm-manager/*)
            ========================================== */}

        {/* 31. PLM Manager Dashboard */}
        <Route path="/plm-manager/dashboard" element={<PLMDashboard />} />

        {/* 32. PLM Notifications / Tasks */}
        <Route
          path="/plm-manager/notifications"
          element={<PLMNotificationsPage />}
        />

        {/* 33. Products (Styles & SKU) */}
        <Route path="/plm-manager/products" element={<PLMProductsPage />} />

        {/* 34. Tech Pack & Versions */}
        <Route path="/plm-manager/tech-pack" element={<PLMTechPackPage />} />

        {/* 35. BOM (Bill of Materials) */}
        <Route path="/plm-manager/bom" element={<PLMBomPage />} />

        {/* 36. Materials Library */}
        <Route path="/plm-manager/materials" element={<PLMMaterialsPage />} />

        {/* 37. Release to Production */}
        <Route path="/plm-manager/release" element={<PLMReleasePage />} />

        {/* 38. PLM Reports */}
        <Route path="/plm-manager/reports" element={<PLMReportsPage />} />

        {/* 38b. PLM Export Center */}
        <Route path="/plm-manager/export" element={<PLMExportCenterPage />} />

        {/* 38c. PLM Archives */}
        <Route path="/plm-manager/archives" element={<PLMArchivesPage />} />

        {/* 39. PLM Manager Profile */}
        <Route path="/plm-manager/profile" element={<PLMProfilePage />} />

        {/* ==========================================
            PRODUCTION MANAGER ROUTES (/production-manager/*)
            ========================================== */}

        {/* 40. Production Manager Dashboard */}
        <Route
          path="/production-manager/dashboard"
          element={<ProductionDashboard />}
        />

        {/* 41. Production Notifications / Tasks */}
        <Route
          path="/production-manager/notifications"
          element={<ProductionNotificationsPage />}
        />

        {/* 42. Production Plans */}
        <Route
          path="/production-manager/plans"
          element={<ProductionPlansPage />}
        />

        {/* 43. Work Orders */}
        <Route
          path="/production-manager/work-orders"
          element={<WorkOrdersPage />}
        />

        {/* 44. Progress Monitoring */}
        <Route
          path="/production-manager/progress"
          element={<ProgressMonitoringPage />}
        />

        {/* 45. Completion & Handover */}
        <Route
          path="/production-manager/completion"
          element={<CompletionHandoverPage />}
        />

        {/* 46. Production Reports */}
        <Route
          path="/production-manager/reports"
          element={<ProductionReportsPage />}
        />

        {/* 47. Export Center */}
        <Route
          path="/production-manager/export"
          element={<ProductionExportCenterPage />}
        />

        {/* 47b. Production Archives */}
        <Route path="/production-manager/archives" element={<ProductionArchivesPage />} />

        {/* 48. Production Manager Profile */}
        <Route
          path="/production-manager/profile"
          element={<ProductionProfilePage />}
        />

        {/* ==========================================
            QUALITY MANAGER ROUTES (/qa-manager/*)
            ========================================== */}

        {/* 49. Quality Manager Dashboard */}
        <Route path="/qa-manager/dashboard" element={<QADashboard />} />

        {/* 50. QA Notifications / Tasks */}
        <Route
          path="/qa-manager/notifications"
          element={<QANotificationsPage />}
        />

        {/* 51. Inspection Queue */}
        <Route
          path="/qa-manager/inspection-queue"
          element={<QAInspectionQueuePage />}
        />

        {/* 52. Inspection Records */}
        <Route
          path="/qa-manager/inspection-records"
          element={<QAInspectionRecordsPage />}
        />

        {/* 53. Defect Management */}
        <Route
          path="/qa-manager/defects"
          element={<QADefectManagementPage />}
        />

        {/* 54. Approvals / Rejections */}
        <Route path="/qa-manager/approvals" element={<QAApprovalsPage />} />

        {/* 55. CAPA */}
        <Route path="/qa-manager/capa" element={<QACAPAPage />} />

        {/* 56. Quality Standards & Checklists */}
        <Route path="/qa-manager/checklists" element={<QAChecklistsPage />} />

        {/* 57. Quality Reports */}
        <Route path="/qa-manager/reports" element={<QAReportsPage />} />

        {/* 58. Export Center */}
        <Route path="/qa-manager/export" element={<QAExportCenterPage />} />

        {/* 58b. QA Archives */}
        <Route path="/qa-manager/archives" element={<QAArchivesPage />} />

        {/* 59. QA Manager Profile */}
        <Route path="/qa-manager/profile" element={<QAProfilePage />} />

        {/* ==========================================
            WAREHOUSE MANAGER ROUTES (/warehouse-manager/*)
            ========================================== */}

        {/* 60. Warehouse Manager Dashboard */}
        <Route path="/warehouse-manager/dashboard" element={<WHDashboard />} />

        {/* 61. Warehouse Notifications / Tasks */}
        <Route
          path="/warehouse-manager/notifications"
          element={<WHNotificationsPage />}
        />

        {/* 62. Inventory List */}
        <Route
          path="/warehouse-manager/inventory"
          element={<WHInventoryListPage />}
        />

        {/* 63. Stock Movements */}
        <Route
          path="/warehouse-manager/movements"
          element={<WHStockMovementsPage />}
        />

        {/* 64. Stock Adjustments */}
        <Route
          path="/warehouse-manager/adjustments"
          element={<WHStockAdjustmentsPage />}
        />

        {/* 65. Production Intake */}
        <Route
          path="/warehouse-manager/intake"
          element={<WHProductionIntakePage />}
        />

        {/* 66. Inventory Reports */}
        <Route path="/warehouse-manager/reports" element={<WHReportsPage />} />

        {/* 67. Export Center */}
        <Route
          path="/warehouse-manager/export"
          element={<WHExportCenterPage />}
        />

        {/* 67b. Warehouse Archives */}
        <Route path="/warehouse-manager/archives" element={<WHArchivesPage />} />

        {/* 68. Warehouse Manager Profile */}
        <Route path="/warehouse-manager/profile" element={<WHProfilePage />} />

        {/* ==========================================
            FINANCE MANAGER ROUTES (/finance-manager/*)
            ========================================== */}

        {/* 69. Finance Manager Dashboard */}
        <Route path="/finance-manager/dashboard" element={<FINDashboard />} />

        {/* 70. Finance Notifications / Tasks */}
        <Route
          path="/finance-manager/notifications"
          element={<FINNotificationsPage />}
        />

        {/* 71. Budgets (by Collection/Product Line) */}
        <Route path="/finance-manager/budgets" element={<FINBudgetsPage />} />

        {/* 72. Budget Approvals */}
        <Route
          path="/finance-manager/budget-approvals"
          element={<FINBudgetApprovalsPage />}
        />

        {/* 73. Spending Limits & Thresholds */}
        <Route
          path="/finance-manager/spending-limits"
          element={<FINSpendingLimitsPage />}
        />

        {/* 74. Auto-COGS (Cost Records) */}
        <Route
          path="/finance-manager/cost-records"
          element={<FINAutoCOGSPage />}
        />

        {/* 75. COGS Review by Work Order */}
        <Route
          path="/finance-manager/cogs-review"
          element={<FINCOGSReviewPage />}
        />

        {/* 76. Profitability Analysis */}
        <Route
          path="/finance-manager/profitability"
          element={<FINProfitabilityPage />}
        />

        {/* 77. Cost Entry Validation */}
        <Route
          path="/finance-manager/cost-validation"
          element={<FINCostValidationPage />}
        />

        {/* 78. Variance & Exceptions */}
        <Route path="/finance-manager/variance" element={<FINVariancePage />} />

        {/* 79. Period Locking */}
        <Route
          path="/finance-manager/period-locking"
          element={<FINPeriodLockingPage />}
        />

        {/* 80. Finance Reports */}
        <Route path="/finance-manager/reports" element={<FINReportsPage />} />

        {/* 81. Export Center (branch only) */}
        <Route
          path="/finance-manager/export"
          element={<FINExportCenterPage />}
        />

        {/* 81b. Finance Archives */}
        <Route path="/finance-manager/archives" element={<FINArchivesPage />} />

        {/* 82. Finance Manager Profile */}
        <Route path="/finance-manager/profile" element={<FINProfilePage />} />

        {/* ==========================================
            BRANCH ADMIN ROUTES (/branch-admin/*)
            ========================================== */}

        {/* 18. Branch Admin Dashboard */}
        <Route path="/branch-admin/dashboard" element={<AdminDashboard />} />

        {/* 19. Notifications / Tasks */}
        <Route
          path="/branch-admin/notification"
          element={<AdminNotificationsPage />}
        />

        {/* 20. User Management (branch only) */}
        <Route
          path="/branch-admin/user-management"
          element={<AdminUserManagementPage />}
        />

        {/* 21. Roles & Permissions (limited / view only) */}
        <Route
          path="/branch-admin/roles-permissions"
          element={<AdminRolesPermissionsPage />}
        />

        {/* 22. Audit Logs (branch scope) */}
        <Route
          path="/branch-admin/audit-logs"
          element={<AdminAuditLogsPage />}
        />

        {/* 23. PLM (branch scope) */}
        <Route path="/branch-admin/plm" element={<AdminPLMPage />} />

        {/* 24. Production (branch scope) */}
        <Route
          path="/branch-admin/production"
          element={<AdminProductionPage />}
        />

        {/* 25. Quality / QA (branch scope) */}
        <Route path="/branch-admin/quality" element={<AdminQualityPage />} />

        {/* 26. Warehouse (branch scope) */}
        <Route
          path="/branch-admin/warehouse"
          element={<AdminWarehousePage />}
        />

        {/* 27. Finance (branch scope) */}
        <Route path="/branch-admin/finance" element={<AdminFinancePage />} />

        {/* 28. Reports Center (branch filtered) */}
        <Route
          path="/branch-admin/reports-center"
          element={<AdminReportsCenterPage />}
        />

        {/* 29. Export Center (branch data only) */}
        <Route
          path="/branch-admin/export-center"
          element={<AdminExportCenterPage />}
        />

        {/* 29b. Branch Admin Archives */}
        <Route path="/branch-admin/archives" element={<AdminArchivesPage />} />

        {/* 30. Branch Admin Profile */}
        <Route path="/branch-admin/profile" element={<AdminProfilePage />} />

        {/* Redirect everything else to Login */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
