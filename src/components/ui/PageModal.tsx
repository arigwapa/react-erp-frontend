// ==========================================
// PageModal.tsx — Reusable Full-Page Modal
// Centered modal with blurred backdrop that
// covers the entire viewport (including sidebar).
// Used for detail views, governance panels, and
// review modals across all module pages.
// ==========================================

import React from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";
// ------------------------------------------
// Props Interface
// ------------------------------------------
interface PageModalProps {
  /** Controls visibility of the modal */
  isOpen: boolean;
  /** Callback to close the modal */
  onClose: () => void;
  /** Modal header title */
  title: string;
  /** Optional subtitle text or JSX below the title */
  subtitle?: React.ReactNode;
  /** Optional badges/pills rendered inline with the title */
  badges?: React.ReactNode;
  /** Scrollable body content */
  children: React.ReactNode;
  /** Custom footer content — defaults to a "Close" PrimaryButton */
  footer?: React.ReactNode;
  /** Tailwind max-width class — defaults to "max-w-2xl" */
  maxWidth?: string;
  /** Unique aria-labelledby ID — defaults to "page-modal-title" */
  ariaId?: string;
}

// ------------------------------------------
// Component
// ------------------------------------------
const PageModal: React.FC<PageModalProps> = ({
  isOpen,
  onClose,
  title,
  subtitle,
  badges,
  children,
  footer,
  maxWidth = "max-w-2xl",
  ariaId = "page-modal-title",
}) => {
  if (!isOpen) return null;

  return createPortal(
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby={ariaId}
    >
      {/* Backdrop — full-viewport blur overlay */}
      <div
        className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Modal Card */}
      <div
        className={`relative w-full ${maxWidth} bg-white dark:bg-slate-900 rounded-2xl shadow-2xl flex flex-col max-h-[90vh] overflow-hidden animate-in slide-in-from-bottom-4 duration-300`}
      >
        {/* ---- Header ---- */}
        <div className="px-6 py-5 border-b border-slate-100 dark:border-slate-700 flex justify-between items-start bg-slate-50/50 dark:bg-slate-800/50 flex-shrink-0">
          <div className="min-w-0">
            <div className="flex items-center gap-3 mb-1 flex-wrap">
              <h2
                id={ariaId}
                className="text-lg font-bold text-slate-900 dark:text-white"
              >
                {title}
              </h2>
              {badges}
            </div>
            {subtitle && (
              <p className="text-[11px] text-slate-500 dark:text-slate-400">{subtitle}</p>
            )}
          </div>
          <button
            aria-label="Close Modal"
            onClick={onClose}
            className="p-1.5 rounded-full text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 hover:text-slate-600 dark:hover:text-slate-200 transition-all flex-shrink-0"
          >
            <X size={16} />
          </button>
        </div>

        {/* ---- Scrollable Body ---- */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {children}
        </div>

        {/* ---- Footer ---- */}
        <div className="px-6 py-4 border-t border-slate-100 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/50 flex justify-end flex-shrink-0">
          {footer !== undefined ? (
            footer
          ) : (
            <button
              onClick={onClose}
              className="px-5 py-2.5 bg-white border border-slate-200 text-slate-600 text-xs font-bold rounded-xl shadow-sm hover:bg-slate-50 hover:border-slate-300 transition-all"
            >
              Close
            </button>
          )}
        </div>
      </div>
    </div>,
    document.body
  );
};

export default PageModal;
