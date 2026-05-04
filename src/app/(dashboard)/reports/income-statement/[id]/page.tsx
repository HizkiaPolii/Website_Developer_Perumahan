'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { 
  ArrowLeft, 
  Download, 
  Printer, 
  FileText,
  Calendar,
  Building2,
  CheckCircle2,
  Clock,
  TrendingUp,
  PieChart
} from 'lucide-react';
import { useFinancialReports } from '@/hooks/useApiEndpoints';
import { useToast } from '@/contexts/ToastContext';
import { formatCurrency, formatDate } from '@/utils/financial-constants';

interface IncomeItem {
  id: number;
  accountCode: string;
  accountName: string;
  balance: number;
  level: number;
  parentId: number | null;
}

interface TreeNode extends IncomeItem {
  children: TreeNode[];
}

export default function IncomeStatementViewPage() {
  const { id } = useParams() as { id: string };
  const router = useRouter();
  const { getById, getIncomeItems } = useFinancialReports();
  const { addToast } = useToast();

  const [report, setReport] = useState<any>(null);
  const [items, setItems] = useState<IncomeItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const [reportData, itemsData] = await Promise.all([
          getById(parseInt(id)),
          getIncomeItems(parseInt(id))
        ]);
        if (reportData) setReport(reportData);
        if (itemsData) setItems(itemsData);
      } catch (err) {
        addToast('Gagal memuat data', 'error');
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [id, getById, getIncomeItems, addToast]);

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

  const stats = useMemo(() => {
    const calculateSum = (node: TreeNode): number => {
      if (node.children.length === 0) return Number(node.balance);
      return node.children.reduce((acc, child) => acc + calculateSum(child), 0);
    };

    let revenue = 0, expense = 0;
    treeData.forEach(root => {
      const sum = calculateSum(root);
      if (root.accountCode.startsWith('1')) revenue += sum;
      else expense += Math.abs(sum);
    });
    return { revenue, expense, netProfit: revenue - expense };
  }, [treeData]);

  const RenderNode = ({ node, depth }: { node: TreeNode, depth: number }) => {
    const hasChildren = node.children.length > 0;
    const calculateSum = (children: TreeNode[]): number => {
      return children.reduce((acc, child) => {
        if (child.children.length > 0) return acc + calculateSum(child.children);
        return acc + Number(child.balance);
      }, 0);
    };
    const displayBalance = hasChildren ? calculateSum(node.children) : Number(node.balance);

    return (
      <React.Fragment>
        <tr className={`border-b border-gray-100 transition-colors hover:bg-gray-50/50 ${depth <= 2 ? 'font-black' : 'font-medium'}`}>
          <td className="py-3 px-8">
            <div className="flex items-center gap-3" style={{ paddingLeft: `${(depth - 1) * 2}rem` }}>
              <span className="text-[10px] font-mono text-black/40 w-16">{node.accountCode}</span>
              <span className={`uppercase tracking-tight text-black ${depth === 1 ? 'text-sm' : 'text-xs'}`}>
                {node.accountName}
              </span>
            </div>
          </td>
          <td className="py-3 px-8 text-right font-mono text-xs text-black font-bold">
            {depth <= 2 ? (
              // Level 1 & 2: BLANK BALANCE
              <span></span>
            ) : (
              formatCurrency(displayBalance)
            )}
          </td>
        </tr>
        {node.children.map(child => <RenderNode key={child.id} node={child} depth={depth + 1} />)}
      </React.Fragment>
    );
  };

  if (loading) return null;

  return (
    <div className="max-w-4xl mx-auto w-full pb-24 print:p-0 animate-in fade-in duration-500">
      {/* Header Actions */}
      <div className="flex items-center justify-between gap-6 mb-8 bg-white p-6 rounded-3xl border border-gray-100 shadow-sm print:hidden">
        <button onClick={() => router.back()} className="p-2.5 bg-gray-50 text-black rounded-xl hover:bg-gray-100">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div className="flex items-center gap-2">
          <button onClick={() => window.print()} className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 text-black rounded-xl text-sm font-bold">
            <Printer className="w-4 h-4" /> Cetak
          </button>
          <button className="flex items-center gap-2 px-5 py-2 bg-black text-white rounded-xl text-sm font-black shadow-lg shadow-gray-200">
            <Download className="w-4 h-4" /> Excel
          </button>
        </div>
      </div>

      {/* Main Document */}
      <div className="bg-white border border-gray-200 shadow-xl rounded-none overflow-hidden print:border-none print:shadow-none">
        <div className="p-12 text-center border-b border-gray-100">
          <h2 className="text-sm font-black text-black uppercase tracking-widest mb-1">PT. PERUSAHAAN ANDA</h2>
          <h3 className="text-lg font-black text-black uppercase tracking-tight mb-1">Laporan Laba Rugi (Income Statement)</h3>
          <p className="text-xs text-black font-bold">
            Periode: {report?.periodStart ? formatDate(report.periodStart) : '-'} s/d {report?.periodEnd ? formatDate(report.periodEnd) : '-'}
          </p>
        </div>

        {/* Highlights */}
        <div className="grid grid-cols-3 border-b border-black">
          <div className="p-8 border-r border-gray-100 bg-gray-50/20 text-center">
            <p className="text-[10px] font-black text-black/40 uppercase tracking-widest mb-1">Total Pendapatan</p>
            <p className="text-xl font-black text-black">{formatCurrency(stats.revenue)}</p>
          </div>
          <div className="p-8 border-r border-gray-100 bg-gray-50/20 text-center">
            <p className="text-[10px] font-black text-black/40 uppercase tracking-widest mb-1">Total Beban</p>
            <p className="text-xl font-black text-black">{formatCurrency(stats.expense)}</p>
          </div>
          <div className={`p-8 text-center ${stats.netProfit >= 0 ? 'bg-indigo-50/30' : 'bg-rose-50/30'}`}>
            <p className="text-[10px] font-black text-black/40 uppercase tracking-widest mb-1">Laba (Rugi) Bersih</p>
            <p className="text-xl font-black text-black">{formatCurrency(stats.netProfit)}</p>
          </div>
        </div>

        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-200">
              <th className="text-left py-2 px-8 text-[10px] font-black text-black uppercase tracking-widest">Rincian Laba Rugi</th>
              <th className="text-right py-2 px-8 text-[10px] font-black text-black uppercase tracking-widest">Saldo</th>
            </tr>
          </thead>
          <tbody>
            {treeData.map(node => (
              <RenderNode key={node.id} node={node} depth={1} />
            ))}
            
            {/* Net Profit Row */}
            <tr className={`border-t-4 border-double ${stats.netProfit >= 0 ? 'border-indigo-600 bg-indigo-50/30' : 'border-rose-600 bg-rose-50/30'}`}>
              <td className="py-6 px-8">
                <span className="text-sm font-black text-black uppercase tracking-tight">
                  Laba (Rugi) Bersih Periode Berjalan
                </span>
              </td>
              <td className="py-6 px-8 text-right">
                <span className="text-lg font-black text-black">
                  {formatCurrency(stats.netProfit)}
                </span>
              </td>
            </tr>
          </tbody>
        </table>

        {/* Signatures */}
        <div className="mt-20 p-12 grid grid-cols-2 gap-20">
          <div className="text-center">
            <p className="text-[10px] font-black text-black/40 uppercase tracking-widest mb-16">Disusun Oleh,</p>
            <div className="border-b border-black w-40 mx-auto mb-1"></div>
            <p className="text-[10px] font-black text-black uppercase tracking-widest italic">{report?.creator?.name || 'Finance'}</p>
          </div>
          <div className="text-center">
            <p className="text-[10px] font-black text-black/40 uppercase tracking-widest mb-16">Disetujui Oleh,</p>
            <div className="border-b border-black w-40 mx-auto mb-1"></div>
            <p className="text-[10px] font-black text-black uppercase tracking-widest italic">{report?.finalizer?.name || 'Management'}</p>
          </div>
        </div>

        <div className="bg-gray-50 p-6 text-center text-[9px] font-black text-black/20 uppercase tracking-[0.4em]">
          E-Generated Financial Report - {new Date().toLocaleDateString()}
        </div>
      </div>
    </div>
  );
}
