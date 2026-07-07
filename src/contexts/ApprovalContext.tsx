"use client";

import React, { createContext, useContext, useState, useCallback, useEffect } from "react";
import { usePurchaseRequests } from "@/hooks/useApiEndpoints";
import { useAuth } from "@/contexts/AuthContext";

export type ApprovalStatus = "Pending" | "ACC Manager" | "ACC Final" | "Tolak";

export interface PurchaseRequest {
  id: string;
  dbId?: number;
  item: string;
  quantity: string;
  amount: number;
  requester: string;
  requesterId: string;
  department: string;
  date: string;
  status: ApprovalStatus;
  description: string;
  notaNumber?: string;
  // Tracking
  createdAt: string;
  approvedByManager?: string;
  approvedByManagerAt?: string;
  approvedByOwner?: string;
  approvedByOwnerAt?: string;
  rejectedBy?: string;
  rejectedAt?: string;
  rejectionReason?: string;
}

export interface CreateRequestInput {
  item: string;
  quantity: string;
  amount: number;
  department: string;
  description: string;
  requester: string;
  requesterId: string;
}

interface ApprovalStats {
  total: number;
  pending: number;
  accManager: number;
  accFinal: number;
  rejected: number;
  totalAmount: number;
  approvedAmount: number;
}

interface ApprovalContextType {
  requests: PurchaseRequest[];
  stats: ApprovalStats;
  isLoading: boolean;

  // Actions
  createRequest: (input: CreateRequestInput) => Promise<PurchaseRequest | null>;
  approveByManager: (id: string, managerName: string) => Promise<PurchaseRequest | null>;
  approveByOwner: (id: string, ownerName: string) => Promise<PurchaseRequest | null>;
  rejectRequest: (id: string, rejectorName: string, reason?: string) => Promise<PurchaseRequest | null>;
  deleteRequest: (id: string) => Promise<boolean>;
  refreshData: () => void;

  // Filtered views
  getPendingForManager: () => PurchaseRequest[];
  getPendingForOwner: () => PurchaseRequest[];
  getHistoryForManager: () => PurchaseRequest[];
  getHistoryForOwner: () => PurchaseRequest[];
  getRequestsByRequester: (requesterId: string) => PurchaseRequest[];
}

const ApprovalContext = createContext<ApprovalContextType | undefined>(undefined);

const ALLOWED_ROLES = ["staf", "manager", "owner"];

export function ApprovalProvider({ children }: { children: React.ReactNode }) {
  const { getAll, create, approveManager, approveOwner, reject, delete: deleteApi } = usePurchaseRequests();
  const { isAuthenticated, token, user } = useAuth();
  
  const [requests, setRequests] = useState<PurchaseRequest[]>([]);
  const [stats, setStats] = useState<ApprovalStats>({
    total: 0, pending: 0, accManager: 0, accFinal: 0, rejected: 0, totalAmount: 0, approvedAmount: 0,
  });
  const [isLoading, setIsLoading] = useState(true);

  // Recalculate stats whenever requests list changes
  const calculateStats = useCallback((list: PurchaseRequest[]) => {
    const total = list.length;
    const pending = list.filter(r => r.status === "Pending").length;
    const accManager = list.filter(r => r.status === "ACC Manager").length;
    const accFinal = list.filter(r => r.status === "ACC Final").length;
    const rejected = list.filter(r => r.status === "Tolak").length;
    const totalAmount = list.reduce((sum, r) => sum + r.amount, 0);
    const approvedAmount = list.filter(r => r.status === "ACC Final").reduce((sum, r) => sum + r.amount, 0);

    setStats({
      total,
      pending,
      accManager,
      accFinal,
      rejected,
      totalAmount,
      approvedAmount,
    });
  }, []);

  const refreshData = useCallback(async () => {
    if (!isAuthenticated || !token) {
      setRequests([]);
      setIsLoading(false);
      return;
    }
    if (!ALLOWED_ROLES.includes(user?.role?.toLowerCase() || "")) {
      setRequests([]);
      setIsLoading(false);
      return;
    }
    setIsLoading(true);
    try {
      const data = await getAll();
      setRequests(data);
      calculateStats(data);
    } catch (err) {
      console.error("Failed to load purchase requests from API:", err);
    } finally {
      setIsLoading(false);
    }
  }, [getAll, isAuthenticated, token, calculateStats]);

  // Initial load
  useEffect(() => {
    refreshData();
  }, [refreshData]);

  // Listen to custom events for data updates (cross-component coordination)
  useEffect(() => {
    const handler = () => refreshData();
    window.addEventListener("approvalDataChanged", handler);
    return () => {
      window.removeEventListener("approvalDataChanged", handler);
    };
  }, [refreshData]);

  // ==================== Actions ====================

  const createRequestAction = useCallback(async (input: CreateRequestInput): Promise<PurchaseRequest | null> => {
    try {
      const result = await create({
        item: input.item,
        quantity: input.quantity,
        amount: input.amount,
        department: input.department,
        description: input.description,
      });
      if (result) {
        await refreshData();
        window.dispatchEvent(new CustomEvent("approvalDataChanged"));
      }
      return result;
    } catch (err) {
      console.error("Gagal membuat request:", err);
      return null;
    }
  }, [create, refreshData]);

  const approveByManagerAction = useCallback(async (id: string, managerName: string): Promise<PurchaseRequest | null> => {
    try {
      const result = await approveManager(id);
      if (result) {
        await refreshData();
        window.dispatchEvent(new CustomEvent("approvalDataChanged"));
      }
      return result;
    } catch (err) {
      console.error("Gagal approve manager:", err);
      return null;
    }
  }, [approveManager, refreshData]);

  const approveByOwnerAction = useCallback(async (id: string, ownerName: string): Promise<PurchaseRequest | null> => {
    try {
      const result = await approveOwner(id);
      if (result) {
        await refreshData();
        window.dispatchEvent(new CustomEvent("approvalDataChanged"));
      }
      return result;
    } catch (err) {
      console.error("Gagal approve owner:", err);
      return null;
    }
  }, [approveOwner, refreshData]);

  const rejectRequestAction = useCallback(async (id: string, rejectorName: string, reason?: string): Promise<PurchaseRequest | null> => {
    try {
      const result = await reject(id, reason || "Ditolak tanpa alasan spesifik");
      if (result) {
        await refreshData();
        window.dispatchEvent(new CustomEvent("approvalDataChanged"));
      }
      return result;
    } catch (err) {
      console.error("Gagal menolak request:", err);
      return null;
    }
  }, [reject, refreshData]);

  const deleteRequestAction = useCallback(async (id: string): Promise<boolean> => {
    try {
      const result = await deleteApi(id);
      if (result) {
        await refreshData();
        window.dispatchEvent(new CustomEvent("approvalDataChanged"));
      }
      return result;
    } catch (err) {
      console.error("Gagal menghapus request:", err);
      return false;
    }
  }, [deleteApi, refreshData]);

  // ==================== Filtered Views ====================

  const getPendingForManager = useCallback(() => {
    return requests.filter(r => r.status === "Pending");
  }, [requests]);

  const getPendingForOwner = useCallback(() => {
    return requests.filter(r => r.status === "ACC Manager");
  }, [requests]);

  const getHistoryForManager = useCallback(() => {
    return requests.filter(r => r.status !== "Pending");
  }, [requests]);

  const getHistoryForOwner = useCallback(() => {
    return requests.filter(r => r.status === "ACC Final" || r.status === "Tolak");
  }, [requests]);

  const getRequestsByRequester = useCallback((requesterId: string) => {
    return requests.filter(r => r.requesterId === requesterId);
  }, [requests]);

  return (
    <ApprovalContext.Provider
      value={{
        requests,
        stats,
        isLoading,
        createRequest: createRequestAction,
        approveByManager: approveByManagerAction,
        approveByOwner: approveByOwnerAction,
        rejectRequest: rejectRequestAction,
        deleteRequest: deleteRequestAction,
        refreshData,
        getPendingForManager,
        getPendingForOwner,
        getHistoryForManager,
        getHistoryForOwner,
        getRequestsByRequester,
      }}
    >
      {children}
    </ApprovalContext.Provider>
  );
}

export function useApproval() {
  const context = useContext(ApprovalContext);
  if (!context) {
    throw new Error("useApproval must be used within ApprovalProvider");
  }
  return context;
}
