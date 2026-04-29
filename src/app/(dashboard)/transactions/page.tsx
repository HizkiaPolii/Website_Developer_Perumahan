import { ArrowLeft, Trash2, Edit2, Plus } from 'lucide-react';
import Link from 'next/link';

interface Transaction {
  id: string;
  date: string;
  description: string;
  category: string;
  type: 'pendapatan' | 'pengeluaran';
  amount: number;
  status: 'pending' | 'completed';
}

export default function TransactionsPage() {
  // Data dummy transaksi
  const transactions: Transaction[] = [
    {
      id: '1',
      date: '2026-04-28',
      description: 'Penjualan Produk A',
      category: 'Penjualan',
      type: 'pendapatan',
      amount: 5000000,
      status: 'completed',
    },
    {
      id: '2',
      date: '2026-04-27',
      description: 'Gaji Karyawan',
      category: 'Gaji & Upah',
      type: 'pengeluaran',
      amount: 20000000,
      status: 'completed',
    },
    {
      id: '3',
      date: '2026-04-26',
      description: 'Biaya Sewa Kantor',
      category: 'Sewa',
      type: 'pengeluaran',
      amount: 10000000,
      status: 'pending',
    },
    {
      id: '4',
      date: '2026-04-25',
      description: 'Penjualan Produk B',
      category: 'Penjualan',
      type: 'pendapatan',
      amount: 3000000,
      status: 'completed',
    },
  ];

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(value);
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('id-ID', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <div className="flex flex-col h-full gap-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/dashboard" className="hover:bg-gray-100 p-2 rounded">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-3xl text-black font-bold">Manajemen Transaksi</h1>
            <p className="text-sm text-black mt-1">Kelola semua transaksi keuangan</p>
          </div>
        </div>
        <button className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors">
          <Plus className="w-5 h-5" />
          Transaksi Baru
        </button>
      </div>

      {/* Filter & Search */}
      <div className="flex gap-3">
        <input
          type="text"
          placeholder="Cari transaksi..."
          className="flex-1 px-4 py-2 border text-black border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />
        <select className="px-4 py-2 border text-black border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500">
          <option value="">Semua Jenis</option>
          <option value="pendapatan">Pendapatan</option>
          <option value="pengeluaran">Pengeluaran</option>
        </select>
        <select className="px-4 py-2 border text-black border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500">
          <option value="">Semua Kategori</option>
          <option value="penjualan">Penjualan</option>
          <option value="gaji">Gaji & Upah</option>
          <option value="sewa">Sewa</option>
        </select>
      </div>

      {/* Tabel Transaksi */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="px-6 py-3 text-left text-sm font-semibold text-black">Tanggal</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-black">Deskripsi</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-black">Kategori</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-black">Jenis</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-black">Jumlah</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-black">Status</th>
                <th className="px-6 py-3 text-center text-sm font-semibold text-black">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {transactions.map((tx, index) => (
                <tr key={tx.id} className={index !== transactions.length - 1 ? 'border-b' : ''}>
                  <td className="px-6 py-4 text-sm text-black">{formatDate(tx.date)}</td>
                  <td className="px-6 py-4 text-sm font-medium text-black">{tx.description}</td>
                  <td className="px-6 py-4 text-sm text-black">{tx.category}</td>
                  <td className="px-6 py-4 text-sm">
                    <span className={`font-semibold ${tx.type === 'pendapatan' ? 'text-green-600' : 'text-red-600'}`}>
                      {tx.type === 'pendapatan' ? '+ Pendapatan' : '- Pengeluaran'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm font-semibold text-black">
                    {formatCurrency(tx.amount)}
                  </td>
                  <td className="px-6 py-4 text-sm">
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                      tx.status === 'completed'
                        ? 'bg-green-100 text-green-700'
                        : 'bg-yellow-100 text-yellow-700'
                    }`}>
                      {tx.status === 'completed' ? 'Selesai' : 'Pending'}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-center gap-2">
                      <button className="p-2 hover:bg-blue-50 rounded text-blue-600 transition-colors" title="Edit">
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button className="p-2 hover:bg-red-50 rounded text-red-600 transition-colors" title="Hapus">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
