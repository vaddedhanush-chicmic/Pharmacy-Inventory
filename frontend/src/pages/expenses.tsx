import { useState } from 'react';
import { useExpenses } from '../hooks/use-expenses';
import { useToast } from '../contexts/toast-context';
import { 
  Plus, 
  ArrowUpRight,
  X
} from 'lucide-react';

export function ExpensesPage() {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [filters, setFilters] = useState({ period: 'monthly', startDate: '', endDate: '' });
  const [formData, setFormData] = useState({ amount: 0, category: 'Other', description: '', date: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { success, error } = useToast();
  const { expenses, isLoading, createExpense } = useExpenses(filters);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await createExpense({
        ...formData,
        date: formData.date || undefined
      });
      success('Expense logged successfully');
      setIsFormOpen(false);
      setFormData({ amount: 0, category: 'Other', description: '', date: '' });
    } catch (err: any) {
      error(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const totalExpenses = expenses?.reduce((acc, exp) => acc + exp.amount, 0) || 0;

  return (
    <div className="page-container pb-12">
      <div className="page-header">
        <div>
          <h1 className="page-title">Expense Management</h1>
          <p className="page-subtitle">Track your pharmacy operational costs</p>
        </div>
        <button onClick={() => setIsFormOpen(true)} className="btn btn-primary">
          <Plus size={18} />
          Log Expense
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-8">
         <div className="glass-card p-6 flex flex-col gap-1 border-l-4 border-red-500">
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Total in Period</p>
            <h2 className="text-3xl font-black text-white">₹{totalExpenses.toLocaleString()}</h2>
            <div className="flex items-center gap-1 text-red-500 text-xs mt-2 font-bold">
               <ArrowUpRight size={14} /> 
               <span>Operational Outflow</span>
            </div>
         </div>
         
         <div className="lg:col-span-3 glass-card p-6 flex flex-wrap gap-4 items-end">
            <div className="flex-1 min-w-[150px]">
               <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Period</label>
               <select 
                 className="select w-full"
                 value={filters.period}
                 onChange={e => setFilters(f => ({ ...f, period: e.target.value }))}
               >
                  <option value="weekly">This Week</option>
                  <option value="monthly">This Month</option>
                  <option value="yearly">This Year</option>
                  <option value="">Custom Range</option>
               </select>
            </div>
            {!filters.period && (
               <>
                  <div className="flex-1 min-w-[150px]">
                     <label className="block text-xs font-bold text-slate-500 uppercase mb-2">From</label>
                     <input type="date" className="input" value={filters.startDate} onChange={e => setFilters(f => ({ ...f, startDate: e.target.value }))} />
                  </div>
                  <div className="flex-1 min-w-[150px]">
                     <label className="block text-xs font-bold text-slate-500 uppercase mb-2">To</label>
                     <input type="date" className="input" value={filters.endDate} onChange={e => setFilters(f => ({ ...f, endDate: e.target.value }))} />
                  </div>
               </>
            )}
         </div>
      </div>

      <div className="table-container glass-card-static">
        <table>
          <thead>
            <tr>
              <th>Date</th>
              <th>Category</th>
              <th>Description</th>
              <th>Amount</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
               [1, 2, 3].map(i => <tr key={i}><td colSpan={4} className="p-4"><div className="h-8 skeleton" /></td></tr>)
            ) : expenses?.length ? (
               expenses.map(exp => (
                 <tr key={exp._id}>
                    <td className="text-sm font-medium text-slate-300">
                       {new Date(exp.date).toLocaleDateString()}
                    </td>
                    <td>
                       <span className={`badge ${
                         exp.category === 'Salary' ? 'badge-blue' : 
                         exp.category === 'Inventory Purchase' ? 'badge-teal' : 
                         exp.category === 'Electricity' ? 'badge-amber' : 
                         'badge-green'
                       }`}>
                          {exp.category}
                       </span>
                    </td>
                    <td className="text-sm text-slate-400 max-w-xs truncate">
                       {exp.description || '-'}
                    </td>
                    <td className="font-bold text-red-400">
                       ₹{exp.amount.toLocaleString()}
                    </td>
                 </tr>
               ))
            ) : (
              <tr><td colSpan={4} className="p-12 text-center text-slate-500 italic">No expenses logged for this period</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Log Expense Modal */}
      {isFormOpen && (
        <div className="modal-overlay">
           <div className="modal-content">
              <div className="flex items-center justify-between mb-6">
                 <h2 className="text-xl font-bold text-white">Log New Expense</h2>
                 <button onClick={() => setIsFormOpen(false)} className="text-slate-400 hover:text-white"><X size={20} /></button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                 <div>
                    <label className="block text-sm font-medium text-slate-300 mb-1">Amount (₹) *</label>
                    <input 
                      type="number" 
                      className="input" 
                      required 
                      min="0"
                      value={formData.amount}
                      onChange={e => setFormData(f => ({ ...f, amount: Number(e.target.value) }))}
                    />
                 </div>
                 <div>
                    <label className="block text-sm font-medium text-slate-300 mb-1">Category *</label>
                    <select 
                      className="select w-full" 
                      value={formData.category}
                      onChange={e => setFormData(f => ({ ...f, category: e.target.value }))}
                    >
                       <option>Inventory Purchase</option>
                       <option>Salary</option>
                       <option>Electricity</option>
                       <option>Maintenance</option>
                       <option>Other</option>
                    </select>
                 </div>
                 <div>
                    <label className="block text-sm font-medium text-slate-300 mb-1">Date (Optional)</label>
                    <input 
                      type="date" 
                      className="input" 
                      value={formData.date}
                      onChange={e => setFormData(f => ({ ...f, date: e.target.value }))}
                    />
                 </div>
                 <div>
                    <label className="block text-sm font-medium text-slate-300 mb-1">Description</label>
                    <textarea 
                      className="input h-24 resize-none" 
                      placeholder="Details about the expense..." 
                      value={formData.description}
                      onChange={e => setFormData(f => ({ ...f, description: e.target.value }))}
                    />
                 </div>
                 <div className="flex justify-end gap-3 pt-4">
                    <button type="button" onClick={() => setIsFormOpen(false)} className="btn btn-secondary">Cancel</button>
                    <button type="submit" disabled={isSubmitting} className="btn btn-primary">
                       {isSubmitting ? 'Logging...' : 'Save Expense'}
                    </button>
                 </div>
              </form>
           </div>
        </div>
      )}
    </div>
  );
}
