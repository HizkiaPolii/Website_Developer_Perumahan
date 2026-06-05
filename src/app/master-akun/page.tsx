"use client";

import { useState } from "react";
import { useAccountingStore } from "@/hooks/useAccountingStore";
import { AccountType, generateAccountCode, formatIDR } from "@/lib/accounting";
import { PageHeader, Card, Btn } from "@/components/finance-ui";
import { Layers, Plus, Save, X, ChevronRight, ChevronDown, Trash2 } from "lucide-react";

export default function MasterAkunPage() {
  const { accounts, transactions, reports, addAccount, deleteAccount, ready } = useAccountingStore();
  const [showForm, setShowForm] = useState(false);
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});
  const [form, setForm] = useState({ name: "", type: "aset" as AccountType, parentId: "", isCash: false, isDrawing: false, isFixedAsset: false });

  if (!ready) return null;

  const { balances } = reports;

  // ── Tree building ────────────────────────────────────────────────
  const childrenOf = (pid: string | null) =>
    accounts.filter(a => a.parentId === pid).sort((a, b) => a.code.localeCompare(b.code));

  const roots = childrenOf(null);

  const toggle = (id: string) => setExpanded(p => ({ ...p, [id]: !p[id] }));
  const isExp = (id: string) => expanded[id] !== false; // default open

  // ── Computed new code ────────────────────────────────────────────
  const parentIdForForm = form.parentId || null;
  const effectiveType: AccountType = parentIdForForm
    ? (accounts.find(a => a.id === parentIdForForm)?.type ?? form.type)
    : form.type;
  const previewCode = generateAccountCode(accounts, effectiveType, parentIdForForm);

  // ── Submit ───────────────────────────────────────────────────────
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim()) return;

    const parent = parentIdForForm ? accounts.find(a => a.id === parentIdForForm) : null;
    const finalIsCash = parent ? parent.isCash : form.isCash;
    const finalIsDrawing = parent ? parent.isDrawing : form.isDrawing;
    const finalIsFixedAsset = parent ? (parent.isFixedAsset || false) : form.isFixedAsset;

    addAccount({
      id: `acc-${Date.now()}`,
      code: previewCode,
      name: form.name.trim(),
      type: effectiveType,
      parentId: parentIdForForm,
      isCash: finalIsCash,
      isDrawing: finalIsDrawing,
      isFixedAsset: finalIsFixedAsset,
    });

    setForm({ name: "", type: "aset", parentId: "", isCash: false, isDrawing: false, isFixedAsset: false });
    setShowForm(false);
  };

  // ── Colors ───────────────────────────────────────────────────────
  const typeColor: Record<string, string> = {
    aset: "bg-emerald-100 text-emerald-700",
    kewajiban: "bg-rose-100 text-rose-700",
    modal: "bg-purple-100 text-purple-700",
    pendapatan: "bg-indigo-100 text-indigo-700",
    beban: "bg-orange-100 text-orange-700",
  };

  // ── Render tree ──────────────────────────────────────────────────
  const renderTree = (nodes: ReturnType<typeof childrenOf>, level: number) =>
    nodes.map(node => {
      const kids = childrenOf(node.id);
      const hasKids = kids.length > 0;
      const open = isExp(node.id);

      return (
        <div key={node.id}>
          <div
            className={`flex items-center justify-between py-2.5 px-4 border-b border-slate-100 hover:bg-slate-50 transition-colors group ${level === 0 ? "bg-slate-50/50" : ""}`}
            style={{ paddingLeft: `${level * 1.5 + 1}rem` }}
          >
            <div className="flex items-center gap-2 min-w-0">
              {hasKids ? (
                <button onClick={() => toggle(node.id)} className="p-0.5 text-slate-400 hover:text-slate-700 shrink-0">
                  {open ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                </button>
              ) : <span className="w-5 shrink-0" />}
              <span className={`font-mono text-xs shrink-0 ${level === 0 ? "font-bold text-slate-700" : "text-slate-500"}`}>{node.code}</span>
              <span className={`truncate ${level === 0 ? "font-bold text-slate-800" : "font-medium text-slate-700"}`}>{node.name}</span>
              {node.isCash && <span className="text-[9px] font-bold px-1.5 py-0.5 bg-blue-100 text-blue-700 rounded shrink-0">KAS</span>}
              {node.isDrawing && <span className="text-[9px] font-bold px-1.5 py-0.5 bg-amber-100 text-amber-700 rounded shrink-0">PRIVE</span>}
              {node.isFixedAsset && <span className="text-[9px] font-bold px-1.5 py-0.5 bg-violet-100 text-violet-700 rounded shrink-0">ASET TETAP</span>}
            </div>
            <div className="flex items-center gap-4 shrink-0">
              <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded ${typeColor[node.type] || "bg-slate-100 text-slate-600"}`}>
                {node.type}
              </span>
              <span className="font-bold text-slate-800 w-36 text-right text-sm tabular-nums">{formatIDR(balances[node.id] || 0)}</span>
              <button
                onClick={() => deleteAccount(node.id)}
                className="p-1 text-slate-300 hover:text-rose-500 hover:bg-rose-50 rounded opacity-0 group-hover:opacity-100 transition-all"
                title="Hapus akun"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
          {hasKids && open && renderTree(kids, level + 1)}
        </div>
      );
    });

  // ── Available parents for dropdown ───────────────────────────────
  const availableParents = form.parentId
    ? accounts // If already picked, show all so they can clear
    : accounts.filter(a => !form.type || a.type === form.type);

  return (
    <div className="space-y-6 max-w-6xl mx-auto animate-fade-in">
      <PageHeader
        title="Master Akun (Chart of Accounts)"
        description="Kelola bagan akun dengan sub-akun bertingkat. Kode akun otomatis. Saldo parent = roll-up sub akun."
        icon={Layers}
        action={
          <Btn onClick={() => setShowForm(!showForm)} variant={showForm ? "secondary" : "primary"}>
            {showForm ? <><X className="w-4 h-4" /> Tutup</> : <><Plus className="w-4 h-4" /> Tambah Akun</>}
          </Btn>
        }
      />

      {showForm && (
        <Card className="p-6 border-indigo-200 shadow-md animate-slide-in-up">
          <h2 className="text-lg font-bold text-slate-800 mb-5">Form Tambah Akun / Sub-Akun</h2>
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1.5">Nama Akun</label>
                <input type="text" required value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} className="input-base" placeholder="Contoh: Bank Danamon" />
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1.5">Induk Akun (Opsional)</label>
                <select value={form.parentId} onChange={e => setForm({ ...form, parentId: e.target.value })} className="input-base text-sm">
                  <option value="">— Akun Induk (Root) —</option>
                  {availableParents.sort((a, b) => a.code.localeCompare(b.code)).map(a => (
                    <option key={a.id} value={a.id}>{a.code} — {a.name} ({a.type})</option>
                  ))}
                </select>
                <p className="text-xs text-slate-400 mt-1">Jika diisi, tipe/kas/prive akan diwariskan dari induk.</p>
              </div>
              {!form.parentId && (
                <>
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-1.5">Tipe Akun</label>
                    <select value={form.type} onChange={e => setForm({ ...form, type: e.target.value as AccountType })} className="input-base">
                      <option value="aset">Aset</option>
                      <option value="kewajiban">Kewajiban</option>
                      <option value="modal">Modal (Ekuitas)</option>
                      <option value="pendapatan">Pendapatan</option>
                      <option value="beban">Beban</option>
                    </select>
                  </div>
                  <div className="flex items-center gap-6 pt-5">
                    <label className="flex items-center gap-2 text-sm font-medium text-slate-700 cursor-pointer select-none">
                      <input type="checkbox" checked={form.isCash} onChange={e => setForm({ ...form, isCash: e.target.checked })} className="w-4 h-4 rounded text-indigo-600" />
                      Kas / Bank
                    </label>
                    <label className="flex items-center gap-2 text-sm font-medium text-slate-700 cursor-pointer select-none">
                      <input type="checkbox" checked={form.isDrawing} onChange={e => setForm({ ...form, isDrawing: e.target.checked })} className="w-4 h-4 rounded text-indigo-600" />
                      Prive
                    </label>
                    {form.type === 'aset' && (
                      <label className="flex items-center gap-2 text-sm font-medium text-slate-700 cursor-pointer select-none">
                        <input type="checkbox" checked={form.isFixedAsset} onChange={e => setForm({ ...form, isFixedAsset: e.target.checked })} className="w-4 h-4 rounded text-indigo-600" />
                        Aset Tetap
                      </label>
                    )}
                  </div>
                </>
              )}
            </div>

            {/* Preview */}
            <div className="bg-slate-50 rounded-xl p-4 border border-slate-100 flex items-center gap-4 text-sm">
              <span className="text-slate-500 font-medium">Kode Otomatis:</span>
              <span className="font-mono font-bold text-indigo-700 text-lg">{previewCode}</span>
              <span className="text-slate-400">|</span>
              <span className="text-slate-500">Tipe:</span>
              <span className={`font-bold uppercase text-xs px-2 py-0.5 rounded ${typeColor[effectiveType]}`}>{effectiveType}</span>
            </div>

            <div className="flex justify-end pt-2">
              <Btn type="submit"><Save className="w-4 h-4" /> Simpan Akun</Btn>
            </div>
          </form>
        </Card>
      )}

      <Card className="overflow-hidden">
        <div className="bg-slate-50 px-5 py-3 border-b border-slate-100 flex justify-between items-center">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Kode & Nama Akun</span>
          <div className="flex gap-14 text-xs font-bold text-slate-500 uppercase tracking-wider">
            <span>Tipe</span>
            <span className="w-36 text-right">Saldo</span>
            <span className="w-5" />
          </div>
        </div>
        {renderTree(roots, 0)}
        {roots.length === 0 && (
          <div className="px-5 py-10 text-center text-slate-400">Belum ada master akun.</div>
        )}
      </Card>
    </div>
  );
}
