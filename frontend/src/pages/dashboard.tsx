import { useDashboard } from '../hooks/use-dashboard';
import { 
  DollarSign, 
  ShoppingCart, 
  TrendingUp, 
  AlertTriangle, 
  Package, 
  Clock 
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';

export function DashboardPage() {
  const { summary, topSelling, isLoading } = useDashboard();

  if (isLoading) {
    return (
      <div className="page-container space-y-10">
        <div className="grid-cards">
          {[1, 2, 3, 4].map(i => <div key={i} className="h-36 skeleton" />)}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-10">
          <div className="h-96 skeleton" />
          <div className="h-96 skeleton" />
        </div>
      </div>
    );
  }

  const kpis = [
    { 
      label: "Today's Revenue", 
      value: `₹${(summary?.today.revenue ?? 0).toLocaleString()}`, 
      icon: DollarSign, 
      color: "text-teal-500", 
      bg: "bg-teal-500/10" 
    },
    { 
      label: "Today's Expenses", 
      value: `₹${(summary?.today.expenses ?? 0).toLocaleString()}`, 
      icon: TrendingUp, 
      color: "text-red-500", 
      bg: "bg-red-500/10" 
    },
    { 
      label: "Net Earned", 
      value: `₹${(summary?.today.netEarned ?? 0).toLocaleString()}`, 
      icon: DollarSign, 
      color: "text-green-500", 
      bg: "bg-green-500/10" 
    },
    { 
      label: "Invoices Today", 
      value: summary?.today.invoices ?? 0, 
      icon: ShoppingCart, 
      color: "text-blue-500", 
      bg: "bg-blue-500/10" 
    },
  ];

  const alerts = [
    { label: "Low Stock", count: summary?.alerts.lowStockItems ?? 0, icon: Package, color: "text-amber-500", bgColor: "bg-amber-500/10" },
    { label: "Expiring Soon", count: summary?.alerts.expiringSoonItems ?? 0, icon: Clock, color: "text-blue-500", bgColor: "bg-blue-500/10" },
    { label: "Already Expired", count: summary?.alerts.expiredItems ?? 0, icon: AlertTriangle, color: "text-red-500", bgColor: "bg-red-500/10" },
  ];

  const COLORS = ['#14b8a6', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6'];

  return (
    <div className="page-container space-y-10 pb-16">
      {/* Page Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">Dashboard Overview</h1>
          <p className="page-subtitle">Real-time metrics for your pharmacy today</p>
        </div>
        <div className="flex gap-4 flex-wrap">
          {alerts.map((alert, i) => (
            <div key={i} className="flex items-center gap-3 px-4 py-2.5 rounded-xl border border-[rgba(148,163,184,0.1)] glass-card-static">
              <alert.icon size={16} className={alert.color} />
              <span className="text-sm text-slate-300">{alert.label}:</span>
              <span className={`text-sm font-bold ${alert.color}`}>{alert.count}</span>
            </div>
          ))}
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid-cards">
        {kpis.map((kpi, i) => (
          <div key={i} className="glass-card p-8 flex flex-col gap-3">
            <div className={`h-12 w-12 rounded-xl ${kpi.bg} flex items-center justify-center ${kpi.color}`}>
              <kpi.icon size={22} />
            </div>
            <p className="text-sm font-medium text-slate-400 mt-3">{kpi.label}</p>
            <h3 className="text-3xl font-bold text-white tracking-tight">{kpi.value}</h3>
          </div>
        ))}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Top Selling Chart */}
        <div className="glass-card p-8">
          <h3 className="text-lg font-semibold text-white mb-8">Top Selling Medicines</h3>
          <div className="h-72 w-full">
            {topSelling && topSelling.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={topSelling} layout="vertical" barCategoryGap="20%">
                  <XAxis type="number" hide />
                  <YAxis 
                    dataKey="name" 
                    type="category" 
                    tick={{ fill: '#94a3b8', fontSize: 13 }} 
                    width={110}
                  />
                  <Tooltip 
                    cursor={{ fill: 'rgba(148, 163, 184, 0.05)' }}
                    contentStyle={{ background: '#0f172a', border: '1px solid rgba(148,163,184,0.2)', borderRadius: '12px', padding: '12px 16px' }}
                    itemStyle={{ color: '#14b8a6' }}
                  />
                  <Bar dataKey="totalQuantitySold" radius={[0, 6, 6, 0]}>
                    {topSelling.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} fillOpacity={0.8} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-slate-500 italic text-lg">
                No sales data available yet
              </div>
            )}
          </div>
        </div>

        {/* Inventory Health */}
        <div className="glass-card p-8 flex flex-col">
          <h3 className="text-lg font-semibold text-white mb-8">Inventory Health</h3>
          <div className="flex-1 space-y-5">
            {alerts.map((alert, i) => (
              <div key={i} className="flex items-center justify-between p-5 rounded-2xl bg-slate-900/40 border border-[rgba(148,163,184,0.05)]">
                <div className="flex items-center gap-5">
                  <div className={`h-12 w-12 rounded-xl flex items-center justify-center ${alert.bgColor} ${alert.color}`}>
                    <alert.icon size={22} />
                  </div>
                  <div>
                    <p className="text-base font-semibold text-white">{alert.label}</p>
                    <p className="text-sm text-slate-400 mt-0.5">Requires attention</p>
                  </div>
                </div>
                <div className={`text-2xl font-bold ${alert.color}`}>
                  {alert.count}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
