'use client';

import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { Printer, ArrowLeft, Loader2, AlertCircle } from 'lucide-react';
import { formatCurrency } from '@/utils/financial-constants';
import { useFinancialReports } from '@/hooks/useApiEndpoints';
import { useAuth } from '@/contexts/AuthContext';

function AccountNodeRow({ node, depth = 0 }: { node: any; depth?: number }) {
  return (
    <>
      <tr className="border-b border-slate-200 hover:bg-slate-50/30">
        <td className="py-2 pl-2" style={{ paddingLeft: `${depth * 1.5 + 0.5}rem` }}>
          <span className="font-mono text-[10px] text-slate-400 mr-2 bg-slate-50 px-1 py-0.5 rounded">{node.code}</span>
          <span className="text-slate-800 font-medium">{node.name}</span>
        </td>
        <td className="text-right font-mono font-bold pr-2 text-slate-900">
          {formatCurrency(node.balance)}
        </td>
      </tr>
      {node.children && node.children.map((child: any) => (
        <AccountNodeRow key={child.id} node={child} depth={depth + 1} />
      ))}
    </>
  );
}

function ReportContent() {
  const searchParams = useSearchParams();
  const year = searchParams.get('year') || '2026';
  const monthName = searchParams.get('month') || 'Mei';
  const reportType = searchParams.get('type') || 'NERACA';
  const dateStr = searchParams.get('date');

  const { token, isLoading: authLoading } = useAuth();
  const { getAll } = useFinancialReports();
  const [report, setReport] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (authLoading) {
      return; // Wait for AuthContext session recovery
    }

    if (!token) {
      setLoading(false);
      setError('Sesi Anda tidak ditemukan. Silakan login terlebih dahulu dan muat ulang halaman ini.');
      return;
    }

    const fetchReport = async () => {
      if (!dateStr) {
        setLoading(false);
        setError('Parameter tanggal tidak valid. Buka halaman ini melalui menu Arsip Laporan.');
        return;
      }
      try {
        // Parse dateStr (YYYY-MM-DD) as local time to avoid UTC offset issues
        const [dy, dm, dd] = dateStr.split('-').map(Number);
        const start = new Date(dy, dm - 1, dd, 0, 0, 0, 0);
        const end   = new Date(dy, dm - 1, dd, 23, 59, 59, 999);

        let apiData = await getAll({
          reportType,
          status: 'FINALIZED',
          startDate: start.toISOString(),
          endDate: end.toISOString(),
        });

        let data = apiData.filter((rep: any) => {
          const repDate = new Date(rep.periodEnd);
          const repDateStr = `${repDate.getFullYear()}-${String(repDate.getMonth() + 1).padStart(2, '0')}-${String(repDate.getDate()).padStart(2, '0')}`;
          const utcDateStr = `${repDate.getUTCFullYear()}-${String(repDate.getUTCMonth() + 1).padStart(2, '0')}-${String(repDate.getUTCDate()).padStart(2, '0')}`;
          return repDateStr === dateStr || utcDateStr === dateStr;
        });

        // Fallback: jika query filter tidak menemukan, cari dari semua laporan
        if (data.length === 0) {
          const allData = await getAll();
          data = allData.filter((rep: any) => {
            if (rep.reportType !== reportType || rep.status !== 'FINALIZED') return false;
            const repDate = new Date(rep.periodEnd);
            const repDateStr = `${repDate.getFullYear()}-${String(repDate.getMonth() + 1).padStart(2, '0')}-${String(repDate.getDate()).padStart(2, '0')}`;
            const utcDateStr = `${repDate.getUTCFullYear()}-${String(repDate.getUTCMonth() + 1).padStart(2, '0')}-${String(repDate.getUTCDate()).padStart(2, '0')}`;
            return repDateStr === dateStr || utcDateStr === dateStr;
          });
        }

        if (data && data.length > 0) {
          setReport(data[0]);
        } else {
          setError(`Laporan ${reportType} untuk tanggal ${dateStr} tidak ditemukan di database. Pastikan laporan hari tersebut telah dikunci (Locked).`);
        }
      } catch (err: any) {
        console.error('Gagal memuat laporan arsip:', err);
        setError(err.message || 'Gagal memuat laporan dari server.');
      } finally {
        setLoading(false);
      }
    };

    fetchReport();
  }, [dateStr, reportType, token, authLoading]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center gap-3">
        <Loader2 className="w-8 h-8 text-indigo-600 animate-spin" />
        <p className="text-xs text-slate-500 font-bold uppercase tracking-wider">Memuat Dokumen Arsip...</p>
      </div>
    );
  }

  if (error || !report) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6 text-center">
        <div className="max-w-md bg-white border border-slate-200 p-8 rounded-3xl shadow-xl flex flex-col items-center gap-4">
          <div className="w-12 h-12 bg-rose-50 rounded-2xl flex items-center justify-center text-rose-500">
            <AlertCircle className="w-6 h-6" />
          </div>
          <h2 className="text-base font-black text-slate-800 uppercase tracking-wide">Gagal Memuat Arsip</h2>
          <p className="text-xs text-slate-500 leading-relaxed">{error}</p>
          <button 
            onClick={() => window.close()} 
            className="mt-2 px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold rounded-xl transition-all"
          >
            Tutup Halaman
          </button>
        </div>
      </div>
    );
  }

  const data = report.reportData;

  return (
    <div className="min-h-screen bg-slate-50 p-8 sm:p-16 text-black selection:bg-slate-100 font-sans print:bg-white print:p-0">
      
      {/* Floating Action Bar (Hidden during printing) */}
      <div className="max-w-3xl mx-auto mb-6 flex items-center justify-between border-b border-slate-200 pb-6 print:hidden no-print">
        <button 
          onClick={() => window.close()} 
          className="flex items-center gap-2 px-4 py-2 bg-white hover:bg-slate-100 text-slate-800 text-xs font-bold rounded-xl border border-slate-200 shadow-sm transition-all"
        >
          <ArrowLeft className="w-4 h-4" /> Tutup Halaman
        </button>
        
        <button 
          onClick={() => window.print()}
          className="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold uppercase rounded-xl shadow-lg shadow-indigo-100 transition-all"
        >
          <Printer className="w-4 h-4" /> Cetak Dokumen
        </button>
      </div>

      {/* Main Print Container */}
      <div className="max-w-3xl mx-auto bg-white border border-slate-300 p-12 sm:p-16 rounded-3xl shadow-lg print:border-none print:p-0 print:shadow-none">
        
        {/* Letterhead */}
        <div className="text-center border-b-2 border-black pb-8 mb-10">
          <h1 className="text-base font-bold uppercase tracking-[0.2em] mb-1">PT. BUMI RESIDENCE DEVELOPER PERUMAHAN</h1>
          <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-widest mb-4">Ruko Pemasaran Blok A1-A2, Kawasan Perumahan Bumi Residence Green Hills</p>
          
          <h2 className="text-xl font-bold uppercase tracking-tight mb-1">
            {reportType === 'NERACA' && 'Laporan Neraca (Posisi Keuangan)'}
            {reportType === 'LABA_RUGI' && 'Laporan Laba Rugi'}
            {reportType === 'ARUS_KAS' && 'Laporan Arus Kas'}
            {reportType === 'MODAL' && 'Laporan Perubahan Modal (Ekuitas)'}
          </h2>
          <p className="text-xs font-bold uppercase italic text-slate-600">
            Periode Penguncian Harian: {new Date(report.periodEnd).toLocaleDateString("id-ID", { day: 'numeric', month: 'long', year: 'numeric' })}
          </p>
        </div>

        {/* Content Section */}
        <div className="space-y-8 min-h-[40vh]">
          
          {/* NERACA */}
          {reportType === 'NERACA' && (
            <div className="space-y-8">
              <div>
                <h3 className="text-xs font-bold text-black uppercase tracking-wider mb-3 border-b-2 border-black pb-1.5">A. ASET (DEBIT)</h3>
                <table className="w-full text-xs">
                  <tbody>
                    {data.aset && data.aset.map((node: any) => (
                      <AccountNodeRow key={node.id} node={node} />
                    ))}
                    <tr className="font-bold border-t-2 border-black bg-slate-50"><td className="py-3 pl-2 uppercase">TOTAL ASET</td><td className="text-right font-mono pr-2">{formatCurrency(data.totalAset || 0)}</td></tr>
                  </tbody>
                </table>
              </div>
              
              <div>
                <h3 className="text-xs font-bold text-black uppercase tracking-wider mb-3 border-b-2 border-black pb-1.5">B. KEWAJIBAN & EKUITAS (KREDIT)</h3>
                <table className="w-full text-xs">
                  <tbody>
                    {data.kewajiban && data.kewajiban.map((node: any) => (
                      <AccountNodeRow key={node.id} node={node} />
                    ))}
                    <tr className="border-b border-slate-200"><td className="py-2.5 pl-2 font-bold">Ekuitas Akhir Pemilik (Terkunci)</td><td className="text-right font-mono font-bold pr-2">{formatCurrency(data.ekuitasAkhir || 0)}</td></tr>
                    <tr className="font-bold border-t-2 border-black bg-slate-50"><td className="py-3 pl-2 uppercase">TOTAL KEWAJIBAN & EKUITAS</td><td className="text-right font-mono pr-2">{formatCurrency(data.totalPasiva || 0)}</td></tr>
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* LABA RUGI */}
          {reportType === 'LABA_RUGI' && (
            <div className="space-y-8">
              <div>
                <h3 className="text-xs font-bold text-black uppercase tracking-wider mb-3 border-b-2 border-black pb-1.5">1. PENDAPATAN OPERASIONAL</h3>
                <table className="w-full text-xs">
                  <tbody>
                    {data.pendapatan && data.pendapatan.map((node: any) => (
                      <AccountNodeRow key={node.id} node={node} />
                    ))}
                    <tr className="font-bold border-t-2 border-black bg-slate-50"><td className="py-3 pl-2 uppercase">TOTAL PENDAPATAN</td><td className="text-right font-mono pr-2">{formatCurrency(data.totalPendapatan || 0)}</td></tr>
                  </tbody>
                </table>
              </div>

              <div>
                <h3 className="text-xs font-bold text-black uppercase tracking-wider mb-3 border-b-2 border-black pb-1.5">2. BEBAN OPERASIONAL</h3>
                <table className="w-full text-xs">
                  <tbody>
                    {data.beban && data.beban.map((node: any) => (
                      <AccountNodeRow key={node.id} node={node} />
                    ))}
                    <tr className="font-bold border-t-2 border-black bg-slate-50"><td className="py-3 pl-2 uppercase">TOTAL BEBAN OPERASIONAL</td><td className="text-right font-mono pr-2 text-red-600">{formatCurrency(data.totalBeban || 0)}</td></tr>
                  </tbody>
                </table>
              </div>

              <div className="border-2 border-black p-5 flex justify-between items-center bg-slate-50">
                <span className="text-xs font-bold uppercase">LABA BERSIH PERIODE TERKUNCI</span>
                <span className={`font-mono text-sm font-bold ${data.labaBersih >= 0 ? 'text-emerald-700' : 'text-rose-600'}`}>
                  {formatCurrency(data.labaBersih || 0)}
                </span>
              </div>
            </div>
          )}

          {/* ARUS KAS */}
          {reportType === 'ARUS_KAS' && (
            <div className="space-y-6">
              <table className="w-full text-xs">
                <tbody>
                  <tr className="border-b-2 border-black font-bold bg-slate-100"><td className="py-2.5 pl-2" colSpan={2}>A. ARUS KAS DARI AKTIVITAS OPERASI</td></tr>
                  {data.operasional && data.operasional.map((group: any, idx: number) => (
                    <React.Fragment key={idx}>
                      <tr className="font-semibold bg-slate-50/50"><td className="py-1.5 pl-4 text-[10px] text-slate-500 uppercase" colSpan={2}>{group.label}</td></tr>
                      {group.items.map((item: any, idy: number) => (
                        <tr key={idy} className="border-b border-slate-150">
                          <td className="py-2 pl-6">{item.code} - {item.name}</td>
                          <td className={`text-right font-mono pr-2 ${item.amount < 0 ? 'text-rose-600' : 'text-emerald-700'}`}>
                            {item.amount < 0 ? `(${formatCurrency(Math.abs(item.amount))})` : formatCurrency(item.amount)}
                          </td>
                        </tr>
                      ))}
                      <tr className="font-bold border-b border-slate-300">
                        <td className="py-2 pl-4 italic">Total {group.label}</td>
                        <td className="text-right font-mono pr-2">{group.total < 0 ? `(${formatCurrency(Math.abs(group.total))})` : formatCurrency(group.total)}</td>
                      </tr>
                    </React.Fragment>
                  ))}
                  <tr className="font-bold bg-slate-100 border-b-2 border-slate-400">
                    <td className="py-2 pl-2">TOTAL ARUS KAS AKTIVITAS OPERASI (A)</td>
                    <td className="text-right font-mono pr-2">{data.totalOperasional < 0 ? `(${formatCurrency(Math.abs(data.totalOperasional))})` : formatCurrency(data.totalOperasional)}</td>
                  </tr>
                  
                  <tr className="border-b-2 border-black font-bold bg-slate-100"><td className="py-2.5 pl-2" colSpan={2}>B. ARUS KAS DARI AKTIVITAS INVESTASI</td></tr>
                  {data.investasi && data.investasi.map((group: any, idx: number) => (
                    <React.Fragment key={idx}>
                      {group.items.map((item: any, idy: number) => (
                        <tr key={idy} className="border-b border-slate-150">
                          <td className="py-2 pl-6">{item.code} - {item.name}</td>
                          <td className={`text-right font-mono pr-2 ${item.amount < 0 ? 'text-rose-600' : 'text-emerald-700'}`}>
                            {item.amount < 0 ? `(${formatCurrency(Math.abs(item.amount))})` : formatCurrency(item.amount)}
                          </td>
                        </tr>
                      ))}
                    </React.Fragment>
                  ))}
                  <tr className="font-bold bg-slate-100 border-b-2 border-slate-400">
                    <td className="py-2 pl-2">TOTAL ARUS KAS AKTIVITAS INVESTASI (B)</td>
                    <td className="text-right font-mono pr-2">{data.totalInvestasi < 0 ? `(${formatCurrency(Math.abs(data.totalInvestasi))})` : formatCurrency(data.totalInvestasi)}</td>
                  </tr>
                  
                  <tr className="border-b-2 border-black font-bold bg-slate-100"><td className="py-2.5 pl-2" colSpan={2}>C. ARUS KAS DARI AKTIVITAS PENDANAAN</td></tr>
                  {data.pendanaan && data.pendanaan.map((group: any, idx: number) => (
                    <React.Fragment key={idx}>
                      {group.items.map((item: any, idy: number) => (
                        <tr key={idy} className="border-b border-slate-150">
                          <td className="py-2 pl-6">{item.code} - {item.name}</td>
                          <td className={`text-right font-mono pr-2 ${item.amount < 0 ? 'text-rose-600' : 'text-emerald-700'}`}>
                            {item.amount < 0 ? `(${formatCurrency(Math.abs(item.amount))})` : formatCurrency(item.amount)}
                          </td>
                        </tr>
                      ))}
                    </React.Fragment>
                  ))}
                  <tr className="font-bold bg-slate-100 border-b-2 border-slate-400">
                    <td className="py-2 pl-2">TOTAL ARUS KAS AKTIVITAS PENDANAAN (C)</td>
                    <td className="text-right font-mono pr-2">{data.totalPendanaan < 0 ? `(${formatCurrency(Math.abs(data.totalPendanaan))})` : formatCurrency(data.totalPendanaan)}</td>
                  </tr>
                  
                  <tr className="font-bold border-t-2 border-black bg-black text-white">
                    <td className="py-3 pl-2 uppercase">SALDO KAS AKHIR PERIODE (NET)</td>
                    <td className="text-right font-mono pr-2">{formatCurrency(data.kasAkhirPeriode || 0)}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          )}

          {/* PERUBAHAN MODAL */}
          {reportType === 'MODAL' && (
            <div className="space-y-6">
              <table className="w-full text-xs">
                <tbody>
                  <tr className="border-b border-slate-200"><td className="py-2.5 pl-2 font-bold">Modal Awal Pemilik</td><td className="text-right font-mono font-bold pr-2">{formatCurrency(data.modalAwal || 0)}</td></tr>
                  <tr className="border-b border-slate-200"><td className="py-2.5 pl-2">Laba Bersih Setelah Pajak (Net Income)</td><td className="text-right font-mono pr-2">{formatCurrency(data.labaBersih || 0)}</td></tr>
                  <tr className="border-b border-slate-200"><td className="py-2.5 pl-2">Pengambilan Prive Pemilik</td><td className="text-right font-mono pr-2 text-red-650 text-red-600">({formatCurrency(data.prive || 0)})</td></tr>
                  <tr className="font-bold border-t-2 border-black bg-black text-white"><td className="py-3 pl-2 uppercase">MODAL AKHIR PEMILIK (EOD LOCKED)</td><td className="text-right font-mono pr-2">{formatCurrency(data.ekuitasAkhir || 0)}</td></tr>
                </tbody>
              </table>
            </div>
          )}

        </div>

        {/* Digital Stamp Signatures */}
        <div className="border-t-2 border-black pt-8 mt-12 flex justify-between items-center">
          <div className="flex flex-col">
            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Otorisasi Resmi Keuangan</span>
            <span className="text-xs font-bold text-black mt-1 uppercase">Sistem Keuangan Bumi Residence</span>
            <span className="text-[8px] text-slate-400 font-mono mt-0.5">ID Dokumen: EOD-{report.id}-{report.reportType}</span>
          </div>
          <div className="text-right flex flex-col items-end">
            <span className="text-[8px] font-bold text-emerald-600 border border-emerald-300 rounded px-2.5 py-1 uppercase tracking-widest bg-emerald-50 mb-1">
              ✓ ARSIP RESMI TERVERIFIKASI
            </span>
            <span className="text-[8px] text-slate-350 text-slate-400 font-bold uppercase tracking-widest">BUMI RESIDENCE SECURE DOCUMENT</span>
          </div>
        </div>

      </div>

    </div>
  );
}

export default function ArchivedReportPrintPage() {
  return (
    <React.Suspense fallback={<div className="min-h-screen bg-slate-50 flex items-center justify-center font-sans font-bold text-xs text-slate-500 uppercase tracking-widest">Memuat Dokumen Arsip...</div>}>
      <ReportContent />
    </React.Suspense>
  );
}
