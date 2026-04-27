"use client";

import React, { useState, useEffect } from "react";

interface DashboardStats {
  totalUnits: number;
  availableUnits: number;
  pendingBookings: number;
  soldUnits: number;
}

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Mock data untuk development
  const mockStats: DashboardStats = {
    totalUnits: 25,
    availableUnits: 12,
    pendingBookings: 5,
    soldUnits: 8,
  };

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const token = localStorage.getItem("token");
        
        if (!token) {
          setError("Token tidak ditemukan. Silakan login kembali.");
          setLoading(false);
          return;
        }

        // TODO: Replace with actual API endpoint
        const response = await fetch("/api/dashboard/stats", {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });

        if (!response.ok) {
          console.warn("API /api/dashboard/stats tidak tersedia, menggunakan mock data");
          setStats(mockStats);
          setLoading(false);
          return;
        }
        
        const data = await response.json();
        setStats(data);
      } catch (err) {
        console.warn("Gagal fetch dari API, menggunakan mock data:", err);
        setStats(mockStats);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-slate-900">Dashboard</h1>
        <p className="text-slate-500 mt-2">Selamat datang di Sistem Pengelolaan Perusahaan Housing</p>
      </div>

      {/* Error State */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      {/* Loading State */}
      {loading && (
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="inline-block animate-spin">⌛</div>
            <p className="text-slate-600 mt-2">Loading dashboard data...</p>
          </div>
        </div>
      )}

      {/* Stats Cards */}
      {stats && !loading && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard icon="🏠" label="Total Unit" value={stats.totalUnits} color="bg-blue-50 border-blue-200" textColor="text-blue-600" />
          <StatCard icon="✅" label="Tersedia" value={stats.availableUnits} color="bg-emerald-50 border-emerald-200" textColor="text-emerald-600" />
          <StatCard icon="⏳" label="Pending" value={stats.pendingBookings} color="bg-orange-50 border-orange-200" textColor="text-orange-600" />
          <StatCard icon="🎉" label="Terjual" value={stats.soldUnits} color="bg-purple-50 border-purple-200" textColor="text-purple-600" />
        </div>
      )}

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Units Section */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-slate-200">
            <h2 className="text-lg font-bold text-slate-900">📊 Data Unit</h2>
            <p className="text-xs text-slate-500 mt-1">Daftar unit perumahan</p>
          </div>
          <div className="p-6 text-center">
            <div className="text-6xl mb-3">📡</div>
            <p className="text-slate-600">Menghubungkan ke API backend...</p>
            <p className="text-sm text-slate-500 mt-2">Endpoint: <code className="bg-slate-100 px-2 py-1 rounded text-xs">/api/units</code></p>
          </div>
        </div>

        {/* Right Sidebar */}
        <div className="space-y-6">
          {/* Recent Bookings */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
            <h3 className="font-bold text-slate-900 mb-4">📋 Booking Terbaru</h3>
            <div className="text-center">
              <div className="text-4xl mb-2">📡</div>
              <p className="text-slate-600 text-sm">Menghubungkan ke API backend...</p>
              <p className="text-xs text-slate-500 mt-2">Endpoint: <code className="bg-slate-100 px-2 py-1 rounded text-xs">/api/bookings</code></p>
            </div>
          </div>

          {/* Summary Card */}
          <div className="bg-linear-to-br from-indigo-50 to-indigo-100 rounded-xl border border-indigo-200 shadow-sm p-6">
            <h3 className="font-bold text-indigo-900 mb-4">📈 Ringkasan</h3>
            <div className="text-center">
              <div className="text-3xl mb-2">🔄</div>
              <p className="text-sm text-indigo-800">Sinkronisasi dengan server...</p>
            </div>
          </div>
        </div>
      </div>

      {/* Footer Note */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-sm text-blue-700">
        💡 <strong>Info:</strong> Dashboard ini terhubung ke backend API. Pastikan server backend berjalan untuk menampilkan data real.
      </div>
    </div>
  );
}

function StatCard({ 
  icon, 
  label, 
  value, 
  color, 
  textColor 
}: { 
  icon: string;
  label: string; 
  value: number; 
  color: string; 
  textColor: string;
}) {
  return (
    <div className={`${color} border rounded-lg p-6 flex items-center gap-4`}>
      <div className="text-3xl">{icon}</div>
      <div>
        <p className="text-xs text-slate-600 uppercase font-bold tracking-wider">{label}</p>
        <p className={`text-3xl font-bold ${textColor}`}>{value}</p>
      </div>
    </div>
  );
}