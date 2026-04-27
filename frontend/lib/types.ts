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
