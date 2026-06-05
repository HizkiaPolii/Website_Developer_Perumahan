"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { 
  Search, Filter, RefreshCw, FileText, Calendar, Info, 
  Key, PlusCircle, CheckCircle, Edit, Trash2, XCircle, 
  Loader2, UserPlus, ShieldAlert
} from "lucide-react";
import { useToast } from "@/contexts/ToastContext";
import { useAuth } from "@/contexts/AuthContext";
import { useApi } from "@/hooks/useApi";
import { useUsers } from "@/hooks/useApiEndpoints";
import { PageHeader, Card } from "@/components/finance-ui";
import { Pagination } from "@/components/Pagination";

interface ActivityLogEntry {
  id: number;
  userId: number;
  action: string;
  details: string | null;
  createdAt: string;
  user: {
    id: number;
    name: string;
    email: string;
    role: string;
  };
}

interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

function ActivityLogContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const userIdParam = searchParams.get("userId");

  const { user: currentUser, isLoading: isAuthLoading } = useAuth();
  const { call } = useApi();
  const { getAll: getAllUsers } = useUsers();
  const { addToast } = useToast();

  const [logs, setLogs] = useState<ActivityLogEntry[]>([]);
  const [usersList, setUsersList] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Filters (initially filtered by URL parameter if present)
  const [selectedUserId, setSelectedUserId] = useState<string>(userIdParam || "All");
  const [selectedAction, setSelectedAction] = useState<string>("All");
  const [searchAction, setSearchAction] = useState<string>("");

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [pagination, setPagination] = useState<PaginationMeta>({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 1,
  });

  // Action types list
  const actionTypes = [
    { value: "LOGIN", label: "🔑 Login" },
    { value: "REGISTER", label: "👤 Registrasi" },
    { value: "CREATE_USER", label: "➕ Tambah User" },
    { value: "UPDATE_USER", label: "✏️ Edit User" },
    { value: "DELETE_USER", label: "🗑️ Hapus User" },
  ];

  // Role Guard
  useEffect(() => {
    if (!isAuthLoading && currentUser) {
      const role = currentUser.role?.toLowerCase();
      if (role !== "owner" && role !== "admin") {
        addToast("Anda tidak memiliki akses ke halaman ini", "error");
        router.replace("/");
      }
    }
  }, [currentUser, isAuthLoading, router, addToast]);

  // Load list of users for filter
  useEffect(() => {
    const loadUsers = async () => {
      try {
        const data = await getAllUsers();
        if (data) {
          setUsersList(data);
        }
      } catch (err) {
        console.error("Gagal memuat daftar user:", err);
      }
    };

    if (!isAuthLoading && currentUser) {
      const role = currentUser.role?.toLowerCase();
      if (role === "owner" || role === "admin") {
        loadUsers();
      }
    }
  }, [getAllUsers, isAuthLoading, currentUser]);

  // Fetch Activity Logs
  const fetchLogs = useCallback(async (page: number, refresh = false) => {
    if (refresh) setIsRefreshing(true);
    else setLoading(true);

    try {
      const params: any = { page, limit: 10 };
      
      if (selectedUserId && selectedUserId !== "All") {
        params.userId = selectedUserId;
      }
      
      // If direct action selected
      if (selectedAction && selectedAction !== "All") {
        params.action = selectedAction;
      } else if (searchAction.trim()) {
        params.action = searchAction.trim();
      }

      const queryStr = `?${new URLSearchParams(params).toString()}`;
      const response = await call("GET", `/api/activity-logs${queryStr}`);
      
      if (response && response.success) {
        setLogs(response.data || []);
        setPagination(response.pagination || { page: 1, limit: 10, total: 0, totalPages: 1 });
        if (refresh) {
          addToast("Activity logs berhasil diperbarui", "success");
        }
      } else {
        setLogs([]);
      }
    } catch (err: any) {
      console.error("Fetch logs error:", err);
      addToast(err.message || "Gagal memuat log aktivitas", "error");
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  }, [call, selectedUserId, selectedAction, searchAction, addToast]);

  // Trigger fetch on filter or page change
  useEffect(() => {
    if (!isAuthLoading && currentUser) {
      const role = currentUser.role?.toLowerCase();
      if (role === "owner" || role === "admin") {
        fetchLogs(currentPage);
      }
    }
  }, [currentPage, fetchLogs, isAuthLoading, currentUser]);

  const handleFilterChange = () => {
    setCurrentPage(1);
    fetchLogs(1);
  };

  const handleResetFilters = () => {
    setSelectedUserId("All");
    setSelectedAction("All");
    setSearchAction("");
    setCurrentPage(1);
    router.replace("/activity-log");
  };

  // Run initial fetch and dependency resets
  useEffect(() => {
    setCurrentPage(1);
  }, [selectedUserId, selectedAction]);

  // Styling Helpers
  const getActionBadge = (action: string) => {
    let colorClass = "bg-slate-100 text-slate-700 border-slate-200";
    let Icon = Info;

    switch (action.toUpperCase()) {
      case "LOGIN":
        colorClass = "bg-emerald-50 text-emerald-700 border-emerald-200/60";
        Icon = Key;
        break;
      case "REGISTER":
        colorClass = "bg-teal-50 text-teal-700 border-teal-200/60";
        Icon = UserPlus;
        break;
      case "CREATE_USER":
        colorClass = "bg-indigo-50 text-indigo-700 border-indigo-200/60";
        Icon = PlusCircle;
        break;
      case "UPDATE_USER":
        colorClass = "bg-amber-50 text-amber-700 border-amber-200/60";
        Icon = Edit;
        break;
      case "DELETE_USER":
        colorClass = "bg-rose-50 text-rose-700 border-rose-200/60";
        Icon = Trash2;
        break;
      default:
        break;
    }

    return (
      <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border ${colorClass}`}>
        <Icon className="w-3.5 h-3.5" />
        {action.replace("_", " ")}
      </span>
    );
  };

  const getUserRoleBadge = (role: string) => {
    let color = "bg-slate-100 text-slate-700 border-slate-200";
    const cleanRole = role?.toLowerCase();
    if (cleanRole === "admin") {
      color = "bg-red-50 text-red-700 border-red-200/60";
    } else if (cleanRole === "manager" || cleanRole === "manajer") {
      color = "bg-indigo-50 text-indigo-700 border-indigo-200/60";
    } else if (cleanRole === "owner" || cleanRole === "direktur") {
      color = "bg-purple-50 text-purple-700 border-purple-200/60";
    }
    return (
      <span className={`px-2 py-0.5 rounded text-[10px] uppercase font-bold border tracking-wider ${color}`}>
        {role}
      </span>
    );
  };

  const renderDetails = (details: string | null) => {
    if (!details) return <span className="text-slate-400 text-xs italic">Tidak ada info tambahan</span>;

    if (details.includes(" | ") || details.includes(": ")) {
      const parts = details.split(" | ");
      return (
        <div className="flex flex-wrap gap-1.5 mt-1">
          {parts.map((part, i) => {
            const [key, ...valueParts] = part.split(":");
            const value = valueParts.join(":");
            if (!key) return null;
            return (
              <span key={i} className="inline-flex items-center text-xs bg-slate-50 border border-slate-200/50 rounded-lg px-2 py-1 shadow-2xs">
                <span className="font-semibold text-slate-500 mr-1.5">{key.trim()}:</span>
                <span className="text-slate-800 font-medium">{value?.trim() || "-"}</span>
              </span>
            );
          })}
        </div>
      );
    }

    return <span className="text-slate-700 text-xs font-medium bg-slate-50 border border-slate-200/50 rounded-lg px-2 py-1">{details}</span>;
  };

  const formatDate = (dateStr: string) => {
    try {
      const date = new Date(dateStr);
      return new Intl.DateTimeFormat("id-ID", {
        dateStyle: "medium",
        timeStyle: "short",
      }).format(date);
    } catch {
      return dateStr;
    }
  };

  const role = currentUser?.role?.toLowerCase();
  if (role !== "owner" && role !== "admin") {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center p-6">
        <div className="w-16 h-16 bg-rose-50 border border-rose-200 rounded-2xl flex items-center justify-center text-rose-500 mb-4 animate-bounce">
          <ShieldAlert className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-black text-slate-800">Akses Ditolak</h2>
        <p className="text-slate-500 mt-1 max-w-sm">Anda tidak memiliki hak akses untuk melihat log aktivitas sistem.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <PageHeader
        title="Activity Log"
        description="Pantau dan audit riwayat aktivitas pengguna dalam sistem secara real-time"
        icon={FileText}
        action={
          <button
            onClick={() => fetchLogs(currentPage, true)}
            disabled={loading || isRefreshing}
            className="w-full sm:w-auto px-4 py-2.5 bg-white border border-slate-200 text-slate-700 font-semibold rounded-xl hover:bg-slate-50 transition-all shadow-xs flex items-center justify-center gap-2 hover:-translate-y-0.5 disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 text-indigo-600 ${isRefreshing ? "animate-spin" : ""}`} />
            Refresh Data
          </button>
        }
      />

      {/* Filter Card */}
      <Card className="p-5 sm:p-6">
        <div className="flex items-center gap-2 mb-4 text-slate-800 font-bold border-b border-slate-100 pb-3">
          <Filter className="w-4 h-4 text-indigo-600" />
          Filter & Pencarian
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
          {/* User Filter */}
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
              Pengguna
            </label>
            <select
              value={selectedUserId}
              onChange={(e) => setSelectedUserId(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 text-slate-700 px-4 py-2.5 rounded-xl text-sm font-semibold outline-none focus:border-indigo-500 focus:bg-white transition-all cursor-pointer"
            >
              <option value="All">Semua Pengguna</option>
              {usersList.map((user) => (
                <option key={user.id} value={user.id}>
                  {user.name} ({user.role})
                </option>
              ))}
            </select>
          </div>

          {/* Action Filter */}
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
              Tipe Aktivitas
            </label>
            <select
              value={selectedAction}
              onChange={(e) => {
                setSelectedAction(e.target.value);
                if (e.target.value !== "All") {
                  setSearchAction("");
                }
              }}
              className="w-full bg-slate-50 border border-slate-200 text-slate-700 px-4 py-2.5 rounded-xl text-sm font-semibold outline-none focus:border-indigo-500 focus:bg-white transition-all cursor-pointer"
            >
              <option value="All">Semua Aktivitas</option>
              {actionTypes.map((action) => (
                <option key={action.value} value={action.value}>
                  {action.label}
                </option>
              ))}
            </select>
          </div>

          {/* Search Input for custom action */}
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
              Cari Aktivitas Kustom
            </label>
            <div className="relative">
              <input
                type="text"
                value={searchAction}
                onChange={(e) => {
                  setSearchAction(e.target.value);
                  setSelectedAction("All");
                }}
                placeholder="Contoh: UPDATE_USER, LOGIN..."
                className="w-full bg-slate-50 border border-slate-200 text-slate-700 pl-10 pr-4 py-2.5 rounded-xl text-sm font-semibold outline-none focus:border-indigo-500 focus:bg-white transition-all"
              />
              <Search className="absolute left-3.5 top-3.5 w-4 h-4 text-slate-400" />
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap justify-end gap-3 border-t border-slate-100 pt-4 mt-4">
          <button
            onClick={handleResetFilters}
            className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition-all"
          >
            Reset Filter
          </button>
          <button
            onClick={handleFilterChange}
            disabled={loading}
            className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl shadow-xs shadow-indigo-100 hover:shadow-md transition-all flex items-center gap-1.5"
          >
            {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Filter className="w-3.5 h-3.5" />}
            Terapkan Filter
          </button>
        </div>
      </Card>

      {/* Logs Table Card */}
      <Card className="overflow-hidden">
        {/* Table Title / Summary */}
        <div className="px-5 py-4 sm:px-6 bg-slate-50 border-b border-slate-200 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
          <div>
            <h2 className="text-base font-bold text-slate-800">Daftar Audit Log</h2>
            <p className="text-xs text-slate-500 mt-0.5">Menampilkan total {pagination.total} entri log</p>
          </div>
          {loading && (
            <div className="flex items-center gap-2 text-indigo-600 font-semibold text-xs bg-indigo-50 border border-indigo-100 px-3 py-1 rounded-full">
              <Loader2 className="w-3 h-3 animate-spin" />
              Menyinkronkan...
            </div>
          )}
        </div>

        {/* Content Body */}
        {loading && logs.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-12 text-center gap-2">
            <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
            <p className="text-slate-500 text-sm font-medium">Mengambil riwayat log...</p>
          </div>
        ) : logs.length > 0 ? (
          <>
            {/* Desktop Table View */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead className="bg-slate-50/50 border-b border-slate-200">
                  <tr>
                    <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider w-[22%]">Waktu</th>
                    <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider w-[23%]">Pengguna</th>
                    <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider w-[20%]">Tipe Aksi</th>
                    <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider w-[35%]">Detail Aktivitas</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {logs.map((log, index) => (
                    <tr 
                      key={log.id} 
                      className="hover:bg-slate-50/40 transition-colors animate-slide-in-up"
                      style={{ animationDelay: `${index * 20}ms` }}
                    >
                      {/* Timestamp */}
                      <td className="p-4 align-top">
                        <div className="flex items-center gap-2 text-slate-500 text-xs font-medium">
                          <Calendar className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                          {formatDate(log.createdAt)}
                        </div>
                      </td>

                      {/* User Info */}
                      <td className="p-4 align-top">
                        <div className="flex items-start gap-2.5">
                          <div className="w-8 h-8 rounded-lg bg-linear-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white text-xs font-black shrink-0 shadow-xs">
                            {log.user?.name ? log.user.name.charAt(0).toUpperCase() : "?"}
                          </div>
                          <div className="min-w-0">
                            <p className="text-sm font-bold text-slate-800 truncate">{log.user?.name || "Sistem / Anonim"}</p>
                            <div className="flex items-center gap-1.5 mt-1 flex-wrap">
                              <span className="text-[10px] text-slate-400 font-medium truncate">{log.user?.email || "-"}</span>
                              {log.user?.role && getUserRoleBadge(log.user.role)}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Action Type */}
                      <td className="p-4 align-top">
                        {getActionBadge(log.action)}
                      </td>

                      {/* Details */}
                      <td className="p-4 align-top">
                        {renderDetails(log.details)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile Cards View */}
            <div className="md:hidden divide-y divide-slate-150">
              {logs.map((log, index) => (
                <div 
                  key={log.id} 
                  className="p-4 hover:bg-slate-50/40 transition-colors space-y-3 animate-slide-in-right"
                  style={{ animationDelay: `${index * 20}ms` }}
                >
                  {/* Card Header: Action + Timestamp */}
                  <div className="flex items-start justify-between gap-2">
                    {getActionBadge(log.action)}
                    <span className="text-[10px] text-slate-400 font-semibold flex items-center gap-1">
                      <Calendar className="w-3 h-3 text-slate-400" />
                      {formatDate(log.createdAt)}
                    </span>
                  </div>

                  {/* User Profile Info */}
                  <div className="flex items-center gap-2.5 bg-slate-50/60 p-2.5 rounded-xl border border-slate-100">
                    <div className="w-8 h-8 rounded-lg bg-linear-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white text-xs font-black shrink-0">
                      {log.user?.name ? log.user.name.charAt(0).toUpperCase() : "?"}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-xs font-bold text-slate-800 truncate">{log.user?.name || "Sistem / Anonim"}</span>
                        {log.user?.role && getUserRoleBadge(log.user.role)}
                      </div>
                      <span className="text-[10px] text-slate-400 font-medium truncate block">{log.user?.email}</span>
                    </div>
                  </div>

                  {/* Detail details block */}
                  <div className="pt-1 text-slate-700">
                    <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Detail Info</div>
                    {renderDetails(log.details)}
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination Controls */}
            {pagination.totalPages > 1 && (
              <div className="p-4 border-t border-slate-200">
                <Pagination
                  currentPage={currentPage}
                  totalPages={pagination.totalPages}
                  onPageChange={(page) => setCurrentPage(page)}
                  itemsPerPage={pagination.limit}
                  totalItems={pagination.total}
                />
              </div>
            )}
          </>
        ) : (
          <div className="flex flex-col items-center justify-center p-16 text-center">
            <div className="w-16 h-16 bg-slate-50 border border-slate-200 rounded-2xl flex items-center justify-center text-slate-400 mb-4 shadow-2xs">
              <FileText className="w-8 h-8" />
            </div>
            <h3 className="text-lg font-black text-slate-800">Tidak ada log aktivitas</h3>
            <p className="text-slate-500 mt-1 max-w-sm">
              Sistem tidak menemukan log aktivitas yang cocok dengan filter Anda.
            </p>
            {(selectedUserId !== "All" || selectedAction !== "All" || searchAction) && (
              <button
                onClick={handleResetFilters}
                className="mt-4 px-4 py-2 bg-indigo-50 border border-indigo-200 hover:bg-indigo-100 text-indigo-700 text-xs font-bold rounded-xl transition-all"
              >
                Hapus Semua Filter
              </button>
            )}
          </div>
        )}
      </Card>
    </div>
  );
}

export default function ActivityLogPage() {
  return (
    <React.Suspense fallback={
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-3">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
        <p className="text-slate-500 text-sm font-medium">Memuat halaman...</p>
      </div>
    }>
      <ActivityLogContent />
    </React.Suspense>
  );
}
