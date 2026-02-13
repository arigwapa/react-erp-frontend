// ==========================================
// SessionCard.tsx — Active Session Item
// Displays a single device session with device
// icon, location, IP, last active time, and
// an optional revoke action. Used in the
// Profile / Account Settings page.
// ==========================================

import React from "react";
import { Monitor, Smartphone, LogOut } from "lucide-react";

// ------------------------------------------
// Types
// ------------------------------------------
export interface SessionData {
  id: string;
  device: string;
  location: string;
  ip: string;
  lastActive: string;
  current: boolean;
}

interface SessionCardProps {
  session: SessionData;
  /** Called when the user clicks the revoke/logout button */
  onRevoke?: (id: string) => void;
}

// ------------------------------------------
// Component
// ------------------------------------------
const SessionCard: React.FC<SessionCardProps> = ({ session, onRevoke }) => {
  const isMobile =
    session.device.toLowerCase().includes("mobile") ||
    session.device.toLowerCase().includes("iphone") ||
    session.device.toLowerCase().includes("android");

  const DeviceIcon = isMobile ? Smartphone : Monitor;

  return (
    <div className="flex items-center justify-between gap-3 p-3 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors group">
      {/* Left: Icon + Details */}
      <div className="flex items-center gap-3 min-w-0">
        <div
          className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${
            session.current
              ? "bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400"
              : "bg-slate-100 dark:bg-slate-800 text-slate-400"
          }`}
        >
          <DeviceIcon size={16} />
        </div>

        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <p className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate">
              {session.device}
            </p>
            {session.current && (
              <span className="inline-flex items-center text-[9px] font-bold uppercase tracking-wider bg-emerald-100 text-emerald-700 px-1.5 py-0.5 rounded-full flex-shrink-0">
                This device
              </span>
            )}
          </div>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
            {session.location} &bull; {session.ip}
          </p>
          <p className="text-[10px] text-slate-400 mt-0.5">
            Active: {session.lastActive}
          </p>
        </div>
      </div>

      {/* Right: Revoke button (hidden for current session) */}
      {!session.current && onRevoke && (
        <button
          onClick={() => onRevoke(session.id)}
          className="p-2 rounded-xl text-slate-300 hover:bg-rose-50 hover:text-rose-500 transition-colors opacity-0 group-hover:opacity-100 flex-shrink-0"
          aria-label={`Revoke session on ${session.device}`}
        >
          <LogOut size={14} />
        </button>
      )}
    </div>
  );
};

export default SessionCard;
