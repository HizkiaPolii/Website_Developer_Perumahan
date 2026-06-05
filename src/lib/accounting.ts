/* ====================================================================
   accounting.ts — Core Accounting Engine
   Tipe data, data default, helper kode akun, roll‑up saldo, buildReports
   ==================================================================== */

// ─── Tipe Data ──────────────────────────────────────────────────────
export type AccountType = 'aset' | 'kewajiban' | 'modal' | 'pendapatan' | 'beban';

export interface Account {
  id: string;
  code: string;
  name: string;
  type: AccountType;
  parentId: string | null;
  isCash: boolean;
  isDrawing: boolean;
  isFixedAsset?: boolean;
}

export interface Transaction {
  id: string;
  date: string;
  description: string;
  debitAccountId: string;
  creditAccountId: string;
  amount: number;
}

// ─── Report Shapes ──────────────────────────────────────────────────
export interface CashFlowItem {
  code: string;
  name: string;
  amount: number; // positive = kas masuk, negative = kas keluar
}

export interface CashFlowGroup {
  label: string;
  items: CashFlowItem[];
  total: number;
}

export interface CashFlowReport {
  operasional: CashFlowGroup[];
  totalOperasional: number;
  investasi: CashFlowGroup[];
  totalInvestasi: number;
  pendanaan: CashFlowGroup[];
  totalPendanaan: number;
  kasAwalPeriode: number;
  perubahanKasBersih: number;
  kasAkhirPeriode: number;
}

export interface ReportAccountNode {
  id: string;
  code: string;
  name: string;
  balance: number;
  children: ReportAccountNode[];
}

export interface IncomeStatement {
  pendapatan: ReportAccountNode[];
  totalPendapatan: number;
  beban: ReportAccountNode[];
  totalBeban: number;
  labaBersih: number;
}

export interface EquityChange {
  modalAwal: number;
  labaBersih: number;
  prive: number;
  ekuitasAkhir: number;
}

export interface BalanceSheet {
  aset: ReportAccountNode[];
  totalAset: number;
  kewajiban: ReportAccountNode[];
  totalKewajiban: number;
  ekuitasAkhir: number;
  totalPasiva: number;
  isBalanced: boolean;
  selisih: number;
}

export interface Reports {
  balances: Record<string, number>;
  cashFlowReport: CashFlowReport;
  incomeStatement: IncomeStatement;
  equityChange: EquityChange;
  balanceSheet: BalanceSheet;
}

// ─── Data Default: Master Akun ──────────────────────────────────────
export const defaultAccounts: Account[] = [
  // ASET (1xx)
  { id: 'a100', code: '100', name: 'Kas Besar',              type: 'aset',       parentId: null,   isCash: true,  isDrawing: false },
  { id: 'a101', code: '101', name: 'Bank Proyek',             type: 'aset',       parentId: null,   isCash: true,  isDrawing: false },
  { id: 'a101-01', code: '101.01', name: 'Bank BCA',          type: 'aset',       parentId: 'a101', isCash: true,  isDrawing: false },
  { id: 'a101-02', code: '101.02', name: 'Bank Mandiri',      type: 'aset',       parentId: 'a101', isCash: true,  isDrawing: false },
  { id: 'a101-03', code: '101.03', name: 'Bank BRI',          type: 'aset',       parentId: 'a101', isCash: true,  isDrawing: false },
  { id: 'a102', code: '102', name: 'Piutang Pembeli',         type: 'aset',       parentId: null,   isCash: false, isDrawing: false },
  { id: 'a102-01', code: '102.01', name: 'Piutang KPR',       type: 'aset',       parentId: 'a102', isCash: false, isDrawing: false },
  { id: 'a102-02', code: '102.02', name: 'Piutang Cash Bertahap', type: 'aset',   parentId: 'a102', isCash: false, isDrawing: false },
  { id: 'a103', code: '103', name: 'Persediaan Tanah',        type: 'aset',       parentId: null,   isCash: false, isDrawing: false },
  { id: 'a104', code: '104', name: 'Persediaan Unit Rumah',   type: 'aset',       parentId: null,   isCash: false, isDrawing: false },
  { id: 'a105', code: '105', name: 'Uang Muka Proyek',        type: 'aset',       parentId: null,   isCash: false, isDrawing: false },
  { id: 'a106', code: '106', name: 'Peralatan Kantor',        type: 'aset',       parentId: null,   isCash: false, isDrawing: false, isFixedAsset: true },

  // KEWAJIBAN (2xx)
  { id: 'l200', code: '200', name: 'Utang Kontraktor',        type: 'kewajiban',  parentId: null,   isCash: false, isDrawing: false },
  { id: 'l201', code: '201', name: 'Utang Usaha',             type: 'kewajiban',  parentId: null,   isCash: false, isDrawing: false },
  { id: 'l202', code: '202', name: 'Utang Bank',              type: 'kewajiban',  parentId: null,   isCash: false, isDrawing: false },

  // MODAL (3xx)
  { id: 'e300', code: '300', name: 'Modal Pemilik',           type: 'modal',      parentId: null,   isCash: false, isDrawing: false },
  { id: 'e301', code: '301', name: 'Prive',                   type: 'modal',      parentId: null,   isCash: false, isDrawing: true  },

  // PENDAPATAN (4xx)
  { id: 'r400', code: '400', name: 'Pendapatan Penjualan Rumah',  type: 'pendapatan', parentId: null, isCash: false, isDrawing: false },
  { id: 'r401', code: '401', name: 'Pendapatan Booking Fee',      type: 'pendapatan', parentId: null, isCash: false, isDrawing: false },
  { id: 'r402', code: '402', name: 'Pendapatan Administrasi KPR', type: 'pendapatan', parentId: null, isCash: false, isDrawing: false },

  // BEBAN (5xx)
  { id: 'x500', code: '500', name: 'Beban Pembangunan',          type: 'beban', parentId: null, isCash: false, isDrawing: false },
  { id: 'x501', code: '501', name: 'Beban Material Bangunan',    type: 'beban', parentId: null, isCash: false, isDrawing: false },
  { id: 'x502', code: '502', name: 'Beban Upah Tukang',          type: 'beban', parentId: null, isCash: false, isDrawing: false },
  { id: 'x503', code: '503', name: 'Beban Infrastruktur',        type: 'beban', parentId: null, isCash: false, isDrawing: false },
  { id: 'x504', code: '504', name: 'Beban Marketing',            type: 'beban', parentId: null, isCash: false, isDrawing: false },
  { id: 'x505', code: '505', name: 'Beban Gaji',                 type: 'beban', parentId: null, isCash: false, isDrawing: false },
  { id: 'x506', code: '506', name: 'Beban Perizinan',            type: 'beban', parentId: null, isCash: false, isDrawing: false },
  { id: 'x507', code: '507', name: 'Beban Operasional Kantor',   type: 'beban', parentId: null, isCash: false, isDrawing: false },
];

// ─── Data Default: Transaksi ────────────────────────────────────────
export const defaultTransactions: Transaction[] = [
  { id: 'trx-1', date: '2026-01-02', description: 'Setoran modal awal proyek perumahan',       debitAccountId: 'a101-01', creditAccountId: 'e300',    amount: 5_000_000_000 },
  { id: 'trx-2', date: '2026-01-10', description: 'Pembelian lahan tahap pertama',              debitAccountId: 'a103',    creditAccountId: 'a101-01', amount: 2_000_000_000 },
  { id: 'trx-3', date: '2026-02-05', description: 'Penerimaan booking fee Blok A-01',           debitAccountId: 'a100',    creditAccountId: 'r401',    amount: 5_000_000 },
  { id: 'trx-4', date: '2026-02-20', description: 'Pembayaran termin kontraktor pondasi',       debitAccountId: 'x500',    creditAccountId: 'a101-01', amount: 150_000_000 },
  { id: 'trx-5', date: '2026-03-01', description: 'Penjualan rumah Blok A-01 (KPR)',            debitAccountId: 'a102-01', creditAccountId: 'r400',    amount: 450_000_000 },
  { id: 'trx-6', date: '2026-03-15', description: 'Biaya iklan digital proyek',                 debitAccountId: 'x504',    creditAccountId: 'a100',    amount: 2_500_000 },
];

// ─── Helper: Generate Kode Akun Otomatis ────────────────────────────
const TYPE_BASE: Record<AccountType, number> = {
  aset: 100, kewajiban: 200, modal: 300, pendapatan: 400, beban: 500,
};

export function generateAccountCode(
  accounts: Account[],
  type: AccountType,
  parentId: string | null,
): string {
  if (parentId) {
    const parent = accounts.find(a => a.id === parentId);
    if (!parent) return '000';
    const siblings = accounts.filter(a => a.parentId === parentId);
    const nextNum = siblings.length + 1;
    return `${parent.code}.${nextNum.toString().padStart(2, '0')}`;
  }

  // Root‑level account
  const roots = accounts.filter(a => a.type === type && !a.parentId);
  if (roots.length === 0) return TYPE_BASE[type].toString();

  const max = Math.max(...roots.map(a => {
    const num = parseInt(a.code, 10);
    return isNaN(num) ? TYPE_BASE[type] - 1 : num;
  }));
  return (max + 1).toString();
}

// ─── Helper: Format IDR ─────────────────────────────────────────────
export function formatIDR(amount: number): string {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0,
  }).format(amount);
}

// ─── Core: buildReports ─────────────────────────────────────────────
// Single function that takes raw accounts + transactions and produces
// every number the UI needs.  Called once on every data change.

export function buildReports(accounts: Account[], transactions: Transaction[]): Reports {
  // 1) Compute leaf‑level balances (normal‑side aware)
  //    Aset & Beban  → debit increases (+), credit decreases (−)
  //    Kewajiban, Modal, Pendapatan → credit increases (+), debit decreases (−)
  const leafBalances: Record<string, number> = {};
  accounts.forEach(a => { leafBalances[a.id] = 0; });

  transactions.forEach(trx => {
    const dAcc = accounts.find(a => a.id === trx.debitAccountId);
    const cAcc = accounts.find(a => a.id === trx.creditAccountId);

    if (dAcc) {
      leafBalances[dAcc.id] += (['aset', 'beban'].includes(dAcc.type) ? 1 : -1) * trx.amount;
    }
    if (cAcc) {
      leafBalances[cAcc.id] += (['aset', 'beban'].includes(cAcc.type) ? -1 : 1) * trx.amount;
    }
  });

  // 2) Roll‑up balances — parent = sum of children
  //    We zero‑out parents that have children, then sum children into them.
  const balances = { ...leafBalances };

  // Find parent IDs that have at least one child
  const parentIds = new Set(accounts.filter(a => a.parentId).map(a => a.parentId!));
  parentIds.forEach(pid => { balances[pid] = 0; });

  // Sort by code length DESC so deepest children processed first
  const sorted = [...accounts].sort((a, b) => b.code.length - a.code.length);
  sorted.forEach(acc => {
    if (acc.parentId && balances[acc.parentId] !== undefined) {
      balances[acc.parentId] += balances[acc.id];
    }
  });

  // 3) Cash Flow Report — classify by counterpart account type
  //    Operasional  = counterpart is pendapatan or beban
  //    Investasi    = counterpart is aset (non-cash)
  //    Pendanaan    = counterpart is modal or kewajiban
  const cashIds = new Set(accounts.filter(a => a.isCash).map(a => a.id));

  // Aggregate net cash effect per counterpart account
  const counterpartMap: Record<string, { code: string; name: string; type: AccountType; isCash: boolean; isFixedAsset: boolean; amount: number }> = {};

  transactions.forEach(trx => {
    const isDebitCash = cashIds.has(trx.debitAccountId);
    const isCreditCash = cashIds.has(trx.creditAccountId);

    // Both cash = internal transfer, skip for cash flow
    if (isDebitCash && isCreditCash) return;

    if (isDebitCash && !isCreditCash) {
      // Cash IN — counterpart is credit account
      const c = accounts.find(a => a.id === trx.creditAccountId);
      if (c) {
        if (!counterpartMap[c.id]) counterpartMap[c.id] = { code: c.code, name: c.name, type: c.type, isCash: c.isCash, isFixedAsset: c.isFixedAsset || false, amount: 0 };
        counterpartMap[c.id].amount += trx.amount;
      }
    } else if (!isDebitCash && isCreditCash) {
      // Cash OUT — counterpart is debit account
      const c = accounts.find(a => a.id === trx.debitAccountId);
      if (c) {
        if (!counterpartMap[c.id]) counterpartMap[c.id] = { code: c.code, name: c.name, type: c.type, isCash: c.isCash, isFixedAsset: c.isFixedAsset || false, amount: 0 };
        counterpartMap[c.id].amount -= trx.amount;
      }
    }
  });

  // Split into categories
  const opPenerimaan: CashFlowItem[] = [];
  const opPengeluaran: CashFlowItem[] = [];
  const invItems: CashFlowItem[] = [];
  const finItems: CashFlowItem[] = [];

  Object.values(counterpartMap).forEach(item => {
    const fi: CashFlowItem = { code: item.code, name: item.name, amount: item.amount };
    if (item.type === 'pendapatan') {
      opPenerimaan.push(fi);
    } else if (item.type === 'beban') {
      opPengeluaran.push(fi);
    } else if (item.type === 'aset' && !item.isCash && item.isFixedAsset) {
      // Aset tetap (peralatan, kendaraan, dll) → Investasi
      invItems.push(fi);
    } else if (item.type === 'aset' && !item.isCash && !item.isFixedAsset) {
      // Aset lancar (piutang, persediaan, uang muka) → Operasional
      opPengeluaran.push(fi);
    } else if (item.type === 'kewajiban' || item.type === 'modal') {
      finItems.push(fi);
    }
  });

  const sortByCode = (a: CashFlowItem, b: CashFlowItem) => a.code.localeCompare(b.code);
  opPenerimaan.sort(sortByCode);
  opPengeluaran.sort(sortByCode);
  invItems.sort(sortByCode);
  finItems.sort(sortByCode);

  const sumItems = (arr: CashFlowItem[]) => arr.reduce((s, i) => s + i.amount, 0);

  const operasionalGroups: CashFlowGroup[] = [];
  if (opPenerimaan.length > 0) {
    operasionalGroups.push({ label: 'Penerimaan Kas dari Pelanggan', items: opPenerimaan, total: sumItems(opPenerimaan) });
  }
  if (opPengeluaran.length > 0) {
    operasionalGroups.push({ label: 'Kas yang Dibayarkan untuk Beban Operasional', items: opPengeluaran, total: sumItems(opPengeluaran) });
  }

  const investasiGroups: CashFlowGroup[] = [];
  if (invItems.length > 0) {
    investasiGroups.push({ label: 'Kas dari Aktivitas Investasi', items: invItems, total: sumItems(invItems) });
  }

  const pendanaanGroups: CashFlowGroup[] = [];
  if (finItems.length > 0) {
    pendanaanGroups.push({ label: 'Kas dari Aktivitas Pendanaan', items: finItems, total: sumItems(finItems) });
  }

  const totalOperasional = operasionalGroups.reduce((s, g) => s + g.total, 0);
  const totalInvestasi = investasiGroups.reduce((s, g) => s + g.total, 0);
  const totalPendanaan = pendanaanGroups.reduce((s, g) => s + g.total, 0);
  const perubahanKasBersih = totalOperasional + totalInvestasi + totalPendanaan;
  const kasAwalPeriode = 0; // Seluruh kas berasal dari transaksi yang tercatat
  const kasAkhirPeriode = kasAwalPeriode + perubahanKasBersih;

  const cashFlowReport: CashFlowReport = {
    operasional: operasionalGroups, totalOperasional,
    investasi: investasiGroups, totalInvestasi,
    pendanaan: pendanaanGroups, totalPendanaan,
    kasAwalPeriode, perubahanKasBersih, kasAkhirPeriode,
  };

  // 4) Build hierarchical report nodes
  const buildNodes = (type: AccountType): ReportAccountNode[] => {
    const ofType = accounts.filter(a => a.type === type);
    const build = (parentId: string | null): ReportAccountNode[] =>
      ofType
        .filter(a => a.parentId === parentId)
        .sort((a, b) => a.code.localeCompare(b.code))
        .map(a => ({ id: a.id, code: a.code, name: a.name, balance: balances[a.id] || 0, children: build(a.id) }));
    return build(null);
  };

  // 5) Income statement
  const pendapatanNodes = buildNodes('pendapatan');
  const bebanNodes = buildNodes('beban');
  const totalPendapatan = pendapatanNodes.reduce((s, n) => s + n.balance, 0);
  const totalBeban = bebanNodes.reduce((s, n) => s + n.balance, 0);
  const labaBersih = totalPendapatan - totalBeban;

  const incomeStatement: IncomeStatement = {
    pendapatan: pendapatanNodes,
    totalPendapatan,
    beban: bebanNodes,
    totalBeban,
    labaBersih,
  };

  // 6) Equity change (perubahan modal)
  const modalRoots = accounts.filter(a => a.type === 'modal' && !a.parentId && !a.isDrawing);
  const priveRoots = accounts.filter(a => a.type === 'modal' && !a.parentId && a.isDrawing);
  const modalAwal = modalRoots.reduce((s, a) => s + (balances[a.id] || 0), 0);
  const prive = Math.abs(priveRoots.reduce((s, a) => s + (balances[a.id] || 0), 0));
  const ekuitasAkhir = modalAwal + labaBersih - prive;

  const equityChange: EquityChange = { modalAwal, labaBersih, prive, ekuitasAkhir };

  // 7) Balance sheet
  const asetNodes = buildNodes('aset');
  const kewajibanNodes = buildNodes('kewajiban');
  const totalAset = asetNodes.reduce((s, n) => s + n.balance, 0);
  const totalKewajiban = kewajibanNodes.reduce((s, n) => s + n.balance, 0);
  const totalPasiva = totalKewajiban + ekuitasAkhir;
  const selisih = Math.abs(totalAset - totalPasiva);

  const balanceSheet: BalanceSheet = {
    aset: asetNodes,
    totalAset,
    kewajiban: kewajibanNodes,
    totalKewajiban,
    ekuitasAkhir,
    totalPasiva,
    isBalanced: selisih < 1, // tolerance for floating point
    selisih,
  };

  return { balances, cashFlowReport, incomeStatement, equityChange, balanceSheet };
}
