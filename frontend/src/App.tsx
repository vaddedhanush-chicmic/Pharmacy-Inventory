import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './contexts/auth-context';
import { ProtectedRoute } from './components/protected-route';
import { AppLayout } from './components/layout/app-layout';
import { LoginPage } from './pages/login';

import { DashboardPage } from './pages/dashboard';
import { MedicinesPage } from './pages/medicines';
import { POSPage } from './pages/pos';
import { SalesHistoryPage } from './pages/sales-history';
import { ExpensesPage } from './pages/expenses';
import { ReportsPage } from './pages/reports';
import { StaffPage } from './pages/users';

export function App() {
  const { isAuthenticated } = useAuth();

  return (
    <Routes>
      <Route 
        path="/login" 
        element={isAuthenticated ? <Navigate to="/" replace /> : <LoginPage />} 
      />
      
      <Route element={<ProtectedRoute><AppLayout /></ProtectedRoute>}>
        <Route path="/" element={<DashboardPage />} />
        <Route path="/medicines" element={<MedicinesPage />} />
        <Route path="/pos" element={<POSPage />} />
        <Route path="/sales" element={<SalesHistoryPage />} />
        <Route path="/expenses" element={<ExpensesPage />} />
        <Route path="/reports" element={<ReportsPage />} />
        <Route path="/users" element={<StaffPage />} />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
