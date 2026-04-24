import { useState } from 'react';
import { useExpenses } from '../hooks/use-expenses';
import { ModalForm } from '../components/ui/modal-form';
import { EmptyState } from '../components/ui/empty-state';
import { Skeleton } from '../components/ui/loading-skeleton';
import { Badge } from '../components/ui/badge';
import { Plus, ArrowUpRight, Filter, ReceiptText } from 'lucide-react';
import type { CreateExpenseDto } from '../lib/types';
import { useToast } from '../contexts/toast-context';

export function ExpensesPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [filters, setFilters] = useState<{ period?: string; startDate?: string; endDate?: string }>({
    period: 'monthly',
  });
  const [formData, setFormData] = useState<CreateExpenseDto>({
    amount: 0,
    category: 'Salary',
    description: '',
  });

  const { success, error } = useToast();
  const { expenses, isLoading, createExpense } = useExpenses(filters);
  const totalAmount = expenses?.reduce((sum, e) => sum + e.amount, 0) || 0;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.amount || !formData.description) {
      error('Please fill all fields');
      return;
    }
    try {
      await createExpense(formData);
      setIsModalOpen(false);
      setFormData({ amount: 0, category: 'Salary', description: '' });
      success('Expense added successfully');
    } catch (err: any) {
      error(err.message || 'Failed to add expense');
    }
  };

  const categories = ['Salary', 'Rent', 'Utilities', 'Supplies', 'Marketing', 'Maintenance', 'Other'];

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'Salary':
        return 'blue';
      case 'Inventory Purchase':
        return 'amber';
      default:
        return 'green';
    }
  };

  return (
    <div className="page-container pb-8">
      <div className="page-header">
        <div>
          <h1 className="page-title">Expense Management</h1>
          <p className="page-subtitle">Track your pharmacy operational costs</p>
        </div>
        <button onClick={() => setIsModalOpen(true)} className="btn btn-primary">
          <Plus size={16} /> Log Expense
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-5">
        <div className="stat-card red md:col-span-1">
          <div className="flex items-center gap-3 mb-2">
            <ArrowUpRight size={18} className="text-[var(--text-muted)]" />
            <span className="text-xs font-medium text-[var(--text-muted)] uppercase tracking-wide">Total in Period</span>
          </div>
          <p className="text-3xl font-bold text-[var(--text-primary)]">₹{totalAmount.toLocaleString()}</p>
        </div>

        <div className="card p-5 md:col-span-2 flex flex-col justify-center">
          <div className="flex items-center gap-2 mb-3">
            <Filter size={16} className="text-[var(--text-muted)]" />
            <h3 className="text-sm font-semibold text-[var(--text-primary)]">Filter Period</h3>
          </div>
          <div className="flex flex-wrap gap-3">
            <select
              className="select select-sm w-full md:w-auto md:max-w-[160px]"
              value={filters.period || ''}
              onChange={e => setFilters({ period: e.target.value, startDate: '', endDate: '' })}
            >
              <option value="weekly">This Week</option>
              <option value="monthly">This Month</option>
              <option value="yearly">This Year</option>
              <option value="">All Time / Custom</option>
            </select>

            <div className="flex items-center gap-2 flex-wrap w-full md:w-auto">
              <input
                type="date"
                className="input input-sm w-full md:w-auto"
                value={filters.startDate || ''}
                onChange={e => setFilters({ period: '', startDate: e.target.value, endDate: filters.endDate })}
              />
              <span className="text-[var(--text-muted)] text-sm whitespace-nowrap">to</span>
              <input
                type="date"
                className="input input-sm w-full md:w-auto"
                value={filters.endDate || ''}
                onChange={e => setFilters({ period: '', startDate: filters.startDate, endDate: e.target.value })}
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
            {isLoading && (
              <>
                {[1, 2, 3, 4].map(i => (
                  <tr key={i}>
                    <td>
                      <Skeleton className="h-6" />
                    </td>
                    <td>
                      <Skeleton className="h-6" />
                    </td>
                    <td>
                      <Skeleton className="h-6" />
                    </td>
                    <td>
                      <Skeleton className="h-6" />
                    </td>
                  </tr>
                ))}
              </>
            )}
            {!isLoading && expenses && expenses.length > 0 && (
              expenses.map(expense => (
                <tr key={expense._id}>
                  <td className="text-sm text-[var(--text-secondary)]">
                    {new Date(expense.date).toLocaleDateString('en-IN', {
                      day: '2-digit',
                      month: 'short',
                      year: 'numeric',
                    })}
                  </td>
                  <td>
                    <Badge label={expense.category} variant={getCategoryColor(expense.category) as any} />
                  </td>
                  <td className="text-sm text-[var(--text-secondary)]">{expense.description}</td>
                  <td className="text-right font-medium text-[var(--text-primary)]">₹{expense.amount}</td>
                </tr>
              ))
            )}
            {!isLoading && (!expenses || expenses.length === 0) && (
              <tr>
                <td colSpan={4} className="p-0">
                  <EmptyState
                    icon={ReceiptText}
                    title="No expenses logged"
                    description="Log your first expense to track operational costs"
                    action={{
                      label: 'Add Expense',
                      onClick: () => setIsModalOpen(true),
                    }}
                  />
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <ModalForm
        title="Log New Expense"
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleSubmit}
        submitLabel="Save Expense"
        maxWidth="max-w-md"
      >
        <div className="form-field">
          <label className="form-label">Amount (₹)</label>
          <input
            type="number"
            min="0"
            step="0.01"
            required
            className="input"
            value={formData.amount || ''}
            onChange={e => setFormData({ ...formData, amount: parseFloat(e.target.value) })}
            autoFocus
          />
        </div>

        <div className="form-field">
          <label className="form-label">Category</label>
          <select
            className="select"
            value={formData.category}
            onChange={e => setFormData({ ...formData, category: e.target.value })}
          >
            {categories.map(c => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>

        <div className="form-field">
          <label className="form-label">Description</label>
          <textarea
            required
            className="input"
            placeholder="What was this expense for?"
            value={formData.description}
            onChange={e => setFormData({ ...formData, description: e.target.value })}
            style={{ minHeight: '100px', resize: 'vertical' }}
          />
        </div>
      </ModalForm>
    </div>
  );
}
