"use client";

import { useAccountingStore } from "@/hooks/useAccountingStore";
import { formatIDR } from "@/lib/accounting";
import { PageHeader, Card, Btn } from "@/components/finance-ui";
import { CircleDollarSign, TrendingUp, TrendingDown, Printer, Download } from "lucide-react";
import { useToast } from "@/contexts/ToastContext";
import { downloadCSV, exportEquityChangeToCSV } from "@/utils/export-helper";

export default function PerubahanModalPage() {
  const { accounts, reports, ready } = useAccountingStore();
  const { addToast } = useToast();

  if (!ready) return null;

  const { equityChange: ec, balances } = reports;

  // Individual modal & prive accounts for detail rows — akun DAUN saja
  // (bukan cuma akun akar) supaya akun Prive yang dibuat sebagai anak dari
  // Modal (lewat Master Akun) tetap muncul di rincian, konsisten dengan
  // totalnya. Pakai daun (bukan "semua level") supaya tidak dobel-hitung:
  // saldo akun induk di `balances` sudah termasuk rollup dari anak-anaknya.
  const hasChildren = (id: string) => accounts.some(a => a.parentId === id);
  const modalAccounts = accounts.filter(a => a.type === 'modal' && !a.isDrawing && !hasChildren(a.id));
  const priveAccounts = accounts.filter(a => a.type === 'modal' && a.isDrawing && !hasChildren(a.id));

  const handleExportCSV = () => {
    try {
      const csvContent = exportEquityChangeToCSV(ec, modalAccounts, priveAccounts, balances, "Periode Berjalan 2026");
      downloadCSV("laporan_perubahan_modal_2026.csv", csvContent);
      addToast("Laporan Perubahan Modal berhasil diekspor ke CSV", "success");
    } catch (err: any) {
      addToast("Gagal mengekspor laporan: " + err.message, "error");
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto animate-fade-in print:max-w-full print:p-0 print:space-y-0">
      <PageHeader
        title="Laporan Perubahan Modal"
        description="Perubahan ekuitas: Modal Awal + Laba Bersih − Prive = Ekuitas Akhir."
        icon={CircleDollarSign}
        action={
          <div className="flex gap-2 w-full sm:w-auto no-print">
            <Btn onClick={() => window.print()} variant="secondary">
              <Printer className="w-4 h-4" /> Cetak
            </Btn>
            <Btn onClick={handleExportCSV} variant="primary">
              <Download className="w-4 h-4" /> Ekspor CSV
            </Btn>
          </div>
        }
      />

      <Card className="p-6 sm:p-10 relative overflow-hidden print:border-none print:shadow-none print:p-0">
        <div className="absolute -top-20 -right-20 w-56 h-56 bg-indigo-50 rounded-full blur-3xl opacity-60 pointer-events-none print:hidden" />

        <div className="text-center mb-10 pb-6 border-b border-slate-100 relative z-10 print:mb-6 print:pb-4">
          <h2 className="text-xl font-black text-slate-800 uppercase tracking-[0.15em] print:text-black">Laporan Perubahan Modal</h2>
          <p className="text-slate-500 text-sm mt-1 print:text-slate-700">Periode Berjalan</p>
        </div>

        <div className="max-w-2xl mx-auto space-y-6 relative z-10">
          
          {/* Modal Awal */}
          <div className="p-5 bg-slate-50 rounded-xl border border-slate-100 space-y-2">
            <div className="flex justify-between items-center">
              <span className="font-semibold text-slate-700">Modal Disetor (Awal / Tambahan)</span>
              <span className="font-bold text-slate-800 text-lg tabular-nums">{formatIDR(ec.modalAwal)}</span>
            </div>
            {modalAccounts.map(acc => (
              <div key={acc.id} className="flex justify-between items-center text-sm text-slate-500 pl-4">
                <span className="flex items-center gap-2">
                  <span className="font-mono text-xs text-slate-400">{acc.code}</span>
                  {acc.name}
                </span>
                <span className="tabular-nums">{formatIDR(balances[acc.id] || 0)}</span>
              </div>
            ))}
          </div>

          {/* Adjustments */}
          <div className="pl-6 space-y-4 border-l-2 border-slate-200 ml-3">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2 text-emerald-600">
                <TrendingUp className="w-4 h-4 shrink-0" />
                <span className="font-medium">Laba Bersih Periode Berjalan</span>
              </div>
              <span className={`font-semibold tabular-nums ${ec.labaBersih >= 0 ? "text-emerald-600" : "text-rose-600"}`}>
                {ec.labaBersih >= 0 ? "+" : "−"} {formatIDR(Math.abs(ec.labaBersih))}
              </span>
            </div>

            {ec.prive > 0 && (
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2 text-rose-500">
                    <TrendingDown className="w-4 h-4 shrink-0" />
                    <span className="font-medium">Penarikan Prive</span>
                  </div>
                  <span className="font-semibold text-rose-500 tabular-nums">
                    − {formatIDR(ec.prive)}
                  </span>
                </div>
                {priveAccounts.map(acc => (
                  <div key={acc.id} className="flex justify-between items-center text-sm text-slate-500 pl-6">
                    <span className="flex items-center gap-2">
                      <span className="font-mono text-xs text-slate-400">{acc.code}</span>
                      {acc.name}
                    </span>
                    <span className="tabular-nums">{formatIDR(balances[acc.id] || 0)}</span>
                  </div>
                ))}
              </div>
            )}

            <div className="flex justify-between items-center pt-3 border-t border-slate-100 text-sm">
              <span className="text-slate-500 italic">Penambahan / (Pengurangan) Ekuitas Bersih</span>
              <span className="font-semibold text-slate-600 tabular-nums">{formatIDR(ec.labaBersih - ec.prive)}</span>
            </div>
          </div>

          {/* Ekuitas Akhir */}
          <div className="mt-8 border-t-2 border-slate-800">
            <div className="px-5 py-4 bg-slate-50 flex justify-between items-center">
              <div className="flex flex-col">
                <span className="font-black text-slate-800 text-sm">EKUITAS AKHIR (MODAL AKHIR)</span>
                <span className="text-[10px] text-slate-500 font-semibold mt-0.5">Modal Awal + Laba − Prive</span>
              </div>
              <span className="text-xl font-black tabular-nums text-indigo-600">{formatIDR(ec.ekuitasAkhir)}</span>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}
