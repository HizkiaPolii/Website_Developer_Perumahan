'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Edit2, Trash2, Plus, Loader, Download, CheckCircle } from 'lucide-react';
import Link from 'next/link';
import { useFinancialReports } from '@/hooks/useApiEndpoints';
import { useAuth } from '@/contexts/AuthContext';
import { formatDate, formatCurrency } from '@/utils/financial-constants';
import { useToast } from '@/contexts/ToastContext';

export default function ReportsListPage() {
  const router = useRouter();
  const { user, isLoading: isAuthLoading } = useAuth();
  const { getAll, remove, loading, error } = useFinancialReports();
  const { addToast } = useToast();

  const [reports, setReports] = useState<any[]>([]);
  const [filteredReports, setFilteredReports] = useState<any[]>([]);
  const [filterType, setFilterType] = useState<'ALL' | 'BALANCE_SHEET' | 'INCOME_STATEMENT'>('ALL');
  const [filterStatus, setFilterStatus] = useState<'ALL' | 'DRAFT' | 'FINALIZED'>('ALL');

  // Load reports
  useEffect(() => {
    if (isAuthLoading || !user) return;

    const loadReports = async () => {
      try {
        const params = {
          companyId: user.companyId || 1
        };
        const data = await getAll(params);
        if (data) {
          setReports(data);
          addToast(`${data.length} laporan berhasil dimuat`, 'success');
        } else {
          setReports([]);
        }
      } catch (err) {
        console.error('Error loading reports:', err);
        addToast('Gagal memuat laporan', 'error');
      }
    };

    loadReports();
  }, [getAll, user, isAuthLoading, addToast]);

  // Apply filters
  useEffect(() => {
    let filtered = reports;

    if (filterType !== 'ALL') {
      filtered = filtered.filter(r => r.reportType === filterType);
    }

    if (filterStatus !== 'ALL') {
      filtered = filtered.filter(r => r.status === filterStatus);
    }

    setFilteredReports(filtered);
  }, [reports, filterType, filterStatus]);

  const getReportTypeLabel = (type: string) => {
    switch (type) {
      case 'BALANCE_SHEET':
        return 'Neraca';
      case 'INCOME_STATEMENT':
        return 'Laba Rugi';
      default:
        return type;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'DRAFT':
        return 'bg-yellow-100 text-yellow-700';
      case 'FINALIZED':
        return 'bg-green-100 text-green-700';
      case 'ARCHIVED':
        return 'bg-gray-100 text-gray-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  const handleEdit = (reportId: number, reportType: string) => {
    if (reportType === 'BALANCE_SHEET') {
      router.push(`/reports/balance-sheet/${reportId}/edit`);
    } else if (reportType === 'INCOME_STATEMENT') {
      router.push(`/reports/income-statement/${reportId}/edit`);
    }
  };

  const handleView = (reportId: number, reportType: string) => {
    if (reportType === 'BALANCE_SHEET') {
      router.push(`/reports/balance-sheet/${reportId}`);
    } else if (reportType === 'INCOME_STATEMENT') {
      router.push(`/reports/income-statement/${reportId}`);
    }
  };

  const handleDelete = async (reportId: number) => {
    if (!confirm('Apakah Anda yakin ingin menghapus laporan ini? Seluruh data item di dalamnya juga akan terhapus.')) {
      return;
    }

    try {
      const success = await remove(reportId);
      if (success) {
        addToast('Laporan berhasil dihapus', 'success');
        // Refresh list
        const updated = reports.filter(r => r.id !== reportId);
        setReports(updated);
      } else {
        addToast('Gagal menghapus laporan', 'error');
      }
    } catch (err) {
      addToast('Terjadi kesalahan saat menghapus', 'error');
    }
  };

  if (isAuthLoading || loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <Loader className="w-8 h-8 animate-spin mx-auto text-blue-500" />
          <p className="text-black mt-2">Memuat laporan keuangan...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl text-black font-bold">📊 Laporan Keuangan</h1>
          <p className="text-sm text-gray-600 mt-1">Kelola neraca dan laporan laba rugi</p>
        </div>
        <button
          onClick={() => router.push('/reports/create')}
          className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors"
        >
          <Plus className="w-5 h-5" />
          Buat Laporan
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg border border-gray-200 p-4 space-y-4">
        <h3 className="font-bold text-gray-900">Filter</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm text-gray-600 mb-2">Tipe Laporan</label>
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value as any)}
              className="w-full px-3 py-2 border border-gray-300 rounded text-black focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="ALL">Semua Tipe</option>
              <option value="BALANCE_SHEET">Neraca</option>
              <option value="INCOME_STATEMENT">Laba Rugi</option>
            </select>
          </div>

          <div>
            <label className="block text-sm text-gray-600 mb-2">Status</label>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value as any)}
              className="w-full px-3 py-2 border border-gray-300 rounded text-black focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="ALL">Semua Status</option>
              <option value="DRAFT">Draft</option>
              <option value="FINALIZED">Finalisasi</option>
            </select>
          </div>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      {/* Reports Table */}
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="px-6 py-3 text-left text-sm font-semibold text-black">Tipe Laporan</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-black">Periode</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-black">Status</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-black">Dibuat Oleh</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-black">Tanggal</th>
                <th className="px-6 py-3 text-center text-sm font-semibold text-black">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {filteredReports.length > 0 ? (
                filteredReports.map((report, index) => (
                  <tr key={report.id} className={index !== filteredReports.length - 1 ? 'border-b' : ''}>
                    <td className="px-6 py-4 text-sm font-semibold text-black">
                      {getReportTypeLabel(report.reportType)}
                    </td>
                    <td className="px-6 py-4 text-sm text-black">
                      {formatDate(report.periodStart)} - {formatDate(report.periodEnd)}
                    </td>
                    <td className="px-6 py-4 text-sm">
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusBadge(report.status)}`}>
                        {report.status === 'DRAFT' ? '✏️ Draft' : report.status === 'FINALIZED' ? '✓ Finalisasi' : report.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-black">{report.creator?.name || '-'}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">{formatDate(report.reportDate)}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => handleView(report.id, report.reportType)}
                          className="px-3 py-1.5 text-xs font-semibold text-blue-600 hover:bg-blue-50 rounded transition-colors"
                          title="Lihat"
                        >
                          👁️ Lihat
                        </button>
                        {report.status === 'DRAFT' && (
                          <button
                            onClick={() => handleEdit(report.id, report.reportType)}
                            className="px-3 py-1.5 text-xs font-semibold text-green-600 hover:bg-green-50 rounded transition-colors flex items-center gap-1"
                            title="Edit"
                          >
                            <Edit2 className="w-3 h-3" />
                            Edit
                          </button>
                        )}
                        <button
                          onClick={() => handleDelete(report.id)}
                          className="px-3 py-1.5 text-xs font-semibold text-red-600 hover:bg-red-50 rounded transition-colors flex items-center gap-1"
                          title="Hapus"
                        >
                          <Trash2 className="w-3 h-3" />
                          Hapus
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-gray-500">
                    Tidak ada laporan
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Info Box */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <p className="text-sm text-blue-900">
          💡 <strong>Tips:</strong> Hanya laporan dengan status "Draft" yang dapat diedit. Setelah finalisasi, laporan tidak bisa diubah.
        </p>
      </div>
    </div>
  );
}
