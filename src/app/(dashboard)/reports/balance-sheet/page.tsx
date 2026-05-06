'use client';

import React, { useState, useMemo } from 'react';
import { 
  Plus, 
  FileText, 
  Calendar, 
  Printer,
  Download,
  ArrowLeft,
  X,
  Save,
  Check,
  Edit2,
  RefreshCw,
  History,
  Sparkles,
  Trash2
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/contexts/ToastContext';
import { formatCurrency } from '@/utils/financial-constants';

interface BalanceSheetItem {
  id: string;
  code: string;
  name: string;
  type: 'ASET' | 'KEWAJIBAN' | 'EKUITAS';
  amount: number;
}

export default function BalanceSheetReportPage() {
  const router = useRouter();
  const { user, isLoading: isAuthLoading } = useAuth();
  const { addToast } = useToast();

  const [isEditing, setIsEditing] = useState(false);
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [activeLedgerAccount, setActiveLedgerAccount] = useState<BalanceSheetItem | null>(null);

  const [items, setItems] = React.useState<BalanceSheetItem[]>([]);

  React.useEffect(() => {
    const baseItems: BalanceSheetItem[] = [
      // ASET
      { id: 'ast-1', code: '1.1.01', name: 'Kas Besar (Bank Mandiri)', type: 'ASET', amount: 1375000000 },
      { id: 'ast-2', code: '1.1.02', name: 'Piutang Konsumen Unit', type: 'ASET', amount: 335000000 },
      { id: 'ast-3', code: '1.2.01', name: 'Persediaan Lahan & Proyek Konstruksi', type: 'ASET', amount: 850000000 },
      { id: 'ast-4', code: '1.2.02', name: 'Inventaris & Peralatan Kantor', type: 'ASET', amount: 45000000 },
      
      // KEWAJIBAN
      { id: 'liab-1', code: '2.1.01', name: 'Utang Bahan Bangunan (Supplier)', type: 'KEWAJIBAN', amount: 120000000 },
      { id: 'liab-2', code: '2.1.02', name: 'Utang Uang Muka DP Konsumen', type: 'KEWAJIBAN', amount: 150000000 },
      { id: 'liab-3', code: '2.2.01', name: 'Pinjaman Bank Mandiri', type: 'KEWAJIBAN', amount: 180000000 },
      
      // EKUITAS
      { id: 'eq-1', code: '3.1.01', name: 'Modal Disetor Pemilik', type: 'EKUITAS', amount: 1200000000 },
      { id: 'eq-2', code: '3.1.02', name: 'Laba Ditahan Periode Lalu', type: 'EKUITAS', amount: 75000000 },
      { id: 'eq-3', code: '3.1.03', name: 'Laba Bersih Tahun Berjalan', type: 'EKUITAS', amount: 880000000 },
      { id: 'eq-4', code: '3.1.04', name: 'Pengambilan Prive Pemilik', type: 'EKUITAS', amount: -28000000 },
    ];

    const storedTxs = JSON.parse(localStorage.getItem('prodev_transactions') || '[]');
    
    storedTxs.forEach((tx: any) => {
      const val = Number(tx.amount);
      if (tx.category === 'PEMASUKAN') {
        baseItems[0].amount += val; // Kas Besar bertambah
      } else {
        baseItems[0].amount -= val; // Kas Besar berkurang
      }

      if (tx.templateId === 'dp-unit') {
        baseItems[9].amount += val; // Laba bersih bertambah
      } else if (tx.templateId === 'angsuran') {
        baseItems[1].amount -= val; // Piutang berkurang
      } else if (tx.templateId === 'setoran') {
        baseItems[7].amount += val; // Modal disetor bertambah
      } else if (tx.templateId === 'konstruksi') {
        baseItems[2].amount += val; // Persediaan aset bertambah (capitalized)
        baseItems[9].amount -= val; // Beban konstruksi mengurangi laba bersih
      } else if (tx.templateId === 'gaji') {
        baseItems[9].amount -= val; // Beban gaji mengurangi laba bersih
      } else if (tx.templateId === 'operasional') {
        baseItems[9].amount -= val; // Beban operasional mengurangi laba bersih
      }
    });

    setItems(baseItems);
  }, [selectedMonth, selectedYear]);

  const months = [
    'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
    'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
  ];
  const years = Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - 2 + i);

  // Auto-calculated subtotals
  const totalAssets = useMemo(() => {
    return items.filter(item => item.type === 'ASET').reduce((sum, item) => sum + item.amount, 0);
  }, [items]);

  const totalLiabilities = useMemo(() => {
    return items.filter(item => item.type === 'KEWAJIBAN').reduce((sum, item) => sum + item.amount, 0);
  }, [items]);

  const totalEquity = useMemo(() => {
    return items.filter(item => item.type === 'EKUITAS').reduce((sum, item) => sum + item.amount, 0);
  }, [items]);

  const totalLiabilitiesAndEquity = useMemo(() => {
    return totalLiabilities + totalEquity;
  }, [totalLiabilities, totalEquity]);

  const handleValueChange = (id: string, value: string) => {
    const numericVal = parseFloat(value) || 0;
    setItems(prev => prev.map(item => item.id === id ? { ...item, amount: numericVal } : item));
  };

  const handleNameChange = (id: string, value: string) => {
    setItems(prev => prev.map(item => item.id === id ? { ...item, name: value } : item));
  };

  const handleAddNewItem = (type: 'ASET' | 'KEWAJIBAN' | 'EKUITAS') => {
    const newItem: BalanceSheetItem = {
      id: `${type.toLowerCase()}-${Date.now()}`,
      code: type === 'ASET' ? '1.3.00' : type === 'KEWAJIBAN' ? '2.3.00' : '3.2.00',
      name: 'Akun Neraca Baru',
      type,
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
    addToast('Laporan Neraca berhasil diperbarui', 'success');
  };

  const handleReset = () => {
    if (confirm('Apakah Anda yakin ingin mengatur ulang data neraca ke default?')) {
      setItems([
        { id: 'ast-1', code: '1.1.01', name: 'Kas Besar (Bank Mandiri)', type: 'ASET', amount: 1375000000 },
        { id: 'ast-2', code: '1.1.02', name: 'Piutang Konsumen Unit', type: 'ASET', amount: 335000000 },
        { id: 'ast-3', code: '1.2.01', name: 'Persediaan Lahan & Proyek Konstruksi', type: 'ASET', amount: 850000000 },
        { id: 'ast-4', code: '1.2.02', name: 'Inventaris & Peralatan Kantor', type: 'ASET', amount: 45000000 },
        { id: 'liab-1', code: '2.1.01', name: 'Utang Bahan Bangunan (Supplier)', type: 'KEWAJIBAN', amount: 120000000 },
        { id: 'liab-2', code: '2.1.02', name: 'Utang Uang Muka DP Konsumen', type: 'KEWAJIBAN', amount: 150000000 },
        { id: 'liab-3', code: '2.2.01', name: 'Pinjaman Bank Mandiri', type: 'KEWAJIBAN', amount: 180000000 },
        { id: 'eq-1', code: '3.1.01', name: 'Modal Disetor Pemilik', type: 'EKUITAS', amount: 1200000000 },
        { id: 'eq-2', code: '3.1.02', name: 'Laba Ditahan Periode Lalu', type: 'EKUITAS', amount: 75000000 },
        { id: 'eq-3', code: '3.1.03', name: 'Laba Bersih Tahun Berjalan', type: 'EKUITAS', amount: 880000000 },
        { id: 'eq-4', code: '3.1.04', name: 'Pengambilan Prive Pemilik', type: 'EKUITAS', amount: -28000000 },
      ]);
      addToast('Data neraca diatur ulang', 'info');
    }
  };

  const getMockLedgerTransactions = (code: string) => {
    switch (code) {
      case '1.1.01':
        return [
          { date: '2026-05-01', desc: 'Saldo Awal Bulan', ref: 'BAL-FWD', debit: 1200000000, credit: 0, balance: 1200000000 },
          { date: '2026-05-05', desc: 'Penerimaan DP Penjualan Unit Blok A12', ref: 'KW-0512', debit: 450000000, credit: 0, balance: 1650000000 },
          { date: '2026-05-12', desc: 'Pembayaran Gaji Bulanan Staf', ref: 'PV-0814', debit: 0, credit: 65000000, balance: 1585000000 },
          { date: '2026-05-20', desc: 'Pembelian Semen & Besi Konstruksi', ref: 'INV-3011', debit: 0, credit: 210000000, balance: 1375000000 }
        ];
      case '1.1.02':
        return [
          { date: '2026-05-01', desc: 'Saldo Awal Piutang', ref: 'BAL-FWD', debit: 350000000, credit: 0, balance: 350000000 },
          { date: '2026-05-15', desc: 'Penerimaan Angsuran Konsumen', ref: 'KW-0556', debit: 0, credit: 15000000, balance: 335000000 }
        ];
      case '3.1.01':
        return [
          { date: '2026-05-01', desc: 'Modal Disetor Awal', ref: 'BAL-FWD', debit: 0, credit: 1200000000, balance: 1200000000 }
        ];
      default:
        return [
          { date: '2026-05-01', desc: 'Saldo Forward Awal Periode', ref: 'BAL-FWD', debit: 0, credit: 0, balance: 0 }
        ];
    }
  };

  const [isArchived, setIsArchived] = useState(false);

  const handleArchive = () => {
    if (confirm('Apakah Anda yakin ingin memfinalisasi, mengunci, dan mengarsipkan laporan Neraca periode ini? Langkah ini tidak dapat dibatalkan demi kepatuhan regulasi keuangan.')) {
      setIsArchived(true);
      addToast('Laporan Neraca berhasil dikunci dan diarsipkan secara aman!', 'success');
      addToast('Status laporan berubah menjadi FINALIZED.', 'info');
    }
  };

  return (
    <div className="max-w-4xl mx-auto w-full pb-24 print:p-0 animate-in fade-in duration-500">
      
      {/* Action Header */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-6 mb-8 bg-white p-6 rounded-3xl border border-gray-100 shadow-sm print:hidden">
        <div className="flex items-center gap-4">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-black text-gray-900 uppercase tracking-tight">Laporan Neraca</h1>
              {isArchived ? (
                <span className="bg-emerald-50 text-emerald-700 border border-emerald-200 text-[9px] font-black uppercase px-2.5 py-1 rounded-full flex items-center gap-1">
                  🔒 Terkunci & Diarsipkan
                </span>
              ) : (
                <span className="bg-yellow-50 text-yellow-700 border border-yellow-200 text-[9px] font-black uppercase px-2.5 py-1 rounded-full">
                  ✏️ Draft (Bisa Diedit)
                </span>
              )}
            </div>
            <p className="text-xs text-gray-500 italic font-semibold">Statement of Financial Position</p>
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
              {!isArchived && (
                <>
                  <button 
                    onClick={() => setIsEditing(true)}
                    className="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 text-white rounded-xl text-xs font-black shadow-lg shadow-indigo-100 hover:bg-indigo-700 transition-all"
                  >
                    <Edit2 className="w-4 h-4" /> Ubah Data Manual
                  </button>
                  <button 
                    onClick={handleArchive}
                    className="flex items-center gap-2 px-4 py-2.5 bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-xl text-xs font-black hover:bg-emerald-100 transition-all"
                  >
                    🔒 Arsip & Kunci
                  </button>
                </>
              )}
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
          <span className="text-sm font-bold text-gray-900">Periode Laporan Posisi Keuangan:</span>
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

      {/* Main Document */}
      <div className="bg-white border border-gray-200 shadow-xl rounded-none overflow-hidden print:border-none print:shadow-none animate-in zoom-in-95 duration-300">
        
        {/* Document Letterhead */}
        <div className="p-12 text-center border-b border-gray-100">
          <h2 className="text-sm font-black text-black uppercase tracking-widest mb-1">PT. PRODEV DEVELOPER PERUMAHAN</h2>
          <h3 className="text-lg font-black text-black uppercase tracking-tight mb-1">Laporan Neraca</h3>
          <p className="text-xs text-black font-bold">
            Posisi s.d 30 {months[selectedMonth]} {selectedYear}
          </p>
          <div className="h-[2px] bg-black mx-auto mt-4 w-32" />
        </div>

        {/* Document Content */}
        <div className="p-12 space-y-8">
          
          {/* SECTION 1: ASSETS */}
          <div className="space-y-4">
            <div className="flex justify-between items-center bg-gray-50 py-2.5 px-4 rounded-lg">
              <span className="text-xs font-black text-black uppercase tracking-wider">1. ASET (AKTIVA)</span>
              {isEditing && (
                <button 
                  onClick={() => handleAddNewItem('ASET')}
                  className="flex items-center gap-1 bg-indigo-50 text-indigo-600 hover:bg-indigo-100 px-2.5 py-1 rounded-lg text-[10px] font-black transition-all"
                >
                  <Plus className="w-3 h-3" /> Tambah Baris
                </button>
              )}
            </div>
            
            <table className="w-full">
              <tbody>
                {items.filter(i => i.type === 'ASET').map(item => (
                  <tr 
                    key={item.id} 
                    onClick={() => !isEditing && setActiveLedgerAccount(item)}
                    className={`border-b border-gray-100 transition-all ${!isEditing ? 'cursor-pointer hover:bg-indigo-50/40 group' : 'hover:bg-gray-50/50'}`}
                    title={!isEditing ? 'Klik untuk melihat Buku Besar' : undefined}
                  >
                    <td className="py-2.5 pl-4 flex items-center gap-2">
                      <span className="text-[9px] font-mono font-bold text-gray-400 w-12">{item.code}</span>
                      {isEditing ? (
                        <input 
                          type="text" 
                          value={item.name}
                          onChange={(e) => handleNameChange(item.id, e.target.value)}
                          className="text-xs text-black border border-gray-200 px-2 py-1 rounded focus:outline-none focus:ring-1 focus:ring-indigo-500 w-full"
                        />
                      ) : (
                        <span className="text-xs text-black font-medium group-hover:text-indigo-600 group-hover:font-bold transition-all">{item.name}</span>
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
                            onClick={(e) => { e.stopPropagation(); handleDeleteItem(item.id); }}
                            className="text-red-500 hover:bg-red-50 p-1 rounded transition-colors"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ) : (
                        <span className="group-hover:text-indigo-600 transition-all font-bold border-b border-dashed border-transparent group-hover:border-indigo-400">
                          {formatCurrency(item.amount)}
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
                
                {/* Total Assets */}
                <tr className="font-bold border-t border-gray-400 bg-gray-50/30">
                  <td className="py-3 pl-4 text-xs text-black uppercase font-black">TOTAL ASET (AKTIVA)</td>
                  <td className="py-3 text-right font-mono text-xs text-black pr-4 font-black">
                    {formatCurrency(totalAssets)}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* SECTION 2: LIABILITIES */}
          <div className="space-y-4">
            <div className="flex justify-between items-center bg-gray-50 py-2.5 px-4 rounded-lg">
              <span className="text-xs font-black text-black uppercase tracking-wider">2. KEWAJIBAN (PASIVA - UTANG)</span>
              {isEditing && (
                <button 
                  onClick={() => handleAddNewItem('KEWAJIBAN')}
                  className="flex items-center gap-1 bg-indigo-50 text-indigo-600 hover:bg-indigo-100 px-2.5 py-1 rounded-lg text-[10px] font-black transition-all"
                >
                  <Plus className="w-3 h-3" /> Tambah Baris
                </button>
              )}
            </div>
            
            <table className="w-full">
              <tbody>
                {items.filter(i => i.type === 'KEWAJIBAN').map(item => (
                  <tr 
                    key={item.id} 
                    onClick={() => !isEditing && setActiveLedgerAccount(item)}
                    className={`border-b border-gray-100 transition-all ${!isEditing ? 'cursor-pointer hover:bg-indigo-50/40 group' : 'hover:bg-gray-50/50'}`}
                    title={!isEditing ? 'Klik untuk melihat Buku Besar' : undefined}
                  >
                    <td className="py-2.5 pl-4 flex items-center gap-2">
                      <span className="text-[9px] font-mono font-bold text-gray-400 w-12">{item.code}</span>
                      {isEditing ? (
                        <input 
                          type="text" 
                          value={item.name}
                          onChange={(e) => handleNameChange(item.id, e.target.value)}
                          className="text-xs text-black border border-gray-200 px-2 py-1 rounded focus:outline-none focus:ring-1 focus:ring-indigo-500 w-full"
                        />
                      ) : (
                        <span className="text-xs text-black font-medium group-hover:text-indigo-600 group-hover:font-bold transition-all">{item.name}</span>
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
                            onClick={(e) => { e.stopPropagation(); handleDeleteItem(item.id); }}
                            className="text-red-500 hover:bg-red-50 p-1 rounded transition-colors"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ) : (
                        <span className="group-hover:text-indigo-600 transition-all font-bold border-b border-dashed border-transparent group-hover:border-indigo-400">
                          {formatCurrency(item.amount)}
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
                
                {/* Total Liabilities */}
                <tr className="font-bold border-t border-gray-400 bg-gray-50/30">
                  <td className="py-3 pl-4 text-xs text-black uppercase font-black">TOTAL KEWAJIBAN (UTANG)</td>
                  <td className="py-3 text-right font-mono text-xs text-black pr-4 font-black">
                    {formatCurrency(totalLiabilities)}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* SECTION 3: EQUITY */}
          <div className="space-y-4">
            <div className="flex justify-between items-center bg-gray-50 py-2.5 px-4 rounded-lg">
              <span className="text-xs font-black text-black uppercase tracking-wider">3. EKUITAS (PASIVA - MODAL)</span>
              {isEditing && (
                <button 
                  onClick={() => handleAddNewItem('EKUITAS')}
                  className="flex items-center gap-1 bg-indigo-50 text-indigo-600 hover:bg-indigo-100 px-2.5 py-1 rounded-lg text-[10px] font-black transition-all"
                >
                  <Plus className="w-3 h-3" /> Tambah Baris
                </button>
              )}
            </div>
            
            <table className="w-full">
              <tbody>
                {items.filter(i => i.type === 'EKUITAS').map(item => (
                  <tr 
                    key={item.id} 
                    onClick={() => !isEditing && setActiveLedgerAccount(item)}
                    className={`border-b border-gray-100 transition-all ${!isEditing ? 'cursor-pointer hover:bg-indigo-50/40 group' : 'hover:bg-gray-50/50'}`}
                    title={!isEditing ? 'Klik untuk melihat Buku Besar' : undefined}
                  >
                    <td className="py-2.5 pl-4 flex items-center gap-2">
                      <span className="text-[9px] font-mono font-bold text-gray-400 w-12">{item.code}</span>
                      {isEditing ? (
                        <input 
                          type="text" 
                          value={item.name}
                          onChange={(e) => handleNameChange(item.id, e.target.value)}
                          className="text-xs text-black border border-gray-200 px-2 py-1 rounded focus:outline-none focus:ring-1 focus:ring-indigo-500 w-full"
                        />
                      ) : (
                        <span className="text-xs text-black font-medium group-hover:text-indigo-600 group-hover:font-bold transition-all">{item.name}</span>
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
                            onClick={(e) => { e.stopPropagation(); handleDeleteItem(item.id); }}
                            className="text-red-500 hover:bg-red-50 p-1 rounded transition-colors"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ) : (
                        <span className="group-hover:text-indigo-600 transition-all font-bold border-b border-dashed border-transparent group-hover:border-indigo-400">
                          {formatCurrency(item.amount)}
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
                
                {/* Total Equity */}
                <tr className="font-bold border-t border-gray-400 bg-gray-50/30">
                  <td className="py-3 pl-4 text-xs text-black uppercase font-black">TOTAL EKUITAS (MODAL)</td>
                  <td className="py-3 text-right font-mono text-xs text-black pr-4 font-black">
                    {formatCurrency(totalEquity)}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* BALANCE SHEET GRAND COMPARISON */}
          <div className="border-t-2 border-black pt-6 grid grid-cols-2 gap-4">
            <div className="bg-gray-900 text-white p-4 rounded-xl">
              <span className="text-[10px] font-black uppercase tracking-wider opacity-60">TOTAL AKTIVA (ASET)</span>
              <p className="font-mono text-base font-black mt-1">{formatCurrency(totalAssets)}</p>
            </div>
            <div className={`p-4 rounded-xl text-white ${Math.abs(totalAssets - totalLiabilitiesAndEquity) < 1 ? 'bg-emerald-600' : 'bg-rose-600 animate-pulse'}`}>
              <div className="flex justify-between items-center">
                <span className="text-[10px] font-black uppercase tracking-wider opacity-80">TOTAL PASIVA (UTANG + MODAL)</span>
                <span className="text-[9px] font-black uppercase tracking-widest px-2 py-0.5 bg-black/30 rounded-lg">
                  {Math.abs(totalAssets - totalLiabilitiesAndEquity) < 1 ? 'BALANCED' : 'UNBALANCED'}
                </span>
              </div>
              <p className="font-mono text-base font-black mt-1">{formatCurrency(totalLiabilitiesAndEquity)}</p>
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

      {/* Buku Besar Modal Overlay */}
      {activeLedgerAccount && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-300 print:hidden">
          <div className="bg-white rounded-[2.5rem] w-full max-w-3xl shadow-2xl border border-gray-100 overflow-hidden animate-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="p-8 border-b border-gray-100 flex items-center justify-between bg-indigo-50/20">
              <div className="flex items-center gap-3">
                <span className="p-2.5 bg-indigo-50 text-indigo-600 rounded-xl">
                  <History className="w-5 h-5" />
                </span>
                <div>
                  <h3 className="text-sm font-black text-gray-900 uppercase tracking-tight">Rincian Buku Besar (Audit Trail)</h3>
                  <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-0.5">
                    Akun: {activeLedgerAccount.code} — {activeLedgerAccount.name}
                  </p>
                </div>
              </div>
              <button 
                onClick={() => setActiveLedgerAccount(null)} 
                className="p-2 hover:bg-gray-100 text-gray-400 hover:text-black rounded-xl transition-all"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-8 overflow-y-auto max-h-[50vh]">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-100">
                    <th className="text-left py-3 px-4 text-[9px] font-black text-gray-400 uppercase tracking-wider">Tanggal</th>
                    <th className="text-left py-3 px-4 text-[9px] font-black text-gray-400 uppercase tracking-wider">Keterangan Jurnal</th>
                    <th className="text-left py-3 px-4 text-[9px] font-black text-gray-400 uppercase tracking-wider">No. Ref</th>
                    <th className="text-right py-3 px-4 text-[9px] font-black text-gray-400 uppercase tracking-wider">Debit (Dr)</th>
                    <th className="text-right py-3 px-4 text-[9px] font-black text-gray-400 uppercase tracking-wider">Kredit (Cr)</th>
                    <th className="text-right py-3 px-4 text-[9px] font-black text-gray-400 uppercase tracking-wider">Saldo Akhir</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {getMockLedgerTransactions(activeLedgerAccount.code).map((tx, idx) => (
                    <tr key={idx} className="text-xs text-gray-700 font-medium">
                      <td className="py-4 px-4 font-bold">{tx.date}</td>
                      <td className="py-4 px-4 font-black text-black uppercase tracking-tight">{tx.desc}</td>
                      <td className="py-4 px-4 font-mono text-[10px] text-gray-400 font-bold">{tx.ref}</td>
                      <td className="py-4 px-4 text-right font-mono font-bold text-emerald-600">
                        {tx.debit > 0 ? formatCurrency(tx.debit) : '-'}
                      </td>
                      <td className="py-4 px-4 text-right font-mono font-bold text-rose-600">
                        {tx.credit > 0 ? formatCurrency(tx.credit) : '-'}
                      </td>
                      <td className="py-4 px-4 text-right font-mono font-black text-black">
                        {formatCurrency(tx.balance)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Modal Footer */}
            <div className="p-8 border-t border-gray-50 bg-gray-50/30 flex justify-between items-center">
              <div className="flex items-center gap-2 text-[10px] text-gray-400 font-bold">
                <Sparkles className="w-4 h-4 text-indigo-500 animate-pulse" />
                Data terkunci otomatis dari Jurnal Transaksi demi kepatuhan regulasi.
              </div>
              <button 
                onClick={() => setActiveLedgerAccount(null)}
                className="px-6 py-2.5 bg-black text-white text-xs font-black uppercase rounded-xl hover:bg-gray-900 transition-all"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
