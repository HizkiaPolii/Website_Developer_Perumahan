'use client';

import { TransactionType, TransactionStatus, AccountType } from '@/types/financial-system';

// ==================== API Configuration ====================
export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: '/api/auth/login',
    LOGOUT: '/api/auth/logout',
    ME: '/api/auth/me'
  },
  CHART_OF_ACCOUNTS: {
    GET_ALL: '/api/chart-of-accounts',
    GET_BY_ID: '/api/chart-of-accounts/:id',
    CREATE: '/api/chart-of-accounts',
    UPDATE: '/api/chart-of-accounts/:id',
    DELETE: '/api/chart-of-accounts/:id',
    GET_HIERARCHY: '/api/chart-of-accounts/hierarchy/tree',
    GET_BY_TYPE: '/api/chart-of-accounts/type/:type'
  },
  TRANSACTIONS: {
    GET_ALL: '/api/transactions',
    GET_BY_ID: '/api/transactions/:id',
    CREATE: '/api/transactions',
    UPDATE: '/api/transactions/:id',
    DELETE: '/api/transactions/:id',
    APPROVE: '/api/transactions/:id/approve',
    REJECT: '/api/transactions/:id/reject'
  },
  DASHBOARD: {
    STATS: '/api/dashboard/stats',
    RECENT: '/api/dashboard/recent-transactions',
    SUMMARY: '/api/dashboard/summary'
  },
  REPORTS: {
    BALANCE_SHEET: '/api/dashboard/balance-sheet',
    INCOME_STATEMENT: '/api/dashboard/income-statement',
    CASH_FLOW: '/api/dashboard/cash-flow',
    RECONCILIATION: '/api/dashboard/reconciliation',
    FINANCIAL_RATIOS: '/api/dashboard/financial-ratios'
  }
};

// ==================== Formatting Functions ====================
export function formatCurrency(value: number, withSymbol: boolean = true): string {
  const formatted = new Intl.NumberFormat('id-ID', {
    style: withSymbol ? 'currency' : 'decimal',
    currency: 'IDR',
    minimumFractionDigits: 0
  }).format(value);
  return formatted;
}

export function formatDate(date: string | Date, format: 'DISPLAY' | 'ISO' = 'DISPLAY'): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  if (format === 'ISO') {
    return d.toISOString().split('T')[0];
  }
  return new Intl.DateTimeFormat('id-ID', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  }).format(d);
}

export function formatDateTime(date: string | Date): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return new Intl.DateTimeFormat('id-ID', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  }).format(d);
}

// ==================== Validation Functions ====================
export function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

export function validateAmount(amount: number): { valid: boolean; error?: string } {
  if (amount <= 0) {
    return { valid: false, error: 'Jumlah harus lebih dari 0' };
  }
  if (!Number.isFinite(amount)) {
    return { valid: false, error: 'Jumlah tidak valid' };
  }
  return { valid: true };
}

// ==================== Token Management ====================
const TOKEN_KEY = 'token';

export function getToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(TOKEN_KEY);
}

export function setToken(token: string): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(TOKEN_KEY, token);
}

export function removeToken(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(TOKEN_KEY);
}
