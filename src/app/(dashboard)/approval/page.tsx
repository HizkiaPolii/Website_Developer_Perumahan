"use client";

import React, { useState, useEffect } from "react";
import { useToast } from "@/contexts/ToastContext";
import { useConfirmDialog } from "@/contexts/ConfirmDialogContext";

type Role = "Admin" | "Marketing" | "Manager" | "Owner";
type Status = "Pending" | "ACC Manager" | "ACC Final" | "Tolak";

interface Booking {
  id: string;
  buyer: string;
  unitId: string;
  phone: string;
  status: Status;
  marketing: string;
  date: string;
  email: string;
}

export default function ApprovalPage() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [role, setRole] = useState<Role>("Manager");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const { addToast } = useToast();
  const { confirm } = useConfirmDialog();

  // Mock data untuk development
  const mockBookings: Booking[] = [
    { id: "BK001", buyer: "John Doe", unitId: "1", phone: "081234567890", status: "Pending", marketing: "Ahmad", date: "2025-01-15", email: "john@example.com" },
    { id: "BK002", buyer: "Jane Smith", unitId: "2", phone: "081234567891", status: "ACC Manager", marketing: "Budi", date: "2025-01-16", email: "jane@example.com" },
  ];

  // Fetch bookings dari API
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem("token");
        
        if (!token) {
          setError("Token tidak ditemukan. Silakan login kembali.");
          setLoading(false);
          return;
        }

        // TODO: Replace dengan endpoint API yang sebenarnya
        const response = await fetch("/api/bookings", {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });
        
        if (!response.ok) {
          console.warn("API /api/bookings tidak tersedia, menggunakan mock data");
          setBookings(mockBookings);
        } else {
          const data = await response.json();
          setBookings(data);
        }

        // Get role dari localStorage (disimpan saat login)
        const storedUser = localStorage.getItem("user");
        if (storedUser) {
          try {
            const userData = JSON.parse(storedUser);
            if (userData.role && ["Manager", "Owner"].includes(userData.role)) {
              setRole(userData.role);
            }
          } catch (err) {
            console.warn("Gagal parse user data:", err);
          }
        }
      } catch (err) {
        console.warn("Gagal fetch dari API, menggunakan mock data:", err);
        setBookings(mockBookings);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleApprove = async (id: string, nextStatus: Status) => {
    const booking = bookings.find(b => b.id === id);
    if (!booking) return;

    const isReject = nextStatus === "Tolak";
    const title = isReject ? "Reject Booking?" : role === "Manager" ? "Approve untuk Manager?" : "Final Approval?";
    const message = isReject 
      ? `Apakah Anda yakin ingin menolak booking ${booking.id} atas nama ${booking.buyer}?`
      : `Apakah Anda yakin ingin ${role === "Manager" ? "approve" : "final approve"} booking ${booking.id} atas nama ${booking.buyer}?`;

    const confirmed = await confirm({
      title,
      message,
      confirmText: isReject ? "Ya, Tolak" : "Ya, Approve",
      cancelText: "Batal",
      type: isReject ? "danger" : "warning"
    });

    if (!confirmed) return;

    // TODO: Send approval ke API endpoint /api/bookings/{id}/approve
    // Update state locally untuk UI feedback
    setBookings(prev => prev.map(b => b.id === id ? { ...b, status: nextStatus } : b));

    const toastMessage = isReject 
      ? `❌ Booking ${booking.id} telah ditolak`
      : role === "Manager"
      ? `✓ Booking ${booking.id} berhasil di-approve Manager`
      : `✓✓ Booking ${booking.id} berhasil di-approve Final`;

    addToast(toastMessage, isReject ? "error" : "success", 3000);
  };

  // Filter berdasarkan role
  const getManagerData = () => {
    const pending = bookings.filter(b => b.status === "Pending");
    const completed = bookings.filter(b => b.status === "ACC Manager" || b.status === "Tolak" || b.status === "ACC Final");
    return { pending, completed };
  };

  const getOwnerData = () => {
    const pending = bookings.filter(b => b.status === "ACC Manager");
    const completed = bookings.filter(b => b.status === "ACC Final" || b.status === "Tolak");
    return { pending, completed };
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin text-4xl mb-4">⏳</div>
          <p className="text-slate-600">Connecting to API...</p>
          <p className="text-xs text-slate-400 mt-2">Endpoint: /api/bookings</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="text-4xl mb-4">❌</div>
          <p className="text-red-600 font-bold">{error}</p>
          <p className="text-xs text-slate-400 mt-2">Periksa API endpoint: /api/bookings</p>
        </div>
      </div>
    );
  }

  const { pending: pendingBookings, completed: completedBookings } = role === "Manager" ? getManagerData() : getOwnerData();
  
  // Stats untuk Manager vs Owner berbeda
  const stats = role === "Manager" 
    ? {
        pending: bookings.filter(b => b.status === "Pending").length,
        processed: bookings.filter(b => b.status === "ACC Manager").length,
        total: bookings.length,
        label1: "Pending Approval",
        label2: "Manager Approved",
        action: "Manager Approval"
      }
    : {
        pending: bookings.filter(b => b.status === "ACC Manager").length,
        processed: bookings.filter(b => b.status === "ACC Final").length,
        total: bookings.length,
        label1: "Waiting for Owner",
        label2: "Owner Approved",
        action: "Owner Final Approval"
      };

  const getStatusColor = (status: Status) => {
    const colors = {
      "Pending": "bg-orange-50 text-orange-600 border-orange-200",
      "ACC Manager": "bg-indigo-50 text-indigo-600 border-indigo-200",
      "ACC Final": "bg-emerald-50 text-emerald-600 border-emerald-200",
      "Tolak": "bg-red-50 text-red-600 border-red-200",
    };
    return colors[status];
  };

  const getStatusIcon = (status: Status) => {
    const icons = {
      "Pending": "⏳",
      "ACC Manager": "✓",
      "ACC Final": "✓✓",
      "Tolak": "❌",
    };
    return icons[status];
  };

  return (
    <div className="space-y-8">
      {/* API Info */}
      <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
        <p className="text-xs font-bold text-amber-900">🔌 API Status</p>
        <p className="text-xs text-amber-800 mt-1">Role: {role} | Bookings: {bookings.length}</p>
        <p className="text-xs text-amber-700 mt-2">Endpoint: GET /api/bookings, POST /api/bookings/{'{id}'}/approve</p>
      </div>

      {/* Header */}
      <div>
        <h1 className="text-4xl font-bold text-slate-900">
          {role === "Manager" ? "👔 Approval Manager" : "👑 Final Approval Owner"}
        </h1>
        <p className="text-slate-500 mt-2">
          {role === "Manager" 
            ? "Validasi dan approval pengajuan booking dari tim Marketing - Tahap pertama approval"
            : "Final approval booking dari hasil validasi Manager - Tahap akhir approval"
          }
        </p>
      </div>

      {/* Stats - Role Specific */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <StatCard 
          icon={role === "Manager" ? "⏳" : "📋"} 
          label={stats.label1}
          value={stats.pending.toString()} 
          color={role === "Manager" ? "bg-orange-50 border-orange-200" : "bg-indigo-50 border-indigo-200"}
          textColor={role === "Manager" ? "text-orange-600" : "text-indigo-600"}
        />
        <StatCard 
          icon={role === "Manager" ? "✓" : "✓✓"} 
          label={stats.label2}
          value={stats.processed.toString()} 
          color={role === "Manager" ? "bg-indigo-50 border-indigo-200" : "bg-emerald-50 border-emerald-200"}
          textColor={role === "Manager" ? "text-indigo-600" : "text-emerald-600"}
        />
        <StatCard 
          icon="📊" 
          label="Total Bookings"
          value={stats.total.toString()} 
          color="bg-slate-100 border-slate-200"
          textColor="text-slate-700"
        />
      </div>

      {/* Workflow Info - Role Specific */}
      {role === "Manager" && (
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
          <h3 className="font-bold text-blue-900 mb-3">📋 Workflow Manager</h3>
          <p className="text-sm text-blue-800 mb-4">Anda bertugas untuk validasi booking dari tim marketing dan memberikan persetujuan tahap pertama.</p>
          <div className="flex items-center justify-between text-sm">
            <div className="text-center">
              <div className="text-2xl mb-1">1️⃣</div>
              <p className="font-bold text-slate-900">Booking Masuk</p>
              <p className="text-xs text-slate-600">Status: Pending</p>
            </div>
            <div className="text-blue-400 text-xl">→</div>
            <div className="text-center">
              <div className="text-2xl mb-1 bg-emerald-100 rounded-lg p-2 w-fit mx-auto">✓</div>
              <p className="font-bold text-slate-900">Anda Approve</p>
              <p className="text-xs text-slate-600">Status: ACC Manager</p>
            </div>
            <div className="text-blue-400 text-xl">→</div>
            <div className="text-center">
              <div className="text-2xl mb-1">3️⃣</div>
              <p className="font-bold text-slate-900">Owner Review</p>
              <p className="text-xs text-slate-600">Final Approval</p>
            </div>
          </div>
        </div>
      )}

      {role === "Owner" && (
        <div className="bg-purple-50 border border-purple-200 rounded-xl p-6">
          <h3 className="font-bold text-purple-900 mb-3">📋 Workflow Owner</h3>
          <p className="text-sm text-purple-800 mb-4">Anda bertugas untuk memberikan persetujuan final booking yang sudah divalidasi Manager. Setelah approval Anda, booking akan selesai.</p>
          <div className="flex items-center justify-between text-sm">
            <div className="text-center">
              <div className="text-2xl mb-1">1️⃣</div>
              <p className="font-bold text-slate-900">Manager Approved</p>
              <p className="text-xs text-slate-600">Status: ACC Manager</p>
            </div>
            <div className="text-purple-400 text-xl">→</div>
            <div className="text-center">
              <div className="text-2xl mb-1 bg-emerald-100 rounded-lg p-2 w-fit mx-auto">✓✓</div>
              <p className="font-bold text-slate-900">Anda Approve</p>
              <p className="text-xs text-slate-600">Status: ACC Final</p>
            </div>
            <div className="text-purple-400 text-xl">→</div>
            <div className="text-center">
              <div className="text-2xl mb-1">✨</div>
              <p className="font-bold text-slate-900">Booking Selesai</p>
              <p className="text-xs text-slate-600">Finalized</p>
            </div>
          </div>
        </div>
      )}

      {/* Pending Bookings Section - Role Specific */}
      <div>
        <h2 className="text-xl font-bold text-slate-900 mb-4">
          {role === "Manager" 
            ? `🔄 Booking Pending - Menunggu Validasi Anda (${pendingBookings.length})`
            : `📋 Manager Approved - Menunggu Final Approval Anda (${pendingBookings.length})`
          }
        </h2>
        
        {pendingBookings.length > 0 ? (
          <div className="space-y-4">
            {pendingBookings.map((booking) => (
              <div key={booking.id} className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden hover:shadow-md transition-shadow">
                <div className="p-6">
                  {/* Top Row - ID, Status, Date */}
                  <div className="flex items-start justify-between gap-4 mb-4">
                    <div className="flex items-center gap-3">
                      <span className="text-xs font-bold text-indigo-600 bg-indigo-50 px-3 py-1.5 rounded-lg border border-indigo-100">
                        {booking.id}
                      </span>
                      <span className={`text-xs font-bold px-3 py-1.5 rounded-lg border ${getStatusColor(booking.status)}`}>
                        {getStatusIcon(booking.status)} {booking.status}
                      </span>
                    </div>
                    <span className="text-xs text-slate-500 font-medium">{booking.date}</span>
                  </div>

                  {/* Main Content - 2 Columns */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                    {/* Left - Buyer Info */}
                    <div className="space-y-3">
                      <div>
                        <p className="text-xs uppercase text-slate-500 font-bold tracking-wide">Nama Pembeli</p>
                        <p className="text-lg font-bold text-slate-900">{booking.buyer}</p>
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <p className="text-xs uppercase text-slate-500 font-bold">Telepon</p>
                          <p className="text-sm font-medium text-slate-900">{booking.phone}</p>
                        </div>
                        <div>
                          <p className="text-xs uppercase text-slate-500 font-bold">Email</p>
                          <p className="text-sm font-medium text-slate-900 truncate">{booking.email}</p>
                        </div>
                      </div>
                    </div>

                    {/* Right - Unit & Marketing Info */}
                    <div className="space-y-3 bg-slate-50 p-4 rounded-lg border border-slate-100">
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <p className="text-xs uppercase text-slate-500 font-bold">Unit</p>
                          <p className="text-lg font-bold text-indigo-600">{booking.unitId}</p>
                        </div>
                        <div>
                          <p className="text-xs uppercase text-slate-500 font-bold">Marketing</p>
                          <p className="text-sm font-medium text-slate-900">{booking.marketing}</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Action Buttons - Role Specific */}
                  <div className="flex gap-2 pt-4 border-t border-slate-100">
                    {role === "Manager" && booking.status === "Pending" && (
                      <>
                        <button
                          onClick={() => handleApprove(booking.id, "ACC Manager")}
                          className="flex-1 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-bold rounded-lg transition-all shadow-md shadow-emerald-200"
                        >
                          ✓ Approve (Manager)
                        </button>
                        <button
                          onClick={() => handleApprove(booking.id, "Tolak")}
                          className="flex-1 px-4 py-2.5 bg-red-50 hover:bg-red-100 text-red-600 text-sm font-bold rounded-lg transition-all border border-red-200"
                        >
                          ❌ Reject
                        </button>
                      </>
                    )}
                    {role === "Owner" && booking.status === "ACC Manager" && (
                      <>
                        <button
                          onClick={() => handleApprove(booking.id, "ACC Final")}
                          className="flex-1 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-bold rounded-lg transition-all shadow-md shadow-emerald-200"
                        >
                          ✓✓ Final Approval
                        </button>
                        <button
                          onClick={() => handleApprove(booking.id, "Tolak")}
                          className="flex-1 px-4 py-2.5 bg-red-50 hover:bg-red-100 text-red-600 text-sm font-bold rounded-lg transition-all border border-red-200"
                        >
                          ❌ Reject
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white p-12 rounded-xl border border-slate-200 text-center">
            <p className="text-lg text-slate-500 font-medium">
              {role === "Manager" ? "✓ Semua booking sudah divalidasi" : "✓ Semua booking sudah di-approve"}
            </p>
            <p className="text-sm text-slate-400 mt-1">
              {role === "Manager" ? "Tidak ada booking pending" : "Menunggu booking baru dari Manager"}
            </p>
          </div>
        )}
      </div>

      {/* Completed/History Bookings - Role Specific */}
      {completedBookings.length > 0 && (
        <div>
          <h2 className="text-xl font-bold text-slate-900 mb-4">
            {role === "Manager"
              ? `📊 History - ACC Manager & Rejected (${completedBookings.length})`
              : `✅ Completed - ACC Final & Rejected (${completedBookings.length})`
            }
          </h2>
          <p className="text-sm text-slate-500 mb-4">
            {role === "Manager"
              ? "Daftar booking yang sudah Anda approved atau reject - untuk preview/history"
              : "Daftar booking yang sudah selesai - semua booking sudah mendapat approval final atau di-reject"
            }
          </p>
          <div className="space-y-3">
            {completedBookings.map((booking) => (
              <div key={booking.id} className={`bg-white p-4 rounded-lg border flex items-center justify-between hover:bg-slate-50 transition-colors ${
                booking.status === "ACC Final" ? "border-emerald-200 bg-emerald-50/30" : "border-red-200 bg-red-50/30"
              }`}>
                <div className="flex items-center gap-3 flex-1">
                  <span className="text-xs font-bold text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded">{booking.id}</span>
                  <div>
                    <p className="font-bold text-slate-900">{booking.buyer}</p>
                    <p className="text-xs text-slate-500">{booking.unitId} • {booking.date}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  {booking.status === "ACC Final" && (
                    <span className="text-xs font-bold text-emerald-700 bg-emerald-100 px-3 py-1.5 rounded border border-emerald-200">
                      ✓✓ {booking.status}
                    </span>
                  )}
                  {booking.status === "Tolak" && (
                    <span className="text-xs font-bold text-red-700 bg-red-100 px-3 py-1.5 rounded border border-red-200">
                      ❌ {booking.status}
                    </span>
                  )}
                  {booking.status === "ACC Manager" && (
                    <span className="text-xs font-bold text-indigo-700 bg-indigo-100 px-3 py-1.5 rounded border border-indigo-200">
                      ✓ {booking.status}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function StatCard({ icon, label, value, color, textColor }: { icon: string; label: string; value: string; color: string; textColor: string }) {
  return (
    <div className={`${color} border p-5 rounded-lg shadow-sm`}>
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-xs font-bold text-slate-600 uppercase tracking-wider">{label}</p>
          <p className={`text-3xl font-bold mt-2 ${textColor}`}>{value}</p>
        </div>
        <span className="text-2xl">{icon}</span>
      </div>
    </div>
  );
}