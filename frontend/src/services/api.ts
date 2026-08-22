import {
  User,
  UserRole,
  Flat,
  Transaction,
  MaintenanceInvoice,
  ReserveFund,
  AuditLog,
  DashboardData,
  CategoryBudget,
  SocietyInfo,
  Notice,
  ReportHistory,
  ExportHistory,
  DocumentUpload,
  KpiSnapshot,
  FinancialYear
} from '../types';

const API_BASE = '/api';

class ApiService {
  private token: string | null = localStorage.getItem('societyfund_token');

  setToken(token: string | null) {
    this.token = token;
    if (token) {
      localStorage.setItem('societyfund_token', token);
    } else {
      localStorage.removeItem('societyfund_token');
    }
  }

  getToken(): string | null {
    return this.token || localStorage.getItem('societyfund_token');
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(options.headers as Record<string, string> || {})
    };

    const token = this.getToken();
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(`${API_BASE}${endpoint}`, {
      ...options,
      headers
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: response.statusText }));
      throw new Error(errorData.message || 'API request failed');
    }

    return response.json();
  }

  // Auth - supports login via email OR flat number (e.g. "A-101", "B-201")
  async login(identifier: string, password: string): Promise<{ token: string; user: User }> {
    const isFlat = /^[A-Za-z]+-[0-9]+/i.test(identifier.trim());
    const body = isFlat
      ? { flatNumber: identifier.trim().toUpperCase(), password }
      : { email: identifier.trim(), password };

    const res = await this.request<{ token: string; user: User }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(body)
    });
    this.setToken(res.token);
    return res;
  }

  async register(data: { name: string; email: string; password?: string; flatNumber: string; phone?: string; role?: string }): Promise<{ token: string; user: User }> {
    const res = await this.request<{ token: string; user: User }>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(data)
    });
    this.setToken(res.token);
    return res;
  }

  // Demo Switch to Admin OR ANY specific resident flat
  async demoSwitch(role: UserRole, flatNumber?: string): Promise<{ token: string; user: User }> {
    const res = await this.request<{ token: string; user: User }>('/auth/demo-switch', {
      method: 'POST',
      body: JSON.stringify({ role, flatNumber })
    });
    this.setToken(res.token);
    return res;
  }

  async changePassword(newPassword: string): Promise<{ message: string; token: string; user: User }> {
    const res = await this.request<{ message: string; token: string; user: User }>('/auth/change-password', {
      method: 'POST',
      body: JSON.stringify({ newPassword })
    });
    if (res.token) this.setToken(res.token);
    return res;
  }

  async adminResetPassword(data: { flatNumber?: string; email?: string; temporaryPassword?: string }): Promise<{ message: string; temporaryPassword: string; email: string; flatNumber: string }> {
    return this.request<{ message: string; temporaryPassword: string; email: string; flatNumber: string }>('/auth/admin-reset-password', {
      method: 'POST',
      body: JSON.stringify(data)
    });
  }

  async getMe(): Promise<{ user: User }> {
    return this.request<{ user: User }>('/auth/me');
  }

  // Dashboard
  async getDashboardStats(): Promise<DashboardData> {
    return this.request<DashboardData>('/dashboard/stats');
  }

  // Society Info
  async getSocietyInfo(): Promise<SocietyInfo> {
    return this.request<SocietyInfo>('/society');
  }

  async updateSocietyInfo(data: Partial<SocietyInfo>): Promise<SocietyInfo> {
    return this.request<SocietyInfo>('/society', {
      method: 'PATCH',
      body: JSON.stringify(data)
    });
  }

  // Categories & Budgets
  async getCategories(): Promise<CategoryBudget[]> {
    return this.request<CategoryBudget[]>('/categories');
  }

  async createCategory(data: Partial<CategoryBudget>): Promise<CategoryBudget> {
    return this.request<CategoryBudget>('/categories', {
      method: 'POST',
      body: JSON.stringify(data)
    });
  }

  async deleteCategory(id: string): Promise<{ message: string }> {
    return this.request<{ message: string }>(`/categories/${id}`, {
      method: 'DELETE'
    });
  }

  // Transactions (Income & Expenses CRUD)
  async getTransactions(filter?: { type?: string; category?: string; status?: string; startDate?: string; endDate?: string; flatNumber?: string }): Promise<Transaction[]> {
    const params = new URLSearchParams();
    if (filter?.type) params.append('type', filter.type);
    if (filter?.category) params.append('category', filter.category);
    if (filter?.status) params.append('status', filter.status);
    if (filter?.startDate) params.append('startDate', filter.startDate);
    if (filter?.endDate) params.append('endDate', filter.endDate);
    if (filter?.flatNumber) params.append('flatNumber', filter.flatNumber);
    const query = params.toString() ? `?${params.toString()}` : '';
    return this.request<Transaction[]>(`/transactions${query}`);
  }

  async createTransaction(data: Partial<Transaction>): Promise<Transaction> {
    return this.request<Transaction>('/transactions', {
      method: 'POST',
      body: JSON.stringify(data)
    });
  }

  async updateTransaction(id: string, data: Partial<Transaction>): Promise<Transaction> {
    return this.request<Transaction>(`/transactions/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data)
    });
  }

  async deleteTransaction(id: string): Promise<{ message: string }> {
    return this.request<{ message: string }>(`/transactions/${id}`, {
      method: 'DELETE'
    });
  }

  async approveTransaction(id: string): Promise<Transaction> {
    return this.request<Transaction>(`/transactions/${id}/approve`, {
      method: 'PATCH'
    });
  }

  // Maintenance & Payments Lifecycle
  async getInvoices(filter?: { flatNumber?: string; status?: string; billingMonth?: string }): Promise<MaintenanceInvoice[]> {
    const params = new URLSearchParams();
    if (filter?.flatNumber) params.append('flatNumber', filter.flatNumber);
    if (filter?.status) params.append('status', filter.status);
    if (filter?.billingMonth) params.append('billingMonth', filter.billingMonth);
    const query = params.toString() ? `?${params.toString()}` : '';
    return this.request<MaintenanceInvoice[]>(`/maintenance${query}`);
  }

  async payInvoice(id: string, paymentMethod: string, referenceNo?: string, autoApprove: boolean = false): Promise<{ message: string; invoice: MaintenanceInvoice }> {
    return this.request<{ message: string; invoice: MaintenanceInvoice }>(`/maintenance/${id}/pay`, {
      method: 'POST',
      body: JSON.stringify({ paymentMethod, referenceNo, autoApprove })
    });
  }

  async approveInvoicePayment(id: string): Promise<{ message: string; invoice: MaintenanceInvoice }> {
    return this.request<{ message: string; invoice: MaintenanceInvoice }>(`/maintenance/${id}/approve`, {
      method: 'PATCH'
    });
  }

  async autoReconcilePayments(): Promise<{ message: string; reconciledCount: number; invoices: MaintenanceInvoice[] }> {
    return this.request<{ message: string; reconciledCount: number; invoices: MaintenanceInvoice[] }>('/maintenance/auto-reconcile', {
      method: 'POST'
    });
  }

  async generateBatchInvoices(data: { billingMonth: string; billingYear: number; dueDate: string }): Promise<{ message: string; count: number; invoices: MaintenanceInvoice[] }> {
    return this.request<{ message: string; count: number; invoices: MaintenanceInvoice[] }>('/maintenance/generate-batch', {
      method: 'POST',
      body: JSON.stringify(data)
    });
  }

  // Reserve Funds
  async getReserveFunds(): Promise<ReserveFund[]> {
    return this.request<ReserveFund[]>('/reserve-funds');
  }

  async updateFundAllocation(name: string, amount: number, actionType: 'deposit' | 'withdraw', notes?: string): Promise<{ message: string; funds: ReserveFund[] }> {
    return this.request<{ message: string; funds: ReserveFund[] }>('/reserve-funds/allocate', {
      method: 'POST',
      body: JSON.stringify({ name, amount, actionType, notes })
    });
  }

  // Audit & Export Logging
  async getAuditLogs(limit: number = 100): Promise<AuditLog[]> {
    return this.request<AuditLog[]>(`/audit/logs?limit=${limit}`);
  }

  async logExport(reportType: string, format: string): Promise<any> {
    return this.request<any>('/audit/export-log', {
      method: 'POST',
      body: JSON.stringify({ reportType, format })
    });
  }

  async getFinancialReport(filter?: { startDate?: string; endDate?: string; quarter?: string; financialYear?: string }): Promise<any> {
    const params = new URLSearchParams();
    if (filter?.startDate) params.append('startDate', filter.startDate);
    if (filter?.endDate) params.append('endDate', filter.endDate);
    if (filter?.quarter) params.append('quarter', filter.quarter);
    if (filter?.financialYear) params.append('financialYear', filter.financialYear);
    const query = params.toString() ? `?${params.toString()}` : '';
    return this.request<any>(`/audit/report${query}`);
  }

  // Members
  async getFlats(): Promise<Flat[]> {
    return this.request<Flat[]>('/members/flats');
  }

  async getFlatByNumber(flatNumber: string): Promise<{ flat: Flat; invoices: MaintenanceInvoice[] }> {
    return this.request<{ flat: Flat; invoices: MaintenanceInvoice[] }>(`/members/flats/${flatNumber}`);
  }

  async createFlat(data: Partial<Flat> & { initialPassword?: string }): Promise<{ message: string; flat: Flat; credentials?: any }> {
    return this.request<{ message: string; flat: Flat; credentials?: any }>('/members/flats', {
      method: 'POST',
      body: JSON.stringify(data)
    });
  }

  async updateResident(flatNumber: string, data: Partial<Flat>): Promise<{ message: string; flat: Flat }> {
    return this.request<{ message: string; flat: Flat }>(`/members/flats/${flatNumber}`, {
      method: 'PATCH',
      body: JSON.stringify(data)
    });
  }

  async deleteFlat(flatNumber: string): Promise<{ message: string }> {
    return this.request<{ message: string }>(`/members/flats/${flatNumber}`, {
      method: 'DELETE'
    });
  }

  // ═══════════════════════════════════════════════
  // NEW ENTITY APIs (6 missing collections)
  // ═══════════════════════════════════════════════

  // 9. Notices
  async getNotices(): Promise<Notice[]> {
    return this.request<Notice[]>('/notices');
  }

  async createNotice(data: Partial<Notice>): Promise<Notice> {
    return this.request<Notice>('/notices', {
      method: 'POST',
      body: JSON.stringify(data)
    });
  }

  async updateNotice(id: string, data: Partial<Notice>): Promise<Notice> {
    return this.request<Notice>(`/notices/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data)
    });
  }

  async deleteNotice(id: string): Promise<{ message: string }> {
    return this.request<{ message: string }>(`/notices/${id}`, {
      method: 'DELETE'
    });
  }

  // 10. Report History
  async getReportHistory(limit: number = 50): Promise<ReportHistory[]> {
    return this.request<ReportHistory[]>(`/reports/history?limit=${limit}`);
  }

  async logReportGeneration(data: Partial<ReportHistory>): Promise<ReportHistory> {
    return this.request<ReportHistory>('/reports/generate', {
      method: 'POST',
      body: JSON.stringify(data)
    });
  }

  // 11. Export History
  async getExportHistory(limit: number = 50): Promise<ExportHistory[]> {
    return this.request<ExportHistory[]>(`/exports/history?limit=${limit}`);
  }

  async logExportHistory(data: Partial<ExportHistory>): Promise<ExportHistory> {
    return this.request<ExportHistory>('/exports', {
      method: 'POST',
      body: JSON.stringify(data)
    });
  }

  // 12. Document Uploads
  async getDocuments(filter?: { linkedEntityType?: string; linkedEntityId?: string }): Promise<DocumentUpload[]> {
    const params = new URLSearchParams();
    if (filter?.linkedEntityType) params.append('linkedEntityType', filter.linkedEntityType);
    if (filter?.linkedEntityId) params.append('linkedEntityId', filter.linkedEntityId);
    const query = params.toString() ? `?${params.toString()}` : '';
    return this.request<DocumentUpload[]>(`/uploads${query}`);
  }

  async uploadDocument(data: Partial<DocumentUpload>): Promise<DocumentUpload> {
    return this.request<DocumentUpload>('/uploads', {
      method: 'POST',
      body: JSON.stringify(data)
    });
  }

  async deleteDocument(id: string): Promise<{ message: string }> {
    return this.request<{ message: string }>(`/uploads/${id}`, {
      method: 'DELETE'
    });
  }

  // 13. KPI Snapshots
  async getKpiSnapshots(financialYear?: string): Promise<KpiSnapshot[]> {
    const query = financialYear ? `?financialYear=${financialYear}` : '';
    return this.request<KpiSnapshot[]>(`/kpi${query}`);
  }

  async getCurrentKpis(): Promise<{
    collectionRate: number;
    expenseAccuracy: number;
    transparencyScore: number;
    totalBilled: number;
    totalCollected: number;
    pendingDuesCount: number;
    pendingApprovalCount: number;
  }> {
    return this.request('/kpi/current');
  }

  async captureKpiSnapshot(): Promise<KpiSnapshot> {
    return this.request<KpiSnapshot>('/kpi/capture', {
      method: 'POST'
    });
  }

  // 14. Financial Years
  async getFinancialYears(): Promise<FinancialYear[]> {
    return this.request<FinancialYear[]>('/financial-years');
  }

  async getCurrentFinancialYear(): Promise<FinancialYear> {
    return this.request<FinancialYear>('/financial-years/current');
  }

  async createFinancialYear(data: Partial<FinancialYear>): Promise<FinancialYear> {
    return this.request<FinancialYear>('/financial-years', {
      method: 'POST',
      body: JSON.stringify(data)
    });
  }

  async activateFinancialYear(id: string): Promise<{ message: string; financialYear: FinancialYear }> {
    return this.request<{ message: string; financialYear: FinancialYear }>(`/financial-years/${id}/activate`, {
      method: 'PATCH'
    });
  }

  async lockFinancialYear(id: string): Promise<{ message: string; financialYear: FinancialYear }> {
    return this.request<{ message: string; financialYear: FinancialYear }>(`/financial-years/${id}/lock`, {
      method: 'PATCH'
    });
  }
}

export const api = new ApiService();