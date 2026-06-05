"use client";

import { useState, useEffect } from "react";
import { useAccountingStore } from "@/hooks/useAccountingStore";
import { formatIDR, ReportAccountNode } from "@/lib/accounting";
import { PageHeader, Card, Btn } from "@/components/finance-ui";
import { Scale, AlertCircle, Printer, Download } from "lucide-react";
import { useToast } from "@/contexts/ToastContext";
import { useAuth } from "@/contexts/AuthContext";
import { useFinancialReports } from "@/hooks/useApiEndpoints";
import { downloadCSV, exportBalanceSheetToCSV } from "@/utils/export-helper";

export default function NeracaPage() {
  const { reports, ready, accounts } = useAccountingStore();
  const { getAll, create, finalize } = useFinancialReports();
  const { user } = useAuth();
  const { addToast } = useToast();

  const [reportStatus, setReportStatus] = useState<"DRAFT" | "FINALIZED" | null>(null);
  const [reportId, setReportId] = useState<number | null>(null);
  const [finalizedInfo, setFinalizedInfo] = useState<any>(null);
  const [dbItems, setDbItems] = useState<any[] | null>(null);

  useEffect(() => {
    if (!ready) return;
    const fetchStatus = async () => {
      try {
        const reportsList = await getAll({ reportType: "BALANCE_SHEET" });
        const report2026 = reportsList.find(r => {
          const d = new Date(r.periodEnd);
          return d.getFullYear() === 2026;
        });

        if (report2026) {
          setReportId(report2026.id);
          setReportStatus(report2026.status);
          if (report2026.status === "FINALIZED") {
            setFinalizedInfo({
              finalizer: report2026.finalizer?.name || "Sistem",
              finalizedAt: report2026.finalizedAt,
              notes: report2026.notes
            });
            if (report2026.reportData && Array.isArray(report2026.reportData.items)) {
              setDbItems(report2026.reportData.items);
            }
          }
        } else {
          setReportStatus("DRAFT");
        }
      } catch (err) {
        console.error("Gagal memuat status laporan:", err);
      }
    };
    fetchStatus();
  }, [getAll, ready]);

  if (!ready) return null;

  const { balanceSheet: bs, equityChange: ec } = reports;

  // Helper untuk membangun pohon dari data rata database
  function buildTreeFromFlat(items: any[], type: string): ReportAccountNode[] {
    const typeMap: Record<string, string> = {
      "ASET": "aset",
      "KEWAJIBAN": "kewajiban",
      "EKUITAS": "modal",
      "PENDAPATAN": "pendapatan",
      "BEBAN": "beban"
    };

    const filtered = items.map(item => {
      const matchedAccount = accounts.find(a => a.code === item.code || a.id === item.id);
      return {
        id: item.id || (matchedAccount ? matchedAccount.id : item.code),
        code: item.code,
        name: item.name,
        balance: item.amount || item.balance || 0,
        parentId: matchedAccount ? matchedAccount.parentId : null,
        type: item.type
      };
    });

    const build = (parentId: string | null): ReportAccountNode[] =>
      filtered
        .filter(a => a.parentId === parentId)
        .sort((a, b) => a.code.localeCompare(b.code))
        .map(a => ({
          id: a.id,
          code: a.code,
          name: a.name,
          balance: a.balance,
          children: build(a.id)
        }));

    return build(null);
  }

  // Jika laporan sudah FINALIZED, gunakan data dari database
  let bsToUse = bs;
  let ecToUse = ec;

  if (reportStatus === "FINALIZED" && dbItems) {
    const asetTree = buildTreeFromFlat(dbItems, "aset");
    const kewajibanTree = buildTreeFromFlat(dbItems, "kewajiban");

    const totalAset = dbItems.filter(i => i.type === "ASET").reduce((sum, i) => sum + i.amount, 0);
    const totalKewajiban = dbItems.filter(i => i.type === "KEWAJIBAN").reduce((sum, i) => sum + i.amount, 0);

    const modalAwal = dbItems.filter(i => i.type === "EKUITAS" && !i.name.toLowerCase().includes("laba") && !i.name.toLowerCase().includes("prive")).reduce((sum, i) => sum + i.amount, 0);
    const labaBersihItem = dbItems.find(i => i.name.toLowerCase().includes("laba bersih") || i.code.includes("3.1.02.02"));
    const labaBersih = labaBersihItem ? labaBersihItem.amount : 0;

    const priveItem = dbItems.find(i => i.name.toLowerCase().includes("prive"));
    const prive = priveItem ? Math.abs(priveItem.amount) : 0;

    const ekuitasAkhir = modalAwal + labaBersih - prive;
    const totalPasiva = totalKewajiban + ekuitasAkhir;
    const selisih = Math.abs(totalAset - totalPasiva);

    bsToUse = {
      aset: asetTree,
      totalAset,
      kewajiban: kewajibanTree,
      totalKewajiban,
      ekuitasAkhir,
      totalPasiva,
      isBalanced: selisih < 1,
      selisih
    };

    ecToUse = {
      modalAwal,
      labaBersih,
      prive,
      ekuitasAkhir
    };
  }

  const handleFinalize = async () => {
    if (!user) {
      addToast("Anda harus login untuk melakukan finalisasi", "error");
      return;
    }

    const confirmFinalize = window.confirm(
      "Apakah Anda yakin ingin memfinalisasi laporan keuangan periode ini?\n\nSetelah difinalisasi:\n1. Periode laporan akan dikunci (Locked).\n2. Transaksi baru tidak dapat dibuat dalam periode ini.\n3. Transaksi yang ada tidak dapat diubah atau dihapus."
    );

    if (!confirmFinalize) return;

    try {
      // 1. Flatten items
      const flatItems = accounts.map(acc => ({
        id: acc.id,
        code: acc.code,
        name: acc.name,
        type: acc.type.toUpperCase() === "MODAL" ? "EKUITAS" : acc.type.toUpperCase(),
        amount: reports.balances[acc.id] || 0,
        level: acc.code.split('.').length
      }));

      // 2. Save draft
      const draftResult = await create({
        companyId: 1,
        reportType: "BALANCE_SHEET",
        periodStart: "2026-01-01",
        periodEnd: "2026-12-31",
        reportData: { items: flatItems },
        notes: "Finalisasi Laporan Neraca Periode 2026"
      });

      if (!draftResult) {
        throw new Error("Gagal membuat draf laporan di server.");
      }

      // 3. Finalize
      const reportIdNum = typeof draftResult.id === "string" ? parseInt(draftResult.id) : draftResult.id;
      const userIdNum = typeof user.id === "string" ? parseInt(user.id) : user.id;

      const finalized = await finalize(reportIdNum, userIdNum, "Finalisasi otomatis Laporan Neraca");
      if (finalized) {
        setReportId(finalized.id);
        setReportStatus("FINALIZED");
        setFinalizedInfo({
          finalizer: user.name,
          finalizedAt: new Date().toISOString(),
          notes: "Finalisasi otomatis Laporan Neraca"
        });
        if (finalized.reportData && Array.isArray(finalized.reportData.items)) {
          setDbItems(finalized.reportData.items);
        }
        addToast("Laporan Neraca berhasil difinalisasi dan periode transaksi telah dikunci!", "success");
      } else {
        throw new Error("Gagal melakukan finalisasi laporan.");
      }
    } catch (err: any) {
      addToast(err.message || "Gagal memfinalisasi laporan", "error");
    }
  };

  const handleExportCSV = () => {
    try {
      const csvContent = exportBalanceSheetToCSV(bsToUse, ecToUse, "Periode Berjalan 2026");
      downloadCSV("laporan_neraca_2026.csv", csvContent);
      addToast("Laporan Neraca berhasil diekspor ke CSV", "success");
    } catch (err: any) {
      addToast("Gagal mengekspor laporan: " + err.message, "error");
    }
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto animate-fade-in print:max-w-full print:p-0 print:space-y-0">
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

      {/* Banner Status Laporan */}
      {reportStatus && (
        <Card className={`p-5 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 no-print print:hidden ${reportStatus === "FINALIZED" ? "bg-slate-900 text-white border-slate-950" : "bg-indigo-50/50 border-indigo-100"}`}>
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className={`w-2.5 h-2.5 rounded-full ${reportStatus === "FINALIZED" ? "bg-emerald-400" : "bg-amber-400"}`} />
              <span className="font-bold text-sm tracking-wider uppercase">
                Status Laporan: {reportStatus === "FINALIZED" ? "🔒 FINALIZED (TERKUNCI)" : "📝 DRAFT (BELUM FINALISASI)"}
              </span>
            </div>
            {reportStatus === "FINALIZED" && finalizedInfo && (
              <p className="text-xs text-slate-400">
                Difinalisasi oleh <strong className="text-indigo-200">{finalizedInfo.finalizer}</strong> pada {new Date(finalizedInfo.finalizedAt).toLocaleString("id-ID")}
              </p>
            )}
            {reportStatus === "DRAFT" && (
              <p className="text-xs text-slate-500">
                Laporan ini masih berupa draft. Klik tombol di samping untuk memfinalisasi dan mengunci periode transaksi ini.
              </p>
            )}
          </div>
          {reportStatus === "DRAFT" && (
            <Btn onClick={handleFinalize} variant="primary" className="bg-indigo-600 hover:bg-indigo-700">
              Finalisasi Laporan
            </Btn>
          )}
        </Card>
      )}

      {/* Balance Indicator */}
      <div className={`p-4 rounded-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border shadow-sm no-print print:hidden ${bsToUse.isBalanced ? "bg-emerald-50 border-emerald-200" : "bg-rose-50 border-rose-200"}`}>
        <div className="flex items-center gap-3">
          <AlertCircle className={`w-5 h-5 shrink-0 ${bsToUse.isBalanced ? "text-emerald-600" : "text-rose-600"}`} />
          <span className={`font-bold ${bsToUse.isBalanced ? "text-emerald-800" : "text-rose-800"}`}>
            {bsToUse.isBalanced ? "Status Neraca: SEIMBANG ✓" : "Status Neraca: TIDAK SEIMBANG ✗"}
          </span>
        </div>
        {!bsToUse.isBalanced && (
          <span className="text-rose-600 font-black text-sm bg-rose-100 px-3 py-1 rounded-lg tabular-nums">
            Selisih: {formatIDR(bsToUse.selisih)}
          </span>
        )}
      </div>

      {/* Print Title Header inside printed page */}
      <div className="hidden print:block text-center mb-6 pb-4 border-b-2 border-slate-900">
        <h2 className="text-xl font-black text-slate-800 uppercase tracking-[0.15em] print:text-black">Laporan Neraca (Balance Sheet)</h2>
        <p className="text-slate-500 text-sm mt-1 print:text-slate-700">Periode Berjalan 2026</p>
      </div>

      {/* Two Columns */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start print:flex print:flex-col print:gap-8">

        {/* ASET */}
        <Card className="flex flex-col overflow-hidden print:border-none print:shadow-none print:p-0">
          <div className="bg-slate-50 border-b border-slate-100 px-5 py-4">
            <h3 className="font-black text-slate-800 tracking-wide text-sm uppercase">Aset (Aktiva)</h3>
          </div>
          <div className="p-5 flex-1">
            <AccountTree nodes={bsToUse.aset} />
          </div>
          <TotalRow label="TOTAL ASET" value={bsToUse.totalAset} color="text-emerald-600" />
        </Card>

        {/* PASIVA */}
        <Card className="flex flex-col overflow-hidden print:border-none print:shadow-none print:p-0">
          <div className="bg-slate-50 border-b border-slate-100 px-5 py-4">
            <h3 className="font-black text-slate-800 tracking-wide text-sm uppercase">Kewajiban & Ekuitas (Pasiva)</h3>
          </div>
          <div className="p-5 flex-1 space-y-8">

            {/* Kewajiban */}
            <div>
              <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.15em] border-b border-slate-100 pb-2 mb-3">Kewajiban (Liabilitas)</h4>
              <AccountTree nodes={bsToUse.kewajiban} />
              <SubTotal label="Total Kewajiban" value={bsToUse.totalKewajiban} />
            </div>

            {/* Ekuitas */}
            <div>
              <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.15em] border-b border-slate-100 pb-2 mb-3">Ekuitas</h4>
              <div className="space-y-1.5 text-sm">
                <Row label="Modal Awal / Tambahan" value={ecToUse.modalAwal} />
                <Row label="Laba Bersih Berjalan" value={ecToUse.labaBersih} color={ecToUse.labaBersih >= 0 ? "text-emerald-600" : "text-rose-600"} />
                {ecToUse.prive > 0 && <Row label="Penarikan Prive" value={-ecToUse.prive} color="text-rose-600" />}
              </div>
              <SubTotal label="Total Ekuitas" value={ecToUse.ekuitasAkhir} />
            </div>
          </div>
          <TotalRow label="TOTAL PASIVA" value={bsToUse.totalPasiva} color="text-indigo-600" />
        </Card>
      </div>
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
