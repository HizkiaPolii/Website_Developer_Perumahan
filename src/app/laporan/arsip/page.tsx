'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Archive, 
  Lock, 
  Eye,
  FileText,
  Loader2,
  Calendar,
  BarChart3,
  TrendingUp,
  DollarSign,
  RefreshCw,
  Clock,
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  Search
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useFinancialReports } from '@/hooks/useApiEndpoints';
import { useApi } from '@/hooks/useApi';
import { formatCurrency } from '@/utils/financial-constants';
import { PageHeader, Card, Btn } from '@/components/finance-ui';

/* ══════════════════════════════════════════════════════════════════
   TIPE DATA
   ══════════════════════════════════════════════════════════════════ */

interface DailyArchive {
  date: string;          // YYYY-MM-DD
  dayName: string;       // Senin, Selasa, etc.
  displayDate: string;   // 24 Juni 2026
  status: 'LOCKED' | 'OPEN';
  lockedAt?: string;     // Jam dikunci (e.g. "17:00")
  lockedBy?: string;     // User yang mengunci
  reports: {
    neraca: { available: boolean; totalAset?: number; totalPasiva?: number };
    labaRugi: { available: boolean; pendapatan?: number; beban?: number; labaBersih?: number };
    arusKas: { available: boolean; kasAkhir?: number };
    perubahanModal: { available: boolean; modalAkhir?: number };
  };
}

/* ══════════════════════════════════════════════════════════════════
   HELPER — Generate dummy End-of-Day archives
   ══════════════════════════════════════════════════════════════════ */

const HARI = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
const BULAN = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];

function generateDailyArchives(year: number, month: number, apiReports: any[] = []): DailyArchive[] {
  const today = new Date();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const archives: DailyArchive[] = [];

  for (let day = 1; day <= daysInMonth; day++) {
    const date = new Date(year, month, day);
    const dayOfWeek = date.getDay();

    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    
    // Find reports for this date in apiReports
    const dayReports = apiReports.filter((rep: any) => {
      const repDate = new Date(rep.periodEnd);
      const repDateStr = `${repDate.getFullYear()}-${String(repDate.getMonth() + 1).padStart(2, '0')}-${String(repDate.getDate()).padStart(2, '0')}`;
      return repDateStr === dateStr;
    });

    // Find specific reports
    const neracaReport = dayReports.find((r: any) => r.reportType === "NERACA");
    const labaRugiReport = dayReports.find((r: any) => r.reportType === "LABA_RUGI");
    const arusKasReport = dayReports.find((r: any) => r.reportType === "ARUS_KAS");
    const modalReport = dayReports.find((r: any) => r.reportType === "MODAL");

    // Status "LOCKED" mengikuti laporan NERACA saja, konsisten dengan
    // isPeriodLocked() di backend — itu satu-satunya laporan yang dibuat
    // lewat alur resmi "Kunci & Arsipkan" (selalu 1 hari per laporan).
    // Laporan jenis lain (mis. Laba Rugi custom range) tidak dihitung,
    // supaya tanggal tidak tampil "terkunci" padahal sebenarnya masih terbuka.
    const isLocked = neracaReport?.status === "FINALIZED";
    const lockedRep = neracaReport?.status === "FINALIZED" ? neracaReport : undefined;
    const lockedAtTime = lockedRep?.finalizedAt 
      ? new Date(lockedRep.finalizedAt).toLocaleTimeString("id-ID", { hour: '2-digit', minute: '2-digit' }) + " WITA" 
      : undefined;
    const lockedByUser = lockedRep?.finalizer?.name || lockedRep?.creator?.name || "Sistem";

    archives.push({
      date: dateStr,
      dayName: HARI[dayOfWeek],
      displayDate: `${day} ${BULAN[month]} ${year}`,
      status: isLocked ? 'LOCKED' : 'OPEN',
      lockedAt: isLocked ? (lockedAtTime || '18:00 WITA') : undefined,
      lockedBy: isLocked ? lockedByUser : undefined,
      reports: {
        neraca: {
          available: !!neracaReport,
          totalAset: neracaReport?.reportData?.totalAset || undefined,
          totalPasiva: neracaReport?.reportData?.totalPasiva || undefined,
        },
        labaRugi: {
          available: !!labaRugiReport,
          pendapatan: labaRugiReport?.reportData?.totalPendapatan || undefined,
          beban: labaRugiReport?.reportData?.totalBeban || undefined,
          labaBersih: labaRugiReport?.reportData?.labaBersih || undefined,
        },
        arusKas: {
          available: !!arusKasReport,
          kasAkhir: arusKasReport?.reportData?.kasAkhirPeriode || undefined,
        },
        perubahanModal: {
          available: !!modalReport,
          modalAkhir: modalReport?.reportData?.ekuitasAkhir || undefined,
        },
      }
    });
  }

  return archives;
}

/* ══════════════════════════════════════════════════════════════════
   KOMPONEN UTAMA
   ══════════════════════════════════════════════════════════════════ */

export default function ArsipLaporanPage() {
  const { user } = useAuth();
  const { getAll, loading } = useFinancialReports();
  const { call } = useApi();
  const router = useRouter();

  const today = new Date();
  const [selectedYear, setSelectedYear] = useState(today.getFullYear());
  const [selectedMonth, setSelectedMonth] = useState(today.getMonth());
  const [apiReports, setApiReports] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchDate, setSearchDate] = useState('');

  const currentYear = today.getFullYear();
  const years = [currentYear, currentYear - 1, currentYear - 2];

  // Fetch real data from API
  const fetchReports = async () => {
    setIsLoading(true);
    try {
      const data = await getAll();
      setApiReports(data || []);
    } catch (err) {
      console.error('Gagal memuat data arsip:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, []);

  const handleLockDay = async (date: string) => {
    setIsLoading(true);
    try {
      const res = await call('POST', '/api/dashboard/reports/eod/trigger', {
        companyId: user?.companyId || 1,
        date,
      });
      if (res && res.success) {
        await fetchReports();
      } else {
        alert(res?.message || 'Gagal menjalankan End of Day');
      }
    } catch (err: any) {
      console.error('Gagal mengunci hari:', err);
      alert(err.message || 'Gagal menjalankan End of Day');
    } finally {
      setIsLoading(false);
    }
  };

  // Generate daily archives for selected month
  const dailyArchives = useMemo(
    () => generateDailyArchives(selectedYear, selectedMonth, apiReports),
    [selectedYear, selectedMonth, apiReports]
  );

  // Filter by search
  const filteredArchives = useMemo(() => {
    if (!searchDate) return dailyArchives;
    return dailyArchives.filter(a =>
      a.displayDate.toLowerCase().includes(searchDate.toLowerCase()) ||
      a.dayName.toLowerCase().includes(searchDate.toLowerCase()) ||
      a.date.includes(searchDate)
    );
  }, [dailyArchives, searchDate]);

  // Stats
  const stats = useMemo(() => {
    const locked = dailyArchives.filter(a => a.status === 'LOCKED');
    const open = dailyArchives.filter(a => a.status === 'OPEN');
    return {
      totalDays: dailyArchives.length,
      locked: locked.length,
      open: open.length,
      apiReportsCount: apiReports.length,
    };
  }, [dailyArchives, apiReports]);

  // Navigate month
  const prevMonth = () => {
    if (selectedMonth === 0) {
      setSelectedMonth(11);
      setSelectedYear(y => y - 1);
    } else {
      setSelectedMonth(m => m - 1);
    }
  };

  const nextMonth = () => {
    if (selectedMonth === 11) {
      setSelectedMonth(0);
      setSelectedYear(y => y + 1);
    } else {
      setSelectedMonth(m => m + 1);
    }
  };

  // Open arsip view
  const openReportView = (date: string, type: string) => {
    const d = new Date(date);
    const monthName = BULAN[d.getMonth()];
    const year = d.getFullYear();
    window.open(`/laporan/arsip/view?date=${date}&year=${year}&month=${monthName}&type=${type}`, '_blank');
  };

  // Navigate to live report
  const navigateToReport = (path: string) => {
    router.push(path);
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto animate-fade-in">

      {/* Header */}
      <PageHeader
        title="Pengarsipan Laporan Keuangan"
        description="Manager dapat mengunci laporan keuangan harian secara manual. Laporan yang terkunci tersimpan sebagai arsip historis dan tidak dapat diubah."
        icon={Archive}
      />

      {/* Info Banner */}
      <Card className="p-4 bg-indigo-50/50 border-indigo-100">
        <div className="flex items-start gap-3">
          <Lock className="w-5 h-5 text-indigo-500 mt-0.5 shrink-0" />
          <div>
            <p className="text-xs font-bold text-indigo-800 uppercase tracking-wide">Cara Kerja Pengarsipan</p>
            <p className="text-xs text-indigo-600 mt-1 leading-relaxed">
              Manager dapat mengunci (lock) laporan keuangan harian kapan pun diperlukan melalui tombol <strong>Kunci &amp; Arsipkan</strong> pada baris hari yang diinginkan.
              Laporan yang diarsipkan meliputi: <strong>Neraca</strong>, <strong>Laba Rugi</strong>, <strong>Arus Kas</strong>, dan <strong>Perubahan Modal</strong>.
              Data yang sudah terkunci tidak dapat diubah dan tersimpan sebagai arsip historis permanen.
            </p>
          </div>
        </div>
      </Card>

      {/* Month & Year Navigator */}
      <Card className="p-5">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          {/* Month Nav */}
          <div className="flex items-center gap-3">
            <button onClick={prevMonth} className="p-2 hover:bg-slate-100 rounded-xl transition-all">
              <ChevronLeft className="w-5 h-5 text-slate-500" />
            </button>
            <div className="text-center min-w-[180px]">
              <h2 className="text-lg font-black text-slate-800 tracking-tight">
                {BULAN[selectedMonth]} {selectedYear}
              </h2>
              <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-widest mt-0.5">
                {stats.locked} hari terkunci · {stats.open} hari terbuka
              </p>
            </div>
            <button onClick={nextMonth} className="p-2 hover:bg-slate-100 rounded-xl transition-all">
              <ChevronRight className="w-5 h-5 text-slate-500" />
            </button>
          </div>

          {/* Year Tabs + Search */}
          <div className="flex items-center gap-3">
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Cari tanggal..."
                value={searchDate}
                onChange={e => setSearchDate(e.target.value)}
                className="pl-8 pr-3 py-2 text-xs border border-slate-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-indigo-200 focus:border-indigo-300 w-36"
              />
            </div>
            <div className="flex bg-slate-100 p-1 rounded-xl gap-0.5">
              {years.map(year => (
                <button
                  key={year}
                  onClick={() => setSelectedYear(year)}
                  className={`px-4 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all ${
                    selectedYear === year
                      ? 'bg-white text-indigo-600 shadow-sm'
                      : 'text-slate-500 hover:text-slate-900'
                  }`}
                >
                  {year}
                </button>
              ))}
            </div>
          </div>
        </div>
      </Card>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <Card className="p-4 flex items-center justify-between">
          <div>
            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest block">Hari Kerja</span>
            <span className="text-xl font-black text-slate-800 mt-1 block">{stats.totalDays}</span>
          </div>
          <span className="p-2.5 bg-slate-100 text-slate-500 rounded-xl">
            <Calendar className="w-4 h-4" />
          </span>
        </Card>
        <Card className="p-4 flex items-center justify-between">
          <div>
            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest block">Terkunci</span>
            <span className="text-xl font-black text-emerald-600 mt-1 block">{stats.locked}</span>
          </div>
          <span className="p-2.5 bg-emerald-50 text-emerald-500 rounded-xl">
            <Lock className="w-4 h-4" />
          </span>
        </Card>
        <Card className="p-4 flex items-center justify-between">
          <div>
            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest block">Terbuka</span>
            <span className="text-xl font-black text-amber-600 mt-1 block">{stats.open}</span>
          </div>
          <span className="p-2.5 bg-amber-50 text-amber-500 rounded-xl">
            <Clock className="w-4 h-4" />
          </span>
        </Card>
        <Card className="p-4 flex items-center justify-between">
          <div>
            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest block">Arsip Tersimpan</span>
            <span className="text-xl font-black text-indigo-600 mt-1 block">{stats.apiReportsCount}</span>
          </div>
          <span className="p-2.5 bg-indigo-50 text-indigo-500 rounded-xl">
            <FileText className="w-4 h-4" />
          </span>
        </Card>
      </div>

      {/* Loading */}
      {isLoading && (
        <Card className="p-10 flex flex-col items-center justify-center gap-2">
          <Loader2 className="w-6 h-6 text-indigo-500 animate-spin" />
          <p className="text-xs text-slate-500 font-semibold">Memuat data arsip...</p>
        </Card>
      )}

      {/* Empty State — belum ada laporan dikunci bulan ini */}
      {!isLoading && stats.locked === 0 && (
        <Card className="p-12 flex flex-col items-center justify-center gap-3 text-center">
          <div className="w-14 h-14 rounded-2xl bg-slate-100 flex items-center justify-center">
            <Archive className="w-7 h-7 text-slate-400" />
          </div>
          <div>
            <p className="text-sm font-bold text-slate-600">Belum ada laporan diarsipkan</p>
            <p className="text-xs text-slate-400 mt-1">
              Belum ada laporan yang dikunci untuk periode <strong>{BULAN[selectedMonth]} {selectedYear}</strong>.
              <br />Gunakan tombol <strong>Kunci &amp; Arsipkan</strong> pada baris hari di bawah ini untuk mulai mengarsipkan.
            </p>
          </div>
        </Card>
      )}

      {/* Daily Archive Table */}
      {!isLoading && (
        <Card className="overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Archive className="w-4 h-4 text-indigo-600" />
              <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wide">
                Arsip Harian — {BULAN[selectedMonth]} {selectedYear}
              </h3>
            </div>
            <span className="text-[10px] font-bold bg-slate-100 text-slate-600 px-2.5 py-1 rounded-full">
              {filteredArchives.length} hari
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-slate-50 text-left">
                  <th className="px-5 py-3 text-[10px] font-bold text-slate-500 uppercase tracking-widest">Tanggal</th>
                  <th className="px-5 py-3 text-[10px] font-bold text-slate-500 uppercase tracking-widest">Status</th>
                  <th className="px-5 py-3 text-[10px] font-bold text-slate-500 uppercase tracking-widest text-center">Neraca</th>
                  <th className="px-5 py-3 text-[10px] font-bold text-slate-500 uppercase tracking-widest text-center">Laba Rugi</th>
                  <th className="px-5 py-3 text-[10px] font-bold text-slate-500 uppercase tracking-widest text-center">Arus Kas</th>
                  <th className="px-5 py-3 text-[10px] font-bold text-slate-500 uppercase tracking-widest text-center">Perubahan Modal</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {filteredArchives.map((archive) => {
                  const isLocked = archive.status === 'LOCKED';
                  const isWeekend = archive.dayName === 'Sabtu' || archive.dayName === 'Minggu';
                  // Parse date as local time (avoid UTC midnight timezone issue)
                  const [ay, am, ad] = archive.date.split('-').map(Number);
                  const archiveLocalDate = new Date(ay, am - 1, ad);
                  const isPast = archiveLocalDate <= today;
                  return (
                    <tr
                      key={archive.date}
                      className={`transition-colors ${
                        isWeekend
                          ? 'bg-slate-50/60 opacity-70'
                          : isLocked
                            ? 'hover:bg-slate-50/70'
                            : 'hover:bg-amber-50/30 bg-amber-50/10'
                      }`}
                    >
                      {/* Date */}
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-3">
                          <div className={`w-9 h-9 rounded-xl flex items-center justify-center text-xs font-black ${
                            isWeekend ? 'bg-slate-100 text-slate-400' :
                            isLocked ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'
                          }`}>
                            {ad}
                          </div>
                          <div>
                            <p className={`text-xs font-bold ${isWeekend ? 'text-slate-400' : 'text-slate-800'}`}>
                              {archive.dayName}
                              {isWeekend && <span className="ml-1.5 text-[9px] font-semibold text-slate-300 uppercase tracking-wide">Libur</span>}
                            </p>
                            <p className="text-[10px] text-slate-400 mt-0.5">{archive.displayDate}</p>
                          </div>
                        </div>
                      </td>

                      {/* Status */}
                      <td className="px-5 py-3.5">
                        {isWeekend ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-slate-100 text-slate-400 rounded-full text-[9px] font-bold uppercase">
                            Hari Libur
                          </span>
                        ) : isLocked ? (
                          <div>
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-emerald-50 text-emerald-700 rounded-full text-[9px] font-bold uppercase">
                              <Lock className="w-2.5 h-2.5" /> Terkunci
                            </span>
                            <p className="text-[9px] text-slate-400 mt-1">
                              {archive.lockedAt}
                            </p>
                          </div>
                        ) : (
                          <div className="space-y-1">
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-amber-50 text-amber-700 rounded-full text-[9px] font-bold uppercase">
                              <Clock className="w-2.5 h-2.5" /> Terbuka
                            </span>
                            {isPast && (
                              <button
                                onClick={() => handleLockDay(archive.date)}
                                className="block text-[8px] font-bold text-indigo-600 hover:text-indigo-800 hover:underline uppercase tracking-wider text-left"
                              >
                                Kunci &amp; Arsipkan
                              </button>
                            )}
                          </div>
                        )}
                      </td>

                      {/* Neraca */}
                      <td className="px-5 py-3.5 text-center">
                        {isLocked && archive.reports.neraca.available ? (
                          <button
                            onClick={() => openReportView(archive.date, 'NERACA')}
                            className="inline-flex flex-col items-center gap-1 px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-600 rounded-lg transition-all group w-full"
                          >
                            <span className="flex items-center gap-1 text-[10px] font-bold uppercase">
                              <BarChart3 className="w-3 h-3" /> Lihat
                            </span>
                            {archive.reports.neraca.totalAset && (
                              <span className="text-[8px] text-blue-400 font-mono">
                                {formatCurrency(archive.reports.neraca.totalAset)}
                              </span>
                            )}
                          </button>
                        ) : (
                          <span className="text-[9px] text-slate-300 font-semibold">—</span>
                        )}
                      </td>

                      {/* Laba Rugi */}
                      <td className="px-5 py-3.5 text-center">
                        {isLocked && archive.reports.labaRugi.available ? (
                          <button
                            onClick={() => openReportView(archive.date, 'LABA_RUGI')}
                            className="inline-flex flex-col items-center gap-1 px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-600 rounded-lg transition-all group w-full"
                          >
                            <span className="flex items-center gap-1 text-[10px] font-bold uppercase">
                              <TrendingUp className="w-3 h-3" /> Lihat
                            </span>
                            {archive.reports.labaRugi.labaBersih && (
                              <span className={`text-[8px] font-mono ${archive.reports.labaRugi.labaBersih >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                                {formatCurrency(archive.reports.labaRugi.labaBersih)}
                              </span>
                            )}
                          </button>
                        ) : (
                          <span className="text-[9px] text-slate-300 font-semibold">—</span>
                        )}
                      </td>

                      {/* Arus Kas */}
                      <td className="px-5 py-3.5 text-center">
                        {isLocked && archive.reports.arusKas.available ? (
                          <button
                            onClick={() => openReportView(archive.date, 'ARUS_KAS')}
                            className="inline-flex flex-col items-center gap-1 px-3 py-1.5 bg-amber-50 hover:bg-amber-100 text-amber-600 rounded-lg transition-all group w-full"
                          >
                            <span className="flex items-center gap-1 text-[10px] font-bold uppercase">
                              <DollarSign className="w-3 h-3" /> Lihat
                            </span>
                            {archive.reports.arusKas.kasAkhir && (
                              <span className="text-[8px] text-amber-400 font-mono">
                                {formatCurrency(archive.reports.arusKas.kasAkhir)}
                              </span>
                            )}
                          </button>
                        ) : (
                          <span className="text-[9px] text-slate-300 font-semibold">—</span>
                        )}
                      </td>

                      {/* Perubahan Modal */}
                      <td className="px-5 py-3.5 text-center">
                        {isLocked && archive.reports.perubahanModal.available ? (
                          <button
                            onClick={() => openReportView(archive.date, 'MODAL')}
                            className="inline-flex flex-col items-center gap-1 px-3 py-1.5 bg-purple-50 hover:bg-purple-100 text-purple-600 rounded-lg transition-all group w-full"
                          >
                            <span className="flex items-center gap-1 text-[10px] font-bold uppercase">
                              <RefreshCw className="w-3 h-3" /> Lihat
                            </span>
                            {archive.reports.perubahanModal.modalAkhir && (
                              <span className="text-[8px] text-purple-400 font-mono">
                                {formatCurrency(archive.reports.perubahanModal.modalAkhir)}
                              </span>
                            )}
                          </button>
                        ) : (
                          <span className="text-[9px] text-slate-300 font-semibold">—</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {filteredArchives.length === 0 && (
            <div className="p-10 flex flex-col items-center justify-center gap-2">
              <Archive className="w-8 h-8 text-slate-300" />
              <p className="text-xs text-slate-400 font-semibold">Tidak ada data arsip ditemukan</p>
            </div>
          )}
        </Card>
      )}

      {/* Quick Links — Tautan ke Laporan Live */}
      <Card className="p-5">
        <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-4">
          Tautan Cepat ke Halaman Laporan Aktif
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <button
            onClick={() => navigateToReport('/laporan/neraca')}
            className="flex flex-col items-center gap-2 p-4 bg-blue-50/50 hover:bg-blue-100/70 border border-blue-100 rounded-2xl transition-all group"
          >
            <BarChart3 className="w-5 h-5 text-blue-500 group-hover:scale-110 transition-transform" />
            <span className="text-[10px] font-bold text-blue-700 uppercase">Neraca</span>
          </button>
          <button
            onClick={() => navigateToReport('/laporan/laba-rugi')}
            className="flex flex-col items-center gap-2 p-4 bg-emerald-50/50 hover:bg-emerald-100/70 border border-emerald-100 rounded-2xl transition-all group"
          >
            <TrendingUp className="w-5 h-5 text-emerald-500 group-hover:scale-110 transition-transform" />
            <span className="text-[10px] font-bold text-emerald-700 uppercase">Laba Rugi</span>
          </button>
          <button
            onClick={() => navigateToReport('/laporan/arus-kas')}
            className="flex flex-col items-center gap-2 p-4 bg-amber-50/50 hover:bg-amber-100/70 border border-amber-100 rounded-2xl transition-all group"
          >
            <DollarSign className="w-5 h-5 text-amber-500 group-hover:scale-110 transition-transform" />
            <span className="text-[10px] font-bold text-amber-700 uppercase">Arus Kas</span>
          </button>
          <button
            onClick={() => navigateToReport('/laporan/perubahan-modal')}
            className="flex flex-col items-center gap-2 p-4 bg-purple-50/50 hover:bg-purple-100/70 border border-purple-100 rounded-2xl transition-all group"
          >
            <RefreshCw className="w-5 h-5 text-purple-500 group-hover:scale-110 transition-transform" />
            <span className="text-[10px] font-bold text-purple-700 uppercase">Perubahan Modal</span>
          </button>
        </div>
      </Card>
    </div>
  );
}
