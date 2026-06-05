"use client";

import { useState, useEffect, useMemo } from "react";
import {
  Account, Transaction, Reports,
  defaultAccounts, defaultTransactions,
  buildReports,
} from "@/lib/accounting";

const ACCOUNTS_KEY = "prodev_accounts";
const TRANSACTIONS_KEY = "prodev_transactions";

export function useAccountingStore() {
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [ready, setReady] = useState(false);

  // ── Load from localStorage on mount ───────────────────────────────
  useEffect(() => {
    try {
      const rawA = localStorage.getItem(ACCOUNTS_KEY);
      const rawT = localStorage.getItem(TRANSACTIONS_KEY);
      if (rawA && rawT) {
        setAccounts(JSON.parse(rawA));
        setTransactions(JSON.parse(rawT));
      } else {
        setAccounts(defaultAccounts);
        setTransactions(defaultTransactions);
        localStorage.setItem(ACCOUNTS_KEY, JSON.stringify(defaultAccounts));
        localStorage.setItem(TRANSACTIONS_KEY, JSON.stringify(defaultTransactions));
      }
    } catch {
      setAccounts(defaultAccounts);
      setTransactions(defaultTransactions);
    }
    setReady(true);
  }, []);

  // ── Persist helpers ───────────────────────────────────────────────
  const persist = (a: Account[], t: Transaction[]) => {
    localStorage.setItem(ACCOUNTS_KEY, JSON.stringify(a));
    localStorage.setItem(TRANSACTIONS_KEY, JSON.stringify(t));
  };

  // ── CRUD: Accounts ───────────────────────────────────────────────
  const addAccount = (account: Account) => {
    const next = [...accounts, account];
    setAccounts(next);
    persist(next, transactions);
  };

  const updateAccount = (id: string, patch: Partial<Account>) => {
    const next = accounts.map(a => (a.id === id ? { ...a, ...patch } : a));
    setAccounts(next);
    persist(next, transactions);
  };

  const deleteAccount = (id: string) => {
    // Also remove children
    const idsToRemove = new Set<string>();
    const collectChildren = (pid: string) => {
      idsToRemove.add(pid);
      accounts.filter(a => a.parentId === pid).forEach(c => collectChildren(c.id));
    };
    collectChildren(id);
    const next = accounts.filter(a => !idsToRemove.has(a.id));
    setAccounts(next);
    persist(next, transactions);
  };

  // ── CRUD: Transactions ────────────────────────────────────────────
  const addTransaction = (trx: Transaction) => {
    const next = [...transactions, trx];
    setTransactions(next);
    persist(accounts, next);
  };

  const updateTransaction = (id: string, patch: Partial<Transaction>) => {
    const next = transactions.map(t => (t.id === id ? { ...t, ...patch } : t));
    setTransactions(next);
    persist(accounts, next);
  };

  const deleteTransaction = (id: string) => {
    const next = transactions.filter(t => t.id !== id);
    setTransactions(next);
    persist(accounts, next);
  };

  // ── Reset to factory defaults ─────────────────────────────────────
  const resetData = () => {
    setAccounts(defaultAccounts);
    setTransactions(defaultTransactions);
    persist(defaultAccounts, defaultTransactions);
  };

  // ── buildReports — recalculated on every data change ──────────────
  const reports: Reports = useMemo(
    () => buildReports(accounts, transactions),
    [accounts, transactions],
  );

  return {
    accounts,
    transactions,
    reports,
    ready,
    addAccount,
    updateAccount,
    deleteAccount,
    addTransaction,
    updateTransaction,
    deleteTransaction,
    resetData,
  };
}
