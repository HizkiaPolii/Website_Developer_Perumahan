"use client";

import React, { createContext, useContext, useState, useCallback } from "react";

interface ConfirmDialogOptions {
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  type?: "warning" | "danger" | "info";
}

interface ConfirmDialogContextType {
  confirm: (options: ConfirmDialogOptions) => Promise<boolean>;
}

const ConfirmDialogContext = createContext<ConfirmDialogContextType | undefined>(undefined);

export function ConfirmDialogProvider({ children }: { children: React.ReactNode }) {
  const [dialog, setDialog] = useState<{
    isOpen: boolean;
    options: ConfirmDialogOptions | null;
    resolve: ((value: boolean) => void) | null;
  }>({
    isOpen: false,
    options: null,
    resolve: null,
  });

  const confirm = useCallback((options: ConfirmDialogOptions) => {
    return new Promise<boolean>((resolve) => {
      setDialog({
        isOpen: true,
        options,
        resolve,
      });
    });
  }, []);

  const handleConfirm = () => {
    dialog.resolve?.(true);
    setDialog({ isOpen: false, options: null, resolve: null });
  };

  const handleCancel = () => {
    dialog.resolve?.(false);
    setDialog({ isOpen: false, options: null, resolve: null });
  };

  return (
    <ConfirmDialogContext.Provider value={{ confirm }}>
      {children}
      
      {dialog.isOpen && dialog.options && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full mx-4 overflow-hidden animate-scale-in">
            {/* Header */}
            <div className={`px-6 py-4 ${
              dialog.options.type === "danger" ? "bg-red-50 border-b border-red-200" :
              dialog.options.type === "warning" ? "bg-amber-50 border-b border-amber-200" :
              "bg-blue-50 border-b border-blue-200"
            }`}>
              <div className="flex items-start gap-3">
                <span className="text-2xl">
                  {dialog.options.type === "danger" ? "⚠️" : dialog.options.type === "warning" ? "❓" : "ℹ️"}
                </span>
                <h2 className="text-lg font-bold text-slate-900">{dialog.options.title}</h2>
              </div>
            </div>

            {/* Content */}
            <div className="px-6 py-4">
              <p className="text-slate-600">{dialog.options.message}</p>
            </div>

            {/* Footer */}
            <div className="px-6 py-4 bg-slate-50 border-t flex gap-3 justify-end">
              <button
                onClick={handleCancel}
                className="px-4 py-2 text-sm font-semibold text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-100 transition-colors"
              >
                {dialog.options.cancelText || "Batal"}
              </button>
              <button
                onClick={handleConfirm}
                className={`px-4 py-2 text-sm font-semibold text-white rounded-lg transition-colors ${
                  dialog.options.type === "danger" ? "bg-red-600 hover:bg-red-700" :
                  dialog.options.type === "warning" ? "bg-amber-600 hover:bg-amber-700" :
                  "bg-blue-600 hover:bg-blue-700"
                }`}
              >
                {dialog.options.confirmText || "Ya, Lanjutkan"}
              </button>
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        @keyframes scale-in {
          from {
            transform: scale(0.95);
            opacity: 0;
          }
          to {
            transform: scale(1);
            opacity: 1;
          }
        }
        .animate-scale-in {
          animation: scale-in 0.2s ease-out;
        }
      `}</style>
    </ConfirmDialogContext.Provider>
  );
}

export function useConfirmDialog() {
  const context = useContext(ConfirmDialogContext);
  if (!context) {
    throw new Error("useConfirmDialog must be used within ConfirmDialogProvider");
  }
  return context;
}
