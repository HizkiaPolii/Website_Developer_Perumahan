"use client";

import { useAccountingStore } from "@/hooks/useAccountingStore";
import { formatIDR, CashFlowGroup } from "@/lib/accounting";
import { PageHeader, Card, Btn } from "@/components/finance-ui";
import { Wallet, Printer, Download } from "lucide-react";
import { useToast } from "@/contexts/ToastContext";
import { downloadCSV, exportCashFlowToCSV } from "@/utils/export-helper";

export default function ArusKasPage() {
  const { reports, ready } = useAccountingStore();
  const { addToast } = useToast();

  if (!ready) return null;

  const { cashFlowReport: cf } = reports;

  const handleExportCSV = () => {
    try {
      const csvContent = exportCashFlowToCSV(cf, "Periode Berjalan 2026");
      downloadCSV("laporan_arus_kas_2026.csv", csvContent);
      addToast("Laporan Arus Kas berhasil diekspor ke CSV", "success");
    } catch (err: any) {
      addToast("Gagal mengekspor laporan: " + err.message, "error");
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto animate-fade-in print:max-w-full print:p-0 print:space-y-0">
      <PageHeader
        title="Laporan Arus Kas"
        description="Klasifikasi arus kas: Operasional, Investasi, dan Pendanaan. Otomatis dari transaksi."
        icon={Wallet}
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
          <h2 className="text-xl font-black text-slate-800 uppercase tracking-[0.15em] print:text-black">Laporan Arus Kas</h2>
          <p className="text-slate-500 text-sm mt-1 print:text-slate-700">Periode Berjalan</p>
        </div>

        {/* ─── A. ARUS KAS DARI OPERASIONAL ─────────────────────── */}
        <SectionHeader label="A" title="ARUS KAS DARI OPERASIONAL" />
        {cf.operasional.length === 0 && <EmptyNote />}
        {cf.operasional.map((group, i) => (
          <FlowGroup key={i} group={group} />
        ))}
        <SectionTotal label="TOTAL ARUS KAS DARI OPERASIONAL" value={cf.totalOperasional} />

        <div className="my-8 border-t border-slate-200" />

        {/* ─── B. ARUS KAS DARI INVESTASI ───────────────────────── */}
        <SectionHeader label="B" title="ARUS KAS DARI INVESTASI" />
        {cf.investasi.length === 0 && <EmptyNote />}
        {cf.investasi.map((group, i) => (
          <FlowGroup key={i} group={group} />
        ))}
        <SectionTotal label="TOTAL ARUS KAS DARI INVESTASI" value={cf.totalInvestasi} />

        <div className="my-8 border-t border-slate-200" />

        {/* ─── C. ARUS KAS DARI PENDANAAN ───────────────────────── */}
        <SectionHeader label="C" title="ARUS KAS DARI PENDANAAN" />
        {cf.pendanaan.length === 0 && <EmptyNote />}
        {cf.pendanaan.map((group, i) => (
          <FlowGroup key={i} group={group} />
        ))}
        <SectionTotal label="TOTAL ARUS KAS DARI PENDANAAN" value={cf.totalPendanaan} />

        {/* ─── RINGKASAN ────────────────────────────────────────── */}
        <div className="mt-10 pt-8 border-t-4 border-slate-800 space-y-4">
          <SummaryRow label="KAS PADA SAAT AWAL PERIODE" value={cf.kasAwalPeriode} />
          <SummaryRow
            label="KENAIKAN / (PENURUNAN) KAS BERSIH"
            value={cf.perubahanKasBersih}
            highlight
          />

          <div className="bg-gradient-to-r from-indigo-900 to-slate-900 rounded-2xl p-6 flex flex-col sm:flex-row justify-between items-center gap-4 text-white shadow-xl shadow-slate-900/20 mt-6 print:bg-slate-100 print:text-slate-950 print:border print:border-slate-300 print:shadow-none">
            <div>
              <h4 className="text-sm font-semibold text-indigo-300 tracking-wider uppercase print:text-slate-600">KAS PADA SAAT AKHIR PERIODE</h4>
              <p className="text-xs text-slate-400 mt-0.5 print:text-slate-500">Kas Awal + Perubahan Bersih</p>
            </div>
            <div className="text-3xl font-black tabular-nums print:text-slate-950">{formatIDR(cf.kasAkhirPeriode)}</div>
          </div>
        </div>
      </Card>
    </div>
  );
}

// ── Sub-components ──────────────────────────────────────────────────

function SectionHeader({ label, title }: { label: string; title: string }) {
  return (
    <div className="flex items-center gap-3 mb-4">
      <span className="w-8 h-8 bg-slate-800 text-white rounded-lg flex items-center justify-center text-sm font-black shrink-0">
        {label}
      </span>
      <h3 className="font-black text-slate-800 uppercase tracking-wider text-sm">{title}</h3>
    </div>
  );
}

function FlowGroup({ group }: { group: CashFlowGroup }) {
  return (
    <div className="mb-4 ml-11">
      <h4 className="font-bold text-slate-700 text-sm mb-2 border-b border-slate-100 pb-1">{group.label}</h4>
      <div className="space-y-1">
        {group.items.map((item, i) => (
          <div key={i} className="flex justify-between items-center text-sm py-1 pl-2">
            <span className="flex items-center gap-2 text-slate-600">
              <span className="font-mono text-xs text-slate-400 w-16 shrink-0">{item.code}</span>
              <span>{item.name}</span>
            </span>
            <span className={`tabular-nums font-medium shrink-0 ml-4 ${item.amount < 0 ? "text-rose-600" : "text-slate-800"}`}>
              {item.amount < 0 ? `(${formatIDR(Math.abs(item.amount))})` : formatIDR(item.amount)}
            </span>
          </div>
        ))}
      </div>
      <div className="flex justify-between items-center text-sm font-bold text-slate-700 pt-2 mt-2 border-t border-slate-100 pl-2">
        <span>Total {group.label}</span>
        <span className={`tabular-nums ${group.total < 0 ? "text-rose-600" : "text-slate-800"}`}>
          {group.total < 0 ? `(${formatIDR(Math.abs(group.total))})` : formatIDR(group.total)}
        </span>
      </div>
    </div>
  );
}

function SectionTotal({ label, value }: { label: string; value: number }) {
  return (
    <div className="flex justify-between items-center py-3 px-4 bg-slate-50 rounded-xl border border-slate-100 font-black text-sm mt-4">
      <span className="text-slate-800">{label}</span>
      <span className={`tabular-nums ${value < 0 ? "text-rose-600" : "text-emerald-700"}`}>
        {value < 0 ? `(${formatIDR(Math.abs(value))})` : formatIDR(value)}
      </span>
    </div>
  );
}

function SummaryRow({ label, value, highlight = false }: { label: string; value: number; highlight?: boolean }) {
  return (
    <div className={`flex justify-between items-center py-3 px-4 rounded-xl ${highlight ? "bg-slate-100 border border-slate-200" : ""}`}>
      <span className="font-bold text-slate-700 text-sm">{label}</span>
      <span className={`font-black tabular-nums text-sm ${value < 0 ? "text-rose-600" : "text-slate-800"}`}>
        {value < 0 ? `(${formatIDR(Math.abs(value))})` : formatIDR(value)}
      </span>
    </div>
  );
}

function EmptyNote() {
  return <p className="text-sm text-slate-400 italic ml-11 mb-4">Tidak ada arus kas pada kategori ini.</p>;
}
