"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import { useApi } from "./useApi";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/contexts/ToastContext";
import {
  Account, Transaction, Reports,
  buildReports,
} from "@/lib/accounting";

export function useAccountingStore() {
  const { call } = useApi();
  const { token, user, isAuthenticated } = useAuth();
  const { addToast } = useToast();

  const [accounts, setAccounts] = useState<Account[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [ready, setReady] = useState(false);
  const [loading, setLoading] = useState(false);

  // Helper type mapping
  const typeMap: Record<string, 'aset' | 'kewajiban' | 'modal' | 'pendapatan' | 'beban'> = {
    ASSET: "aset",
    LIABILITY: "kewajiban",
    EQUITY: "modal",
    REVENUE: "pendapatan",
    EXPENSE: "beban",
  };

  const loadData = useCallback(async () => {
    if (!isAuthenticated || !token) {
      setReady(true);
      return;
    }
    setLoading(true);
    try {
      // Fetch Chart of Accounts
      const accountsRes = await call("GET", "/api/chart-of-accounts");
      if (accountsRes && accountsRes.success === false) {
        throw new Error(accountsRes.message || "Gagal memuat Chart of Accounts");
      }
      const dbAccounts = Array.isArray(accountsRes.data)
        ? accountsRes.data
        : Array.isArray(accountsRes)
        ? accountsRes
        : [];
      const normalizedAccounts: Account[] = dbAccounts.map((acc: any) => ({
        id: acc.id.toString(),
        code: acc.accountCode,
        name: acc.accountName,
        type: typeMap[acc.accountType] || "aset",
        parentId: acc.parentId ? acc.parentId.toString() : null,
        isCash: acc.isCashFlow || false,
        isFixedAsset: acc.isFixedAsset || false,
        isDrawing: acc.accountName.toLowerCase().includes("prive") || acc.accountName.toLowerCase().includes("drawing")
      }));

      // Fetch Transactions
      const transactionsRes = await call("GET", "/api/transactions?limit=1000");
      if (transactionsRes && transactionsRes.success === false) {
        throw new Error(transactionsRes.message || "Gagal memuat data transaksi");
      }
      const dbTransactions = Array.isArray(transactionsRes.data)
        ? transactionsRes.data
        : Array.isArray(transactionsRes)
        ? transactionsRes
        : [];
      const normalizedTransactions: Transaction[] = dbTransactions.map((trx: any) => ({
        id: trx.id.toString(),
        date: trx.transactionDate.split("T")[0],
        description: trx.description,
        debitAccountId: trx.debitAccountId.toString(),
        creditAccountId: trx.creditAccountId.toString(),
        amount: parseFloat(trx.amount.toString()),
        status: trx.status,
        rejectionReason: trx.rejectionReason ?? undefined,
      }));

      setAccounts(normalizedAccounts);
      setTransactions(normalizedTransactions);
      setReady(true);
    } catch (err: any) {
      console.error("Failed to load accounting data from backend:", err);
      setAccounts([]);
      setTransactions([]);
      setReady(true);
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated, token, call]);

  // Load on mount or auth change
  useEffect(() => {
    loadData();
  }, [loadData]);

  // Listen to custom events for data updates (e.g. transaction approval)
  useEffect(() => {
    const handleUpdate = () => {
      loadData();
    };
    window.addEventListener("approvalDataChanged", handleUpdate);
    window.addEventListener("transactionDataChanged", handleUpdate);
    return () => {
      window.removeEventListener("approvalDataChanged", handleUpdate);
      window.removeEventListener("transactionDataChanged", handleUpdate);
    };
  }, [loadData]);

  // CRUD: Accounts
  const addAccount = async (account: Account) => {
    if (!user) return;
    try {
      setLoading(true);
      const reverseTypeMap: Record<string, string> = {
        aset: "ASSET",
        kewajiban: "LIABILITY",
        modal: "EQUITY",
        pendapatan: "REVENUE",
        beban: "EXPENSE",
      };

      const payload = {
        companyId: user.companyId ? parseInt(user.companyId.toString()) : 1,
        accountCode: account.code,
        accountName: account.name,
        accountType: reverseTypeMap[account.type] || "ASSET",
        level: account.code.split(".").length,
        parentId: account.parentId ? parseInt(account.parentId) : undefined,
        description: account.name,
        isCashFlow: account.isCash || false,
        isFixedAsset: account.isFixedAsset || false,
      };

      const res = await call("POST", "/api/chart-of-accounts", payload);
      if (res && res.success === false) {
        throw new Error(res.message || "Gagal membuat akun");
      }
      addToast("Akun berhasil dibuat", "success");
      await loadData();
    } catch (err: any) {
      addToast(err.message || "Gagal membuat akun di backend", "error");
    } finally {
      setLoading(false);
    }
  };

  const deleteAccount = async (id: string) => {
    try {
      setLoading(true);
      const res = await call("DELETE", `/api/chart-of-accounts/${id}`);
      if (res && res.success === false) {
        throw new Error(res.message || "Gagal menghapus akun");
      }
      addToast("Akun berhasil dihapus", "success");
      await loadData();
    } catch (err: any) {
      addToast(err.message || "Gagal menghapus akun dari backend", "error");
    } finally {
      setLoading(false);
    }
  };

  const updateAccount = async (id: string, patch: Partial<Account>) => {
    try {
      setLoading(true);
      const reverseTypeMap: Record<string, string> = {
        aset: "ASSET",
        kewajiban: "LIABILITY",
        modal: "EQUITY",
        pendapatan: "REVENUE",
        beban: "EXPENSE",
      };

      const payload: any = {};
      if (patch.name) payload.accountName = patch.name;
      if (patch.code) {
        payload.accountCode = patch.code;
        payload.level = patch.code.split(".").length;
      }
      if (patch.type) payload.accountType = reverseTypeMap[patch.type];
      if (patch.isCash !== undefined) payload.isCashFlow = patch.isCash;
      if (patch.isFixedAsset !== undefined) payload.isFixedAsset = patch.isFixedAsset;

      const res = await call("PUT", `/api/chart-of-accounts/${id}`, payload);
      if (res && res.success === false) {
        throw new Error(res.message || "Gagal memperbarui akun");
      }
      addToast("Akun berhasil diperbarui", "success");
      await loadData();
    } catch (err: any) {
      addToast(err.message || "Gagal memperbarui akun di backend", "error");
    } finally {
      setLoading(false);
    }
  };

  // CRUD: Transactions
  const addTransaction = async (trx: Transaction) => {
    if (!user) return;
    try {
      setLoading(true);
      
      // Infer transactionType
      let transactionType = "TRANSFER";
      const debitAcc = accounts.find(a => a.id === trx.debitAccountId);
      const creditAcc = accounts.find(a => a.id === trx.creditAccountId);
      if (debitAcc?.type === "pendapatan" || creditAcc?.type === "pendapatan") {
        transactionType = "PENDAPATAN";
      } else if (debitAcc?.type === "beban" || creditAcc?.type === "beban") {
        transactionType = "PENGELUARAN";
      }

      const payload = {
        companyId: user.companyId ? parseInt(user.companyId.toString()) : 1,
        userId: parseInt(user.id.toString()),
        transactionDate: trx.date,
        transactionType,
        description: trx.description,
        debitAccountId: parseInt(trx.debitAccountId),
        creditAccountId: parseInt(trx.creditAccountId),
        amount: trx.amount,
      };

      const res = await call("POST", "/api/transactions", payload);
      if (res && res.success === false) {
        throw new Error(res.message || "Gagal menyimpan transaksi");
      }
      addToast("Transaksi berhasil diajukan dan menunggu persetujuan Manager", "success", 4000);
      
      window.dispatchEvent(new CustomEvent("transactionDataChanged"));
      await loadData();
    } catch (err: any) {
      addToast(err.message || "Gagal menyimpan transaksi ke backend", "error");
    } finally {
      setLoading(false);
    }
  };

  const deleteTransaction = async (id: string) => {
    try {
      setLoading(true);
      const res = await call("DELETE", `/api/transactions/${id}`);
      if (res && res.success === false) {
        throw new Error(res.message || "Gagal menghapus transaksi");
      }
      addToast("Transaksi berhasil dihapus", "success");
      
      window.dispatchEvent(new CustomEvent("transactionDataChanged"));
      await loadData();
    } catch (err: any) {
      addToast(err.message || "Gagal menghapus transaksi dari backend", "error");
    } finally {
      setLoading(false);
    }
  };

  const updateTransaction = async (id: string, patch: Partial<Transaction>) => {
    try {
      setLoading(true);
      const payload: any = {};
      if (patch.date) payload.transactionDate = patch.date;
      if (patch.description) payload.description = patch.description;
      if (patch.debitAccountId) payload.debitAccountId = parseInt(patch.debitAccountId);
      if (patch.creditAccountId) payload.creditAccountId = parseInt(patch.creditAccountId);
      if (patch.amount) payload.amount = patch.amount;

      const res = await call("PUT", `/api/transactions/${id}`, payload);
      if (res && res.success === false) {
        throw new Error(res.message || "Gagal memperbarui transaksi");
      }
      addToast("Transaksi berhasil diperbarui", "success");
      
      window.dispatchEvent(new CustomEvent("transactionDataChanged"));
      await loadData();
    } catch (err: any) {
      addToast(err.message || "Gagal memperbarui transaksi di backend", "error");
    } finally {
      setLoading(false);
    }
  };

  const resetData = () => {
    loadData();
  };

  // buildReports — recalculated on every data change
  const reports: Reports = useMemo(
    () => buildReports(accounts, transactions),
    [accounts, transactions],
  );

  return {
    accounts,
    transactions,
    reports,
    ready,
    loading,
    addAccount,
    deleteAccount,
    updateAccount,
    addTransaction,
    deleteTransaction,
    updateTransaction,
    resetData,
    refetch: loadData,
  };
}
