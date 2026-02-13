import React, { useEffect } from "react";
import { CheckCircle2, XCircle, X } from "lucide-react";

interface ToastProps {
  message: string;
  type: "success" | "error";
  onClose: () => void;
}

const Toast: React.FC<ToastProps> = ({ message, type, onClose }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, 4000);
    return () => clearTimeout(timer);
  }, [onClose]);

  const styles = {
    success: {
      icon: <CheckCircle2 className="text-emerald-500 mt-0.5" size={20} />,
      bg: "bg-white",
      border: "border-emerald-100",
      title: "text-emerald-700",
      bar: "bg-emerald-500",
    },
    error: {
      icon: <XCircle className="text-red-500 mt-0.5" size={20} />,
      bg: "bg-white",
      border: "border-red-100",
      title: "text-red-700",
      bar: "bg-red-500",
    },
  };

  const style = styles[type];

  return (
    <div className="fixed top-6 right-6 z-[100] flex flex-col gap-2 animate-in slide-in-from-right-10 duration-300">
      <div
        className={`relative flex items-start gap-3 pl-4 pr-10 py-4 rounded-xl shadow-xl border ${style.bg} ${style.border} overflow-hidden max-w-sm`}
      >
        {/* Icon */}
        <div className="flex-shrink-0" aria-hidden="true">
          {style.icon}
        </div>

        {/* Text */}
        <div>
          <h4 className={`text-sm font-bold ${style.title}`}>
            {type === "success" ? "Success" : "Error"}
          </h4>
          <p className="text-sm text-slate-600 mt-1 leading-relaxed">
            {message}
          </p>
        </div>

        {/* Close Button - FIXED HERE */}
        <button
          onClick={onClose}
          aria-label="Close notification"
          title="Close notification"
          className="absolute top-3 right-3 text-slate-400 hover:text-slate-600 transition-colors bg-transparent p-1 rounded-md hover:bg-slate-50"
        >
          <X size={16} />
        </button>

        {/* Progress Bar */}
        <div
          className={`absolute bottom-0 left-0 h-1 ${style.bar} w-full animate-[shrink_4s_linear_forwards] origin-left opacity-30`}
        ></div>
      </div>
    </div>
  );
};

export default Toast;
