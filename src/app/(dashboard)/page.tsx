"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { TrendingUp, TrendingDown, DollarSign, Activity, Loader } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useDashboard } from "@/hooks/useApiEndpoints";
import { DashboardStats } from "@/types/financial-system";
import { formatCurrency, formatDate } from "@/utils/financial-constants";

export default function DashboardPage() {
  const { user, isLoading: isAuthLoading } = useAuth();
  const { getStats, getRecentTransactions, loading, error } = useDashboard();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [transactions, setTransactions] = useState<any[]>([]);

  useEffect(() => {
    // Wait until auth is loaded and user exists
    if (isAuthLoading || !user) {
      console.log('Waiting for auth...');
      return;
    }

    console.log('User loaded, fetching dashboard data...');
    
    const loadDashboardData = async () => {
      try {
        const [statsData, txData] = await Promise.all([
          getStats(),
          getRecentTransactions()
        ]);

        if (statsData) setStats(statsData);
        if (txData) setTransactions(txData);
      } catch (err) {
        console.error("Error loading dashboard:", err);
      }
    };

    loadDashboardData();
  }, [getStats, getRecentTransactions, user, isAuthLoading]);

  if (isAuthLoading || loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <Loader className="w-8 h-8 animate-spin mx-auto text-blue-500" />
          <p className="text-black mt-2">Loading dashboard data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
        <strong>Error:</strong> {error}
        <details className="mt-2 text-sm">
          <summary>Debug info</summary>
          <pre className="bg-red-100 p-2 mt-1 text-xs overflow-auto">
            Check browser console for more details
          </pre>
        </details>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-black">Dashboard Keuangan</h1>
        <p className="text-black mt-2">Ringkasan Pengelolaan Keuangan Perusahaan</p>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            icon={<TrendingUp className="w-6 h-6" />}
            label="Total Revenue"
            value={formatCurrency(stats.totalRevenue)}
            color="bg-green-50 border-green-200"
            textColor="text-green-600"
            accentColor="bg-green-500"
          />
          <StatCard
            icon={<TrendingDown className="w-6 h-6" />}
            label="Total Expense"
            value={formatCurrency(stats.totalExpense)}
            color="bg-red-50 border-red-200"
            textColor="text-red-600"
            accentColor="bg-red-500"
          />
          <StatCard
            icon={<DollarSign className="w-6 h-6" />}
            label="Net Profit"
            value={formatCurrency(stats.netProfit)}
            color="bg-blue-50 border-blue-200"
            textColor="text-blue-600"
            accentColor="bg-blue-500"
          />
          <StatCard
            icon={<Activity className="w-6 h-6" />}
            label="Total Assets"
            value={formatCurrency(stats.totalAssets)}
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
                  <th className="px-6 py-3 text-left text-sm font-semibold text-black">Tipe</th>
                  <th className="px-6 py-3 text-right text-sm font-semibold text-black">Jumlah</th>
                </tr>
              </thead>
              <tbody>
                {transactions.map((tx, index) => (
                  <tr key={tx.id} className={index !== transactions.length - 1 ? "border-b" : ""}>
                    <td className="px-6 py-3 text-sm text-black">{formatDate(tx.transactionDate)}</td>
                    <td className="px-6 py-3 text-sm text-black font-medium">{tx.description}</td>
                    <td className="px-6 py-3 text-sm">
                      <span className={`px-2 py-1 rounded text-xs font-semibold ${
                        tx.transactionType === "PENDAPATAN"
                          ? "bg-green-100 text-green-700"
                          : "bg-red-100 text-red-700"
                      }`}>
                        {tx.transactionType === "PENDAPATAN" ? "Pendapatan" : "Pengeluaran"}
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
        </div>

        {/* Quick Links */}
        <div className="space-y-4">
          <Link
            href="/transactions"
            className="block p-4 bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-200 rounded-xl hover:shadow-md transition-all"
          >
            <h3 className="font-semibold text-blue-900">📊 Transaksi</h3>
            <p className="text-xs text-blue-700 mt-1">Kelola transaksi keuangan</p>
          </Link>
          <Link
            href="/chart-of-accounts"
            className="block p-4 bg-gradient-to-br from-purple-50 to-purple-100 border border-purple-200 rounded-xl hover:shadow-md transition-all"
          >
            <h3 className="font-semibold text-purple-900">📁 Akun</h3>
            <p className="text-xs text-purple-700 mt-1">Kelola Chart of Accounts</p>
          </Link>
          <Link
            href="/reports/balance-sheet"
            className="block p-4 bg-gradient-to-br from-green-50 to-green-100 border border-green-200 rounded-xl hover:shadow-md transition-all"
          >
            <h3 className="font-semibold text-green-900">📈 Laporan</h3>
            <p className="text-xs text-green-700 mt-1">Lihat laporan keuangan</p>
          </Link>
        </div>
      </div>
    </div>
  );
}

// StatCard Component
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
    <div className={`${color} border rounded-xl p-4 flex items-start justify-between`}>
      <div>
        <p className="text-sm text-slate-600">{label}</p>
        <p className={`text-2xl font-bold mt-2 ${textColor}`}>{value}</p>
      </div>
      <div className={`${accentColor} text-white p-2 rounded-lg`}>
        {icon}
      </div>
    </div>
  );
}