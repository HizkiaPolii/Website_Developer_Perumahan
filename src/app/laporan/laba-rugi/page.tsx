'use client';

import { useAccountingStore } from "@/hooks/useAccountingStore";
import { formatIDR, ReportAccountNode } from "@/lib/accounting";
import { PageHeader, Card, Btn } from "@/components/finance-ui";
import { TrendingUp, Printer, Download } from "lucide-react";
import { useToast } from "@/contexts/ToastContext";
import { downloadCSV, exportIncomeStatementToCSV } from "@/utils/export-helper";

export default function LabaRugiPage() {
  const { reports, ready } = useAccountingStore();
  const { addToast } = useToast();

  if (!ready) return null;

  const { incomeStatement: is } = reports;

  const handleExportCSV = () => {
    try {
      const csvContent = exportIncomeStatementToCSV(is, "Periode Berjalan 2026");
      downloadCSV("laporan_laba_rugi_2026.csv", csvContent);
      addToast("Laporan Laba Rugi berhasil diekspor ke CSV", "success");
    } catch (err: any) {
      addToast("Gagal mengekspor laporan: " + err.message, "error");
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto animate-fade-in print:max-w-full print:p-0 print:space-y-0">
      <PageHeader
        title="Laporan Laba Rugi"
        description="Akumulasi pendapatan dan beban. Akun baru bertipe pendapatan/beban otomatis masuk laporan."
        icon={TrendingUp}
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

      <Card className="p-6 sm:p-10 print:border-none print:shadow-none print:p-0">
        <div className="text-center mb-10 pb-6 border-b border-slate-100 print:mb-6 print:pb-4">
          <h2 className="text-xl font-black text-slate-800 uppercase tracking-[0.15em] print:text-black">Laporan Laba Rugi</h2>
          <p className="text-slate-500 text-sm mt-1 print:text-slate-700">Periode Berjalan</p>
        </div>

        {/* Pendapatan */}
        <Section title="Pendapatan" nodes={is.pendapatan} total={is.totalPendapatan} totalColor="text-emerald-600 print:text-black" />

        {/* Beban */}
        <Section title="Beban Operasional" nodes={is.beban} total={is.totalBeban} totalColor="text-rose-600 print:text-black" />

        {/* Laba Bersih */}
        <div className="pt-8 mt-8 border-t-4 border-slate-800 print:pt-4 print:mt-4">
          <div className="px-5 py-4 border-t-2 border-slate-800 bg-slate-50 flex justify-between items-center">
            <div className="flex flex-col">
              <span className="font-black text-slate-800 text-sm">LABA BERSIH (RUGI)</span>
              <span className="text-[10px] text-slate-500 font-semibold mt-0.5">Total Pendapatan − Total Beban</span>
            </div>
            <span className={`text-xl font-black tabular-nums ${is.labaBersih >= 0 ? "text-emerald-600" : "text-rose-600"}`}>
              {formatIDR(is.labaBersih)}
            </span>
          </div>
        </div>
      </Card>
    </div>
  );
}

function Section({ title, nodes, total, totalColor }: { title: string; nodes: ReportAccountNode[]; total: number; totalColor: string }) {
  const renderNodes = (items: ReportAccountNode[], level: number) =>
    items.map(n => (
      <div key={n.id}>
        <div
          className={`flex justify-between items-center py-1.5 ${level === 0 ? "font-semibold text-slate-800" : "text-slate-600 text-sm"}`}
          style={{ paddingLeft: `${level * 1.5}rem` }}
        >
          <span className="flex items-center gap-2">
            <span className="font-mono text-xs text-slate-400 w-14 shrink-0">{n.code}</span>
            {n.name}
          </span>
          <span className="tabular-nums">{formatIDR(n.balance)}</span>
        </div>
        {n.children.length > 0 && renderNodes(n.children, level + 1)}
      </div>
    ));

  return (
    <div className="mb-8">
      <h3 className="font-bold text-slate-800 uppercase tracking-widest text-sm border-b-2 border-slate-100 pb-2 mb-4">{title}</h3>
      <div className="space-y-1">{renderNodes(nodes, 0)}</div>
      <div className={`flex justify-between items-center pt-3 mt-3 border-t border-slate-200 font-black ${totalColor}`}>
        <span>TOTAL {title.toUpperCase()}</span>
        <span>{formatIDR(total)}</span>
      </div>
    </div>
  );
}
