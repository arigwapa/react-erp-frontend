import React from "react";

interface StatusBadgeProps {
  status: string;
  className?: string;
}

type StatusIntent = "success" | "warning" | "danger" | "info" | "neutral";

const getStatusIntent = (status: string): StatusIntent => {
  const s = status ? status.toLowerCase().trim() : "";

  switch (s) {
    // ✅ Success (Green)
    case "create":
    case "active":
    case "enabled":
    case "completed":
    case "paid":
    case "approved":
    case "delivered":
    case "verified":
    case "success":
    case "production":
    case "complete":
    case "passed":
    case "good":
    case "in":
    case "audited":
    case "within budget":
    case "on track":
    case "on-track":
    case "released":
    case "ready":
      return "success";

    // ⚠️ Warning (Amber)
    case "pending":
    case "review":
    case "on hold":
    case "awaiting":
    case "late":
    case "draft":
    case "medium":
    case "under review":
    case "conditional":
    case "low":
    case "out":
    case "at risk":
      return "warning";

    // ❌ Danger (Red)
    case "security":
    case "critical":
    case "disabled":
    case "banned":
    case "rejected":
    case "cancelled":
    case "overdue":
    case "inactive":
    case "urgent":
    case "high":
    case "error":
    case "delete":
    case "archived":
    case "delayed":
    case "failed":
    case "negative":
    case "over budget":
      return "danger";

    // ℹ️ Info (Blue)
    case "clarification":
    case "update":
    case "login":
    case "processing":
    case "shipped":
    case "in progress":
    case "open":
    case "new":
    case "transfer":
    case "operational":
    case "ongoing":
    case "in-progress":
    case "started":
      return "info";

    // ⚪ Neutral (Slate/Gray)
    case "scheduled":
    case "locked":
    case "planned":
    case "not started":
    default:
      return "neutral";
  }
};

const styleMap: Record<StatusIntent, string> = {
  success: "bg-emerald-50 text-emerald-700",
  warning: "bg-amber-50 text-amber-700",
  danger: "bg-rose-50 text-rose-700",
  info: "bg-blue-50 text-blue-700",
  neutral: "bg-slate-100 text-slate-600",
};

export const StatusBadge: React.FC<StatusBadgeProps> = ({
  status,
  className = "",
}) => {
  const intent = getStatusIntent(status);
  const styles = styleMap[intent];

  return (
    <span
      className={`
        inline-flex items-center px-2.5 py-1 rounded-full w-fit
        text-xs font-medium capitalize
        ${styles}
        ${className}
      `}
    >
      {status}
    </span>
  );
};
