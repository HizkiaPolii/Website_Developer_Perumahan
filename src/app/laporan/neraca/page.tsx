'use client';

import { useAccountingStore } from "@/hooks/useAccountingStore";
import { formatIDR, ReportAccountNode } from "@/lib/accounting";
import { PageHeader, Card, Btn } from "@/components/finance-ui";
import { Scale, AlertCircle, Printer, Download } from "lucide-react";
import { useToast } from "@/contexts/ToastContext";
import { downloadCSV, exportBalanceSheetToCSV } from "@/utils/export-helper";

export default function NeracaPage() {
  const { reports, ready } = useAccountingStore();
  const { addToast } = useToast();

  if (!ready) return null;

  const { balanceSheet: bs, equityChange: ec } = reports;

  const handleExportCSV = () => {
    try {
      const csvContent = exportBalanceSheetToCSV(bs, ec, "Periode Berjalan 2026");
      downloadCSV("laporan_neraca_2026.csv", csvContent);
      addToast("Laporan Neraca berhasil diekspor ke CSV", "success");
    } catch (err: any) {
      addToast("Gagal mengekspor laporan: " + err.message, "error");
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto animate-fade-in print:max-w-full print:p-0 print:space-y-0">
      <PageHeader
        title="Laporan Neraca (Balance Sheet)"
        description="Aset = Kewajiban + Ekuitas. Saldo kas dari arus kas, ekuitas dari perubahan modal."
        icon={Scale}
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

      {/* Balance Indicator */}
      <div className={`p-4 rounded-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border shadow-sm no-print print:hidden ${bs.isBalanced ? "bg-emerald-50 border-emerald-200" : "bg-rose-50 border-rose-200"}`}>
        <div className="flex items-center gap-3">
          <AlertCircle className={`w-5 h-5 shrink-0 ${bs.isBalanced ? "text-emerald-600" : "text-rose-600"}`} />
          <span className={`font-bold ${bs.isBalanced ? "text-emerald-800" : "text-rose-800"}`}>
            {bs.isBalanced ? "Status Neraca: SEIMBANG ✓" : "Status Neraca: TIDAK SEIMBANG ✗"}
          </span>
        </div>
        {!bs.isBalanced && (
          <span className="text-rose-600 font-black text-sm bg-rose-100 px-3 py-1 rounded-lg tabular-nums">
            Selisih: {formatIDR(bs.selisih)}
          </span>
        )}
      </div>

      <Card className="p-6 sm:p-10 print:border-none print:shadow-none print:p-0">
        <div className="text-center mb-10 pb-6 border-b border-slate-100 print:mb-6 print:pb-4">
          <h2 className="text-xl font-black text-slate-800 uppercase tracking-[0.15em] print:text-black">Laporan Neraca</h2>
          <p className="text-slate-500 text-sm mt-1 print:text-slate-700">Periode Berjalan</p>
        </div>

        {/* 1. ASET */}
        <div className="mb-10">
          <h3 className="font-bold text-slate-800 uppercase tracking-widest text-sm border-b-2 border-slate-100 pb-2 mb-4">1.0.00 - ASET</h3>
          <div className="space-y-1 py-2 mb-4">
            <AccountTree nodes={bs.aset} />
          </div>
          <TotalRow label="TOTAL ASET" value={bs.totalAset} color="text-emerald-600" />
        </div>

        {/* 2. KEWAJIBAN */}
        <div className="mb-10">
          <h3 className="font-bold text-slate-800 uppercase tracking-widest text-sm border-b-2 border-slate-100 pb-2 mb-4">2.0.00 - KEWAJIBAN</h3>
          <div className="space-y-1 py-2 mb-4">
            <AccountTree nodes={bs.kewajiban} />
          </div>
          <TotalRow label="TOTAL KEWAJIBAN" value={bs.totalKewajiban} color="text-slate-700" />
        </div>

        {/* 3. EKUITAS */}
        <div className="mb-10">
          <h3 className="font-bold text-slate-800 uppercase tracking-widest text-sm border-b-2 border-slate-100 pb-2 mb-4">3.0.00 - EKUITAS</h3>
          <div className="space-y-1.5 py-2 mb-4 text-sm">
            <Row label="Modal Awal / Tambahan" value={ec.modalAwal} />
            <Row label="Laba Bersih Berjalan" value={ec.labaBersih} color={ec.labaBersih >= 0 ? "text-emerald-600" : "text-rose-600"} />
            {ec.prive > 0 && <Row label="Penarikan Prive" value={-ec.prive} color="text-rose-600" />}
          </div>
          <TotalRow label="TOTAL EKUITAS" value={bs.ekuitasAkhir} color="text-indigo-600" />
        </div>

        {/* 4. TOTAL KEWAJIBAN DAN MODAL */}
        <div className="pt-6 mt-6 border-t-2 border-slate-800">
          <TotalRow label="TOTAL KEWAJIBAN DAN MODAL" value={bs.totalPasiva} color="text-indigo-650 text-indigo-600" />
        </div>
      </Card>
    </div>
  );
}

// ── Sub-components ──────────────────────────────────────────────────
function AccountTree({ nodes }: { nodes: ReportAccountNode[] }) {
  const render = (items: ReportAccountNode[], level: number) =>
    items.map(n => (
      <div key={n.id}>
        <div
          className={`flex justify-between items-center py-1.5 ${level === 0 ? "font-semibold text-slate-800" : "text-slate-600 text-sm"}`}
          style={{ paddingLeft: `${level * 1}rem` }}
        >
          <span className="flex items-center gap-2">
            <span className="font-mono text-xs text-slate-400 w-14 shrink-0">{n.code}</span>
            <span className="truncate">{n.name}</span>
          </span>
          <span className="tabular-nums shrink-0 ml-4">{formatIDR(n.balance)}</span>
        </div>
        {n.children.length > 0 && render(n.children, level + 1)}
      </div>
    ));
  return <div className="space-y-0.5">{render(nodes, 0)}</div>;
}

function Row({ label, value, color = "text-slate-700" }: { label: string; value: number; color?: string }) {
  return (
    <div className={`flex justify-between items-center ${color}`}>
      <span>{label}</span>
      <span className="tabular-nums font-medium">{formatIDR(value)}</span>
    </div>
  );
}

function SubTotal({ label, value }: { label: string; value: number }) {
  return (
    <div className="flex justify-between items-center text-sm font-semibold text-slate-600 pt-3 mt-3 border-t border-slate-100">
      <span>{label}</span>
      <span className="tabular-nums">{formatIDR(value)}</span>
    </div>
  );
}

function TotalRow({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div className="px-5 py-4 border-t-2 border-slate-800 bg-slate-50 flex justify-between items-center">
      <span className="font-black text-slate-800 text-sm">{label}</span>
      <span className={`text-xl font-black tabular-nums ${color}`}>{formatIDR(value)}</span>
    </div>
  );
}
