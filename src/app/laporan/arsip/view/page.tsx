'use client';

import React from 'react';
import { useSearchParams } from 'next/navigation';
import { Printer, ArrowLeft } from 'lucide-react';
import { formatCurrency } from '@/utils/financial-constants';

function ReportContent() {
  const searchParams = useSearchParams();
  const year = searchParams.get('year') || '2026';
  const monthName = searchParams.get('month') || 'Mei';
  const reportType = searchParams.get('type') || 'NERACA';

  return (
    <div className="min-h-screen bg-white p-8 sm:p-16 text-black selection:bg-slate-100 font-sans">
      
      {/* Floating Action Bar (Hidden during printing) */}
      <div className="max-w-3xl mx-auto mb-10 flex items-center justify-between border-b border-slate-100 pb-6 print:hidden">
        <button 
          onClick={() => window.close()} 
          className="flex items-center gap-2 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold rounded-xl transition-all"
        >
          <ArrowLeft className="w-4 h-4" /> Tutup Halaman
        </button>
        
        <button 
          onClick={() => window.print()}
          className="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold uppercase rounded-xl shadow-lg shadow-indigo-100 transition-all"
        >
          <Printer className="w-4 h-4" /> Mulai Cetak Dokumen
        </button>
      </div>

      {/* Main Print Container */}
      <div className="max-w-3xl mx-auto bg-white border border-slate-300 p-12 sm:p-16 print:border-none print:p-0">
        
        {/* Letterhead */}
        <div className="text-center border-b-2 border-black pb-8 mb-10">
          <h1 className="text-base font-bold uppercase tracking-[0.2em] mb-1">PT. PRODEV DEVELOPER PERUMAHAN</h1>
          <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-widest mb-4">Ruko Pemasaran Blok A1-A2, Kawasan Perumahan Prodev Green Hills</p>
          
          <h2 className="text-xl font-bold uppercase tracking-tight mb-1">
            {reportType === 'NERACA' && 'Laporan Neraca (Posisi Keuangan)'}
            {reportType === 'LABA_RUGI' && 'Laporan Laba Rugi'}
            {reportType === 'ARUS_KAS' && 'Laporan Arus Kas'}
            {reportType === 'MODAL' && 'Laporan Perubahan Modal (Ekuitas)'}
          </h2>
          <p className="text-xs font-bold uppercase italic text-slate-600">
            Periode Bulan {monthName} {year}
          </p>
        </div>

        {/* Content Section */}
        <div className="space-y-8 min-h-[40vh]">
          
          {reportType === 'NERACA' && (
            <div className="space-y-8">
              <div>
                <h3 className="text-xs font-bold text-black uppercase tracking-wider mb-3 border-b-2 border-black pb-1.5">A. ASET (DEBIT)</h3>
                <table className="w-full text-xs">
                  <tbody>
                    <tr className="border-b border-slate-200"><td className="py-2.5 pl-2">1.1.01 Kas Besar (Bank Mandiri)</td><td className="text-right font-mono font-bold pr-2">{formatCurrency(1375000000)}</td></tr>
                    <tr className="border-b border-slate-200"><td className="py-2.5 pl-2">1.1.02 Piutang Konsumen Unit</td><td className="text-right font-mono font-bold pr-2">{formatCurrency(335000000)}</td></tr>
                    <tr className="border-b border-slate-200"><td className="py-2.5 pl-2">1.2.01 Persediaan Lahan & Proyek Konstruksi</td><td className="text-right font-mono font-bold pr-2">{formatCurrency(850000000)}</td></tr>
                    <tr className="font-bold border-t-2 border-black bg-slate-50"><td className="py-3 pl-2 uppercase">TOTAL ASET</td><td className="text-right font-mono pr-2">{formatCurrency(2605000000)}</td></tr>
                  </tbody>
                </table>
              </div>
              
              <div>
                <h3 className="text-xs font-bold text-black uppercase tracking-wider mb-3 border-b-2 border-black pb-1.5">B. KEWAJIBAN & EKUITAS (KREDIT)</h3>
                <table className="w-full text-xs">
                  <tbody>
                    <tr className="border-b border-slate-200"><td className="py-2.5 pl-2">2.1.01 Utang Bahan Bangunan (Supplier)</td><td className="text-right font-mono font-bold pr-2">{formatCurrency(120000000)}</td></tr>
                    <tr className="border-b border-slate-200"><td className="py-2.5 pl-2">3.1.01 Modal Disetor Pemilik</td><td className="text-right font-mono font-bold pr-2">{formatCurrency(1200000000)}</td></tr>
                    <tr className="border-b border-slate-200"><td className="py-2.5 pl-2">3.1.03 Laba Bersih Tahun Berjalan</td><td className="text-right font-mono font-bold pr-2">{formatCurrency(880000000)}</td></tr>
                    <tr className="border-b border-slate-200"><td className="py-2.5 pl-2">3.1.04 Pengambilan Prive Pemilik</td><td className="text-right font-mono font-bold pr-2 text-red-600">({formatCurrency(28000000)})</td></tr>
                    <tr className="font-bold border-t-2 border-black bg-slate-50"><td className="py-3 pl-2 uppercase">TOTAL KEWAJIBAN & EKUITAS</td><td className="text-right font-mono pr-2">{formatCurrency(2605000000)}</td></tr>
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {reportType === 'LABA_RUGI' && (
            <div className="space-y-8">
              <div>
                <h3 className="text-xs font-bold text-black uppercase tracking-wider mb-3 border-b-2 border-black pb-1.5">1. PENDAPATAN OPERASIONAL</h3>
                <table className="w-full text-xs">
                  <tbody>
                    <tr className="border-b border-slate-200"><td className="py-2.5 pl-2">Pendapatan Penjualan Unit Perumahan</td><td className="text-right font-mono font-bold pr-2">{formatCurrency(450000000)}</td></tr>
                    <tr className="border-b border-slate-200"><td className="py-2.5 pl-2">Pendapatan Bunga Bank Mandiri</td><td className="text-right font-mono font-bold pr-2">{formatCurrency(15000000)}</td></tr>
                    <tr className="font-bold border-t-2 border-black bg-slate-50"><td className="py-3 pl-2 uppercase">TOTAL PENDAPATAN</td><td className="text-right font-mono pr-2">{formatCurrency(465000000)}</td></tr>
                  </tbody>
                </table>
              </div>

              <div>
                <h3 className="text-xs font-bold text-black uppercase tracking-wider mb-3 border-b-2 border-black pb-1.5">2. BEBAN OPERASIONAL</h3>
                <table className="w-full text-xs">
                  <tbody>
                    <tr className="border-b border-slate-200"><td className="py-2.5 pl-2">Beban Pokok Konstruksi & Borongan</td><td className="text-right font-mono font-bold pr-2">{formatCurrency(210000000)}</td></tr>
                    <tr className="border-b border-slate-200"><td className="py-2.5 pl-2">Beban Gaji Staf Kantor & Proyek</td><td className="text-right font-mono font-bold pr-2">{formatCurrency(65000000)}</td></tr>
                    <tr className="border-b border-slate-200"><td className="py-2.5 pl-2">Beban Pemasaran & Media Sosial</td><td className="text-right font-mono font-bold pr-2">{formatCurrency(15000000)}</td></tr>
                    <tr className="border-b border-slate-200"><td className="py-2.5 pl-2">Beban Listrik, Wifi, Air, & ATK</td><td className="text-right font-mono font-bold pr-2">{formatCurrency(25000000)}</td></tr>
                    <tr className="font-bold border-t-2 border-black bg-slate-50"><td className="py-3 pl-2 uppercase">TOTAL BEBAN OPERASIONAL</td><td className="text-right font-mono pr-2 text-red-600">{formatCurrency(315000000)}</td></tr>
                  </tbody>
                </table>
              </div>

              <div className="border-2 border-black p-5 flex justify-between items-center bg-slate-50">
                <span className="text-xs font-bold uppercase">LABA BERSIH PERIODE TERKUNCI</span>
                <span className="font-mono text-sm font-bold">{formatCurrency(150000000)}</span>
              </div>
            </div>
          )}

          {reportType === 'ARUS_KAS' && (
            <div className="space-y-6">
              <table className="w-full text-xs">
                <tbody>
                  <tr className="border-b-2 border-black font-bold bg-slate-100"><td className="py-2.5 pl-2" colSpan={2}>A. ARUS KAS DARI AKTIVITAS OPERASI</td></tr>
                  <tr className="border-b border-slate-200"><td className="py-2.5 pl-6">Penerimaan Uang Muka (DP) & Penjualan Unit</td><td className="text-right font-mono pr-2">{formatCurrency(450000000)}</td></tr>
                  <tr className="border-b border-slate-200"><td className="py-2.5 pl-6">Penerimaan Angsuran Konsumen</td><td className="text-right font-mono pr-2">{formatCurrency(180000000)}</td></tr>
                  <tr className="border-b border-slate-200"><td className="py-2.5 pl-6">Pembayaran kepada Kontraktor & Pemasok Bahan</td><td className="text-right font-mono pr-2 text-red-600">({formatCurrency(210000000)})</td></tr>
                  <tr className="border-b border-slate-200"><td className="py-2.5 pl-6">Pembayaran Beban Gaji & Operasional Kantor</td><td className="text-right font-mono pr-2 text-red-600">({formatCurrency(65000000)})</td></tr>
                  
                  <tr className="border-b-2 border-black font-bold bg-slate-100"><td className="py-2.5 pl-2" colSpan={2}>B. ARUS KAS DARI AKTIVITAS INVESTASI</td></tr>
                  <tr className="border-b border-slate-200"><td className="py-2.5 pl-6">Pembelian Lahan Perluasan Tahap II</td><td className="text-right font-mono pr-2 text-red-600">({formatCurrency(350000000)})</td></tr>
                  <tr className="border-b border-slate-200"><td className="py-2.5 pl-6">Pembelian Inventaris Alat Kantor</td><td className="text-right font-mono pr-2 text-red-600">({formatCurrency(25000000)})</td></tr>
                  
                  <tr className="border-b-2 border-black font-bold bg-slate-100"><td className="py-2.5 pl-2" colSpan={2}>C. ARUS KAS DARI AKTIVITAS PENDANAAN</td></tr>
                  <tr className="border-b border-slate-200"><td className="py-2.5 pl-6">Penerimaan Setoran Modal Investor</td><td className="text-right font-mono pr-2">{formatCurrency(500000000)}</td></tr>
                  
                  <tr className="font-bold border-t-2 border-black bg-black text-white"><td className="py-3 pl-2 uppercase">SALDO KAS AKHIR PERIODE (NET)</td><td className="text-right font-mono pr-2">{formatCurrency(480000000)}</td></tr>
                </tbody>
              </table>
            </div>
          )}

          {reportType === 'MODAL' && (
            <div className="space-y-6">
              <table className="w-full text-xs">
                <tbody>
                  <tr className="border-b border-slate-200"><td className="py-2.5 pl-2 font-bold">Modal Awal Pemilik (Per 01 Januari)</td><td className="text-right font-mono font-bold pr-2">{formatCurrency(1200000000)}</td></tr>
                  <tr className="border-b border-slate-200"><td className="py-2.5 pl-2">Tambahan Setoran Modal Pemilik</td><td className="text-right font-mono pr-2">{formatCurrency(300000000)}</td></tr>
                  <tr className="border-b border-slate-200"><td className="py-2.5 pl-2">Laba Bersih Setelah Pajak (Net Income)</td><td className="text-right font-mono pr-2">{formatCurrency(185000000)}</td></tr>
                  <tr className="border-b border-slate-200"><td className="py-2.5 pl-2">Pembagian Dividen / Prive Pemilik</td><td className="text-right font-mono pr-2 text-red-600">({formatCurrency(50000000)})</td></tr>
                  <tr className="font-bold border-t-2 border-black bg-black text-white"><td className="py-3 pl-2 uppercase">MODAL AKHIR PEMILIK (Per 31 Desember)</td><td className="text-right font-mono pr-2">{formatCurrency(1635000000)}</td></tr>
                </tbody>
              </table>
            </div>
          )}

        </div>

        {/* Digital Stamp Signatures */}
        <div className="border-t-2 border-black pt-8 mt-12 flex justify-between items-center">
          <div className="flex flex-col">
            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Otorisasi Resmi Keuangan</span>
            <span className="text-xs font-bold text-black mt-1 uppercase">Sistem Keuangan Prodev</span>
          </div>
          <div className="text-right flex flex-col items-end">
            <span className="text-[8px] font-bold text-emerald-600 border border-emerald-300 rounded px-2.5 py-1 uppercase tracking-widest bg-emerald-50 mb-1">
              ✓ ARSIP RESMI TERVERIFIKASI
            </span>
            <span className="text-[8px] text-slate-300 font-bold uppercase tracking-widest">PRODEV SECURE DOCUMENT</span>
          </div>
        </div>

      </div>

    </div>
  );
}

export default function ArchivedReportPrintPage() {
  return (
    <React.Suspense fallback={<div className="min-h-screen bg-white flex items-center justify-center font-sans font-bold text-xs text-slate-500 uppercase tracking-widest">Memuat Dokumen Arsip...</div>}>
      <ReportContent />
    </React.Suspense>
  );
}
