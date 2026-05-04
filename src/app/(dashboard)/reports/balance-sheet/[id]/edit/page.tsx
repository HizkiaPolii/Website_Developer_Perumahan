'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { 
  Save, 
  ArrowLeft, 
  Plus, 
  Trash2, 
  RefreshCcw, 
  ChevronRight, 
  ChevronDown,
  Info,
  ShieldCheck,
  Briefcase,
  Wallet,
  CheckCircle2,
  AlertCircle,
  Lock,
  Minus
} from 'lucide-react';
import { useFinancialReports } from '@/hooks/useApiEndpoints';
import { useToast } from '@/contexts/ToastContext';
import { useAuth } from '@/contexts/AuthContext';

// --- TYPES ---
interface BalanceItem {
  id: number;
  reportId: number;
  accountCode: string;
  accountName: string;
  balance: number;
  level: number;
  parentId: number | null;
  isParent: boolean;
}

interface TreeNode extends BalanceItem {
  children: TreeNode[];
}

// --- SUB-COMPONENT ---
const TreeRow = ({ 
  node, 
  depth, 
  onUpdate, 
  onAddSub, 
  onDelete 
}: { 
  node: TreeNode; 
  depth: number; 
  onUpdate: (id: number, updates: any) => void;
  onAddSub: (node: TreeNode) => void;
  onDelete: (id: number) => void;
}) => {
  const [isExpanded, setIsExpanded] = useState(true);
  const [localName, setLocalName] = useState(node.accountName);
  const [localBalance, setLocalBalance] = useState(node.balance.toString());

  useEffect(() => {
    setLocalName(node.accountName);
  }, [node.accountName]);

  useEffect(() => {
    setLocalBalance(node.balance.toString());
  }, [node.balance]);

  const hasChildren = node.children.length > 0;

  // Calculate sum logic
  const calculatedBalance = useMemo(() => {
    if (!hasChildren) return Number(node.balance);
    const sumRecursive = (children: TreeNode[]): number => {
      return children.reduce((acc, child) => {
        if (child.children.length > 0) return acc + sumRecursive(child.children);
        return acc + Number(child.balance);
      }, 0);
    };
    return sumRecursive(node.children);
  }, [node.children, node.balance, hasChildren]);

  const handleBlurName = () => {
    if (localName !== node.accountName) {
      onUpdate(node.id, { accountName: localName });
    }
  };

  const handleBlurBalance = () => {
    const val = parseFloat(localBalance) || 0;
    if (val !== Number(node.balance)) {
      onUpdate(node.id, { balance: val });
    }
  };

  return (
    <>
      <tr className={`group hover:bg-blue-50/30 transition-colors ${depth === 1 ? 'bg-white font-bold' : depth === 2 ? 'bg-gray-50/20 font-bold' : 'text-sm'}`}>
        <td className="py-3 px-6">
          <div className="flex items-center gap-2" style={{ paddingLeft: `${(depth - 1) * 2}rem` }}>
            <button 
              onClick={() => setIsExpanded(!isExpanded)}
              className={`p-1 rounded hover:bg-gray-200 transition-colors ${!hasChildren && 'invisible'}`}
            >
              {isExpanded ? <ChevronDown className="w-4 h-4 text-gray-500" /> : <ChevronRight className="w-4 h-4 text-gray-500" />}
            </button>
            <span className="text-[10px] bg-gray-100 text-gray-400 px-1.5 py-0.5 rounded font-mono font-bold">
              {node.accountCode}
            </span>
            <input 
              type="text"
              value={localName}
              onChange={(e) => setLocalName(e.target.value)}
              onBlur={handleBlurName}
              className={`bg-transparent border-b border-transparent focus:border-blue-400 focus:outline-none py-0.5 w-full text-gray-900 transition-all ${depth <= 2 ? 'uppercase tracking-wider font-black' : 'font-medium'}`}
              placeholder="Nama Akun..."
            />
          </div>
        </td>
        <td className="py-3 px-6">
          <div className="flex items-center justify-end gap-3 min-h-[36px]">
            {depth <= 2 ? (
              // Level 1 & 2: Header only, NO BALANCE SHOWN
              <div className="w-48 text-right opacity-0">-</div>
            ) : (
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[10px] font-bold text-gray-400">IDR</span>
                {hasChildren ? (
                  // Level 3+ with children: Calculated sum
                  <div className="bg-blue-50/50 border border-blue-100 rounded-xl px-9 py-2 text-right w-48 text-blue-700 font-black text-xs shadow-sm">
                    {calculatedBalance.toLocaleString('id-ID')}
                  </div>
                ) : (
                  // Level 3+ leaf: Editable input
                  <input 
                    type="number"
                    value={localBalance}
                    onChange={(e) => setLocalBalance(e.target.value)}
                    onBlur={handleBlurBalance}
                    className="bg-gray-50 border border-gray-100 rounded-xl px-9 py-2 text-right w-48 text-gray-900 font-bold focus:ring-2 focus:ring-blue-500 focus:outline-none transition-all"
                  />
                )}
              </div>
            )}
            <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
              {depth < 5 && (
                <button 
                  onClick={() => onAddSub(node)}
                  className="p-2 text-blue-600 hover:bg-blue-100 rounded-xl transition-colors"
                  title="Tambah Sub-akun"
                >
                  <Plus className="w-4 h-4" />
                </button>
              )}
              <button 
                onClick={() => onDelete(node.id)}
                className="p-2 text-red-600 hover:bg-red-100 rounded-xl transition-colors"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        </td>
      </tr>
      {isExpanded && node.children.map(child => (
        <TreeRow 
          key={child.id} 
          node={child} 
          depth={depth + 1} 
          onUpdate={onUpdate}
          onAddSub={onAddSub}
          onDelete={onDelete}
        />
      ))}
    </>
  );
};

// --- MAIN PAGE ---
export default function EditBalanceSheetPage() {
  const { id } = useParams() as { id: string };
  const router = useRouter();
  const { user } = useAuth();
  const { addToast } = useToast();
  const { getById, getItems, createItem, updateItem, deleteItem, finalize } = useFinancialReports();

  const [report, setReport] = useState<any>(null);
  const [items, setItems] = useState<BalanceItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      const [reportData, itemsData] = await Promise.all([
        getById(parseInt(id)),
        getItems(parseInt(id))
      ]);
      if (reportData) setReport(reportData);
      if (itemsData) setItems(itemsData);
    } catch (err) {
      addToast('Gagal memuat data', 'error');
    } finally {
      setLoading(false);
    }
  }, [id, getById, getItems, addToast]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const treeData = useMemo(() => {
    const itemMap = new Map<number, TreeNode>();
    const roots: TreeNode[] = [];
    items.forEach(item => itemMap.set(item.id, { ...item, children: [] }));
    items.forEach(item => {
      const node = itemMap.get(item.id)!;
      if (item.parentId && itemMap.has(item.parentId)) {
        itemMap.get(item.parentId)!.children.push(node);
      } else {
        roots.push(node);
      }
    });
    const sortNodes = (nodes: TreeNode[]) => {
      nodes.sort((a, b) => a.accountCode.localeCompare(b.accountCode, undefined, { numeric: true }));
      nodes.forEach(node => sortNodes(node.children));
    };
    sortNodes(roots);
    return roots;
  }, [items]);

  const calculations = useMemo(() => {
    const calculateSum = (node: TreeNode): number => {
      if (node.children.length === 0) return Number(node.balance);
      return node.children.reduce((acc, child) => acc + calculateSum(child), 0);
    };

    let assets = 0, liabilities = 0, equity = 0;
    treeData.forEach(root => {
      const sum = calculateSum(root);
      if (root.accountCode.startsWith('1')) assets += sum;
      else if (root.accountCode.startsWith('2')) liabilities += sum;
      else if (root.accountCode.startsWith('3')) equity += sum;
    });

    const isBalanced = Math.abs(assets - (liabilities + equity)) < 1;
    return { assets, liabilities, equity, isBalanced, diff: assets - (liabilities + equity) };
  }, [treeData]);

  const handleUpdateItem = async (itemId: number, updates: Partial<BalanceItem>) => {
    try {
      setItems(prev => prev.map(item => item.id === itemId ? { ...item, ...updates } : item));
      await updateItem(itemId, updates);
    } catch (err) {
      addToast('Gagal menyimpan', 'error');
      loadData();
    }
  };

  const handleAddSubPoint = async (parent: TreeNode) => {
    try {
      const nextSubIndex = parent.children.length + 1;
      const cleanCode = parent.accountCode.replace(/\.00$/, '');
      const newCode = `${cleanCode}.${nextSubIndex.toString().padStart(2, '0')}`;
      
      const created = await createItem({
        reportId: parseInt(id),
        accountCode: newCode,
        accountName: 'Sub-akun Baru',
        balance: 0,
        level: parent.level + 1,
        parentId: parent.id
      });
      if (created) {
        setItems(prev => [...prev, created]);
        addToast(`Sub-akun ${newCode} ditambahkan`, 'success');
      }
    } catch (err) {
      addToast('Gagal menambah', 'error');
    }
  };

  const handleAddRootPoint = async () => {
    try {
      const rootItems = items.filter(item => !item.parentId);
      let nextNum = 1;
      if (rootItems.length > 0) {
        const codes = rootItems.map(item => parseInt(item.accountCode.split('.')[0]) || 0);
        nextNum = Math.max(...codes) + 1;
      }
      const created = await createItem({
        reportId: parseInt(id),
        accountCode: `${nextNum}.0.00`,
        accountName: 'Kategori Utama Baru',
        balance: 0,
        level: 1,
        parentId: null
      });
      if (created) {
        setItems(prev => [...prev, created]);
        addToast(`Poin ${nextNum}.0 ditambahkan`, 'success');
      }
    } catch (err) {
      addToast('Gagal menambah', 'error');
    }
  };

  const handleDeleteItem = async (itemId: number) => {
    if (!confirm('Hapus poin ini?')) return;
    try {
      const success = await deleteItem(itemId);
      if (success) {
        setItems(prev => prev.filter(item => item.id !== itemId));
        addToast('Poin dihapus', 'success');
      }
    } catch (err: any) {
      addToast(err.message || 'Gagal menghapus', 'error');
    }
  };

  const handleFinalize = async () => {
    if (!calculations.isBalanced && !confirm('Neraca BELUM SEIMBANG. Lanjutkan finalisasi?')) return;
    try {
      setIsSaving(true);
      const res = await finalize(parseInt(id), user?.id || 1, 'Neraca telah diperiksa.');
      if (res) {
        addToast('Laporan berhasil difinalisasi', 'success');
        router.push(`/reports/balance-sheet/${id}`);
      }
    } catch (err) {
      addToast('Gagal finalisasi', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  if (loading) return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4 text-blue-600 font-bold">
      <div className="w-12 h-12 border-4 border-blue-100 border-t-blue-600 rounded-full animate-spin"></div>
      <p>Memuat editor...</p>
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto w-full pb-24 px-4 sm:px-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8 bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm mt-6">
        <div className="flex items-center gap-4">
          <button onClick={() => router.back()} className="p-3 bg-gray-50 text-gray-600 rounded-2xl hover:bg-gray-100 transition-all">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-2xl font-black text-gray-900 flex items-center gap-2 tracking-tight">Editor Struktur Neraca</h1>
            <p className="text-gray-500 text-sm mt-0.5">Atur dan lengkapi rincian laporan posisi keuangan Anda</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={loadData} className="flex items-center gap-2 px-6 py-3 bg-gray-50 text-gray-600 rounded-2xl font-bold">
            <RefreshCcw className="w-5 h-5" /> Segarkan
          </button>
          <button onClick={handleFinalize} disabled={isSaving} className="flex items-center gap-2 px-8 py-3 bg-blue-600 text-white rounded-2xl font-black shadow-xl shadow-blue-100">
            {isSaving ? <RefreshCcw className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />} Finalisasi
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-blue-50 rounded-bl-[4rem] -mr-8 -mt-8"></div>
          <Briefcase className="w-8 h-8 text-blue-600 mb-4" />
          <p className="text-sm font-bold text-gray-400 uppercase tracking-widest">Total Aset</p>
          <p className="text-3xl font-black text-gray-900 mt-1">Rp {calculations.assets.toLocaleString('id-ID')}</p>
        </div>
        <div className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-indigo-50 rounded-bl-[4rem] -mr-8 -mt-8"></div>
          <Wallet className="w-8 h-8 text-indigo-600 mb-4" />
          <p className="text-sm font-bold text-gray-400 uppercase tracking-widest">Liabilitas & Ekuitas</p>
          <p className="text-3xl font-black text-gray-900 mt-1">Rp {(calculations.liabilities + calculations.equity).toLocaleString('id-ID')}</p>
        </div>
        <div className={`p-8 rounded-[2.5rem] border shadow-xl transition-all ${calculations.isBalanced ? 'bg-emerald-600 border-emerald-500 text-white shadow-emerald-200' : 'bg-rose-600 border-rose-500 text-white shadow-rose-200'}`}>
          <div className="relative">
            {calculations.isBalanced ? <ShieldCheck className="w-8 h-8 mb-4 opacity-80" /> : <AlertCircle className="w-8 h-8 mb-4 opacity-80" />}
            <p className="text-sm font-bold opacity-70 uppercase tracking-widest">Status Neraca</p>
            <p className="text-3xl font-black mt-1 uppercase tracking-tighter">{calculations.isBalanced ? 'SEIMBANG' : 'TIDAK SEIMBANG'}</p>
          </div>
        </div>
      </div>

      {/* Main Table */}
      <div className="bg-white rounded-[3rem] shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-8 border-b border-gray-50 flex items-center justify-between bg-gray-50/20">
          <div className="flex items-center gap-3">
            <h2 className="text-xl font-black text-gray-900 uppercase tracking-tight">Daftar Akun Neraca</h2>
            <div className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-[10px] font-black uppercase">{items.length} Baris</div>
          </div>
          <p className="text-xs text-gray-500 italic flex items-center gap-2">
            <Info className="w-4 h-4 text-blue-500" />
            Level 1-2 hanya sebagai header. Isi angka pada rincian akun.
          </p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                <th className="text-left py-4 px-8 text-[10px] font-black text-gray-400 uppercase tracking-widest">Deskripsi / Nama Akun</th>
                <th className="text-right py-4 px-8 text-[10px] font-black text-gray-400 uppercase tracking-widest">Nilai Saldo (IDR)</th>
              </tr>
            </thead>
            <tbody>
              {treeData.map(node => (
                <TreeRow 
                  key={node.id} 
                  node={node} 
                  depth={1} 
                  onUpdate={handleUpdateItem} 
                  onAddSub={handleAddSubPoint}
                  onDelete={handleDeleteItem}
                />
              ))}
              <tr>
                <td colSpan={2} className="py-8 px-8 bg-gray-50/30">
                  <button 
                    onClick={handleAddRootPoint}
                    className="flex items-center gap-3 px-8 py-4 bg-white border-2 border-dashed border-gray-200 text-gray-400 rounded-3xl font-black hover:border-blue-400 hover:text-blue-600 transition-all w-full justify-center group shadow-sm active:scale-95"
                  >
                    <Plus className="w-6 h-6 group-hover:rotate-90 transition-transform duration-300" />
                    Tambah Kategori Utama Baru
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
