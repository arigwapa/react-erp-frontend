// ==========================================
// FINProfilePage.tsx — Finance Manager Profile
// Branch-scoped profile page with:
//   Profile Info, Change Password,
//   Dark/Light Mode toggle, Logout action.
// Design: matches PLMProfilePage.tsx layout.
// ==========================================

import { useState } from "react";
import {
  User,
  Mail,
  Building2,
  Shield,
  Lock,
  Eye,
  EyeOff,
  Moon,
  Sun,
  LogOut,
  Save,
} from "lucide-react";

// ------------------------------------------
// Layout & Reusable UI
// ------------------------------------------
import FinanceLayout from "../../layout/FinanceLayout";
import { Card } from "../../components/ui/Card";
import PrimaryButton from "../../components/ui/PrimaryButton";
import SecondaryButton from "../../components/ui/SecondaryButton";
import InputGroup from "../../components/ui/InputGroup";
import ConfirmationModal from "../../components/ui/ConfirmationModal";
import Toast from "../../components/ui/Toast";

// ==========================================
// MAIN COMPONENT
// ==========================================

function FINProfilePage() {
  // ------------------------------------------
  // STATE: Profile
  // ------------------------------------------
  const [fullName, setFullName] = useState("Juan Dela Cruz");
  const [email, setEmail] = useState("juan.delacruz@weave-erp.com");

  // ------------------------------------------
  // STATE: Password
  // ------------------------------------------
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);

  // ------------------------------------------
  // STATE: Theme
  // ------------------------------------------
  const [isDark, setIsDark] = useState(false);

  // ------------------------------------------
  // STATE: Toast & Confirm
  // ------------------------------------------
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);
  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean; title: string; message: string; action: () => void; variant: "primary" | "danger"; confirmText: string;
  }>({ isOpen: false, title: "", message: "", action: () => {}, variant: "primary", confirmText: "Confirm" });

  // ------------------------------------------
  // HANDLERS
  // ------------------------------------------
  const handleSaveProfile = () => {
    if (!fullName.trim() || !email.trim()) {
      setToast({ message: "Please fill in all required fields.", type: "error" }); return;
    }
    setToast({ message: "Profile updated successfully.", type: "success" });
  };

  const handleChangePassword = () => {
    if (!currentPassword || !newPassword || !confirmPassword) {
      setToast({ message: "Please fill in all password fields.", type: "error" }); return;
    }
    if (newPassword !== confirmPassword) {
      setToast({ message: "New passwords do not match.", type: "error" }); return;
    }
    if (newPassword.length < 8) {
      setToast({ message: "Password must be at least 8 characters.", type: "error" }); return;
    }
    setCurrentPassword(""); setNewPassword(""); setConfirmPassword("");
    setToast({ message: "Password changed successfully.", type: "success" });
  };

  const handleToggleTheme = () => {
    setIsDark(!isDark);
    document.documentElement.classList.toggle("dark");
    setToast({ message: `Switched to ${!isDark ? "dark" : "light"} mode.`, type: "success" });
  };

  const handleLogout = () => {
    setConfirmModal({
      isOpen: true, title: "Logout?", message: "Are you sure you want to log out? You will need to sign in again.",
      variant: "danger", confirmText: "Logout",
      action: () => {
        setConfirmModal((prev) => ({ ...prev, isOpen: false }));
        setToast({ message: "Logged out successfully.", type: "success" });
      },
    });
  };

  // ==========================================
  // RENDER
  // ==========================================
  return (
    <>
      <FinanceLayout>
        <div className="max-w-3xl mx-auto space-y-6 pb-20">
          {/* Page Header */}
          <div>
            <h1 className="text-3xl font-bold text-slate-900 dark:text-white tracking-tight">Profile</h1>
            <p className="text-xs font-medium text-slate-500 dark:text-slate-400 mt-1">Manage your account information and preferences.</p>
          </div>

          {/* ---- PROFILE INFO ---- */}
          <Card className="p-6">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center text-white text-xl font-bold shadow-lg">
                JD
              </div>
              <div>
                <h2 className="text-lg font-bold text-slate-900 dark:text-white">{fullName}</h2>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Finance Manager · Manila Branch</p>
              </div>
            </div>

            <div className="space-y-4">
              <InputGroup id="profile-name" label="Full Name" icon={User} value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder="Your full name" />
              <InputGroup id="profile-email" label="Email Address" icon={Mail} value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Your email" />

              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center gap-2 px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl">
                  <Building2 size={14} className="text-slate-400" />
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Branch</span>
                    <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">Manila</span>
                  </div>
                </div>
                <div className="flex items-center gap-2 px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl">
                  <Shield size={14} className="text-slate-400" />
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Role</span>
                    <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">Finance Manager</span>
                  </div>
                </div>
              </div>

              <div className="flex justify-end pt-2">
                <PrimaryButton onClick={handleSaveProfile} icon={Save} className="!w-auto !py-2.5 !px-6 !text-xs !rounded-full">Save Profile</PrimaryButton>
              </div>
            </div>
          </Card>

          {/* ---- CHANGE PASSWORD ---- */}
          <Card className="p-6">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2"><Lock size={16} className="text-slate-400" /> Change Password</h3>
            <div className="space-y-4">
              <div className="relative">
                <InputGroup id="current-password" label="Current Password" type={showCurrent ? "text" : "password"} icon={Lock} value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} placeholder="Enter current password" />
                <button onClick={() => setShowCurrent(!showCurrent)} className="absolute right-3 top-8 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors" type="button">{showCurrent ? <EyeOff size={16} /> : <Eye size={16} />}</button>
              </div>
              <div className="relative">
                <InputGroup id="new-password" label="New Password" type={showNew ? "text" : "password"} icon={Lock} value={newPassword} onChange={(e) => setNewPassword(e.target.value)} placeholder="Enter new password (min 8 chars)" />
                <button onClick={() => setShowNew(!showNew)} className="absolute right-3 top-8 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors" type="button">{showNew ? <EyeOff size={16} /> : <Eye size={16} />}</button>
              </div>
              <InputGroup id="confirm-password" label="Confirm New Password" type="password" icon={Lock} value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} placeholder="Re-enter new password" />
              <div className="flex justify-end pt-2">
                <PrimaryButton onClick={handleChangePassword} className="!w-auto !py-2.5 !px-6 !text-xs !rounded-full">Change Password</PrimaryButton>
              </div>
            </div>
          </Card>

          {/* ---- DARK/LIGHT MODE ---- */}
          <Card className="p-6">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">{isDark ? <Moon size={16} className="text-slate-400" /> : <Sun size={16} className="text-amber-400" />} Appearance</h3>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-700 dark:text-slate-300">Dark Mode</p>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Switch between light and dark themes.</p>
              </div>
              <button
                onClick={handleToggleTheme}
                className={`relative w-12 h-6 rounded-full transition-colors ${isDark ? "bg-indigo-600" : "bg-slate-200"}`}
              >
                <div className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow-sm transition-transform ${isDark ? "translate-x-6" : "translate-x-0.5"}`} />
              </button>
            </div>
          </Card>

          {/* ---- LOGOUT ---- */}
          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2"><LogOut size={16} className="text-red-400" /> Sign Out</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Sign out of your Finance Manager session.</p>
              </div>
              <SecondaryButton onClick={handleLogout} icon={LogOut} className="!text-red-600 !border-red-200 hover:!bg-red-50 dark:!text-red-400 dark:!border-red-800 dark:hover:!bg-red-900/20">
                Logout
              </SecondaryButton>
            </div>
          </Card>
        </div>
      </FinanceLayout>

      {/* ---- CONFIRMATION & TOAST ---- */}
      <ConfirmationModal isOpen={confirmModal.isOpen} onClose={() => setConfirmModal((prev) => ({ ...prev, isOpen: false }))} onConfirm={confirmModal.action} title={confirmModal.title} message={confirmModal.message} variant={confirmModal.variant} confirmText={confirmModal.confirmText} />
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </>
  );
}

export default FINProfilePage;
