// ==========================================
// ThemeSelector.tsx — Light / Dark Mode Toggle
// A reusable two-option theme selector with
// visual card buttons and active indicator.
// ==========================================

import React from "react";
import { Sun, Moon, Check } from "lucide-react";

// ------------------------------------------
// Types
// ------------------------------------------
export type ThemeOption = "light" | "dark";

interface ThemeSelectorProps {
  /** Currently selected theme */
  value: ThemeOption;
  /** Callback when user selects a theme */
  onChange: (theme: ThemeOption) => void;
}

// ------------------------------------------
// Theme config
// ------------------------------------------
const THEMES: {
  id: ThemeOption;
  label: string;
  description: string;
  icon: React.FC<{ size?: number; className?: string }>;
  preview: { bg: string; bar1: string; bar2: string; bar3: string; dot: string };
}[] = [
  {
    id: "light",
    label: "Light",
    description: "Clean and bright interface",
    icon: Sun,
    preview: {
      bg: "bg-white",
      bar1: "bg-slate-200",
      bar2: "bg-slate-100",
      bar3: "bg-slate-200",
      dot: "bg-slate-300",
    },
  },
  {
    id: "dark",
    label: "Dark",
    description: "Easy on the eyes at night",
    icon: Moon,
    preview: {
      bg: "bg-slate-900",
      bar1: "bg-slate-700",
      bar2: "bg-slate-800",
      bar3: "bg-slate-700",
      dot: "bg-slate-600",
    },
  },
];

// ------------------------------------------
// Component
// ------------------------------------------
const ThemeSelector: React.FC<ThemeSelectorProps> = ({ value, onChange }) => {
  return (
    <div className="grid grid-cols-2 gap-3">
      {THEMES.map((t) => {
        const isActive = value === t.id;
        const Icon = t.icon;

        return (
          <button
            key={t.id}
            type="button"
            onClick={() => onChange(t.id)}
            aria-label={`Select ${t.label} mode`}
            aria-pressed={isActive}
            className={`
              group relative flex flex-col rounded-2xl border-2 p-4 text-left
              transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-indigo-200 focus:ring-offset-2
              ${
                isActive
                  ? "border-indigo-500 bg-indigo-50/40 dark:bg-indigo-950/40 shadow-sm"
                  : "border-slate-100 dark:border-slate-700 bg-white dark:bg-slate-800 hover:border-slate-200 dark:hover:border-slate-600 hover:shadow-sm"
              }
            `}
          >
            {/* Mini Preview */}
            <div
              className={`w-full h-16 rounded-xl mb-3 p-2.5 flex flex-col gap-1.5 ${t.preview.bg} border border-slate-200/60 dark:border-slate-600/60`}
            >
              <div className="flex items-center gap-1.5">
                <div className={`w-2 h-2 rounded-full ${t.preview.dot}`} />
                <div className={`h-1.5 w-10 rounded-full ${t.preview.bar1}`} />
              </div>
              <div className={`h-1.5 w-full rounded-full ${t.preview.bar2}`} />
              <div className={`h-1.5 w-3/4 rounded-full ${t.preview.bar3}`} />
            </div>

            {/* Label row */}
            <div className="flex items-center gap-2 mb-0.5">
              <Icon
                size={14}
                className={isActive ? "text-indigo-600" : "text-slate-400"}
              />
              <span
                className={`text-xs font-bold ${
                  isActive ? "text-indigo-700 dark:text-indigo-400" : "text-slate-700 dark:text-slate-300"
                }`}
              >
                {t.label}
              </span>
            </div>

            {/* Description */}
            <p className="text-[10px] text-slate-400 dark:text-slate-500 leading-relaxed">
              {t.description}
            </p>

            {/* Active check */}
            {isActive && (
              <div className="absolute top-3 right-3 w-5 h-5 rounded-full bg-indigo-500 flex items-center justify-center">
                <Check size={11} className="text-white" strokeWidth={3} />
              </div>
            )}
          </button>
        );
      })}
    </div>
  );
};

export default ThemeSelector;
