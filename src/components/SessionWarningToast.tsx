"use client";

import React from "react";
import { AlertTriangle } from "lucide-react";

interface SessionWarningToastProps {
  isOpen: boolean;
  remainingSeconds: number;
  onExtend: () => void;
}

export default function SessionWarningToast({
  isOpen,
  remainingSeconds,
  onExtend,
}: SessionWarningToastProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50 animate-in slide-in-from-bottom-5 duration-300">
      <div className="bg-yellow-50 border-2 border-yellow-300 rounded-lg shadow-lg p-4 max-w-sm">
        {/* Header */}
        <div className="flex items-start gap-2 mb-3">
          <AlertTriangle className="w-5 h-5 text-yellow-600 shrink-0 mt-0.5" />
          <div>
            <p className="font-bold text-yellow-900">Session Akan Berakhir!</p>
            <p className="text-xs text-yellow-700">Anda tidak aktif selama beberapa waktu</p>
          </div>
        </div>

        {/* Timer */}
        <div className="bg-yellow-100 rounded p-2 mb-3 text-center">
          <p className="text-xs text-yellow-700 font-semibold">Sisa Waktu Logout</p>
          <p className="text-3xl font-bold text-yellow-900 font-mono">
            {Math.floor(remainingSeconds / 60)}:{(remainingSeconds % 60).toString().padStart(2, "0")}
          </p>
        </div>

        {/* Action Button */}
        <button
          onClick={onExtend}
          className="w-full bg-yellow-600 hover:bg-yellow-700 text-white text-sm font-semibold py-2 px-3 rounded transition"
        >
          Lanjutkan Session
        </button>
      </div>
    </div>
  );
}
