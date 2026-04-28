"use client";

import React, { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/contexts/ToastContext";
import { Loader, ChevronLeft, ChevronRight } from "lucide-react";

interface ActivityLog {
  id: number;
  userId: number;
  action: string;
  details: string;
  createdAt: string;
  user: {
    id: number;
    name: string;
    email: string;
    role: string;
  };
}

export default function ActivityLogPage() {
  const { token } = useAuth();
  const { addToast } = useToast();
  const [activities, setActivities] = useState<ActivityLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [total, setTotal] = useState(0);

  // Fetch activity logs
  useEffect(() => {
    const fetchActivities = async () => {
      try {
        setLoading(true);
        setError(null);

        if (!token) {
          setError("Token tidak ditemukan. Silakan login kembali.");
          setLoading(false);
          return;
        }

        const response = await fetch(
          `http://localhost:5000/api/activity-logs?page=${page}&limit=${limit}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );

        if (!response.ok) {
          throw new Error("Gagal mengambil activity logs");
        }

        const data = await response.json();
        setActivities(data.data || []);
        setTotal(data.pagination?.total || 0);
      } catch (err) {
        console.error("Fetch activity logs error:", err);
        setError("Gagal mengambil activity logs dari server");
        addToast("❌ Gagal memuat activity log", "error", 3000);
      } finally {
        setLoading(false);
      }
    };

    fetchActivities();
  }, [page, token, addToast]);

  const getActivityIcon = (action: string) => {
    const icons: Record<string, string> = {
      LOGIN: "🔓",
      REGISTER: "📝",
      CREATE_USER: "👤",
      UPDATE_USER: "✏️",
      DELETE_USER: "🗑️",
      CREATE_BOOKING: "📅",
      APPROVE_BOOKING: "✓",
      REJECT_BOOKING: "❌",
      CANCEL_BOOKING: "⛔",
      CREATE_UNIT: "🏠",
      UPDATE_UNIT: "🔨",
      DELETE_UNIT: "🗑️",
    };
    return icons[action] || "📊";
  };

  const getActivityColor = (action: string) => {
    const colors: Record<string, string> = {
      LOGIN: "bg-green-50 border-green-200",
      REGISTER: "bg-blue-50 border-blue-200",
      CREATE_USER: "bg-indigo-50 border-indigo-200",
      UPDATE_USER: "bg-amber-50 border-amber-200",
      DELETE_USER: "bg-red-50 border-red-200",
      CREATE_BOOKING: "bg-blue-50 border-blue-200",
      APPROVE_BOOKING: "bg-emerald-50 border-emerald-200",
      REJECT_BOOKING: "bg-red-50 border-red-200",
      CANCEL_BOOKING: "bg-orange-50 border-orange-200",
      CREATE_UNIT: "bg-purple-50 border-purple-200",
      UPDATE_UNIT: "bg-amber-50 border-amber-200",
      DELETE_UNIT: "bg-red-50 border-red-200",
    };
    return colors[action] || "bg-slate-50 border-slate-200";
  };

  const getActionLabel = (action: string) => {
    const labels: Record<string, string> = {
      LOGIN: "Login",
      REGISTER: "Register",
      CREATE_USER: "Buat User",
      UPDATE_USER: "Update User",
      DELETE_USER: "Hapus User",
      CREATE_BOOKING: "Buat Booking",
      APPROVE_BOOKING: "Approve Booking",
      REJECT_BOOKING: "Reject Booking",
      CANCEL_BOOKING: "Cancel Booking",
      CREATE_UNIT: "Buat Unit",
      UPDATE_UNIT: "Update Unit",
      DELETE_UNIT: "Hapus Unit",
    };
    return labels[action] || action;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString("id-ID", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const totalPages = Math.ceil(total / limit);

  return (
    <div className="space-y-4 sm:space-y-6 animate-fade-in">
      {/* Header */}
      <div className="animate-slide-in-down">
        <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-slate-900">📋 Activity Log</h1>
        <p className="text-xs sm:text-sm text-slate-600 mt-2">Riwayat semua aktivitas user di sistem - login, user management, booking, dan lainnya</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <StatCard
          icon="📊"
          label="Total Aktivitas"
          value={total.toString()}
          color="bg-slate-50 border-slate-200"
          textColor="text-slate-700"
          delay="0"
        />
        <StatCard
          icon="✓"
          label="Approve"
          value={activities.filter(a => a.action === "APPROVE_BOOKING").length.toString()}
          color="bg-emerald-50 border-emerald-200"
          textColor="text-emerald-600"
          delay="50"
        />
        <StatCard
          icon="❌"
          label="Reject"
          value={activities.filter(a => a.action === "REJECT_BOOKING").length.toString()}
          color="bg-red-50 border-red-200"
          textColor="text-red-600"
          delay="100"
        />
        <StatCard
          icon="🔓"
          label="Login"
          value={activities.filter(a => a.action === "LOGIN").length.toString()}
          color="bg-green-50 border-green-200"
          textColor="text-green-600"
          delay="150"
        />
      </div>

      {/* Activity List */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-4 sm:p-6 border-b border-slate-200 bg-slate-50">
          <h2 className="text-lg font-bold text-slate-900">Recent Activities ({total})</h2>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <Loader className="w-8 h-8 animate-spin text-blue-500 mx-auto mb-3" />
              <p className="text-slate-600 text-sm">Mengambil activity logs...</p>
            </div>
          </div>
        )}

        {/* Error State */}
        {error && !loading && (
          <div className="p-6 text-center">
            <div className="text-4xl mb-3">❌</div>
            <p className="text-red-600 font-bold text-sm">{error}</p>
          </div>
        )}

        {/* Desktop Table View */}
        {!loading && !error && (
          <>
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-50 border-b border-slate-200">
                  <tr>
                    <th className="p-4 text-xs uppercase font-bold text-slate-500">Action</th>
                    <th className="p-4 text-xs uppercase font-bold text-slate-500">User</th>
                    <th className="p-4 text-xs uppercase font-bold text-slate-500">Email</th>
                    <th className="p-4 text-xs uppercase font-bold text-slate-500">Role</th>
                    <th className="p-4 text-xs uppercase font-bold text-slate-500">Details</th>
                    <th className="p-4 text-xs uppercase font-bold text-slate-500">Waktu</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {activities.length > 0 ? (
                    activities.map((activity, index) => (
                      <tr
                        key={activity.id}
                        className="hover:bg-slate-50 transition-all duration-200 animate-slide-in-up"
                        style={{ animationDelay: `${index * 30}ms` }}
                      >
                        <td className="p-4">
                          <div className="flex items-center gap-2">
                            <span className="text-lg">{getActivityIcon(activity.action)}</span>
                            <span className="font-semibold text-slate-900 text-xs">{getActionLabel(activity.action)}</span>
                          </div>
                        </td>
                        <td className="p-4 font-semibold text-slate-900 text-sm">{activity.user.name}</td>
                        <td className="p-4 text-slate-600 text-xs">{activity.user.email}</td>
                        <td className="p-4">
                          <span className="inline-block px-2.5 py-1 rounded-lg text-xs font-bold bg-indigo-100 text-indigo-700">
                            {activity.user.role}
                          </span>
                        </td>
                        <td className="p-4 text-slate-600 text-xs max-w-xs truncate">{activity.details}</td>
                        <td className="p-4 text-slate-500 text-xs whitespace-nowrap">{formatDate(activity.createdAt)}</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={6} className="p-8 text-center text-slate-500">
                        Tidak ada activity log
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Mobile Card View */}
            <div className="md:hidden divide-y divide-slate-100">
              {activities.length > 0 ? (
                activities.map((activity, index) => (
                  <div
                    key={activity.id}
                    className={`p-4 hover:bg-slate-50 transition-all duration-200 animate-slide-in-right ${getActivityColor(activity.action)}`}
                    style={{ animationDelay: `${index * 30}ms` }}
                  >
                    <div className="space-y-2">
                      {/* Header */}
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <span className="text-xl">{getActivityIcon(activity.action)}</span>
                          <div>
                            <p className="font-bold text-slate-900 text-sm">{getActionLabel(activity.action)}</p>
                            <p className="text-xs text-slate-600">ID: {activity.id}</p>
                          </div>
                        </div>
                        <span className="inline-block px-2 py-1 rounded-lg text-xs font-bold bg-indigo-100 text-indigo-700 shrink-0">
                          {activity.user.role}
                        </span>
                      </div>

                      {/* Details */}
                      <div className="space-y-1 text-xs">
                        <div className="flex gap-2">
                          <span className="font-semibold text-slate-600 min-w-[60px]">User:</span>
                          <span className="text-slate-700">{activity.user.name}</span>
                        </div>
                        <div className="flex gap-2">
                          <span className="font-semibold text-slate-600 min-w-[60px]">Email:</span>
                          <span className="text-slate-700 break-all">{activity.user.email}</span>
                        </div>
                        <div className="flex gap-2">
                          <span className="font-semibold text-slate-600 min-w-[60px]">Details:</span>
                          <span className="text-slate-700">{activity.details}</span>
                        </div>
                        <div className="flex gap-2 pt-1">
                          <span className="font-semibold text-slate-600 min-w-[60px]">Waktu:</span>
                          <span className="text-slate-600">{formatDate(activity.createdAt)}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-8 text-center text-slate-500">
                  Tidak ada activity log
                </div>
              )}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="p-4 border-t border-slate-200 flex items-center justify-between">
                <button
                  onClick={() => setPage(Math.max(1, page - 1))}
                  disabled={page === 1}
                  className="flex items-center gap-2 px-3 py-2 rounded-lg border border-slate-300 text-sm font-bold text-slate-600 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                >
                  <ChevronLeft className="w-4 h-4" />
                  Sebelumnya
                </button>

                <span className="text-sm font-bold text-slate-600">
                  Halaman {page} dari {totalPages}
                </span>

                <button
                  onClick={() => setPage(Math.min(totalPages, page + 1))}
                  disabled={page === totalPages}
                  className="flex items-center gap-2 px-3 py-2 rounded-lg border border-slate-300 text-sm font-bold text-slate-600 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                >
                  Selanjutnya
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

function StatCard({
  icon,
  label,
  value,
  color,
  textColor,
  delay,
}: {
  icon: string;
  label: string;
  value: string;
  color: string;
  textColor: string;
  delay: string;
}) {
  return (
    <div
      className={`${color} border p-4 sm:p-5 rounded-lg shadow-sm animate-slide-in-up`}
      style={{ animationDelay: `${delay}ms` }}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-xs font-bold text-slate-600 uppercase tracking-wider">{label}</p>
          <p className={`text-2xl sm:text-3xl font-bold mt-2 ${textColor}`}>{value}</p>
        </div>
        <span className="text-xl sm:text-2xl">{icon}</span>
      </div>
    </div>
  );
}
