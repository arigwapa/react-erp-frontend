import React from "react";
import { createPortal } from "react-dom";
import { X, type LucideIcon } from "lucide-react";

interface DetailField {
  label: string;
  value: React.ReactNode; // Can be string, number, or JSX (badges)
  icon: LucideIcon;
}

interface DetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  itemId: string;
  /**
   * You can pass a raw Icon component or a styled div wrapper
   */
  headerIcon: React.ReactNode;
  gridFields: DetailField[];
  /**
   * Content to be placed inside the gray description box
   */
  children?: React.ReactNode;
}

const DetailsModal: React.FC<DetailsModalProps> = ({
  isOpen,
  onClose,
  title,
  itemId,
  headerIcon,
  gridFields,
  children,
}) => {
  if (!isOpen) return null;

  return createPortal(
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden animate-in slide-in-from-bottom-4 duration-300">
        {/* --- Header --- */}
        <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
          <div className="flex items-center gap-3">
            {headerIcon}
            <div>
              <h3 className="text-base font-bold text-slate-800">{title}</h3>
              <p className="text-[10px] font-medium text-slate-400 uppercase tracking-wide">
                ID: {itemId}
              </p>
            </div>
          </div>
          <button
            aria-label="Close Modal"
            onClick={onClose}
            className="p-1.5 rounded-full text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-all"
          >
            <X size={16} />
          </button>
        </div>

        {/* --- Body --- */}
        <div className="p-6 md:p-8 space-y-6">
          <div className="grid grid-cols-2 gap-4">
            {gridFields.map((field, index) => (
              <div key={index} className="space-y-1">
                <span className="flex items-center gap-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  <field.icon size={10} /> {field.label}
                </span>
                <div className="text-sm font-semibold text-slate-700">
                  {field.value}
                </div>
              </div>
            ))}
          </div>

          {children && <div className="h-px bg-slate-100 w-full" />}

          {children && (
            <div className="bg-slate-50 rounded-xl p-4 border border-slate-100">
              {children}
            </div>
          )}
        </div>

        {/* --- Footer --- */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2.5 bg-white border border-slate-200 text-slate-600 text-xs font-bold rounded-xl shadow-sm hover:bg-slate-50 hover:border-slate-300 transition-all"
          >
            Close
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
};

export default DetailsModal;
