"use client";

import { useState } from "react";
import { useAccountingStore } from "@/hooks/useAccountingStore";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/contexts/ToastContext";
import { formatIDR } from "@/lib/accounting";
import { PageHeader, Card, Btn } from "@/components/finance-ui";
import { ArrowRightLeft, Plus, Save, X, Trash2, Pencil, Clock, CheckCircle2, XCircle } from "lucide-react";

const EMPTY_FORM = { date: today(), description: "", debitAccountId: "", creditAccountId: "", amount: "" };

export default function TransaksiPage() {
  const { accounts, transactions, addTransaction, deleteTransaction, updateTransaction, ready, loading } = useAccountingStore();
  const { user } = useAuth();
  const { addToast } = useToast();
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [editForm, setEditForm] = useState(EMPTY_FORM);

  if (!ready) return null;

  const role = user?.role?.toLowerCase() || "";
  const isTeller = role === "teller";

  const sorted = [...accounts].sort((a, b) => a.code.localeCompare(b.code));
  const parentIds = new Set(accounts.filter(a => a.parentId).map(a => a.parentId));
  const leafAccounts = sorted.filter(a => !parentIds.has(a.id));

  const pendingTrxs = [...transactions]
    .filter(t => ["PENDING", "DRAFT"].includes((t.status || "POSTED").toUpperCase()))
    .reverse();
  const rejectedTrxs = [...transactions]
    .filter(t => (t.status || "").toUpperCase() === "REJECTED")
    .reverse();
  const postedTrxs = [...transactions]
    .filter(t => ["POSTED", "APPROVED"].includes((t.status || "POSTED").toUpperCase()))
    .reverse();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.debitAccountId || !form.creditAccountId || Number(form.amount) <= 0) {
      addToast("Lengkapi akun debit, akun kredit, dan nominal (minimal Rp 1) terlebih dahulu.", "error");
      return;
    }
    if (form.debitAccountId === form.creditAccountId) {
      addToast("Akun Debit dan Akun Kredit tidak boleh sama.", "error");
      return;
    }
    await addTransaction({
      id: `trx-${Date.now()}`,
      date: form.date,
      description: form.description,
      debitAccountId: form.debitAccountId,
      creditAccountId: form.creditAccountId,
      amount: Number(form.amount),
    });
    setForm({ ...EMPTY_FORM, date: today() });
    setShowForm(false);
  };

  const handleStartEdit = (trx: any) => {
    setEditingId(String(trx.id));
    setEditForm({
      date: (trx.date || trx.transactionDate || "").split("T")[0] || today(),
      description: trx.description || "",
      debitAccountId: String(trx.debitAccountId),
      creditAccountId: String(trx.creditAccountId),
      amount: String(trx.amount),
    });
    setShowForm(false);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingId || !editForm.debitAccountId || !editForm.creditAccountId || Number(editForm.amount) <= 0) {
      addToast("Lengkapi akun debit, akun kredit, dan nominal (minimal Rp 1) terlebih dahulu.", "error");
      return;
    }
    if (editForm.debitAccountId === editForm.creditAccountId) {
      addToast("Akun Debit dan Akun Kredit tidak boleh sama.", "error");
      return;
    }
    await updateTransaction(editingId, {
      date: editForm.date,
      description: editForm.description,
      debitAccountId: editForm.debitAccountId,
      creditAccountId: editForm.creditAccountId,
      amount: Number(editForm.amount),
    });
    setEditingId(null);
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto animate-fade-in">
      <PageHeader
        title="Manajemen Transaksi"
        description={
          isTeller
            ? "Catat jurnal double-entry. Transaksi yang diajukan memerlukan persetujuan Manager sebelum dibukukan."
            : "Daftar jurnal double-entry perusahaan."
        }
        icon={ArrowRightLeft}
        action={
          isTeller && !editingId && (
            <Btn onClick={() => setShowForm(v => !v)} variant={showForm ? "secondary" : "primary"}>
              {showForm ? <><X className="w-4 h-4" /> Tutup</> : <><Plus className="w-4 h-4" /> Input Transaksi</>}
            </Btn>
          )
        }
      />

      {/* ── Form Input Baru ─────────────────────────────── */}
      {showForm && isTeller && (
        <Card className="p-6 border-indigo-200 shadow-md animate-slide-in-up">
          <h2 className="text-base font-bold text-slate-800 mb-5">Jurnal Transaksi Baru</h2>
          <form onSubmit={handleSubmit} className="space-y-5">
            <TrxFormFields form={form} setForm={setForm} accounts={leafAccounts} />
            <div className="flex justify-end pt-2">
              <Btn type="submit" disabled={loading}>
                <Save className="w-4 h-4" /> {loading ? "Menyimpan..." : "Kirim Pengajuan"}
              </Btn>
            </div>
          </form>
        </Card>
      )}

      {/* ── Form Edit ───────────────────────────────────── */}
      {editingId && isTeller && (
        <Card className="p-6 border-amber-300 bg-amber-50/40 shadow-md animate-slide-in-up">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-base font-bold text-slate-800">Edit Transaksi</h2>
            <button onClick={() => setEditingId(null)} className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100 transition-colors">
              <X className="w-4 h-4" />
            </button>
          </div>
          <form onSubmit={handleUpdate} className="space-y-5">
            <TrxFormFields form={editForm} setForm={setEditForm} accounts={leafAccounts} />
            <div className="flex justify-end gap-3 pt-2">
              <Btn type="button" variant="secondary" onClick={() => setEditingId(null)}>Batal</Btn>
              <Btn type="submit" disabled={loading}>
                <Save className="w-4 h-4" /> {loading ? "Menyimpan..." : "Simpan Perubahan"}
              </Btn>
            </div>
          </form>
        </Card>
      )}

      {/* ── Section 1: Menunggu Persetujuan Manager ─────── */}
      {(isTeller || pendingTrxs.length > 0) && (
        <EditableTrxSection
          title="Menunggu Persetujuan Manager"
          icon={Clock}
          theme="amber"
          trxs={pendingTrxs}
          emptyMessage="Tidak ada transaksi yang menunggu persetujuan."
          accounts={accounts}
          isTeller={isTeller}
          editingId={editingId}
          onEdit={handleStartEdit}
          onDelete={deleteTransaction}
          showRejectionReason={false}
        />
      )}

      {/* ── Section 1.5: Ditolak — Perlu Diperbaiki ──────── */}
      {(isTeller || rejectedTrxs.length > 0) && (
        <EditableTrxSection
          title="Ditolak — Perlu Diperbaiki"
          icon={XCircle}
          theme="rose"
          trxs={rejectedTrxs}
          emptyMessage="Tidak ada transaksi yang ditolak."
          accounts={accounts}
          isTeller={isTeller}
          editingId={editingId}
          onEdit={handleStartEdit}
          onDelete={deleteTransaction}
          showRejectionReason
        />
      )}

      {/* ── Section 2: Transaksi Disetujui ──────────────── */}
      <section className="space-y-2">
        <div className="flex items-center gap-2 px-1">
          <CheckCircle2 className="w-4 h-4 text-emerald-500" />
          <span className="text-xs font-bold text-emerald-700 uppercase tracking-widest">Transaksi Disetujui / Jurnal</span>
          {postedTrxs.length > 0 && (
            <span className="text-xs font-bold bg-emerald-100 text-emerald-700 border border-emerald-200 px-2 py-0.5 rounded-full">
              {postedTrxs.length}
            </span>
          )}
        </div>
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
                  <th className="px-5 py-3.5 font-bold text-slate-500 text-xs uppercase tracking-wider text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {postedTrxs.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-5 py-10 text-center text-slate-400 text-sm">
                      Belum ada transaksi yang dibukukan.
                    </td>
                  </tr>
                ) : postedTrxs.map(trx => {
                  const dAcc = accounts.find(a => a.id === trx.debitAccountId);
                  const cAcc = accounts.find(a => a.id === trx.creditAccountId);
                  const status = trx.status || "POSTED";
                  return (
                    <tr key={trx.id} className="hover:bg-slate-50/50 transition-colors">
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
                      <td className="px-5 py-3 text-center"><StatusBadge status={status} /></td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </Card>
      </section>
    </div>
  );
}

// ── Sub-components ───────────────────────────────────────────────────

const TRX_SECTION_THEME = {
  amber: {
    label: "text-amber-700", badge: "bg-amber-100 text-amber-700 border-amber-200",
    cardBorder: "border-amber-100", theadBg: "bg-amber-50/70 border-b border-amber-100",
    rowDivide: "divide-amber-50", rowEditing: "bg-amber-100/50", rowHover: "hover:bg-amber-50/40",
    icon: "text-amber-500",
  },
  rose: {
    label: "text-rose-700", badge: "bg-rose-100 text-rose-700 border-rose-200",
    cardBorder: "border-rose-100", theadBg: "bg-rose-50/70 border-b border-rose-100",
    rowDivide: "divide-rose-50", rowEditing: "bg-rose-100/50", rowHover: "hover:bg-rose-50/40",
    icon: "text-rose-500",
  },
} as const;

function EditableTrxSection({
  title, icon: Icon, theme, trxs, emptyMessage, accounts, isTeller, editingId, onEdit, onDelete, showRejectionReason,
}: {
  title: string;
  icon: React.ComponentType<{ className?: string }>;
  theme: keyof typeof TRX_SECTION_THEME;
  trxs: any[];
  emptyMessage: string;
  accounts: any[];
  isTeller: boolean;
  editingId: string | null;
  onEdit: (trx: any) => void;
  onDelete: (id: string) => void;
  showRejectionReason: boolean;
}) {
  const t = TRX_SECTION_THEME[theme];
  return (
    <section className="space-y-2">
      <div className="flex items-center gap-2 px-1">
        <Icon className={`w-4 h-4 ${t.icon}`} />
        <span className={`text-xs font-bold uppercase tracking-widest ${t.label}`}>{title}</span>
        {trxs.length > 0 && (
          <span className={`text-xs font-bold border px-2 py-0.5 rounded-full ${t.badge}`}>
            {trxs.length}
          </span>
        )}
      </div>
      <Card className={`overflow-hidden ${t.cardBorder}`}>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className={t.theadBg}>
              <tr>
                <th className="px-5 py-3.5 font-bold text-slate-500 text-xs uppercase tracking-wider">Tanggal</th>
                <th className="px-5 py-3.5 font-bold text-slate-500 text-xs uppercase tracking-wider">Keterangan</th>
                <th className="px-5 py-3.5 font-bold text-emerald-600 text-xs uppercase tracking-wider">Debit</th>
                <th className="px-5 py-3.5 font-bold text-rose-600 text-xs uppercase tracking-wider">Kredit</th>
                <th className="px-5 py-3.5 font-bold text-slate-500 text-xs uppercase tracking-wider text-right">Nominal</th>
                <th className="px-5 py-3.5 font-bold text-slate-500 text-xs uppercase tracking-wider text-center">Status</th>
                {isTeller && <th className="px-3 py-3.5 w-20" />}
              </tr>
            </thead>
            <tbody className={`divide-y ${t.rowDivide}`}>
              {trxs.length === 0 ? (
                <tr>
                  <td colSpan={isTeller ? 7 : 6} className="px-5 py-10 text-center text-slate-400 text-sm">
                    {emptyMessage}
                  </td>
                </tr>
              ) : trxs.map(trx => {
                const dAcc = accounts.find(a => a.id === trx.debitAccountId);
                const cAcc = accounts.find(a => a.id === trx.creditAccountId);
                const status = trx.status || "PENDING";
                const isBeingEdited = editingId === String(trx.id);
                return (
                  <tr key={trx.id} className={`transition-colors group ${isBeingEdited ? t.rowEditing : t.rowHover}`}>
                    <td className="px-5 py-3 text-slate-500">{new Date(trx.date).toLocaleDateString("id-ID")}</td>
                    <td className="px-5 py-3 max-w-xs">
                      <p className="font-medium text-slate-800 truncate">{trx.description}</p>
                      {showRejectionReason && trx.rejectionReason && (
                        <p className="text-xs text-rose-600 mt-0.5 flex items-start gap-1">
                          <span className="font-bold shrink-0">Alasan:</span>
                          <span className="italic">{trx.rejectionReason}</span>
                        </p>
                      )}
                    </td>
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
                    <td className="px-5 py-3 text-center"><StatusBadge status={status} /></td>
                    {isTeller && (
                      <td className="px-3 py-3">
                        <div className="flex items-center justify-center gap-1 opacity-0 group-hover:opacity-100 transition-all">
                          <button
                            onClick={() => onEdit(trx)}
                            className="p-1.5 text-slate-300 hover:text-indigo-500 hover:bg-indigo-50 rounded-lg transition-all"
                            title="Edit"
                          >
                            <Pencil className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => onDelete(String(trx.id))}
                            className="p-1.5 text-slate-300 hover:text-rose-500 hover:bg-rose-50 rounded-lg transition-all"
                            title="Hapus"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    )}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>
    </section>
  );
}

interface FormState {
  date: string;
  description: string;
  debitAccountId: string;
  creditAccountId: string;
  amount: string;
}

function TrxFormFields({ form, setForm, accounts }: { form: FormState; setForm: (f: FormState) => void; accounts: any[] }) {
  // Hanya akun daun (tanpa anak) yang boleh menerima transaksi — akun induk
  // hanya rangkuman saldo anak-anaknya dan tidak boleh diposting langsung.
  const leafAccounts = accounts.filter(a => !accounts.some(other => other.parentId === a.id));

  return (
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
          {leafAccounts.map(a => <option key={a.id} value={a.id}>{a.code} — {a.name}</option>)}
        </select>
      </Field>
      <Field label="Akun Kredit" labelColor="text-rose-600">
        <select required value={form.creditAccountId} onChange={e => setForm({ ...form, creditAccountId: e.target.value })} className="input-base bg-rose-50/50 focus:ring-rose-500">
          <option value="">— Pilih Akun Kredit —</option>
          {leafAccounts.map(a => <option key={a.id} value={a.id}>{a.code} — {a.name}</option>)}
        </select>
      </Field>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const s = status.toUpperCase();
  if (s === "POSTED" || s === "APPROVED") return (
    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800 border border-emerald-200">POSTED</span>
  );
  if (s === "PENDING") return (
    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-800 border border-amber-200">PENDING</span>
  );
  if (s === "REJECTED") return (
    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-rose-100 text-rose-800 border border-rose-200">DITOLAK</span>
  );
  return (
    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-800 border border-slate-200">{s}</span>
  );
}

function Field({ label, labelColor = "text-slate-700", span, children }: { label: string; labelColor?: string; span?: number; children: React.ReactNode }) {
  return (
    <div className={span === 2 ? "md:col-span-2" : ""}>
      <label className={`block text-sm font-bold mb-1.5 ${labelColor}`}>{label}</label>
      {children}
    </div>
  );
}

function today() { return new Date().toISOString().split("T")[0]; }
