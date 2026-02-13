import React from "react";
import type { LucideIcon } from "lucide-react";

interface StatsCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  trend?: string;
  trendUp?: boolean; // Used to determine trend color (green vs red)
  color?: string; // Expects a background class like "bg-indigo-500"
  count?: any;
}

const StatsCard: React.FC<StatsCardProps> = ({
  title,
  value,
  icon: Icon,
  trend,
  trendUp = true,
  color = "bg-indigo-500",
}) => {
  // Dynamically calculate text color based on the background color prop
  // e.g., "bg-indigo-500" becomes "text-indigo-500"
  const iconColorClass = color.replace("bg-", "text-");

  return (
    <div className="bg-white p-5 rounded-3xl shadow-[0_2px_10px_-4px_rgba(6,81,237,0.1)] border border-slate-100 flex items-center justify-between transition-transform hover:-translate-y-1 duration-300">
      <div>
        <p className="text-slate-500 text-xs font-semibold uppercase tracking-wider">
          {title}
        </p>
        <h3 className="text-2xl font-bold text-slate-800 mt-2">{value}</h3>
        {trend && (
          <p
            className={`text-[10px] mt-1 font-bold ${
              trendUp ? "text-emerald-500" : "text-rose-500"
            }`}
          >
            {trend}
          </p>
        )}
      </div>
      <div
        className={`p-3 rounded-2xl ${color} bg-opacity-10`}
        aria-hidden="true"
      >
        <Icon size={24} className={iconColorClass} />
      </div>
    </div>
  );
};

export default StatsCard;
