// ==========================================
// DefectTrendChart.tsx — Modern SVG Line Chart
// Smooth curved line with gradient area fill,
// dot markers, hover tooltips, Y-axis labels,
// period selector, and animated draw-in effect.
// Used in QA & Finance dashboards.
// ==========================================

import React, { useState, useEffect, useRef, useMemo } from "react";
import { BarChart3, ChevronDown, Check } from "lucide-react";

// ------------------------------------------
// Types
// ------------------------------------------
export interface TrendDataPoint {
  label: string;
  value: number;
}

interface DefectTrendChartProps {
  /** Chart title */
  title: string;
  /** Data points to plot */
  data: TrendDataPoint[];
  /** Chart height in px — defaults to 180 */
  maxBarHeight?: number;
  /** Gradient from color (line & fill) */
  gradientFrom?: string;
  /** Gradient to color (line & fill) */
  gradientTo?: string;
  /** Icon for header */
  icon?: React.ElementType;
  /** Icon bg class */
  iconBg?: string;
  /** Icon color class */
  iconColor?: string;
  /** Optional empty state message */
  emptyMessage?: string;
  /** Unused — kept for backward compat */
  barColor?: string;
  /** Period options for the dropdown selector */
  periodOptions?: string[];
  /** Default selected period */
  defaultPeriod?: string;
}

// ------------------------------------------
// Helpers
// ------------------------------------------
const formatAxisValue = (value: number): string => {
  if (value >= 1000) return `${(value / 1000).toFixed(value % 1000 === 0 ? 0 : 1)}K`;
  return String(value);
};

/** Build a smooth cubic bezier SVG path through points */
const buildSmoothPath = (points: { x: number; y: number }[]): string => {
  if (points.length < 2) return "";
  const tension = 0.3;
  let d = `M ${points[0].x},${points[0].y}`;

  for (let i = 0; i < points.length - 1; i++) {
    const p0 = points[Math.max(0, i - 1)];
    const p1 = points[i];
    const p2 = points[i + 1];
    const p3 = points[Math.min(points.length - 1, i + 2)];

    const cp1x = p1.x + (p2.x - p0.x) * tension;
    const cp1y = p1.y + (p2.y - p0.y) * tension;
    const cp2x = p2.x - (p3.x - p1.x) * tension;
    const cp2y = p2.y - (p3.y - p1.y) * tension;

    d += ` C ${cp1x},${cp1y} ${cp2x},${cp2y} ${p2.x},${p2.y}`;
  }
  return d;
};

// ------------------------------------------
// Component
// ------------------------------------------
const DefectTrendChart: React.FC<DefectTrendChartProps> = ({
  title,
  data,
  maxBarHeight = 180,
  gradientFrom = "#6366f1",
  gradientTo = "#818cf8",
  icon: IconComponent,
  iconBg = "bg-rose-50 dark:bg-rose-900/30",
  iconColor = "text-rose-600 dark:text-rose-400",
  emptyMessage = "No trend data available.",
  periodOptions = ["Week", "Month", "Quarter"],
  defaultPeriod = "Month",
}) => {
  const maxValue = Math.max(...data.map((d) => d.value), 1);
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);
  const [selectedPeriod, setSelectedPeriod] = useState(defaultPeriod);
  const [periodOpen, setPeriodOpen] = useState(false);
  const [animated, setAnimated] = useState(false);
  const chartRef = useRef<SVGSVGElement>(null);

  const Icon = IconComponent || BarChart3;

  // Animation trigger
  useEffect(() => {
    setAnimated(false);
    const timer = setTimeout(() => setAnimated(true), 100);
    return () => clearTimeout(timer);
  }, [data]);

  // Close dropdown on outside click
  useEffect(() => {
    if (!periodOpen) return;
    const handleClick = () => setPeriodOpen(false);
    document.addEventListener("click", handleClick);
    return () => document.removeEventListener("click", handleClick);
  }, [periodOpen]);

  // Y-axis nice max
  const niceMax = useMemo(() => {
    if (maxValue <= 5) return Math.ceil(maxValue) || 1;
    if (maxValue <= 20) return Math.ceil(maxValue / 5) * 5;
    if (maxValue <= 100) return Math.ceil(maxValue / 25) * 25;
    if (maxValue <= 500) return Math.ceil(maxValue / 100) * 100;
    if (maxValue <= 1000) return Math.ceil(maxValue / 250) * 250;
    return Math.ceil(maxValue / 1000) * 1000;
  }, [maxValue]);

  const yTicks = useMemo(() => [0, 1, 2, 3, 4].map((i) => Math.round((niceMax / 4) * i)), [niceMax]);

  // SVG geometry
  const chartHeight = maxBarHeight;
  const padTop = 8;
  const padBottom = 8;
  const plotH = chartHeight - padTop - padBottom;

  // Points: evenly spaced along X
  const points = useMemo(() => {
    if (data.length === 0) return [];
    // We use percentages 0-100 for x, mapped to viewBox
    return data.map((d, i) => ({
      x: data.length === 1 ? 50 : (i / (data.length - 1)) * 100,
      y: padTop + plotH - (d.value / niceMax) * plotH,
    }));
  }, [data, niceMax, plotH]);

  const linePath = useMemo(() => buildSmoothPath(points), [points]);

  // Area path: line path + close to bottom
  const areaPath = useMemo(() => {
    if (points.length < 2) return "";
    return `${linePath} L ${points[points.length - 1].x},${chartHeight} L ${points[0].x},${chartHeight} Z`;
  }, [linePath, points, chartHeight]);

  // Unique gradient ID per instance
  const gradientId = useMemo(() => `line-grad-${Math.random().toString(36).slice(2, 8)}`, []);
  const areaGradientId = useMemo(() => `area-grad-${Math.random().toString(36).slice(2, 8)}`, []);

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl overflow-hidden shadow-[0_1px_6px_-2px_rgba(0,0,0,0.05)] hover:shadow-[0_4px_16px_-4px_rgba(0,0,0,0.08)] transition-shadow duration-300">
      {/* Header */}
      <div className="px-6 py-5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className={`w-9 h-9 rounded-xl ${iconBg} flex items-center justify-center`}>
            <Icon size={16} className={iconColor} />
          </div>
          <h3 className="text-sm font-bold text-slate-900 dark:text-white leading-tight">{title}</h3>
        </div>

        {/* Period selector */}
        <div className="relative">
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); setPeriodOpen(!periodOpen); }}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg border transition-all cursor-pointer ${
              periodOpen
                ? "bg-slate-100 dark:bg-slate-800 border-slate-300 dark:border-slate-600 text-slate-900 dark:text-white"
                : "bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700"
            }`}
          >
            {selectedPeriod}
            <ChevronDown size={12} className={`transition-transform duration-200 ${periodOpen ? "rotate-180" : ""}`} />
          </button>
          {periodOpen && (
            <ul className="absolute right-0 mt-1.5 w-32 bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-xl shadow-xl z-50 overflow-hidden p-1">
              {periodOptions.map((opt) => (
                <li key={opt}>
                  <button
                    type="button"
                    onClick={(e) => { e.stopPropagation(); setSelectedPeriod(opt); setPeriodOpen(false); }}
                    className={`w-full text-left px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors flex items-center justify-between ${
                      selectedPeriod === opt
                        ? "bg-slate-100 dark:bg-slate-700 text-slate-900 dark:text-white"
                        : "text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700"
                    }`}
                  >
                    {opt}
                    {selectedPeriod === opt && <Check size={12} className="text-emerald-500" strokeWidth={3} />}
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      {/* Chart */}
      <div className="px-6 pb-6">
        {data.length > 0 ? (
          <div className="flex gap-0">
            {/* Y-axis labels */}
            <div className="flex flex-col justify-between pr-3 shrink-0" style={{ height: chartHeight }}>
              {[...yTicks].reverse().map((tick, i) => (
                <span key={i} className="text-[10px] font-semibold text-slate-400 dark:text-slate-500 leading-none text-left min-w-[32px]">
                  {formatAxisValue(tick)}
                </span>
              ))}
            </div>

            {/* SVG chart area */}
            <div className="flex-1 min-w-0">
              <div className="relative" style={{ height: chartHeight }}>
                {/* Grid lines (behind SVG) */}
                <div className="absolute inset-0 flex flex-col justify-between pointer-events-none">
                  {yTicks.map((_, i) => (
                    <div key={i} className="w-full border-b border-slate-100 dark:border-slate-800" />
                  ))}
                </div>

                {/* SVG */}
                <svg
                  ref={chartRef}
                  viewBox={`0 0 100 ${chartHeight}`}
                  preserveAspectRatio="none"
                  className="absolute inset-0 w-full h-full overflow-visible"
                  style={{ zIndex: 1 }}
                >
                  <defs>
                    {/* Line gradient */}
                    <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="0%">
                      <stop offset="0%" stopColor={gradientFrom} />
                      <stop offset="100%" stopColor={gradientTo} />
                    </linearGradient>
                    {/* Area fill gradient (top to bottom, fade out) */}
                    <linearGradient id={areaGradientId} x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor={gradientFrom} stopOpacity="0.2" />
                      <stop offset="100%" stopColor={gradientFrom} stopOpacity="0.01" />
                    </linearGradient>
                  </defs>

                  {/* Area fill */}
                  {points.length >= 2 && (
                    <path
                      d={areaPath}
                      fill={`url(#${areaGradientId})`}
                      className="transition-opacity duration-700"
                      style={{ opacity: animated ? 1 : 0 }}
                    />
                  )}

                  {/* Line */}
                  {points.length >= 2 && (
                    <path
                      d={linePath}
                      fill="none"
                      stroke={`url(#${gradientId})`}
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      vectorEffect="non-scaling-stroke"
                      className="transition-all duration-700"
                      style={{
                        strokeDasharray: animated ? "none" : "1000",
                        strokeDashoffset: animated ? 0 : 1000,
                        opacity: animated ? 1 : 0,
                      }}
                    />
                  )}
                </svg>

                {/* Dot markers & hover zones (HTML overlay for crisp rendering) */}
                <div className="absolute inset-0" style={{ zIndex: 2 }}>
                  {points.map((pt, idx) => {
                    const isHovered = hoveredIdx === idx;
                    return (
                      <div
                        key={idx}
                        className="absolute"
                        style={{
                          left: `${pt.x}%`,
                          top: `${(pt.y / chartHeight) * 100}%`,
                          transform: "translate(-50%, -50%)",
                        }}
                        onMouseEnter={() => setHoveredIdx(idx)}
                        onMouseLeave={() => setHoveredIdx(null)}
                      >
                        {/* Hover pulse ring */}
                        <div
                          className={`rounded-full transition-all duration-300 ${
                            isHovered ? "w-8 h-8 opacity-100" : "w-5 h-5 opacity-0"
                          }`}
                          style={{
                            background: `radial-gradient(circle, ${gradientFrom}20 0%, transparent 70%)`,
                            position: "absolute",
                            top: "50%",
                            left: "50%",
                            transform: "translate(-50%, -50%)",
                          }}
                        />
                        {/* Dot */}
                        <div
                          className={`rounded-full border-2 border-white dark:border-slate-900 shadow-sm transition-all duration-300 cursor-pointer relative ${
                            animated ? "opacity-100 scale-100" : "opacity-0 scale-0"
                          } ${isHovered ? "w-3.5 h-3.5" : "w-2.5 h-2.5"}`}
                          style={{
                            background: gradientFrom,
                            transitionDelay: `${300 + idx * 60}ms`,
                          }}
                        />

                        {/* Tooltip */}
                        {isHovered && (
                          <div
                            className="absolute bottom-full left-1/2 -translate-x-1/2 mb-3 bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-[10px] font-bold px-3 py-1.5 rounded-lg shadow-xl whitespace-nowrap z-30 pointer-events-none"
                          >
                            {data[idx].label}: {data[idx].value.toLocaleString()}
                            <div className="absolute top-full left-1/2 -translate-x-1/2 w-0 h-0 border-l-[5px] border-r-[5px] border-t-[5px] border-transparent border-t-slate-900 dark:border-t-white" />
                          </div>
                        )}

                        {/* Vertical guide line on hover */}
                        {isHovered && (
                          <div
                            className="absolute left-1/2 -translate-x-1/2 pointer-events-none"
                            style={{
                              top: "50%",
                              height: `${chartHeight - pt.y}px`,
                              width: "1px",
                              background: `${gradientFrom}30`,
                            }}
                          />
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* X-axis labels */}
              <div className="flex justify-between mt-3">
                {data.map((point, idx) => (
                  <span
                    key={idx}
                    className={`text-[9px] sm:text-[10px] font-semibold uppercase tracking-wider text-center transition-colors duration-200 ${
                      hoveredIdx === idx
                        ? "text-slate-800 dark:text-slate-200"
                        : "text-slate-400 dark:text-slate-500"
                    }`}
                    style={{ width: `${100 / data.length}%` }}
                  >
                    {point.label}
                  </span>
                ))}
              </div>
            </div>
          </div>
        ) : (
          /* Empty state */
          <div className="py-12 text-center">
            <div className={`w-10 h-10 rounded-xl ${iconBg} flex items-center justify-center mx-auto mb-3 opacity-50`}>
              <Icon size={18} className={iconColor} />
            </div>
            <p className="text-xs text-slate-400 dark:text-slate-500 font-medium">{emptyMessage}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default DefectTrendChart;
