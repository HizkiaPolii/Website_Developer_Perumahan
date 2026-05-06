'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { 
  Plus, 
  FileText, 
  Eye, 
  Edit, 
  Calendar, 
  Search, 
  Loader,
  Trash2,
  Printer,
  Download,
  ArrowLeft,
  X,
  Save,
  Check,
  Edit2,
  TrendingUp,
  RefreshCw
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/contexts/ToastContext';
import { formatCurrency } from '@/utils/financial-constants';

interface CashFlowItem {
  id: string;
  category: 'OPERATING' | 'INVESTING' | 'FINANCING';
  name: string;
  amount: number;
}

export default function CashFlowReportPage() {
  const router = useRouter();
  const { user, isLoading: isAuthLoading } = useAuth();
  const { addToast } = useToast();

  const [loading, setLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [beginningCash, setBeginningCash] = useState(150000000); // Default Rp 150.000.000 awal
  const [items, setItems] = React.useState<CashFlowItem[]>([]);

  React.useEffect(() => {
    const baseItems: CashFlowItem[] = [
      // Operating Activities
      { id: 'op-1', category: 'OPERATING', name: 'Penerimaan Uang Muka (DP) & Penjualan Unit', amount: 450000000 },
      { id: 'op-2', category: 'OPERATING', name: 'Penerimaan Angsuran Konsumen', amount: 180000000 },
      { id: 'op-3', category: 'OPERATING', name: 'Pembayaran kepada Kontraktor & Pemasok Bahan', amount: -210000000 },
      { id: 'op-4', category: 'OPERATING', name: 'Pembayaran Beban Gaji & Operasional Kantor', amount: -65000000 },
      { id: 'op-5', category: 'OPERATING', name: 'Pembayaran Pajak dan Perizinan Perumahan', amount: -45000000 },
      
      // Investing Activities
      { id: 'inv-1', category: 'INVESTING', name: 'Pembelian Lahan Perluasan Tahap II', amount: -350000000 },
      { id: 'inv-2', category: 'INVESTING', name: 'Pembelian Inventaris Alat Kantor & Lapangan', amount: -25000000 },
      { id: 'inv-3', category: 'INVESTING', name: 'Penerimaan Penjualan Aset Lama', amount: 15000000 },
      
      // Financing Activities
      { id: 'fin-1', category: 'FINANCING', name: 'Penerimaan Setoran Modal Investor', amount: 500000000 },
      { id: 'fin-2', category: 'FINANCING', name: 'Pencairan Pinjaman Bank Mandiri', amount: 300000000 },
      { id: 'fin-3', category: 'FINANCING', name: 'Pembayaran Angsuran Pokok Pinjaman', amount: -120000000 },
    ];

    const storedTxs = JSON.parse(localStorage.getItem('prodev_transactions') || '[]');
    
    storedTxs.forEach((tx: any) => {
      const val = Number(tx.amount);
      if (tx.templateId === 'dp-unit') {
        baseItems[0].amount += val;
      } else if (tx.templateId === 'angsuran') {
        baseItems[1].amount += val;
      } else if (tx.templateId === 'setoran') {
        baseItems[8].amount += val;
      } else if (tx.templateId === 'konstruksi') {
        baseItems[2].amount -= val;
      } else if (tx.templateId === 'gaji') {
        baseItems[3].amount -= val;
      } else if (tx.templateId === 'operasional') {
        baseItems[3].amount -= val;
      }
    });

    setItems(baseItems);
  }, [selectedMonth, selectedYear]);

  const months = [
    'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
    'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
  ];
  const years = Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - 2 + i);

  // Auto-calculated fields
  const operatingTotal = useMemo(() => {
    return items
      .filter(item => item.category === 'OPERATING')
      .reduce((sum, item) => sum + item.amount, 0);
  }, [items]);

  const investingTotal = useMemo(() => {
    return items
      .filter(item => item.category === 'INVESTING')
      .reduce((sum, item) => sum + item.amount, 0);
  }, [items]);

  const financingTotal = useMemo(() => {
    return items
      .filter(item => item.category === 'FINANCING')
      .reduce((sum, item) => sum + item.amount, 0);
  }, [items]);

  const netCashIncrease = useMemo(() => {
    return operatingTotal + investingTotal + financingTotal;
  }, [operatingTotal, investingTotal, financingTotal]);

  const endingCash = useMemo(() => {
    return beginningCash + netCashIncrease;
  }, [beginningCash, netCashIncrease]);

  const handleValueChange = (id: string, value: string) => {
    const numericVal = parseFloat(value) || 0;
    setItems(prev => prev.map(item => item.id === id ? { ...item, amount: numericVal } : item));
  };

  const handleNameChange = (id: string, value: string) => {
    setItems(prev => prev.map(item => item.id === id ? { ...item, name: value } : item));
  };

  const handleAddNewItem = (category: 'OPERATING' | 'INVESTING' | 'FINANCING') => {
    const newItem: CashFlowItem = {
      id: `${category.toLowerCase()}-${Date.now()}`,
      category,
      name: 'Item Transaksi Baru',
      amount: 0
    };
    setItems(prev => [...prev, newItem]);
    addToast('Baris baru berhasil ditambahkan', 'success');
  };

  const handleDeleteItem = (id: string) => {
    setItems(prev => prev.filter(item => item.id !== id));
    addToast('Item berhasil dihapus', 'success');
  };

  const handleSave = () => {
    setIsEditing(false);
    addToast('Draft Laporan Arus Kas berhasil diperbarui', 'success');
  };

  const handleReset = () => {
    if (confirm('Apakah Anda yakin ingin mengatur ulang data arus kas ke default template?')) {
      setBeginningCash(150000000);
      setItems([
        { id: 'op-1', category: 'OPERATING', name: 'Penerimaan Uang Muka (DP) & Penjualan Unit', amount: 450000000 },
        { id: 'op-2', category: 'OPERATING', name: 'Penerimaan Angsuran Konsumen', amount: 180000000 },
        { id: 'op-3', category: 'OPERATING', name: 'Pembayaran kepada Kontraktor & Pemasok Bahan', amount: -210000000 },
        { id: 'op-4', category: 'OPERATING', name: 'Pembayaran Beban Gaji & Operasional Kantor', amount: -65000000 },
        { id: 'op-5', category: 'OPERATING', name: 'Pembayaran Pajak dan Perizinan Perumahan', amount: -45000000 },
        { id: 'inv-1', category: 'INVESTING', name: 'Pembelian Lahan Perluasan Tahap II', amount: -350000000 },
        { id: 'inv-2', category: 'INVESTING', name: 'Pembelian Inventaris Alat Kantor & Lapangan', amount: -25000000 },
        { id: 'inv-3', category: 'INVESTING', name: 'Penerimaan Penjualan Aset Lama', amount: 15000000 },
        { id: 'fin-1', category: 'FINANCING', name: 'Penerimaan Setoran Modal Investor', amount: 500000000 },
        { id: 'fin-2', category: 'FINANCING', name: 'Pencairan Pinjaman Bank Mandiri', amount: 300000000 },
        { id: 'fin-3', category: 'FINANCING', name: 'Pembayaran Angsuran Pokok Pinjaman', amount: -120000000 },
      ]);
      addToast('Data arus kas diatur ulang', 'info');
    }
  };

  if (isAuthLoading || loading) return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
      <div className="w-12 h-12 border-4 border-blue-100 border-t-blue-600 rounded-full animate-spin"></div>
      <p className="text-gray-500 font-medium">Memproses Laporan Arus Kas...</p>
    </div>
  );

  return (
    <div className="max-w-4xl mx-auto w-full pb-24 print:p-0 animate-in fade-in duration-500">
      
      {/* Action Header */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-6 mb-8 bg-white p-6 rounded-3xl border border-gray-100 shadow-sm print:hidden">
        <div className="flex items-center gap-4">
          <div>
            <h1 className="text-xl font-black text-gray-900 uppercase tracking-tight">Laporan Arus Kas</h1>
            <p className="text-xs text-gray-500 italic font-semibold">Statement of Cash Flows</p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {isEditing ? (
            <>
              <button 
                onClick={handleSave}
                className="flex items-center gap-2 px-5 py-2.5 bg-emerald-600 text-white rounded-xl text-xs font-black shadow-lg shadow-emerald-100 hover:bg-emerald-700 transition-all"
              >
                <Save className="w-4 h-4" /> Simpan Perubahan
              </button>
              <button 
                onClick={handleReset}
                className="flex items-center gap-2 px-4 py-2.5 bg-gray-100 text-gray-700 rounded-xl text-xs font-bold hover:bg-gray-200 transition-all"
              >
                <RefreshCw className="w-4 h-4" /> Reset
              </button>
            </>
          ) : (
            <>
              <button 
                onClick={() => setIsEditing(true)}
                className="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 text-white rounded-xl text-xs font-black shadow-lg shadow-indigo-100 hover:bg-indigo-700 transition-all"
              >
                <Edit2 className="w-4 h-4" /> Ubah Data Manual
              </button>
              <button 
                onClick={() => window.print()}
                className="flex items-center gap-2 px-4 py-2.5 bg-white border border-gray-200 text-black rounded-xl text-xs font-bold hover:bg-gray-50 transition-all"
              >
                <Printer className="w-4 h-4" /> Cetak Laporan
              </button>
            </>
          )}
        </div>
      </div>

      {/* Filter Parameters */}
      <div className="bg-white rounded-3xl border border-gray-100 p-6 mb-8 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-6 print:hidden">
        <div className="flex items-center gap-3">
          <Calendar className="w-5 h-5 text-indigo-500" />
          <span className="text-sm font-bold text-gray-900">Periode Pelaporan:</span>
        </div>
        <div className="flex gap-4">
          <select 
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(parseInt(e.target.value))}
            className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm font-bold text-gray-900 cursor-pointer"
          >
            {months.map((month, idx) => (
              <option key={month} value={idx}>{month}</option>
            ))}
          </select>
          <select 
            value={selectedYear}
            onChange={(e) => setSelectedYear(parseInt(e.target.value))}
            className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm font-bold text-gray-900 cursor-pointer"
          >
            {years.map(year => (
              <option key={year} value={year}>{year}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Main Document (Print Friendly) */}
      <div className="bg-white border border-gray-200 shadow-xl rounded-none overflow-hidden print:border-none print:shadow-none animate-in zoom-in-95 duration-300">
        
        {/* Document Letterhead */}
        <div className="p-12 text-center border-b border-gray-100">
          <h2 className="text-sm font-black text-black uppercase tracking-widest mb-1">PT. PRODEV DEVELOPER PERUMAHAN</h2>
          <h3 className="text-lg font-black text-black uppercase tracking-tight mb-1">Laporan Arus Kas</h3>
          <p className="text-xs text-black font-bold">
            Untuk Periode Bulan {months[selectedMonth]} {selectedYear}
          </p>
          <div className="h-[2px] bg-black mx-auto mt-4 w-32" />
        </div>

        {/* Document Content */}
        <div className="p-12 space-y-8">
          
          {/* Beginning Cash Row */}
          <div className="flex justify-between items-center border-b border-gray-900 pb-3">
            <span className="text-xs font-black text-black uppercase tracking-wider">SALDO KAS AWAL PERIODE</span>
            {isEditing ? (
              <input 
                type="number"
                value={beginningCash}
                onChange={(e) => setBeginningCash(parseFloat(e.target.value) || 0)}
                className="font-mono text-xs text-right text-black font-bold border border-gray-300 px-3 py-1.5 rounded-lg w-44 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            ) : (
              <span className="font-mono text-xs text-black font-black">{formatCurrency(beginningCash)}</span>
            )}
          </div>

          {/* SECTION 1: OPERATING ACTIVITIES */}
          <div className="space-y-4">
            <div className="flex justify-between items-center bg-gray-50 py-2 px-4 rounded-lg">
              <span className="text-xs font-black text-black uppercase tracking-wider">1. ARUS KAS DARI AKTIVITAS OPERASIONAL</span>
              {isEditing && (
                <button 
                  onClick={() => handleAddNewItem('OPERATING')}
                  className="flex items-center gap-1 bg-indigo-50 text-indigo-600 hover:bg-indigo-100 px-2.5 py-1 rounded-lg text-[10px] font-black transition-all"
                >
                  <Plus className="w-3 h-3" /> Tambah Baris
                </button>
              )}
            </div>
            
            <table className="w-full">
              <tbody>
                {items.filter(i => i.category === 'OPERATING').map(item => (
                  <tr key={item.id} className="border-b border-gray-100 hover:bg-gray-50/50 transition-colors">
                    <td className="py-2.5 text-xs text-black pl-4">
                      {isEditing ? (
                        <input 
                          type="text" 
                          value={item.name}
                          onChange={(e) => handleNameChange(item.id, e.target.value)}
                          className="w-full text-xs text-black border border-gray-200 px-2 py-1 rounded focus:outline-none focus:ring-1 focus:ring-indigo-500"
                        />
                      ) : (
                        item.name
                      )}
                    </td>
                    <td className="py-2.5 text-right font-mono text-xs text-black pr-4 w-44">
                      {isEditing ? (
                        <div className="flex items-center justify-end gap-2">
                          <input 
                            type="number" 
                            value={item.amount}
                            onChange={(e) => handleValueChange(item.id, e.target.value)}
                            className="text-right text-xs text-black border border-gray-200 px-2 py-1 rounded w-32 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                          />
                          <button 
                            onClick={() => handleDeleteItem(item.id)}
                            className="text-red-500 hover:bg-red-50 p-1 rounded transition-colors"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ) : (
                        <span className={item.amount < 0 ? 'text-red-600' : 'text-black'}>
                          {item.amount < 0 ? `(${formatCurrency(Math.abs(item.amount), false)})` : formatCurrency(item.amount)}
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
                
                {/* Operating Subtotal */}
                <tr className="font-bold border-t border-gray-400 bg-gray-50/30">
                  <td className="py-3 text-xs text-black uppercase pl-4 font-black">Arus Kas Bersih dari Aktivitas Operasional</td>
                  <td className="py-3 text-right font-mono text-xs text-black pr-4 font-black">
                    {formatCurrency(operatingTotal)}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* SECTION 2: INVESTING ACTIVITIES */}
          <div className="space-y-4">
            <div className="flex justify-between items-center bg-gray-50 py-2 px-4 rounded-lg">
              <span className="text-xs font-black text-black uppercase tracking-wider">2. ARUS KAS DARI AKTIVITAS INVESTASI</span>
              {isEditing && (
                <button 
                  onClick={() => handleAddNewItem('INVESTING')}
                  className="flex items-center gap-1 bg-indigo-50 text-indigo-600 hover:bg-indigo-100 px-2.5 py-1 rounded-lg text-[10px] font-black transition-all"
                >
                  <Plus className="w-3 h-3" /> Tambah Baris
                </button>
              )}
            </div>
            
            <table className="w-full">
              <tbody>
                {items.filter(i => i.category === 'INVESTING').map(item => (
                  <tr key={item.id} className="border-b border-gray-100 hover:bg-gray-50/50 transition-colors">
                    <td className="py-2.5 text-xs text-black pl-4">
                      {isEditing ? (
                        <input 
                          type="text" 
                          value={item.name}
                          onChange={(e) => handleNameChange(item.id, e.target.value)}
                          className="w-full text-xs text-black border border-gray-200 px-2 py-1 rounded focus:outline-none focus:ring-1 focus:ring-indigo-500"
                        />
                      ) : (
                        item.name
                      )}
                    </td>
                    <td className="py-2.5 text-right font-mono text-xs text-black pr-4 w-44">
                      {isEditing ? (
                        <div className="flex items-center justify-end gap-2">
                          <input 
                            type="number" 
                            value={item.amount}
                            onChange={(e) => handleValueChange(item.id, e.target.value)}
                            className="text-right text-xs text-black border border-gray-200 px-2 py-1 rounded w-32 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                          />
                          <button 
                            onClick={() => handleDeleteItem(item.id)}
                            className="text-red-500 hover:bg-red-50 p-1 rounded transition-colors"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ) : (
                        <span className={item.amount < 0 ? 'text-red-600' : 'text-black'}>
                          {item.amount < 0 ? `(${formatCurrency(Math.abs(item.amount), false)})` : formatCurrency(item.amount)}
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
                
                {/* Investing Subtotal */}
                <tr className="font-bold border-t border-gray-400 bg-gray-50/30">
                  <td className="py-3 text-xs text-black uppercase pl-4 font-black">Arus Kas Bersih dari Aktivitas Investasi</td>
                  <td className="py-3 text-right font-mono text-xs text-black pr-4 font-black">
                    {formatCurrency(investingTotal)}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* SECTION 3: FINANCING ACTIVITIES */}
          <div className="space-y-4">
            <div className="flex justify-between items-center bg-gray-50 py-2 px-4 rounded-lg">
              <span className="text-xs font-black text-black uppercase tracking-wider">3. ARUS KAS DARI AKTIVITAS PENDANAAN</span>
              {isEditing && (
                <button 
                  onClick={() => handleAddNewItem('FINANCING')}
                  className="flex items-center gap-1 bg-indigo-50 text-indigo-600 hover:bg-indigo-100 px-2.5 py-1 rounded-lg text-[10px] font-black transition-all"
                >
                  <Plus className="w-3 h-3" /> Tambah Baris
                </button>
              )}
            </div>
            
            <table className="w-full">
              <tbody>
                {items.filter(i => i.category === 'FINANCING').map(item => (
                  <tr key={item.id} className="border-b border-gray-100 hover:bg-gray-50/50 transition-colors">
                    <td className="py-2.5 text-xs text-black pl-4">
                      {isEditing ? (
                        <input 
                          type="text" 
                          value={item.name}
                          onChange={(e) => handleNameChange(item.id, e.target.value)}
                          className="w-full text-xs text-black border border-gray-200 px-2 py-1 rounded focus:outline-none focus:ring-1 focus:ring-indigo-500"
                        />
                      ) : (
                        item.name
                      )}
                    </td>
                    <td className="py-2.5 text-right font-mono text-xs text-black pr-4 w-44">
                      {isEditing ? (
                        <div className="flex items-center justify-end gap-2">
                          <input 
                            type="number" 
                            value={item.amount}
                            onChange={(e) => handleValueChange(item.id, e.target.value)}
                            className="text-right text-xs text-black border border-gray-200 px-2 py-1 rounded w-32 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                          />
                          <button 
                            onClick={() => handleDeleteItem(item.id)}
                            className="text-red-500 hover:bg-red-50 p-1 rounded transition-colors"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ) : (
                        <span className={item.amount < 0 ? 'text-red-600' : 'text-black'}>
                          {item.amount < 0 ? `(${formatCurrency(Math.abs(item.amount), false)})` : formatCurrency(item.amount)}
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
                
                {/* Financing Subtotal */}
                <tr className="font-bold border-t border-gray-400 bg-gray-50/30">
                  <td className="py-3 text-xs text-black uppercase pl-4 font-black">Arus Kas Bersih dari Aktivitas Pendanaan</td>
                  <td className="py-3 text-right font-mono text-xs text-black pr-4 font-black">
                    {formatCurrency(financingTotal)}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* NET INCREASE/DECREASE AND ENDING CASH */}
          <div className="border-t-2 border-black pt-6 space-y-3">
            <div className="flex justify-between items-center text-xs font-bold text-black uppercase">
              <span>Kenaikan (Penurunan) Bersih Kas</span>
              <span className="font-mono">{formatCurrency(netCashIncrease)}</span>
            </div>
            
            <div className="flex justify-between items-center bg-gray-900 text-white p-4 rounded-xl">
              <span className="text-xs font-black uppercase tracking-wider">SALDO KAS AKHIR PERIODE</span>
              <span className="font-mono text-base font-black">{formatCurrency(endingCash)}</span>
            </div>
          </div>

        </div>

        {/* Document Footer Signature */}
        <div className="p-12 border-t border-gray-100 flex justify-between items-center bg-gray-50/30">
          <div className="flex flex-col">
            <span className="text-[9px] font-black text-black/40 uppercase tracking-widest">Disusun Oleh</span>
            <span className="text-xs font-black text-black mt-1 uppercase">{user?.name || 'Bagian Keuangan'}</span>
          </div>
          <div className="text-right text-[9px] font-black text-black/20 uppercase tracking-[0.4em] italic">
            Dokumen Resmi Prodev
          </div>
        </div>

      </div>
    </div>
  );
}
