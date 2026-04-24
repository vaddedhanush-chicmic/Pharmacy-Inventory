import { useState } from 'react';
import { useReports } from '../hooks/use-reports';
import { KPICard } from '../components/ui/kpi-card';
import { Skeleton } from '../components/ui/loading-skeleton';
import { XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, AreaChart, Area } from 'recharts';
import { TrendingUp, TrendingDown, DollarSign, Receipt, Calendar, Download } from 'lucide-react';

export function ReportsPage() {
  const [period, setPeriod] = useState<'weekly' | 'monthly' | 'yearly'>('monthly');
  const { summary, isLoading } = useReports({ period });

  if (isLoading) {
    return (
      <div className="page-container space-y-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map(i => (
            <Skeleton key={i} className="h-24" />
          ))}
        </div>
        <Skeleton className="h-96 mt-6" />
      </div>
    );
  }

  const kpis = [
    {
      label: 'Total Revenue',
      value: `₹${(summary?.grandTotals.totalRevenue ?? 0).toLocaleString()}`,
      icon: DollarSign,
      variant: 'green' as const,
    },
    {
      label: 'Total Expenses',
      value: `₹${(summary?.grandTotals.totalExpenses ?? 0).toLocaleString()}`,
      icon: TrendingDown,
      variant: 'red' as const,
    },
    {
      label: 'Net Profit',
      value: `₹${(summary?.grandTotals.netEarned ?? 0).toLocaleString()}`,
      icon: TrendingUp,
      variant: 'blue' as const,
    },
    {
      label: 'Total Invoices',
      value: String(summary?.grandTotals.totalInvoices ?? 0),
      icon: Receipt,
      variant: 'default' as const,
    },
  ];

  return (
    <div className="page-container pb-8">
      <div className="page-header">
        <div>
          <h1 className="page-title">Financial Reports</h1>
          <p className="page-subtitle">Analyze your pharmacy performance over time</p>
        </div>
        <div className="flex items-center gap-3 flex-wrap">
          <div className="flex items-center gap-2 bg-[var(--bg-input)] border border-[var(--border-input)] px-3 py-1.5 rounded-lg">
            <Calendar size={14} className="text-[var(--text-muted)]" />
            <select
              className="bg-transparent border-none outline-none text-sm font-medium text-[var(--text-primary)] cursor-pointer"
              value={period}
              onChange={e => setPeriod(e.target.value as any)}
            >
              <option value="weekly">Weekly View</option>
              <option value="monthly">Monthly View</option>
              <option value="yearly">Yearly View</option>
            </select>
          </div>
          <button className="btn btn-secondary btn-sm" onClick={() => window.print()}>
            <Download size={14} /> Export
          </button>
        </div>
      </div>

      {/* KPI Strip */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {kpis.map((kpi, i) => (
          <KPICard key={i} icon={kpi.icon} label={kpi.label} value={kpi.value} variant={kpi.variant} />
        ))}
      </div>

      {/* Main Chart */}
      <div className="card p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-base font-semibold text-[var(--text-primary)]">Revenue vs Expenses</h3>
          <span className="text-xs bg-[var(--bg-table-stripe)] px-2 py-1 rounded text-[var(--text-muted)] uppercase tracking-wider border border-[var(--border-light)]">
            {period}
          </span>
        </div>

        <div className="h-96 w-full">
          {summary?.timeSeries && summary.timeSeries.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={summary.timeSeries} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--accent)" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="var(--accent)" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="colorExp" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--color-red)" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="var(--color-red)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border-light)" />
                <XAxis
                  dataKey="date"
                  tick={{ fill: 'var(--text-muted)', fontSize: 12 }}
                  axisLine={false}
                  tickLine={false}
                  dy={10}
                />
                <YAxis
                  tick={{ fill: 'var(--text-muted)', fontSize: 12 }}
                  axisLine={false}
                  tickLine={false}
                  tickFormatter={val => `₹${val}`}
                />
                <Tooltip
                  contentStyle={{
                    background: '#fff',
                    border: '1px solid var(--border-medium)',
                    borderRadius: '8px',
                    fontSize: '13px',
                    boxShadow: 'var(--shadow-sm)',
                  }}
                  formatter={(value: any) => [`₹${Number(value).toLocaleString()}`, '']}
                />
                <Legend iconType="circle" wrapperStyle={{ fontSize: '13px', paddingTop: '20px' }} />
                <Area
                  type="monotone"
                  dataKey="revenue"
                  name="Revenue"
                  stroke="var(--accent)"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#colorRev)"
                />
                <Area
                  type="monotone"
                  dataKey="expenses"
                  name="Expenses"
                  stroke="var(--color-red)"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#colorExp)"
                />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-[var(--text-muted)] border-2 border-dashed border-[var(--border-light)] rounded-xl">
              <TrendingUp size={32} className="mb-2 opacity-30" />
              <p>No financial data available for this period</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
