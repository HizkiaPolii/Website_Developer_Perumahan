'use client';

import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  FileText, 
  Eye, 
  Edit, 
  Calendar, 
  Search, 
  Filter, 
  Loader,
  Trash2,
  TrendingUp,
  BarChart3,
  DollarSign,
  X,
  ChevronDown,
  Sparkles,
  ArrowRight
} from 'lucide-react';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { useFinancialReports } from '@/hooks/useApiEndpoints';
import { useToast } from '@/contexts/ToastContext';

export default function IncomeStatementListPage() {
  const { user, isLoading: isAuthLoading } = useAuth();
  const { getAll, generateIncomeStatement, remove } = useFinancialReports();
  const { addToast } = useToast();

  const [loading, setLoading] = useState(true);
  const [reports, setReports] = useState<any[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [showModal, setShowModal] = useState(false);

  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

  const months = [
    'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
    'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
  ];
  const years = Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - 2 + i);

  const fetchReports = async () => {
    try {
      setLoading(true);
      const data = await getAll({ reportType: 'INCOME_STATEMENT' });
      setReports(data || []);
    } catch (err) {
      addToast('Gagal memuat daftar', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!isAuthLoading && user) fetchReports();
  }, [isAuthLoading, user]);

  const handleGenerate = async () => {
    try {
      setIsGenerating(true);
      const firstDay = new Date(selectedYear, selectedMonth, 1);
      const lastDay = new Date(selectedYear, selectedMonth + 1, 0);
      const payload = {
        companyId: user?.companyId || 1,
        periodStart: firstDay.toISOString(),
        periodEnd: lastDay.toISOString(),
        createdBy: user?.id || 1
      };
      const result = await generateIncomeStatement(payload);
      if (result) {
        addToast(`Laporan dibuat`, 'success');
        setShowModal(false);
        fetchReports();
      }
    } catch (err: any) {
      addToast(err.message || 'Gagal membuat laporan', 'error');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDelete = async (reportId: number) => {
    if (!confirm('Hapus laporan ini?')) return;
    try {
      if (await remove(reportId)) {
        addToast('Laporan dihapus', 'success');
        setReports(prev => prev.filter(r => r.id !== reportId));
      }
    } catch (err) {
      addToast('Gagal menghapus', 'error');
    }
  };

  if (isAuthLoading || loading) return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
      <div className="w-12 h-12 border-4 border-indigo-100 border-t-indigo-600 rounded-full animate-spin"></div>
      <p className="text-gray-500 font-medium">Memuat data...</p>
    </div>
  );

  return (
    <div className="flex flex-col gap-8 max-w-7xl mx-auto w-full pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 px-4 sm:px-0">
        <div>
          <h1 className="text-3xl font-black text-gray-900 tracking-tight uppercase">Laporan Laba Rugi</h1>
          <p className="text-gray-500 mt-1 font-medium italic">Pantau performa finansial perumahan Anda</p>
        </div>
        <button 
          onClick={() => setShowModal(true)}
          className="group flex items-center justify-center gap-3 px-8 py-4 bg-indigo-600 text-white rounded-[2rem] font-black hover:bg-indigo-700 transition-all shadow-2xl shadow-indigo-200 active:scale-95"
        >
          <Plus className="w-5 h-5 text-white" />
          Buat Laporan Baru
        </button>
      </div>

      {/* Stats Section */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 px-4 sm:px-0">
        {[
          { label: 'Total Laporan', val: reports.length, icon: BarChart3, col: 'text-indigo-600', bg: 'bg-indigo-50' },
          { label: 'Laporan Final', val: reports.filter(r => r.status === 'FINALIZED').length, icon: TrendingUp, col: 'text-emerald-600', bg: 'bg-emerald-50' },
          { label: 'Periode Terakhir', val: reports[0] ? months[new Date(reports[0].periodEnd).getMonth()] + ' ' + new Date(reports[0].periodEnd).getFullYear() : '-', icon: Calendar, col: 'text-amber-600', bg: 'bg-amber-50' }
        ].map((s, i) => (
          <div key={i} className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm flex items-center gap-6 group hover:border-indigo-200 transition-all">
            <div className={`p-4 ${s.bg} ${s.col} rounded-3xl group-hover:scale-110 transition-transform`}>
              <s.icon className="w-8 h-8" />
            </div>
            <div>
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">{s.label}</p>
              <p className="text-2xl font-black text-gray-900 mt-1">{s.val}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Main Table */}
      <div className="bg-white rounded-[3.5rem] shadow-sm border border-gray-100 overflow-hidden mx-4 sm:mx-0">
        <div className="p-10 border-b border-gray-50 flex flex-col md:flex-row justify-between items-center gap-6">
          <h2 className="text-xl font-black text-gray-900 uppercase tracking-tight">Arsip Laporan</h2>
          <div className="relative w-full md:w-80">
            <Search className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
            <input placeholder="Cari periode..." className="pl-12 pr-6 py-3.5 bg-gray-50/50 border border-transparent rounded-2xl text-sm w-full font-bold focus:bg-white focus:ring-2 focus:ring-indigo-500 transition-all outline-none" />
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50/50">
                <th className="text-left py-5 pl-10 text-[10px] font-black text-gray-400 uppercase tracking-widest">Periode Laporan</th>
                <th className="text-left py-5 px-6 text-[10px] font-black text-gray-400 uppercase tracking-widest">Status</th>
                <th className="text-left py-5 px-6 text-[10px] font-black text-gray-400 uppercase tracking-widest">Penyusun</th>
                <th className="text-right py-5 pr-10 text-[10px] font-black text-gray-400 uppercase tracking-widest">Tindakan</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {reports.map((report) => (
                <tr key={report.id} className="hover:bg-indigo-50/30 transition-colors group">
                  <td className="py-6 pl-10">
                    <div className="flex items-center gap-4">
                      <div className="p-3 bg-indigo-50 text-indigo-600 rounded-2xl group-hover:bg-indigo-600 group-hover:text-white transition-all shadow-sm">
                        <FileText className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="font-black text-gray-900 text-lg">{months[new Date(report.periodEnd).getMonth()]} {new Date(report.periodEnd).getFullYear()}</p>
                        <p className="text-[10px] text-gray-400 font-bold uppercase tracking-tighter">REF: #{report.id.toString().padStart(5, '0')}</p>
                      </div>
                    </div>
                  </td>
                  <td className="py-6 px-6">
                    <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest ${
                      report.status === 'FINALIZED' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-100' : 'bg-amber-100 text-amber-700'
                    }`}>
                      {report.status}
                    </span>
                  </td>
                  <td className="py-6 px-6 text-sm font-bold text-gray-700">{report.creator?.name || 'Sistem'}</td>
                  <td className="py-6 pr-10 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Link href={`/reports/income-statement/${report.id}`} className="p-2.5 text-gray-400 hover:bg-white hover:text-indigo-600 hover:shadow-md rounded-xl transition-all"><Eye className="w-5 h-5" /></Link>
                      {report.status === 'DRAFT' && <Link href={`/reports/income-statement/${report.id}/edit`} className="p-2.5 text-gray-400 hover:bg-white hover:text-emerald-600 hover:shadow-md rounded-xl transition-all"><Edit className="w-5 h-5" /></Link>}
                      <button onClick={() => handleDelete(report.id)} className="p-2.5 text-gray-400 hover:bg-white hover:text-red-600 hover:shadow-md rounded-xl transition-all"><Trash2 className="w-5 h-5" /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* --- ULTRA-MINIMALIST FULL-FOCUS MODAL --- */}
      {showModal && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-6 animate-in fade-in duration-500">
          {/* Heavy Backdrop Blur */}
          <div 
            className="absolute inset-0 bg-gray-950/60 backdrop-blur-[40px] cursor-pointer"
            onClick={() => setShowModal(false)}
          />
          
          {/* Minimalist Floating Card */}
          <div className="relative bg-white rounded-[3.5rem] w-full max-w-2xl p-12 sm:p-16 shadow-[0_40px_80px_-12px_rgba(0,0,0,0.5)] animate-in zoom-in-95 duration-500">
            <button 
              onClick={() => setShowModal(false)}
              className="absolute top-10 right-10 p-3 bg-gray-50 text-gray-400 hover:bg-gray-100 hover:text-gray-900 rounded-2xl transition-all"
            >
              <X className="w-6 h-6" />
            </button>

            <div className="text-center mb-16">
              <div className="bg-indigo-50 w-20 h-20 rounded-[2rem] flex items-center justify-center mx-auto mb-8 shadow-sm">
                <Sparkles className="w-10 h-10 text-indigo-600" />
              </div>
              <h3 className="text-4xl font-black text-gray-900 tracking-tighter uppercase mb-3">Buat Laba Rugi Baru</h3>
              <p className="text-gray-400 text-lg font-medium max-w-sm mx-auto leading-relaxed">
                Pilih periode untuk menyiapkan data laporan finansial periode Anda.
              </p>
            </div>
            
            <div className="space-y-12">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                <div className="space-y-4">
                  <label className="text-[11px] font-black text-gray-400 uppercase tracking-[0.3em] ml-2">Pilih Bulan</label>
                  <div className="relative group">
                    <select 
                      value={selectedMonth}
                      onChange={(e) => setSelectedMonth(parseInt(e.target.value))}
                      className="w-full bg-gray-50 border-2 border-transparent rounded-[2rem] px-8 py-6 font-black text-gray-900 focus:bg-white focus:border-indigo-500 appearance-none outline-none transition-all cursor-pointer text-xl"
                    >
                      {months.map((month, idx) => (
                        <option key={month} value={idx}>{month}</option>
                      ))}
                    </select>
                    <ChevronDown className="w-6 h-6 absolute right-7 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                  </div>
                </div>

                <div className="space-y-4">
                  <label className="text-[11px] font-black text-gray-400 uppercase tracking-[0.3em] ml-2">Pilih Tahun</label>
                  <div className="relative group">
                    <select 
                      value={selectedYear}
                      onChange={(e) => setSelectedYear(parseInt(e.target.value))}
                      className="w-full bg-gray-50 border-2 border-transparent rounded-[2rem] px-8 py-6 font-black text-gray-900 focus:bg-white focus:border-indigo-500 appearance-none outline-none transition-all cursor-pointer text-xl"
                    >
                      {years.map(year => (
                        <option key={year} value={year}>{year}</option>
                      ))}
                    </select>
                    <ChevronDown className="w-6 h-6 absolute right-7 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                  </div>
                </div>
              </div>

              <div className="pt-6">
                <button 
                  onClick={handleGenerate}
                  disabled={isGenerating}
                  className="w-full py-8 bg-indigo-600 text-white rounded-[2.5rem] font-black text-2xl shadow-[0_24px_48px_-10px_rgba(79,70,229,0.4)] hover:bg-indigo-700 hover:-translate-y-1 transition-all flex items-center justify-center gap-5 active:scale-95 disabled:opacity-50"
                >
                  {isGenerating ? (
                    <Loader className="w-8 h-8 animate-spin" />
                  ) : (
                    <>
                      Proses Laporan
                      <ArrowRight className="w-8 h-8" />
                    </>
                  )}
                </button>
                <p className="text-center text-xs text-gray-300 mt-10 font-bold uppercase tracking-widest">
                  Struktur data otomatis akan mengikuti template standar
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
