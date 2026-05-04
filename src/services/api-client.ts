/**
 * API Client Service
 */

import {
  ApiResponse,
  LoginRequest,
  LoginResponse,
  ChartOfAccount,
  Transaction,
  DashboardStats,
  HttpError,
  TransactionFilters,
  CreateTransactionInput
} from '@/types/financial-system';
import { API_BASE_URL, API_ENDPOINTS, getToken, removeToken } from '@/utils/financial-constants';

class ApiClient {
  private baseURL: string;

  constructor(baseURL: string = API_BASE_URL) {
    this.baseURL = baseURL;
  }

  private async request<T = any>(
    method: 'GET' | 'POST' | 'PUT' | 'DELETE',
    endpoint: string,
    data?: any
  ): Promise<ApiResponse<T>> {
    try {
      const token = getToken();
      const headers: Record<string, string> = {
        'Content-Type': 'application/json'
      };

      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const response = await fetch(`${this.baseURL}${endpoint}`, {
        method,
        headers,
        body: data ? JSON.stringify(data) : undefined,
        credentials: 'include'
      });

      if (response.status === 401) {
        removeToken();
        if (typeof window !== 'undefined') {
          window.location.href = '/auth/login';
        }
      }

      const json = await response.json();
      return json;
    } catch (error: any) {
      return {
        success: false,
        message: error?.message || 'Network error',
        error: 'NETWORK_ERROR'
      };
    }
  }

  // ==================== Authentication ====================
  auth = {
    login: async (data: LoginRequest) =>
      this.request<LoginResponse>('POST', API_ENDPOINTS.AUTH.LOGIN, data),

    logout: async () =>
      this.request('POST', API_ENDPOINTS.AUTH.LOGOUT),

    getCurrentUser: async () =>
      this.request('GET', API_ENDPOINTS.AUTH.ME)
  };

  // ==================== Chart of Accounts ====================
  chartOfAccounts = {
    getAll: async (params?: any) => {
      const queryStr = params ? `?${new URLSearchParams(params).toString()}` : '';
      return this.request<ChartOfAccount[]>('GET', `${API_ENDPOINTS.CHART_OF_ACCOUNTS.GET_ALL}${queryStr}`);
    },

    getById: async (id: number) =>
      this.request<ChartOfAccount>('GET', API_ENDPOINTS.CHART_OF_ACCOUNTS.GET_BY_ID.replace(':id', String(id))),

    create: async (data: any) =>
      this.request<ChartOfAccount>('POST', API_ENDPOINTS.CHART_OF_ACCOUNTS.CREATE, data),

    update: async (id: number, data: any) =>
      this.request<ChartOfAccount>('PUT', API_ENDPOINTS.CHART_OF_ACCOUNTS.UPDATE.replace(':id', String(id)), data),

    delete: async (id: number) =>
      this.request('DELETE', API_ENDPOINTS.CHART_OF_ACCOUNTS.DELETE.replace(':id', String(id))),

    getHierarchy: async () =>
      this.request<ChartOfAccount[]>('GET', API_ENDPOINTS.CHART_OF_ACCOUNTS.GET_HIERARCHY),

    getByType: async (type: string) =>
      this.request<ChartOfAccount[]>('GET', API_ENDPOINTS.CHART_OF_ACCOUNTS.GET_BY_TYPE.replace(':type', type))
  };

  // ==================== Transactions ====================
  transactions = {
    getAll: async (params?: TransactionFilters) => {
      const queryStr = params ? `?${new URLSearchParams(params as any).toString()}` : '';
      return this.request<Transaction[]>('GET', `${API_ENDPOINTS.TRANSACTIONS.GET_ALL}${queryStr}`);
    },

    getById: async (id: number) =>
      this.request<Transaction>('GET', API_ENDPOINTS.TRANSACTIONS.GET_BY_ID.replace(':id', String(id))),

    create: async (data: CreateTransactionInput) =>
      this.request<Transaction>('POST', API_ENDPOINTS.TRANSACTIONS.CREATE, data),

    update: async (id: number, data: any) =>
      this.request<Transaction>('PUT', API_ENDPOINTS.TRANSACTIONS.UPDATE.replace(':id', String(id)), data),

    delete: async (id: number) =>
      this.request('DELETE', API_ENDPOINTS.TRANSACTIONS.DELETE.replace(':id', String(id))),

    approve: async (id: number, data?: any) =>
      this.request<Transaction>('POST', API_ENDPOINTS.TRANSACTIONS.APPROVE.replace(':id', String(id)), data),

    reject: async (id: number, data: any) =>
      this.request<Transaction>('POST', API_ENDPOINTS.TRANSACTIONS.REJECT.replace(':id', String(id)), data)
  };

  // ==================== Dashboard ====================
  dashboard = {
    getStats: async () =>
      this.request<DashboardStats>('GET', API_ENDPOINTS.DASHBOARD.STATS),

    getRecentTransactions: async () =>
      this.request('GET', API_ENDPOINTS.DASHBOARD.RECENT),

    getSummary: async () =>
      this.request('GET', API_ENDPOINTS.DASHBOARD.SUMMARY)
  };

  // ==================== Reports ====================
  reports = {
    getBalanceSheet: async (params?: any) => {
      const queryStr = params ? `?${new URLSearchParams(params).toString()}` : '';
      return this.request('GET', `${API_ENDPOINTS.REPORTS.BALANCE_SHEET}${queryStr}`);
    },

    getIncomeStatement: async (params?: any) => {
      const queryStr = params ? `?${new URLSearchParams(params).toString()}` : '';
      return this.request('GET', `${API_ENDPOINTS.REPORTS.INCOME_STATEMENT}${queryStr}`);
    },

    getCashFlow: async (params?: any) => {
      const queryStr = params ? `?${new URLSearchParams(params).toString()}` : '';
      return this.request('GET', `${API_ENDPOINTS.REPORTS.CASH_FLOW}${queryStr}`);
    }
  };
}

export const apiClient = new ApiClient();
export { ApiClient, HttpError };
