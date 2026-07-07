"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Eye, EyeOff, Loader, LogIn } from "lucide-react";
import { useToast } from "@/contexts/ToastContext";
import { useAuth } from "@/contexts/AuthContext";

export default function LoginPage() {
  const router = useRouter();
  const { addToast } = useToast();
  const { loginWithCredentials, isAuthenticated, isLoading } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  // Redirect ke dashboard jika sudah login
  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      router.replace("/");
    }
  }, [isAuthenticated, isLoading, router]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const result = await loginWithCredentials(email, password);

      if (!result.success) {
        addToast(result.error || "Email atau password salah", "error");
        setLoading(false);
        return;
      }

      addToast("Login berhasil! Mengarahkan...", "success");
      setTimeout(() => {
        router.push("/");
      }, 1000);
    } catch (err) {
      addToast("Terjadi kesalahan. Silakan coba lagi.", "error");
      setLoading(false);
    }
  };

  // Show loading saat verifying session
  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <Loader className="w-8 h-8 animate-spin text-blue-500" />
          <p className="text-slate-400">Verifikasi sesi...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex bg-[#2b3a47]">

      {/* ── Left: Full Image (tidak terpotong) ──────────── */}
      <div className="hidden lg:flex lg:flex-1 items-center justify-center p-8 relative">
        <Image
          src="/bg-login.jpeg"
          alt="B&R Bumi Residence"
          fill
          className="object-contain object-center"
          unoptimized
          priority
        />
      </div>

      {/* ── Right: Login Form ──────────────────────────── */}
      <div className="w-full lg:w-[480px] xl:w-[520px] bg-slate-900 flex flex-col shrink-0 relative">

        {/* Mobile background */}
        <div className="absolute inset-0 lg:hidden overflow-hidden">
          <Image
            src="/bg-login.jpeg"
            alt="B&R Bumi Residence"
            fill
            className="object-cover opacity-15"
            unoptimized
          />
        </div>

        {/* Content */}
        <div className="relative z-10 flex-1 flex flex-col justify-center px-8 sm:px-12 lg:px-12 py-12">

          {/* Logo & Branding */}
          <div className="text-center mb-8">
            <div className="flex justify-center mb-4">
              <Image
                src="/logo-br.png"
                alt="B&R Bumi Residence"
                width={56}
                height={56}
                className="rounded-2xl shadow-lg shadow-black/30"
                unoptimized
              />
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              Bumi Residence
            </h1>
            <p className="text-slate-500 text-sm mt-1">
              Sistem Pengelolaan Keuangan
            </p>
          </div>

          {/* Divider */}
          <div className="flex items-center gap-3 mb-7">
            <div className="flex-1 h-px bg-slate-800" />
            <span className="text-[10px] font-bold text-slate-600 uppercase tracking-[0.2em]">Masuk ke Sistem</span>
            <div className="flex-1 h-px bg-slate-800" />
          </div>

          {/* Form */}
          <form onSubmit={handleLogin} className="space-y-5">
            {/* Email Input */}
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-slate-300">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="nama@bumiresidence.com"
                className="w-full px-4 py-3.5 bg-slate-800/80 border border-slate-700/80 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all text-sm"
                disabled={loading}
                required
              />
            </div>

            {/* Password Input */}
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-slate-300">Password</label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Masukkan password"
                  className="w-full px-4 py-3.5 bg-slate-800/80 border border-slate-700/80 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all text-sm"
                  disabled={loading}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors"
                  disabled={loading}
                >
                  {showPassword ? (
                    <EyeOff className="w-5 h-5" />
                  ) : (
                    <Eye className="w-5 h-5" />
                  )}
                </button>
              </div>
            </div>

            {/* Login Button */}
            <button
              type="submit"
              disabled={loading || !email || !password}
              className="w-full bg-linear-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white font-bold py-3.5 rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2.5 shadow-lg shadow-blue-500/20 hover:shadow-blue-500/30 text-sm mt-2"
            >
              {loading ? (
                <>
                  <Loader className="w-4 h-4 animate-spin" />
                  Memproses...
                </>
              ) : (
                <>
                  <LogIn className="w-4 h-4" />
                  <span>Masuk ke Sistem</span>
                </>
              )}
            </button>
          </form>
        </div>

        {/* Footer */}
        <div className="relative z-10 px-8 sm:px-12 lg:px-12 pb-6">
          <div className="border-t border-slate-800 pt-5">
            <p className="text-[11px] text-slate-600 text-center">
              © 2026 B&R Bumi Residence • Sistem Pengelolaan Keuangan
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}