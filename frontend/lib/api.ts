import axios from "axios";

const API_BASE_URL = "http://localhost:3000/api";

export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Add auth token to requests
api.interceptors.request.use((config) => {
  if (typeof window !== "undefined") {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

// Handle 401 errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 && typeof window !== "undefined") {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

// Auth
export const login = async (email: string, password: string) => {
  const { data } = await api.post("/auth/login", { email, password });
  return data;
};

export const register = async (userData: {
  name: string;
  email: string;
  password: string;
  role: string;
}) => {
  const { data } = await api.post("/auth/register", userData);
  return data;
};

// Dashboard
export const getDashboard = async () => {
  const { data } = await api.get("/reports/dashboard");
  return data;
};

// Medicines
export const getMedicines = async (search?: string) => {
  const params = search ? { search } : {};
  const { data } = await api.get("/medicines", { params });
  return data;
};

export const getMedicine = async (id: string) => {
  const { data } = await api.get(`/medicines/${id}`);
  return data;
};

export const createMedicine = async (medicine: {
  name: string;
  description?: string;
  manufacturer?: string;
  mrp: number;
  sellingPrice: number;
  stock: number;
  expiryDate: string;
  reorderLevel: number;
}) => {
  const { data } = await api.post("/medicines", medicine);
  return data;
};

export const updateMedicine = async (
  id: string,
  medicine: Partial<{
    name: string;
    description: string;
    manufacturer: string;
    mrp: number;
    sellingPrice: number;
    stock: number;
    expiryDate: string;
    reorderLevel: number;
  }>
) => {
  const { data } = await api.patch(`/medicines/${id}`, medicine);
  return data;
};

export const deleteMedicine = async (id: string) => {
  const { data } = await api.delete(`/medicines/${id}`);
  return data;
};

// Sales
export const getSales = async (filters?: { startDate?: string; endDate?: string }) => {
  const { data } = await api.get("/sales", { params: filters });
  return data;
};

export const getSale = async (id: string) => {
  const { data } = await api.get(`/sales/${id}`);
  return data;
};

export const createSale = async (sale: {
  customerName?: string;
  customerPhone?: string;
  items: {
    medicineId: string;
    quantity: number;
  }[];
  paymentMethod: string;
}) => {
  const { data } = await api.post("/sales", sale);
  return data;
};

// Users
export const getUsers = async () => {
  const { data } = await api.get("/users");
  return data;
};

export const createUser = async (user: {
  name: string;
  email: string;
  password: string;
  role: string;
}) => {
  const { data } = await api.post("/auth/register", user);
  return data;
};

export const deleteUser = async (id: string) => {
  const { data } = await api.delete(`/users/${id}`);
  return data;
};

// Expenses
export const getExpenses = async (filters?: { period?: string; startDate?: string; endDate?: string }) => {
  const { data } = await api.get("/expenses", { params: filters });
  return data;
};

export const createExpense = async (expense: {
  amount: number;
  category: string;
  description?: string;
  date?: string;
}) => {
  const { data } = await api.post("/expenses", expense);
  return data;
};

// Reports
export const getReportsSummary = async (filters?: { period?: string; startDate?: string; endDate?: string }) => {
  const { data } = await api.get("/reports/sales-summary", { params: filters });
  return data;
};

export const getTopSelling = async () => {
  const { data } = await api.get("/reports/top-selling");
  return data;
};

// SWR fetcher
export const fetcher = async (url: string) => {
  const { data } = await api.get(url);
  return data;
};
