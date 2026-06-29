"use client";

import { useAccountingStore } from "@/hooks/useAccountingStore";
import { formatIDR, CashFlowGroup } from "@/lib/accounting";
import { PageHeader, Card, Btn } from "@/components/finance-ui";
import { Wallet, Printer, Download, TrendingUp, TrendingDown, ArrowUpRight, ArrowDownRight, Minus, Building2 } from "lucide-react";
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

  // Calculate summary stats
  const totalMasuk = [
    ...cf.operasional.flatMap(g => g.items.filter(i => i.amount > 0)),
    ...cf.investasi.flatMap(g => g.items.filter(i => i.amount > 0)),
    ...cf.pendanaan.flatMap(g => g.items.filter(i => i.amount > 0)),
  ].reduce((s, i) => s + i.amount, 0);

  const totalKeluar = Math.abs([
    ...cf.operasional.flatMap(g => g.items.filter(i => i.amount < 0)),
    ...cf.investasi.flatMap(g => g.items.filter(i => i.amount < 0)),
    ...cf.pendanaan.flatMap(g => g.items.filter(i => i.amount < 0)),
  ].reduce((s, i) => s + i.amount, 0));

  return (
    <div className="space-y-6 max-w-4xl mx-auto animate-fade-in print:max-w-full print:p-0 print:space-y-0">
      <PageHeader
        title="Laporan Arus Kas (Cash Flow)"
        description="Klasifikasi arus kas: Operasional, Investasi, dan Pendanaan — otomatis dari transaksi."
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

      {/* ── Summary Cards ──────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 no-print print:hidden">
        <Card className="p-5 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-50 rounded-full -translate-y-8 translate-x-8 opacity-60" />
          <div className="relative">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-9 h-9 bg-emerald-100 rounded-xl flex items-center justify-center">
                <ArrowUpRight className="w-5 h-5 text-emerald-600" />
              </div>
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Kas Masuk</span>
            </div>
            <p className="text-xl font-black text-emerald-600 tabular-nums">{formatIDR(totalMasuk)}</p>
          </div>
        </Card>

        <Card className="p-5 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-rose-50 rounded-full -translate-y-8 translate-x-8 opacity-60" />
          <div className="relative">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-9 h-9 bg-rose-100 rounded-xl flex items-center justify-center">
                <ArrowDownRight className="w-5 h-5 text-rose-600" />
              </div>
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Kas Keluar</span>
            </div>
            <p className="text-xl font-black text-rose-600 tabular-nums">{formatIDR(totalKeluar)}</p>
          </div>
        </Card>

        <Card className="p-5 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-indigo-50 rounded-full -translate-y-8 translate-x-8 opacity-60" />
          <div className="relative">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-9 h-9 bg-indigo-100 rounded-xl flex items-center justify-center">
                <Building2 className="w-5 h-5 text-indigo-600" />
              </div>
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Kas Akhir</span>
            </div>
            <p className="text-xl font-black text-indigo-700 tabular-nums">{formatIDR(cf.kasAkhirPeriode)}</p>
          </div>
        </Card>
      </div>

      {/* ── Main Report Card ───────────────────────────────── */}
      <Card className="overflow-hidden print:border-none print:shadow-none print:p-0">

        {/* Print Header */}
        <div className="text-center py-6 px-6 border-b border-slate-100 print:py-4 print:border-b-2 print:border-slate-900">
          <h2 className="text-xl font-black text-slate-800 uppercase tracking-[0.15em] print:text-black">Laporan Arus Kas</h2>
          <p className="text-slate-500 text-sm mt-1 print:text-slate-700">Periode Berjalan 2026</p>
        </div>

        <div className="p-6 sm:p-8 space-y-8 print:p-4 print:space-y-6">

          {/* ─── A. ARUS KAS DARI OPERASIONAL ───────── */}
          <CashFlowSection
            label="A"
            title="Arus Kas dari Aktivitas Operasional"
            groups={cf.operasional}
            total={cf.totalOperasional}
            colorClass="from-emerald-500 to-teal-600"
            bgClass="bg-emerald-50"
            textClass="text-emerald-700"
          />

          <div className="border-t border-dashed border-slate-200" />

          {/* ─── B. ARUS KAS DARI INVESTASI ─────────── */}
          <CashFlowSection
            label="B"
            title="Arus Kas dari Aktivitas Investasi"
            groups={cf.investasi}
            total={cf.totalInvestasi}
            colorClass="from-blue-500 to-indigo-600"
            bgClass="bg-blue-50"
            textClass="text-blue-700"
          />

          <div className="border-t border-dashed border-slate-200" />

          {/* ─── C. ARUS KAS DARI PENDANAAN ─────────── */}
          <CashFlowSection
            label="C"
            title="Arus Kas dari Aktivitas Pendanaan"
            groups={cf.pendanaan}
            total={cf.totalPendanaan}
            colorClass="from-violet-500 to-purple-600"
            bgClass="bg-violet-50"
            textClass="text-violet-700"
          />

          {/* ─── RINGKASAN AKHIR ───────────────────── */}
          <div className="mt-6 pt-6 border-t-2 border-slate-800 space-y-3">
            <SummaryRow
              label="Kas Pada Saat Awal Periode"
              value={cf.kasAwalPeriode}
            />
            <SummaryRow
              label="Kenaikan / (Penurunan) Kas Bersih"
              sublabel="A + B + C"
              value={cf.perubahanKasBersih}
              highlight
            />

            {/* Final Kas Akhir */}
            <div className="px-5 py-4 border-t-2 border-slate-800 bg-slate-50 flex justify-between items-center mt-4">
              <div className="flex flex-col">
                <span className="font-black text-slate-800 text-sm">KAS PADA SAAT AKHIR PERIODE</span>
                <span className="text-[10px] text-slate-500 font-semibold mt-0.5">Kas Awal + Perubahan Kas Bersih</span>
              </div>
              <span className="text-xl font-black tabular-nums text-indigo-650 text-indigo-600">
                {formatIDR(cf.kasAkhirPeriode)}
              </span>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}

// ── Sub-components ──────────────────────────────────────────────────

function CashFlowSection({
  label, title, groups, total, colorClass, bgClass, textClass,
}: {
  label: string;
  title: string;
  groups: CashFlowGroup[];
  total: number;
  colorClass: string;
  bgClass: string;
  textClass: string;
}) {
  return (
    <div>
      {/* Section Header */}
      <div className="flex items-center gap-3 mb-5">
        <span className={`w-9 h-9 bg-gradient-to-br ${colorClass} text-white rounded-xl flex items-center justify-center text-sm font-black shrink-0 shadow-sm print:bg-slate-800`}>
          {label}
        </span>
        <h3 className="font-black text-slate-800 uppercase tracking-wider text-sm">{title}</h3>
      </div>

      {/* Groups */}
      {groups.length === 0 ? (
        <div className={`ml-12 p-4 rounded-xl ${bgClass} border border-dashed border-slate-200`}>
          <p className="text-sm text-slate-400 italic">Tidak ada arus kas pada kategori ini.</p>
        </div>
      ) : (
        <div className="space-y-5 ml-12">
          {groups.map((group, i) => (
            <div key={i}>
              <h4 className="font-bold text-slate-600 text-sm mb-3 pb-1.5 border-b border-slate-100 flex items-center gap-2">
                <span className={`w-1.5 h-1.5 rounded-full bg-gradient-to-r ${colorClass}`} />
                {group.label}
              </h4>
              <div className="space-y-0.5">
                {group.items.map((item, j) => (
                  <div key={j} className="flex justify-between items-center text-sm py-2 px-3 rounded-lg hover:bg-slate-50/80 transition-colors group">
                    <span className="flex items-center gap-3 text-slate-600">
                      <span className="font-mono text-[11px] text-slate-400 bg-slate-50 px-1.5 py-0.5 rounded shrink-0 group-hover:bg-white transition-colors">{item.code}</span>
                      <span>{item.name}</span>
                    </span>
                    <span className={`tabular-nums font-semibold shrink-0 ml-4 ${item.amount < 0 ? "text-rose-600" : "text-emerald-700"}`}>
                      {item.amount < 0 ? (
                        <span className="flex items-center gap-1">
                          <ArrowDownRight className="w-3.5 h-3.5 opacity-60" />
                          ({formatIDR(Math.abs(item.amount))})
                        </span>
                      ) : (
                        <span className="flex items-center gap-1">
                          <ArrowUpRight className="w-3.5 h-3.5 opacity-60" />
                          {formatIDR(item.amount)}
                        </span>
                      )}
                    </span>
                  </div>
                ))}
              </div>
              {/* Group subtotal */}
              <div className="flex justify-between items-center text-sm font-bold text-slate-700 pt-2 mt-2 border-t border-slate-100 px-3">
                <span>Subtotal</span>
                <span className={`tabular-nums ${group.total < 0 ? "text-rose-600" : textClass}`}>
                  {group.total < 0 ? `(${formatIDR(Math.abs(group.total))})` : formatIDR(group.total)}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Section Total */}
      <div className={`flex justify-between items-center py-3 px-5 ${bgClass} rounded-xl border border-slate-200/60 font-black text-sm mt-5 ml-12`}>
        <span className="text-slate-800">{title.toUpperCase()}</span>
        <span className={`tabular-nums text-base ${total < 0 ? "text-rose-600" : textClass}`}>
          {total < 0 ? `(${formatIDR(Math.abs(total))})` : formatIDR(total)}
        </span>
      </div>
    </div>
  );
}

function SummaryRow({ label, sublabel, value, highlight = false }: { label: string; sublabel?: string; value: number; highlight?: boolean }) {
  return (
    <div className={`flex justify-between items-center py-3 px-5 rounded-xl transition-colors ${highlight ? "bg-slate-100 border border-slate-200" : "hover:bg-slate-50"}`}>
      <div>
        <span className="font-bold text-slate-700 text-sm">{label}</span>
        {sublabel && <span className="ml-2 text-xs text-slate-400 font-mono">({sublabel})</span>}
      </div>
      <span className={`font-black tabular-nums text-sm ${value < 0 ? "text-rose-600" : "text-slate-800"}`}>
        {value < 0 ? `(${formatIDR(Math.abs(value))})` : formatIDR(value)}
      </span>
    </div>
  );
}
