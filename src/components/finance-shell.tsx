"use client";

import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard, ArrowRightLeft, Layers, Wallet,
  TrendingUp, Scale, CircleDollarSign, LogOut, Menu, X,
  Loader2, CheckCircle, Users, FileText, Settings, Archive, ShieldAlert, type LucideIcon
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import SessionWarningModal from "./SessionWarningModal";

// ── Types ───────────────────────────────────────────────────────────
interface MenuItem {
  name: string;
  href: string;
  icon: LucideIcon;
  roles: string[];
}

interface MenuGroup {
  label: string;
  items: MenuItem[];
}

export function FinanceShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [open, setOpen] = useState(false);

  const {
    user,
    isLoading,
    isAuthenticated,
    logout,
    showIdleWarning,
    remainingIdleSeconds,
    extendSession
  } = useAuth();

  // Redirect to login if unauthenticated and not on the login page
  useEffect(() => {
    if (!isLoading && !isAuthenticated && pathname !== "/login") {
      router.replace("/login");
    }
  }, [isLoading, isAuthenticated, pathname, router]);

  // Centralized Route Guard based on user role
  // IMPORTANT: This useMemo MUST be before any early returns to respect Rules of Hooks
  const isAllowed = useMemo(() => {
    if (!user) return true; // Let auth checks handle unauthenticated states

    const role = user.role?.toLowerCase() || "guest";

    // Rules matching pathname prefix to allowed roles
    const rules = [
      { prefix: "/users", allowed: ["admin"] },
      { prefix: "/transaksi", allowed: ["manager"] },
      { prefix: "/master-akun", allowed: ["manager"] },
      { prefix: "/laporan", allowed: ["manager", "owner"] },
      { prefix: "/approval", allowed: ["staf", "manager", "owner"] },
      { prefix: "/activity-log", allowed: ["admin", "owner"] },
    ];

    for (const rule of rules) {
      if (pathname.startsWith(rule.prefix)) {
        return rule.allowed.includes(role);
      }
    }

    return true;
  }, [user, pathname]);

  // Login page and archive print view bypass the shell completely
  if (pathname === "/login" || pathname.startsWith("/laporan/arsip/view")) {
    return <>{children}</>;
  }

  // Show a elegant full-screen spinner while restoring authentication state
  if (isLoading || (!isAuthenticated && pathname !== "/login")) {
    return (
      <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center gap-3">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
        <p className="text-slate-400 text-sm font-medium">Memuat sesi...</p>
      </div>
    );
  }

  // ── Menu grouped by category ──────────────────────────────────────
  const menuGroups: MenuGroup[] = [
    {
      label: "Utama",
      items: [
        { name: "Dashboard", href: "/", icon: LayoutDashboard, roles: ["Admin", "Manager", "Owner", "Staf"] },
      ],
    },
    {
      label: "Keuangan",
      items: [
        { name: "Transaksi", href: "/transaksi", icon: ArrowRightLeft, roles: ["Manager"] },
        { name: "Master Akun", href: "/master-akun", icon: Layers, roles: ["Manager"] },
      ],
    },
    {
      label: "Laporan",
      items: [
        { name: "Arus Kas", href: "/laporan/arus-kas", icon: Wallet, roles: ["Manager", "Owner"] },
        { name: "Laba Rugi", href: "/laporan/laba-rugi", icon: TrendingUp, roles: ["Manager", "Owner"] },
        { name: "Perubahan Modal", href: "/laporan/perubahan-modal", icon: CircleDollarSign, roles: ["Manager", "Owner"] },
        { name: "Neraca", href: "/laporan/neraca", icon: Scale, roles: ["Manager", "Owner"] },
        { name: "Pengarsipan Laporan", href: "/laporan/arsip", icon: Archive, roles: ["Manager", "Owner"] },
      ],
    },
    {
      label: "Administrasi",
      items: [
        { name: "Approval", href: "/approval", icon: CheckCircle, roles: ["Staf", "Manager", "Owner"] },
        { name: "Activity Log", href: "/activity-log", icon: FileText, roles: ["Admin", "Owner"] },
        { name: "Manajemen User", href: "/users", icon: Users, roles: ["Admin"] },
      ],
    },
  ];

  const userRole = user?.role || "Manager";

  // Filter groups: only show groups that have at least one visible item
  const filteredGroups = menuGroups
    .map(group => ({
      ...group,
      items: group.items.filter(item =>
        item.roles.some(r => r.toLowerCase() === userRole.toLowerCase())
      ),
    }))
    .filter(group => group.items.length > 0);

  const NavItems = ({ onNavigate }: { onNavigate?: () => void }) => (
    <nav className="px-4 space-y-6">
      {filteredGroups.map((group, gi) => (
        <div key={group.label}>
          {/* Section label */}
          <div className="flex items-center gap-3 px-3 mb-3">
            <span className="text-[11px] font-bold uppercase tracking-[0.2em] text-slate-500 whitespace-nowrap">
              {group.label}
            </span>
            <div className="flex-1 h-px bg-slate-700/60" />
          </div>

          {/* Menu items */}
          <div className="space-y-1">
            {group.items.map(item => {
              const active = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={onNavigate}
                  className={`flex items-center gap-3.5 px-4 py-3 rounded-xl font-medium transition-all duration-150 ${
                    active
                      ? "bg-indigo-600 text-white shadow-lg shadow-indigo-900/30 text-[15px]"
                      : "text-slate-400 hover:bg-slate-800 hover:text-white text-[15px]"
                  }`}
                >
                  <item.icon className={`w-5 h-5 shrink-0 ${active ? "text-indigo-200" : "text-slate-500"}`} />
                  <span className="truncate">{item.name}</span>
                </Link>
              );
            })}
          </div>
        </div>
      ))}
    </nav>
  );

  const Brand = () => (
    <div className="flex flex-col items-center justify-center h-20 border-b border-slate-800 shrink-0 gap-1">
      <span className="text-2xl font-black tracking-wider">
        <span className="text-indigo-400">PRO</span>
        <span className="text-white">DEV</span>
      </span>
      <span className="text-[9px] font-semibold text-slate-600 tracking-[0.3em] uppercase">Housing Finance</span>
    </div>
  );

  return (
    <div className="flex h-screen bg-slate-100 overflow-hidden print:h-auto print:overflow-visible print:bg-white">
      {/* ── Desktop Sidebar ─────────────────────────────────────── */}
      <aside className="hidden md:flex flex-col w-72 bg-slate-900 shrink-0 print:hidden">
        <Brand />
        <div className="flex-1 overflow-y-auto py-5 scrollbar-thin">
          <NavItems />
        </div>

        {/* User info + footer */}
        <div className="border-t border-slate-800 p-4 space-y-3">
          <div className="flex items-center gap-3 px-1">
            <div className="w-10 h-10 rounded-xl bg-indigo-600/20 flex items-center justify-center text-indigo-400 text-sm font-black shrink-0">
              {(user?.name || "U").charAt(0).toUpperCase()}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold text-slate-300 truncate">{user?.name || "User"}</p>
              <p className="text-[11px] text-slate-500 font-medium uppercase tracking-wider">{user?.role || "Guest"}</p>
            </div>
          </div>
          <div className="text-[10px] text-slate-600 text-center font-semibold tracking-widest pt-3 border-t border-slate-800/60">
            FINANCE SYSTEM v2.0
          </div>
        </div>
      </aside>

      {/* ── Mobile Drawer ───────────────────────────────────────── */}
      {open && (
        <div className="fixed inset-0 z-50 flex md:hidden">
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setOpen(false)} />
          <aside className="relative flex flex-col w-72 max-w-[85vw] bg-slate-900 animate-slide-in-left">
            <button onClick={() => setOpen(false)} className="absolute top-4 right-[-44px] p-2 bg-slate-800 rounded-full text-white">
              <X className="w-5 h-5" />
            </button>
            <Brand />
            <div className="flex-1 overflow-y-auto py-4">
              <NavItems onNavigate={() => setOpen(false)} />
            </div>
          </aside>
        </div>
      )}

      {/* ── Main Area ───────────────────────────────────────────── */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden print:h-auto print:overflow-visible">
        {/* Topbar */}
        <header className="flex items-center justify-between h-16 px-4 sm:px-6 bg-white border-b border-slate-200 shrink-0 print:hidden">
          <div className="flex items-center gap-3">
            <button className="md:hidden text-slate-500 hover:text-slate-900 p-1" onClick={() => setOpen(true)}>
              <Menu className="w-6 h-6" />
            </button>
            <h1 className="text-xs sm:text-sm font-bold tracking-[0.15em] text-slate-700 uppercase">Housing System</h1>
            <span className="px-2 py-0.5 text-[10px] font-bold bg-slate-100 text-slate-500 rounded hidden sm:inline-block">v2.0</span>
          </div>
          <div className="flex items-center gap-3">
            <span className="hidden sm:block text-sm font-semibold text-slate-600 bg-indigo-50 text-indigo-700 px-3 py-1.5 rounded-lg">
              👤 {user?.name || "User"} ({user?.role || "Guest"})
            </span>
            <button 
              onClick={logout}
              className="flex items-center gap-1.5 text-sm font-semibold text-rose-600 bg-rose-50 hover:bg-rose-100 px-3 py-1.5 rounded-lg transition-colors"
            >
              <LogOut className="w-4 h-4" />
              <span className="hidden sm:inline">Logout</span>
            </button>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 overflow-auto p-4 sm:p-6 lg:p-8 print:overflow-visible print:h-auto print:p-0 print:m-0">
          {isAllowed ? (
            children
          ) : (
            <div className="flex flex-col items-center justify-center min-h-[60vh] text-center p-6 bg-white rounded-3xl border border-slate-200/60 shadow-xs max-w-2xl mx-auto my-12 animate-fade-in">
              <div className="w-16 h-16 bg-rose-50 border border-rose-200 rounded-2xl flex items-center justify-center text-rose-500 mb-4 animate-bounce">
                <ShieldAlert className="w-8 h-8" />
              </div>
              <h2 className="text-xl sm:text-2xl font-black text-slate-800 tracking-tight">Akses Terbatas / Ditolak</h2>
              <p className="text-slate-500 mt-2 max-w-md text-sm sm:text-base leading-relaxed">
                Akun Anda memiliki role <span className="font-bold text-slate-700 bg-slate-100 px-2 py-0.5 rounded-lg border border-slate-200/60">{user?.role}</span> yang tidak diizinkan untuk melihat halaman ini (<span className="font-mono text-xs text-rose-600 bg-rose-50 px-1.5 py-0.5 rounded">{pathname}</span>).
              </p>
              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => router.back()}
                  className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-sm transition-all"
                >
                  Kembali
                </button>
                <Link
                  href="/"
                  className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl text-sm shadow-sm shadow-indigo-150 transition-all"
                >
                  Ke Dashboard
                </Link>
              </div>
            </div>
          )}
        </main>
      </div>

      {/* Session warning modal */}
      <SessionWarningModal
        isOpen={showIdleWarning}
        remainingSeconds={remainingIdleSeconds}
        onExtend={extendSession}
      />
    </div>
  );
}
