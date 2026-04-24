import { useDashboard } from '../hooks/use-dashboard';
import { useNavigate } from 'react-router-dom';
import { KPICard } from '../components/ui/kpi-card';
import { Skeleton } from '../components/ui/loading-skeleton';
import {
  DollarSign,
  ShoppingCart,
  TrendingDown,
  AlertTriangle,
  Package,
  Clock,
  Pill,
  ReceiptText,
  BarChart3,
  ArrowRight,
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';

export function DashboardPage() {
  const { summary, topSelling, isLoading } = useDashboard();
  const navigate = useNavigate();

  if (isLoading) {
    return (
      <div className="page-container space-y-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map(i => (
            <Skeleton key={i} className="h-24" />
          ))}
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map(i => (
            <Skeleton key={i} className="h-24" />
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          <div className="lg:col-span-2">
            <Skeleton className="h-80" />
          </div>
          <Skeleton className="h-80" />
        </div>
      </div>
    );
  }

  const kpis = [
    {
      label: "Today's Revenue",
      value: `₹${(summary?.today.revenue ?? 0).toLocaleString()}`,
      icon: DollarSign,
      variant: 'green' as const,
    },
    {
      label: "Today's Expenses",
      value: `₹${(summary?.today.expenses ?? 0).toLocaleString()}`,
      icon: TrendingDown,
      variant: 'red' as const,
    },
    {
      label: 'Net Earned',
      value: `₹${(summary?.today.netEarned ?? 0).toLocaleString()}`,
      icon: DollarSign,
      variant: 'blue' as const,
    },
    {
      label: 'Invoices Today',
      value: String(summary?.today.invoices ?? 0),
      icon: ShoppingCart,
      variant: 'default' as const,
    },
  ];

  const alerts = [
    {
      label: 'Low Stock',
      count: summary?.alerts.lowStockItems ?? 0,
      icon: Package,
      variant: 'amber' as const,
      path: '/medicines',
    },
    {
      label: 'Expiring Soon',
      count: summary?.alerts.expiringSoonItems ?? 0,
      icon: Clock,
      variant: 'blue' as const,
      path: '/medicines',
    },
    {
      label: 'Expired',
      count: summary?.alerts.expiredItems ?? 0,
      icon: AlertTriangle,
      variant: 'red' as const,
      path: '/medicines',
    },
  ];

  const quickActions = [
    { label: 'New Sale', icon: ShoppingCart, path: '/pos', shortcut: 'F2', color: 'var(--accent)' },
    { label: 'Medicines', icon: Pill, path: '/medicines', shortcut: 'F3', color: 'var(--color-blue)' },
    { label: 'Expenses', icon: ReceiptText, path: '/expenses', shortcut: 'F4', color: 'var(--color-amber)' },
    { label: 'Reports', icon: BarChart3, path: '/reports', shortcut: '', color: 'var(--color-green)' },
  ];

  const COLORS = ['#0d9488', '#2563eb', '#d97706', '#dc2626', '#7c3aed'];

  return (
    <div className="page-container space-y-6 pb-8">
      <div className="page-header">
        <div>
          <h1 className="page-title">Dashboard</h1>
          <p className="page-subtitle">Today's overview at a glance</p>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {kpis.map((kpi, i) => (
          <KPICard
            key={i}
            icon={kpi.icon}
            label={kpi.label}
            value={kpi.value}
            variant={kpi.variant}
          />
        ))}
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {quickActions.map((action, i) => (
          <button
            key={i}
            onClick={() => navigate(action.path)}
            className="card card-hover p-5 flex items-center gap-4 text-left group transition-all hover:shadow-md"
          >
            <div
              className="h-10 w-10 rounded-lg flex items-center justify-center text-white shrink-0"
              style={{ backgroundColor: action.color }}
            >
              <action.icon size={20} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-[var(--text-primary)] text-sm">{action.label}</p>
              {action.shortcut && (
                <p className="text-xs text-[var(--text-muted)] mt-0.5">Press {action.shortcut}</p>
              )}
            </div>
            <ArrowRight size={16} className="text-[var(--text-muted)] opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0" />
          </button>
        ))}
      </div>

      {/* Main Content Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Top Selling Chart */}
        <div className="lg:col-span-2 card p-6">
          <h3 className="text-base font-bold text-[var(--text-primary)] mb-5">Top Selling Medicines</h3>
          <div className="h-96 w-full">
            {topSelling && topSelling.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={topSelling} layout="vertical" barCategoryGap="25%">
                  <XAxis type="number" tick={{ fill: '#94a3b8', fontSize: 12 }} axisLine={false} tickLine={false} />
                  <YAxis
                    dataKey="name"
                    type="category"
                    tick={{ fill: '#475569', fontSize: 12 }}
                    width={100}
                    axisLine={false}
                    tickLine={false}
                  />
                  <Tooltip
                    cursor={{ fill: 'rgba(0,0,0,0.04)' }}
                    contentStyle={{
                      background: '#fff',
                      border: '1px solid #e2e8f0',
                      borderRadius: '8px',
                      fontSize: '13px',
                    }}
                  />
                  <Bar dataKey="totalQuantitySold" radius={[0, 4, 4, 0]}>
                    {topSelling.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-[var(--text-muted)]">
                No sales data available
              </div>
            )}
          </div>
        </div>

        {/* Inventory Alerts */}
        <div className="card p-6">
          <h3 className="text-sm font-semibold text-[var(--text-primary)] mb-5">Inventory Alerts</h3>
          <div className="space-y-3">
            {alerts.map((alert, i) => (
              <button
                key={i}
                onClick={() => navigate(alert.path)}
                className="w-full flex items-center justify-between p-4 rounded-lg border border-[var(--border-light)] hover:bg-[var(--bg-table-hover)] transition-colors text-left"
              >
                <div className="flex items-center gap-3 min-w-0 flex-1">
                  <alert.icon size={18} className={`text-[var(--color-${alert.variant})] flex-shrink-0`} />
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-[var(--text-primary)] truncate">{alert.label}</p>
                    <p className="text-xs text-[var(--text-muted)]">Requires attention</p>
                  </div>
                </div>
                <span className={`text-xl font-bold text-[var(--color-${alert.variant})] ml-2 flex-shrink-0`}>
                  {alert.count}
                </span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
