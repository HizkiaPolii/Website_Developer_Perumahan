"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useApi } from "@/hooks/useApi";
import { useToast } from "@/contexts/ToastContext";
import { useConfirmDialog } from "@/contexts/ConfirmDialogContext";
import { formatIDR } from "@/lib/accounting";
import { PageHeader, Card, Btn } from "@/components/finance-ui";
import {
  Check,
  X,
  Clock,
  User,
  AlertCircle,
  FileSpreadsheet,
  ShieldCheck,
  RotateCcw
} from "lucide-react";

interface PendingTransaction {
  id: number;
  transactionCode: string;
  transactionDate: string;
  transactionType: string;
  description: string;
  category?: string;
  referenceNo?: string;
  amount: number;
  status: string;
  debitAccount: {
    id: number;
    accountCode: string;
    accountName: string;
  };
  creditAccount: {
    id: number;
    accountCode: string;
    accountName: string;
  };
  user: {
    id: number;
    name: string;
    email: string;
  };
}

export default function TransactionApprovalPage() {
  const { call } = useApi();
  const { addToast } = useToast();
  const { confirm } = useConfirmDialog();

  const [pendingList, setPendingList] = useState<PendingTransaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoadingId, setActionLoadingId] = useState<number | null>(null);

  // Rejection modal state
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [selectedTx, setSelectedTx] = useState<PendingTransaction | null>(null);
  const [rejectionReason, setRejectionReason] = useState("");

  const fetchPendingTransactions = useCallback(async () => {
    setLoading(true);
    try {
      // Fetch specifically PENDING transactions with a large limit
      const res = await call("GET", "/api/transactions?status=PENDING&limit=200");
      const data = res.data || res || [];
      setPendingList(data);
    } catch (err: any) {
      addToast(err.message || "Gagal memuat daftar pengajuan transaksi", "error");
    } finally {
      setLoading(false);
    }
  }, [call, addToast]);

  useEffect(() => {
    fetchPendingTransactions();
  }, [fetchPendingTransactions]);

  const handleApprove = async (tx: PendingTransaction) => {
    const confirmApprove = await confirm({
      title: "Setujui Transaksi?",
      message: `Transaksi "${tx.description}" senilai ${formatIDR(tx.amount)} akan dibukukan ke jurnal.`,
      confirmText: "Setujui (ACC)",
      cancelText: "Batal",
      type: "info",
    });
    if (!confirmApprove) return;

    setActionLoadingId(tx.id);
    try {
      await call("POST", `/api/transactions/${tx.id}/approve`, {});
      addToast("Transaksi berhasil disetujui dan dibukukan", "success");
      
      // Dispatch events to notify other components (e.g. accounting store)
      window.dispatchEvent(new CustomEvent("approvalDataChanged"));
      window.dispatchEvent(new CustomEvent("transactionDataChanged"));
      
      // Refresh pending list
      await fetchPendingTransactions();
    } catch (err: any) {
      addToast(err.message || "Gagal menyetujui transaksi", "error");
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleRejectClick = (tx: PendingTransaction) => {
    setSelectedTx(tx);
    setRejectionReason("");
    setShowRejectModal(true);
  };

  const handleRejectSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTx || !rejectionReason.trim()) return;

    setActionLoadingId(selectedTx.id);
    setShowRejectModal(false);
    try {
      await call("POST", `/api/transactions/${selectedTx.id}/reject`, {
        rejectionReason: rejectionReason.trim(),
      });
      addToast("Transaksi telah ditolak dan dikembalikan ke Teller", "success");
      
      // Dispatch events to notify other components
      window.dispatchEvent(new CustomEvent("approvalDataChanged"));
      window.dispatchEvent(new CustomEvent("transactionDataChanged"));
      
      // Refresh list
      await fetchPendingTransactions();
    } catch (err: any) {
      addToast(err.message || "Gagal menolak transaksi", "error");
    } finally {
      setActionLoadingId(null);
      setSelectedTx(null);
      setRejectionReason("");
    }
  };

  // Calculate statistics
  const totalPendingCount = pendingList.length;
  const totalPendingAmount = pendingList.reduce((sum, item) => sum + item.amount, 0);

  return (
    <div className="space-y-6 max-w-6xl mx-auto animate-fade-in">
      <PageHeader
        title="Persetujuan Transaksi (Approval)"
        description="Tinjau, setujui (ACC), atau tolak jurnal transaksi double-entry yang diajukan oleh Teller."
        icon={ShieldCheck}
        action={
          <Btn onClick={fetchPendingTransactions} variant="secondary" disabled={loading}>
            <RotateCcw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} /> Refresh Data
          </Btn>
        }
      />

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <Card className="p-5 flex items-center justify-between bg-white border border-slate-200/60 shadow-xs relative overflow-hidden">
          <div className="space-y-1">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">
              Menunggu Persetujuan
            </p>
            <h3 className="text-3xl font-black text-slate-800 tracking-tight">
              {totalPendingCount} <span className="text-sm font-medium text-slate-400">transaksi</span>
            </h3>
          </div>
          <div className="p-3 bg-amber-50 text-amber-600 rounded-2xl">
            <Clock className="w-8 h-8" />
          </div>
          <div className="absolute left-0 top-0 bottom-0 w-1 bg-amber-500" />
        </Card>

        <Card className="p-5 flex items-center justify-between bg-white border border-slate-200/60 shadow-xs relative overflow-hidden">
          <div className="space-y-1">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">
              Total Nominal Pengajuan
            </p>
            <h3 className="text-3xl font-black text-indigo-600 tracking-tight">
              {formatIDR(totalPendingAmount)}
            </h3>
          </div>
          <div className="p-3 bg-indigo-50 text-indigo-600 rounded-2xl">
            <FileSpreadsheet className="w-8 h-8" />
          </div>
          <div className="absolute left-0 top-0 bottom-0 w-1 bg-indigo-500" />
        </Card>
      </div>

      {/* Queue Header */}
      <div className="flex items-center justify-between border-b border-slate-200 pb-3">
        <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
          <span>Antrean Pengajuan Jurnal</span>
          <span className="px-2.5 py-0.5 text-xs font-bold bg-amber-100 text-amber-800 rounded-full border border-amber-200">
            {pendingList.length} Pending
          </span>
        </h2>
      </div>

      {/* Main List */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 gap-3">
          <Clock className="w-10 h-10 animate-spin text-indigo-600" />
          <p className="text-slate-500 font-medium text-sm">Memuat antrean persetujuan...</p>
        </div>
      ) : pendingList.length === 0 ? (
        <Card className="p-12 text-center flex flex-col items-center justify-center max-w-xl mx-auto border-dashed border-2 border-slate-200">
          <div className="w-14 h-14 bg-emerald-50 rounded-2xl flex items-center justify-center text-emerald-500 mb-4">
            <Check className="w-8 h-8" />
          </div>
          <h3 className="text-lg font-bold text-slate-800">Semua Bersih!</h3>
          <p className="text-slate-500 text-sm mt-1 max-w-sm">
            Tidak ada transaksi baru yang menunggu persetujuan Anda saat ini. Semua jurnal transaksi telah terproses.
          </p>
        </Card>
      ) : (
        <div className="space-y-4">
          {pendingList.map((tx) => (
            <Card
              key={tx.id}
              className={`p-6 bg-white border transition-all duration-200 ${
                actionLoadingId === tx.id
                  ? "border-slate-300 opacity-60 pointer-events-none"
                  : "border-slate-200 hover:border-slate-300/80 hover:shadow-md"
              }`}
            >
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                
                {/* Info Block */}
                <div className="space-y-3 flex-1">
                  
                  {/* First row: Code and Meta */}
                  <div className="flex flex-wrap items-center gap-3">
                    <span className="font-mono text-xs font-bold bg-slate-100 text-slate-700 px-2.5 py-1 rounded-md border border-slate-200">
                      {tx.transactionCode}
                    </span>
                    <div className="flex items-center gap-1.5 text-xs text-slate-400 font-medium">
                      <Clock className="w-3.5 h-3.5" />
                      <span>{new Date(tx.transactionDate).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })}</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-xs text-slate-400 font-medium">
                      <User className="w-3.5 h-3.5" />
                      <span>Teller: <strong className="text-slate-600">{tx.user?.name || "System"}</strong></span>
                    </div>
                  </div>

                  {/* Second row: Description */}
                  <h4 className="text-base font-bold text-slate-800 leading-snug">
                    {tx.description}
                  </h4>

                  {/* Third row: Debit / Credit account visualization */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-2xl pt-1">
                    {/* Debit */}
                    <div className="flex items-center gap-3 p-2 bg-emerald-50/50 border border-emerald-100/60 rounded-xl">
                      <div className="text-[10px] font-extrabold uppercase bg-emerald-600 text-white px-2 py-0.5 rounded-sm">
                        Debit
                      </div>
                      <div className="min-w-0">
                        <p className="text-[11px] font-mono text-emerald-700 font-bold">
                          {tx.debitAccount.accountCode}
                        </p>
                        <p className="text-xs font-semibold text-slate-700 truncate">
                          {tx.debitAccount.accountName}
                        </p>
                      </div>
                    </div>

                    {/* Credit */}
                    <div className="flex items-center gap-3 p-2 bg-rose-50/50 border border-rose-100/60 rounded-xl">
                      <div className="text-[10px] font-extrabold uppercase bg-rose-600 text-white px-2 py-0.5 rounded-sm">
                        Kredit
                      </div>
                      <div className="min-w-0">
                        <p className="text-[11px] font-mono text-rose-700 font-bold">
                          {tx.creditAccount.accountCode}
                        </p>
                        <p className="text-xs font-semibold text-slate-700 truncate">
                          {tx.creditAccount.accountName}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Amount and Action Buttons */}
                <div className="flex flex-row lg:flex-col items-center lg:items-end justify-between lg:justify-center gap-4 shrink-0 border-t lg:border-t-0 pt-4 lg:pt-0 border-slate-100">
                  <div className="text-right">
                    <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">
                      Nominal Jurnal
                    </p>
                    <p className="text-2xl font-black text-slate-800 tabular-nums">
                      {formatIDR(tx.amount)}
                    </p>
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={() => handleRejectClick(tx)}
                      disabled={actionLoadingId !== null}
                      className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold bg-rose-50 text-rose-600 hover:bg-rose-100 border border-rose-100 hover:border-rose-200 transition-colors disabled:opacity-50"
                    >
                      <X className="w-3.5 h-3.5" />
                      Tolak
                    </button>

                    <button
                      onClick={() => handleApprove(tx)}
                      disabled={actionLoadingId !== null}
                      className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-emerald-600 text-white hover:bg-emerald-700 shadow-sm shadow-emerald-200 transition-all hover:scale-[1.02] active:scale-100 disabled:opacity-50"
                    >
                      <Check className="w-3.5 h-3.5" />
                      Setujui (ACC)
                    </button>
                  </div>
                </div>

              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Rejection Modal Dialog */}
      {showRejectModal && selectedTx && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fade-in">
          <Card className="w-full max-w-md bg-white p-6 shadow-2xl border border-slate-200/80 rounded-2xl animate-scale-in">
            <div className="flex items-center gap-3 border-b border-slate-100 pb-4 mb-4">
              <div className="w-10 h-10 bg-rose-50 rounded-xl flex items-center justify-center text-rose-500 shrink-0">
                <AlertCircle className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-slate-800 text-lg">Tolak Pengajuan Jurnal</h3>
                <p className="text-slate-400 text-xs mt-0.5">Kode: {selectedTx.transactionCode}</p>
              </div>
            </div>

            <form onSubmit={handleRejectSubmit} className="space-y-4">
              <div className="p-3.5 bg-slate-50 border border-slate-100 rounded-xl">
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">
                  Detail Transaksi
                </p>
                <p className="text-sm font-semibold text-slate-700 line-clamp-2">
                  {selectedTx.description}
                </p>
                <p className="text-sm font-black text-slate-850 mt-1 tabular-nums">
                  {formatIDR(selectedTx.amount)}
                </p>
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1.5">
                  Alasan Penolakan <span className="text-rose-500">*</span>
                </label>
                <textarea
                  required
                  rows={3}
                  placeholder="Contoh: Akun debit salah, seharusnya menggunakan Bank Mandiri"
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  className="input-base resize-none"
                />
              </div>

              <div className="flex justify-end gap-2 border-t border-slate-100 pt-4 mt-2">
                <Btn
                  variant="secondary"
                  onClick={() => {
                    setShowRejectModal(false);
                    setSelectedTx(null);
                  }}
                >
                  Batal
                </Btn>
                <Btn type="submit" variant="danger" disabled={!rejectionReason.trim()}>
                  Tolak Transaksi
                </Btn>
              </div>
            </form>
          </Card>
        </div>
      )}
    </div>
  );
}
