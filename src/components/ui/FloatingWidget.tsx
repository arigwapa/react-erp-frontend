import React from "react";
import { type LucideIcon } from "lucide-react";

/**
 * Component: FloatingWidget
 * Purpose: Decorative elements on the left side (Production Live, Quality Control).
 * Animation: Uses 'animate-float' defined in GlobalStyles at the bottom.
 */
interface FloatingWidgetProps {
  icon: LucideIcon;
  title: string;
  subtitle: string;
  className?: string; // Used for positioning (top, left, right)
}
const FloatingWidget: React.FC<FloatingWidgetProps> = ({
  icon: Icon,
  title,
  subtitle,
  className = "",
}) => (
  <div
    className={`absolute p-4 bg-white/80 backdrop-blur-xl border border-white/60 shadow-xl rounded-2xl flex items-center gap-3 animate-float ${className}`}
  >
    <div className="w-10 h-10 rounded-full bg-indigo-50 flex items-center justify-center text-indigo-600">
      <Icon size={20} />
    </div>
    <div>
      <p className="text-xs font-bold text-slate-800">{title}</p>
      <p className="text-[10px] font-medium text-slate-500">{subtitle}</p>
    </div>
  </div>
);

export default FloatingWidget;
