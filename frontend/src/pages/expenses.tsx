import { useState } from 'react';
import { useExpenses } from '../hooks/use-expenses';
import { 
  Plus, 
  ArrowUpRight,
  X,
  Filter
} from 'lucide-react';
import type { CreateExpenseDto } from '../lib/types';

export function ExpensesPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [filters, setFilters] = useState<{ period?: string; startDate?: string; endDate?: string }>({ period: 'monthly' });
  const [formData, setFormData] = useState<CreateExpenseDto>({
    amount: 0,
    category: 'Salary',
    description: '',
  });

  const { expenses, isLoading, createExpense } = useExpenses(filters);
  const totalAmount = expenses?.reduce((sum, e) => sum + e.amount, 0) || 0;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createExpense(formData);
      setIsModalOpen(false);
      setFormData({ amount: 0, category: 'Salary', description: '' });
    } catch (err) {
      console.error(err);
    }
  };

  const categories = ['Salary', 'Rent', 'Utilities', 'Supplies', 'Marketing', 'Maintenance', 'Other'];

  return (
    <div className="page-container pb-8">
      <div className="page-header">
        <div>
          <h1 className="page-title">Expense Management</h1>
          <p className="page-subtitle">Track your pharmacy operational costs</p>
        </div>
        <button onClick={() => setIsModalOpen(true)} className="btn btn-primary">
          <Plus size={16} /> Log Expense <span className="shortcut">F4</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-5">
        <div className="stat-card red md:col-span-1">
          <div className="flex items-center gap-3 mb-2">
            <ArrowUpRight size={18} className="text-[var(--text-muted)]" />
            <span className="text-xs font-medium text-[var(--text-muted)] uppercase tracking-wide">Total in Period</span>
          </div>
          <p className="text-3xl font-bold text-[var(--text-primary)]">₹{totalAmount}</p>
        </div>

        <div className="card p-5 md:col-span-2 flex flex-col justify-center">
          <div className="flex items-center gap-2 mb-3">
            <Filter size={16} className="text-[var(--text-muted)]" />
            <h3 className="text-sm font-semibold text-[var(--text-primary)]">Filter Period</h3>
          </div>
          <div className="flex flex-wrap gap-3">
            <select 
              className="select w-full max-w-[160px]"
              value={filters.period || ''}
              onChange={(e) => setFilters({ period: e.target.value, startDate: '', endDate: '' })}
            >
              <option value="weekly">This Week</option>
              <option value="monthly">This Month</option>
              <option value="yearly">This Year</option>
              <option value="">All Time / Custom</option>
            </select>
            
            <div className="flex items-center gap-2 flex-wrap">
              <input 
                type="date" 
                className="input w-auto"
                value={filters.startDate || ''}
                onChange={(e) => setFilters({ period: '', startDate: e.target.value, endDate: filters.endDate })}
              />
              <span className="text-[var(--text-muted)] text-sm">to</span>
              <input 
                type="date" 
                className="input w-auto"
                value={filters.endDate || ''}
                onChange={(e) => setFilters({ period: '', startDate: filters.startDate, endDate: e.target.value })}
              />
            </div>
          </div>
        </div>
      </div>

      <div className="table-container">
        <table>
          <thead>
            <tr>
              <th className="w-32">Date</th>
              <th className="w-48">Category</th>
              <th>Description</th>
              <th className="w-32 text-right">Amount</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              [1, 2, 3, 4].map(i => (
                <tr key={i}><td colSpan={4}><div className="h-8 skeleton my-1" /></td></tr>
              ))
            ) : expenses && expenses.length > 0 ? (
              expenses.map(expense => (
                <tr key={expense._id}>
                  <td className="text-sm">
                    {new Date(expense.date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                  </td>
                  <td>
                    <span className={`badge ${
                      expense.category === 'Salary' ? 'badge-blue' : 
                      expense.category === 'Inventory Purchase' ? 'badge-amber' : 'badge-green'
                    }`}>
                      {expense.category}
                    </span>
                  </td>
                  <td className="text-sm">{expense.description}</td>
                  <td className="text-right font-medium text-[var(--text-primary)]">₹{expense.amount}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={4} className="text-center py-12 text-[var(--text-muted)]">
                  <ReceiptText size={32} className="mx-auto mb-3 opacity-30" />
                  <p>No expenses logged for this period</p>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {isModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="flex justify-between items-center mb-5">
              <h2 className="text-lg font-bold text-[var(--text-primary)]">Log New Expense</h2>
              <button onClick={() => setIsModalOpen(false)} className="text-[var(--text-muted)] hover:text-[var(--text-primary)]">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">Amount (₹)</label>
                <input 
                  type="number" 
                  min="0"
                  step="0.01"
                  required
                  className="input"
                  value={formData.amount || ''}
                  onChange={e => setFormData({...formData, amount: parseFloat(e.target.value)})}
                  autoFocus
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">Category</label>
                <select 
                  className="select w-full"
                  value={formData.category}
                  onChange={e => setFormData({...formData, category: e.target.value})}
                >
                  {categories.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">Description</label>
                <textarea 
                  required
                  className="input h-24"
                  placeholder="What was this expense for?"
                  value={formData.description}
                  onChange={e => setFormData({...formData, description: e.target.value})}
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button type="button" onClick={() => setIsModalOpen(false)} className="btn btn-secondary">
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Save Expense
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

// Needed to import ReceiptText for the empty state
import { ReceiptText } from 'lucide-react';
