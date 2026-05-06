'use client';

import React, { useState } from 'react';
import { 
  ArrowLeft, 
  Save, 
  Sparkles, 
  ChevronRight, 
  Plus, 
  Building2, 
  Users, 
  CreditCard, 
  Coins,
  Wallet
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/contexts/ToastContext';

interface Template {
  id: string;
  name: string;
  description: string;
  category: 'PEMASUKAN' | 'PENGELUARAN';
  icon: any;
  iconBg: string;
  iconCol: string;
  defaultDesc: string;
}

export default function AddTransactionPage() {
  const router = useRouter();
  const { user } = useAuth();
  const { addToast } = useToast();

  const templates: Template[] = [
    // PEMASUKAN
    { id: 'dp-unit', name: 'DP & Pelunasan Unit', description: 'Mencatat uang muka (DP) atau pelunasan pembelian unit rumah.', category: 'PEMASUKAN', icon: Wallet, iconBg: 'bg-emerald-50', iconCol: 'text-emerald-600', defaultDesc: 'Penerimaan DP Unit Blok ' },
    { id: 'angsuran', name: 'Angsuran Konsumen', description: 'Penerimaan cicilan KPR developer bulanan dari pembeli perumahan.', category: 'PEMASUKAN', icon: Coins, iconBg: 'bg-emerald-50', iconCol: 'text-emerald-600', defaultDesc: 'Angsuran Bulanan Konsumen a.n ' },
    { id: 'setoran', name: 'Setoran Modal Pemilik', description: 'Tambahan modal kerja segar dari pemilik ke rekening bank perusahaan.', category: 'PEMASUKAN', icon: Plus, iconBg: 'bg-emerald-50', iconCol: 'text-emerald-600', defaultDesc: 'Setoran Tambahan Modal oleh Pemilik' },
    
    // PENGELUARAN
    { id: 'konstruksi', name: 'Bahan Bangunan & Kontraktor', description: 'Pembayaran pasir, semen, besi, bata, atau termin upah kontraktor.', category: 'PENGELUARAN', icon: Building2, iconBg: 'bg-rose-50', iconCol: 'text-rose-600', defaultDesc: 'Pembayaran bahan bangunan & upah borong unit Blok ' },
    { id: 'gaji', name: 'Gaji Karyawan', description: 'Gaji bulanan staf administrasi, pengawas proyek, dan sales.', category: 'PENGELUARAN', icon: Users, iconBg: 'bg-rose-50', iconCol: 'text-rose-600', defaultDesc: 'Gaji bulanan staf pemasaran & pengawas lapangan' },
    { id: 'operasional', name: 'Operasional Kantor & Utilitas', description: 'Pengeluaran wifi, listrik, air, pulsa harian, dan ATK kantor.', category: 'PENGELUARAN', icon: CreditCard, iconBg: 'bg-rose-50', iconCol: 'text-rose-600', defaultDesc: 'Biaya listrik, wifi, dan utilitas kantor pemasaran' },
  ];

  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null);
  const [amount, setAmount] = useState<number>(0);
  const [description, setDescription] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);

  const handleSelectTemplate = (temp: Template) => {
    setSelectedTemplate(temp);
    setDescription(temp.defaultDesc);
    setAmount(0);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedTemplate) {
      addToast('Silakan pilih salah satu template transaksi', 'error');
      return;
    }

    if (amount <= 0) {
      addToast('Masukkan nominal transaksi yang valid', 'error');
      return;
    }
    if (!description.trim()) {
      addToast('Isi keterangan transaksi terlebih dahulu', 'error');
      return;
    }

    // Persist to central localStorage ledger
    const newTx = {
      id: `tx-${Date.now()}`,
      date,
      templateId: selectedTemplate.id,
      name: selectedTemplate.name,
      category: selectedTemplate.category,
      amount,
      description
    };

    const existingTxs = JSON.parse(localStorage.getItem('prodev_transactions') || '[]');
    existingTxs.unshift(newTx);
    localStorage.setItem('prodev_transactions', JSON.stringify(existingTxs));

    addToast('Transaksi berhasil disimpan ke Jurnal!', 'success');
    addToast('Semua 4 laporan otomatis ter-update secara real-time!', 'info');

    setTimeout(() => {
      router.push('/transactions');
    }, 1000);
  };

  // SCREEN 1: ONLY TEMPLATE SELECTION (No Form Visible)
  if (!selectedTemplate) {
    return (
      <div className="max-w-3xl mx-auto w-full pb-24 animate-in fade-in duration-500">
        
        {/* Header */}
        <div className="flex items-center gap-4 mb-10">
          <button 
            onClick={() => router.push('/transactions')} 
            className="p-2.5 bg-white border border-gray-100 text-black rounded-xl hover:bg-gray-50 transition-colors shadow-xs"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-xl font-black text-gray-900 uppercase tracking-tight">Pilih Jenis Transaksi</h1>
            <p className="text-xs text-gray-400 font-bold italic">Pilih jenis transaksi di bawah ini untuk memulai pencatatan</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          
          {/* Column Pemasukan */}
          <div className="space-y-3.5">
            <h2 className="text-[10px] font-black text-emerald-700 uppercase tracking-widest bg-emerald-50 px-3.5 py-1.5 rounded-lg inline-block">
              📥 Penerimaan (Kas Masuk)
            </h2>
            <div className="space-y-2.5">
              {templates.filter(t => t.category === 'PEMASUKAN').map(temp => (
                <div 
                  key={temp.id}
                  onClick={() => handleSelectTemplate(temp)}
                  className="flex items-center justify-between p-5 bg-white rounded-2xl border border-gray-100 hover:border-emerald-500 hover:shadow-md hover:scale-101 transition-all cursor-pointer group"
                >
                  <div className="flex items-center gap-3.5">
                    <span className={`p-2.5 rounded-xl ${temp.iconBg} ${temp.iconCol}`}>
                      <temp.icon className="w-5 h-5" />
                    </span>
                    <div>
                      <span className="text-xs font-black text-gray-900 uppercase tracking-tight group-hover:text-emerald-600 transition-colors block">{temp.name}</span>
                      <p className="text-[10px] text-gray-400 font-semibold leading-normal mt-1">{temp.description}</p>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-gray-400 group-hover:translate-x-1 transition-transform flex-shrink-0 ml-4" />
                </div>
              ))}
            </div>
          </div>

          {/* Column Pengeluaran */}
          <div className="space-y-3.5">
            <h2 className="text-[10px] font-black text-rose-700 uppercase tracking-widest bg-rose-50 px-3.5 py-1.5 rounded-lg inline-block">
              📤 Pengeluaran (Biaya)
            </h2>
            <div className="space-y-2.5">
              {templates.filter(t => t.category === 'PENGELUARAN').map(temp => (
                <div 
                  key={temp.id}
                  onClick={() => handleSelectTemplate(temp)}
                  className="flex items-center justify-between p-5 bg-white rounded-2xl border border-gray-100 hover:border-rose-500 hover:shadow-md hover:scale-101 transition-all cursor-pointer group"
                >
                  <div className="flex items-center gap-3.5">
                    <span className={`p-2.5 rounded-xl ${temp.iconBg} ${temp.iconCol}`}>
                      <temp.icon className="w-5 h-5" />
                    </span>
                    <div>
                      <span className="text-xs font-black text-gray-900 uppercase tracking-tight group-hover:text-rose-600 transition-colors block">{temp.name}</span>
                      <p className="text-[10px] text-gray-400 font-semibold leading-normal mt-1">{temp.description}</p>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-gray-400 group-hover:translate-x-1 transition-transform flex-shrink-0 ml-4" />
                </div>
              ))}
            </div>
          </div>

        </div>

      </div>
    );
  }

  // SCREEN 2: ONLY TRANSACTION INPUT FORM (No Selection List Visible)
  return (
    <div className="max-w-xl mx-auto w-full pb-24 animate-in zoom-in-95 duration-300">
      
      {/* Header Back Button to Screen 1 */}
      <div className="flex items-center gap-4 mb-8">
        <button 
          onClick={() => setSelectedTemplate(null)} 
          className="p-2.5 bg-white border border-gray-100 text-black rounded-xl hover:bg-gray-50 transition-colors shadow-xs"
          title="Kembali ke pilihan transaksi"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-xl font-black text-gray-900 uppercase tracking-tight">Input Detail Transaksi</h1>
          <p className="text-xs text-gray-400 font-bold italic">Lengkapi detail untuk: {selectedTemplate.name}</p>
        </div>
      </div>

      {/* Centered Isolated Form Card */}
      <div className="bg-white border border-gray-100 rounded-3xl p-8 shadow-sm">
        <div className="flex items-center gap-3 border-b border-gray-50 pb-4 mb-6">
          <span className={`p-2.5 rounded-xl ${selectedTemplate.iconBg} ${selectedTemplate.iconCol}`}>
            <selectedTemplate.icon className="w-4.5 h-4.5" />
          </span>
          <div>
            <h3 className="text-xs font-black text-gray-900 uppercase tracking-tight">{selectedTemplate.name}</h3>
            <span className="text-[9px] text-gray-400 font-bold uppercase tracking-widest block mt-0.5">Automated Double-Entry Ledger</span>
          </div>
        </div>

        <form onSubmit={handleSave} className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-wider mb-1.5 block">Tanggal</label>
              <input 
                type="date" 
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full bg-gray-50 border border-gray-100 text-black rounded-xl px-4 py-3 text-xs font-bold outline-none focus:bg-white focus:ring-2 focus:ring-indigo-500 transition-all"
              />
            </div>

            <div>
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-wider mb-1.5 block">Nominal Rupiah (Rp)</label>
              <input 
                type="number" 
                placeholder="0"
                value={amount || ''}
                onChange={(e) => setAmount(parseFloat(e.target.value) || 0)}
                className="w-full bg-gray-50 border border-gray-100 text-black rounded-xl px-4 py-3 text-xs font-mono font-black outline-none focus:bg-white focus:ring-2 focus:ring-indigo-500 transition-all"
              />
            </div>
          </div>

          <div>
            <label className="text-[10px] font-black text-gray-400 uppercase tracking-wider mb-1.5 block">Keterangan Transaksi</label>
            <input 
              type="text" 
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full bg-gray-50 border border-gray-100 text-black rounded-xl px-4 py-3 text-xs font-bold outline-none focus:bg-white focus:ring-2 focus:ring-indigo-500 transition-all"
            />
          </div>

          <div className="flex items-center gap-2 text-[10px] text-gray-400 font-bold justify-center pt-2">
            <Sparkles className="w-3.5 h-3.5 text-indigo-500" />
            Kas Besar (Bank) otomatis terpetakan sebagai pusat transaksi.
          </div>

          <button 
            type="submit"
            className="w-full flex items-center justify-center gap-3 py-4 bg-indigo-600 text-white rounded-xl font-black text-sm uppercase tracking-wider hover:bg-indigo-700 transition-all"
          >
            <Save className="w-5 h-5" /> Simpan Transaksi
          </button>
        </form>
      </div>

    </div>
  );
}
