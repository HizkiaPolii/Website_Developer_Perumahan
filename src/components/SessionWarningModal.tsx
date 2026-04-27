"use client";

import React from "react";
import { AlertTriangle, RotateCcw } from "lucide-react";

interface SessionWarningModalProps {
  isOpen: boolean;
  remainingSeconds: number;
  onExtend: () => void;
}

export default function SessionWarningModal({
  isOpen,
  remainingSeconds,
  onExtend,
}: SessionWarningModalProps) {
  if (!isOpen) return null;

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl p-8 max-w-md w-full mx-4">
        {/* Header with icon */}
        <div className="flex items-center gap-3 mb-4">
          <div className="bg-yellow-100 p-3 rounded-full">
            <AlertTriangle className="w-6 h-6 text-yellow-600" />
          </div>
          <h2 className="text-xl font-bold text-gray-800">
            Session Expiring Soon
          </h2>
        </div>

        {/* Message */}
        <p className="text-gray-600 mb-6">
          Anda sudah tidak aktif selama beberapa waktu. Session Anda akan
          berakhir dalam:
        </p>

        {/* Timer display */}
        <div className="bg-red-50 border-2 border-red-200 rounded-lg p-4 mb-6 text-center">
          <p className="text-sm text-gray-600 mb-2">Sisa Waktu</p>
          <p className="text-4xl font-bold text-red-600 font-mono">
            {formatTime(remainingSeconds)}
          </p>
        </div>

        {/* Warning text */}
        <p className="text-sm text-gray-500 mb-6">
          Klik tombol di bawah untuk melanjutkan session. Jika tidak, Anda akan
          logout otomatis.
        </p>

        {/* Action button */}
        <button
          onClick={onExtend}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-4 rounded-lg transition flex items-center justify-center gap-2"
        >
          <RotateCcw className="w-4 h-4" />
          Lanjutkan Session
        </button>

        {/* Info text */}
        <p className="text-xs text-gray-400 mt-4 text-center">
          Tidak ada aktivitas akan logout otomatis setelah {remainingSeconds}{" "}
          detik
        </p>
      </div>
    </div>
  );
}
