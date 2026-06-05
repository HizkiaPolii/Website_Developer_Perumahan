"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Plus, Edit, Trash2, Loader, Search, Key, ShieldAlert } from "lucide-react";
import { useToast } from "@/contexts/ToastContext";
import { useConfirmDialog } from "@/contexts/ConfirmDialogContext";
import { useAuth } from "@/contexts/AuthContext";
import { useUsers } from "@/hooks/useApiEndpoints";

type Role = "Admin" | "Manager" | "Owner" | "Staf";

interface User {
  id: string | number;
  name: string;
  email: string;
  role: Role;
  isActive: boolean;
  joinDate?: string;
  phone?: string;
}

export default function UsersPage() {
  const router = useRouter();
  const { user: currentUser, isLoading: isAuthLoading } = useAuth();
  const { getAll, delete: deleteUser, update: updateUser, loading, error: hookError } = useUsers();
  
  const [users, setUsers] = useState<User[]>([]);
  const [filterRole, setFilterRole] = useState<Role | "All">("All");
  const [searchTerm, setSearchTerm] = useState("");
  const { addToast } = useToast();
  const { confirm } = useConfirmDialog();

  // Fetch users when user is loaded
  useEffect(() => {
    if (isAuthLoading || !currentUser) return;

    const loadUsers = async () => {
      try {
        const data = await getAll();
        if (data && data.length > 0) {
          const normalizedUsers = data.map((user: any) => ({
            ...user,
            role: user.role?.charAt(0).toUpperCase() + user.role?.slice(1).toLowerCase() || "User",
            joinDate: user.joinDate || user.createdAt || "-",
            isActive: user.isActive !== undefined ? user.isActive : true
          }));
          setUsers(normalizedUsers);
          addToast(`${data.length} users berhasil dimuat`, 'success');
        } else {
          setUsers([]);
        }
      } catch (err) {
        console.error('Error loading users:', err);
        addToast('Gagal memuat users', 'error');
      }
    };

    loadUsers();
  }, [getAll, currentUser, isAuthLoading, addToast]);

  const handleDeleteUser = async (id: string | number) => {
    const user = users.find(u => u.id === id);
    if (!user) return;

    if (currentUser && user.id === currentUser.id) {
      addToast("❌ Anda tidak dapat menghapus akun Anda sendiri!", "error");
      return;
    }

    const confirmed = await confirm({
      title: "Hapus User?",
      message: `Apakah Anda yakin ingin menghapus user ${user.name}? Tindakan ini tidak bisa dibatalkan.`,
      confirmText: "Ya, Hapus",
      cancelText: "Batal",
      type: "danger"
    });

    if (!confirmed) return;

    try {
      const success = await deleteUser(id as number);
      if (success) {
        setUsers(users.filter(u => u.id !== id));
        addToast(`✓ User ${user.name} berhasil dihapus`, "success");
      } else {
        addToast(`❌ Gagal menghapus user`, "error");
      }
    } catch (err) {
      console.error("Delete user error:", err);
      addToast("❌ Terjadi kesalahan saat menghapus user", "error");
    }
  };

  const handleToggleStatus = async (id: string | number, currentStatus: boolean) => {
    const user = users.find(u => u.id === id);
    if (!user) return;

    if (currentUser && user.id === currentUser.id) {
      addToast("❌ Anda tidak dapat menonaktifkan akun Anda sendiri!", "error");
      return;
    }

    const actionText = currentStatus ? "Nonaktifkan" : "Aktifkan";
    const confirmed = await confirm({
      title: `${actionText} User?`,
      message: `Apakah Anda yakin ingin ${actionText.toLowerCase()} user ${user.name}?`,
      confirmText: actionText,
      cancelText: "Batal",
      type: currentStatus ? "warning" : "info"
    });

    if (!confirmed) return;

    try {
      const updated = await updateUser(id as number, { isActive: !currentStatus });
      if (updated) {
        setUsers(users.map(u => u.id === id ? { ...u, isActive: !currentStatus } : u));
        addToast(`✓ Status user ${user.name} berhasil diubah menjadi ${!currentStatus ? 'Aktif' : 'Nonaktif'}`, "success");
      } else {
        addToast(`❌ Gagal mengubah status user`, "error");
      }
    } catch (err) {
      console.error("Toggle user status error:", err);
      addToast("❌ Terjadi kesalahan saat mengubah status user", "error");
    }
  };

  const handleResetPassword = async (id: string | number) => {
    const user = users.find(u => u.id === id);
    if (!user) return;

    const newPassword = window.prompt(`Masukkan password baru untuk user ${user.name}:`);
    if (newPassword === null) return;
    if (newPassword.trim().length < 6) {
      addToast("Password minimal harus 6 karakter!", "error");
      return;
    }

    try {
      const updated = await updateUser(id as number, { password: newPassword.trim() });
      if (updated) {
        addToast(`✓ Password user ${user.name} berhasil diubah`, "success");
      } else {
        addToast(`❌ Gagal menyetel ulang password`, "error");
      }
    } catch (err) {
      console.error("Reset password error:", err);
      addToast("❌ Terjadi kesalahan saat menyetel ulang password", "error");
    }
  };

  // Defensive guard to ensure users is always an array
  const safeUsers = Array.isArray(users) ? users : [];

  const filteredUsers = safeUsers
    .filter(u => filterRole === "All" ? true : u.role === filterRole)
    .filter(u => {
      if (!searchTerm.trim()) return true;
      const s = searchTerm.toLowerCase();
      return u.name.toLowerCase().includes(s) || u.email.toLowerCase().includes(s);
    });

  const getRoleColor = (role: Role) => {
    const colors = {
      "Admin": "bg-red-100 text-red-700 border-red-300 font-semibold",
      "Manager": "bg-indigo-100 text-indigo-700 border-indigo-300 font-semibold",
      "Owner": "bg-purple-100 text-purple-700 border-purple-300 font-semibold",
      "Staf": "bg-amber-100 text-amber-700 border-amber-300 font-semibold",
    };
    return colors[role];
  };

  const getRoleIcon = (role: Role) => {
    const icons = {
      "Admin": "🔑",
      "Manager": "👔",
      "Owner": "👑",
      "Staf": "👷",
    };
    return icons[role];
  };

  if (isAuthLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Loader className="w-8 h-8 animate-spin mx-auto text-indigo-500" />
          <p className="text-slate-600 mt-2">Mengambil data user...</p>
        </div>
      </div>
    );
  }

  if (hookError) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="text-4xl mb-4">❌</div>
          <p className="text-red-600 font-bold">{hookError}</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
          >
            Coba Lagi
          </button>
        </div>
      </div>
    );
  }

  // Guard for role
  const currentUserRole = currentUser?.role?.toLowerCase();
  if (currentUserRole !== "admin") {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center p-6">
        <div className="w-16 h-16 bg-rose-50 border border-rose-200 rounded-2xl flex items-center justify-center text-rose-500 mb-4 animate-bounce">
          <ShieldAlert className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-black text-slate-800">Akses Ditolak</h2>
        <p className="text-slate-500 mt-1 max-w-sm">Halaman Manajemen User hanya dapat diakses oleh Administrator Sistem.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-4xl font-bold text-slate-900">👥 Manajemen User</h1>
          <p className="text-slate-500 mt-2">Kelola akun karyawan, status aktif, dan password sistem</p>
        </div>
        <button
          onClick={() => router.push("/users/add")}
          className="px-5 py-2.5 bg-indigo-600 text-white font-bold rounded-lg hover:bg-indigo-700 transition-all shadow-md shadow-indigo-200 flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Tambah User
        </button>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard label="Total User" value={safeUsers.length.toString()} icon="👥" />
        <StatCard label="Aktif" value={safeUsers.filter(u => u.isActive).length.toString()} icon="🟢" />
        <StatCard label="Nonaktif" value={safeUsers.filter(u => !u.isActive).length.toString()} icon="🔴" />
        <StatCard label="Admin" value={safeUsers.filter(u => u.role === "Admin").length.toString()} icon="🔑" />
      </div>

      {/* Search & Filter */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
        <div className="md:col-span-2">
          <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
            Pencarian User
          </label>
          <div className="relative">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Cari berdasarkan nama atau email..."
              className="w-full bg-slate-50 border border-slate-200 text-slate-700 pl-10 pr-4 py-2 rounded-xl text-sm font-semibold outline-none focus:border-indigo-500 focus:bg-white transition-all"
            />
            <Search className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
          </div>
        </div>
        <div>
          <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
            Filter Role
          </label>
          <div className="flex bg-slate-100 p-1 rounded-xl">
            {(["All", "Admin", "Manager", "Owner", "Staf"] as const).map((role) => (
              <button
                key={role}
                onClick={() => setFilterRole(role as Role | "All")}
                className={`flex-1 py-1.5 rounded-lg font-bold text-xs transition-all ${
                  filterRole === role
                    ? "bg-white text-indigo-600 shadow-xs"
                    : "text-slate-500 hover:text-slate-900"
                }`}
              >
                {role}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Users Table - Responsive */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-4 sm:p-6 border-b border-slate-200 bg-slate-50">
          <h2 className="text-lg font-bold text-slate-900">Daftar User ({filteredUsers.length})</h2>
        </div>

        {/* Desktop Table */}
        <div className="hidden lg:block overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="p-4 text-xs uppercase font-bold text-slate-500">ID</th>
                <th className="p-4 text-xs uppercase font-bold text-slate-500">Nama</th>
                <th className="p-4 text-xs uppercase font-bold text-slate-500">Email</th>
                <th className="p-4 text-xs uppercase font-bold text-slate-500">Telepon</th>
                <th className="p-4 text-xs uppercase font-bold text-slate-500">Role</th>
                <th className="p-4 text-xs uppercase font-bold text-slate-500">Status</th>
                <th className="p-4 text-xs uppercase font-bold text-slate-500">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredUsers.length > 0 ? (
                filteredUsers.map((user, index) => (
                  <tr key={user.id} className="hover:bg-slate-50/50 transition-all duration-200 animate-slide-in-up" style={{animationDelay: `${index * 30}ms`}}>
                    <td className="p-4 text-xs font-bold text-indigo-600">{user.id}</td>
                    <td className="p-4 font-semibold text-slate-900">{user.name}</td>
                    <td className="p-4 text-slate-600 text-sm">{user.email}</td>
                    <td className="p-4 text-slate-600 text-sm">{user.phone || "-"}</td>
                    <td className="p-4">
                      <span className={`inline-block px-3 py-1.5 rounded-lg text-xs font-bold border transition-all duration-300 ${getRoleColor(user.role)}`}>
                        {getRoleIcon(user.role)} {user.role}
                      </span>
                    </td>
                    <td className="p-4">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold border ${
                        user.isActive 
                          ? "bg-emerald-50 text-emerald-700 border-emerald-200" 
                          : "bg-slate-100 text-slate-500 border-slate-200"
                      }`}>
                        <span className={`w-2 h-2 rounded-full ${user.isActive ? "bg-emerald-500 animate-pulse" : "bg-slate-400"}`} />
                        {user.isActive ? "Aktif" : "Nonaktif"}
                      </span>
                    </td>
                    <td className="p-4 flex gap-1.5 flex-wrap">
                      <button
                        onClick={() => router.push(`/users/${user.id}/edit`)}
                        className="text-xs font-bold text-blue-600 hover:text-blue-700 hover:bg-blue-50 px-2.5 py-1 rounded-lg transition-all duration-200 flex items-center gap-1 hover:scale-105"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleToggleStatus(user.id, user.isActive)}
                        className={`text-xs font-bold px-2.5 py-1 rounded-lg transition-all duration-200 flex items-center gap-1 hover:scale-105 ${
                          user.isActive 
                            ? "text-amber-600 hover:text-amber-700 hover:bg-amber-50" 
                            : "text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50"
                        }`}
                      >
                        {user.isActive ? "Nonaktifkan" : "Aktifkan"}
                      </button>
                      <button
                        onClick={() => handleResetPassword(user.id)}
                        className="text-xs font-bold text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50 px-2.5 py-1 rounded-lg transition-all duration-200 flex items-center gap-1 hover:scale-105"
                      >
                        Reset Password
                      </button>
                      <button
                        onClick={() => router.push(`/activity-log?userId=${user.id}`)}
                        className="text-xs font-bold text-slate-600 hover:text-slate-700 hover:bg-slate-50 px-2.5 py-1 rounded-lg transition-all duration-200 flex items-center gap-1 hover:scale-105"
                      >
                        Audit Log
                      </button>
                      <button
                        onClick={() => handleDeleteUser(user.id)}
                        className="text-xs font-bold text-red-600 hover:text-red-700 hover:bg-red-55 px-2.5 py-1 rounded-lg transition-all duration-200 flex items-center gap-1 hover:scale-105"
                      >
                        Hapus
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-slate-500">
                    Tidak ada user dengan filter yang dipilih
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Mobile & Tablet Card View */}
        <div className="lg:hidden divide-y divide-slate-100">
          {filteredUsers.length > 0 ? (
            filteredUsers.map((user, index) => (
              <div key={user.id} className="p-4 hover:bg-slate-50 transition-all duration-200 animate-slide-in-right" style={{animationDelay: `${index * 30}ms`}}>
                <div className="space-y-3">
                  {/* Header */}
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1">
                      <p className="font-bold text-slate-900 line-clamp-1">{user.name}</p>
                      <p className="text-xs text-slate-500">ID: {user.id}</p>
                    </div>
                    <div className="flex flex-col items-end gap-1.5 shrink-0">
                      <span className={`inline-block px-2.5 py-0.5 rounded-lg text-[10px] font-bold border whitespace-nowrap transition-all duration-300 ${getRoleColor(user.role)}`}>
                        {getRoleIcon(user.role)} {user.role}
                      </span>
                      <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[9px] font-bold border ${
                        user.isActive 
                          ? "bg-emerald-50 text-emerald-700 border-emerald-200" 
                          : "bg-slate-100 text-slate-500 border-slate-200"
                      }`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${user.isActive ? "bg-emerald-500" : "bg-slate-400"}`} />
                        {user.isActive ? "Aktif" : "Nonaktif"}
                      </span>
                    </div>
                  </div>

                  {/* Details */}
                  <div className="space-y-2 text-sm">
                    <div className="flex flex-col sm:flex-row sm:items-center gap-1">
                      <span className="text-slate-500 font-semibold min-w-[60px]">Email:</span>
                      <span className="text-slate-700 break-all text-xs sm:text-sm">{user.email}</span>
                    </div>
                    <div className="flex flex-col sm:flex-row sm:items-center gap-1">
                      <span className="text-slate-500 font-semibold min-w-[60px]">Telepon:</span>
                      <span className="text-slate-700">{user.phone || "-"}</span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex flex-wrap gap-2 pt-2 border-t border-slate-100">
                    <button
                      onClick={() => router.push(`/users/${user.id}/edit`)}
                      className="flex-1 text-xs font-bold text-blue-600 hover:text-blue-700 hover:bg-blue-50 px-2 py-1.5 rounded-lg transition-all duration-200 flex items-center justify-center gap-1"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleToggleStatus(user.id, user.isActive)}
                      className={`flex-1 text-xs font-bold px-2 py-1.5 rounded-lg transition-all duration-200 flex items-center justify-center gap-1 ${
                        user.isActive 
                          ? "text-amber-600 hover:text-amber-700 hover:bg-amber-50" 
                          : "text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50"
                      }`}
                    >
                      {user.isActive ? "Suspend" : "Aktifkan"}
                    </button>
                    <button
                      onClick={() => handleResetPassword(user.id)}
                      className="flex-1 text-xs font-bold text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50 px-2 py-1.5 rounded-lg transition-all duration-200 flex items-center justify-center gap-1"
                    >
                      Password
                    </button>
                    <button
                      onClick={() => router.push(`/activity-log?userId=${user.id}`)}
                      className="flex-1 text-xs font-bold text-slate-600 hover:text-slate-700 hover:bg-slate-50 px-2 py-1.5 rounded-lg transition-all duration-200 flex items-center justify-center gap-1"
                    >
                      Audit
                    </button>
                    <button
                      onClick={() => handleDeleteUser(user.id)}
                      className="flex-1 text-xs font-bold text-red-600 hover:text-red-700 hover:bg-red-50 px-2 py-1.5 rounded-lg transition-all duration-200 flex items-center justify-center gap-1"
                    >
                      Hapus
                    </button>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="p-8 text-center text-slate-500">
              Tidak ada user dengan filter yang dipilih
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function StatCard({ label, value, icon }: { label: string; value: string; icon: string }) {
  return (
    <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs uppercase text-slate-500 font-bold">{label}</p>
          <p className="text-2xl font-bold text-slate-900 mt-2">{value}</p>
        </div>
        <span className="text-2xl">{icon}</span>
      </div>
    </div>
  );
}