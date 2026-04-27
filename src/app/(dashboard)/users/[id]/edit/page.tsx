"use client";

import React, { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { ArrowLeft, Loader } from "lucide-react";
import { useToast } from "@/contexts/ToastContext";
import { useAuth } from "@/contexts/AuthContext";

type Role = "Admin" | "Marketing" | "Manager" | "Owner";

interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
  role: Role;
  status: "Aktif" | "Nonaktif";
}

export default function EditUserPage() {
  const router = useRouter();
  const params = useParams();
  const { addToast } = useToast();
  const { token } = useAuth();
  const [loading, setLoading] = useState(false);
  const [pageLoading, setPageLoading] = useState(true);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    role: "Marketing" as Role,
    status: "Aktif" as "Aktif" | "Nonaktif",
  });

  const userId = params.id as string;

  // Fetch user data
  useEffect(() => {
    const fetchUser = async () => {
      try {
        if (!token) return;

        const response = await fetch(`http://localhost:5000/api/users/${userId}`, {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });

        if (!response.ok) {
          addToast("❌ Gagal mengambil data user", "error");
          router.back();
          return;
        }

        const data = await response.json();
        const user = data.data;

        setFormData({
          name: user.name,
          email: user.email,
          phone: user.phone || "",
          role: user.role,
          status: user.status || "Aktif",
        });
      } catch (err) {
        console.error("Fetch user error:", err);
        addToast("❌ Terjadi kesalahan saat mengambil data", "error");
        router.back();
      } finally {
        setPageLoading(false);
      }
    };

    fetchUser();
  }, [userId, token, router, addToast]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name || !formData.email || !formData.phone) {
      addToast("⚠️ Mohon isi semua field yang diperlukan", "warning", 3000);
      return;
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      addToast("⚠️ Format email tidak valid (contoh: nama@domain.com)", "warning", 3000);
      return;
    }

    try {
      setLoading(true);

      if (!token) {
        addToast("❌ Token tidak ditemukan", "error");
        return;
      }

      const response = await fetch(`http://localhost:5000/api/users/${userId}`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
          role: formData.role.toLowerCase(), // Convert to lowercase untuk konsistensi
          status: formData.status,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        addToast(`❌ ${data.message || "Gagal mengupdate user"}`, "error", 3000);
        return;
      }

      addToast(`✓ User ${formData.name} berhasil diperbarui`, "success", 3000);
      router.push("/users");
    } catch (err) {
      console.error("Update user error:", err);
      addToast("❌ Terjadi kesalahan saat mengupdate user", "error", 3000);
    } finally {
      setLoading(false);
    }
  };

  if (pageLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="flex flex-col items-center gap-3">
          <Loader className="w-8 h-8 animate-spin text-blue-500" />
          <p className="text-slate-600 text-sm">Memuat data user...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-start sm:items-center gap-3 sm:gap-4 animate-slide-in-down">
        <button
          onClick={() => router.back()}
          className="p-2 hover:bg-slate-100 rounded-lg transition-all duration-200 hover:scale-110 shrink-0"
        >
          <ArrowLeft className="w-5 h-5 text-slate-600" />
        </button>
        <div className="min-w-0">
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">✏️ Edit User</h1>
          <p className="text-xs sm:text-sm text-slate-600 mt-1">Ubah informasi dan role user</p>
        </div>
      </div>

      {/* Form Card */}
      <div className="bg-white rounded-lg border border-slate-200 p-4 sm:p-6 md:p-8 shadow-sm animate-slide-in-up">
        <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
          {/* Nama */}
          <div className="animate-slide-in-up" style={{animationDelay: '50ms'}}>
            <label className="block text-xs sm:text-sm font-semibold text-slate-900 mb-2">
              👤 Nama Lengkap *
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Nama lengkap user"
              className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200 text-slate-900 font-semibold text-sm hover:border-slate-400"
            />
          </div>

          {/* Email (Read-only) */}
          <div className="animate-slide-in-up" style={{animationDelay: '75ms'}}>
            <label className="block text-xs sm:text-sm font-semibold text-slate-900 mb-2">
              📧 Email (Tidak dapat diubah)
            </label>
            <input
              type="email"
              value={formData.email}
              disabled
              className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-slate-300 rounded-lg bg-slate-50 text-slate-600 text-sm transition-all duration-200"
            />
          </div>

          {/* Phone */}
          <div className="animate-slide-in-up" style={{animationDelay: '100ms'}}>
            <label className="block text-xs sm:text-sm font-semibold text-slate-900 mb-2">
              📱 No. Telepon *
            </label>
            <input
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              placeholder="081234567890"
              className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200 text-slate-900 font-semibold text-sm hover:border-slate-400"
            />
          </div>

          {/* Role */}
          <div className="animate-slide-in-up" style={{animationDelay: '125ms'}}>
            <label className="block text-xs sm:text-sm font-semibold text-slate-900 mb-2">
              👔 Role *
            </label>
            <select
              name="role"
              value={formData.role}
              onChange={handleChange}
              className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200 text-slate-900 font-semibold text-sm hover:border-slate-400"
            >
              <option value="Marketing">📞 Marketing</option>
              <option value="Manager">👔 Manager</option>
              <option value="Admin">🔑 Admin</option>
              <option value="Owner">👑 Owner</option>
            </select>
          </div>

          {/* Status */}
          <div className="animate-slide-in-up" style={{animationDelay: '150ms'}}>
            <label className="block text-xs sm:text-sm font-semibold text-slate-900 mb-2">
              🔄 Status *
            </label>
            <select
              name="status"
              value={formData.status}
              onChange={handleChange}
              className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200 text-slate-900 font-semibold text-sm hover:border-slate-400"
            >
              <option value="Aktif">✓ Aktif</option>
              <option value="Nonaktif">✗ Nonaktif</option>
            </select>
          </div>

          {/* Buttons */}
          <div className="flex gap-2 sm:gap-3 pt-3 sm:pt-4 animate-slide-in-up" style={{animationDelay: '175ms'}}>
            <button
              type="button"
              onClick={() => router.back()}
              className="flex-1 px-3 sm:px-4 py-2 sm:py-3 border border-slate-300 text-slate-900 font-semibold rounded-lg hover:bg-slate-50 transition-all duration-200 text-sm hover:scale-105 active:scale-95"
            >
              ← Batal
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-3 sm:px-4 py-2 sm:py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-all duration-200 disabled:opacity-50 flex items-center justify-center gap-2 text-sm hover:scale-105 active:scale-95"
            >
              {loading ? (
                <>
                  <Loader className="w-4 h-4 animate-spin" />
                  <span className="hidden sm:inline">Menyimpan...</span>
                  <span className="sm:hidden">Simpan...</span>
                </>
              ) : (
                "✓ Simpan Perubahan"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
