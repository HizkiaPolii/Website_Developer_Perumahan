'use client';

import React, { useState, useMemo } from 'react';
import { 
  Folder, 
  FolderOpen, 
  Lock, 
  Unlock, 
  TrendingUp,
  BarChart3
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { formatCurrency } from '@/utils/financial-constants';

interface MonthlyArchive {
  monthIndex: number;
  monthName: string;
  status: 'DRAFT' | 'FINALIZED';
  revenue: number;
  expenses: number;
  netProfit: number;
}

export default function DedicatedArchivePage() {
  const { user } = useAuth();
  const [selectedYear, setSelectedYear] = useState(2026);

  const years = [2026, 2025, 2024];
  const months = [
    'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
    'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
  ];

  // Mocked localized monthly data per year for property developer
  const archiveData: Record<number, MonthlyArchive[]> = {
    2026: [
      { monthIndex: 0, monthName: 'Januari', status: 'FINALIZED', revenue: 410000000, expenses: 280000000, netProfit: 130000000 },
      { monthIndex: 1, monthName: 'Februari', status: 'FINALIZED', revenue: 430000000, expenses: 290000000, netProfit: 140000000 },
      { monthIndex: 2, monthName: 'Maret', status: 'FINALIZED', revenue: 450000000, expenses: 310000000, netProfit: 140000000 },
      { monthIndex: 3, monthName: 'April', status: 'FINALIZED', revenue: 465000000, expenses: 315000000, netProfit: 150000000 },
      { monthIndex: 4, monthName: 'Mei', status: 'DRAFT', revenue: 450000000, expenses: 315000000, netProfit: 135000000 },
      { monthIndex: 5, monthName: 'Juni', status: 'DRAFT', revenue: 0, expenses: 0, netProfit: 0 },
      { monthIndex: 6, monthName: 'Juli', status: 'DRAFT', revenue: 0, expenses: 0, netProfit: 0 },
      { monthIndex: 7, monthName: 'Agustus', status: 'DRAFT', revenue: 0, expenses: 0, netProfit: 0 },
      { monthIndex: 8, monthName: 'September', status: 'DRAFT', revenue: 0, expenses: 0, netProfit: 0 },
      { monthIndex: 9, monthName: 'Oktober', status: 'DRAFT', revenue: 0, expenses: 0, netProfit: 0 },
      { monthIndex: 10, monthName: 'November', status: 'DRAFT', revenue: 0, expenses: 0, netProfit: 0 },
      { monthIndex: 11, monthName: 'Desember', status: 'DRAFT', revenue: 0, expenses: 0, netProfit: 0 },
    ],
    2025: months.map((name, index) => ({
      monthIndex: index,
      monthName: name,
      status: 'FINALIZED',
      revenue: 380000000 + (index * 15000000),
      expenses: 250000000 + (index * 8000000),
      netProfit: (380000000 + (index * 15000000)) - (250000000 + (index * 8000000))
    })),
    2024: months.map((name, index) => ({
      monthIndex: index,
      monthName: name,
      status: 'FINALIZED',
      revenue: 300000000 + (index * 12000000),
      expenses: 210000000 + (index * 5000000),
      netProfit: (300000000 + (index * 12000000)) - (210000000 + (index * 5000000))
    }))
  };

  const selectedYearData = useMemo(() => {
    return archiveData[selectedYear] || [];
  }, [selectedYear]);

  const stats = useMemo(() => {
    const finalized = selectedYearData.filter(m => m.status === 'FINALIZED');
    const totalRev = finalized.reduce((sum, m) => sum + m.revenue, 0);
    const totalProfit = finalized.reduce((sum, m) => sum + m.netProfit, 0);
    return {
      finalizedCount: finalized.length,
      totalRevenue: totalRev,
      totalProfit
    };
  }, [selectedYearData]);

  return (
    <div className="max-w-6xl mx-auto w-full pb-24 animate-in fade-in duration-500">
      
      {/* Upper Bar */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-6 mb-10 bg-white p-6 rounded-3xl border border-slate-200/60 shadow-sm print:hidden">
        <div className="flex items-center gap-4">
          <div>
            <h1 className="text-xl font-bold text-slate-900 uppercase tracking-tight">Pengarsipan Laporan</h1>
            <p className="text-xs text-slate-400 font-semibold italic">Arsip Laporan Keuangan per Tahun & per Bulan</p>
          </div>
        </div>

        {/* Premium Year Selector Tabs */}
        <div className="flex bg-slate-100 p-1.5 rounded-2xl gap-1">
          {years.map(year => (
            <button
              key={year}
              onClick={() => setSelectedYear(year)}
              className={`px-6 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all ${selectedYear === year ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-900'}`}
            >
              {year}
            </button>
          ))}
        </div>
      </div>

      {/* Year Statistics Panel */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10 print:hidden">
        <div className="bg-white border border-slate-200/60 rounded-3xl p-6 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest block">Bulan Terarsip</span>
            <span className="text-xl font-bold text-indigo-600 mt-1 block">{stats.finalizedCount} / 12 Bulan</span>
          </div>
          <span className="p-3 bg-indigo-50 text-indigo-600 rounded-2xl">
            <Folder className="w-5 h-5" />
          </span>
        </div>

        <div className="bg-white border border-slate-200/60 rounded-3xl p-6 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest block">Akumulasi Pendapatan Tahun {selectedYear}</span>
            <span className="text-xl font-bold text-emerald-600 mt-1 block">{formatCurrency(stats.totalRevenue)}</span>
          </div>
          <span className="p-3 bg-emerald-50 text-emerald-600 rounded-2xl">
            <TrendingUp className="w-5 h-5" />
          </span>
        </div>

        <div className="bg-white border border-slate-200/60 rounded-3xl p-6 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest block">Akumulasi Laba Bersih Tahun {selectedYear}</span>
            <span className="text-xl font-bold text-indigo-600 mt-1 block">{formatCurrency(stats.totalProfit)}</span>
          </div>
          <span className="p-3 bg-indigo-50 text-indigo-600 rounded-2xl">
            <BarChart3 className="w-5 h-5" />
          </span>
        </div>
      </div>

      {/* Month Folders Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 print:hidden">
        {selectedYearData.map(archive => {
          const isFinalized = archive.status === 'FINALIZED';
          return (
            <div 
              key={archive.monthIndex}
              className={`bg-white border rounded-3xl p-6 shadow-sm transition-all relative overflow-hidden group ${isFinalized ? 'border-indigo-100 hover:shadow-md' : 'border-slate-200/60 hover:border-slate-300 opacity-90'}`}
            >
              {/* Folder Status Header */}
              <div className="flex items-center justify-between border-b border-slate-50 pb-4 mb-4">
                <div className="flex items-center gap-3">
                  <span className={`p-2.5 rounded-xl ${isFinalized ? 'bg-indigo-50 text-indigo-600' : 'bg-amber-50 text-amber-600'}`}>
                    {isFinalized ? <FolderOpen className="w-5 h-5" /> : <Folder className="w-5 h-5" />}
                  </span>
                  <div>
                    <h3 className="text-xs font-bold text-slate-900 uppercase tracking-tight">{archive.monthName}</h3>
                    <span className="text-[9px] text-slate-400 font-bold uppercase tracking-widest block mt-0.5">Tahun {selectedYear}</span>
                  </div>
                </div>

                <span className={`text-[8px] font-bold uppercase px-2 py-0.5 rounded-full flex items-center gap-1 ${isFinalized ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'}`}>
                  {isFinalized ? (
                    <><Lock className="w-2.5 h-2.5" /> Terarsip</>
                  ) : (
                    <><Unlock className="w-2.5 h-2.5" /> Draft</>
                  )}
                </span>
              </div>

              {/* Mini Financial Summary */}
              {isFinalized ? (
                <div className="grid grid-cols-2 gap-2 mb-5 bg-slate-50 p-3 rounded-2xl">
                  <div>
                    <span className="text-[8px] text-slate-400 font-semibold block uppercase tracking-wider">Pendapatan</span>
                    <span className="text-[10px] font-bold text-emerald-600 block">{formatCurrency(archive.revenue)}</span>
                  </div>
                  <div>
                    <span className="text-[8px] text-slate-400 font-semibold block uppercase tracking-wider">Laba Bersih</span>
                    <span className="text-[10px] font-bold text-indigo-600 block">{formatCurrency(archive.netProfit)}</span>
                  </div>
                </div>
              ) : (
                <div className="text-center py-2 mb-5 bg-amber-50/20 rounded-2xl border border-dashed border-amber-100">
                  <p className="text-[9px] text-amber-700 font-semibold uppercase">Laporan belum difinalisasi</p>
                </div>
              )}

              {/* 4 Report Links Access Grid */}
              <div className="space-y-2">
                <span className="text-[8px] font-bold text-slate-400 uppercase tracking-widest block">Buka Laporan Arsip:</span>
                <div className="grid grid-cols-2 gap-2">
                  <button 
                    onClick={() => window.open(`/laporan/arsip/view?year=${selectedYear}&month=${archive.monthName}&type=NERACA`, '_blank')}
                    className="flex items-center justify-center gap-1 py-2 bg-slate-50 hover:bg-indigo-50 hover:text-indigo-600 text-slate-700 rounded-xl text-[10px] font-bold uppercase transition-all"
                  >
                    📊 Neraca
                  </button>
                  <button 
                    onClick={() => window.open(`/laporan/arsip/view?year=${selectedYear}&month=${archive.monthName}&type=LABA_RUGI`, '_blank')}
                    className="flex items-center justify-center gap-1 py-2 bg-slate-50 hover:bg-indigo-50 hover:text-indigo-600 text-slate-700 rounded-xl text-[10px] font-bold uppercase transition-all"
                  >
                    📈 Laba Rugi
                  </button>
                  <button 
                    onClick={() => window.open(`/laporan/arsip/view?year=${selectedYear}&month=${archive.monthName}&type=ARUS_KAS`, '_blank')}
                    className="flex items-center justify-center gap-1 py-2 bg-slate-50 hover:bg-indigo-50 hover:text-indigo-600 text-slate-700 rounded-xl text-[10px] font-bold uppercase transition-all"
                  >
                    💸 Arus Kas
                  </button>
                  <button 
                    onClick={() => window.open(`/laporan/arsip/view?year=${selectedYear}&month=${archive.monthName}&type=MODAL`, '_blank')}
                    className="flex items-center justify-center gap-1 py-2 bg-slate-50 hover:bg-indigo-50 hover:text-indigo-600 text-slate-700 rounded-xl text-[10px] font-bold uppercase transition-all"
                  >
                    🔄 Modal
                  </button>
                </div>
              </div>

            </div>
          );
        })}
      </div>

    </div>
  );
}
