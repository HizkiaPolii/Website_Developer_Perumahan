import { ArrowLeft, Download, Eye, Calendar } from 'lucide-react';
import Link from 'next/link';

interface MonthlyReport {
  id: string;
  month: number;
  year: number;
  monthName: string;
  totalPendapatan: number;
  totalPengeluaran: number;
  labaRugi: number;
  status: 'draft' | 'finalized';
}

export default function ReportArchivePage() {
  // Data dummy untuk bulan-bulan sebelumnya
  const reports: MonthlyReport[] = [
    {
      id: '202604',
      month: 4,
      year: 2026,
      monthName: 'April 2026',
      totalPendapatan: 150000000,
      totalPengeluaran: 95000000,
      labaRugi: 55000000,
      status: 'finalized',
    },
    {
      id: '202603',
      month: 3,
      year: 2026,
      monthName: 'Maret 2026',
      totalPendapatan: 140000000,
      totalPengeluaran: 88000000,
      labaRugi: 52000000,
      status: 'finalized',
    },
    {
      id: '202602',
      month: 2,
      year: 2026,
      monthName: 'Februari 2026',
      totalPendapatan: 130000000,
      totalPengeluaran: 82000000,
      labaRugi: 48000000,
      status: 'finalized',
    },
    {
      id: '202601',
      month: 1,
      year: 2026,
      monthName: 'Januari 2026',
      totalPendapatan: 125000000,
      totalPengeluaran: 78000000,
      labaRugi: 47000000,
      status: 'finalized',
    },
    {
      id: '202512',
      month: 12,
      year: 2025,
      monthName: 'Desember 2025',
      totalPendapatan: 120000000,
      totalPengeluaran: 75000000,
      labaRugi: 45000000,
      status: 'finalized',
    },
  ];

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(value);
  };

  return (
    <div className="flex flex-col h-full gap-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href="/dashboard" className="hover:bg-gray-100 p-2 rounded">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-3xl font-bold text-black">Pengarsipan Laporan</h1>
          <p className="text-sm text-black mt-1">Lihat laporan keuangan per periode bulanan</p>
        </div>
      </div>

      {/* Filter & Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-lg shadow p-4">
          <p className="text-sm text-black mb-1">Total Periode</p>
          <p className="text-2xl font-bold text-black">{reports.length} Bulan</p>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <p className="text-sm text-black mb-1">Total Pendapatan</p>
          <p className="text-2xl font-bold text-green-600">
            {formatCurrency(reports.reduce((sum, r) => sum + r.totalPendapatan, 0))}
          </p>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <p className="text-sm text-black mb-1">Total Laba</p>
          <p className="text-2xl font-bold text-blue-600">
            {formatCurrency(reports.reduce((sum, r) => sum + r.labaRugi, 0))}
          </p>
        </div>
      </div>

      {/* Daftar Laporan */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="px-6 py-4 bg-gray-50 border-b">
          <h2 className="text-lg font-bold text-black">Daftar Laporan Per Bulan</h2>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="px-6 py-3 text-left text-sm font-semibold text-black">Periode</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-black">Pendapatan</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-black">Pengeluaran</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-black">Laba/(Rugi)</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-black">Status</th>
                <th className="px-6 py-3 text-center text-sm font-semibold text-black">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {reports.map((report, index) => (
                <tr key={report.id} className={index !== reports.length - 1 ? 'border-b' : ''}>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-gray-500" />
                      <span className="font-semibold text-black">{report.monthName}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-green-600 font-semibold">{formatCurrency(report.totalPendapatan)}</span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-red-600 font-semibold">{formatCurrency(report.totalPengeluaran)}</span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`font-semibold ${report.labaRugi >= 0 ? 'text-blue-600' : 'text-red-600'}`}>
                      {formatCurrency(report.labaRugi)}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                      report.status === 'finalized'
                        ? 'bg-green-100 text-green-700'
                        : 'bg-yellow-100 text-yellow-700'
                    }`}>
                      {report.status === 'finalized' ? 'Selesai' : 'Draft'}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-center gap-2">
                      <button className="p-2 hover:bg-blue-50 rounded text-blue-600 transition-colors" title="Lihat Laporan">
                        <Eye className="w-4 h-4" />
                      </button>
                      <button className="p-2 hover:bg-gray-100 rounded text-gray-600 transition-colors" title="Download">
                        <Download className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Informasi Tambahan */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <p className="text-sm text-black">
          <span className="font-semibold">💡 Informasi:</span> Laporan diarsipkan secara otomatis setiap akhir bulan. Anda dapat melihat, mengunduh, atau mencetak laporan dari periode mana saja.
        </p>
      </div>
    </div>
  );
}
