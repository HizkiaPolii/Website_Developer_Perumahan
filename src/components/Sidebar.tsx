"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Home, ClipboardCheck, CheckCircle, Users, FileText } from "lucide-react";

type Role = "Admin" | "Marketing" | "Manager" | "Owner";

interface User {
  id: string;
  email: string;
  name: string;
  role: Role;
}

interface SidebarProps {
  role: Role;
  isMobile?: boolean;
  onClose?: () => void;
}

export default function Sidebar({ role, isMobile = false, onClose }: SidebarProps) {
  const pathname = usePathname();
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (err) {
        console.error("Failed to parse user data", err);
      }
    }
  }, []);

  // Debug logging
  useEffect(() => {
    console.log("Sidebar - Role:", role);
    console.log("Sidebar - User:", user);
  }, [role, user]);

  // Definisi Menu berdasarkan Role
  const menuItems = [
    { label: "Dashboard", href: "/", roles: ["Admin", "Marketing", "Manager", "Owner"], icon: LayoutDashboard },
    { label: "Data Unit Rumah", href: "/units", roles: ["Admin", "Marketing", "Manager", "Owner"], icon: Home },
    { label: "Ajukan Booking", href: "/booking", roles: ["Marketing"], icon: ClipboardCheck },
    { label: "Halaman Approval", href: "/approval", roles: ["Manager", "Owner"], icon: CheckCircle },
    { label: "Manajemen User", href: "/users", roles: ["Admin"], icon: Users },
    { label: "Activity Log", href: "/activity-log", roles: ["Admin", "Manager", "Owner"], icon: FileText },
  ];

  // Normalize role untuk filtering
  const normalizedRole = role?.trim() || "";
  const filteredMenuItems = menuItems.filter((item) => 
    item.roles.some(r => r.toLowerCase() === normalizedRole.toLowerCase())
  );

  console.log("Filtered Menu Items:", filteredMenuItems);

  return (
    <aside className="fixed left-0 top-0 w-64 h-screen bg-slate-900 text-white flex flex-col shadow-xl overflow-y-auto">
      {/* Branding */}
      <div className="p-8">
        <h1 className="text-2xl font-black tracking-tighter text-indigo-400">
          PRO<span className="text-white">DEV</span>
        </h1>
        <p className="text-[10px] text-slate-500 font-bold tracking-[0.2em] uppercase mt-1">
          Housing System
        </p>
      </div>

      {/* Navigasi Utama */}
      <nav className="flex-1 px-4 space-y-1">
        {filteredMenuItems.length > 0 ? (
          filteredMenuItems.map((item) => {
            const isActive = pathname === item.href;
            const IconComponent = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => isMobile && onClose?.()}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all duration-200 group ${
                  isActive
                    ? "bg-indigo-600 text-white shadow-lg shadow-indigo-900/50"
                    : "text-slate-400 hover:bg-slate-800 hover:text-slate-100"
                }`}
              >
                <IconComponent className={`w-5 h-5 transition-all ${
                  isActive ? "text-white" : "text-slate-500 group-hover:text-indigo-400"
                }`} />
                {item.label}
              </Link>
            );
          })
        ) : (
          <div className="text-center py-8 text-slate-500">
            <p className="text-xs">Tidak ada menu untuk role ini</p>
          </div>
        )}
      </nav>

      {/* Profile */}
      <div className="p-4 mt-auto">
        <div className="bg-slate-800/50 rounded-2xl p-4 border border-slate-700/50">
          <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-3">
            Profil Pengguna
          </p>
          
          <div className="flex items-center gap-3 pt-2">
            <div className="h-10 w-10 rounded-lg bg-linear-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold">
              {user?.name ? user.name.charAt(0).toUpperCase() : "U"}
            </div>
            <div className="overflow-hidden flex-1">
              <p className="text-xs font-bold truncate">{user?.name || "User"}</p>
              <p className="text-[10px] text-slate-500 truncate">{user?.email}</p>
            </div>
          </div>

          <div className="mt-3 inline-block bg-indigo-500/20 text-indigo-300 text-[10px] font-bold px-2 py-1 rounded">
            {role}
          </div>
        </div>
      </div>
    </aside>
  );
}