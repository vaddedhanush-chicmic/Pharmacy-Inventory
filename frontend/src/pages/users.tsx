import { useState } from 'react';
import { useUsers } from '../hooks/use-users';
import { useToast } from '../contexts/toast-context';
import { useAuth } from '../contexts/auth-context';
import { 
  UserPlus, 
  Trash2, 
  Shield, 
  User as UserIcon,
  Mail,
  Lock,
  X
} from 'lucide-react';

export function StaffPage() {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [formData, setFormData] = useState({ name: '', email: '', password: '', role: 'Staff' });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { success, error } = useToast();
  const { user: currentUser } = useAuth();
  const { users, isLoading, registerUser, deleteUser } = useUsers();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await registerUser(formData as any);
      success('Staff member registered successfully');
      setIsFormOpen(false);
      setFormData({ name: '', email: '', password: '', role: 'Staff' });
    } catch (err: any) {
      error(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (id === currentUser?._id) return error("You can't delete yourself");
    if (!confirm('Are you sure you want to remove this staff member?')) return;
    
    try {
      await deleteUser(id);
      success('Staff member removed');
    } catch (err: any) {
      error(err.message);
    }
  };

  return (
    <div className="page-container pb-12">
      <div className="page-header">
        <div>
          <h1 className="page-title">Staff Management</h1>
          <p className="page-subtitle">Manage pharmacy access and user accounts</p>
        </div>
        <button onClick={() => setIsFormOpen(true)} className="btn btn-primary">
          <UserPlus size={18} />
          Add Staff Member
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
         {isLoading ? (
            [1, 2, 3].map(i => <div key={i} className="h-40 skeleton" />)
         ) : users?.map(u => (
            <div key={u._id} className="glass-card p-6 flex items-start gap-4">
               <div className={`h-12 w-12 rounded-full flex items-center justify-center shrink-0 ${u.role === 'Admin' ? 'bg-amber-500/20 text-amber-500' : 'bg-teal-500/20 text-teal-500'}`}>
                  {u.role === 'Admin' ? <Shield size={24} /> : <UserIcon size={24} />}
               </div>
               <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                     <h3 className="font-bold text-white truncate">{u.name}</h3>
                     <span className={`badge text-[10px] ${u.role === 'Admin' ? 'badge-amber' : 'badge-teal'}`}>{u.role}</span>
                  </div>
                  <p className="text-sm text-slate-400 mt-1 truncate">{u.email}</p>
                  <div className="mt-4 flex justify-end">
                     <button 
                       onClick={() => handleDelete(u._id)}
                       disabled={u._id === currentUser?._id}
                       className="p-2 text-red-500/40 hover:text-red-500 disabled:opacity-0"
                     >
                        <Trash2 size={18} />
                     </button>
                  </div>
               </div>
            </div>
         ))}
      </div>

      {/* Add User Modal */}
      {isFormOpen && (
        <div className="modal-overlay">
           <div className="modal-content">
              <div className="flex items-center justify-between mb-6">
                 <h2 className="text-xl font-bold text-white">Register Staff</h2>
                 <button onClick={() => setIsFormOpen(false)} className="text-slate-400 hover:text-white"><X size={20} /></button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                 <div>
                    <label className="block text-sm font-medium text-slate-300 mb-1">Full Name *</label>
                    <div className="relative">
                       <UserIcon size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                       <input type="text" className="input pl-9" required value={formData.name} onChange={e => setFormData(f => ({ ...f, name: e.target.value }))} />
                    </div>
                 </div>
                 <div>
                    <label className="block text-sm font-medium text-slate-300 mb-1">Email Address *</label>
                    <div className="relative">
                       <Mail size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                       <input type="email" className="input pl-9" required value={formData.email} onChange={e => setFormData(f => ({ ...f, email: e.target.value }))} />
                    </div>
                 </div>
                 <div>
                    <label className="block text-sm font-medium text-slate-300 mb-1">Password *</label>
                    <div className="relative">
                       <Lock size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                       <input type="password" title="At least 6 characters" className="input pl-9" required minLength={6} value={formData.password} onChange={e => setFormData(f => ({ ...f, password: e.target.value }))} />
                    </div>
                 </div>
                 <div>
                    <label className="block text-sm font-medium text-slate-300 mb-1">Access Role *</label>
                    <select className="select w-full" value={formData.role} onChange={e => setFormData(f => ({ ...f, role: e.target.value }))}>
                       <option value="Staff">Staff (POS & Inventory access)</option>
                       <option value="Admin">Admin (Full system access)</option>
                    </select>
                 </div>
                 <div className="flex justify-end gap-3 pt-4">
                    <button type="button" onClick={() => setIsFormOpen(false)} className="btn btn-secondary">Cancel</button>
                    <button type="submit" disabled={isSubmitting} className="btn btn-primary">
                       {isSubmitting ? 'Registering...' : 'Add Staff Member'}
                    </button>
                 </div>
              </form>
           </div>
        </div>
      )}
    </div>
  );
}
