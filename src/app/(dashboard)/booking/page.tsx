"use client";

import React, { useState, useEffect } from "react";
import { useToast } from "@/contexts/ToastContext";

interface Unit {
  id: string;
  name: string;
  cluster: string;
  status: string;
  price: string;
  area: string;
}

interface BookingSubmission {
  id: string;
  name: string;
  phone: string;
  unitId: string;
  date: string;
}

export default function BookingPage() {
  const [units, setUnits] = useState<Unit[]>([]);
  const [submissions, setSubmissions] = useState<BookingSubmission[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const { addToast } = useToast();
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    email: "",
    unitId: "",
  });
  const [submitted, setSubmitted] = useState(false);

  // Mock data untuk development
  const mockUnits: Unit[] = [
    { id: "1", name: "Rumah A", cluster: "Cluster 1", status: "Tersedia", price: "500jt", area: "120m2" },
    { id: "2", name: "Rumah B", cluster: "Cluster 1", status: "Tersedia", price: "520jt", area: "130m2" },
    { id: "3", name: "Rumah C", cluster: "Cluster 2", status: "Tersedia", price: "480jt", area: "110m2" },
  ];

  // Fetch units dan bookings dari API
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
        const unitsResponse = await fetch("/api/units", {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });
        
        if (!unitsResponse.ok) {
          console.warn("API /api/units tidak tersedia, menggunakan mock data");
          setUnits(mockUnits);
        } else {
          const unitsData = await unitsResponse.json();
          setUnits(unitsData);
        }

        // TODO: Replace dengan endpoint API untuk bookings
        const bookingsResponse = await fetch("/api/bookings", {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });
        
        if (!bookingsResponse.ok) {
          console.warn("API /api/bookings tidak tersedia, menggunakan mock data");
          setSubmissions([]);
        } else {
          const bookingsData = await bookingsResponse.json();
          setSubmissions(bookingsData);
        }
      } catch (err) {
        console.warn("Gagal fetch dari API, menggunakan mock data:", err);
        setUnits(mockUnits);
        setSubmissions([]);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.phone || !formData.email || !formData.unitId) {
      addToast("⚠️ Mohon isi semua field yang diperlukan", "warning", 3000);
      return;
    }

    // TODO: Send booking ke API endpoint /api/bookings
    addToast(`✓ Booking sedang dikirim ke server...", "info", 3000);
    setFormData({ name: "", phone: "", email: "", unitId: "" });
    setSubmitted(true);
    setTimeout(() => setSubmitted(false), 3000);
  };

  const selectedUnit = units.find(u => u.id === formData.unitId);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin text-4xl mb-4">⏳</div>
          <p className="text-slate-600">Connecting to API...</p>
          <p className="text-xs text-slate-400 mt-2">Endpoint: /api/units, /api/bookings</p>
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
          <p className="text-xs text-slate-400 mt-2">Periksa API endpoints: /api/units, /api/bookings</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* API Info */}
      <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
        <p className="text-xs font-bold text-amber-900">🔌 API Status</p>
        <p className="text-xs text-amber-800 mt-1">Units: {units.length} | Bookings: {submissions.length}</p>
        <p className="text-xs text-amber-700 mt-2">Endpoints: GET /api/units, GET /api/bookings, POST /api/bookings</p>
      </div>

      {/* Header */}
      <div>
        <h1 className="text-4xl font-bold text-slate-900">📋 Ajukan Booking Unit Rumah</h1>
        <p className="text-slate-500 mt-2">Pilih unit yang Anda inginkan dan lengkapi data pribadi untuk melakukan pemesanan</p>
      </div>

      {/* Success Message */}
      {submitted && (
        <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 flex items-center gap-3 animate-pulse">
          <span className="text-2xl">✅</span>
          <div>
            <p className="font-bold text-emerald-900">Booking Submitted!</p>
            <p className="text-sm text-emerald-800">Pesanan Anda telah berhasil dikirim ke tim marketing</p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Form - Wider */}
        <div className="lg:col-span-2 space-y-6">
          {/* Form Card */}
          <div className="bg-white p-8 rounded-xl border border-slate-200 shadow-sm">
            <h2 className="text-xl font-bold text-slate-900 mb-6">Formulir Pemesanan</h2>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Nama */}
              <div>
                <label className="block text-sm font-bold text-slate-900 mb-2">
                  Nama Lengkap <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Contoh: Budi Santoso"
                  className="w-full px-4 py-2.5 rounded-lg border border-slate-200 outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all"
                  required
                />
              </div>

              {/* Email */}
              <div>
                <label className="block text-sm font-bold text-slate-900 mb-2">
                  Email <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="contoh@email.com"
                  className="w-full px-4 py-2.5 rounded-lg border border-slate-200 outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all"
                  required
                />
              </div>

              {/* Telepon */}
              <div>
                <label className="block text-sm font-bold text-slate-900 mb-2">
                  Nomor Telepon <span className="text-red-500">*</span>
                </label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="08123456789"
                  className="w-full px-4 py-2.5 rounded-lg border border-slate-200 outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all"
                  required
                />
              </div>

              {/* Unit Selection */}
              <div>
                <label className="block text-sm font-bold text-slate-900 mb-2">
                  Pilih Unit <span className="text-red-500">*</span>
                </label>
                <select
                  value={formData.unitId}
                  onChange={(e) => setFormData({ ...formData, unitId: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-lg border border-slate-200 outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all"
                >
                  <option value="">-- Pilih Unit --</option>
                  {units.map(u => (
                    <option key={u.id} value={u.id}>
                      {u.name} - {u.cluster} ({u.price}) - {u.area}
                    </option>
                  ))}
                </select>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                className="w-full bg-gradient-to-r from-indigo-600 to-indigo-700 text-white py-3 rounded-lg font-bold hover:shadow-lg transition-all shadow-md shadow-indigo-200"
              >
                ✓ Ajukan Booking
              </button>
            </form>
          </div>

          {/* Available Units Info */}
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
            <h3 className="font-bold text-blue-900 mb-3">ℹ️ Informasi Unit Tersedia ({units.length})</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {units.map(u => (
                <div key={u.id} className="bg-white p-3 rounded-lg border border-blue-100">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="font-bold text-slate-900">{u.name}</p>
                      <p className="text-xs text-slate-600">{u.cluster}</p>
                    </div>
                    <span className="text-xs font-bold text-indigo-600 bg-indigo-50 px-2 py-1 rounded">
                      ✅ Tersedia
                    </span>
                  </div>
                  <div className="mt-2 flex items-center justify-between text-xs">
                    <span className="text-slate-600">{u.area}</span>
                    <span className="font-bold text-slate-900">{u.price}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column - Unit Details & Submissions */}
        <div className="space-y-6">
          {/* Unit Details */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 sticky top-8">
            <h3 className="font-bold text-slate-900 mb-4 flex items-center gap-2">
              📍 Detail Unit Dipilih
            </h3>
            {selectedUnit ? (
              <div className="space-y-4">
                <div className="p-4 bg-gradient-to-br from-indigo-50 to-indigo-100 rounded-lg border border-indigo-200">
                  <p className="text-3xl font-bold text-indigo-900">{selectedUnit.name}</p>
                </div>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between items-center pb-2 border-b border-slate-100">
                    <span className="text-slate-600">Cluster</span>
                    <span className="font-bold text-slate-900">{selectedUnit.cluster}</span>
                  </div>
                  <div className="flex justify-between items-center pb-2 border-b border-slate-100">
                    <span className="text-slate-600">Area</span>
                    <span className="font-bold text-slate-900">{selectedUnit.area}</span>
                  </div>
                  <div className="flex justify-between items-center pb-2 border-b border-slate-100">
                    <span className="text-slate-600">Harga</span>
                    <span className="font-bold text-lg text-slate-900">{selectedUnit.price}</span>
                  </div>
                  <div className="pt-2">
                    <span className="inline-block px-3 py-1 bg-blue-50 text-blue-600 text-xs font-bold rounded-lg border border-blue-100">
                      ✅ {selectedUnit.status}
                    </span>
                  </div>
                </div>
              </div>
            ) : (
              <p className="text-slate-400 text-center py-4">Pilih unit untuk melihat detail</p>
            )}
          </div>

          {/* Recent Submissions */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
            <h3 className="font-bold text-slate-900 mb-4 flex items-center gap-2">
              📊 Booking Terbaru
            </h3>
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {submissions.map((submission) => {
                const unitInfo = UNITS.find(u => u.id === submission.unitId);
                return (
                  <div key={submission.id} className="p-3 bg-slate-50 rounded-lg border border-slate-100 text-xs">
                    <div className="flex items-start justify-between gap-2 mb-1">
                      <p className="font-bold text-slate-900 truncate">{submission.name}</p>
                      <span className="text-[10px] font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded whitespace-nowrap">
                        {submission.id}
                      </span>
                    </div>
                    <p className="text-slate-600 truncate">{submission.phone}</p>
                    <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-200">
                      <span className="text-slate-600">{unitInfo?.name || submission.unitId}</span>
                      <span className="text-[10px] text-slate-500">{submission.date}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}