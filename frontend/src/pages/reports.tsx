import { useState } from 'react';
import { useReports } from '../hooks/use-reports';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Legend
} from 'recharts';
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  Receipt,
  Download,
  Calendar
} from 'lucide-react';

export function ReportsPage() {
  const [filters, setFilters] = useState({ period: 'monthly', startDate: '', endDate: '' });
  const { summary, isLoading } = useReports(filters);

  const stats = [
    { label: 'Total Revenue', value: summary?.grandTotals.totalRevenue, icon: DollarSign, color: 'text-teal-500' },
    { label: 'Total Expenses', value: summary?.grandTotals.totalExpenses, icon: TrendingDown, color: 'text-red-500' },
    { label: 'Net Profit', value: summary?.grandTotals.netEarned, icon: TrendingUp, color: 'text-green-500' },
    { label: 'Total Invoices', value: summary?.grandTotals.totalInvoices, icon: Receipt, color: 'text-blue-500' },
  ];

  if (isLoading) {
    return (
      <div className="page-container space-y-8">
        <div className="grid-cards">
          {[1, 2, 3, 4].map(i => <div key={i} className="h-28 skeleton" />)}
        </div>
        <div className="h-96 skeleton" />
      </div>
    );
  }

  return (
    <div className="page-container pb-12">
      <div className="page-header">
        <div>
          <h1 className="page-title">Financial Reports</h1>
          <p className="page-subtitle">Analyze your pharmacy performance over time</p>
        </div>
        <div className="flex gap-4 items-center glass-card-static px-4 py-2">
           <Calendar size={18} className="text-slate-500" />
           <select 
             className="bg-transparent border-none text-white text-sm font-bold outline-none cursor-pointer"
             value={filters.period}
             onChange={e => setFilters(f => ({ ...f, period: e.target.value }))}
           >
              <option value="weekly">Weekly View</option>
              <option value="monthly">Monthly View</option>
              <option value="yearly">Yearly View</option>
           </select>
        </div>
      </div>

      <div className="grid-cards mb-8">
        {stats.map((stat, i) => (
          <div key={i} className="glass-card p-6">
            <div className="flex items-center justify-between mb-4">
               <div className={`p-2 rounded-lg bg-slate-900/50 ${stat.color}`}>
                  <stat.icon size={20} />
               </div>
               <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{filters.period}</span>
            </div>
            <p className="text-sm font-medium text-slate-400">{stat.label}</p>
            <h2 className="text-2xl font-black text-white mt-1">
               {stat.label.includes('Invoices') ? stat.value : `₹${stat.value?.toLocaleString()}`}
            </h2>
          </div>
        ))}
      </div>

      <div className="glass-card p-8">
         <div className="flex items-center justify-between mb-8">
            <h3 className="text-lg font-bold text-white">Revenue vs Expenses</h3>
            <button onClick={() => window.print()} className="text-teal-500 text-xs font-bold flex items-center gap-2 hover:underline">
               <Download size={14} /> Export Report
            </button>
         </div>
         <div className="h-96 w-full">
            {summary && summary.timeSeries.length > 0 ? (
               <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={summary.timeSeries}>
                     <defs>
                        <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                           <stop offset="5%" stopColor="#14b8a6" stopOpacity={0.3}/>
                           <stop offset="95%" stopColor="#14b8a6" stopOpacity={0}/>
                        </linearGradient>
                        <linearGradient id="colorExp" x1="0" y1="0" x2="0" y2="1">
                           <stop offset="5%" stopColor="#ef4444" stopOpacity={0.2}/>
                           <stop offset="95%" stopColor="#ef4444" stopOpacity={0}/>
                        </linearGradient>
                     </defs>
                     <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.05)" vertical={false} />
                     <XAxis 
                       dataKey="date" 
                       tick={{ fill: '#64748b', fontSize: 11 }} 
                       axisLine={false}
                       tickLine={false}
                       dy={10}
                     />
                     <YAxis 
                       tick={{ fill: '#64748b', fontSize: 11 }} 
                       axisLine={false}
                       tickLine={false}
                       tickFormatter={(value) => `₹${value >= 1000 ? (value/1000).toFixed(0)+'k' : value}`}
                     />
                     <Tooltip 
                       contentStyle={{ background: '#0a0e1a', border: '1px solid rgba(148,163,184,0.1)', borderRadius: '12px', boxShadow: '0 10px 30px rgba(0,0,0,0.5)' }}
                       itemStyle={{ fontSize: '12px', fontWeight: 'bold' }}
                     />
                     <Legend verticalAlign="top" align="right" height={36} iconType="circle" />
                     <Area 
                       type="monotone" 
                       dataKey="revenue" 
                       name="Revenue"
                       stroke="#14b8a6" 
                       strokeWidth={3}
                       fillOpacity={1} 
                       fill="url(#colorRev)" 
                     />
                     <Area 
                       type="monotone" 
                       dataKey="expenses" 
                       name="Expenses"
                       stroke="#ef4444" 
                       strokeWidth={3}
                       fillOpacity={1} 
                       fill="url(#colorExp)" 
                     />
                  </AreaChart>
               </ResponsiveContainer>
            ) : (
               <div className="h-full flex items-center justify-center text-slate-500 italic">
                  Not enough data to plot chart for this period
               </div>
            )}
         </div>
      </div>
    </div>
  );
}
