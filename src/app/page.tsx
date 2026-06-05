"use client";

import { useMemo } from "react";
import Link from "next/link";
import { useAccountingStore } from "@/hooks/useAccountingStore";
import { useAuth } from "@/contexts/AuthContext";
import { formatIDR } from "@/lib/accounting";
import {
  ArrowRightLeft, Layers, Wallet, TrendingUp, TrendingDown,
  Scale, FileText, ChevronRight, ArrowUpRight,
  ArrowDownRight, Banknote, Building2, CreditCard
} from "lucide-react";

function getGreeting(): string {
  const h = new Date().getHours();
  if (h < 12) return "Selamat Pagi";
  if (h < 15) return "Selamat Siang";
  if (h < 18) return "Selamat Sore";
  return "Selamat Malam";
}

function getCashIcon(name: string) {
  const n = name.toLowerCase();
  if (n.includes("bank")) return Building2;
  if (n.includes("kas")) return Banknote;
  return CreditCard;
}

export default function DashboardPage() {
  const { accounts, transactions, reports, ready } = useAccountingStore();
  const { user } = useAuth();

  const recentTrx = useMemo(() => {
    if (!transactions.length) return [];
    return transactions.slice(-5).reverse().map(trx => {
      const debitAcc = accounts.find(a => a.id === trx.debitAccountId);
      const isInflow = debitAcc?.isCash || debitAcc?.type === "aset";
      return { ...trx, inflow: isInflow };
    });
  }, [transactions, accounts]);

  if (!ready) return <Loading />;

  const { incomeStatement: is, balanceSheet: bs, cashFlowReport: cf, equityChange: eq } = reports;
  const cashAccounts = accounts.filter(a => a.isCash && !a.parentId);
  const totalCash = cf.kasAkhirPeriode;
  const margin = is.totalPendapatan > 0 ? (is.labaBersih / is.totalPendapatan) * 100 : 0;

  return (
    <div className="max-w-6xl mx-auto space-y-5 animate-fade-in">

      {/* ── Greeting Card ────────────────────────────────────── */}
      <div className="bg-white rounded-2xl border border-slate-200/60 shadow-sm p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900">
            {getGreeting()}, {user?.name?.split(" ")[0] || "User"}
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Ringkasan keuangan per {new Date().toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })}
          </p>
        </div>
        <div className="flex items-center gap-5">
          <div className="text-right">
            <p className="text-xs text-slate-400 font-medium">Laba Bersih</p>
            <p className={`text-lg font-bold tabular-nums ${is.labaBersih >= 0 ? "text-emerald-600" : "text-rose-600"}`}>
              {formatIDR(is.labaBersih)}
            </p>
          </div>
          <div className={`px-2.5 py-1 rounded-lg text-xs font-semibold ${margin >= 0 ? "bg-emerald-50 text-emerald-700" : "bg-rose-50 text-rose-700"
            }`}>
            {margin >= 0 ? "+" : ""}{margin.toFixed(1)}%
          </div>
        </div>
      </div>

      {/* ── Metric Cards ─────────────────────────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Total Pendapatan", value: is.totalPendapatan, icon: TrendingUp, iconColor: "text-emerald-500", iconBg: "bg-emerald-50" },
          { label: "Total Beban", value: is.totalBeban, icon: TrendingDown, iconColor: "text-rose-500", iconBg: "bg-rose-50" },
          { label: "Laba Bersih", value: is.labaBersih, icon: Wallet, iconColor: "text-indigo-500", iconBg: "bg-indigo-50" },
          { label: "Total Aset", value: bs.totalAset, icon: Scale, iconColor: "text-amber-500", iconBg: "bg-amber-50" },
        ].map(m => (
          <div key={m.label} className="bg-white rounded-2xl border border-slate-200/60 shadow-sm p-5">
            <div className="flex items-center justify-between mb-3">
              <p className="text-xs font-medium text-slate-500">{m.label}</p>
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${m.iconBg}`}>
                <m.icon className={`w-4 h-4 ${m.iconColor}`} />
              </div>
            </div>
            <p className="text-xl font-bold text-slate-900 tabular-nums">{formatIDR(m.value)}</p>
          </div>
        ))}
      </div>

      {/* ── Middle Row ───────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-5">

        {/* Transactions */}
        <div className="lg:col-span-3 bg-white rounded-2xl border border-slate-200/60 shadow-sm overflow-hidden">
          <div className="flex items-center justify-between px-5 pt-5 pb-3">
            <h2 className="text-sm font-semibold text-slate-800">Transaksi Terakhir</h2>
            <Link href="/transaksi" className="text-xs text-indigo-600 hover:text-indigo-700 flex items-center gap-0.5 font-medium transition-colors">
              Lihat semua <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {recentTrx.length === 0 ? (
            <div className="py-14 text-center text-sm text-slate-400">Belum ada transaksi.</div>
          ) : (
            <div className="px-2 pb-2">
              {recentTrx.map(trx => (
                <div key={trx.id} className="flex items-center gap-3 px-3 py-3 rounded-xl hover:bg-slate-50 transition-colors">
                  <div className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${trx.inflow ? "bg-emerald-50 text-emerald-500" : "bg-rose-50 text-rose-400"
                    }`}>
                    {trx.inflow ? <ArrowDownRight className="w-4 h-4" /> : <ArrowUpRight className="w-4 h-4" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-slate-800 font-medium truncate">{trx.description}</p>
                    <p className="text-xs text-slate-400 mt-0.5">
                      {new Date(trx.date).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" })}
                    </p>
                  </div>
                  <span className={`text-sm font-semibold tabular-nums shrink-0 ${trx.inflow ? "text-emerald-600" : "text-slate-700"
                    }`}>
                    {trx.inflow ? "+" : "-"}{formatIDR(trx.amount)}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Cash & Bank */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200/60 shadow-sm overflow-hidden">
          <div className="px-5 pt-5 pb-3">
            <p className="text-sm font-semibold text-slate-800">Kas & Bank</p>
            <p className="text-2xl font-bold text-slate-900 mt-1 tabular-nums">{formatIDR(totalCash)}</p>
            <p className="text-xs text-slate-400 mt-0.5">Total saldo kas & bank</p>
          </div>
          <div className="px-2 pb-2 space-y-0.5">
            {cashAccounts.map(acc => {
              const bal = reports.balances[acc.id] || 0;
              const Icon = getCashIcon(acc.name);
              return (
                <div key={acc.id} className="flex items-center gap-3 px-3 py-3 rounded-xl hover:bg-slate-50 transition-colors">
                  <div className="w-9 h-9 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-500 shrink-0">
                    <Icon className="w-4 h-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-slate-700 truncate">{acc.name}</p>
                  </div>
                  <span className="text-sm font-semibold text-slate-800 tabular-nums shrink-0 ml-1">{formatIDR(bal)}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* ── Bottom Row ───────────────────────────────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">

        {/* Posisi Keuangan */}
        <div className="bg-white rounded-2xl border border-slate-200/60 shadow-sm p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold text-slate-800">Posisi Keuangan</h2>
            <Link href="/laporan/neraca" className="text-xs text-indigo-600 hover:text-indigo-700 font-medium transition-colors">Detail</Link>
          </div>
          <div className="space-y-3">
            <Row label="Total Aset" value={formatIDR(bs.totalAset)} />
            <Row label="Total Kewajiban" value={formatIDR(bs.totalKewajiban)} />
            <Row label="Ekuitas" value={formatIDR(eq.ekuitasAkhir)} />
          </div>
          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
            <span className="text-xs text-slate-500">Status Neraca</span>
            <span className={`text-xs font-semibold px-2 py-0.5 rounded-md ${bs.isBalanced ? "bg-emerald-50 text-emerald-700" : "bg-amber-50 text-amber-700"
              }`}>
              {bs.isBalanced ? "Seimbang" : `Selisih ${formatIDR(bs.selisih)}`}
            </span>
          </div>
        </div>

        {/* Laba Rugi */}
        <div className="bg-white rounded-2xl border border-slate-200/60 shadow-sm p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold text-slate-800">Laba Rugi</h2>
            <Link href="/laporan/laba-rugi" className="text-xs text-indigo-600 hover:text-indigo-700 font-medium transition-colors">Detail</Link>
          </div>
          <div className="space-y-3">
            <Row label="Pendapatan" value={formatIDR(is.totalPendapatan)} valueColor="text-emerald-600" />
            <Row label="Beban" value={formatIDR(is.totalBeban)} valueColor="text-rose-600" />
          </div>
          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
            <span className="text-sm font-semibold text-slate-700">Laba Bersih</span>
            <span className={`text-sm font-bold tabular-nums ${is.labaBersih >= 0 ? "text-emerald-600" : "text-rose-600"}`}>
              {formatIDR(is.labaBersih)}
            </span>
          </div>
        </div>

        {/* Akses Cepat */}
        <div className="bg-white rounded-2xl border border-slate-200/60 shadow-sm p-5">
          <h2 className="text-sm font-semibold text-slate-800 mb-3">Akses Cepat</h2>
          <div className="space-y-0.5">
            {[
              { href: "/transaksi", icon: ArrowRightLeft, label: "Transaksi", color: "text-indigo-500 bg-indigo-50" },
              { href: "/master-akun", icon: Layers, label: "Master Akun", color: "text-violet-500 bg-violet-50" },
              { href: "/laporan/laba-rugi", icon: TrendingUp, label: "Laba Rugi", color: "text-emerald-500 bg-emerald-50" },
              { href: "/laporan/neraca", icon: Scale, label: "Neraca", color: "text-amber-500 bg-amber-50" },
              { href: "/laporan/arus-kas", icon: Wallet, label: "Arus Kas", color: "text-cyan-500 bg-cyan-50" },
              { href: "/laporan/perubahan-modal", icon: FileText, label: "Perubahan Modal", color: "text-rose-500 bg-rose-50" },
            ].map(item => (
              <Link key={item.href} href={item.href}
                className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-slate-50 transition-colors group"
              >
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${item.color} shrink-0`}>
                  <item.icon className="w-4 h-4" />
                </div>
                <span className="text-sm text-slate-600 group-hover:text-slate-900 font-medium flex-1">{item.label}</span>
                <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-slate-400" />
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ── Shared row component ────────────────────────────────────────── */
function Row({ label, value, valueColor }: { label: string; value: string; valueColor?: string }) {
  return (
    <div className="flex justify-between items-center">
      <span className="text-sm text-slate-500">{label}</span>
      <span className={`text-sm font-semibold tabular-nums ${valueColor || "text-slate-800"}`}>{value}</span>
    </div>
  );
}

/* ── Loading skeleton ────────────────────────────────────────────── */
function Loading() {
  return (
    <div className="max-w-6xl mx-auto space-y-5">
      <div className="h-20 rounded-2xl bg-white border border-slate-200/60 animate-pulse" />
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => <div key={i} className="h-24 rounded-2xl bg-white border border-slate-200/60 animate-pulse" />)}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-5">
        <div className="lg:col-span-3 h-64 rounded-2xl bg-white border border-slate-200/60 animate-pulse" />
        <div className="lg:col-span-2 h-64 rounded-2xl bg-white border border-slate-200/60 animate-pulse" />
      </div>
    </div>
  );
}
