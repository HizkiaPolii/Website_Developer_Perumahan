"use client";

import React from "react";
import { useActivityLog, ActivityType } from "@/contexts/ActivityLogContext";

export default function ActivityLogPage() {
  const { getActivities } = useActivityLog();
  const activities = getActivities(50);

  const getActivityIcon = (type: ActivityType) => {
    const icons: Record<ActivityType, string> = {
      approve_booking: "✓",
      reject_booking: "❌",
      create_booking: "📝",
      create_user: "👤",
      delete_user: "🗑️",
      update_user: "✏️",
      login: "🔓",
      logout: "🔐",
      role_switch: "🔄",
    };
    return icons[type] || "📊";
  };

  const getActivityColor = (type: ActivityType) => {
    const colors: Record<ActivityType, string> = {
      approve_booking: "bg-emerald-50 border-emerald-200",
      reject_booking: "bg-red-50 border-red-200",
      create_booking: "bg-blue-50 border-blue-200",
      create_user: "bg-indigo-50 border-indigo-200",
      delete_user: "bg-red-50 border-red-200",
      update_user: "bg-amber-50 border-amber-200",
      login: "bg-green-50 border-green-200",
      logout: "bg-slate-50 border-slate-200",
      role_switch: "bg-purple-50 border-purple-200",
    };
    return colors[type] || "bg-slate-50 border-slate-200";
  };

  const getActivityLabel = (type: ActivityType) => {
    const labels: Record<ActivityType, string> = {
      approve_booking: "Approve Booking",
      reject_booking: "Reject Booking",
      create_booking: "Buat Booking",
      create_user: "Buat User",
      delete_user: "Hapus User",
      update_user: "Update User",
      login: "Login",
      logout: "Logout",
      role_switch: "Switch Role",
    };
    return labels[type] || "Activity";
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleString("id-ID", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-4xl font-bold text-slate-900">📋 Activity Log</h1>
        <p className="text-slate-500 mt-2">Riwayat semua aktivitas user di sistem - approval, reject, user management, dan login history</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <StatCard
          icon="📊"
          label="Total Activities"
          value={activities.length.toString()}
          color="bg-slate-50 border-slate-200"
          textColor="text-slate-700"
        />
        <StatCard
          icon="✓"
          label="Approvals"
          value={activities.filter(a => a.type === "approve_booking").length.toString()}
          color="bg-emerald-50 border-emerald-200"
          textColor="text-emerald-600"
        />
        <StatCard
          icon="❌"
          label="Rejections"
          value={activities.filter(a => a.type === "reject_booking").length.toString()}
          color="bg-red-50 border-red-200"
          textColor="text-red-600"
        />
      </div>

      {/* Activity List */}
      <div>
        <h2 className="text-xl font-bold text-slate-900 mb-4">Recent Activities ({activities.length})</h2>
        
        {activities.length > 0 ? (
          <div className="space-y-3">
            {activities.map((activity) => (
              <div
                key={activity.id}
                className={`border rounded-lg p-4 flex items-start gap-4 ${getActivityColor(activity.type)}`}
              >
                <div className="text-2xl flex-shrink-0">{getActivityIcon(activity.type)}</div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2 mb-1">
                    <div>
                      <p className="font-bold text-slate-900">{getActivityLabel(activity.type)}</p>
                      <p className="text-sm text-slate-600">{activity.description}</p>
                    </div>
                    <span className="text-xs font-bold bg-white/50 px-2.5 py-1 rounded whitespace-nowrap">
                      {activity.role}
                    </span>
                  </div>
                  <div className="flex items-center gap-3 text-xs text-slate-500 mt-2">
                    <span>👤 {activity.user}</span>
                    <span>•</span>
                    <span>🕐 {formatDate(activity.timestamp)}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white p-12 rounded-xl border border-slate-200 text-center">
            <p className="text-lg text-slate-500 font-medium">Tidak ada activity history</p>
            <p className="text-sm text-slate-400 mt-1">Activity akan muncul di sini ketika ada action dilakukan</p>
          </div>
        )}
      </div>

      {/* Activity Types Reference */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
        <h3 className="font-bold text-blue-900 mb-4">📖 Activity Types Reference</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div>
            <p className="text-sm font-bold text-blue-900">✓ Approve Booking</p>
            <p className="text-xs text-blue-700 mt-1">User approve booking ke tahap berikutnya</p>
          </div>
          <div>
            <p className="text-sm font-bold text-blue-900">❌ Reject Booking</p>
            <p className="text-xs text-blue-700 mt-1">User menolak / reject booking</p>
          </div>
          <div>
            <p className="text-sm font-bold text-blue-900">📝 Create Booking</p>
            <p className="text-xs text-blue-700 mt-1">Marketing membuat booking baru</p>
          </div>
          <div>
            <p className="text-sm font-bold text-blue-900">👤 Create User</p>
            <p className="text-xs text-blue-700 mt-1">Admin menambahkan user baru</p>
          </div>
          <div>
            <p className="text-sm font-bold text-blue-900">✏️ Update User</p>
            <p className="text-xs text-blue-700 mt-1">Admin mengubah data user</p>
          </div>
          <div>
            <p className="text-sm font-bold text-blue-900">🗑️ Delete User</p>
            <p className="text-xs text-blue-700 mt-1">Admin menghapus user</p>
          </div>
        </div>
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
}: {
  icon: string;
  label: string;
  value: string;
  color: string;
  textColor: string;
}) {
  return (
    <div className={`${color} border p-5 rounded-lg shadow-sm`}>
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-xs font-bold text-slate-600 uppercase tracking-wider">{label}</p>
          <p className={`text-3xl font-bold mt-2 ${textColor}`}>{value}</p>
        </div>
        <span className="text-2xl">{icon}</span>
      </div>
    </div>
  );
}
