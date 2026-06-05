"use client";

import React, { useState, useEffect, useRef } from "react";

interface CreateRequestModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: {
    item: string;
    quantity: string;
    amount: number;
    department: string;
    description: string;
  }) => void;
  requesterName: string;
}

export default function CreateRequestModal({ isOpen, onClose, onSubmit, requesterName }: CreateRequestModalProps) {
  const [item, setItem] = useState("");
  const [quantity, setQuantity] = useState("");
  const [amount, setAmount] = useState("");
  const [department, setDepartment] = useState("");
  const [description, setDescription] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const modalRef = useRef<HTMLDivElement>(null);
  const firstInputRef = useRef<HTMLInputElement>(null);

  // Focus first input when modal opens
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => firstInputRef.current?.focus(), 100);
    }
  }, [isOpen]);

  // Close on Escape key
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    if (isOpen) window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, [isOpen, onClose]);

  // Close on backdrop click
  const handleBackdropClick = (e: React.MouseEvent) => {
    if (modalRef.current && !modalRef.current.contains(e.target as Node)) {
      onClose();
    }
  };

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};
    if (!item.trim()) newErrors.item = "Nama barang wajib diisi";
    if (!quantity.trim()) newErrors.quantity = "Jumlah wajib diisi";
    if (!amount || parseFloat(amount) <= 0) newErrors.amount = "Estimasi biaya harus lebih dari 0";
    if (!department.trim()) newErrors.department = "Departemen/proyek wajib diisi";
    if (!description.trim()) newErrors.description = "Keterangan wajib diisi";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);
    
    // Small delay to show loading state
    await new Promise(resolve => setTimeout(resolve, 300));

    onSubmit({
      item: item.trim(),
      quantity: quantity.trim(),
      amount: parseFloat(amount),
      department: department.trim(),
      description: description.trim(),
    });

    // Reset form
    setItem("");
    setQuantity("");
    setAmount("");
    setDepartment("");
    setDescription("");
    setErrors({});
    setIsSubmitting(false);
  };

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      onClick={handleBackdropClick}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm animate-fade-in" />

      {/* Modal */}
      <div
        ref={modalRef}
        className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl shadow-slate-900/20 overflow-hidden animate-scale-in"
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-indigo-600 to-purple-600 p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-extrabold tracking-tight">Pengajuan Barang Baru</h2>
              <p className="text-indigo-200 text-sm mt-1">
                Pemohon: <span className="font-bold text-white">{requesterName}</span>
              </p>
            </div>
            <button
              onClick={onClose}
              className="w-10 h-10 rounded-xl bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors text-lg"
            >
              ✕
            </button>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* Nama Barang */}
          <div>
            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block mb-1.5">
              Nama Barang <span className="text-red-500">*</span>
            </label>
            <input
              ref={firstInputRef}
              type="text"
              value={item}
              onChange={(e) => { setItem(e.target.value); setErrors(prev => ({ ...prev, item: "" })); }}
              placeholder="Contoh: Semen Tiga Roda"
              className={`w-full px-4 py-3 rounded-xl border-2 ${errors.item ? "border-red-300 bg-red-50" : "border-slate-200 focus:border-indigo-400"} bg-slate-50 focus:bg-white text-sm font-medium text-slate-900 outline-none transition-all placeholder:text-slate-400`}
            />
            {errors.item && <p className="text-xs text-red-500 mt-1 font-medium">{errors.item}</p>}
          </div>

          {/* Jumlah + Estimasi (2 cols) */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block mb-1.5">
                Jumlah <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={quantity}
                onChange={(e) => { setQuantity(e.target.value); setErrors(prev => ({ ...prev, quantity: "" })); }}
                placeholder="50 Sak"
                className={`w-full px-4 py-3 rounded-xl border-2 ${errors.quantity ? "border-red-300 bg-red-50" : "border-slate-200 focus:border-indigo-400"} bg-slate-50 focus:bg-white text-sm font-medium text-slate-900 outline-none transition-all placeholder:text-slate-400`}
              />
              {errors.quantity && <p className="text-xs text-red-500 mt-1 font-medium">{errors.quantity}</p>}
            </div>
            <div>
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block mb-1.5">
                Estimasi Biaya (Rp) <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                value={amount}
                onChange={(e) => { setAmount(e.target.value); setErrors(prev => ({ ...prev, amount: "" })); }}
                placeholder="3250000"
                min="0"
                className={`w-full px-4 py-3 rounded-xl border-2 ${errors.amount ? "border-red-300 bg-red-50" : "border-slate-200 focus:border-indigo-400"} bg-slate-50 focus:bg-white text-sm font-medium text-slate-900 outline-none transition-all placeholder:text-slate-400`}
              />
              {errors.amount && <p className="text-xs text-red-500 mt-1 font-medium">{errors.amount}</p>}
            </div>
          </div>

          {/* Departemen / Proyek */}
          <div>
            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block mb-1.5">
              Departemen / Proyek <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={department}
              onChange={(e) => { setDepartment(e.target.value); setErrors(prev => ({ ...prev, department: "" })); }}
              placeholder="Pembangunan Tahap 1"
              className={`w-full px-4 py-3 rounded-xl border-2 ${errors.department ? "border-red-300 bg-red-50" : "border-slate-200 focus:border-indigo-400"} bg-slate-50 focus:bg-white text-sm font-medium text-slate-900 outline-none transition-all placeholder:text-slate-400`}
            />
            {errors.department && <p className="text-xs text-red-500 mt-1 font-medium">{errors.department}</p>}
          </div>

          {/* Keterangan */}
          <div>
            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block mb-1.5">
              Keterangan <span className="text-red-500">*</span>
            </label>
            <textarea
              value={description}
              onChange={(e) => { setDescription(e.target.value); setErrors(prev => ({ ...prev, description: "" })); }}
              placeholder="Kebutuhan pengecoran pondasi blok A, diperlukan segera untuk jadwal proyek minggu depan."
              rows={3}
              className={`w-full px-4 py-3 rounded-xl border-2 ${errors.description ? "border-red-300 bg-red-50" : "border-slate-200 focus:border-indigo-400"} bg-slate-50 focus:bg-white text-sm font-medium text-slate-900 outline-none transition-all resize-none placeholder:text-slate-400`}
            />
            {errors.description && <p className="text-xs text-red-500 mt-1 font-medium">{errors.description}</p>}
          </div>

          {/* Info Box */}
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 flex items-start gap-3">
            <span className="text-lg mt-0.5">💡</span>
            <p className="text-xs text-amber-800 leading-relaxed">
              Pengajuan akan dikirim ke <strong>Manager</strong> untuk divalidasi. 
              Setelah disetujui Manager, akan diteruskan ke <strong>Direktur</strong> untuk persetujuan akhir.
            </p>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-2">
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 bg-slate-900 hover:bg-indigo-600 disabled:bg-slate-400 text-white py-3.5 rounded-xl font-bold text-sm transition-all shadow-lg shadow-slate-200 flex items-center justify-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Mengirim...
                </>
              ) : (
                <>📤 Kirim Pengajuan</>
              )}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-3.5 bg-white hover:bg-slate-50 text-slate-600 border border-slate-200 rounded-xl font-bold text-sm transition-all"
            >
              Batal
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
