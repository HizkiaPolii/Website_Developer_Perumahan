"use client";

import { useState } from "react";
import { useAccountingStore } from "@/hooks/useAccountingStore";
import { formatIDR } from "@/lib/accounting";
import { PageHeader, Card, Btn } from "@/components/finance-ui";
import { ArrowRightLeft, Plus, Save, X, Trash2 } from "lucide-react";

export default function TransaksiPage() {
  const { accounts, transactions, reports, addTransaction, deleteTransaction, ready } = useAccountingStore();
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ date: today(), description: "", debitAccountId: "", creditAccountId: "", amount: "" });

  if (!ready) return null;

  const sorted = [...accounts].sort((a, b) => a.code.localeCompare(b.code));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.debitAccountId || !form.creditAccountId || !form.amount || Number(form.amount) <= 0) return;
    if (form.debitAccountId === form.creditAccountId) return;

    addTransaction({
      id: `trx-${Date.now()}`,
      date: form.date,
      description: form.description,
      debitAccountId: form.debitAccountId,
      creditAccountId: form.creditAccountId,
      amount: Number(form.amount),
    });
    setForm({ date: today(), description: "", debitAccountId: "", creditAccountId: "", amount: "" });
    setShowForm(false);
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto animate-fade-in">
      <PageHeader
        title="Manajemen Transaksi"
        description="Catat jurnal double-entry. Setiap transaksi otomatis memperbarui seluruh laporan."
        icon={ArrowRightLeft}
        action={
          <Btn onClick={() => setShowForm(!showForm)} variant={showForm ? "secondary" : "primary"}>
            {showForm ? <><X className="w-4 h-4" /> Tutup</> : <><Plus className="w-4 h-4" /> Input Transaksi</>}
          </Btn>
        }
      />

      {showForm && (
        <Card className="p-6 border-indigo-200 shadow-md animate-slide-in-up">
          <h2 className="text-lg font-bold text-slate-800 mb-5">Jurnal Transaksi Baru</h2>
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Field label="Tanggal Transaksi">
                <input type="date" required value={form.date} onChange={e => setForm({ ...form, date: e.target.value })} className="input-base" />
              </Field>
              <Field label="Nominal (Rp)">
                <input type="number" required min="1" placeholder="0" value={form.amount} onChange={e => setForm({ ...form, amount: e.target.value })} className="input-base font-semibold" />
              </Field>
              <Field label="Keterangan Transaksi" span={2}>
                <input type="text" required placeholder="Contoh: Pembayaran DP rumah Blok B-02" value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} className="input-base" />
              </Field>
              <Field label="Akun Debit" labelColor="text-emerald-600">
                <select required value={form.debitAccountId} onChange={e => setForm({ ...form, debitAccountId: e.target.value })} className="input-base bg-emerald-50/50 focus:ring-emerald-500">
                  <option value="">— Pilih Akun Debit —</option>
                  {sorted.map(a => <option key={a.id} value={a.id}>{a.code} — {a.name}</option>)}
                </select>
              </Field>
              <Field label="Akun Kredit" labelColor="text-rose-600">
                <select required value={form.creditAccountId} onChange={e => setForm({ ...form, creditAccountId: e.target.value })} className="input-base bg-rose-50/50 focus:ring-rose-500">
                  <option value="">— Pilih Akun Kredit —</option>
                  {sorted.map(a => <option key={a.id} value={a.id}>{a.code} — {a.name}</option>)}
                </select>
              </Field>
            </div>
            <div className="flex justify-end pt-2">
              <Btn type="submit"><Save className="w-4 h-4" /> Simpan Jurnal</Btn>
            </div>
          </form>
        </Card>
      )}

      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-slate-50 border-b border-slate-100">
              <tr>
                <th className="px-5 py-3.5 font-bold text-slate-500 text-xs uppercase tracking-wider">Tanggal</th>
                <th className="px-5 py-3.5 font-bold text-slate-500 text-xs uppercase tracking-wider">Keterangan</th>
                <th className="px-5 py-3.5 font-bold text-emerald-600 text-xs uppercase tracking-wider">Debit</th>
                <th className="px-5 py-3.5 font-bold text-rose-600 text-xs uppercase tracking-wider">Kredit</th>
                <th className="px-5 py-3.5 font-bold text-slate-500 text-xs uppercase tracking-wider text-right">Nominal</th>
                <th className="px-5 py-3.5 w-12" />
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {transactions.length === 0 && (
                <tr><td colSpan={6} className="px-5 py-10 text-center text-slate-400">Belum ada data transaksi.</td></tr>
              )}
              {[...transactions].reverse().map(trx => {
                const dAcc = accounts.find(a => a.id === trx.debitAccountId);
                const cAcc = accounts.find(a => a.id === trx.creditAccountId);
                return (
                  <tr key={trx.id} className="hover:bg-slate-50/50 transition-colors group">
                    <td className="px-5 py-3 text-slate-500">{new Date(trx.date).toLocaleDateString("id-ID")}</td>
                    <td className="px-5 py-3 font-medium text-slate-800 max-w-xs truncate">{trx.description}</td>
                    <td className="px-5 py-3">
                      <span className="inline-flex items-center gap-1 text-xs font-medium bg-emerald-50 text-emerald-700 px-2 py-1 rounded-md">
                        <span className="font-mono">{dAcc?.code}</span> {dAcc?.name}
                      </span>
                    </td>
                    <td className="px-5 py-3">
                      <span className="inline-flex items-center gap-1 text-xs font-medium bg-rose-50 text-rose-700 px-2 py-1 rounded-md">
                        <span className="font-mono">{cAcc?.code}</span> {cAcc?.name}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-right font-bold text-slate-800">{formatIDR(trx.amount)}</td>
                    <td className="px-3 py-3 text-center">
                      <button onClick={() => deleteTransaction(trx.id)} className="p-1.5 text-slate-300 hover:text-rose-500 hover:bg-rose-50 rounded-lg opacity-0 group-hover:opacity-100 transition-all" title="Hapus">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}

// ── Helpers ─────────────────────────────────────────────────────────
function today() { return new Date().toISOString().split("T")[0]; }

function Field({ label, labelColor = "text-slate-700", span, children }: { label: string; labelColor?: string; span?: number; children: React.ReactNode }) {
  return (
    <div className={span === 2 ? "md:col-span-2" : ""}>
      <label className={`block text-sm font-bold mb-1.5 ${labelColor}`}>{label}</label>
      {children}
    </div>
  );
}
