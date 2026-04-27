"use client";

import React, { useState, useEffect } from "react";

type Status = "Tersedia" | "Pending" | "ACC Manager" | "ACC Final" | "Tolak";

interface Unit {
  id: string;
  name: string;
  cluster: string;
  status: Status;
  price: string;
  area: string;
  address: string;
}

export default function UnitsPage() {
  const [units, setUnits] = useState<Unit[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filterStatus, setFilterStatus] = useState<Status | "All">("All");
  const [searchCluster, setSearchCluster] = useState<string>("");

  // Mock data untuk development
  const mockUnits: Unit[] = [
    { id: "1", name: "Rumah A", cluster: "Cluster 1", status: "Tersedia", price: "500jt", area: "120m2", address: "Jl. Merdeka No.1" },
    { id: "2", name: "Rumah B", cluster: "Cluster 1", status: "Pending", price: "520jt", area: "130m2", address: "Jl. Merdeka No.2" },
    { id: "3", name: "Rumah C", cluster: "Cluster 2", status: "Tersedia", price: "480jt", area: "110m2", address: "Jl. Ahmad Yani No.1" },
  ];

  // Fetch units dari API
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem("token");
        
        if (!token) {
          setError("Token tidak ditemukan. Silakan login kembali.");
          setLoading(false);
          return;
        }

        // TODO: Replace dengan endpoint API yang sebenarnya
        const response = await fetch("/api/units", {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });
        
        if (!response.ok) {
          console.warn("API /api/units tidak tersedia, menggunakan mock data untuk development");
          setUnits(mockUnits);
          setLoading(false);
          return;
        }
        
        const data = await response.json();
        setUnits(data);
      } catch (err) {
        console.warn("Gagal fetch dari API, menggunakan mock data:", err);
        setUnits(mockUnits);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  let filteredUnits = filterStatus === "All" 
    ? units 
    : units.filter(u => u.status === filterStatus);

  filteredUnits = searchCluster 
    ? filteredUnits.filter(u => u.cluster.toLowerCase().includes(searchCluster.toLowerCase()))
    : filteredUnits;

  const getStatusColor = (status: Status) => {
    const colors = {
      "Tersedia": "bg-blue-50 text-blue-600 border-blue-100",
      "Pending": "bg-orange-50 text-orange-600 border-orange-100",
      "ACC Manager": "bg-indigo-50 text-indigo-600 border-indigo-100",
      "ACC Final": "bg-emerald-50 text-emerald-600 border-emerald-100",
      "Tolak": "bg-red-50 text-red-600 border-red-100",
    };
    return colors[status];
  };

  const getStatusIcon = (status: Status) => {
    const icons = {
      "Tersedia": "✅",
      "Pending": "⏳",
      "ACC Manager": "✓",
      "ACC Final": "✓✓",
      "Tolak": "❌",
    };
    return icons[status];
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin text-4xl mb-4">⏳</div>
          <p className="text-slate-600">Connecting to API...</p>
          <p className="text-xs text-slate-400 mt-2">Endpoint: /api/units</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="text-4xl mb-4">❌</div>
          <p className="text-red-600 font-bold">{error}</p>
          <p className="text-xs text-slate-400 mt-2">Periksa API endpoint: /api/units</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* API Info */}
      <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
        <p className="text-xs font-bold text-amber-900">🔌 API Status</p>
        <p className="text-xs text-amber-800 mt-1">Units: {units.length}</p>
        <p className="text-xs text-amber-700 mt-2">Endpoint: GET /api/units</p>
      </div>

      {/* Header */}
      <div>
        <h1 className="text-4xl font-bold text-slate-900">📊 Data Unit Rumah</h1>
        <p className="text-slate-500 mt-2">Kelola dan lihat ketersediaan unit di semua cluster perumahan</p>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard label="Total Unit" value={units.length.toString()} />
        <StatCard label="Tersedia" value={units.filter(u => u.status === "Tersedia").length.toString()} />
        <StatCard label="Pending" value={units.filter(u => u.status === "Pending").length.toString()} />
        <StatCard label="Terjual" value={units.filter(u => u.status === "ACC Final").length.toString()} />
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 space-y-4">
        <h3 className="font-bold text-slate-900">🔍 Filter & Pencarian</h3>
        
        {/* Search Box */}
        <div>
          <label className="block text-sm font-bold text-slate-900 mb-2">Cari Cluster</label>
          <input
            type="text"
            placeholder="Contoh: Griya Asri, Emerald..."
            value={searchCluster}
            onChange={(e) => setSearchCluster(e.target.value)}
            className="w-full px-4 py-2.5 rounded-lg border border-slate-200 outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all"
          />
        </div>

        {/* Status Filter */}
        <div>
          <label className="block text-sm font-bold text-slate-900 mb-3">Filter Status</label>
          <div className="flex gap-2 overflow-x-auto pb-2 flex-wrap">
            {(["All", "Tersedia", "Pending", "ACC Manager", "ACC Final", "Tolak"] as const).map((status) => (
              <button
                key={status}
                onClick={() => setFilterStatus(status as any)}
                className={`px-4 py-2 rounded-lg font-bold text-sm whitespace-nowrap transition-all ${
                  filterStatus === status
                    ? "bg-indigo-600 text-white shadow-md"
                    : "bg-slate-100 border border-slate-200 text-slate-600 hover:border-indigo-300 hover:bg-slate-50"
                }`}
              >
                {status}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Units Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-200 bg-slate-50">
          <h2 className="text-lg font-bold text-slate-900">Daftar Unit ({filteredUnits.length})</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="p-4 text-xs uppercase font-bold text-slate-500">Unit</th>
                <th className="p-4 text-xs uppercase font-bold text-slate-500">Cluster</th>
                <th className="p-4 text-xs uppercase font-bold text-slate-500">Area</th>
                <th className="p-4 text-xs uppercase font-bold text-slate-500">Alamat</th>
                <th className="p-4 text-xs uppercase font-bold text-slate-500">Harga</th>
                <th className="p-4 text-xs uppercase font-bold text-slate-500">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredUnits.length > 0 ? (
                filteredUnits.map((unit) => (
                  <tr key={unit.id} className="hover:bg-slate-50 transition-colors">
                    <td className="p-4 font-bold text-slate-900">{unit.name}</td>
                    <td className="p-4 text-slate-600 font-medium">{unit.cluster}</td>
                    <td className="p-4 text-slate-600">{unit.area}</td>
                    <td className="p-4 text-slate-600 text-xs">{unit.address}</td>
                    <td className="p-4 font-bold text-slate-900">{unit.price}</td>
                    <td className="p-4">
                      <span className={`inline-block px-3 py-1.5 rounded-lg text-xs font-bold border ${getStatusColor(unit.status)}`}>
                        {getStatusIcon(unit.status)} {unit.status}
                      </span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-slate-500">
                    Tidak ada unit yang sesuai dengan filter Anda
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Cluster Summary - Dinamis dari API */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {Array.from(new Set(units.map(u => u.cluster))).map((cluster) => {
          const clusterUnits = units.filter(u => u.cluster === cluster);
          const samplePrice = clusterUnits[0]?.price || "-";
          const sampleArea = clusterUnits[0]?.area || "-";
          return (
            <ClusterCard key={cluster} name={cluster} units={clusterUnits.length} price={samplePrice} area={sampleArea} />
          );
        })}
      </div>
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-sm">
      <p className="text-xs uppercase text-slate-500 font-bold">{label}</p>
      <p className="text-2xl font-bold text-slate-900 mt-2">{value}</p>
    </div>
  );
}

function ClusterCard({ name, units, price, area }: { name: string; units: number; price: string; area: string }) {
  const icons = {
    "Griya Asri": "🏘️",
    "Emerald": "💚",
    "Sapphire": "💙",
    "Diamond": "💎",
  };
  
  return (
    <div className="bg-gradient-to-br from-slate-50 to-slate-100 rounded-lg border border-slate-200 shadow-sm p-4 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-3">
        <h3 className="font-bold text-slate-900">{icons[name as keyof typeof icons] || "🏠"} {name}</h3>
      </div>
      <div className="space-y-2 text-sm">
        <div className="flex justify-between items-center">
          <span className="text-slate-600">Unit</span>
          <span className="font-bold text-slate-900">{units}</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-slate-600">Harga</span>
          <span className="font-bold text-slate-900">{price}</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-slate-600">Area</span>
          <span className="font-bold text-slate-900">{area}</span>
        </div>
      </div>
    </div>
  );
}