export interface User {
  _id: string;
  name: string;
  email: string;
  role: "Admin" | "Staff";
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

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
  paymentMethod: "Cash" | "UPI" | "Card";
  createdAt: string;
  updatedAt: string;
}

export interface DashboardData {
  todayRevenue: number;
  lowStockCount: number;
  expiryWarningCount: number;
  lowStockMedicines: Medicine[];
  expiringMedicines: Medicine[];
}

export interface CartItem {
  medicineId: string;
  name: string;
  quantity: number;
  unitPrice: number;
  maxStock: number;
}

export interface AuthResponse {
  access_token: string;
  user: User;
}

export type ExpenseCategory = 'Inventory Purchase' | 'Salary' | 'Electricity' | 'Maintenance' | 'Other';

export interface Expense {
  _id: string;
  amount: number;
  category: ExpenseCategory;
  description?: string;
  date: string;
  createdBy: string | User;
  createdAt: string;
  updatedAt: string;
}

export interface TimeSeriesItem {
  date: string;
  revenue: number;
  expenses: number;
  net: number;
  invoices: number;
}

export interface ReportSummary {
  period: string;
  grandTotals: {
    totalRevenue: number;
    totalExpenses: number;
    netEarned: number;
    totalInvoices: number;
  };
  timeSeries: TimeSeriesItem[];
}

export interface TopSellingItem {
  _id: string;
  name: string;
  totalQuantitySold: number;
}
