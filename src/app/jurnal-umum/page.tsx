"use client";

import { useState, useEffect, useCallback } from "react";
import { useApi } from "@/hooks/useApi";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/contexts/ToastContext";
import { PageHeader, Card, Btn } from "@/components/finance-ui";
import { BookOpen, Search, ChevronDown, ChevronRight, Calendar, Printer, Hash } from "lucide-react";

interface JournalLine {
  id: number;
  accountId: number;
  debit: string;
  credit: string;
  description: string | null;
  account: {
    id: number;
    accountCode: string;
    accountName: string;
    accountType: string;
  };
}

interface JournalEntry {
  id: number;
  journalNo: string;
  journalDate: string;
  description: string;
  isPosted: boolean;
  postedAt: string | null;
  createdAt: string;
  lines: JournalLine[];
  user: { id: number; name: string; email: string };
  approver: { id: number; name: string; email: string } | null;
  transaction: {
    id: number;
    transactionCode: string;
    transactionType: string;
    status: string;
    amount: string;
  } | null;
}

function formatIDR(value: number | string): string {
  const num = typeof value === "string" ? parseFloat(value) : value;
  if (isNaN(num) || num === 0) return "—";
  return new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(num);
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" });
}

function formatDateShort(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" });
}

function today(): string {
  return new Date().toISOString().split("T")[0];
}

function firstDayOfMonth(): string {
  const d = new Date();
  return new Date(d.getFullYear(), d.getMonth(), 1).toISOString().split("T")[0];
}

export default function JurnalUmumPage() {
  const { call } = useApi();
  const { user } = useAuth();
  const { addToast } = useToast();

  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [dateFrom, setDateFrom] = useState(firstDayOfMonth());
  const [dateTo, setDateTo] = useState(today());
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalEntries, setTotalEntries] = useState(0);
  const [expandedIds, setExpandedIds] = useState<Set<number>>(new Set());
  const [summaryDebit, setSummaryDebit] = useState(0);
  const [summaryCredit, setSummaryCredit] = useState(0);

  const limit = 15;

  const fetchEntries = useCallback(async () => {
    try {
      setLoading(true);
      let endpoint = `/api/journal-entries?page=${page}&limit=${limit}`;
      if (dateFrom) endpoint += `&from=${dateFrom}`;
      if (dateTo) endpoint += `&to=${dateTo}`;
      if (search) endpoint += `&search=${encodeURIComponent(search)}`;

      const res = await call("GET", endpoint);

      if (res?.success && Array.isArray(res.data)) {
        setEntries(res.data);
        setTotalPages(res.pagination?.pages || 1);
        setTotalEntries(res.pagination?.total || 0);
        setSummaryDebit(parseFloat(res.summary?.totalDebit) || 0);
        setSummaryCredit(parseFloat(res.summary?.totalCredit) || 0);
      } else {
        setEntries([]);
      }
    } catch (err: any) {
      console.error("Failed to load journal entries:", err);
      addToast(err?.message || "Gagal memuat jurnal umum", "error");
      setEntries([]);
    } finally {
      setLoading(false);
    }
  }, [call, page, dateFrom, dateTo, search, addToast]);

  useEffect(() => {
    fetchEntries();
  }, [fetchEntries]);

  const toggleExpand = (id: number) => {
    setExpandedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const expandAll = () => {
    setExpandedIds(new Set(entries.map(e => e.id)));
  };

  const collapseAll = () => {
    setExpandedIds(new Set());
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    fetchEntries();
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto animate-fade-in print:max-w-full print:p-0 print:space-y-2">
      <PageHeader
        title="Jurnal Umum (General Journal)"
        description="Catatan jurnal double-entry yang dihasilkan dari transaksi yang telah disetujui dan diposting."
        icon={BookOpen}
        action={
          <Btn onClick={() => window.print()} variant="secondary">
            <Printer className="w-4 h-4" /> Cetak
          </Btn>
        }
      />

      {/* Print Header */}
      <div className="hidden print:block text-center mb-6 pb-4 border-b-2 border-slate-900">
        <h2 className="text-xl font-black text-black uppercase tracking-[0.15em]">Jurnal Umum (General Journal)</h2>
        <p className="text-slate-700 text-sm mt-1">
          Periode: {formatDate(dateFrom)} — {formatDate(dateTo)}
        </p>
      </div>

      {/* Filters */}
      <Card className="p-5 no-print print:hidden">
        <form onSubmit={handleSearch} className="flex flex-col md:flex-row items-end gap-3">
          <div className="flex-1 w-full">
            <label className="block text-xs font-bold text-slate-500 mb-1.5 uppercase tracking-wider">Pencarian</label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Cari nomor jurnal atau keterangan..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="input-base pl-10"
              />
            </div>
          </div>
          <div className="w-full md:w-44">
            <label className="block text-xs font-bold text-slate-500 mb-1.5 uppercase tracking-wider">Dari Tanggal</label>
            <input type="date" value={dateFrom} onChange={e => { setDateFrom(e.target.value); setPage(1); }} className="input-base" />
          </div>
          <div className="w-full md:w-44">
            <label className="block text-xs font-bold text-slate-500 mb-1.5 uppercase tracking-wider">Sampai Tanggal</label>
            <input type="date" value={dateTo} onChange={e => { setDateTo(e.target.value); setPage(1); }} className="input-base" />
          </div>
          <Btn type="submit" className="w-full md:w-auto">
            <Search className="w-4 h-4" /> Cari
          </Btn>
        </form>
      </Card>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 print:hidden no-print">
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-500">
              <Hash className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs text-slate-400 font-medium">Total Jurnal</p>
              <p className="text-xl font-black text-slate-800 tabular-nums">{totalEntries}</p>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-500">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs text-slate-400 font-medium">Total Debit</p>
              <p className="text-lg font-black text-emerald-600 tabular-nums">{formatIDR(summaryDebit)}</p>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-rose-50 flex items-center justify-center text-rose-500">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs text-slate-400 font-medium">Total Kredit</p>
              <p className="text-lg font-black text-rose-600 tabular-nums">{formatIDR(summaryCredit)}</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Expand/Collapse All */}
      {entries.length > 0 && (
        <div className="flex justify-end gap-2 no-print print:hidden">
          <button onClick={expandAll} className="text-xs text-indigo-600 hover:text-indigo-800 font-medium transition-colors">
            Buka Semua
          </button>
          <span className="text-slate-300">|</span>
          <button onClick={collapseAll} className="text-xs text-slate-500 hover:text-slate-700 font-medium transition-colors">
            Tutup Semua
          </button>
        </div>
      )}

      {/* Journal Entries List */}
      {loading ? (
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <Card key={i} className="p-5 animate-pulse">
              <div className="h-5 bg-slate-200 rounded w-1/3 mb-3" />
              <div className="h-4 bg-slate-100 rounded w-2/3 mb-2" />
              <div className="h-4 bg-slate-100 rounded w-1/2" />
            </Card>
          ))}
        </div>
      ) : entries.length === 0 ? (
        <Card className="p-12 text-center">
          <BookOpen className="w-12 h-12 mx-auto text-slate-300 mb-3" />
          <p className="text-slate-500 font-medium">Belum ada jurnal untuk periode ini.</p>
          <p className="text-sm text-slate-400 mt-1">Jurnal otomatis dibuat saat transaksi disetujui oleh Manager.</p>
        </Card>
      ) : (
        <div className="space-y-3 print:space-y-4">
          {entries.map(entry => {
            const isExpanded = expandedIds.has(entry.id);
            const totalDebit = entry.lines.reduce((sum, l) => sum + parseFloat(l.debit || "0"), 0);
            const totalCredit = entry.lines.reduce((sum, l) => sum + parseFloat(l.credit || "0"), 0);

            return (
              <Card key={entry.id} className="overflow-hidden print:break-inside-avoid">
                {/* Header Row — clickable */}
                <button
                  onClick={() => toggleExpand(entry.id)}
                  className="w-full px-5 py-4 flex items-center gap-4 hover:bg-slate-50/50 transition-colors text-left no-print"
                >
                  <div className="text-slate-400 shrink-0">
                    {isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-mono text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded font-bold">{entry.journalNo}</span>
                      <span className="text-xs text-slate-400 flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {formatDateShort(entry.journalDate)}
                      </span>
                      {entry.transaction && (
                        <span className="text-xs bg-indigo-50 text-indigo-600 px-2 py-0.5 rounded font-medium">
                          {entry.transaction.transactionCode}
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-slate-700 font-medium mt-1 truncate">{entry.description}</p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-sm font-bold text-slate-800 tabular-nums">{formatIDR(totalDebit)}</p>
                    <p className="text-[10px] text-slate-400 font-medium">Oleh: {entry.user?.name}</p>
                  </div>
                </button>

                {/* Print: always show detail */}
                <div className="hidden print:block px-5 py-3 border-b border-slate-100">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="font-mono text-xs font-bold">{entry.journalNo}</span>
                      <span className="text-xs text-slate-500 ml-3">{formatDate(entry.journalDate)}</span>
                    </div>
                    <span className="text-xs text-slate-500">Oleh: {entry.user?.name}</span>
                  </div>
                  <p className="text-sm text-slate-700 mt-1">{entry.description}</p>
                </div>

                {/* Detail Lines — expandable on screen, always shown in print */}
                <div className={`${isExpanded ? "block" : "hidden"} print:block`}>
                  <div className="border-t border-slate-100 overflow-x-auto">
                    <table className="w-full text-sm min-w-125">
                      <thead className="bg-slate-50">
                        <tr>
                          <th className="px-5 py-2.5 text-left font-bold text-slate-500 text-xs uppercase tracking-wider w-28">Kode Akun</th>
                          <th className="px-5 py-2.5 text-left font-bold text-slate-500 text-xs uppercase tracking-wider">Nama Akun</th>
                          <th className="px-5 py-2.5 text-right font-bold text-emerald-600 text-xs uppercase tracking-wider w-36">Debit</th>
                          <th className="px-5 py-2.5 text-right font-bold text-rose-600 text-xs uppercase tracking-wider w-36">Kredit</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-50">
                        {entry.lines.map(line => {
                          const debit = parseFloat(line.debit || "0");
                          const credit = parseFloat(line.credit || "0");
                          const isCredit = credit > 0;

                          return (
                            <tr key={line.id} className="hover:bg-slate-50/50 transition-colors">
                              <td className="px-5 py-2.5">
                                <span className="font-mono text-xs text-slate-500">{line.account.accountCode}</span>
                              </td>
                              <td className={`px-5 py-2.5 font-medium text-slate-700 ${isCredit ? "pl-10" : ""}`}>
                                {isCredit && <span className="text-slate-400 mr-1">↳</span>}
                                {line.account.accountName}
                              </td>
                              <td className="px-5 py-2.5 text-right tabular-nums font-semibold text-emerald-700">
                                {debit > 0 ? formatIDR(debit) : ""}
                              </td>
                              <td className="px-5 py-2.5 text-right tabular-nums font-semibold text-rose-600">
                                {credit > 0 ? formatIDR(credit) : ""}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                      <tfoot>
                        <tr className="border-t-2 border-slate-200 bg-slate-50/50">
                          <td colSpan={2} className="px-5 py-3 text-right font-black text-xs uppercase text-slate-500 tracking-wider">Total</td>
                          <td className="px-5 py-3 text-right font-black text-emerald-700 tabular-nums">{formatIDR(totalDebit)}</td>
                          <td className="px-5 py-3 text-right font-black text-rose-600 tabular-nums">{formatIDR(totalCredit)}</td>
                        </tr>
                      </tfoot>
                    </table>
                  </div>

                  {/* Metadata */}
                  {entry.approver && (
                    <div className="px-5 py-2.5 bg-slate-50/50 border-t border-slate-100 text-xs text-slate-400 flex items-center gap-4 no-print">
                      <span>Disetujui oleh: <strong className="text-slate-600">{entry.approver.name}</strong></span>
                      {entry.transaction && (
                        <span>Tipe: <strong className="text-slate-600">{entry.transaction.transactionType}</strong></span>
                      )}
                    </div>
                  )}
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 pt-2 no-print print:hidden">
          <button
            onClick={() => setPage(p => Math.max(1, p - 1))}
            disabled={page === 1}
            className="px-3 py-2 rounded-xl text-sm font-semibold bg-slate-100 text-slate-600 hover:bg-slate-200 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            ← Sebelumnya
          </button>
          <div className="flex items-center gap-1">
            {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
              let pageNum: number;
              if (totalPages <= 5) {
                pageNum = i + 1;
              } else if (page <= 3) {
                pageNum = i + 1;
              } else if (page >= totalPages - 2) {
                pageNum = totalPages - 4 + i;
              } else {
                pageNum = page - 2 + i;
              }
              return (
                <button
                  key={pageNum}
                  onClick={() => setPage(pageNum)}
                  className={`w-9 h-9 rounded-xl text-sm font-semibold transition-colors ${
                    page === pageNum
                      ? "bg-indigo-600 text-white shadow-sm"
                      : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                  }`}
                >
                  {pageNum}
                </button>
              );
            })}
          </div>
          <button
            onClick={() => setPage(p => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
            className="px-3 py-2 rounded-xl text-sm font-semibold bg-slate-100 text-slate-600 hover:bg-slate-200 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            Selanjutnya →
          </button>
        </div>
      )}

      {/* Print footer summary */}
      <div className="hidden print:block mt-8 pt-4 border-t-2 border-slate-900">
        <div className="flex justify-between text-sm">
          <span className="font-bold">Total keseluruhan:</span>
          <div className="flex gap-12">
            <span>Debit: <strong className="font-black">{formatIDR(summaryDebit)}</strong></span>
            <span>Kredit: <strong className="font-black">{formatIDR(summaryCredit)}</strong></span>
          </div>
        </div>
        <p className="text-xs text-slate-500 mt-2">
          Dicetak pada: {new Date().toLocaleString("id-ID")} | Total {totalEntries} jurnal
        </p>
      </div>
    </div>
  );
}
