"use client";

import React, { useEffect } from "react";
import { useToast } from "@/contexts/ToastContext";

export function ToastContainer() {
  const { toasts, removeToast } = useToast();

  const getIcon = (type: string) => {
    const icons = {
      success: "✓",
      error: "❌",
      warning: "⚠️",
      info: "ℹ️",
    };
    return icons[type as keyof typeof icons] || icons.info;
  };

  const getStyles = (type: string) => {
    const styles = {
      success: "bg-emerald-50 border-emerald-200 text-emerald-900",
      error: "bg-red-50 border-red-200 text-red-900",
      warning: "bg-amber-50 border-amber-200 text-amber-900",
      info: "bg-blue-50 border-blue-200 text-blue-900",
    };
    return styles[type as keyof typeof styles] || styles.info;
  };

  const getProgressColor = (type: string) => {
    const colors = {
      success: "bg-emerald-400",
      error: "bg-red-400",
      warning: "bg-amber-400",
      info: "bg-blue-400",
    };
    return colors[type as keyof typeof colors] || colors.info;
  };

  return (
    <div className="fixed bottom-4 right-4 z-50 space-y-3 max-w-sm pointer-events-none">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={`${getStyles(toast.type)} border rounded-lg shadow-lg overflow-hidden pointer-events-auto animate-slide-in`}
        >
          <div className="p-4 flex items-start gap-3">
            <span className="text-xl flex-shrink-0">{getIcon(toast.type)}</span>
            <p className="text-sm font-medium flex-1">{toast.message}</p>
            <button
              onClick={() => removeToast(toast.id)}
              className="flex-shrink-0 ml-2 text-lg opacity-50 hover:opacity-100"
            >
              ×
            </button>
          </div>
          {toast.duration && toast.duration > 0 && (
            <div className={`h-1 ${getProgressColor(toast.type)} animate-progress`} style={{
              animation: `progress ${toast.duration}ms linear forwards`,
            }} />
          )}
        </div>
      ))}

      <style jsx>{`
        @keyframes slide-in {
          from {
            transform: translateX(400px);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }
        @keyframes progress {
          from {
            width: 100%;
          }
          to {
            width: 0%;
          }
        }
        .animate-slide-in {
          animation: slide-in 0.3s ease-out;
        }
      `}</style>
    </div>
  );
}
