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
  Clock
} from 'lucide-react';
import { useFinancialReports } from '@/hooks/useApiEndpoints';
import { useToast } from '@/contexts/ToastContext';
import { formatCurrency, formatDate } from '@/utils/financial-constants';

interface BalanceItem {
  id: number;
  accountCode: string;
  accountName: string;
  balance: number;
  level: number;
  parentId: number | null;
}

interface TreeNode extends BalanceItem {
  children: TreeNode[];
}

export default function BalanceSheetViewPage() {
  const { id } = useParams() as { id: string };
  const router = useRouter();
  const { getById, getItems } = useFinancialReports();
  const { addToast } = useToast();

  const [report, setReport] = useState<any>(null);
  const [items, setItems] = useState<BalanceItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
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
    };
    loadData();
  }, [id, getById, getItems, addToast]);

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

  const totals = useMemo(() => {
    const calculateSubtree = (node: TreeNode): number => {
      if (node.children.length === 0) return Number(node.balance);
      return node.children.reduce((sum, child) => sum + calculateSubtree(child), 0);
    };

    let assetTotal = 0, liabilityTotal = 0, equityTotal = 0;
    treeData.forEach(root => {
      const total = calculateSubtree(root);
      if (root.accountCode.startsWith('1')) assetTotal += total;
      else if (root.accountCode.startsWith('2')) liabilityTotal += total;
      else if (root.accountCode.startsWith('3')) equityTotal += total;
    });
    return { assetTotal, liabilityTotal, equityTotal, totalLE: liabilityTotal + equityTotal };
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
              <span className="text-[10px] font-mono text-black w-16 opacity-50">{node.accountCode}</span>
              <span className={`uppercase tracking-tight text-black ${depth === 1 ? 'text-sm' : 'text-xs'}`}>
                {node.accountName}
              </span>
            </div>
          </td>
          <td className="py-3 px-8 text-right font-mono text-xs text-black font-bold">
            {depth <= 2 ? (
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
          <h3 className="text-lg font-black text-black uppercase tracking-tight mb-1">Laporan Neraca (BS)</h3>
          <p className="text-xs text-black font-bold">
            Periode s.d {report?.periodEnd ? new Date(report.periodEnd).toLocaleDateString('id-ID', { day: '2-digit', month: 'long', year: 'numeric' }) : '-'}
          </p>
        </div>

        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-200">
              <th className="text-left py-2 px-8 text-[10px] font-black text-black uppercase tracking-widest">Akun</th>
              <th className="text-right py-2 px-8 text-[10px] font-black text-black uppercase tracking-widest">Saldo</th>
            </tr>
          </thead>
          <tbody>
            {treeData.map((root, index) => {
              const nextRoot = treeData[index + 1];
              const isLastOfCategory = !nextRoot || nextRoot.accountCode[0] !== root.accountCode[0];

              return (
                <React.Fragment key={root.id}>
                  <RenderNode node={root} depth={1} />
                  
                  {isLastOfCategory && root.accountCode.startsWith('1') && (
                    <tr className="bg-gray-50 font-black border-b border-gray-900">
                      <td className="py-4 px-8 text-right text-[10px] uppercase tracking-widest text-black">TOTAL ASET</td>
                      <td className="py-4 px-8 text-right font-mono text-xs text-black border-t-2 border-black">
                        {formatCurrency(totals.assetTotal)}
                      </td>
                    </tr>
                  )}

                  {isLastOfCategory && root.accountCode.startsWith('2') && (
                    <tr className="bg-gray-50 font-black border-b border-gray-200">
                      <td className="py-4 px-8 text-right text-[10px] uppercase tracking-widest text-black">TOTAL KEWAJIBAN</td>
                      <td className="py-4 px-8 text-right font-mono text-xs text-black border-t border-black">
                        {formatCurrency(totals.liabilityTotal)}
                      </td>
                    </tr>
                  )}

                  {isLastOfCategory && root.accountCode.startsWith('3') && (
                    <>
                      <tr className="bg-gray-50 font-black border-b border-gray-200">
                        <td className="py-4 px-8 text-right text-[10px] uppercase tracking-widest text-black">TOTAL EKUITAS</td>
                        <td className="py-4 px-8 text-right font-mono text-xs text-black border-t border-black">
                          {formatCurrency(totals.equityTotal)}
                        </td>
                      </tr>
                      <tr className="bg-gray-100 font-black border-b-4 border-double border-black">
                        <td className="py-5 px-8 text-right text-[11px] uppercase tracking-[0.1em] text-black">TOTAL KEWAJIBAN DAN MODAL</td>
                        <td className="py-5 px-8 text-right font-mono text-sm text-black font-black">
                          {formatCurrency(totals.totalLE)}
                        </td>
                      </tr>
                    </>
                  )}
                </React.Fragment>
              );
            })}
          </tbody>
        </table>

        {/* Footer */}
        <div className="p-12 flex justify-between items-center bg-gray-50/30">
          <div className="flex items-center gap-10">
            <div className="flex flex-col">
              <span className="text-[9px] font-black text-black/40 uppercase tracking-widest">Disusun Oleh</span>
              <span className="text-xs font-black text-black mt-1 uppercase">{report?.creator?.name || 'Finance'}</span>
            </div>
            <div className="flex flex-col border-l border-gray-200 pl-10">
              <span className="text-[9px] font-black text-black/40 uppercase tracking-widest">Status Laporan</span>
              <span className="text-xs font-black text-black mt-1 uppercase tracking-tighter italic">{report?.status || 'DRAFT'}</span>
            </div>
          </div>
          <div className="text-right text-[9px] font-black text-black/20 uppercase tracking-[0.4em] italic">
            Official Document
          </div>
        </div>
      </div>
    </div>
  );
}
