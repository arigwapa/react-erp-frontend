// ==========================================
// ActionMenu.tsx
// A three-dot dropdown menu for row-level actions.
// Supports Edit, Toggle (activate/deactivate), and
// Archive actions with click-outside-to-close.
// Used in: Role list items in RolesPermissionsPage.
// ==========================================

import React, { useState, useEffect, useRef } from "react";
import { MoreVertical, Pencil, Power, Trash2 } from "lucide-react";

// ------------------------------------------
// Types
// ------------------------------------------
export interface ActionMenuProps {
  /** Whether the item is currently active (controls toggle label) */
  isActive: boolean;
  /** Callback for the "Edit" action */
  onEdit: (e: React.MouseEvent) => void;
  /** Callback for the "Activate/Deactivate" toggle action */
  onToggle: (e: React.MouseEvent) => void;
  /** Callback for the "Archive" (delete) action */
  onArchive: (e: React.MouseEvent) => void;
}

// ------------------------------------------
// Component
// ------------------------------------------
const ActionMenu: React.FC<ActionMenuProps> = ({
  isActive,
  onEdit,
  onToggle,
  onArchive,
}) => {
  // Controls dropdown visibility
  const [isOpen, setIsOpen] = useState(false);
  // Ref for click-outside detection
  const menuRef = useRef<HTMLDivElement>(null);

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={menuRef}>
      {/* Trigger Button — three-dot icon */}
      <button
        aria-label="More options"
        aria-expanded={isOpen}
        aria-haspopup="true"
        onClick={(e) => {
          e.stopPropagation();
          setIsOpen(!isOpen);
        }}
        className={`p-1.5 rounded-lg transition-colors ${
          isOpen
            ? "bg-slate-100 text-slate-900"
            : "text-slate-400 hover:text-slate-700 hover:bg-slate-100"
        }`}
      >
        <MoreVertical size={14} />
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute right-0 top-full mt-1 w-36 bg-white border border-slate-100 rounded-xl shadow-lg z-20 overflow-hidden">
          <div className="p-1 flex flex-col gap-0.5">
            {/* Edit Action */}
            <button
              onClick={(e) => {
                onEdit(e);
                setIsOpen(false);
              }}
              className="flex items-center gap-2 w-full px-3 py-2 text-[11px] font-medium text-slate-600 hover:bg-slate-50 hover:text-indigo-600 rounded-lg transition-colors text-left"
            >
              <Pencil size={12} /> Edit Role
            </button>

            {/* Toggle Active/Inactive Action */}
            <button
              onClick={(e) => {
                onToggle(e);
                setIsOpen(false);
              }}
              className="flex items-center gap-2 w-full px-3 py-2 text-[11px] font-medium text-slate-600 hover:bg-slate-50 hover:text-emerald-600 rounded-lg transition-colors text-left"
            >
              <Power size={12} /> {isActive ? "Deactivate" : "Activate"}
            </button>

            {/* Divider */}
            <div className="h-px bg-slate-100 my-0.5" />

            {/* Archive (Destructive) Action */}
            <button
              onClick={(e) => {
                onArchive(e);
                setIsOpen(false);
              }}
              className="flex items-center gap-2 w-full px-3 py-2 text-[11px] font-medium text-slate-600 hover:bg-red-50 hover:text-red-600 rounded-lg transition-colors text-left"
            >
              <Trash2 size={12} /> Archive
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ActionMenu;
