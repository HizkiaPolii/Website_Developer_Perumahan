'use client';

import { useState } from "react";
import { useApi } from "@/hooks/useApi";
import { PageHeader, Card } from "@/components/finance-ui";
import { Award, Search, Trophy, Medal, BarChart2, Target, Loader2, ChevronDown, ChevronUp } from "lucide-react";
import { formatIDR } from "@/lib/accounting";

type SawResult = {
  periode: string;
  label: string;
  pendapatan: number;
  beban: number;
  labaBersih: number;
  saldoKas: number;
  c1: number;
  c2: number | null;
  c3: number;
  c4: number;
  r1: number; r2: number; r3: number; r4: number;
  skor: number;
  peringkat: number;
  kategori: string;
};

type ApiResponse = {
  success: boolean;
  data: SawResult[];
  message?: string;
};

const KATEGORI_CONFIG: Record<string, { bg: string; text: string; border: string; dot: string; bar: string }> = {
  "Sangat Baik": { bg: "bg-emerald-50", text: "text-emerald-700", border: "border-emerald-200", dot: "bg-emerald-500", bar: "bg-emerald-500" },
  "Baik":        { bg: "bg-blue-50",    text: "text-blue-700",    border: "border-blue-200",    dot: "bg-blue-500",    bar: "bg-blue-500" },
  "Cukup":       { bg: "bg-yellow-50",  text: "text-yellow-700",  border: "border-yellow-200",  dot: "bg-yellow-400",  bar: "bg-yellow-400" },
  "Kurang":      { bg: "bg-orange-50",  text: "text-orange-700",  border: "border-orange-200",  dot: "bg-orange-500",  bar: "bg-orange-500" },
  "Sangat Kurang":{ bg: "bg-red-50",   text: "text-red-700",     border: "border-red-200",     dot: "bg-red-500",     bar: "bg-red-500" },
};

const KRITERIA_LIST = [
  { kode: "C1", nama: "Rasio Laba Bersih",     bobot: 35, color: "from-emerald-500 to-teal-500",  light: "bg-emerald-50 border-emerald-200 text-emerald-700", jenis: "Benefit" },
  { kode: "C2", nama: "Pertumbuhan Pendapatan", bobot: 30, color: "from-blue-500 to-indigo-500",   light: "bg-blue-50 border-blue-200 text-blue-700",           jenis: "Benefit" },
  { kode: "C3", nama: "Efisiensi Beban",        bobot: 20, color: "from-rose-500 to-pink-500",     light: "bg-rose-50 border-rose-200 text-rose-700",           jenis: "Cost" },
  { kode: "C4", nama: "Likuiditas Kas",         bobot: 15, color: "from-purple-500 to-violet-500", light: "bg-purple-50 border-purple-200 text-purple-700",     jenis: "Benefit" },
];

function KategoriPill({ kategori }: { kategori: string }) {
  const cfg = KATEGORI_CONFIG[kategori] ?? KATEGORI_CONFIG["Cukup"];
  return (
    <span className={`inline-flex items-center gap-1.5 text-xs font-bold px-2.5 py-1 rounded-full border ${cfg.bg} ${cfg.text} ${cfg.border}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
      {kategori}
    </span>
  );
}

function MedalIcon({ rank }: { rank: number }) {
  if (rank === 1) return <div className="w-8 h-8 rounded-full bg-linear-to-br from-yellow-300 to-yellow-500 flex items-center justify-center shadow-sm"><Trophy className="w-4 h-4 text-yellow-900" /></div>;
  if (rank === 2) return <div className="w-8 h-8 rounded-full bg-linear-to-br from-slate-300 to-slate-400 flex items-center justify-center shadow-sm"><Medal className="w-4 h-4 text-slate-700" /></div>;
  if (rank === 3) return <div className="w-8 h-8 rounded-full bg-linear-to-br from-amber-500 to-amber-700 flex items-center justify-center shadow-sm"><Medal className="w-4 h-4 text-white" /></div>;
  return <span className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-xs font-black text-slate-500">#{rank}</span>;
}

// Ubah nilai kriteria jadi kalimat mudah dipahami
function kriteriaLabel(row: SawResult) {
  const c1Status = row.c1 >= 20 ? "✅" : row.c1 >= 0 ? "⚠️" : "❌";
  const c2Status = row.c2 === null ? "➖" : row.c2 >= 5 ? "✅" : row.c2 >= 0 ? "⚠️" : "❌";
  const c3Status = row.c3 <= 30 ? "✅" : row.c3 <= 60 ? "⚠️" : "❌";
  const c4Status = row.c4 >= 2 ? "✅" : row.c4 >= 0.5 ? "⚠️" : "❌";

  return [
    { label: "Rasio Laba", value: `${row.c1.toFixed(1)}%`, status: c1Status, desc: row.c1 >= 20 ? "Laba cukup besar dari pendapatan" : "Laba tipis" },
    { label: "Pertumbuhan", value: row.c2 === null ? "—" : `${row.c2 > 0 ? "+" : ""}${row.c2.toFixed(1)}%`, status: c2Status, desc: row.c2 === null ? "Bulan pertama, tidak ada pembanding" : row.c2 >= 0 ? "Pendapatan naik dari bulan lalu" : "Pendapatan turun dari bulan lalu" },
    { label: "Efisiensi Beban", value: `${row.c3.toFixed(1)}%`, status: c3Status, desc: row.c3 <= 30 ? "Beban sangat terkendali" : row.c3 <= 60 ? "Beban masih wajar" : "Beban terlalu besar" },
    { label: "Likuiditas Kas", value: row.c4.toFixed(2), status: c4Status, desc: row.c4 >= 2 ? "Kas sangat cukup untuk beban" : row.c4 >= 0.5 ? "Kas cukup" : "Kas perlu perhatian" },
  ];
}

function DetailRow({ row }: { row: SawResult }) {
  const items = kriteriaLabel(row);
  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-4 bg-slate-50 border-t border-slate-100">
      {items.map(item => (
        <div key={item.label} className="bg-white rounded-xl p-3 border border-slate-200">
          <div className="flex items-center justify-between mb-1">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">{item.label}</span>
            <span className="text-base">{item.status}</span>
          </div>
          <p className="text-lg font-black text-slate-800">{item.value}</p>
          <p className="text-[10px] text-slate-500 mt-0.5 leading-tight">{item.desc}</p>
        </div>
      ))}
    </div>
  );
}

export default function AnalisisKinerjaPage() {
  const { call } = useApi();
  const now = new Date();
  const [startMonth, setStartMonth] = useState(`${now.getFullYear()}-01`);
  const [endMonth, setEndMonth]   = useState(`${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`);
  const [loading, setLoading]     = useState(false);
  const [result, setResult]       = useState<ApiResponse | null>(null);
  const [error, setError]         = useState<string | null>(null);
  const [expandedRow, setExpandedRow] = useState<string | null>(null);

  const handleAnalisis = async () => {
    if (startMonth > endMonth) { setError("Bulan awal tidak boleh lebih besar dari bulan akhir"); return; }
    setLoading(true); setError(null); setExpandedRow(null);
    try {
      const res: ApiResponse = await call("GET", `/api/spk/analisis-kinerja?startDate=${startMonth}-01&endDate=${endMonth}-01`);
      setResult(res);
    } catch (e: any) {
      setError(e.message || "Gagal mengambil data analisis");
    } finally { setLoading(false); }
  };

  const data      = result?.data ?? [];
  const sorted    = [...data].sort((a, b) => a.peringkat - b.peringkat);
  const bestMonth = data.find(d => d.peringkat === 1);
  const avgSkor   = data.length ? data.reduce((s, d) => s + d.skor, 0) / data.length : 0;
  const top3      = sorted.slice(0, 3);

  return (
    <div className="space-y-6 max-w-5xl mx-auto animate-fade-in">
      <PageHeader
        title="Analisis Kinerja Keuangan"
        description="Penilaian dan perbandingan kinerja keuangan perusahaan per periode bulanan."
        icon={Award}
      />

      {/* Filter + Kriteria */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Filter */}
        <Card className="p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-5">
              <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center">
                <Target className="w-4 h-4 text-white" />
              </div>
              <h3 className="text-sm font-bold text-slate-700">Pilih Periode</h3>
            </div>
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1.5">Bulan Awal</label>
                <input type="month" value={startMonth} onChange={e => setStartMonth(e.target.value)}
                  className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-slate-50" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1.5">Bulan Akhir</label>
                <input type="month" value={endMonth} onChange={e => setEndMonth(e.target.value)}
                  className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-slate-50" />
              </div>
            </div>
          </div>
          <div className="mt-5 space-y-2">
            <button onClick={handleAnalisis} disabled={loading}
              className="w-full flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 text-white font-bold py-3 rounded-xl transition-all shadow-sm text-sm">
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
              {loading ? "Menghitung..." : "Jalankan Analisis"}
            </button>
            {error && <p className="text-xs text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">{error}</p>}
          </div>
        </Card>

        {/* Kriteria Cards */}
        <div className="lg:col-span-2 grid grid-cols-2 gap-3">
          {KRITERIA_LIST.map(k => (
            <Card key={k.kode} className="p-4 flex flex-col gap-2">
              <div className="flex items-start justify-between">
                <div className={`w-9 h-9 rounded-lg bg-linear-to-br ${k.color} flex items-center justify-center text-white text-xs font-black`}>{k.kode}</div>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${k.light}`}>{k.jenis}</span>
              </div>
              <p className="text-xs font-bold text-slate-700">{k.nama}</p>
              <div className="mt-auto">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[10px] text-slate-400">Bobot</span>
                  <span className="text-xs font-black text-slate-700">{k.bobot}%</span>
                </div>
                <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                  <div className={`h-full bg-linear-to-r ${k.color} rounded-full`} style={{ width: `${k.bobot * (100 / 35)}%` }} />
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>

      {/* Empty state */}
      {result && data.length === 0 && (
        <Card className="py-16 text-center">
          <BarChart2 className="w-12 h-12 text-slate-200 mx-auto mb-3" />
          <p className="text-slate-500 font-semibold">{result.message || "Tidak ada transaksi pada periode ini"}</p>
          <p className="text-xs text-slate-400 mt-1">Pastikan sudah ada transaksi yang disetujui</p>
        </Card>
      )}

      {/* Results */}
      {data.length > 0 && (
        <>
          {/* Summary */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Card className="p-5 bg-linear-to-br from-indigo-600 to-purple-700 border-0">
              <p className="text-[10px] font-bold text-indigo-200 uppercase tracking-widest mb-1">Kinerja Terbaik</p>
              <p className="text-xl font-black text-white truncate">{bestMonth?.label ?? "—"}</p>
              <p className="text-sm text-indigo-200 mt-0.5">Skor <span className="font-bold text-white">{bestMonth?.skor.toFixed(4)}</span></p>
            </Card>
            <Card className="p-5">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Rata-rata Skor</p>
              <p className="text-3xl font-black text-slate-800">{avgSkor.toFixed(4)}</p>
              <KategoriPill kategori={avgSkor >= 0.8 ? "Sangat Baik" : avgSkor >= 0.6 ? "Baik" : avgSkor >= 0.4 ? "Cukup" : avgSkor >= 0.2 ? "Kurang" : "Sangat Kurang"} />
            </Card>
            <Card className="p-5">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Periode Dianalisis</p>
              <p className="text-3xl font-black text-slate-800">{data.length}</p>
              <p className="text-sm text-slate-500 mt-0.5">bulan</p>
            </Card>
          </div>

          {/* Podium */}
          {top3.length >= 2 && (
            <Card className="p-6">
              <h3 className="text-sm font-bold text-slate-700 mb-5">Peringkat Teratas</h3>
              <div className="flex items-end justify-center gap-4">
                {[top3[1], top3[0], top3[2]].filter(Boolean).map((row, i) => {
                  const rank = [2, 1, 3][i];
                  const heights = ["h-10", "h-16", "h-6"];
                  const barColors = ["bg-slate-200", "bg-yellow-200", "bg-amber-200"];
                  const cardColors = ["bg-slate-50 border border-slate-200", "bg-linear-to-b from-yellow-50 to-yellow-100 border border-yellow-200", "bg-amber-50 border border-amber-200"];
                  const textColors = ["text-slate-700", "text-yellow-800", "text-amber-800"];
                  return (
                    <div key={row.periode} className="flex-1 max-w-40 text-center">
                      <div className="flex justify-center mb-2"><MedalIcon rank={rank} /></div>
                      <div className={`rounded-t-xl pt-4 pb-3 px-3 ${cardColors[i]}`}>
                        <p className={`text-xs font-black truncate ${textColors[i]}`}>{row.label}</p>
                        <p className={`text-2xl font-black mt-0.5 ${textColors[i]}`}>{row.skor.toFixed(3)}</p>
                        <div className="mt-1 flex justify-center"><KategoriPill kategori={row.kategori} /></div>
                      </div>
                      <div className={`${heights[i]} ${barColors[i]} rounded-b-sm`} />
                    </div>
                  );
                })}
              </div>
            </Card>
          )}

          {/* Tabel Hasil — dengan expandable detail */}
          <Card className="overflow-hidden">
            <div className="p-6 pb-3">
              <h3 className="text-sm font-bold text-slate-700">Hasil Penilaian Seluruh Periode</h3>
              <p className="text-xs text-slate-400 mt-0.5">Klik baris untuk melihat detail alasan penilaian</p>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-sm min-w-160">
                <thead>
                  <tr className="bg-slate-50 border-y border-slate-200">
                    <th className="py-3 px-4 text-center text-xs font-bold text-slate-400 uppercase w-12">#</th>
                    <th className="py-3 px-4 text-left text-xs font-bold text-slate-500 uppercase">Periode</th>
                    <th className="py-3 px-4 text-left text-xs font-bold text-slate-500 uppercase">Pendapatan</th>
                    <th className="py-3 px-4 text-left text-xs font-bold text-slate-500 uppercase">Laba Bersih</th>
                    <th className="py-3 px-4 text-left text-xs font-bold text-slate-500 uppercase min-w-40">Skor Kinerja</th>
                    <th className="py-3 px-4 text-center text-xs font-bold text-slate-500 uppercase">Kategori</th>
                    <th className="py-3 px-4 w-8" />
                  </tr>
                </thead>
                <tbody>
                  {sorted.flatMap(row => {
                    const isOpen = expandedRow === row.periode;
                    const cfg = KATEGORI_CONFIG[row.kategori] ?? KATEGORI_CONFIG["Cukup"];
                    const mainRow = (
                      <tr
                        key={row.periode}
                        onClick={() => setExpandedRow(isOpen ? null : row.periode)}
                        className="border-b border-slate-100 hover:bg-slate-50/80 cursor-pointer transition-colors"
                      >
                        <td className="py-3.5 px-4"><div className="flex justify-center"><MedalIcon rank={row.peringkat} /></div></td>
                        <td className="py-3.5 px-4 font-bold text-slate-700">{row.label}</td>
                        <td className="py-3.5 px-4 text-emerald-600 font-semibold">{formatIDR(row.pendapatan)}</td>
                        <td className={`py-3.5 px-4 font-bold ${row.labaBersih >= 0 ? "text-emerald-700" : "text-rose-700"}`}>
                          {row.labaBersih >= 0 ? "+" : ""}{formatIDR(row.labaBersih)}
                        </td>
                        <td className="py-3.5 px-4">
                          <div className="flex items-center gap-2">
                            <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
                              <div className={`h-full rounded-full ${cfg.bar} transition-all duration-700`} style={{ width: `${row.skor * 100}%` }} />
                            </div>
                            <span className="text-xs font-bold text-slate-700 tabular-nums w-12 text-right">{row.skor.toFixed(4)}</span>
                          </div>
                        </td>
                        <td className="py-3.5 px-4 text-center"><KategoriPill kategori={row.kategori} /></td>
                        <td className="py-3.5 px-3 text-slate-400">
                          {isOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                        </td>
                      </tr>
                    );
                    if (!isOpen) return [mainRow];
                    return [
                      mainRow,
                      <tr key={`${row.periode}-detail`}>
                        <td colSpan={7} className="p-0">
                          <DetailRow row={row} />
                        </td>
                      </tr>,
                    ];
                  })}
                </tbody>
              </table>
            </div>

            {/* Legend */}
            <div className="p-4 border-t border-slate-100 bg-slate-50/50">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wide mb-2">Skala Kategori</p>
              <div className="flex flex-wrap gap-2">
                {[
                  { label: "Sangat Baik", range: "≥ 0,80", color: "bg-emerald-500" },
                  { label: "Baik",        range: "0,60–0,79", color: "bg-blue-500" },
                  { label: "Cukup",       range: "0,40–0,59", color: "bg-yellow-400" },
                  { label: "Kurang",      range: "0,20–0,39", color: "bg-orange-500" },
                  { label: "Sangat Kurang", range: "< 0,20", color: "bg-red-500" },
                ].map(s => (
                  <div key={s.label} className="flex items-center gap-1.5 bg-white border border-slate-200 rounded-lg px-2.5 py-1">
                    <span className={`w-2 h-2 rounded-full ${s.color}`} />
                    <span className="text-xs font-bold text-slate-700">{s.label}</span>
                    <span className="text-xs text-slate-400">{s.range}</span>
                  </div>
                ))}
              </div>
            </div>
          </Card>

          <p className="text-[10px] text-slate-300 text-center">
            Metode perhitungan: Simple Additive Weighting (SAW)
          </p>
        </>
      )}
    </div>
  );
}
