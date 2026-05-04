"use client";

import React, { useState, useEffect } from "react";
import { useToast } from "@/contexts/ToastContext";
import { useConfirmDialog } from "@/contexts/ConfirmDialogContext";

type Role = "Admin" | "Manager" | "Owner";
type Status = "Pending" | "ACC Manager" | "ACC Final" | "Tolak";

interface PurchaseRequest {
  id: string;
  item: string;
  quantity: string;
  amount: number;
  requester: string;
  department: string;
  date: string;
  status: Status;
  description: string;
  notaNumber?: string;
}

export default function ApprovalPage() {
  const [requests, setRequests] = useState<PurchaseRequest[]>([]);
  const [role, setRole] = useState<Role>("Manager");
  const [loading, setLoading] = useState(true);
  const { addToast } = useToast();
  const { confirm } = useConfirmDialog();

  // Mock data untuk pengadaan barang
  const mockRequests: PurchaseRequest[] = [
    { 
      id: "PR-2024-001", 
      item: "Semen Tiga Roda", 
      quantity: "50 Sak", 
      amount: 3250000, 
      requester: "Eko (Logistik)", 
      department: "Pembangunan Tahap 1", 
      date: "2024-05-01", 
      status: "Pending",
      description: "Kebutuhan pengecoran pondasi blok A"
    },
    { 
      id: "PR-2024-002", 
      item: "Besi 10mm", 
      quantity: "100 Batang", 
      amount: 8500000, 
      requester: "Budi (Site Manager)", 
      department: "Pembangunan Tahap 2", 
      date: "2024-05-02", 
      status: "ACC Manager",
      description: "Penambahan stok besi untuk kolom",
      notaNumber: "NTA-5521"
    },
    { 
      id: "PR-2024-003", 
      item: "Pasir Cor", 
      quantity: "2 Truk", 
      amount: 4000000, 
      requester: "Eko (Logistik)", 
      department: "Pembangunan Tahap 1", 
      date: "2024-04-28", 
      status: "ACC Final",
      description: "Pasir untuk plester dinding",
      notaNumber: "NTA-5510"
    },
  ];

  useEffect(() => {
    // Simulasi fetch data
    const timer = setTimeout(() => {
      setRequests(mockRequests);
      setLoading(false);
      
      // Get role dari localStorage jika ada
      const storedUser = localStorage.getItem("user");
      if (storedUser) {
        try {
          const userData = JSON.parse(storedUser);
          if (["Manager", "Owner"].includes(userData.role)) {
            setRole(userData.role);
          }
        } catch (e) {}
      }
    }, 800);
    return () => clearTimeout(timer);
  }, []);

  const handleApprove = async (id: string, nextStatus: Status) => {
    const request = requests.find(r => r.id === id);
    if (!request) return;

    const isReject = nextStatus === "Tolak";
    const title = isReject ? "Tolak Pengajuan?" : role === "Manager" ? "Approve & Buat Nota?" : "Final Approval Direktur?";
    const message = isReject 
      ? `Apakah Anda yakin ingin menolak pengajuan ${request.item} dari ${request.requester}?`
      : role === "Manager" 
        ? `Approve pengajuan ${request.item}. Sistem akan menggenerate nomor nota otomatis untuk diajukan ke Direktur.`
        : `Memberikan persetujuan akhir untuk pembayaran dan proses pengadaan ${request.item}.`;

    const confirmed = await confirm({
      title,
      message,
      confirmText: isReject ? "Ya, Tolak" : "Ya, Setujui",
      cancelText: "Batal",
      type: isReject ? "danger" : "success"
    });

    if (!confirmed) return;

    // Local update
    setRequests(prev => prev.map(r => {
      if (r.id === id) {
        const updated = { ...r, status: nextStatus };
        if (role === "Manager" && nextStatus === "ACC Manager") {
          updated.notaNumber = `NTA-${Math.floor(1000 + Math.random() * 9000)}`;
        }
        return updated;
      }
      return r;
    }));

    const toastMessage = isReject 
      ? `❌ Pengajuan ${request.id} ditolak`
      : role === "Manager"
      ? `✓ Approved! Nota ${request.id} telah dibuat dan diteruskan ke Direktur.`
      : `✓✓ Berhasil! Pengadaan ${request.item} telah disetujui Direktur.`;

    addToast(toastMessage, isReject ? "error" : "success", 3000);
  };

  const getManagerData = () => {
    const pending = requests.filter(r => r.status === "Pending");
    const history = requests.filter(r => r.status !== "Pending");
    return { pending, history };
  };

  const getOwnerData = () => {
    const pending = requests.filter(r => r.status === "ACC Manager");
    const history = requests.filter(r => r.status === "ACC Final" || r.status === "Tolak");
    return { pending, history };
  };

  if (loading) {
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

  const { pending, history } = role === "Manager" ? getManagerData() : getOwnerData();

  const getStatusStyle = (status: Status) => {
    switch (status) {
      case "Pending": return "bg-amber-50 text-amber-700 border-amber-200";
      case "ACC Manager": return "bg-blue-50 text-blue-700 border-blue-200";
      case "ACC Final": return "bg-emerald-50 text-emerald-700 border-emerald-200";
      case "Tolak": return "bg-red-50 text-red-700 border-red-200";
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-20">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="px-3 py-1 bg-indigo-600 text-white text-[10px] font-bold rounded-full uppercase tracking-widest">
              {role} Dashboard
            </span>
          </div>
          <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight">
            Approval <span className="text-indigo-600">Pengadaan Barang</span>
          </h1>
          <p className="text-slate-500 mt-2 max-w-2xl">
            {role === "Manager" 
              ? "Review permintaan barang dari tim lapangan, validasi jumlah, dan terbitkan nota untuk persetujuan Direktur."
              : "Persetujuan akhir (Final ACC) untuk pengajuan barang yang telah divalidasi oleh Manager."
            }
          </p>
        </div>
        
        {/* Role Switcher (For Demo/Dev) */}
        <div className="flex bg-slate-100 p-1 rounded-xl border border-slate-200">
          <button 
            onClick={() => setRole("Manager")}
            className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${role === "Manager" ? "bg-white shadow-sm text-indigo-600" : "text-slate-500 hover:text-slate-700"}`}
          >
            Manager
          </button>
          <button 
            onClick={() => setRole("Owner")}
            className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${role === "Owner" ? "bg-white shadow-sm text-indigo-600" : "text-slate-500 hover:text-slate-700"}`}
          >
            Direktur
          </button>
        </div>
      </div>

      {/* Workflow Indicator */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <WorkflowStep 
          num="1" 
          title="Pengajuan" 
          desc="Tim Lapangan" 
          active={true} 
          completed={true}
        />
        <WorkflowStep 
          num="2" 
          title="Validasi & Nota" 
          desc="Manager" 
          active={role === "Manager"} 
          completed={requests.some(r => r.status !== "Pending")}
        />
        <WorkflowStep 
          num="3" 
          title="Final Approval" 
          desc="Direktur/Owner" 
          active={role === "Owner"} 
          completed={requests.some(r => r.status === "ACC Final")}
        />
        <WorkflowStep 
          num="4" 
          title="Pembelian" 
          desc="Logistik" 
          active={false} 
          completed={false}
        />
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column: Pending List */}
        <div className="lg:col-span-2 space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
              <span className="w-8 h-8 bg-amber-100 text-amber-600 rounded-lg flex items-center justify-center text-sm">⏳</span>
              Menunggu Persetujuan ({pending.length})
            </h2>
          </div>

          {pending.length > 0 ? (
            <div className="space-y-4">
              {pending.map((req) => (
                <div key={req.id} className="bg-white rounded-2xl border border-slate-200 overflow-hidden hover:border-indigo-300 transition-all group shadow-sm hover:shadow-xl hover:shadow-indigo-500/5">
                  <div className="p-6">
                    {/* Top Info */}
                    <div className="flex justify-between items-start mb-4">
                      <div className="space-y-1">
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{req.id}</p>
                        <h3 className="text-xl font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">{req.item}</h3>
                      </div>
                      <div className={`px-3 py-1 rounded-full border text-[10px] font-bold ${getStatusStyle(req.status)}`}>
                        {req.status === "Pending" ? "MENUNGGU MANAGER" : "MENUNGGU DIREKTUR"}
                      </div>
                    </div>

                    {/* Details Grid */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 py-4 border-y border-slate-50 mb-6">
                      <DetailBox label="Jumlah" value={req.quantity} />
                      <DetailBox label="Estimasi" value={new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(req.amount)} highlight />
                      <DetailBox label="Pemohon" value={req.requester} />
                      <DetailBox label="Tanggal" value={req.date} />
                    </div>

                    <div className="mb-6">
                      <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Keterangan</p>
                      <p className="text-sm text-slate-600 bg-slate-50 p-3 rounded-xl border border-slate-100">{req.description}</p>
                    </div>

                    {/* Manager Specific: Show Nota creation logic */}
                    {role === "Manager" && req.status === "Pending" && (
                      <div className="bg-indigo-50/50 rounded-xl p-4 mb-6 border border-indigo-100 flex items-center gap-4">
                        <div className="w-10 h-10 bg-indigo-600 text-white rounded-lg flex items-center justify-center text-xl">📝</div>
                        <div>
                          <p className="text-sm font-bold text-indigo-900">Validasi Pengajuan</p>
                          <p className="text-xs text-indigo-700">Dengan menyetujui, Anda menyatakan barang ini diperlukan dan siap diterbitkan Nota.</p>
                        </div>
                      </div>
                    )}

                    {/* Action Buttons */}
                    <div className="flex gap-3">
                      <button 
                        onClick={() => handleApprove(req.id, role === "Manager" ? "ACC Manager" : "ACC Final")}
                        className="flex-1 bg-slate-900 hover:bg-indigo-600 text-white py-3 rounded-xl font-bold text-sm transition-all shadow-lg shadow-slate-200 flex items-center justify-center gap-2"
                      >
                        {role === "Manager" ? "✓ Setujui & Buat Nota" : "✓ Final Approval"}
                      </button>
                      <button 
                        onClick={() => handleApprove(req.id, "Tolak")}
                        className="px-6 py-3 bg-white hover:bg-red-50 text-red-600 border border-red-100 rounded-xl font-bold text-sm transition-all"
                      >
                        Tolak
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-white border-2 border-dashed border-slate-200 rounded-3xl p-12 text-center">
              <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4 text-3xl">✨</div>
              <h3 className="text-xl font-bold text-slate-900">Semua Beres!</h3>
              <p className="text-slate-500 mt-2">Tidak ada pengajuan yang perlu diproses saat ini.</p>
            </div>
          )}
        </div>

        {/* Right Column: History & Stats */}
        <div className="space-y-6">
          {/* Stats Card */}
          <div className="bg-slate-900 rounded-3xl p-6 text-white shadow-xl shadow-slate-200">
            <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
              <span className="text-indigo-400">📊</span> Ringkasan
            </h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center pb-4 border-b border-white/10">
                <p className="text-slate-400 text-sm">Total Pengajuan</p>
                <p className="text-xl font-bold">{requests.length}</p>
              </div>
              <div className="flex justify-between items-center pb-4 border-b border-white/10">
                <p className="text-slate-400 text-sm">Disetujui Final</p>
                <p className="text-xl font-bold text-emerald-400">{requests.filter(r => r.status === "ACC Final").length}</p>
              </div>
              <div className="flex justify-between items-center">
                <p className="text-slate-400 text-sm">Ditolak</p>
                <p className="text-xl font-bold text-red-400">{requests.filter(r => r.status === "Tolak").length}</p>
              </div>
            </div>
          </div>

          {/* History List */}
          <div>
            <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
              <span className="w-8 h-8 bg-indigo-100 text-indigo-600 rounded-lg flex items-center justify-center text-sm">📜</span>
              Riwayat
            </h3>
            <div className="space-y-3">
              {history.map((req) => (
                <div key={req.id} className="bg-white p-4 rounded-2xl border border-slate-100 hover:border-slate-200 transition-colors shadow-sm">
                  <div className="flex justify-between items-start mb-2">
                    <span className="text-[10px] font-bold text-slate-400">{req.id}</span>
                    <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold border ${getStatusStyle(req.status)}`}>
                      {req.status}
                    </span>
                  </div>
                  <p className="font-bold text-slate-900 text-sm">{req.item}</p>
                  <p className="text-[10px] text-slate-500 mt-1">{req.quantity} • {req.date}</p>
                  {req.notaNumber && (
                    <div className="mt-2 pt-2 border-t border-slate-50 flex items-center gap-1">
                      <span className="text-[10px] font-bold text-indigo-600">Nota: {req.notaNumber}</span>
                    </div>
                  )}
                </div>
              ))}
              {history.length === 0 && (
                <p className="text-center py-8 text-slate-400 text-sm italic">Belum ada riwayat</p>
              )}
            </div>
          </div>

          {/* Nota Mockup Preview Card */}
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
      </div>
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