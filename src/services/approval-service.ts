/**
 * Approval Service — LocalStorage-based CRUD for Purchase Requests
 * 
 * Workflow: Lapangan → Manager → Owner/Direktur
 * Statuses: Pending → ACC Manager → ACC Final / Tolak
 */

export type ApprovalStatus = "Pending" | "ACC Manager" | "ACC Final" | "Tolak";

export interface PurchaseRequest {
  id: string;
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

const STORAGE_KEY = "purchaseRequests";
const COUNTER_KEY = "purchaseRequestCounter";

// ==================== Helpers ====================

function getNextId(): string {
  if (typeof window === "undefined") return "PR-0000-000";
  const year = new Date().getFullYear();
  const counter = parseInt(localStorage.getItem(COUNTER_KEY) || "0", 10) + 1;
  localStorage.setItem(COUNTER_KEY, counter.toString());
  return `PR-${year}-${counter.toString().padStart(3, "0")}`;
}

function generateNotaNumber(): string {
  return `NTA-${Math.floor(1000 + Math.random() * 9000)}`;
}

function broadcastChange() {
  if (typeof window === "undefined") return;
  // Dispatch custom event so other components/tabs can react
  window.dispatchEvent(new CustomEvent("approvalDataChanged"));
}

// ==================== CRUD Operations ====================

export function getAllRequests(): PurchaseRequest[] {
  if (typeof window === "undefined") return [];
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    if (!data) return [];
    return JSON.parse(data) as PurchaseRequest[];
  } catch {
    console.error("Failed to parse purchase requests from localStorage");
    return [];
  }
}

function saveAllRequests(requests: PurchaseRequest[]) {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(requests));
  broadcastChange();
}

export function createRequest(input: CreateRequestInput): PurchaseRequest {
  const requests = getAllRequests();
  const now = new Date().toISOString();
  
  const newRequest: PurchaseRequest = {
    id: getNextId(),
    item: input.item,
    quantity: input.quantity,
    amount: input.amount,
    requester: input.requester,
    requesterId: input.requesterId,
    department: input.department,
    date: new Date().toLocaleDateString("id-ID", { year: "numeric", month: "2-digit", day: "2-digit" }),
    status: "Pending",
    description: input.description,
    createdAt: now,
  };

  requests.unshift(newRequest); // Add to beginning
  saveAllRequests(requests);
  return newRequest;
}

export function approveByManager(id: string, managerName: string): PurchaseRequest | null {
  const requests = getAllRequests();
  const index = requests.findIndex(r => r.id === id);
  if (index === -1) return null;

  const request = requests[index];
  if (request.status !== "Pending") return null;

  request.status = "ACC Manager";
  request.notaNumber = generateNotaNumber();
  request.approvedByManager = managerName;
  request.approvedByManagerAt = new Date().toISOString();

  requests[index] = request;
  saveAllRequests(requests);
  return request;
}

export function approveByOwner(id: string, ownerName: string): PurchaseRequest | null {
  const requests = getAllRequests();
  const index = requests.findIndex(r => r.id === id);
  if (index === -1) return null;

  const request = requests[index];
  if (request.status !== "ACC Manager") return null;

  request.status = "ACC Final";
  request.approvedByOwner = ownerName;
  request.approvedByOwnerAt = new Date().toISOString();

  requests[index] = request;
  saveAllRequests(requests);
  return request;
}

export function rejectRequest(id: string, rejectorName: string, reason?: string): PurchaseRequest | null {
  const requests = getAllRequests();
  const index = requests.findIndex(r => r.id === id);
  if (index === -1) return null;

  const request = requests[index];
  if (request.status === "ACC Final" || request.status === "Tolak") return null;

  request.status = "Tolak";
  request.rejectedBy = rejectorName;
  request.rejectedAt = new Date().toISOString();
  if (reason) request.rejectionReason = reason;

  requests[index] = request;
  saveAllRequests(requests);
  return request;
}

export function deleteRequest(id: string): boolean {
  const requests = getAllRequests();
  const filtered = requests.filter(r => r.id !== id);
  if (filtered.length === requests.length) return false;
  saveAllRequests(filtered);
  return true;
}

// ==================== Query Helpers ====================

export function getRequestsByStatus(status: ApprovalStatus): PurchaseRequest[] {
  return getAllRequests().filter(r => r.status === status);
}

export function getRequestsByRequester(requesterId: string): PurchaseRequest[] {
  return getAllRequests().filter(r => r.requesterId === requesterId);
}

export function getPendingForManager(): PurchaseRequest[] {
  return getRequestsByStatus("Pending");
}

export function getPendingForOwner(): PurchaseRequest[] {
  return getRequestsByStatus("ACC Manager");
}

export function getCompletedRequests(): PurchaseRequest[] {
  return getAllRequests().filter(r => r.status === "ACC Final" || r.status === "Tolak");
}

export function getStats() {
  const all = getAllRequests();
  return {
    total: all.length,
    pending: all.filter(r => r.status === "Pending").length,
    accManager: all.filter(r => r.status === "ACC Manager").length,
    accFinal: all.filter(r => r.status === "ACC Final").length,
    rejected: all.filter(r => r.status === "Tolak").length,
    totalAmount: all.reduce((sum, r) => sum + r.amount, 0),
    approvedAmount: all.filter(r => r.status === "ACC Final").reduce((sum, r) => sum + r.amount, 0),
  };
}
