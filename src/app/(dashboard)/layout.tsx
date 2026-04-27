"use client";

import Sidebar from "../../components/Sidebar";
import SessionWarningToast from "@/components/SessionWarningToast";
import React, { useEffect } from "react";
import { useRouter } from "next/navigation";
import { LogOut, Loader, Menu, X } from "lucide-react";
import { useToast } from "@/contexts/ToastContext";
import { useConfirmDialog } from "@/contexts/ConfirmDialogContext";
import { useAuth } from "@/contexts/AuthContext";
import { useMobileMenu } from "@/contexts/MobileMenuContext";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { addToast } = useToast();
  const { confirm } = useConfirmDialog();
  const { user, isAuthenticated, isLoading, logout, showIdleWarning, remainingIdleSeconds, extendSession } = useAuth();
  const { isOpen, toggle, close } = useMobileMenu();

  // Redirect ke login jika tidak authenticated (tapi biarkan jika masih loading)
  useEffect(() => {
    if (isLoading) {
      // Masih loading - jangan redirect
      return;
    }
    
    if (!isAuthenticated) {
      // Verified tidak authenticated - redirect ke login
      router.replace("/login");
    }
  }, [isAuthenticated, isLoading, router]);

  const handleLogout = async () => {
    const confirmed = await confirm({
      title: "Logout Confirmation",
      message: `Apakah Anda yakin ingin logout dari akun ${user?.name || user?.email}?`,
      confirmText: "Ya, Logout",
      cancelText: "Batal",
      type: "warning",
    });

    if (confirmed) {
      logout();
      addToast("Berhasil logout. Sampai jumpa!", "success", 2000);
      setTimeout(() => {
        router.push("/login");
      }, 800);
    }
  };

  // Show loading saat verifying session
  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <Loader className="w-8 h-8 animate-spin text-blue-500" />
          <p className="text-slate-600">Memverifikasi sesi...</p>
          <p className="text-xs text-slate-400 mt-2">Token: {user?.email || "Loading..."}</p>
        </div>
      </div>
    );
  }

  // Jika tidak authenticated, jangan render
  if (!isAuthenticated || !user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Desktop Sidebar */}
      <div className="hidden md:fixed md:left-0 md:top-0 md:w-64 md:h-screen md:block md:z-10">
        <Sidebar role={user.role} />
      </div>

      {/* Mobile Sidebar Overlay - Only on mobile */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-30 md:hidden animate-fade-in"
          onClick={close}
        />
      )}

      {/* Mobile Sidebar - Drawer */}
      {isOpen && (
        <div className="fixed left-0 top-0 h-screen w-64 z-40 md:hidden animate-slide-in-left">
          <Sidebar role={user.role} isMobile={true} onClose={close} />
        </div>
      )}

      {/* Main Content Area */}
      <div className="flex flex-col md:ml-64 min-h-screen">
        {/* Header */}
        <header className="h-16 bg-white border-b px-4 md:px-8 flex items-center justify-between sticky top-0 z-20">
          <div className="flex items-center gap-2 flex-1 min-w-0">
            {/* Hamburger Menu - Mobile only */}
            <button
              onClick={toggle}
              className="md:hidden p-2 hover:bg-slate-100 rounded-lg transition-colors shrink-0"
            >
              {isOpen ? (
                <X className="w-5 h-5 text-slate-600" />
              ) : (
                <Menu className="w-5 h-5 text-slate-600" />
              )}
            </button>

            <h1 className="text-xs sm:text-sm font-bold uppercase tracking-widest text-slate-600 truncate">Housing System</h1>
            <span className="text-[9px] sm:text-[10px] bg-slate-100 text-slate-600 px-2 py-1 rounded font-bold shrink-0">v1.0</span>
          </div>

          {/* User Info - Responsive */}
          <div className="flex items-center gap-2 sm:gap-4 ml-2 shrink-0">
            <span className="hidden sm:inline-block text-xs font-bold bg-indigo-50 text-indigo-600 px-3 py-1.5 rounded-lg tracking-tighter truncate max-w-xs">
              👤 {user.name || user.email}
            </span>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 text-xs font-bold px-2 sm:px-4 py-2 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 hover:text-red-700 transition-all duration-200 border border-red-200 hover:border-red-300 shadow-sm hover:shadow-md whitespace-nowrap"
            >
              <LogOut className="w-4 h-4" />
              <span className="hidden sm:inline">Logout</span>
            </button>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 overflow-auto p-4 sm:p-6 md:p-8 animate-fade-in">
          {children}
        </main>
      </div>

      <SessionWarningToast
        isOpen={showIdleWarning}
        remainingSeconds={remainingIdleSeconds}
        onExtend={extendSession}
      />
    </div>
  );
}