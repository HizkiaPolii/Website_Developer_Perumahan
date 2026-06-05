"use client";

import React, { useState, useMemo, useEffect } from "react";
import { useToast } from "@/contexts/ToastContext";
import { useConfirmDialog } from "@/contexts/ConfirmDialogContext";
import { useAuth } from "@/contexts/AuthContext";
import { useApproval } from "@/contexts/ApprovalContext";
import CreateRequestModal from "@/components/CreateRequestModal";
import type { ApprovalStatus, PurchaseRequest } from "@/services/approval-service";

type UserRole = "Admin" | "Manager" | "Owner" | "Staf";

export default function ApprovalPage() {
  const { user } = useAuth();
  const { addToast } = useToast();
  const { confirm } = useConfirmDialog();
  const {
    requests,
    stats,
    isLoading,
    createRequest,
    approveByManager,
    approveByOwner,
    rejectRequest,
    getPendingForManager,
    getPendingForOwner,
    getHistoryForManager,
    getHistoryForOwner,
    getRequestsByRequester,
  } = useApproval();

  const role = (user?.role || "Manager") as UserRole;

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [activeTab, setActiveTab] = useState<"pending" | "history" | "myRequests">(
    role === "Staf" ? "myRequests" : "pending"
  );

  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<ApprovalStatus | "All">("All");
  const [deptFilter, setDeptFilter] = useState<string>("All");
  const [selectedRequest, setSelectedRequest] = useState<PurchaseRequest | null>(null);

  // Sync default active tab when role changes
  useEffect(() => {
    if (role === "Staf") {
      setActiveTab("myRequests");
    } else {
      setActiveTab("pending");
    }
  }, [role]);

  const isFieldRole = role === "Staf";
  const isManager = role === "Manager";
  const isOwner = role === "Owner";

  // ==================== Filtered Data ====================

  const pending = useMemo(() => {
    if (isManager) return getPendingForManager();
    if (isOwner) return getPendingForOwner();
    return []; // Field roles don't have pending approvals
  }, [isManager, isOwner, getPendingForManager, getPendingForOwner]);

  const history = useMemo(() => {
    if (isManager) return getHistoryForManager();
    if (isOwner) return getHistoryForOwner();
    return requests.filter(r => r.status === "ACC Final" || r.status === "Tolak");
  }, [isManager, isOwner, getHistoryForManager, getHistoryForOwner, requests]);

  const myRequests = useMemo(() => {
    if (!user) return [];
    return getRequestsByRequester(user.id);
  }, [user, getRequestsByRequester]);

  const departments = useMemo(() => {
    const depts = new Set<string>();
    requests.forEach((r) => {
      if (r.department) depts.add(r.department);
    });
    return Array.from(depts);
  }, [requests]);

  const filteredHistory = useMemo(() => {
    let list = history;

    // Search filter
    if (searchTerm.trim()) {
      const s = searchTerm.toLowerCase();
      list = list.filter(
        (r) =>
          r.item.toLowerCase().includes(s) ||
          r.requester.toLowerCase().includes(s) ||
          r.id.toLowerCase().includes(s) ||
          (r.notaNumber && r.notaNumber.toLowerCase().includes(s))
      );
    }

    // Status filter
    if (statusFilter !== "All") {
      list = list.filter((r) => r.status === statusFilter);
    }

    // Department/Project filter
    if (deptFilter !== "All") {
      list = list.filter((r) => r.department === deptFilter);
    }

    return list;
  }, [history, searchTerm, statusFilter, deptFilter]);

  const exportToCSV = () => {
    if (filteredHistory.length === 0) {
      addToast("Tidak ada data untuk diekspor", "warning", 3000);
      return;
    }

    const headers = [
      "ID Pengajuan",
      "Tanggal",
      "Nama Barang",
      "Jumlah",
      "Estimasi Biaya",
      "Pemohon",
      "Departemen/Proyek",
      "Status",
      "No Nota",
      "ACC Manager Oleh",
      "ACC Manager Pada",
      "ACC Direktur Oleh",
      "ACC Direktur Pada",
      "Ditolak Oleh",
      "Ditolak Pada",
      "Alasan Penolakan"
    ];

    const rows = filteredHistory.map((r) => [
      r.id,
      r.date,
      r.item,
      r.quantity,
      r.amount,
      r.requester,
      r.department,
      r.status,
      r.notaNumber || "-",
      r.approvedByManager || "-",
      r.approvedByManagerAt ? new Date(r.approvedByManagerAt).toLocaleString("id-ID") : "-",
      r.approvedByOwner || "-",
      r.approvedByOwnerAt ? new Date(r.approvedByOwnerAt).toLocaleString("id-ID") : "-",
      r.rejectedBy || "-",
      r.rejectedAt ? new Date(r.rejectedAt).toLocaleString("id-ID") : "-",
      r.rejectionReason || "-"
    ]);

    const csvContent = [
      headers.join(","),
      ...rows.map((row) =>
        row
          .map((val) => {
            const stringVal = String(val);
            if (stringVal.includes(",") || stringVal.includes("\"") || stringVal.includes("\n")) {
              return `"${stringVal.replace(/"/g, '""')}"`;
            }
            return stringVal;
          })
          .join(",")
      )
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `riwayat_pengadaan_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    addToast("📥 Riwayat pengadaan berhasil diekspor ke CSV!", "success", 3000);
  };

  // ==================== Handlers ====================

  const handleCreateRequest = (data: { item: string; quantity: string; amount: number; department: string; description: string }) => {
    if (!user) return;
    createRequest({
      ...data,
      requester: `${user.name} (${user.role})`,
      requesterId: user.id,
    });
    setShowCreateModal(false);
    addToast(`📤 Pengajuan "${data.item}" berhasil dikirim ke Manager!`, "success", 3000);
  };

  const handleApprove = async (req: PurchaseRequest) => {
    if (!user) return;

    const title = isManager ? "Approve & Buat Nota?" : "Final Approval Direktur?";
    const message = isManager
      ? `Approve pengajuan ${req.item} dari ${req.requester}. Sistem akan menggenerate nomor nota otomatis untuk diajukan ke Direktur.`
      : `Memberikan persetujuan akhir untuk pengadaan ${req.item} senilai ${formatCurrency(req.amount)}.`;

    const confirmed = await confirm({
      title,
      message,
      confirmText: "Ya, Setujui",
      cancelText: "Batal",
      type: "info",
    });
    if (!confirmed) return;

    let result;
    if (isManager) {
      result = approveByManager(req.id, user.name);
      if (result) {
        addToast(`✓ Approved! Nota ${result.notaNumber} telah dibuat dan diteruskan ke Direktur.`, "success", 4000);
      }
    } else if (isOwner) {
      result = approveByOwner(req.id, user.name);
      if (result) {
        addToast(`✓✓ Berhasil! Pengadaan "${req.item}" telah disetujui Direktur. Siap untuk proses pengadaan.`, "success", 4000);
      }
    }

    if (!result) {
      addToast("Gagal memproses. Mungkin status sudah berubah.", "error", 3000);
    }
  };

  const handleReject = async (req: PurchaseRequest) => {
    if (!user) return;

    const confirmed = await confirm({
      title: "Tolak Pengajuan?",
      message: `Apakah Anda yakin ingin menolak pengajuan "${req.item}" dari ${req.requester}?`,
      confirmText: "Ya, Tolak",
      cancelText: "Batal",
      type: "danger",
    });
    if (!confirmed) return;

    const result = rejectRequest(req.id, user.name);
    if (result) {
      addToast(`❌ Pengajuan ${req.id} — "${req.item}" ditolak.`, "error", 3000);
    }
  };

  // ==================== Render ====================

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center animate-pulse">
          <div className="w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-2xl">📝</span>
          </div>
          <p className="text-slate-600 font-medium">Memuat data pengajuan...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-20">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="px-3 py-1 bg-indigo-600 text-white text-[10px] font-bold rounded-full uppercase tracking-widest">
              {role === "Manager" ? "Manager" : role === "Owner" ? "Direktur" : role === "Staf" ? "Staf" : "Admin"} Dashboard
            </span>
          </div>
          <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight">
            Approval <span className="text-indigo-600">Pengadaan Barang</span>
          </h1>
          <p className="text-slate-500 mt-2 max-w-2xl">
            {isManager
              ? "Review permintaan barang dari tim lapangan, validasi jumlah, dan terbitkan nota untuk persetujuan Direktur."
              : isOwner
              ? "Persetujuan akhir (Final ACC) untuk pengajuan barang yang telah divalidasi oleh Manager."
              : "Buat pengajuan barang dan pantau status persetujuan dari Manager & Direktur."
            }
          </p>
        </div>
        
        {/* Create Button (for field roles) */}
        {isFieldRole && (
          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center gap-2 px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold text-sm transition-all shadow-lg shadow-indigo-200 hover:shadow-xl hover:shadow-indigo-300 hover:-translate-y-0.5 active:translate-y-0"
          >
            <span className="text-lg">＋</span>
            Buat Pengajuan Baru
          </button>
        )}
      </div>

      {/* Workflow Indicator */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <WorkflowStep
          num="1"
          title="Pengajuan"
          desc="Tim Lapangan"
          active={isFieldRole}
          completed={stats.total > 0}
        />
        <WorkflowStep
          num="2"
          title="Validasi & Nota"
          desc="Manager"
          active={isManager}
          completed={stats.accManager > 0 || stats.accFinal > 0}
        />
        <WorkflowStep
          num="3"
          title="Final Approval"
          desc="Direktur/Owner"
          active={isOwner}
          completed={stats.accFinal > 0}
        />
        <WorkflowStep
          num="4"
          title="Pembelian"
          desc="Logistik"
          active={false}
          completed={false}
        />
      </div>

      {/* Tab Navigation */}
      <div className="flex bg-slate-100 p-1 rounded-xl border border-slate-200 w-fit">
        {isFieldRole ? (
          <button
            onClick={() => setActiveTab("myRequests")}
            className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${activeTab === "myRequests" ? "bg-white shadow-sm text-indigo-600" : "text-slate-500 hover:text-slate-700"}`}
          >
            📋 Pengajuan Saya ({myRequests.length})
          </button>
        ) : (
          <button
            onClick={() => setActiveTab("pending")}
            className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${activeTab === "pending" ? "bg-white shadow-sm text-indigo-600" : "text-slate-500 hover:text-slate-700"}`}
          >
            ⏳ Menunggu Persetujuan ({pending.length})
          </button>
        )}
        <button
          onClick={() => setActiveTab("history")}
          className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${activeTab === "history" ? "bg-white shadow-sm text-indigo-600" : "text-slate-500 hover:text-slate-700"}`}
        >
          📜 Semua Riwayat ({history.length})
        </button>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column: Main Content */}
        <div className={`${activeTab === "history" ? "lg:col-span-3" : "lg:col-span-2"} space-y-6`}>
          
          {/* ==================== FIELD ROLE (STAF) VIEW ==================== */}
          {isFieldRole && activeTab === "myRequests" && (
            <>
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                  <span className="w-8 h-8 bg-indigo-100 text-indigo-600 rounded-lg flex items-center justify-center text-sm">📋</span>
                  Pengajuan Saya ({myRequests.length})
                </h2>
              </div>

              {myRequests.length > 0 ? (
                <div className="space-y-4">
                  {myRequests.map((req) => (
                    <RequestCard key={req.id} req={req} showActions={false} />
                  ))}
                </div>
              ) : (
                <EmptyState
                  icon="📦"
                  title="Belum Ada Pengajuan"
                  description="Klik tombol 'Buat Pengajuan Baru' untuk memulai."
                />
              )}
            </>
          )}

          {/* ==================== MANAGER / OWNER VIEW ==================== */}
          {(isManager || isOwner) && activeTab === "pending" && (
            <>
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                  <span className="w-8 h-8 bg-amber-100 text-amber-600 rounded-lg flex items-center justify-center text-sm">⏳</span>
                  Menunggu Persetujuan ({pending.length})
                </h2>
              </div>

              {pending.length > 0 ? (
                <div className="space-y-4">
                  {pending.map((req) => (
                    <RequestCard
                      key={req.id}
                      req={req}
                      showActions={true}
                      role={role}
                      onApprove={() => handleApprove(req)}
                      onReject={() => handleReject(req)}
                    />
                  ))}
                </div>
              ) : (
                <EmptyState
                  icon="✨"
                  title="Semua Beres!"
                  description="Tidak ada pengajuan yang perlu diproses saat ini."
                />
              )}
            </>
          )}

          {/* ==================== HISTORIS VIEW (SHARED) ==================== */}
          {activeTab === "history" && (
            <>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                  <span className="w-8 h-8 bg-emerald-100 text-emerald-600 rounded-lg flex items-center justify-center text-sm">📜</span>
                  Semua Riwayat Pengajuan ({filteredHistory.length})
                </h2>
                <button
                  onClick={exportToCSV}
                  className="flex items-center gap-2 px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-bold text-xs transition-all shadow-md flex items-center justify-center cursor-pointer hover:-translate-y-0.5 active:translate-y-0 active:scale-95"
                >
                  📥 Ekspor ke CSV
                </button>
              </div>

              {/* Search and Filters Bar */}
              <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-4 md:space-y-0 md:flex md:items-center md:gap-4">
                <div className="flex-1">
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">Cari Pengajuan</label>
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Cari berdasarkan ID, Barang, Pemohon..."
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 text-slate-800 rounded-xl text-xs outline-none focus:border-indigo-500 focus:bg-white transition-all font-medium placeholder:text-slate-400"
                  />
                </div>
                <div className="w-full md:w-48">
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">Filter Status</label>
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value as any)}
                    className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 text-slate-800 rounded-xl text-xs outline-none focus:border-indigo-500 focus:bg-white transition-all font-bold"
                  >
                    <option value="All">Semua Status</option>
                    <option value="Pending">Menunggu Manager</option>
                    <option value="ACC Manager">Menunggu Direktur</option>
                    <option value="ACC Final">Disetujui Final</option>
                    <option value="Tolak">Ditolak</option>
                  </select>
                </div>
                <div className="w-full md:w-48">
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">Filter Proyek</label>
                  <select
                    value={deptFilter}
                    onChange={(e) => setDeptFilter(e.target.value)}
                    className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 text-slate-800 rounded-xl text-xs outline-none focus:border-indigo-500 focus:bg-white transition-all font-bold"
                  >
                    <option value="All">Semua Proyek/Dept</option>
                    {departments.map((d) => (
                      <option key={d} value={d}>{d}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Table View */}
              {filteredHistory.length > 0 ? (
                <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse text-xs">
                      <thead>
                        <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase font-bold tracking-wider">
                          <th className="p-4">ID / Nota</th>
                          <th className="p-4">Tanggal</th>
                          <th className="p-4">Nama Barang</th>
                          <th className="p-4">Jumlah</th>
                          <th className="p-4">Estimasi</th>
                          <th className="p-4">Pemohon</th>
                          <th className="p-4">Proyek/Dept</th>
                          <th className="p-4">Status</th>
                          <th className="p-4 text-center">Aksi</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                        {filteredHistory.map((req) => (
                          <tr key={req.id} className="hover:bg-slate-50/50 transition-colors">
                            <td className="p-4 font-bold text-indigo-600">
                              {req.id}
                              {req.notaNumber && (
                                <div className="text-[10px] text-indigo-400 font-normal">Nota: {req.notaNumber}</div>
                              )}
                            </td>
                            <td className="p-4 whitespace-nowrap text-slate-500">{req.date}</td>
                            <td className="p-4 font-bold text-slate-900">{req.item}</td>
                            <td className="p-4 whitespace-nowrap">{req.quantity}</td>
                            <td className="p-4 whitespace-nowrap font-bold text-slate-900">{formatCurrency(req.amount)}</td>
                            <td className="p-4">{req.requester}</td>
                            <td className="p-4">{req.department}</td>
                            <td className="p-4">
                              <StatusBadge status={req.status} />
                            </td>
                            <td className="p-4 text-center">
                              <button
                                onClick={() => setSelectedRequest(req)}
                                className="px-3 py-1.5 bg-slate-100 hover:bg-indigo-50 hover:text-indigo-600 rounded-lg font-bold text-[10px] transition-colors cursor-pointer"
                              >
                                Detail
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              ) : (
                <EmptyState
                  icon="📜"
                  title="Tidak Ada Riwayat"
                  description="Tidak ada pengajuan yang cocok dengan pencarian dan filter Anda."
                />
              )}
            </>
          )}
        </div>

        {/* Right Column: Stats & History */}
        {activeTab !== "history" && (
          <div className="space-y-6">
            {/* Stats Card */}
            <div className="bg-slate-900 rounded-3xl p-6 text-white shadow-xl shadow-slate-200">
              <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                <span className="text-indigo-400">📊</span> Ringkasan
              </h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center pb-4 border-b border-white/10">
                  <p className="text-slate-400 text-sm">Total Pengajuan</p>
                  <p className="text-xl font-bold">{stats.total}</p>
                </div>
                <div className="flex justify-between items-center pb-4 border-b border-white/10">
                  <p className="text-slate-400 text-sm">Menunggu Manager</p>
                  <p className="text-xl font-bold text-amber-400">{stats.pending}</p>
                </div>
                <div className="flex justify-between items-center pb-4 border-b border-white/10">
                  <p className="text-slate-400 text-sm">Menunggu Direktur</p>
                  <p className="text-xl font-bold text-blue-400">{stats.accManager}</p>
                </div>
                <div className="flex justify-between items-center pb-4 border-b border-white/10">
                  <p className="text-slate-400 text-sm">Disetujui Final</p>
                  <p className="text-xl font-bold text-emerald-400">{stats.accFinal}</p>
                </div>
                <div className="flex justify-between items-center pb-4 border-b border-white/10">
                  <p className="text-slate-400 text-sm">Ditolak</p>
                  <p className="text-xl font-bold text-red-400">{stats.rejected}</p>
                </div>
                <div className="flex justify-between items-center">
                  <p className="text-slate-400 text-sm">Total Nilai ACC</p>
                  <p className="text-lg font-bold text-emerald-400">{formatCurrency(stats.approvedAmount)}</p>
                </div>
              </div>
            </div>

            {/* Nota Preview Card */}
            <div className="bg-amber-50/50 border border-amber-200 rounded-3xl p-6 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-20 h-20 bg-amber-200/20 rounded-full -translate-y-1/2 translate-x-1/2"></div>
              <h3 className="text-sm font-bold text-amber-900 mb-4 uppercase tracking-widest">Contoh Format Nota</h3>
              <div className="bg-white rounded-xl p-4 shadow-sm text-[10px] font-mono space-y-2 border border-amber-100">
                <div className="text-center border-b pb-2 mb-2">
                  <p className="font-bold">PERUMAHAN SEJAHTERA</p>
                  <p>NOTA PERMINTAAN BARANG</p>
                </div>
                <div className="flex justify-between">
                  <span>No: NTA-XXXX</span>
                  <span>Tgl: 2024-XX-XX</span>
                </div>
                <div className="py-2">
                  <div className="flex justify-between border-b pb-1">
                    <span>Item: Semen 3 Roda</span>
                    <span>Qty: 50 Sak</span>
                  </div>
                </div>
                <div className="flex justify-between pt-2">
                  <div className="text-center">
                    <p>Manager</p>
                    <div className="h-6"></div>
                    <p>( ________ )</p>
                  </div>
                  <div className="text-center">
                    <p>Direktur</p>
                    <div className="h-6"></div>
                    <p>( ________ )</p>
                  </div>
                </div>
              </div>
              <p className="text-[10px] text-amber-700 mt-4 italic">* Nota otomatis tergenerate setelah approval Manager</p>
            </div>
          </div>
        )}
      </div>

      {/* Create Request Modal */}
      <CreateRequestModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSubmit={handleCreateRequest}
        requesterName={user?.name || "User"}
      />

      {/* Details Drawer Overlay */}
      {selectedRequest && (
        <div className="fixed inset-0 z-50 flex justify-end">
          {/* Backdrop */}
          <div 
            className="absolute inset-0 bg-slate-900/60 backdrop-blur-xs animate-fade-in"
            onClick={() => setSelectedRequest(null)}
          />
          {/* Drawer content */}
          <div className="relative w-full max-w-md bg-white h-screen shadow-2xl flex flex-col z-10 animate-slide-in-right overflow-y-auto">
            {/* Header */}
            <div className="bg-slate-900 text-white p-6 flex justify-between items-center border-b border-white/10 shrink-0">
              <div>
                <p className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest">{selectedRequest.id}</p>
                <h3 className="text-lg font-bold">{selectedRequest.item}</h3>
              </div>
              <button
                onClick={() => setSelectedRequest(null)}
                className="w-8 h-8 rounded-lg bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors text-white font-bold cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Content Body */}
            <div className="p-6 space-y-6 flex-grow">
              {/* Status Section */}
              <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-widest font-mono">Status Pengadaan</span>
                <StatusBadge status={selectedRequest.status} />
              </div>

              {/* Grid Details */}
              <div className="grid grid-cols-2 gap-4 bg-slate-50 p-4 rounded-2xl border border-slate-100 text-xs">
                <div>
                  <p className="font-bold text-slate-400 uppercase tracking-widest mb-1 text-[9px]">Jumlah</p>
                  <p className="font-bold text-slate-900 text-sm">{selectedRequest.quantity}</p>
                </div>
                <div>
                  <p className="font-bold text-slate-400 uppercase tracking-widest mb-1 text-[9px]">Estimasi Biaya</p>
                  <p className="font-extrabold text-indigo-600 text-sm">{formatCurrency(selectedRequest.amount)}</p>
                </div>
                <div className="mt-2">
                  <p className="font-bold text-slate-400 uppercase tracking-widest mb-1 text-[9px]">Pemohon</p>
                  <p className="font-bold text-slate-900">{selectedRequest.requester}</p>
                </div>
                <div className="mt-2">
                  <p className="font-bold text-slate-400 uppercase tracking-widest mb-1 text-[9px]">Tanggal Diajukan</p>
                  <p className="font-bold text-slate-900">{selectedRequest.date}</p>
                </div>
                <div className="col-span-2 mt-2 pt-2 border-t border-slate-200/50">
                  <p className="font-bold text-slate-400 uppercase tracking-widest mb-1 text-[9px]">Proyek / Departemen</p>
                  <p className="font-bold text-slate-900">{selectedRequest.department}</p>
                </div>
              </div>

              {/* Description */}
              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Keterangan</p>
                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 text-xs text-slate-600 leading-relaxed font-medium">
                  {selectedRequest.description}
                </div>
              </div>

              {/* Timeline (Jejak Approval) */}
              <div className="space-y-4">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Jejak Approval</p>
                <div className="relative border-l-2 border-slate-200 pl-6 ml-3 space-y-6 text-xs">
                  {/* Step 1: Created */}
                  <div className="relative">
                    <span className="absolute left-[-31px] top-0.5 w-4.5 h-4.5 rounded-full bg-slate-900 text-white flex items-center justify-center text-[9px] font-bold">1</span>
                    <p className="font-bold text-slate-900">Pengajuan Terdaftar</p>
                    <p className="text-slate-500 mt-0.5">Diajukan oleh {selectedRequest.requester}</p>
                    {selectedRequest.createdAt && (
                      <p className="text-[10px] text-slate-400 mt-0.5">{formatDate(selectedRequest.createdAt)}</p>
                    )}
                  </div>

                  {/* Step 2: Manager Validation */}
                  {(selectedRequest.approvedByManager || selectedRequest.status === "Tolak") && (
                    <div className="relative">
                      {selectedRequest.approvedByManager ? (
                        <>
                          <span className="absolute left-[-31px] top-0.5 w-4.5 h-4.5 rounded-full bg-blue-600 text-white flex items-center justify-center text-[9px] font-bold">✓</span>
                          <p className="font-bold text-blue-700">Validasi Manager (Approved)</p>
                          <p className="text-slate-500 mt-0.5">Disetujui oleh {selectedRequest.approvedByManager}</p>
                          {selectedRequest.notaNumber && (
                            <p className="text-[10px] text-indigo-600 font-bold mt-1 bg-indigo-50 px-2 py-1 rounded w-fit">Nota: {selectedRequest.notaNumber}</p>
                          )}
                          {selectedRequest.approvedByManagerAt && (
                            <p className="text-[10px] text-slate-400 mt-0.5">{formatDate(selectedRequest.approvedByManagerAt)}</p>
                          )}
                        </>
                      ) : (
                        selectedRequest.rejectedBy === selectedRequest.requester ? null : (
                          <>
                            <span className="absolute left-[-31px] top-0.5 w-4.5 h-4.5 rounded-full bg-red-600 text-white flex items-center justify-center text-[9px] font-bold">✕</span>
                            <p className="font-bold text-red-700">Ditolak oleh {selectedRequest.rejectedBy}</p>
                            {selectedRequest.rejectionReason && (
                              <p className="text-slate-600 mt-1 italic font-medium bg-red-50 p-2 rounded-xl border border-red-100">Alasan: "{selectedRequest.rejectionReason}"</p>
                            )}
                            {selectedRequest.rejectedAt && (
                              <p className="text-[10px] text-slate-400 mt-0.5">{formatDate(selectedRequest.rejectedAt)}</p>
                            )}
                          </>
                        )
                      )}
                    </div>
                  )}

                  {/* Step 3: Owner Final ACC */}
                  {selectedRequest.status === "ACC Final" && (
                    <div className="relative">
                      <span className="absolute left-[-31px] top-0.5 w-4.5 h-4.5 rounded-full bg-emerald-600 text-white flex items-center justify-center text-[9px] font-bold">✓✓</span>
                      <p className="font-bold text-emerald-700">Final Approval Direktur</p>
                      <p className="text-slate-500 mt-0.5">Disetujui akhir oleh {selectedRequest.approvedByOwner}</p>
                      {selectedRequest.approvedByOwnerAt && (
                        <p className="text-[10px] text-slate-400 mt-0.5">{formatDate(selectedRequest.approvedByOwnerAt)}</p>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="p-6 bg-slate-50 border-t border-slate-100 shrink-0">
              <button
                onClick={() => setSelectedRequest(null)}
                className="w-full bg-slate-900 hover:bg-slate-800 text-white py-3 rounded-xl font-bold text-xs transition-colors cursor-pointer"
              >
                Tutup Detail
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ==================== Sub-Components ====================

function RequestCard({
  req,
  showActions,
  role,
  onApprove,
  onReject,
}: {
  req: PurchaseRequest;
  showActions: boolean;
  role?: UserRole;
  onApprove?: () => void;
  onReject?: () => void;
}) {
  const isManager = role === "Manager";

  return (
    <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden hover:border-indigo-300 transition-all group shadow-sm hover:shadow-xl hover:shadow-indigo-500/5">
      <div className="p-6">
        {/* Top Info */}
        <div className="flex justify-between items-start mb-4">
          <div className="space-y-1">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{req.id}</p>
            <h3 className="text-xl font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">{req.item}</h3>
          </div>
          <StatusBadge status={req.status} />
        </div>

        {/* Details Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 py-4 border-y border-slate-50 mb-6">
          <DetailBox label="Jumlah" value={req.quantity} />
          <DetailBox label="Estimasi" value={formatCurrency(req.amount)} highlight />
          <DetailBox label="Pemohon" value={req.requester} />
          <DetailBox label="Tanggal" value={req.date} />
        </div>

        <div className="mb-6">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Keterangan</p>
          <p className="text-sm text-slate-600 bg-slate-50 p-3 rounded-xl border border-slate-100">{req.description}</p>
        </div>

        {/* Approval trail */}
        {(req.notaNumber || req.approvedByManager || req.approvedByOwner || req.rejectedBy) && (
          <div className="bg-slate-50 rounded-xl p-4 mb-6 space-y-2 border border-slate-100">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Jejak Approval</p>
            {req.notaNumber && (
              <p className="text-xs text-indigo-600 font-bold">📝 Nota: {req.notaNumber}</p>
            )}
            {req.approvedByManager && (
              <p className="text-xs text-blue-600">✓ ACC Manager: {req.approvedByManager} — {formatDate(req.approvedByManagerAt)}</p>
            )}
            {req.approvedByOwner && (
              <p className="text-xs text-emerald-600">✓✓ ACC Direktur: {req.approvedByOwner} — {formatDate(req.approvedByOwnerAt)}</p>
            )}
            {req.rejectedBy && (
              <p className="text-xs text-red-600">✕ Ditolak: {req.rejectedBy} — {formatDate(req.rejectedAt)}</p>
            )}
          </div>
        )}

        {/* Manager info box */}
        {showActions && isManager && req.status === "Pending" && (
          <div className="bg-indigo-50/50 rounded-xl p-4 mb-6 border border-indigo-100 flex items-center gap-4">
            <div className="w-10 h-10 bg-indigo-600 text-white rounded-lg flex items-center justify-center text-xl">📝</div>
            <div>
              <p className="text-sm font-bold text-indigo-900">Validasi Pengajuan</p>
              <p className="text-xs text-indigo-700">Dengan menyetujui, Anda menyatakan barang ini diperlukan dan siap diterbitkan Nota.</p>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        {showActions && (
          <div className="flex gap-3">
            <button
              onClick={onApprove}
              className="flex-1 bg-slate-900 hover:bg-indigo-600 text-white py-3 rounded-xl font-bold text-sm transition-all shadow-lg shadow-slate-200 flex items-center justify-center gap-2"
            >
              {isManager ? "✓ Setujui & Buat Nota" : "✓ Final Approval"}
            </button>
            <button
              onClick={onReject}
              className="px-6 py-3 bg-white hover:bg-red-50 text-red-600 border border-red-100 rounded-xl font-bold text-sm transition-all"
            >
              Tolak
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

function StatusBadge({ status }: { status: ApprovalStatus }) {
  const labels: Record<ApprovalStatus, string> = {
    "Pending": "MENUNGGU MANAGER",
    "ACC Manager": "MENUNGGU DIREKTUR",
    "ACC Final": "DISETUJUI",
    "Tolak": "DITOLAK",
  };

  return (
    <div className={`px-3 py-1 rounded-full border text-[10px] font-bold ${getStatusStyle(status)}`}>
      {labels[status]}
    </div>
  );
}

function WorkflowStep({ num, title, desc, active, completed }: { num: string; title: string; desc: string; active: boolean; completed: boolean }) {
  return (
    <div className={`flex items-center gap-3 p-4 rounded-2xl border transition-all ${active ? "bg-indigo-600 border-indigo-600 text-white shadow-lg shadow-indigo-200 scale-105 z-10" : completed ? "bg-emerald-50 border-emerald-100 text-slate-900" : "bg-white border-slate-100 text-slate-400"}`}>
      <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${active ? "bg-white text-indigo-600" : completed ? "bg-emerald-600 text-white" : "bg-slate-100 text-slate-400"}`}>
        {completed && !active ? "✓" : num}
      </div>
      <div>
        <p className="text-xs font-bold uppercase tracking-tight">{title}</p>
        <p className={`text-[10px] ${active ? "text-indigo-100" : "text-slate-500"}`}>{desc}</p>
      </div>
    </div>
  );
}

function DetailBox({ label, value, highlight = false }: { label: string; value: string; highlight?: boolean }) {
  return (
    <div className="space-y-1">
      <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">{label}</p>
      <p className={`text-sm font-bold ${highlight ? "text-indigo-600" : "text-slate-900"}`}>{value}</p>
    </div>
  );
}

function EmptyState({ icon, title, description }: { icon: string; title: string; description: string }) {
  return (
    <div className="bg-white border-2 border-dashed border-slate-200 rounded-3xl p-12 text-center">
      <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4 text-3xl">{icon}</div>
      <h3 className="text-xl font-bold text-slate-900">{title}</h3>
      <p className="text-slate-500 mt-2">{description}</p>
    </div>
  );
}

// ==================== Utilities ====================

function getStatusStyle(status: ApprovalStatus): string {
  switch (status) {
    case "Pending": return "bg-amber-50 text-amber-700 border-amber-200";
    case "ACC Manager": return "bg-blue-50 text-blue-700 border-blue-200";
    case "ACC Final": return "bg-emerald-50 text-emerald-700 border-emerald-200";
    case "Tolak": return "bg-red-50 text-red-700 border-red-200";
  }
}

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR" }).format(amount);
}

function formatDate(dateStr?: string): string {
  if (!dateStr) return "";
  try {
    return new Date(dateStr).toLocaleDateString("id-ID", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return dateStr;
  }
}