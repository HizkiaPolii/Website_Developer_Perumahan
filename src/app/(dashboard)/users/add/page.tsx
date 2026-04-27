"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Loader } from "lucide-react";
import { useToast } from "@/contexts/ToastContext";
import { useAuth } from "@/contexts/AuthContext";

type Role = "Admin" | "Marketing" | "Manager" | "Owner";

export default function AddUserPage() {
  const router = useRouter();
  const { addToast } = useToast();
  const { token } = useAuth();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    phone: "",
    role: "Marketing" as Role,
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation checks
    if (!formData.name?.trim()) {
      addToast("⚠️ Nama lengkap tidak boleh kosong", "warning", 3000);
      return;
    }

    if (!formData.email?.trim()) {
      addToast("⚠️ Email tidak boleh kosong", "warning", 3000);
      return;
    }

    if (!formData.password?.trim()) {
      addToast("⚠️ Password tidak boleh kosong", "warning", 3000);
      return;
    }

    if (!formData.phone?.trim()) {
      addToast("⚠️ No. Telepon tidak boleh kosong", "warning", 3000);
      return;
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      addToast("⚠️ Format email tidak valid (contoh: nama@domain.com)", "warning", 3000);
      return;
    }

    // Validate password length
    if (formData.password.length < 6) {
      addToast("⚠️ Password minimal 6 karakter (contoh: desa123)", "warning", 3000);
      return;
    }

    // Validate phone format (minimal 10 digit)
    const phoneDigits = formData.phone.replace(/\D/g, '');
    if (phoneDigits.length < 10) {
      addToast("⚠️ No. Telepon minimal 10 digit", "warning", 3000);
      return;
    }

    try {
      setLoading(true);

      if (!token) {
        addToast("❌ Token tidak ditemukan", "error");
        return;
      }

      const response = await fetch("http://localhost:5000/api/users", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: formData.email,
          name: formData.name,
          password: formData.password,
          phone: formData.phone,
          role: formData.role.toLowerCase(),
        }),
      });

      const data = await response.json();
      console.log("✅ Add user response:", response.status, data);

      if (!response.ok) {
        console.error("❌ Backend error:", data);
        addToast(`❌ ${data.message || "Gagal menambah user"}`, "error", 3000);
        return;
      }

      addToast(`✓ User ${formData.name} berhasil ditambahkan`, "success", 3000);
      router.push("/users");
    } catch (err) {
      console.error("Add user error:", err);
      addToast("❌ Terjadi kesalahan saat menambah user", "error", 3000);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4 sm:space-y-6 pb-8 animate-fade-in">
      {/* Header */}
      <div className="flex items-start sm:items-center gap-3 sm:gap-4 animate-slide-in-down">
        <button
          onClick={() => router.back()}
          className="p-2 hover:bg-slate-100 rounded-lg transition-all duration-200 hover:scale-110 shrink-0"
        >
          <ArrowLeft className="w-5 h-5 text-slate-600" />
        </button>
        <div className="min-w-0">
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">➕ Tambah User Baru</h1>
          <p className="text-xs sm:text-sm text-slate-600 mt-1">Buat akun karyawan baru ke dalam sistem</p>
        </div>
      </div>

      {/* Form Card */}
      <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl border border-blue-200 p-4 sm:p-6 md:p-8 shadow-md animate-slide-in-up">
        <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
          {/* Nama */}
          <div className="animate-slide-in-up" style={{animationDelay: '50ms'}}>
            <label className="block text-xs sm:text-sm font-bold text-slate-900 mb-2">
              👤 Nama Lengkap *
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Contoh: Roni Wijaya"
              className="w-full px-3 sm:px-4 py-2 sm:py-3 border-2 border-slate-300 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-200 bg-white text-slate-900 font-semibold text-sm hover:border-slate-400"
            />
          </div>

          {/* Email */}
          <div className="animate-slide-in-up" style={{animationDelay: '75ms'}}>
            <label className="block text-xs sm:text-sm font-bold text-slate-900 mb-2">
              📧 Email *
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="roni@perumahan.com"
              className="w-full px-3 sm:px-4 py-2 sm:py-3 border-2 border-slate-300 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-200 bg-white text-slate-900 font-semibold text-sm hover:border-slate-400"
            />
          </div>

          {/* Password */}
          <div className="animate-slide-in-up" style={{animationDelay: '100ms'}}>
            <label className="block text-xs sm:text-sm font-bold text-slate-900 mb-2">
              🔒 Password *
            </label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Min 6 karakter (kombinasi huruf & angka)"
              className="w-full px-3 sm:px-4 py-2 sm:py-3 border-2 border-slate-300 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-200 bg-white text-slate-900 font-semibold text-sm hover:border-slate-400"
            />
          </div>

          {/* Phone */}
          <div className="animate-slide-in-up" style={{animationDelay: '125ms'}}>
            <label className="block text-xs sm:text-sm font-bold text-slate-900 mb-2">
              📱 No. Telepon *
            </label>
            <input
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              placeholder="081234567890"
              className="w-full px-3 sm:px-4 py-2 sm:py-3 border-2 border-slate-300 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-200 bg-white text-slate-900 font-semibold text-sm hover:border-slate-400"
            />
          </div>

          {/* Role */}
          <div className="animate-slide-in-up" style={{animationDelay: '150ms'}}>
            <label className="block text-xs sm:text-sm font-bold text-slate-900 mb-2">
              👔 Role / Posisi *
            </label>
            <select
              name="role"
              value={formData.role}
              onChange={handleChange}
              className="w-full px-3 sm:px-4 py-2 sm:py-3 border-2 border-slate-300 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-200 bg-white font-bold text-slate-900 text-sm hover:border-slate-400"
            >
              <option value="Marketing">📞 Marketing</option>
              <option value="Manager">👔 Manager</option>
              <option value="Admin">🔑 Admin</option>
              <option value="Owner">👑 Owner</option>
            </select>
          </div>

          {/* Buttons */}
          <div className="flex gap-2 sm:gap-3 pt-3 sm:pt-4 animate-slide-in-up" style={{animationDelay: '175ms'}}>
            <button
              type="button"
              onClick={() => router.back()}
              className="flex-1 px-3 sm:px-4 py-2 sm:py-3 border-2 border-slate-300 text-slate-900 font-bold rounded-lg hover:bg-slate-100 transition-all duration-200 text-sm hover:scale-105 active:scale-95"
            >
              ← Batal
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-3 sm:px-4 py-2 sm:py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold rounded-lg hover:shadow-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-sm hover:scale-105 active:scale-95"
            >
              {loading ? (
                <>
                  <Loader className="w-4 h-4 animate-spin" />
                  <span className="hidden sm:inline">Menyimpan...</span>
                  <span className="sm:hidden">Simpan...</span>
                </>
              ) : (
                <>
                  ✓ Tambah User
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      {/* Tips Card */}
      <div className="bg-amber-50 border-l-4 border-amber-400 rounded-lg p-3 sm:p-4 shadow-sm animate-slide-in-up" style={{animationDelay: '200ms'}}>
        <h3 className="font-bold text-amber-900 mb-2 text-sm sm:text-base">💡 Tips:</h3>
        <ul className="text-xs sm:text-sm text-amber-800 space-y-1">
          <li>• Gunakan email unik yang belum terdaftar</li>
          <li>• Password minimal 6 karakter untuk keamanan</li>
          <li>• Role akan disimpan saat user dibuat</li>
        </ul>
      </div>
    </div>
  );
}
