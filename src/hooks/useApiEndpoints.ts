'use client';

import { useState, useCallback } from 'react';
import { useApi } from './useApi';
import {
  ChartOfAccount,
  Transaction,
  DashboardStats,
  TransactionFilters,
  CreateTransactionInput
} from '@/types/financial-system';

const getResponseData = <T,>(response: any, fallback: T): T => {
  if (Array.isArray(response)) return response as T;
  return response?.data ?? fallback;
};

const normalizeChartOfAccount = (account: any): ChartOfAccount => ({
  ...account,
  companyId: account.companyId ?? account.company_id,
  accountCode: account.accountCode ?? account.account_code,
  accountName: account.accountName ?? account.account_name,
  accountType: account.accountType ?? account.account_type,
  parentId: account.parentId ?? account.parent_id ?? null,
  isActive: account.isActive ?? account.is_active ?? true,
  isCashFlow: account.isCashFlow ?? account.is_cash_flow ?? false,
  createdAt: account.createdAt ?? account.created_at,
  updatedAt: account.updatedAt ?? account.updated_at,
});

const normalizeFinancialReport = (report: any) => ({
  ...report,
  companyId: report.companyId ?? report.company_id,
  reportType: report.reportType ?? report.report_type,
  reportDate: report.reportDate ?? report.report_date,
  periodStart: report.periodStart ?? report.period_start,
  periodEnd: report.periodEnd ?? report.period_end,
  reportData: report.reportData ?? report.report_data,
  finalizedBy: report.finalizedBy ?? report.finalized_by,
  finalizedAt: report.finalizedAt ?? report.finalized_at,
  createdBy: report.createdBy ?? report.created_by,
  createdAt: report.createdAt ?? report.created_at,
  updatedAt: report.updatedAt ?? report.updated_at,
});

/**
 * Hook untuk Dashboard API calls
 */
export function useDashboard() {
  const { call } = useApi();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getStats = useCallback(async (): Promise<DashboardStats | null> => {
    try {
      setLoading(true);
      setError(null);
      console.log('📊 Fetching dashboard stats...');
      const response = await call('GET', '/api/dashboard/stats');
      console.log('✅ Stats fetched:', response);
      return response.data || null;
    } catch (err: any) {
      const errorMsg = err.message || 'Unknown error';
      console.error('❌ Error fetching stats:', errorMsg);
      setError(errorMsg);
      return null;
    } finally {
      setLoading(false);
    }
  }, [call]);

  const getRecentTransactions = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      console.log('💼 Fetching recent transactions...');
      const response = await call('GET', '/api/dashboard/recent-transactions');
      console.log('✅ Transactions fetched:', response);
      return response.data || [];
    } catch (err: any) {
      const errorMsg = err.message || 'Unknown error';
      console.error('❌ Error fetching transactions:', errorMsg);
      setError(errorMsg);
      return [];
    } finally {
      setLoading(false);
    }
  }, [call]);

  return { getStats, getRecentTransactions, loading, error };
}

/**
 * Hook untuk Chart of Accounts API calls
 */
export function useChartOfAccounts() {
  const { callWithFallback } = useApi();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getAll = useCallback(async (): Promise<ChartOfAccount[]> => {
    try {
      setLoading(true);
      setError(null);
      const response = await callWithFallback('GET', [
        '/api/chart-of-accounts',
        '/api/accounts'
      ]);
      return getResponseData<any[]>(response, []).map(normalizeChartOfAccount);
    } catch (err: any) {
      setError(err.message);
      return [];
    } finally {
      setLoading(false);
    }
  }, [callWithFallback]);

  const getById = useCallback(async (id: number): Promise<ChartOfAccount | null> => {
    try {
      setLoading(true);
      setError(null);
      const response = await callWithFallback('GET', [
        `/api/chart-of-accounts/${id}`,
        `/api/accounts/${id}`
      ]);
      const data = getResponseData<any | null>(response, null);
      return data ? normalizeChartOfAccount(data) : null;
    } catch (err: any) {
      setError(err.message);
      return null;
    } finally {
      setLoading(false);
    }
  }, [callWithFallback]);

  const getByType = useCallback(async (type: string): Promise<ChartOfAccount[]> => {
    try {
      setLoading(true);
      setError(null);
      const response = await callWithFallback('GET', [
        `/api/chart-of-accounts/type/${type}`,
        `/api/accounts/by-type/${type}`,
        `/api/accounts/type/${type}`
      ]);
      return getResponseData<any[]>(response, []).map(normalizeChartOfAccount);
    } catch (err: any) {
      setError(err.message);
      return [];
    } finally {
      setLoading(false);
    }
  }, [callWithFallback]);

  return { getAll, getById, getByType, loading, error };
}

/**
 * Hook untuk Transactions API calls
 */
export function useTransactions() {
  const { call } = useApi();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getAll = useCallback(
    async (params?: TransactionFilters): Promise<Transaction[]> => {
      try {
        setLoading(true);
        setError(null);
        const queryStr = params
          ? `?${new URLSearchParams(params as any).toString()}`
          : '';
        const response = await call('GET', `/api/transactions${queryStr}`);
        return response.data || [];
      } catch (err: any) {
        setError(err.message);
        return [];
      } finally {
        setLoading(false);
      }
    },
    [call]
  );

  const getById = useCallback(async (id: number): Promise<Transaction | null> => {
    try {
      setLoading(true);
      setError(null);
      const response = await call('GET', `/api/transactions/${id}`);
      return response.data || null;
    } catch (err: any) {
      setError(err.message);
      return null;
    } finally {
      setLoading(false);
    }
  }, [call]);

  const create = useCallback(
    async (data: CreateTransactionInput): Promise<Transaction | null> => {
      try {
        setLoading(true);
        setError(null);
        const response = await call('POST', '/api/transactions', data);
        return response.data || null;
      } catch (err: any) {
        setError(err.message);
        return null;
      } finally {
        setLoading(false);
      }
    },
    [call]
  );

  const update = useCallback(
    async (id: number, data: any): Promise<Transaction | null> => {
      try {
        setLoading(true);
        setError(null);
        const response = await call('PUT', `/api/transactions/${id}`, data);
        return response.data || null;
      } catch (err: any) {
        setError(err.message);
        return null;
      } finally {
        setLoading(false);
      }
    },
    [call]
  );

  const delete_ = useCallback(async (id: number): Promise<boolean> => {
    try {
      setLoading(true);
      setError(null);
      const response = await call('DELETE', `/api/transactions/${id}`);
      return response.success;
    } catch (err: any) {
      setError(err.message);
      return false;
    } finally {
      setLoading(false);
    }
  }, [call]);

  const approve = useCallback(async (id: number): Promise<Transaction | null> => {
    try {
      setLoading(true);
      setError(null);
      const response = await call('POST', `/api/transactions/${id}/approve`, {});
      return response.data || null;
    } catch (err: any) {
      setError(err.message);
      return null;
    } finally {
      setLoading(false);
    }
  }, [call]);

  const reject = useCallback(
    async (id: number, reason: string): Promise<Transaction | null> => {
      try {
        setLoading(true);
        setError(null);
        const response = await call('POST', `/api/transactions/${id}/reject`, {
          rejectionReason: reason
        });
        return response.data || null;
      } catch (err: any) {
        setError(err.message);
        return null;
      } finally {
        setLoading(false);
      }
    },
    [call]
  );

  return { getAll, getById, create, update, delete: delete_, approve, reject, loading, error };
}

/**
 * Hook untuk Users API calls
 */
export function useUsers() {
  const { call } = useApi();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getAll = useCallback(async (): Promise<any[]> => {
    try {
      setLoading(true);
      setError(null);
      const response = await call('GET', '/api/users');
      return response.data || [];
    } catch (err: any) {
      setError(err.message);
      return [];
    } finally {
      setLoading(false);
    }
  }, [call]);

  const getById = useCallback(async (id: number): Promise<any | null> => {
    try {
      setLoading(true);
      setError(null);
      const response = await call('GET', `/api/users/${id}`);
      return response.data || null;
    } catch (err: any) {
      setError(err.message);
      return null;
    } finally {
      setLoading(false);
    }
  }, [call]);

  const create = useCallback(async (data: any): Promise<any | null> => {
    try {
      setLoading(true);
      setError(null);
      const response = await call('POST', '/api/users', data);
      return response.data || null;
    } catch (err: any) {
      setError(err.message);
      return null;
    } finally {
      setLoading(false);
    }
  }, [call]);

  const update = useCallback(async (id: number, data: any): Promise<any | null> => {
    try {
      setLoading(true);
      setError(null);
      const response = await call('PUT', `/api/users/${id}`, data);
      return response.data || null;
    } catch (err: any) {
      setError(err.message);
      return null;
    } finally {
      setLoading(false);
    }
  }, [call]);

  const delete_ = useCallback(async (id: number): Promise<boolean> => {
    try {
      setLoading(true);
      setError(null);
      const response = await call('DELETE', `/api/users/${id}`);
      return response.success;
    } catch (err: any) {
      setError(err.message);
      return false;
    } finally {
      setLoading(false);
    }
  }, [call]);

  return { getAll, getById, create, update, delete: delete_, loading, error };
}

/**
 * Hook untuk Activity Logs API calls
 */
export function useActivityLogs() {
  const { call } = useApi();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getAll = useCallback(async (params?: any): Promise<any[]> => {
    try {
      setLoading(true);
      setError(null);
      const queryStr = params
        ? `?${new URLSearchParams(params).toString()}`
        : '';
      const response = await call('GET', `/api/activity-logs${queryStr}`);
      return response.data || [];
    } catch (err: any) {
      setError(err.message);
      return [];
    } finally {
      setLoading(false);
    }
  }, [call]);

  const getById = useCallback(async (id: number): Promise<any | null> => {
    try {
      setLoading(true);
      setError(null);
      const response = await call('GET', `/api/activity-logs/${id}`);
      return response.data || null;
    } catch (err: any) {
      setError(err.message);
      return null;
    } finally {
      setLoading(false);
    }
  }, [call]);

  return { getAll, getById, loading, error };
}

/**
 * Hook untuk Financial Reports API calls
 */
export function useFinancialReports() {
  const { callWithFallback } = useApi();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getAll = useCallback(async (params?: any): Promise<any[]> => {
    try {
      setLoading(true);
      setError(null);
      const queryStr = params
        ? `?${new URLSearchParams(params).toString()}`
        : '';
      const response = await callWithFallback('GET', [
        `/api/financial-reports${queryStr}`,
        `/api/reports${queryStr}`,
        `/api/dashboard/reports${queryStr}`
      ]);
      return getResponseData<any[]>(response, []).map(normalizeFinancialReport);
    } catch (err: any) {
      setError(err.message);
      return [];
    } finally {
      setLoading(false);
    }
  }, [callWithFallback]);

  const getById = useCallback(async (id: number): Promise<any | null> => {
    try {
      setLoading(true);
      setError(null);
      const response = await callWithFallback('GET', [
        `/api/financial-reports/${id}`,
        `/api/reports/${id}`,
        `/api/dashboard/reports/${id}`
      ]);
      const data = getResponseData<any | null>(response, null);
      return data ? normalizeFinancialReport(data) : null;
    } catch (err: any) {
      setError(err.message);
      return null;
    } finally {
      setLoading(false);
    }
  }, [callWithFallback]);

  const update = useCallback(async (id: number, data: any): Promise<any | null> => {
    try {
      setLoading(true);
      setError(null);
      const response = await callWithFallback('PUT', [
        `/api/financial-reports/${id}`,
        `/api/reports/${id}`,
        `/api/dashboard/reports/${id}`
      ], data);
      const updated = getResponseData<any | null>(response, null);
      return updated ? normalizeFinancialReport(updated) : null;
    } catch (err: any) {
      setError(err.message);
      return null;
    } finally {
      setLoading(false);
    }
  }, [callWithFallback]);

  const finalize = useCallback(async (id: number, finalizedBy: number, notes?: string): Promise<any | null> => {
    try {
      setLoading(true);
      setError(null);
      const response = await callWithFallback('POST', [
        `/api/financial-reports/${id}/finalize`,
        `/api/reports/${id}/finalize`,
        `/api/dashboard/reports/${id}/finalize`
      ], {
        finalizedBy,
        notes
      });
      const data = getResponseData<any | null>(response, null);
      return data ? normalizeFinancialReport(data) : null;
    } catch (err: any) {
      setError(err.message);
      return null;
    } finally {
      setLoading(false);
    }
  }, [callWithFallback]);

  const generateBalanceSheet = useCallback(async (data: any): Promise<any | null> => {
    try {
      setLoading(true);
      setError(null);
      const response = await callWithFallback('POST', [
        '/api/reports/balance-sheet/generate',
        '/api/financial-reports/balance-sheet/generate',
        '/api/dashboard/balance-sheet'
      ], data);
      const generated = getResponseData<any | null>(response, null);
      return generated ? normalizeFinancialReport(generated) : null;
    } catch (err: any) {
      setError(err.message);
      return null;
    } finally {
      setLoading(false);
    }
  }, [callWithFallback]);

  const generateIncomeStatement = useCallback(async (data: any): Promise<any | null> => {
    try {
      setLoading(true);
      setError(null);
      const response = await callWithFallback('POST', [
        '/api/reports/income-statement/generate',
        '/api/financial-reports/income-statement/generate',
        '/api/dashboard/income-statement'
      ], data);
      const generated = getResponseData<any | null>(response, null);
      return generated ? normalizeFinancialReport(generated) : null;
    } catch (err: any) {
      setError(err.message);
      return null;
    } finally {
      setLoading(false);
    }
  }, [callWithFallback]);

  // Granular Item Management
  const getItems = useCallback(async (reportId: number) => {
    try {
      setLoading(true);
      setError(null);
      const response = await callWithFallback('GET', [`/api/dashboard/reports/${reportId}/items`, `/api/reports/${reportId}/items`]);
      return response.data || [];
    } catch (err: any) {
      setError(err.message);
      return [];
    } finally {
      setLoading(false);
    }
  }, [callWithFallback]);

  const createItem = useCallback(async (data: any) => {
    try {
      setLoading(true);
      setError(null);
      const response = await callWithFallback('POST', ['/api/dashboard/reports/items', '/api/reports/items'], data);
      return response.data || null;
    } catch (err: any) {
      setError(err.message);
      return null;
    } finally {
      setLoading(false);
    }
  }, [callWithFallback]);

  const updateItem = useCallback(async (id: number, data: any) => {
    try {
      setLoading(true);
      setError(null);
      const response = await callWithFallback('PUT', [`/api/dashboard/reports/items/${id}`, `/api/reports/items/${id}`], data);
      return response.data || null;
    } catch (err: any) {
      setError(err.message);
      return null;
    } finally {
      setLoading(false);
    }
  }, [callWithFallback]);

  const deleteItem = useCallback(async (id: number) => {
    try {
      setLoading(true);
      setError(null);
      const response = await callWithFallback('DELETE', [`/api/dashboard/reports/items/${id}`, `/api/reports/items/${id}`]);
      return response.success;
    } catch (err: any) {
      setError(err.message);
      return false;
    } finally {
      setLoading(false);
    }
  }, [callWithFallback]);

  const remove = useCallback(async (id: number) => {
    try {
      setLoading(true);
      setError(null);
      const response = await callWithFallback('DELETE', [
        `/api/financial-reports/${id}`,
        `/api/reports/${id}`,
        `/api/dashboard/reports/${id}`
      ]);
      return response.success;
    } catch (err: any) {
      setError(err.message);
      return false;
    } finally {
      setLoading(false);
    }
  }, [callWithFallback]);

  // Income Statement Item Management
  const getIncomeItems = useCallback(async (reportId: number) => {
    try {
      setLoading(true);
      setError(null);
      const response = await callWithFallback('GET', [`/api/dashboard/reports/income-statement/${reportId}/items`]);
      return response.data || [];
    } catch (err: any) {
      setError(err.message);
      return [];
    } finally {
      setLoading(false);
    }
  }, [callWithFallback]);

  const createIncomeItem = useCallback(async (data: any) => {
    try {
      setLoading(true);
      setError(null);
      const response = await callWithFallback('POST', ['/api/dashboard/reports/income-statement/items'], data);
      return response.data || null;
    } catch (err: any) {
      setError(err.message);
      return null;
    } finally {
      setLoading(false);
    }
  }, [callWithFallback]);

  const updateIncomeItem = useCallback(async (id: number, data: any) => {
    try {
      setLoading(true);
      setError(null);
      const response = await callWithFallback('PUT', [`/api/dashboard/reports/income-statement/items/${id}`], data);
      return response.data || null;
    } catch (err: any) {
      setError(err.message);
      return null;
    } finally {
      setLoading(false);
    }
  }, [callWithFallback]);

  const deleteIncomeItem = useCallback(async (id: number) => {
    try {
      setLoading(true);
      setError(null);
      const response = await callWithFallback('DELETE', [`/api/dashboard/reports/income-statement/items/${id}`]);
      return response.success;
    } catch (err: any) {
      setError(err.message);
      return false;
    } finally {
      setLoading(false);
    }
  }, [callWithFallback]);

  return { 
    getAll, 
    getById, 
    update, 
    finalize, 
    generateBalanceSheet,
    generateIncomeStatement,
    getItems,
    createItem,
    updateItem,
    deleteItem,
    getIncomeItems,
    createIncomeItem,
    updateIncomeItem,
    deleteIncomeItem,
    remove,
    loading, 
    error 
  };
}
