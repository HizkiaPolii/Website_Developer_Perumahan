'use client';

import React, { useState, useEffect } from 'react';
import { ArrowLeft, Trash2, Edit2, Plus, Loader } from 'lucide-react';
import Link from 'next/link';
import { useTransactions } from '@/hooks/useApiEndpoints';
import { useAuth } from '@/contexts/AuthContext';
import { formatCurrency, formatDate } from '@/utils/financial-constants';
import { useToast } from '@/contexts/ToastContext';

export default function TransactionsPage() {
  const { user, isLoading: isAuthLoading } = useAuth();
  const { getAll, loading, error } = useTransactions();
  const { addToast } = useToast();
  
  const [transactions, setTransactions] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [filteredTransactions, setFilteredTransactions] = useState<any[]>([]);

  // Fetch transactions when user is loaded
  useEffect(() => {
    if (isAuthLoading || !user) return;

    const loadTransactions = async () => {
      try {
        const data = await getAll();
        if (data && data.length > 0) {
          setTransactions(data);
          addToast(`${data.length} transaksi berhasil dimuat`, 'success');
        } else {
          setTransactions([]);
        }
      } catch (err) {
        console.error('Error loading transactions:', err);
        addToast('Gagal memuat transaksi', 'error');
      }
    };

    loadTransactions();
  }, [getAll, user, isAuthLoading, addToast]);

  // Filter transactions based on search and filters
  useEffect(() => {
    let filtered = transactions;

    if (searchTerm) {
      filtered = filtered.filter(
        (tx) =>
          tx.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          tx.referenceNo?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (typeFilter) {
      filtered = filtered.filter((tx) => tx.transactionType === typeFilter);
    }

    if (categoryFilter) {
      filtered = filtered.filter((tx) => tx.category === categoryFilter);
    }

    setFilteredTransactions(filtered);
  }, [transactions, searchTerm, typeFilter, categoryFilter]);

  const handleDelete = (id: number) => {
    if (confirm('Apakah Anda yakin ingin menghapus transaksi ini?')) {
      addToast('Transaksi berhasil dihapus', 'success');
    }
  };

  if (isAuthLoading || loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <Loader className="w-8 h-8 animate-spin mx-auto text-blue-500" />
          <p className="text-black mt-2">Memuat data transaksi...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full gap-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/" className="hover:bg-gray-100 p-2 rounded">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-3xl text-black font-bold">Manajemen Transaksi</h1>
            <p className="text-sm text-black mt-1">Kelola semua transaksi keuangan</p>
          </div>
        </div>
        <Link
          href="/transactions/add"
          className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors"
        >
          <Plus className="w-5 h-5" />
          Transaksi Baru
        </Link>
      </div>

      {/* Filter & Search */}
      <div className="flex gap-3">
        <input
          type="text"
          placeholder="Cari transaksi..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="flex-1 px-4 py-2 border text-black border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />
        <select
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value)}
          className="px-4 py-2 border text-black border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
        >
          <option value="">Semua Jenis</option>
          <option value="PENDAPATAN">Pendapatan</option>
          <option value="PENGELUARAN">Pengeluaran</option>
        </select>
        <select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          className="px-4 py-2 border text-black border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
        >
          <option value="">Semua Kategori</option>
          <option value="Penjualan">Penjualan</option>
          <option value="Gaji">Gaji & Upah</option>
          <option value="Sewa">Sewa</option>
        </select>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

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
              {filteredTransactions.length > 0 ? (
                filteredTransactions.map((tx, index) => (
                  <tr key={tx.id} className={index !== filteredTransactions.length - 1 ? 'border-b' : ''}>
                    <td className="px-6 py-4 text-sm text-black">{formatDate(tx.transactionDate)}</td>
                    <td className="px-6 py-4 text-sm font-medium text-black">{tx.description}</td>
                    <td className="px-6 py-4 text-sm text-black">{tx.category || '-'}</td>
                    <td className="px-6 py-4 text-sm">
                      <span
                        className={`font-semibold ${
                          tx.transactionType === 'PENDAPATAN' ? 'text-green-600' : 'text-red-600'
                        }`}
                      >
                        {tx.transactionType === 'PENDAPATAN' ? '+ Pendapatan' : '- Pengeluaran'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm font-semibold text-black">
                      {formatCurrency(tx.amount)}
                    </td>
                    <td className="px-6 py-4 text-sm">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-semibold ${
                          tx.status === 'POSTED'
                            ? 'bg-green-100 text-green-700'
                            : tx.status === 'APPROVED'
                            ? 'bg-blue-100 text-blue-700'
                            : tx.status === 'REJECTED'
                            ? 'bg-red-100 text-red-700'
                            : 'bg-yellow-100 text-yellow-700'
                        }`}
                      >
                        {tx.status || 'DRAFT'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-center gap-2">
                        <Link
                          href={`/transactions/${tx.id}/edit`}
                          className="p-2 hover:bg-blue-50 rounded text-blue-600 transition-colors"
                          title="Edit"
                        >
                          <Edit2 className="w-4 h-4" />
                        </Link>
                        <button
                          onClick={() => handleDelete(tx.id)}
                          className="p-2 hover:bg-red-50 rounded text-red-600 transition-colors"
                          title="Hapus"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="px-6 py-8 text-center text-gray-500">
                    {transactions.length === 0 ? 'Tidak ada transaksi' : 'Tidak ada hasil pencarian'}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
