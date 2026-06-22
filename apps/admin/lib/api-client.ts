/**
 * 管理员后台 API 客户端
 * 统一处理认证、请求拦截、错误处理
 */

const API_BASE = '/api/admin';

interface RequestOptions {
  method?: string;
  body?: unknown;
  headers?: Record<string, string>;
}

class ApiError extends Error {
  status: number;
  code: string;

  constructor(message: string, status: number, code: string) {
    super(message);
    this.status = status;
    this.code = code;
    this.name = 'ApiError';
  }
}

function getToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('admin_token');
}

async function request<T = unknown>(
  endpoint: string,
  options: RequestOptions = {},
): Promise<T> {
  const token = getToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const res = await fetch(`${API_BASE}${endpoint}`, {
    method: options.method || 'GET',
    headers,
    body: options.body ? JSON.stringify(options.body) : undefined,
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new ApiError(
      errorData.message || '请求失败',
      res.status,
      errorData.code || 'UNKNOWN_ERROR',
    );
  }

  return res.json();
}

// ============ 认证 ============

export async function adminLogin(phone: string, password: string) {
  return request<{
    accessToken: string;
    refreshToken: string;
    expiresIn: number;
    user: { id: string; phone: string; realName: string; role: string };
  }>('/auth/login', {
    method: 'POST',
    body: { phone, password },
  });
}

// ============ 仪表盘 ============

export async function getDashboardStats() {
  return request<{
    todayAudit: { pending: number; approved: number; rejected: number };
    complaints: { pending: number; processing: number; resolved: number };
    riskAlerts: { unprocessed: number };
    reviewTrend: Array<{ date: string; count: number }>;
  }>('/dashboard/stats');
}

// ============ 审核 ============

export async function getAuditList(params: {
  status?: string;
  page: number;
  pageSize: number;
  startDate?: string;
  endDate?: string;
}) {
  const query = new URLSearchParams();
  Object.entries(params).forEach(([k, v]) => {
    if (v !== undefined && v !== '') query.set(k, String(v));
  });
  return request<{
    list: Array<{
      id: string;
      content: string;
      companyName: string;
      userNickname: string;
      isAnonymous: boolean;
      submittedAt: string;
      status: string;
    }>;
    total: number;
  }>(`/audit/list?${query.toString()}`);
}

export async function getAuditDetail(reviewId: string) {
  return request<{
    id: string;
    content: string;
    sensitiveWords: Array<{ word: string; start: number; end: number }>;
    rating: Record<string, number>;
    companyName: string;
    userNickname: string;
    isAnonymous: boolean;
    evidenceUrls: string[];
    ocrResults: string[];
    userHistory: Array<{
      id: string;
      content: string;
      status: string;
      createdAt: string;
    }>;
    auditHistory: Array<{
      id: string;
      action: string;
      remark: string;
      auditorName: string;
      createdAt: string;
    }>;
    status: string;
    createdAt: string;
  }>(`/audit/${reviewId}`);
}

export async function submitAudit(reviewId: string, data: {
  action: 'APPROVE' | 'REJECT' | 'REQUEST_MODIFY';
  reason?: string;
}) {
  return request(`/audit/${reviewId}/review`, {
    method: 'POST',
    body: data,
  });
}

// ============ 投诉 ============

export async function getComplaintList(params: {
  status?: string;
  page: number;
  pageSize: number;
  startDate?: string;
  endDate?: string;
  complaintType?: string;
}) {
  const query = new URLSearchParams();
  Object.entries(params).forEach(([k, v]) => {
    if (v !== undefined && v !== '') query.set(k, String(v));
  });
  return request<{
    list: Array<{
      id: string;
      ticketNo: string;
      companyName: string;
      complaintType: string;
      status: string;
      deadline: string;
      createdAt: string;
    }>;
    total: number;
  }>(`/complaint/list?${query.toString()}`);
}

export async function getComplaintDetail(ticketId: string) {
  return request<{
    id: string;
    ticketNo: string;
    companyName: string;
    complaintType: string;
    reason: string;
    description: string;
    status: string;
    deadline: string;
    reviewContent: string;
    evidenceImages: string[];
    enterpriseMaterials: Array<{
      name: string;
      url: string;
    }>;
    createdAt: string;
  }>(`/complaint/${ticketId}`);
}

export async function handleComplaint(ticketId: string, data: {
  action: 'REMOVE_REVIEW' | 'KEEP_REVIEW' | 'DISMISS';
  note?: string;
}) {
  return request(`/complaint/${ticketId}/handle`, {
    method: 'POST',
    body: data,
  });
}

// ============ 用户管理 ============

export async function getUserList(params: {
  keyword?: string;
  page: number;
  pageSize: number;
}) {
  const query = new URLSearchParams();
  Object.entries(params).forEach(([k, v]) => {
    if (v !== undefined && v !== '') query.set(k, String(v));
  });
  return request<{
    list: Array<{
      id: string;
      phone: string;
      nickname: string;
      createdAt: string;
      registerIp: string;
      reviewCount: number;
      status: string;
    }>;
    total: number;
  }>(`/users/list?${query.toString()}`);
}

export async function getUserDetail(userId: string) {
  return request<{
    id: string;
    nickname: string;
    phone: string;
    createdAt: string;
    registerIp: string;
    realName: string;
    idCardNumber: string;
    status: string;
    reviews: Array<{
      id: string;
      content: string;
      companyName: string;
      createdAt: string;
      status: string;
    }>;
    penalties: Array<{
      id: string;
      penaltyType: string;
      reason: string;
      operatorName: string;
      startTime: string;
      endTime: string;
      status: string;
    }>;
  }>(`/users/${userId}`);
}

export async function banUser(data: {
  userId: string;
  penaltyType: 'MUTE' | 'TEMP_BAN' | 'PERMANENT_BAN';
  reason: string;
  duration?: number;
}) {
  return request('/users/ban', {
    method: 'POST',
    body: data,
  });
}

export async function getRealNameInfo(userId: string) {
  return request<{
    realName: string;
    idCardNumber: string;
  }>(`/users/${userId}/real-name`);
}

// ============ 敏感词管理 ============

export async function getSensitiveWords(params: {
  category?: string;
  page: number;
  pageSize: number;
}) {
  const query = new URLSearchParams();
  Object.entries(params).forEach(([k, v]) => {
    if (v !== undefined && v !== '') query.set(k, String(v));
  });
  return request<{
    list: Array<{
      id: string;
      word: string;
      category: string;
      severity: string;
      status: string;
      createdAt: string;
    }>;
    total: number;
  }>(`/sensitive-words/list?${query.toString()}`);
}

export async function addSensitiveWord(data: {
  word: string;
  category: string;
  severity: string;
}) {
  return request('/sensitive-words', {
    method: 'POST',
    body: data,
  });
}

export async function batchImportSensitiveWords(words: string[]) {
  return request('/sensitive-words/batch', {
    method: 'POST',
    body: { words },
  });
}

export async function testSensitiveWords(text: string) {
  return request<{
    hits: Array<{ word: string; category: string }>;
  }>('/sensitive-words/test', {
    method: 'POST',
    body: { text },
  });
}

export async function updateSensitiveWordStatus(id: string, status: string) {
  return request(`/sensitive-words/${id}/status`, {
    method: 'PUT',
    body: { status },
  });
}

// ============ 风控告警 ============

export async function getRiskAlerts(params: {
  type?: string;
  page: number;
  pageSize: number;
}) {
  const query = new URLSearchParams();
  Object.entries(params).forEach(([k, v]) => {
    if (v !== undefined && v !== '') query.set(k, String(v));
  });
  return request<{
    list: Array<{
      id: string;
      alertType: string;
      severity: string;
      detail: string;
      createdAt: string;
      status: string;
    }>;
    total: number;
  }>(`/risk/list?${query.toString()}`);
}

export async function handleRiskAlert(id: string, action: 'PROCESSED' | 'IGNORED') {
  return request(`/risk/${id}/handle`, {
    method: 'POST',
    body: { action },
  });
}

// ============ 司法导出 ============

export async function requestExport(data: {
  startDate: string;
  endDate: string;
  userId?: string;
  companyName?: string;
  courtCaseNo: string;
  reason: string;
  courtOrderUrl: string;
}) {
  return request('/export/request', {
    method: 'POST',
    body: data,
  });
}

export async function getExportHistory(params: {
  page: number;
  pageSize: number;
}) {
  const query = new URLSearchParams();
  Object.entries(params).forEach(([k, v]) => {
    if (v !== undefined && v !== '') query.set(k, String(v));
  });
  return request<{
    list: Array<{
      id: string;
      courtCaseNo: string;
      reason: string;
      status: string;
      requestedAt: string;
      approvedAt?: string;
      expiresAt?: string;
      downloadUrl?: string;
    }>;
    total: number;
  }>(`/export/history?${query.toString()}`);
}

export async function downloadExport(id: string) {
  return request<{ url: string }>(`/export/${id}/download`);
}

// ============ 处罚台账 ============

export async function getPenalties(params: {
  penaltyType?: string;
  status?: string;
  page: number;
  pageSize: number;
}) {
  const query = new URLSearchParams();
  Object.entries(params).forEach(([k, v]) => {
    if (v !== undefined && v !== '') query.set(k, String(v));
  });
  return request<{
    list: Array<{
      id: string;
      userName: string;
      penaltyType: string;
      reason: string;
      operatorName: string;
      startTime: string;
      endTime: string;
      status: string;
    }>;
    total: number;
  }>(`/penalties/list?${query.toString()}`);
}

export { ApiError };