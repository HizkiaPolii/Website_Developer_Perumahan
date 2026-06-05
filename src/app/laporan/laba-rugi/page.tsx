"use client";

import { useState, useEffect } from "react";
import { useAccountingStore } from "@/hooks/useAccountingStore";
import { formatIDR, ReportAccountNode } from "@/lib/accounting";
import { PageHeader, Card, Btn } from "@/components/finance-ui";
import { TrendingUp, Calculator, Printer, Download } from "lucide-react";
import { useToast } from "@/contexts/ToastContext";
import { useAuth } from "@/contexts/AuthContext";
import { useFinancialReports } from "@/hooks/useApiEndpoints";
import { downloadCSV, exportIncomeStatementToCSV } from "@/utils/export-helper";

export default function LabaRugiPage() {
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
        const reportsList = await getAll({ reportType: "INCOME_STATEMENT" });
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

  const { incomeStatement: is } = reports;

  // Helper untuk membangun pohon dari data rata database
  function buildTreeFromFlat(items: any[], type: string): ReportAccountNode[] {
    const typeMap: Record<string, string> = {
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
  let isToUse = is;

  if (reportStatus === "FINALIZED" && dbItems) {
    const pendapatanTree = buildTreeFromFlat(dbItems, "pendapatan");
    const bebanTree = buildTreeFromFlat(dbItems, "beban");

    const totalPendapatan = dbItems.filter(i => i.type === "PENDAPATAN").reduce((sum, i) => sum + i.amount, 0);
    const totalBeban = dbItems.filter(i => i.type === "BEBAN").reduce((sum, i) => sum + i.amount, 0);
    const labaBersih = totalPendapatan - totalBeban;

    isToUse = {
      pendapatan: pendapatanTree,
      totalPendapatan,
      beban: bebanTree,
      totalBeban,
      labaBersih
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
        reportType: "INCOME_STATEMENT",
        periodStart: "2026-01-01",
        periodEnd: "2026-12-31",
        reportData: { items: flatItems },
        notes: "Finalisasi Laporan Laba Rugi Periode 2026"
      });

      if (!draftResult) {
        throw new Error("Gagal membuat draf laporan di server.");
      }

      // 3. Finalize
      const reportIdNum = typeof draftResult.id === "string" ? parseInt(draftResult.id) : draftResult.id;
      const userIdNum = typeof user.id === "string" ? parseInt(user.id) : user.id;

      const finalized = await finalize(reportIdNum, userIdNum, "Finalisasi otomatis Laporan Laba Rugi");
      if (finalized) {
        setReportId(finalized.id);
        setReportStatus("FINALIZED");
        setFinalizedInfo({
          finalizer: user.name,
          finalizedAt: new Date().toISOString(),
          notes: "Finalisasi otomatis Laporan Laba Rugi"
        });
        if (finalized.reportData && Array.isArray(finalized.reportData.items)) {
          setDbItems(finalized.reportData.items);
        }
        addToast("Laporan Laba Rugi berhasil difinalisasi dan periode transaksi telah dikunci!", "success");
      } else {
        throw new Error("Gagal melakukan finalisasi laporan.");
      }
    } catch (err: any) {
      addToast(err.message || "Gagal memfinalisasi laporan", "error");
    }
  };

  const handleExportCSV = () => {
    try {
      const csvContent = exportIncomeStatementToCSV(isToUse, "Periode Berjalan 2026");
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

      <Card className="p-6 sm:p-10 print:border-none print:shadow-none print:p-0">
        <div className="text-center mb-10 pb-6 border-b border-slate-100 print:mb-6 print:pb-4">
          <h2 className="text-xl font-black text-slate-800 uppercase tracking-[0.15em] print:text-black">Laporan Laba Rugi</h2>
          <p className="text-slate-500 text-sm mt-1 print:text-slate-700">Periode Berjalan</p>
        </div>

        {/* Pendapatan */}
        <Section title="Pendapatan" nodes={isToUse.pendapatan} total={isToUse.totalPendapatan} totalColor="text-emerald-600 print:text-black" />

        {/* Beban */}
        <Section title="Beban Operasional" nodes={isToUse.beban} total={isToUse.totalBeban} totalColor="text-rose-600 print:text-black" />

        {/* Laba Bersih */}
        <div className="pt-8 mt-8 border-t-4 border-slate-800 print:pt-4 print:mt-4">
          <div className="bg-slate-900 rounded-2xl p-6 flex flex-col sm:flex-row justify-between items-center gap-4 text-white shadow-xl shadow-slate-900/20 print:bg-slate-100 print:text-slate-950 print:border print:border-slate-300 print:shadow-none">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-indigo-500/20 rounded-xl shrink-0 print:bg-slate-200">
                <Calculator className="w-7 h-7 text-indigo-300 print:text-slate-700" />
              </div>
              <div>
                <h4 className="text-sm font-semibold text-slate-400 tracking-wider uppercase print:text-slate-600">Laba Bersih</h4>
                <p className="text-xs text-slate-500 mt-0.5 print:text-slate-500">Total Pendapatan − Total Beban</p>
              </div>
            </div>
            <div className={`text-3xl sm:text-4xl font-black ${isToUse.labaBersih >= 0 ? "text-emerald-400 print:text-slate-950" : "text-rose-400 print:text-slate-950"}`}>
              {formatIDR(isToUse.labaBersih)}
            </div>
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
