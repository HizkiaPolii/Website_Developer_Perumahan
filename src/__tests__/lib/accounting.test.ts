/**
 * Test Suite: Core Accounting Engine
 * File: src/lib/accounting.ts
 *
 * Menggunakan data default yang sudah ada di proyek untuk verifikasi
 * semua perhitungan akuntansi — neraca, laba rugi, arus kas, ekuitas.
 */

import { describe, it, expect } from 'vitest';
import {
  buildReports,
  formatIDR,
  generateAccountCode,
  defaultAccounts,
  defaultTransactions,
  Account,
  Transaction,
} from '@/lib/accounting';

// ─────────────────────────────────────────────────────────────
// 1. formatIDR
// ─────────────────────────────────────────────────────────────
describe('formatIDR', () => {
  it('memformat angka 0 menjadi Rp 0', () => {
    const result = formatIDR(0);
    expect(result).toContain('0');
    expect(result).toContain('Rp');
  });

  it('memformat 5.000.000 dengan separator titik Indonesia', () => {
    const result = formatIDR(5_000_000);
    // Intl.NumberFormat id-ID menggunakan titik sebagai separator ribuan
    expect(result).toContain('5.000.000');
  });

  it('memformat 1.500.000.000 (1,5 Miliar)', () => {
    const result = formatIDR(1_500_000_000);
    expect(result).toContain('1.500.000.000');
  });

  it('memformat angka negatif (rugi)', () => {
    const result = formatIDR(-2_500_000);
    expect(result).toContain('2.500.000');
  });
});

// ─────────────────────────────────────────────────────────────
// 2. generateAccountCode
// ─────────────────────────────────────────────────────────────
describe('generateAccountCode', () => {
  const baseAccounts = defaultAccounts;

  it('menghasilkan kode sub-akun jika ada parentId', () => {
    // Bank Proyek (a101) punya 3 anak: 101.01, 101.02, 101.03
    const code = generateAccountCode(baseAccounts, 'aset', 'a101');
    // Anak berikutnya harusnya 101.04
    expect(code).toBe('101.04');
  });

  it('menghasilkan kode root baru untuk tipe aset', () => {
    // Aset root tertinggi dari defaultAccounts adalah a106 (kode 106)
    const code = generateAccountCode(baseAccounts, 'aset', null);
    // Root baru berikutnya
    expect(parseInt(code)).toBeGreaterThanOrEqual(107);
  });

  it('menghasilkan kode 100 jika belum ada akun aset sama sekali', () => {
    const code = generateAccountCode([], 'aset', null);
    expect(code).toBe('100');
  });

  it('menghasilkan kode 200 untuk kewajiban jika belum ada', () => {
    const code = generateAccountCode([], 'kewajiban', null);
    expect(code).toBe('200');
  });

  it('mengembalikan "000" jika parentId tidak ditemukan', () => {
    const code = generateAccountCode(baseAccounts, 'aset', 'TIDAK_ADA');
    expect(code).toBe('000');
  });
});

// ─────────────────────────────────────────────────────────────
// 3. buildReports — data default
// ─────────────────────────────────────────────────────────────
describe('buildReports dengan data default', () => {
  const reports = buildReports(defaultAccounts, defaultTransactions);

  // ── Laba Rugi ─────────────────────────────────────────────
  describe('Laporan Laba Rugi (Income Statement)', () => {
    it('menghitung total pendapatan = 455.000.000', () => {
      // r400 (Penjualan Rumah): 450M + r401 (Booking Fee): 5M
      expect(reports.incomeStatement.totalPendapatan).toBe(455_000_000);
    });

    it('menghitung total beban = 152.500.000', () => {
      // x500 (Beban Pembangunan): 150M + x504 (Beban Marketing): 2.5M
      expect(reports.incomeStatement.totalBeban).toBe(152_500_000);
    });

    it('menghitung laba bersih = 302.500.000', () => {
      expect(reports.incomeStatement.labaBersih).toBe(302_500_000);
    });

    it('menghasilkan node pendapatan yang benar', () => {
      const nodes = reports.incomeStatement.pendapatan;
      expect(nodes.length).toBeGreaterThan(0);
      const bookingFee = nodes.find(n => n.name === 'Pendapatan Booking Fee');
      expect(bookingFee?.balance).toBe(5_000_000);
    });
  });

  // ── Neraca ────────────────────────────────────────────────
  describe('Neraca (Balance Sheet)', () => {
    it('menghitung total aset = 5.302.500.000', () => {
      // Kas Besar: 2.5M + Bank BCA: 2.85B + Piutang KPR: 450M + Persediaan Tanah: 2B
      expect(reports.balanceSheet.totalAset).toBe(5_302_500_000);
    });

    it('total kewajiban = 0 (tidak ada utang dalam data default)', () => {
      expect(reports.balanceSheet.totalKewajiban).toBe(0);
    });

    it('ekuitas akhir = 5.302.500.000', () => {
      // Modal: 5B + Laba: 302.5M - Prive: 0
      expect(reports.balanceSheet.ekuitasAkhir).toBe(5_302_500_000);
    });

    it('neraca SEIMBANG (totalAset === totalPasiva)', () => {
      expect(reports.balanceSheet.isBalanced).toBe(true);
      expect(reports.balanceSheet.selisih).toBeLessThan(1);
    });

    it('totalPasiva = totalKewajiban + ekuitasAkhir', () => {
      const expected = reports.balanceSheet.totalKewajiban + reports.balanceSheet.ekuitasAkhir;
      expect(reports.balanceSheet.totalPasiva).toBe(expected);
    });
  });

  // ── Perubahan Modal ────────────────────────────────────────
  describe('Laporan Perubahan Modal (Equity Change)', () => {
    it('modal awal = 5.000.000.000 (setoran modal)', () => {
      expect(reports.equityChange.modalAwal).toBe(5_000_000_000);
    });

    it('prive = 0 (tidak ada penarikan modal)', () => {
      expect(reports.equityChange.prive).toBe(0);
    });

    it('ekuitas akhir = modal awal + laba bersih - prive', () => {
      const { modalAwal, labaBersih, prive, ekuitasAkhir } = reports.equityChange;
      expect(ekuitasAkhir).toBe(modalAwal + labaBersih - prive);
    });
  });

  // ── Saldo Akun ────────────────────────────────────────────
  describe('Saldo Akun Individual (balances)', () => {
    it('saldo Bank BCA = 2.850.000.000', () => {
      // +5B (setoran) -2B (beli tanah) -150M (termin kontraktor)
      expect(reports.balances['a101-01']).toBe(2_850_000_000);
    });

    it('saldo Kas Besar = 2.500.000', () => {
      // +5M (booking fee) -2.5M (iklan)
      expect(reports.balances['a100']).toBe(2_500_000);
    });

    it('saldo Piutang KPR = 450.000.000', () => {
      expect(reports.balances['a102-01']).toBe(450_000_000);
    });

    it('saldo Persediaan Tanah = 2.000.000.000', () => {
      expect(reports.balances['a103']).toBe(2_000_000_000);
    });

    it('saldo Modal Pemilik = 5.000.000.000', () => {
      expect(reports.balances['e300']).toBe(5_000_000_000);
    });
  });

  // ── Arus Kas ──────────────────────────────────────────────
  describe('Laporan Arus Kas (Cash Flow)', () => {
    it('kas akhir periode = 2.852.500.000 (saldo semua akun kas)', () => {
      // Kas Besar: 2.5M + Bank BCA: 2.85B = 2.852.500.000
      expect(reports.cashFlowReport.kasAkhirPeriode).toBe(2_852_500_000);
    });

    it('total pendanaan positif (ada setoran modal)', () => {
      // setoran modal 5B via Bank BCA
      expect(reports.cashFlowReport.totalPendanaan).toBeGreaterThan(0);
    });

    it('total operasional negatif (pembelian tanah & beban > penerimaan)', () => {
      // Beli tanah 2B + beban 152.5M > booking fee cash 5M
      expect(reports.cashFlowReport.totalOperasional).toBeLessThan(0);
    });
  });
});

// ─────────────────────────────────────────────────────────────
// 4. buildReports — edge cases
// ─────────────────────────────────────────────────────────────
describe('buildReports — edge cases', () => {
  it('mengembalikan report kosong dengan accounts dan transactions kosong', () => {
    const r = buildReports([], []);
    expect(r.incomeStatement.totalPendapatan).toBe(0);
    expect(r.incomeStatement.totalBeban).toBe(0);
    expect(r.balanceSheet.totalAset).toBe(0);
    expect(r.balanceSheet.isBalanced).toBe(true);
  });

  it('HANYA memproses transaksi dengan status POSTED (mengabaikan PENDING)', () => {
    const acc: Account[] = [
      { id: 'a1', code: '100', name: 'Kas', type: 'aset', parentId: null, isCash: true, isDrawing: false },
      { id: 'r1', code: '400', name: 'Pendapatan', type: 'pendapatan', parentId: null, isCash: false, isDrawing: false },
    ];
    const trxPosted: Transaction = {
      id: 't1', date: '2026-01-01', description: 'Pendapatan diterima',
      debitAccountId: 'a1', creditAccountId: 'r1', amount: 1_000_000, status: 'POSTED',
    };
    const trxPending: Transaction = {
      id: 't2', date: '2026-01-01', description: 'Pending belum disetujui',
      debitAccountId: 'a1', creditAccountId: 'r1', amount: 9_000_000, status: 'PENDING',
    };

    const r = buildReports(acc, [trxPosted, trxPending]);
    // Hanya transaksi POSTED yang masuk
    expect(r.incomeStatement.totalPendapatan).toBe(1_000_000);
    expect(r.balances['r1']).toBe(1_000_000);
  });

  it('memproses transaksi tanpa status (legacy) sebagai POSTED', () => {
    const acc: Account[] = [
      { id: 'a1', code: '100', name: 'Kas', type: 'aset', parentId: null, isCash: true, isDrawing: false },
      { id: 'r1', code: '400', name: 'Pendapatan', type: 'pendapatan', parentId: null, isCash: false, isDrawing: false },
    ];
    const trxNoStatus: Transaction = {
      id: 't1', date: '2026-01-01', description: 'Transaksi lama tanpa status',
      debitAccountId: 'a1', creditAccountId: 'r1', amount: 500_000,
    };

    const r = buildReports(acc, [trxNoStatus]);
    expect(r.incomeStatement.totalPendapatan).toBe(500_000);
  });

  it('prive mengurangi ekuitas akhir', () => {
    const acc: Account[] = [
      { id: 'a1', code: '100', name: 'Kas', type: 'aset', parentId: null, isCash: true, isDrawing: false },
      { id: 'm1', code: '300', name: 'Modal', type: 'modal', parentId: null, isCash: false, isDrawing: false },
      { id: 'p1', code: '301', name: 'Prive Pemilik', type: 'modal', parentId: null, isCash: false, isDrawing: true },
    ];
    const trxModal: Transaction = {
      id: 't1', date: '2026-01-01', description: 'Setoran modal',
      debitAccountId: 'a1', creditAccountId: 'm1', amount: 10_000_000, status: 'POSTED',
    };
    const trxPrive: Transaction = {
      id: 't2', date: '2026-01-15', description: 'Penarikan prive',
      debitAccountId: 'p1', creditAccountId: 'a1', amount: 1_000_000, status: 'POSTED',
    };

    const r = buildReports(acc, [trxModal, trxPrive]);
    // prive = 1M, ekuitas = 10M + 0 - 1M = 9M
    expect(r.equityChange.prive).toBe(1_000_000);
    expect(r.equityChange.ekuitasAkhir).toBe(9_000_000);
  });

  it('roll-up saldo parent = jumlah saldo children', () => {
    const acc: Account[] = [
      { id: 'parent', code: '101', name: 'Bank Proyek', type: 'aset', parentId: null, isCash: true, isDrawing: false },
      { id: 'child1', code: '101.01', name: 'Bank BCA', type: 'aset', parentId: 'parent', isCash: true, isDrawing: false },
      { id: 'child2', code: '101.02', name: 'Bank Mandiri', type: 'aset', parentId: 'parent', isCash: true, isDrawing: false },
      { id: 'm1', code: '300', name: 'Modal', type: 'modal', parentId: null, isCash: false, isDrawing: false },
    ];
    const trx1: Transaction = {
      id: 't1', date: '2026-01-01', description: 'Setoran ke BCA',
      debitAccountId: 'child1', creditAccountId: 'm1', amount: 3_000_000, status: 'POSTED',
    };
    const trx2: Transaction = {
      id: 't2', date: '2026-01-02', description: 'Setoran ke Mandiri',
      debitAccountId: 'child2', creditAccountId: 'm1', amount: 2_000_000, status: 'POSTED',
    };

    const r = buildReports(acc, [trx1, trx2]);
    expect(r.balances['child1']).toBe(3_000_000);
    expect(r.balances['child2']).toBe(2_000_000);
    expect(r.balances['parent']).toBe(5_000_000); // sum of children
  });
});
