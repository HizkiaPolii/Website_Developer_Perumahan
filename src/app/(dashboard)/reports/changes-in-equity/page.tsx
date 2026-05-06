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
  RefreshCw,
  TrendingUp
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/contexts/ToastContext';
import { formatCurrency } from '@/utils/financial-constants';

interface EquityItem {
  id: string;
  name: string;
  amount: number;
  type: 'ADDITION' | 'SUBTRACTION';
}

export default function ChangesInEquityReportPage() {
  const router = useRouter();
  const { user, isLoading: isAuthLoading } = useAuth();
  const { addToast } = useToast();

  const [loading, setLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [beginningCapital, setBeginningCapital] = useState(1200000000); // Default Modal Awal Rp 1.200.000.000

  const [items, setItems] = React.useState<EquityItem[]>([]);

  React.useEffect(() => {
    const baseItems: EquityItem[] = [
      { id: 'eq-1', name: 'Tambahan Setoran Modal Pemilik', amount: 300000000, type: 'ADDITION' },
      { id: 'eq-2', name: 'Laba Bersih Setelah Pajak (Net Income)', amount: 185000000, type: 'ADDITION' },
      { id: 'eq-3', name: 'Pembagian Dividen / Prive Pemilik', amount: -50000000, type: 'SUBTRACTION' },
    ];

    const storedTxs = JSON.parse(localStorage.getItem('prodev_transactions') || '[]');
    
    storedTxs.forEach((tx: any) => {
      const val = Number(tx.amount);
      if (tx.templateId === 'setoran') {
        baseItems[0].amount += val; // Menambah Setoran Modal Pemilik
      } else {
        // Transactions that affect net income (revenue increases it, expenses reduce it)
        if (tx.category === 'PEMASUKAN') {
          baseItems[1].amount += val;
        } else {
          baseItems[1].amount -= val;
        }
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
  const totalAdditions = useMemo(() => {
    return items
      .filter(item => item.type === 'ADDITION')
      .reduce((sum, item) => sum + item.amount, 0);
  }, [items]);

  const totalSubtractions = useMemo(() => {
    return items
      .filter(item => item.type === 'SUBTRACTION')
      .reduce((sum, item) => sum + item.amount, 0);
  }, [items]);

  const netEquityChange = useMemo(() => {
    return totalAdditions + totalSubtractions;
  }, [totalAdditions, totalSubtractions]);

  const endingCapital = useMemo(() => {
    return beginningCapital + netEquityChange;
  }, [beginningCapital, netEquityChange]);

  const handleValueChange = (id: string, value: string) => {
    const numericVal = parseFloat(value) || 0;
    // For subtraction, ensure value is negative
    const formattedVal = items.find(i => i.id === id)?.type === 'SUBTRACTION' ? -Math.abs(numericVal) : Math.abs(numericVal);
    setItems(prev => prev.map(item => item.id === id ? { ...item, amount: formattedVal } : item));
  };

  const handleNameChange = (id: string, value: string) => {
    setItems(prev => prev.map(item => item.id === id ? { ...item, name: value } : item));
  };

  const handleAddNewItem = (type: 'ADDITION' | 'SUBTRACTION') => {
    const newItem: EquityItem = {
      id: `eq-${Date.now()}`,
      name: type === 'ADDITION' ? 'Tambahan Modal Lainnya' : 'Pengurangan Modal/Prive Lainnya',
      amount: type === 'ADDITION' ? 0 : 0,
      type
    };
    setItems(prev => [...prev, newItem]);
    addToast('Item baru ditambahkan', 'success');
  };

  const handleDeleteItem = (id: string) => {
    setItems(prev => prev.filter(item => item.id !== id));
    addToast('Item dihapus', 'success');
  };

  const handleSave = () => {
    setIsEditing(false);
    addToast('Laporan Perubahan Modal berhasil disimpan', 'success');
  };

  const handleReset = () => {
    if (confirm('Apakah Anda yakin ingin mengatur ulang data modal ke default template?')) {
      setBeginningCapital(1200000000);
      setItems([
        { id: 'eq-1', name: 'Tambahan Setoran Modal Pemilik', amount: 300000000, type: 'ADDITION' },
        { id: 'eq-2', name: 'Laba Bersih Setelah Pajak (Net Income)', amount: 185000000, type: 'ADDITION' },
        { id: 'eq-3', name: 'Pembagian Dividen / Prive Pemilik', amount: -50000000, type: 'SUBTRACTION' },
      ]);
      addToast('Data modal diatur ulang', 'info');
    }
  };

  if (isAuthLoading || loading) return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
      <div className="w-12 h-12 border-4 border-indigo-100 border-t-indigo-600 rounded-full animate-spin"></div>
      <p className="text-gray-500 font-medium">Memproses Laporan Perubahan Modal...</p>
    </div>
  );

  return (
    <div className="max-w-4xl mx-auto w-full pb-24 print:p-0 animate-in fade-in duration-500">
      
      {/* Action Header */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-6 mb-8 bg-white p-6 rounded-3xl border border-gray-100 shadow-sm print:hidden">
        <div className="flex items-center gap-4">
          <div>
            <h1 className="text-xl font-black text-gray-900 uppercase tracking-tight">Laporan Perubahan Modal</h1>
            <p className="text-xs text-gray-500 italic font-semibold">Statement of Changes in Equity</p>
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
          <h3 className="text-lg font-black text-black uppercase tracking-tight mb-1">Laporan Perubahan Ekuitas (Modal)</h3>
          <p className="text-xs text-black font-bold">
            Untuk Periode s.d 31 Desember {selectedYear}
          </p>
          <div className="h-[2px] bg-black mx-auto mt-4 w-32" />
        </div>

        {/* Document Content */}
        <div className="p-12 space-y-8">
          
          {/* Beginning Capital Row */}
          <div className="flex justify-between items-center border-b border-gray-300 pb-4">
            <div>
              <span className="text-xs font-black text-black uppercase tracking-wider block">Modal Awal Pemilik</span>
              <span className="text-[10px] text-gray-400 font-bold block">Per 01 Januari {selectedYear}</span>
            </div>
            {isEditing ? (
              <input 
                type="number"
                value={beginningCapital}
                onChange={(e) => setBeginningCapital(parseFloat(e.target.value) || 0)}
                className="font-mono text-xs text-right text-black font-bold border border-gray-300 px-3 py-1.5 rounded-lg w-44 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            ) : (
              <span className="font-mono text-xs text-black font-black">{formatCurrency(beginningCapital)}</span>
            )}
          </div>

          {/* ADDITIONS TO CAPITAL */}
          <div className="space-y-4">
            <div className="flex justify-between items-center bg-gray-50 py-2 px-4 rounded-lg">
              <span className="text-xs font-black text-black uppercase tracking-wider">PENAMBAHAN EKUITAS (MODAL)</span>
              {isEditing && (
                <button 
                  onClick={() => handleAddNewItem('ADDITION')}
                  className="flex items-center gap-1 bg-indigo-50 text-indigo-600 hover:bg-indigo-100 px-2.5 py-1 rounded-lg text-[10px] font-black transition-all"
                >
                  <Plus className="w-3 h-3" /> Tambah Item
                </button>
              )}
            </div>
            
            <table className="w-full">
              <tbody>
                {items.filter(i => i.type === 'ADDITION').map(item => (
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
                        <span>{formatCurrency(item.amount)}</span>
                      )}
                    </td>
                  </tr>
                ))}
                
                <tr className="font-bold border-t border-gray-400 bg-gray-50/30">
                  <td className="py-3 text-xs text-black uppercase pl-4 font-black">Total Penambahan Modal</td>
                  <td className="py-3 text-right font-mono text-xs text-black pr-4 font-black">
                    {formatCurrency(totalAdditions)}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* REDUCTIONS TO CAPITAL */}
          <div className="space-y-4">
            <div className="flex justify-between items-center bg-gray-50 py-2 px-4 rounded-lg">
              <span className="text-xs font-black text-black uppercase tracking-wider">PENGURANGAN EKUITAS (MODAL)</span>
              {isEditing && (
                <button 
                  onClick={() => handleAddNewItem('SUBTRACTION')}
                  className="flex items-center gap-1 bg-indigo-50 text-indigo-600 hover:bg-indigo-100 px-2.5 py-1 rounded-lg text-[10px] font-black transition-all"
                >
                  <Plus className="w-3 h-3" /> Tambah Item
                </button>
              )}
            </div>
            
            <table className="w-full">
              <tbody>
                {items.filter(i => i.type === 'SUBTRACTION').map(item => (
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
                            value={Math.abs(item.amount)}
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
                        <span className="text-red-600">
                          ({formatCurrency(Math.abs(item.amount), false)})
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
                
                <tr className="font-bold border-t border-gray-400 bg-gray-50/30">
                  <td className="py-3 text-xs text-black uppercase pl-4 font-black">Total Pengurangan Modal</td>
                  <td className="py-3 text-right font-mono text-xs text-red-600 pr-4 font-black">
                    ({formatCurrency(Math.abs(totalSubtractions), false)})
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* SUMMARY AND ENDING CAPITAL */}
          <div className="border-t-2 border-black pt-6 space-y-4">
            <div className="flex justify-between items-center text-xs font-bold text-black uppercase pl-4">
              <span>Kenaikan (Penurunan) Bersih Modal</span>
              <span className="font-mono">{formatCurrency(netEquityChange)}</span>
            </div>
            
            <div className="flex justify-between items-center bg-gray-900 text-white p-4 rounded-xl">
              <div>
                <span className="text-xs font-black uppercase tracking-wider block">MODAL AKHIR PEMILIK</span>
                <span className="text-[10px] text-gray-300 font-bold block">Per 31 Desember {selectedYear}</span>
              </div>
              <span className="font-mono text-base font-black">{formatCurrency(endingCapital)}</span>
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
