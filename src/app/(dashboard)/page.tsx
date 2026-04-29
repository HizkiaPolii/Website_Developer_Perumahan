"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { TrendingUp, TrendingDown, DollarSign, Activity } from "lucide-react";

interface FinancialStats {
  totalPendapatan: number;
  totalPengeluaran: number;
  labaBersih: number;
  saldoKas: number;
}

interface RecentTransaction {
  id: string;
  date: string;
  description: string;
  type: "pendapatan" | "pengeluaran";
  amount: number;
}

export default function DashboardPage() {
  const [stats, setStats] = useState<FinancialStats | null>(null);
  const [transactions, setTransactions] = useState<RecentTransaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Mock data untuk development
  const mockStats: FinancialStats = {
    totalPendapatan: 150000000,
    totalPengeluaran: 95000000,
    labaBersih: 55000000,
    saldoKas: 65000000,
  };

  const mockTransactions: RecentTransaction[] = [
    {
      id: "1",
      date: "2026-04-28",
      description: "Penjualan Produk A",
      type: "pendapatan",
      amount: 5000000,
    },
    {
      id: "2",
      date: "2026-04-27",
      description: "Gaji Karyawan",
      type: "pengeluaran",
      amount: 20000000,
    },
    {
      id: "3",
      date: "2026-04-26",
      description: "Biaya Sewa Kantor",
      type: "pengeluaran",
      amount: 10000000,
    },
    {
      id: "4",
      date: "2026-04-25",
      description: "Penjualan Produk B",
      type: "pendapatan",
      amount: 3000000,
    },
  ];

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
        const response = await fetch("/api/dashboard/financial-stats", {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });

        if (!response.ok) {
          console.warn("API /api/dashboard/financial-stats tidak tersedia, menggunakan mock data");
          setStats(mockStats);
          setTransactions(mockTransactions);
          setLoading(false);
          return;
        }

        const data = await response.json();
        setStats(data);
      } catch (err) {
        console.warn("Gagal fetch dari API, menggunakan mock data:", err);
        setStats(mockStats);
        setTransactions(mockTransactions);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(value);
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString("id-ID", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-black">Dashboard Keuangan</h1>
        <p className="text-black mt-2">Ringkasan Pengelolaan Keuangan Perusahaan Bulan Ini</p>
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
            <p className="text-black mt-2">Loading dashboard data...</p>
          </div>
        </div>
      )}

      {/* Stats Cards */}
      {stats && !loading && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            icon={<TrendingUp className="w-6 h-6" />}
            label="Total Pendapatan"
            value={formatCurrency(stats.totalPendapatan)}
            color="bg-green-50 border-green-200"
            textColor="text-green-600"
            accentColor="bg-green-500"
          />
          <StatCard
            icon={<TrendingDown className="w-6 h-6" />}
            label="Total Pengeluaran"
            value={formatCurrency(stats.totalPengeluaran)}
            color="bg-red-50 border-red-200"
            textColor="text-red-600"
            accentColor="bg-red-500"
          />
          <StatCard
            icon={<DollarSign className="w-6 h-6" />}
            label="Laba Bersih"
            value={formatCurrency(stats.labaBersih)}
            color="bg-blue-50 border-blue-200"
            textColor="text-blue-600"
            accentColor="bg-blue-500"
          />
          <StatCard
            icon={<Activity className="w-6 h-6" />}
            label="Saldo Kas"
            value={formatCurrency(stats.saldoKas)}
            color="bg-purple-50 border-purple-200"
            textColor="text-purple-600"
            accentColor="bg-purple-500"
          />
        </div>
      )}

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Transaksi Terbaru */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-slate-200">
            <h2 className="text-lg font-bold text-black">💳 Transaksi Terbaru</h2>
            <p className="text-xs text-black mt-1">Daftar transaksi terbaru</p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-black">Tanggal</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-black">Deskripsi</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-black">Jenis</th>
                  <th className="px-6 py-3 text-right text-sm font-semibold text-black">Jumlah</th>
                </tr>
              </thead>
              <tbody>
                {transactions.map((tx, index) => (
                  <tr key={tx.id} className={index !== transactions.length - 1 ? "border-b" : ""}>
                    <td className="px-6 py-3 text-sm text-black">{formatDate(tx.date)}</td>
                    <td className="px-6 py-3 text-sm text-black font-medium">{tx.description}</td>
                    <td className="px-6 py-3 text-sm">
                      <span className={`px-2 py-1 rounded text-xs font-semibold ${
                        tx.type === "pendapatan"
                          ? "bg-green-100 text-green-700"
                          : "bg-red-100 text-red-700"
                      }`}>
                        {tx.type === "pendapatan" ? "Pendapatan" : "Pengeluaran"}
                      </span>
                    </td>
                    <td className="px-6 py-3 text-sm text-right font-semibold text-black">
                      {formatCurrency(tx.amount)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="p-4 border-t border-slate-200 text-center">
            <Link
              href="/dashboard/transactions"
              className="text-sm font-semibold text-indigo-600 hover:text-indigo-700"
            >
              Lihat Semua Transaksi →
            </Link>
          </div>
        </div>

        {/* Right Sidebar */}
        <div className="space-y-6">
          {/* Quick Links */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
            <h3 className="font-bold text-black mb-4">⚡ Akses Cepat</h3>
            <div className="space-y-3">
              <Link
                href="/dashboard/finances"
                className="block p-3 bg-indigo-50 hover:bg-indigo-100 rounded-lg text-sm font-semibold text-indigo-700 transition-colors text-center"
              >
                Pengelolaan Keuangan
              </Link>
              <Link
                href="/dashboard/reports/balance-sheet"
                className="block p-3 bg-blue-50 hover:bg-blue-100 rounded-lg text-sm font-semibold text-blue-700 transition-colors text-center"
              >
                Laporan Neraca
              </Link>
              <Link
                href="/dashboard/reports/income-statement"
                className="block p-3 bg-green-50 hover:bg-green-100 rounded-lg text-sm font-semibold text-green-700 transition-colors text-center"
              >
                Laporan Laba Rugi
              </Link>
              <Link
                href="/dashboard/reports/archive"
                className="block p-3 bg-purple-50 hover:bg-purple-100 rounded-lg text-sm font-semibold text-purple-700 transition-colors text-center"
              >
                Pengarsipan Laporan
              </Link>
            </div>
          </div>

          {/* Summary Info */}
          <div className="bg-linear-to-br from-indigo-50 to-indigo-100 rounded-xl border border-indigo-200 shadow-sm p-6">
            <h3 className="font-bold text-black mb-4">📊 Info Bulan Ini</h3>
            <div className="space-y-3 text-sm">
              <div>
                <p className="text-black text-xs uppercase font-bold">Rasio Keuntungan</p>
                <p className="text-black font-semibold mt-1">
                  {stats ? ((stats.labaBersih / stats.totalPendapatan) * 100).toFixed(1) : 0}%
                </p>
              </div>
              <div className="border-t border-indigo-300 pt-3">
                <p className="text-black text-xs uppercase font-bold">Periode</p>
                <p className="text-black font-semibold mt-1">April 2026</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Info Note */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-sm text-black">
        💡 <strong>Info:</strong> Dashboard ini terhubung ke backend API untuk data keuangan real-time. Pastikan server
        backend berjalan untuk menampilkan data sebenarnya.
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
  accentColor,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  color: string;
  textColor: string;
  accentColor: string;
}) {
  return (
    <div className={`${color} border rounded-lg p-6 flex items-center gap-4`}>
      <div className={`${accentColor} p-3 rounded-lg text-white`}>{icon}</div>
      <div>
        <p className="text-xs text-black uppercase font-bold tracking-wider">{label}</p>
        <p className={`text-2xl font-bold ${textColor}`}>{value}</p>
      </div>
    </div>
  );
}