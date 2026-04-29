import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function IncomeStatementPage() {
  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <Link href="/dashboard" className="hover:bg-gray-100 p-2 rounded">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <h1 className="text-3xl font-bold text-black">Laporan Laba Rugi (Income Statement)</h1>
      </div>

      {/* Content */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="max-w-2xl">
          {/* PENDAPATAN */}
          <div className="mb-6">
            <h2 className="text-lg font-bold mb-3 border-b pb-2 text-black">PENDAPATAN</h2>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-black">Pendapatan Penjualan</span>
                <span className="font-semibold text-black">Rp 0</span>
              </div>
              <div className="flex justify-between">
                <span className="text-black">Pendapatan Lainnya</span>
                <span className="font-semibold text-black">Rp 0</span>
              </div>
              <div className="border-t pt-2 mt-2 flex justify-between font-bold">
                <span className="text-black">Total Pendapatan</span>
                <span className="text-black">Rp 0</span>
              </div>
            </div>
          </div>

          {/* BIAYA OPERASIONAL */}
          <div className="mb-6">
            <h2 className="text-lg font-bold mb-3 border-b pb-2 text-black">BIAYA OPERASIONAL</h2>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="ml-4 text-black">Gaji & Upah</span>
                <span className="font-semibold text-black">Rp 0</span>
              </div>
              <div className="flex justify-between">
                <span className="ml-4 text-black">Biaya Sewa</span>
                <span className="font-semibold text-black">Rp 0</span>
              </div>
              <div className="flex justify-between">
                <span className="ml-4 text-black">Biaya Utilitas</span>
                <span className="font-semibold text-black">Rp 0</span>
              </div>
              <div className="flex justify-between">
                <span className="ml-4 text-black">Biaya Marketing</span>
                <span className="font-semibold text-black">Rp 0</span>
              </div>
              <div className="flex justify-between">
                <span className="ml-4 text-black">Biaya Lainnya</span>
                <span className="font-semibold text-black">Rp 0</span>
              </div>
              <div className="border-t pt-2 mt-2 flex justify-between font-bold">
                <span className="text-black">Total Biaya Operasional</span>
                <span className="text-black">Rp 0</span>
              </div>
            </div>
          </div>

          {/* HASIL OPERASI */}
          <div className="mb-6">
            <div className="border-t-2 pt-2 flex justify-between font-bold text-lg">
              <span className="text-black">Laba/(Rugi) Operasi</span>
              <span className="text-black">Rp 0</span>
            </div>
          </div>

          {/* BIAYA NON-OPERASIONAL */}
          <div className="mb-6">
            <h2 className="text-lg font-bold mb-3 border-b pb-2 text-black">BIAYA NON-OPERASIONAL</h2>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="ml-4 text-black">Bunga</span>
                <span className="font-semibold text-black">Rp 0</span>
              </div>
              <div className="flex justify-between">
                <span className="ml-4 text-black">Pajak</span>
                <span className="font-semibold text-black">Rp 0</span>
              </div>
              <div className="border-t pt-2 mt-2 flex justify-between font-bold">
                <span className="text-black">Total Biaya Non-Operasional</span>
                <span className="text-black">Rp 0</span>
              </div>
            </div>
          </div>

          {/* LABA BERSIH */}
          <div className="border-t-2 pt-3 flex justify-between font-bold text-lg">
            <span className="text-black">Laba/(Rugi) Bersih</span>
            <span className="text-black">Rp 0</span>
          </div>
        </div>

        {/* Periode Laporan */}
        <div className="mt-8 pt-4 border-t text-sm text-black">
          <p className="text-black">Periode: <span className="font-semibold">1 Januari - 31 Desember 2026</span></p>
        </div>
      </div>
    </div>
  );
}
