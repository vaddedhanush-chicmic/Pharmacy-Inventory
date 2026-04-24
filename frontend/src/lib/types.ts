// ── Auth ──
export interface User {
  _id: string;
  name: string;
  email: string;
  role: 'Admin' | 'Staff';
}

export interface LoginResponse {
  access_token: string;
  user: User;
}

export interface LoginDto {
  email: string;
  password: string;
}

export interface RegisterDto {
  name: string;
  email: string;
  password: string;
  role?: 'Admin' | 'Staff';
}

// ── Medicine ──
export interface Medicine {
  _id: string;
  name: string;
  description?: string;
  manufacturer?: string;
  mrp: number;
  sellingPrice: number;
  stock: number;
  expiryDate: string;
  reorderLevel: number;
  createdAt: string;
  updatedAt: string;
}

export interface CreateMedicineDto {
  name: string;
  description?: string;
  manufacturer?: string;
  mrp: number;
  sellingPrice: number;
  stock: number;
  expiryDate: string;
  reorderLevel?: number;
}

export type UpdateMedicineDto = Partial<CreateMedicineDto>;

// ── Sale ──
export interface SaleItem {
  medicineId: string;
  name: string;
  quantity: number;
  unitPrice: number;
  subTotal: number;
}

export interface Sale {
  _id: string;
  invoiceNumber: string;
  customerName?: string;
  customerPhone?: string;
  items: SaleItem[];
  grandTotal: number;
  paymentMethod: 'Cash' | 'UPI' | 'Card';
  createdAt: string;
  updatedAt: string;
}

export interface CreateSaleDto {
  customerName?: string;
  customerPhone?: string;
  items: { medicineId: string; quantity: number }[];
  paymentMethod?: 'Cash' | 'UPI' | 'Card';
}

export interface SalesFilterDto {
  startDate?: string;
  endDate?: string;
  page?: number;
  limit?: number;
}

export interface PaginatedSales {
  data: Sale[];
  total: number;
  page: number;
  limit: number;
}

export interface CancelledSale extends Sale {
  cancelledAt: string;
  reason: string;
}

// ── Expense ──
export interface Expense {
  _id: string;
  amount: number;
  category: 'Inventory Purchase' | 'Salary' | 'Electricity' | 'Maintenance' | 'Other';
  description?: string;
  date: string;
  recordedBy?: string;
  createdAt: string;
}

export interface CreateExpenseDto {
  amount: number;
  category: string;
  description?: string;
  date?: string;
}

// ── Reports ──
export interface DashboardSummary {
  today: {
    revenue: number;
    expenses: number;
    netEarned: number;
    invoices: number;
  };
  alerts: {
    lowStockItems: number;
    expiringSoonItems: number;
    expiredItems: number;
  };
}

export interface TimeSeriesEntry {
  date: string;
  revenue: number;
  expenses: number;
  net: number;
  invoices: number;
}

export interface SalesSummary {
  period: string;
  grandTotals: {
    totalRevenue: number;
    totalExpenses: number;
    netEarned: number;
    totalInvoices: number;
  };
  timeSeries: TimeSeriesEntry[];
}

export interface TopSelling {
  _id: string;
  name: string;
  totalQuantitySold: number;
}

// ── API Response Wrapper ──
export interface ApiResponse<T> {
  statusCode: number;
  message: string;
  data: T;
}
