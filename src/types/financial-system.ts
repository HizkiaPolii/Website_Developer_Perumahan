/**
 * TypeScript Types & Interfaces
 */

// ==================== Auth ====================
export interface CurrentUser {
  id: number;
  email: string;
  name: string;
  role: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  user: CurrentUser;
}

// ==================== Chart of Accounts ====================
export type AccountType = 'ASSET' | 'LIABILITY' | 'EQUITY' | 'REVENUE' | 'EXPENSE';
export type AccountLevel = 1 | 2 | 3 | 4;

export interface ChartOfAccount {
  id: number;
  companyId: number;
  accountCode: string;
  accountName: string;
  accountType: AccountType;
  parentId: number | null;
  level: AccountLevel;
  isActive: boolean;
  isCashFlow: boolean;
  createdAt: string;
  updatedAt: string;
}

// ==================== Transactions ====================
export type TransactionType = 'PENDAPATAN' | 'PENGELUARAN' | 'TRANSFER' | 'PENYESUAIAN';
export type TransactionStatus = 'DRAFT' | 'PENDING' | 'APPROVED' | 'REJECTED' | 'POSTED';

export interface Transaction {
  id: number;
  companyId: number;
  userId: number;
  transactionCode: string;
  transactionDate: string;
  transactionType: TransactionType;
  description: string;
  debitAccountId: number;
  creditAccountId: number;
  amount: number;
  status: TransactionStatus;
  approvedBy?: number | null;
  approvedAt?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CreateTransactionInput {
  companyId: number;
  userId: number;
  transactionDate: string;
  transactionType: TransactionType;
  description: string;
  debitAccountId: number;
  creditAccountId: number;
  amount: number;
}

export interface UpdateTransactionInput {
  transactionDate?: string;
  description?: string;
  debitAccountId?: number;
  creditAccountId?: number;
  amount?: number;
}

// ==================== Dashboard ====================
export interface DashboardStats {
  totalRevenue: number;
  totalExpense: number;
  netProfit: number;
  profitMargin: number;
  totalAssets: number;
  totalLiabilities: number;
  totalEquity: number;
}

export interface RecentTransaction {
  id: number;
  transactionCode: string;
  transactionDate: string;
  description: string;
  amount: number;
  type: TransactionType;
  status: TransactionStatus;
}

// ==================== API Response ====================
export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data?: T;
  error?: string;
}

export interface PaginationParams {
  page?: number;
  limit?: number;
}

export interface Pagination {
  page: number;
  limit: number;
  total: number;
  pages: number;
}

export class HttpError extends Error {
  constructor(
    public status: number,
    message: string,
    public code?: string
  ) {
    super(message);
    this.name = 'HttpError';
  }
}

// ==================== Filter ====================
export interface TransactionFilters extends PaginationParams {
  companyId?: number;
  status?: TransactionStatus;
  type?: TransactionType;
  from?: string;
  to?: string;
}

export interface ChartOfAccountsFilters extends PaginationParams {
  type?: AccountType;
  isActive?: boolean;
}
