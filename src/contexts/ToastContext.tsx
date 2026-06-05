"use client";

import React, { createContext, useContext, useCallback } from "react";
import toast, { Toaster } from "react-hot-toast";

type ToastType = "success" | "error" | "warning" | "info";

interface Toast {
  id: string;
  type: ToastType;
  message: string;
  duration?: number;
}

interface ToastContextType {
  toasts: Toast[];
  addToast: (message: string, type: ToastType, duration?: number) => void;
  removeToast: (id: string) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const addToast = useCallback((message: string, type: ToastType = "info", duration = 3000) => {
    const options = { duration };
    switch (type) {
      case "success":
        toast.success(message, options);
        break;
      case "error":
        toast.error(message, options);
        break;
      case "warning":
        toast(message, {
          icon: "⚠️",
          style: {
            background: "#fffbeb",
            color: "#92400e",
            border: "1px solid #fde68a",
          },
          ...options,
        });
        break;
      case "info":
      default:
        toast(message, {
          icon: "ℹ️",
          style: {
            background: "#eff6ff",
            color: "#1e40af",
            border: "1px solid #bfdbfe",
          },
          ...options,
        });
        break;
    }
  }, []);

  const removeToast = useCallback((id: string) => {
    toast.dismiss(id);
  }, []);

  return (
    <ToastContext.Provider value={{ toasts: [], addToast, removeToast }}>
      <Toaster
        position="bottom-right"
        reverseOrder={false}
        toastOptions={{
          className: "font-sans text-sm",
          style: {
            borderRadius: "8px",
            boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)",
          },
          success: {
            style: {
              background: "#ecfdf5",
              color: "#065f46",
              border: "1px solid #a7f3d0",
            },
            iconTheme: {
              primary: "#10b981",
              secondary: "#fff",
            },
          },
          error: {
            style: {
              background: "#fef2f2",
              color: "#991b1b",
              border: "1px solid #fca5a5",
            },
            iconTheme: {
              primary: "#ef4444",
              secondary: "#fff",
            },
          },
        }}
      />
      {children}
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used within ToastProvider");
  }
  return context;
}

