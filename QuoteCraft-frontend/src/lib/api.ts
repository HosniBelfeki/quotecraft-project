// Centralized API client for QuoteCraft frontend
// Uses Vite env var VITE_BACKEND_URL; defaults to http://localhost:3001

export const API_BASE = (
  import.meta.env?.VITE_BACKEND_URL as string | undefined
) || 'http://localhost:3001';

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    credentials: 'include',
    headers: {
      ...(options.body instanceof FormData
        ? {}
        : { 'Content-Type': 'application/json' }),
      ...(options.headers || {}),
    },
    ...options,
  });

  const contentType = res.headers.get('content-type') || '';
  const isJson = contentType.includes('application/json');
  const data = isJson ? await res.json() : await res.text();

  if (!res.ok) {
    const message = isJson ? (data?.error?.message || data?.message || 'Request failed') : String(data);
    throw new Error(message);
  }

  return data as T;
}

export interface UploadResponse {
  success: boolean;
  data?: {
    fileId: string;
    fileName: string;
    fileType: 'boq' | 'quote';
    parsedData?: any;
    flowExecutionId?: string;
    status?: string;
  };
  message?: string;
}

export interface ComparisonResponse {
  success: boolean;
  data?: {
    id: string;
    boqId: string;
    quotes: any[];
    bestVendor: string;
    costSavings: number;
    approvalRoute: string;
    status: string;
    createdAt: string;
    policyEvaluation?: any;
  };
  message?: string;
}

export interface ApprovalResponse {
  success: boolean;
  data?: {
    id: string;
    comparisonId: string;
    decision: string;
    timestamp: string;
    nextStep?: string;
    approvalId?: string;
    message?: string;
    poDetails?: {
      success: boolean;
      poNumber: string;
      poId: string;
      status: string;
      createdAt: string;
      vendorNotificationSent: boolean;
    };
  };
  message?: string;
}

export interface KPIResponse {
  success: boolean;
  data?: {
    totalProcessed: number;
    avgProcessingTime: string;
    stpRate: number;
    autoApprovedCount: number;
    escalatedCount: number;
    totalCostSavings: number;
    avgCostVariance: number;
    errorRate: number;
  };
  message?: string;
}

export interface POResponse {
  success: boolean;
  data?: {
    poNumber: string;
    poId: string;
    status: string;
    createdAt: string;
    vendorNotificationSent: boolean;
  };
  message?: string;
}

export interface POStatusResponse {
  success: boolean;
  data?: {
    poNumber: string;
    status: string;
    createdAt: string;
    lastUpdated: string;
    vendor?: string;
    totalAmount?: number;
  };
  message?: string;
}

export const api = {
  // Health check
  health: () => request<{ status: string; timestamp: string; environment: string; uptime: number }>(`/health`, { method: 'GET' }),

  // Upload endpoints
  uploadFile: (file: File, params: { fileType: 'boq' | 'quote'; vendorName?: string; vendorId?: string }) => {
    const form = new FormData();
    form.append('file', file);
    form.append('fileType', params.fileType);
    if (params.vendorName) form.append('vendorName', params.vendorName);
    if (params.vendorId) form.append('vendorId', params.vendorId);
    return request<UploadResponse>(`/api/upload`, {
      method: 'POST',
      body: form,
    });
  },

  // Comparison endpoints
  createComparison: (payload: any) => request<ComparisonResponse>(`/api/comparison`, { method: 'POST', body: JSON.stringify(payload) }),
  getComparison: (id: string) => request<ComparisonResponse>(`/api/comparison/${id}`, { method: 'GET' }),

  // Approval endpoints (FIXED: removed /submit)
  submitApproval: (payload: {
    comparisonId: string;
    decision: 'APPROVED' | 'REJECTED';
    approverRole: string;
    approverEmail: string;
    comment?: string;
  }) => request<ApprovalResponse>(`/api/approval`, { method: 'POST', body: JSON.stringify(payload) }),

  // KPI endpoints
  getKPI: () => request<KPIResponse>(`/api/kpi`, { method: 'GET' }),

  // ERP endpoints (NEW)
  createPO: (params?: {
    comparisonId?: string;
    vendorId?: string;
    items?: any[];
    totalAmount?: number;
  }) => request<POResponse>(`/api/erp/create-po`, { 
    method: 'POST', 
    body: params ? JSON.stringify(params) : undefined 
  }),
  
  getPOStatus: (poNumber: string) => request<POStatusResponse>(`/api/erp/po-status/${poNumber}`, { method: 'GET' }),
};
