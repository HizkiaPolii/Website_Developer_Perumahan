"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Plus, Edit, Trash2, Loader } from "lucide-react";
import { useToast } from "@/contexts/ToastContext";
import { useConfirmDialog } from "@/contexts/ConfirmDialogContext";
import { useAuth } from "@/contexts/AuthContext";
import { useUsers } from "@/hooks/useApiEndpoints";

type Role = "Admin" | "Marketing" | "Manager" | "Owner";

interface User {
  id: string | number;
  name: string;
  email: string;
  role: Role;
  joinDate?: string;
  phone?: string;
}

export default function UsersPage() {
  const router = useRouter();
  const { user: currentUser, isLoading: isAuthLoading } = useAuth();
  const { getAll, delete: deleteUser, update: updateUser, loading, error: hookError } = useUsers();
  
  const [users, setUsers] = useState<User[]>([]);
  const [filterRole, setFilterRole] = useState<Role | "All">("All");
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
            joinDate: user.joinDate || user.createdAt || "-"
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

    const confirmed = await confirm({
      title: "Hapus User?",
      message: `Apakah Anda yakin ingin menghapus user ${user.name}? Action ini tidak bisa dibatalkan.`,
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

  // Defensive guard to ensure users is always an array
  const safeUsers = Array.isArray(users) ? users : [];

  const filteredUsers = filterRole === "All" 
    ? safeUsers 
    : safeUsers.filter(u => u.role === filterRole);

  const getRoleColor = (role: Role) => {
    const colors = {
      "Admin": "bg-red-100 text-red-700 border-red-300 font-semibold",
      "Marketing": "bg-blue-100 text-blue-700 border-blue-300 font-semibold",
      "Manager": "bg-indigo-100 text-indigo-700 border-indigo-300 font-semibold",
      "Owner": "bg-purple-100 text-purple-700 border-purple-300 font-semibold",
    };
    return colors[role];
  };

  const getRoleIcon = (role: Role) => {
    const icons = {
      "Admin": "🔑",
      "Marketing": "📞",
      "Manager": "👔",
      "Owner": "👑",
    };
    return icons[role];
  };

  if (isAuthLoading || loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Loader className="w-8 h-8 animate-spin mx-auto text-blue-500" />
          <p className="text-slate-600 mt-2">Mengambil data users...</p>
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

  return (
    <div className="space-y-6">
      {/* API Info */}
      <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4">
        <p className="text-xs font-bold text-emerald-900">✓ API Status - Connected</p>
        <p className="text-xs text-emerald-800 mt-1">Users: {safeUsers.length}</p>
      </div>

      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-4xl font-bold text-slate-900">👥 Manajemen User</h1>
          <p className="text-slate-500 mt-2">Kelola akun karyawan, role, dan permission sistem</p>
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
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <StatCard label="Total User" value={safeUsers.length.toString()} icon="👥" />
        <StatCard label="Admin" value={safeUsers.filter(u => u.role === "Admin").length.toString()} icon="🔑" />
        <StatCard label="Marketing" value={safeUsers.filter(u => u.role === "Marketing").length.toString()} icon="📞" />
        <StatCard label="Manager" value={safeUsers.filter(u => u.role === "Manager").length.toString()} icon="👔" />
        <StatCard label="Owner" value={safeUsers.filter(u => u.role === "Owner").length.toString()} icon="👑" />
      </div>

      {/* Filter */}
      <div className="bg-white rounded-lg border border-slate-200 p-4">
        <h3 className="font-bold text-slate-900 mb-3">Filter Role</h3>
        <div className="flex gap-2 overflow-x-auto pb-2 flex-wrap">
          {(["All", "Admin", "Marketing", "Manager", "Owner"] as const).map((role) => (
            <button
              key={role}
              onClick={() => setFilterRole(role as Role | "All")}
              className={`px-4 py-2 rounded-lg font-bold text-sm whitespace-nowrap transition-all ${
                filterRole === role
                  ? "bg-indigo-600 text-white shadow-md"
                  : "bg-slate-100 border border-slate-200 text-slate-600 hover:border-indigo-300 hover:bg-slate-50"
              }`}
            >
              {role}
            </button>
          ))}
        </div>
      </div>

      {/* Users Table - Responsive */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-4 sm:p-6 border-b border-slate-200 bg-slate-50">
          <h2 className="text-lg font-bold text-slate-900">Daftar User ({filteredUsers.length})</h2>
        </div>

        {/* Desktop Table */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="p-4 text-xs uppercase font-bold text-slate-500">ID</th>
                <th className="p-4 text-xs uppercase font-bold text-slate-500">Nama</th>
                <th className="p-4 text-xs uppercase font-bold text-slate-500">Email</th>
                <th className="p-4 text-xs uppercase font-bold text-slate-500">Telepon</th>
                <th className="p-4 text-xs uppercase font-bold text-slate-500">Role</th>
                <th className="p-4 text-xs uppercase font-bold text-slate-500">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredUsers.length > 0 ? (
                filteredUsers.map((user, index) => (
                  <tr key={user.id} className="hover:bg-slate-50 transition-all duration-200 animate-slide-in-up" style={{animationDelay: `${index * 30}ms`}}>
                    <td className="p-4 text-xs font-bold text-indigo-600">{user.id}</td>
                    <td className="p-4 font-semibold text-slate-900">{user.name}</td>
                    <td className="p-4 text-slate-600 text-sm">{user.email}</td>
                    <td className="p-4 text-slate-600 text-sm">{user.phone || "-"}</td>
                    <td className="p-4">
                      <span className={`inline-block px-3 py-1.5 rounded-lg text-xs font-bold border transition-all duration-300 ${getRoleColor(user.role)}`}>
                        {getRoleIcon(user.role)} {user.role}
                      </span>
                    </td>
                    <td className="p-4 flex gap-2">
                      <button
                        onClick={() => router.push(`/users/${user.id}/edit`)}
                        className="text-xs font-bold text-blue-600 hover:text-blue-700 hover:bg-blue-50 px-2 py-1 rounded transition-all duration-200 flex items-center gap-1 hover:scale-105"
                      >
                        <Edit className="w-3 h-3" />
                        Edit
                      </button>
                      <button
                        onClick={() => handleDeleteUser(user.id)}
                        className="text-xs font-bold text-red-600 hover:text-red-700 hover:bg-red-50 px-2 py-1 rounded transition-all duration-200 flex items-center gap-1 hover:scale-105"
                      >
                        <Trash2 className="w-3 h-3" />
                        Hapus
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-slate-500">
                    Tidak ada user dengan filter yang dipilih
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Mobile & Tablet Card View */}
        <div className="md:hidden divide-y divide-slate-100">
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
                    <span className={`inline-block px-2 py-1 rounded-lg text-xs font-bold border whitespace-nowrap transition-all duration-300 ${getRoleColor(user.role)}`}>
                      {getRoleIcon(user.role)} {user.role}
                    </span>
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
                  <div className="flex gap-2 pt-2 border-t border-slate-100">
                    <button
                      onClick={() => router.push(`/users/${user.id}/edit`)}
                      className="flex-1 text-xs font-bold text-blue-600 hover:text-blue-700 hover:bg-blue-50 px-3 py-2 rounded transition-all duration-200 flex items-center justify-center gap-1 hover:scale-105"
                    >
                      <Edit className="w-3 h-3" />
                      Edit
                    </button>
                    <button
                      onClick={() => handleDeleteUser(user.id)}
                      className="flex-1 text-xs font-bold text-red-600 hover:text-red-700 hover:bg-red-50 px-3 py-2 rounded transition-all duration-200 flex items-center justify-center gap-1 hover:scale-105"
                    >
                      <Trash2 className="w-3 h-3" />
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