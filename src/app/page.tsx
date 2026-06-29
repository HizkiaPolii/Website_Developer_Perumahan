"use client";

import { useMemo, useState, useEffect } from "react";
import Link from "next/link";
import { useAccountingStore } from "@/hooks/useAccountingStore";
import { useAuth } from "@/contexts/AuthContext";
import { useApproval } from "@/contexts/ApprovalContext";
import { useUsers, useActivityLogs } from "@/hooks/useApiEndpoints";
import { formatIDR } from "@/lib/accounting";
import {
  ArrowRightLeft, Layers, Wallet, TrendingUp, TrendingDown,
  Scale, FileText, ChevronRight, ArrowUpRight,
  ArrowDownRight, Banknote, Building2, CreditCard,
  Users, ShieldCheck, Activity, ClipboardList,
  CheckCircle2, AlertCircle, PlusCircle, CheckSquare,
  Clock, XCircle, Archive
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

/* ── Admin Dashboard ─────────────────────────────────────────────── */
function AdminDashboard({ user, usersHook, activityLogsHook }: { user: any; usersHook: any; activityLogsHook: any }) {
  const [users, setUsers] = useState<any[]>([]);
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadAdminData() {
      try {
        const [usersData, logsData] = await Promise.all([
          usersHook.getAll(),
          activityLogsHook.getAll({ limit: 5 })
        ]);
        if (usersData) setUsers(usersData);
        if (logsData) setLogs(logsData.slice(0, 5));
      } catch (err) {
        console.error("Gagal memuat data admin:", err);
      } finally {
        setLoading(false);
      }
    }
    loadAdminData();
  }, [usersHook, activityLogsHook]);

  const stats = useMemo(() => {
    const total = users.length;
    const active = users.filter((u: any) => u.isActive).length;
    const inactive = total - active;
    return { total, active, inactive };
  }, [users]);

  if (loading) return <Loading />;

  return (
    <div className="max-w-6xl mx-auto space-y-6 animate-fade-in">
      <div className="bg-white rounded-2xl border border-slate-200/60 shadow-sm p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900">
            {getGreeting()}, {user?.name?.split(" ")[0] || "Admin"}
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Panel Administrator — Kelola pengguna dan pantau log aktivitas sistem
          </p>
        </div>
        <div className="flex items-center gap-2 px-3 py-1.5 bg-red-50 border border-red-100 rounded-xl text-red-700 font-semibold text-xs whitespace-nowrap">
          <ShieldCheck className="w-4 h-4" /> System Administrator
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-2xl border border-slate-200/60 shadow-sm p-5 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-500 shrink-0">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-400 uppercase">Total User</p>
            <p className="text-2xl font-black text-slate-900">{stats.total}</p>
          </div>
        </div>
        <div className="bg-white rounded-2xl border border-slate-200/60 shadow-sm p-5 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-500 shrink-0">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-400 uppercase">User Aktif</p>
            <p className="text-2xl font-black text-slate-900">{stats.active}</p>
          </div>
        </div>
        <div className="bg-white rounded-2xl border border-slate-200/60 shadow-sm p-5 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-rose-50 flex items-center justify-center text-rose-500 shrink-0">
            <XCircle className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-400 uppercase">User Nonaktif</p>
            <p className="text-2xl font-black text-slate-900">{stats.inactive}</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-5">
        <div className="lg:col-span-3 bg-white rounded-2xl border border-slate-200/60 shadow-sm overflow-hidden flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between px-5 pt-5 pb-3">
              <h2 className="text-sm font-semibold text-slate-800 flex items-center gap-1.5">
                <Activity className="w-4 h-4 text-indigo-500" /> Log Aktivitas Terbaru
              </h2>
              <Link href="/activity-log" className="text-xs text-indigo-600 hover:text-indigo-700 flex items-center gap-0.5 font-medium transition-colors">
                Lihat semua <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            {logs.length === 0 ? (
              <div className="py-14 text-center text-sm text-slate-400">Belum ada log aktivitas.</div>
            ) : (
              <div className="px-2 pb-2">
                {logs.map((log: any) => (
                  <div key={log.id} className="flex items-start gap-3 px-3 py-3 rounded-xl hover:bg-slate-50 transition-colors">
                    <div className="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-500 shrink-0 font-bold text-xs mt-0.5">
                      {log.user?.name ? log.user.name.charAt(0).toUpperCase() : "?"}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-slate-800 font-semibold">
                        <span className="text-slate-900 font-bold">{log.user?.name || "Sistem"}</span> melakukan <span className="bg-slate-105 bg-slate-100 text-slate-700 px-1 py-0.5 rounded text-[10px] font-mono">{log.action}</span>
                      </p>
                      <p className="text-xs text-slate-500 mt-1 truncate">{log.details || "-"}</p>
                    </div>
                    <span className="text-[10px] text-slate-400 font-medium whitespace-nowrap">
                      {new Date(log.createdAt).toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" })}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200/60 shadow-sm overflow-hidden flex flex-col justify-between">
          <div>
            <div className="px-5 pt-5 pb-3">
              <h2 className="text-sm font-semibold text-slate-800 flex items-center gap-1.5">
                <Users className="w-4 h-4 text-violet-500" /> Daftar User Terbaru
              </h2>
            </div>
            <div className="px-2 pb-2 space-y-0.5">
              {users.slice(0, 5).map((u: any) => (
                <div key={u.id} className="flex items-center justify-between px-3 py-2.5 rounded-xl hover:bg-slate-50 transition-colors">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center text-slate-600 font-bold text-xs shrink-0">
                      {u.name.charAt(0).toUpperCase()}
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-slate-800 truncate">{u.name}</p>
                      <p className="text-[10px] text-slate-400 truncate">{u.email}</p>
                    </div>
                  </div>
                  <span className={`text-[10px] font-semibold px-2 py-0.5 rounded shrink-0 ${
                    u.role?.toLowerCase() === "admin" ? "bg-red-50 text-red-700 border border-red-100" :
                    u.role?.toLowerCase() === "manager" ? "bg-indigo-50 text-indigo-700 border border-indigo-100" :
                    "bg-slate-100 text-slate-700 border border-slate-200"
                  }`}>
                    {u.role}
                  </span>
                </div>
              ))}
            </div>
          </div>
          <div className="p-4 border-t border-slate-100 bg-slate-50/50">
            <Link href="/users" className="w-full inline-flex items-center justify-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl text-xs transition-colors shadow-sm shadow-indigo-100">
              Kelola Pengguna
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ── Staf Dashboard ──────────────────────────────────────────────── */
function StafDashboard({ user }: { user: any }) {
  const { requests, stats, isLoading } = useApproval();

  const myRequests = useMemo(() => {
    if (!user?.id) return [];
    return requests.filter(r => r.requesterId?.toString() === user.id.toString());
  }, [requests, user]);

  const myStats = useMemo(() => {
    const total = myRequests.length;
    const pending = myRequests.filter(r => r.status === "Pending").length;
    const accManager = myRequests.filter(r => r.status === "ACC Manager").length;
    const accFinal = myRequests.filter(r => r.status === "ACC Final").length;
    const rejected = myRequests.filter(r => r.status === "Tolak").length;
    return { total, pending, accManager, accFinal, rejected };
  }, [myRequests]);

  if (isLoading) return <Loading />;

  return (
    <div className="max-w-6xl mx-auto space-y-6 animate-fade-in">
      <div className="bg-white rounded-2xl border border-slate-200/60 shadow-sm p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900">
            {getGreeting()}, {user?.name?.split(" ")[0] || "User"}
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Panel Staf — Buat pengajuan barang dan pantau status persetujuan pengadaan
          </p>
        </div>
        <div className="flex gap-2">
          <Link href="/approval" className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl text-xs transition-colors shadow-sm shadow-indigo-100 flex items-center gap-1.5 whitespace-nowrap">
            <PlusCircle className="w-4 h-4" /> Buat Pengajuan Baru
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        {[
          { label: "Total Pengajuan", value: myStats.total, icon: ClipboardList, color: "text-indigo-500", bg: "bg-indigo-50" },
          { label: "Menunggu Manager", value: myStats.pending, icon: Clock, color: "text-amber-500", bg: "bg-amber-50" },
          { label: "Menunggu Owner", value: myStats.accManager, icon: Clock, color: "text-blue-500", bg: "bg-blue-50" },
          { label: "Disetujui Final", value: myStats.accFinal, icon: CheckCircle2, color: "text-emerald-500", bg: "bg-emerald-50" },
          { label: "Ditolak", value: myStats.rejected, icon: XCircle, color: "text-rose-500", bg: "bg-rose-50" },
        ].map(m => (
          <div key={m.label} className="bg-white rounded-2xl border border-slate-200/60 shadow-sm p-4 flex flex-col justify-between">
            <div className="flex items-center justify-between mb-2">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{m.label}</p>
              <div className={`w-7 h-7 rounded-lg flex items-center justify-center ${m.bg}`}>
                <m.icon className={`w-4 h-4 ${m.color}`} />
              </div>
            </div>
            <p className="text-xl font-black text-slate-900">{m.value}</p>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-2xl border border-slate-200/60 shadow-sm overflow-hidden">
        <div className="flex items-center justify-between px-5 pt-5 pb-3">
          <h2 className="text-sm font-semibold text-slate-800 flex items-center gap-1.5">
            <ClipboardList className="w-4 h-4 text-indigo-500" /> Pengajuan Terakhir Saya
          </h2>
          <Link href="/approval" className="text-xs text-indigo-600 hover:text-indigo-700 flex items-center gap-0.5 font-medium transition-colors">
            Lihat semua <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {myRequests.length === 0 ? (
          <div className="py-14 text-center text-sm text-slate-400">Belum ada pengajuan.</div>
        ) : (
          <div className="px-2 pb-2">
            {myRequests.slice(-5).reverse().map(req => (
              <div key={req.id} className="flex items-center gap-3 px-3 py-3 rounded-xl hover:bg-slate-50 transition-colors">
                <div className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${
                  req.status === "ACC Final" ? "bg-emerald-50 text-emerald-500" :
                  req.status === "Tolak" ? "bg-rose-50 text-rose-500" :
                  "bg-amber-50 text-amber-500"
                }`}>
                  <ClipboardList className="w-4 h-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-slate-800 font-semibold truncate">{req.item}</p>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Proyek: {req.department} • Jumlah: {req.quantity} • Diajukan: {req.date}
                  </p>
                </div>
                <div className="text-right shrink-0">
                  <p className="text-sm font-bold text-slate-800">{formatIDR(req.amount)}</p>
                  <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full ${
                    req.status === "ACC Final" ? "bg-emerald-50 text-emerald-700 border border-emerald-100" :
                    req.status === "Tolak" ? "bg-rose-50 text-rose-700 border border-rose-100" :
                    "bg-amber-50 text-amber-700 border border-amber-100"
                  }`}>
                    {req.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

/* ── Teller Dashboard ────────────────────────────────────────────── */
function TellerDashboard({ user }: { user: any }) {
  const { accounts, transactions, reports, ready } = useAccountingStore();

  const tellerTrx = useMemo(() => {
    if (!transactions.length) return [];
    return transactions.map(trx => {
      const debitAcc = accounts.find(a => a.id === trx.debitAccountId);
      const isInflow = debitAcc?.isCash || debitAcc?.type === "aset";
      return { ...trx, inflow: isInflow };
    });
  }, [transactions, accounts]);

  const stats = useMemo(() => {
    const total = transactions.length;
    const pending = transactions.filter(t => t.status === "PENDING").length;
    const posted = transactions.filter(t => t.status === "POSTED" || t.status === "APPROVED").length;
    const draft = transactions.filter(t => t.status === "DRAFT" || t.status === "REJECTED").length;
    return { total, pending, posted, draft };
  }, [transactions]);

  if (!ready) return <Loading />;

  const cashAccounts = accounts.filter(a => a.isCash && !a.parentId);
  const totalCash = reports.cashFlowReport.kasAkhirPeriode;

  return (
    <div className="max-w-6xl mx-auto space-y-6 animate-fade-in">
      <div className="bg-white rounded-2xl border border-slate-200/60 shadow-sm p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900">
            {getGreeting()}, {user?.name?.split(" ")[0] || "User"}
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Panel Teller — Input transaksi keuangan dan kelola bagan akun
          </p>
        </div>
        <div className="flex gap-2">
          <Link href="/transaksi" className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl text-xs transition-colors shadow-sm shadow-indigo-100 flex items-center gap-1.5 whitespace-nowrap">
            <PlusCircle className="w-4 h-4" /> Input Transaksi Baru
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Total Transaksi", value: stats.total, icon: ArrowRightLeft, color: "text-indigo-500", bg: "bg-indigo-50" },
          { label: "Menunggu Approval", value: stats.pending, icon: Clock, color: "text-amber-500", bg: "bg-amber-50" },
          { label: "Disetujui/Posting", value: stats.posted, icon: CheckCircle2, color: "text-emerald-500", bg: "bg-emerald-50" },
          { label: "Draf/Ditolak", value: stats.draft, icon: XCircle, color: "text-rose-500", bg: "bg-rose-50" },
        ].map(m => (
          <div key={m.label} className="bg-white rounded-2xl border border-slate-200/60 shadow-sm p-5 flex flex-col justify-between">
            <div className="flex items-center justify-between mb-3">
              <p className="text-xs font-semibold text-slate-405 text-slate-400 uppercase">{m.label}</p>
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${m.bg}`}>
                <m.icon className={`w-4 h-4 ${m.color}`} />
              </div>
            </div>
            <p className="text-2xl font-black text-slate-900">{m.value}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-5">
        <div className="lg:col-span-3 bg-white rounded-2xl border border-slate-200/60 shadow-sm overflow-hidden flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between px-5 pt-5 pb-3">
              <h2 className="text-sm font-semibold text-slate-800 flex items-center gap-1.5">
                <ArrowRightLeft className="w-4 h-4 text-indigo-500" /> Transaksi Terakhir Saya
              </h2>
              <Link href="/transaksi" className="text-xs text-indigo-600 hover:text-indigo-700 flex items-center gap-0.5 font-medium transition-colors">
                Lihat semua <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            {tellerTrx.length === 0 ? (
              <div className="py-14 text-center text-sm text-slate-400">Belum ada transaksi.</div>
            ) : (
              <div className="px-2 pb-2">
                {tellerTrx.slice(-5).reverse().map(trx => (
                  <div key={trx.id} className="flex items-center gap-3 px-3 py-3 rounded-xl hover:bg-slate-50 transition-colors">
                    <div className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${trx.inflow ? "bg-emerald-50 text-emerald-500" : "bg-rose-50 text-rose-400"
                      }`}>
                      {trx.inflow ? <ArrowDownRight className="w-4 h-4" /> : <ArrowUpRight className="w-4 h-4" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-slate-800 font-semibold truncate">{trx.description}</p>
                      <p className="text-xs text-slate-400 mt-0.5">
                        {new Date(trx.date).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" })} • Status: <span className="font-bold">{trx.status}</span>
                      </p>
                    </div>
                    <span className={`text-sm font-bold tabular-nums shrink-0 ${trx.inflow ? "text-emerald-600" : "text-slate-700"
                      }`}>
                      {trx.inflow ? "+" : "-"}{formatIDR(trx.amount)}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200/60 shadow-sm overflow-hidden flex flex-col justify-between">
          <div>
            <div className="px-5 pt-5 pb-3">
              <p className="text-xs font-bold text-slate-400 uppercase">Kas & Bank</p>
              <p className="text-2xl font-black text-slate-900 mt-1 tabular-nums">{formatIDR(totalCash)}</p>
              <p className="text-[10px] text-slate-400 mt-0.5">Total saldo kas & bank operasional</p>
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
                      <p className="text-xs font-semibold text-slate-707 text-slate-700 truncate">{acc.name}</p>
                    </div>
                    <span className="text-xs font-bold text-slate-800 tabular-nums shrink-0 ml-1">{formatIDR(bal)}</span>
                  </div>
                );
              })}
            </div>
          </div>
          <div className="p-4 border-t border-slate-100 bg-slate-50/50">
            <Link href="/master-akun" className="w-full inline-flex items-center justify-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-900 text-white font-bold rounded-xl text-xs transition-colors">
              Lihat Master Akun (COA)
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ── Manager Dashboard ───────────────────────────────────────────── */
function ManagerDashboard({ user }: { user: any }) {
  const { accounts, transactions, reports, ready } = useAccountingStore();
  const { requests } = useApproval();

  const recentTrx = useMemo(() => {
    if (!transactions.length) return [];
    return transactions.slice(-5).reverse().map(trx => {
      const debitAcc = accounts.find(a => a.id === trx.debitAccountId);
      const isInflow = debitAcc?.isCash || debitAcc?.type === "aset";
      return { ...trx, inflow: isInflow };
    });
  }, [transactions, accounts]);

  const pendingTrxCount = useMemo(() => {
    return transactions.filter(t => t.status === "PENDING").length;
  }, [transactions]);

  const pendingPRCount = useMemo(() => {
    return requests.filter(r => r.status === "Pending").length;
  }, [requests]);

  if (!ready) return <Loading />;

  const { incomeStatement: is, balanceSheet: bs, cashFlowReport: cf, equityChange: eq } = reports;
  const cashAccounts = accounts.filter(a => a.isCash && !a.parentId);
  const totalCash = cf.kasAkhirPeriode;
  const margin = is.totalPendapatan > 0 ? (is.labaBersih / is.totalPendapatan) * 100 : 0;

  const quickAccessItems = [
    { href: "/transaksi", icon: ArrowRightLeft, label: "Transaksi", color: "text-indigo-500 bg-indigo-50" },
    { href: "/transaksi/approval", icon: CheckSquare, label: "Approval Transaksi", color: "text-violet-500 bg-violet-50" },
    { href: "/approval", icon: ClipboardList, label: "Approval Pengadaan", color: "text-amber-500 bg-amber-50" },
    { href: "/laporan/laba-rugi", icon: TrendingUp, label: "Laba Rugi", color: "text-emerald-500 bg-emerald-50" },
    { href: "/laporan/neraca", icon: Scale, label: "Neraca", color: "text-amber-500 bg-amber-50" },
    { href: "/laporan/arus-kas", icon: Wallet, label: "Arus Kas", color: "text-cyan-500 bg-cyan-50" },
    { href: "/laporan/perubahan-modal", icon: FileText, label: "Perubahan Modal", color: "text-rose-500 bg-rose-50" },
    { href: "/laporan/arsip", icon: Archive, label: "Arsip Laporan", color: "text-slate-500 bg-slate-100" },
  ];

  return (
    <div className="max-w-6xl mx-auto space-y-5 animate-fade-in">
      <div className="bg-white rounded-2xl border border-slate-200/60 shadow-sm p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900">
            {getGreeting()}, {user?.name?.split(" ")[0] || "Manager"}
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Panel Manager — Pantau keuangan perusahaan, kelola laporan, dan lakukan persetujuan (approval)
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

      {(pendingTrxCount > 0 || pendingPRCount > 0) && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {pendingTrxCount > 0 && (
            <div className="bg-amber-50 border border-amber-200/80 rounded-2xl p-4 flex items-center justify-between gap-3 animate-pulse">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center text-amber-600 shrink-0">
                  <AlertCircle className="w-5 h-5" />
                </div>
                <div className="min-w-0">
                  <h3 className="text-sm font-bold text-amber-900">Persetujuan Transaksi</h3>
                  <p className="text-xs text-amber-700 mt-0.5 truncate">Ada {pendingTrxCount} transaksi menunggu approval Anda.</p>
                </div>
              </div>
              <Link href="/transaksi/approval" className="px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-xl text-xs transition-all whitespace-nowrap shadow-sm shrink-0">
                Proses
              </Link>
            </div>
          )}
          {pendingPRCount > 0 && (
            <div className="bg-blue-50 border border-blue-200/80 rounded-2xl p-4 flex items-center justify-between gap-3 animate-pulse">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center text-blue-600 shrink-0">
                  <AlertCircle className="w-5 h-5" />
                </div>
                <div className="min-w-0">
                  <h3 className="text-sm font-bold text-blue-900">Persetujuan Pengadaan</h3>
                  <p className="text-xs text-blue-700 mt-0.5 truncate">Ada {pendingPRCount} pengadaan barang menunggu validasi Manager.</p>
                </div>
              </div>
              <Link href="/approval" className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-xs transition-all whitespace-nowrap shadow-sm shrink-0">
                Proses
              </Link>
            </div>
          )}
        </div>
      )}

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Total Pendapatan", value: is.totalPendapatan, icon: TrendingUp, iconColor: "text-emerald-500", iconBg: "bg-emerald-50" },
          { label: "Total Beban", value: is.totalBeban, icon: TrendingDown, iconColor: "text-rose-500", iconBg: "bg-rose-50" },
          { label: "Laba Bersih", value: is.labaBersih, icon: Wallet, iconColor: "text-indigo-500", iconBg: "bg-indigo-50" },
          { label: "Total Aset", value: bs.totalAset, icon: Scale, iconColor: "text-amber-500", iconBg: "bg-amber-50" },
        ].map(m => (
          <div key={m.label} className="bg-white rounded-2xl border border-slate-200/60 shadow-sm p-5">
            <div className="flex items-center justify-between mb-3">
              <p className="text-xs font-semibold text-slate-500">{m.label}</p>
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${m.iconBg}`}>
                <m.icon className={`w-4 h-4 ${m.iconColor}`} />
              </div>
            </div>
            <p className="text-xl font-bold text-slate-900 tabular-nums">{formatIDR(m.value)}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-5">
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
                  <div className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${trx.inflow ? "bg-emerald-50 text-emerald-500" : "bg-rose-50 text-rose-450"
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

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
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

        <div className="bg-white rounded-2xl border border-slate-200/60 shadow-sm p-5 flex flex-col justify-between">
          <div>
            <h2 className="text-sm font-semibold text-slate-800 mb-3">Akses Cepat</h2>
            <div className="grid grid-cols-2 gap-2">
              {quickAccessItems.map(item => (
                <Link key={item.href} href={item.href}
                  className="flex items-center gap-2 p-2 rounded-xl hover:bg-slate-50 border border-transparent hover:border-slate-100 transition-all group"
                >
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${item.color} shrink-0`}>
                    <item.icon className="w-4 h-4" />
                  </div>
                  <span className="text-[11px] font-bold text-slate-600 group-hover:text-slate-900 truncate leading-snug">{item.label}</span>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ── Owner Dashboard ─────────────────────────────────────────────── */
function OwnerDashboard({ user, activityLogsHook }: { user: any; activityLogsHook: any }) {
  const { accounts, transactions, reports, ready } = useAccountingStore();
  const { requests } = useApproval();
  const [logs, setLogs] = useState<any[]>([]);

  useEffect(() => {
    async function loadLogs() {
      try {
        const logsData = await activityLogsHook.getAll({ limit: 5 });
        if (logsData) setLogs(logsData.slice(0, 5));
      } catch (err) {
        console.error("Gagal memuat log aktivitas:", err);
      }
    }
    loadLogs();
  }, [activityLogsHook]);

  const recentTrx = useMemo(() => {
    if (!transactions.length) return [];
    return transactions.slice(-5).reverse().map(trx => {
      const debitAcc = accounts.find(a => a.id === trx.debitAccountId);
      const isInflow = debitAcc?.isCash || debitAcc?.type === "aset";
      return { ...trx, inflow: isInflow };
    });
  }, [transactions, accounts]);

  const pendingPRCount = useMemo(() => {
    return requests.filter(r => r.status === "ACC Manager").length;
  }, [requests]);

  if (!ready) return <Loading />;

  const { incomeStatement: is, balanceSheet: bs, cashFlowReport: cf, equityChange: eq } = reports;
  const cashAccounts = accounts.filter(a => a.isCash && !a.parentId);
  const totalCash = cf.kasAkhirPeriode;
  const margin = is.totalPendapatan > 0 ? (is.labaBersih / is.totalPendapatan) * 100 : 0;

  const quickAccessItems = [
    { href: "/transaksi", icon: ArrowRightLeft, label: "Transaksi", color: "text-indigo-500 bg-indigo-50" },
    { href: "/approval", icon: ClipboardList, label: "Approval Pengadaan", color: "text-amber-500 bg-amber-50" },
    { href: "/activity-log", icon: Activity, label: "Activity Log", color: "text-violet-500 bg-violet-50" },
    { href: "/laporan/laba-rugi", icon: TrendingUp, label: "Laba Rugi", color: "text-emerald-500 bg-emerald-50" },
    { href: "/laporan/neraca", icon: Scale, label: "Neraca", color: "text-amber-500 bg-amber-50" },
    { href: "/laporan/arus-kas", icon: Wallet, label: "Arus Kas", color: "text-cyan-500 bg-cyan-50" },
    { href: "/laporan/perubahan-modal", icon: FileText, label: "Perubahan Modal", color: "text-rose-500 bg-rose-50" },
    { href: "/laporan/arsip", icon: Archive, label: "Arsip Laporan", color: "text-slate-500 bg-slate-100" },
  ];

  return (
    <div className="max-w-6xl mx-auto space-y-5 animate-fade-in">
      <div className="bg-white rounded-2xl border border-slate-200/60 shadow-sm p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900">
            {getGreeting()}, {user?.name?.split(" ")[0] || "Owner"}
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Panel Direktur/Owner — Analisis kesehatan keuangan perusahaan dan persetujuan final (Final ACC)
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

      {pendingPRCount > 0 && (
        <div className="bg-purple-50 border border-purple-200/85 rounded-2xl p-4 flex items-center justify-between gap-3 animate-pulse">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-xl bg-purple-100 flex items-center justify-center text-purple-700 shrink-0">
              <AlertCircle className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <h3 className="text-sm font-bold text-purple-900">Persetujuan Akhir Pengadaan</h3>
              <p className="text-xs text-purple-700 mt-0.5 truncate">Ada {pendingPRCount} pengadaan barang menunggu persetujuan akhir (Final ACC) Anda.</p>
            </div>
          </div>
          <Link href="/approval" className="px-3 py-1.5 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-xl text-xs transition-all whitespace-nowrap shadow-sm shrink-0">
            Proses
          </Link>
        </div>
      )}

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Total Pendapatan", value: is.totalPendapatan, icon: TrendingUp, iconColor: "text-emerald-500", iconBg: "bg-emerald-50" },
          { label: "Total Beban", value: is.totalBeban, icon: TrendingDown, iconColor: "text-rose-500", iconBg: "bg-rose-50" },
          { label: "Laba Bersih", value: is.labaBersih, icon: Wallet, iconColor: "text-indigo-500", iconBg: "bg-indigo-50" },
          { label: "Total Aset", value: bs.totalAset, icon: Scale, iconColor: "text-amber-500", iconBg: "bg-amber-50" },
        ].map(m => (
          <div key={m.label} className="bg-white rounded-2xl border border-slate-200/60 shadow-sm p-5">
            <div className="flex items-center justify-between mb-3">
              <p className="text-xs font-semibold text-slate-500">{m.label}</p>
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${m.iconBg}`}>
                <m.icon className={`w-4 h-4 ${m.iconColor}`} />
              </div>
            </div>
            <p className="text-xl font-bold text-slate-900 tabular-nums">{formatIDR(m.value)}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-5">
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

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
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

        <div className="bg-white rounded-2xl border border-slate-200/60 shadow-sm p-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-sm font-semibold text-slate-800 flex items-center gap-1.5">
                <Activity className="w-4 h-4 text-indigo-500" /> Log Aktivitas Terbaru
              </h2>
              <Link href="/activity-log" className="text-xs text-indigo-600 hover:text-indigo-700 font-medium transition-colors">Detail</Link>
            </div>
            <div className="space-y-2">
              {logs.map((log: any) => (
                <div key={log.id} className="text-xs text-slate-600 flex justify-between items-start gap-1">
                  <span className="font-semibold text-slate-700 truncate max-w-[150px]">{log.user?.name || "Sistem"}</span>
                  <span className="text-slate-400 text-[10px] whitespace-nowrap">{log.action}</span>
                </div>
              ))}
              {logs.length === 0 && <p className="text-xs text-slate-400 py-4 text-center">Belum ada aktivitas.</p>}
            </div>
          </div>
          <div className="border-t border-slate-100 pt-3 mt-3">
            <div className="grid grid-cols-2 gap-2">
              {quickAccessItems.slice(0, 4).map(item => (
                <Link key={item.href} href={item.href} className="text-[10px] font-bold text-slate-500 hover:text-indigo-600 bg-slate-50 p-2 rounded-lg text-center transition-colors truncate">
                  {item.label}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ── Main Routing Component ──────────────────────────────────────── */
export default function DashboardPage() {
  const { user, isLoading } = useAuth();
  const usersHook = useUsers();
  const activityLogsHook = useActivityLogs();

  if (isLoading) return <Loading />;

  const role = user?.role?.toLowerCase() || "manager";

  if (role === "admin") {
    return <AdminDashboard user={user} usersHook={usersHook} activityLogsHook={activityLogsHook} />;
  }
  if (role === "staf") {
    return <StafDashboard user={user} />;
  }
  if (role === "teller") {
    return <TellerDashboard user={user} />;
  }
  if (role === "owner") {
    return <OwnerDashboard user={user} activityLogsHook={activityLogsHook} />;
  }
  
  // Manager is default
  return <ManagerDashboard user={user} />;
}
