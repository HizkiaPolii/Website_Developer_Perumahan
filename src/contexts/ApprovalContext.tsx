"use client";

import React, { createContext, useContext, useState, useCallback, useEffect } from "react";
import {
  PurchaseRequest,
  ApprovalStatus,
  CreateRequestInput,
  getAllRequests,
  createRequest as svcCreate,
  approveByManager as svcApproveManager,
  approveByOwner as svcApproveOwner,
  rejectRequest as svcReject,
  deleteRequest as svcDelete,
  getStats as svcGetStats,
} from "@/services/approval-service";

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
  createRequest: (input: CreateRequestInput) => PurchaseRequest;
  approveByManager: (id: string, managerName: string) => PurchaseRequest | null;
  approveByOwner: (id: string, ownerName: string) => PurchaseRequest | null;
  rejectRequest: (id: string, rejectorName: string, reason?: string) => PurchaseRequest | null;
  deleteRequest: (id: string) => boolean;
  refreshData: () => void;

  // Filtered views
  getPendingForManager: () => PurchaseRequest[];
  getPendingForOwner: () => PurchaseRequest[];
  getHistoryForManager: () => PurchaseRequest[];
  getHistoryForOwner: () => PurchaseRequest[];
  getRequestsByRequester: (requesterId: string) => PurchaseRequest[];
}

const ApprovalContext = createContext<ApprovalContextType | undefined>(undefined);

export function ApprovalProvider({ children }: { children: React.ReactNode }) {
  const [requests, setRequests] = useState<PurchaseRequest[]>([]);
  const [stats, setStats] = useState<ApprovalStats>({
    total: 0, pending: 0, accManager: 0, accFinal: 0, rejected: 0, totalAmount: 0, approvedAmount: 0,
  });
  const [isLoading, setIsLoading] = useState(true);

  // Load data from localStorage
  const refreshData = useCallback(() => {
    const data = getAllRequests();
    setRequests(data);
    setStats(svcGetStats());
  }, []);

  // Initial load
  useEffect(() => {
    refreshData();
    setIsLoading(false);
  }, [refreshData]);

  // Listen for cross-component/tab changes
  useEffect(() => {
    const handler = () => refreshData();
    window.addEventListener("approvalDataChanged", handler);
    window.addEventListener("storage", (e) => {
      if (e.key === "purchaseRequests") handler();
    });
    return () => {
      window.removeEventListener("approvalDataChanged", handler);
      // Note: storage listener cleanup would need a ref, but this is fine for our use case
    };
  }, [refreshData]);

  // ==================== Actions ====================

  const createRequestAction = useCallback((input: CreateRequestInput): PurchaseRequest => {
    const result = svcCreate(input);
    refreshData();
    return result;
  }, [refreshData]);

  const approveByManagerAction = useCallback((id: string, managerName: string): PurchaseRequest | null => {
    const result = svcApproveManager(id, managerName);
    if (result) refreshData();
    return result;
  }, [refreshData]);

  const approveByOwnerAction = useCallback((id: string, ownerName: string): PurchaseRequest | null => {
    const result = svcApproveOwner(id, ownerName);
    if (result) refreshData();
    return result;
  }, [refreshData]);

  const rejectRequestAction = useCallback((id: string, rejectorName: string, reason?: string): PurchaseRequest | null => {
    const result = svcReject(id, rejectorName, reason);
    if (result) refreshData();
    return result;
  }, [refreshData]);

  const deleteRequestAction = useCallback((id: string): boolean => {
    const result = svcDelete(id);
    if (result) refreshData();
    return result;
  }, [refreshData]);

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
