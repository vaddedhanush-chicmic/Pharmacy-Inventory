import { useState } from 'react';
import { useUsers } from '../hooks/use-users';
import { 
  UserPlus, 
  Trash2,
  Shield,
  User as UserIcon,
  X
} from 'lucide-react';
import { useToast } from '../contexts/toast-context';

export function StaffPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({ name: '', email: '', password: '', role: 'Staff' as 'Admin' | 'Staff' });
  const { users, isLoading, registerUser, deleteUser } = useUsers();
  const { success, error } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await registerUser(formData);
      setIsModalOpen(false);
      setFormData({ name: '', email: '', password: '', role: 'Staff' });
      success('Staff account created');
    } catch (err: any) {
      error(err.message);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Remove this staff member?')) return;
    try {
      await deleteUser(id);
      success('Staff member removed');
    } catch (err: any) {
      error(err.message);
    }
  };

  return (
    <div className="page-container pb-8">
      <div className="page-header">
        <div>
          <h1 className="page-title">Operator Management</h1>
          <p className="page-subtitle">Manage pharmacy staff access and roles</p>
        </div>
        <button onClick={() => setIsModalOpen(true)} className="btn btn-primary">
          <UserPlus size={16} /> Add Operator
        </button>
      </div>

      <div className="table-container">
        <table>
          <thead>
            <tr>
              <th>Operator Name</th>
              <th>Email / Login ID</th>
              <th className="text-center w-32">Role</th>
              <th className="text-center w-24">Action</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              [1, 2].map(i => (
                <tr key={i}><td colSpan={4}><div className="h-10 skeleton my-1" /></td></tr>
              ))
            ) : users?.map(u => (
              <tr key={u._id}>
                <td>
                  <div className="flex items-center gap-3">
                    <div className="h-8 w-8 rounded-full bg-[var(--bg-table-stripe)] border border-[var(--border-light)] flex items-center justify-center text-[var(--accent)] font-bold">
                      {u.name[0].toUpperCase()}
                    </div>
                    <span className="font-medium text-[var(--text-primary)]">{u.name}</span>
                  </div>
                </td>
                <td className="text-[var(--text-secondary)]">{u.email}</td>
                <td className="text-center">
                  <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded border text-xs font-semibold ${
                    u.role === 'Admin' 
                      ? 'bg-[var(--color-blue-light)] text-[var(--color-blue)] border-[rgba(37,99,235,0.2)]' 
                      : 'bg-[var(--bg-table-stripe)] text-[var(--text-secondary)] border-[var(--border-light)]'
                  }`}>
                    {u.role === 'Admin' ? <Shield size={12} /> : <UserIcon size={12} />}
                    {u.role}
                  </span>
                </td>
                <td className="text-center">
                  <button 
                    onClick={() => handleDelete(u._id)}
                    className="p-1.5 text-[var(--color-red)] opacity-50 hover:opacity-100 hover:bg-[var(--color-red-light)] rounded transition-all"
                  >
                    <Trash2 size={16} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {isModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="flex justify-between items-center mb-5">
              <h2 className="text-lg font-bold text-[var(--text-primary)]">Add New Operator</h2>
              <button onClick={() => setIsModalOpen(false)} className="text-[var(--text-muted)] hover:text-[var(--text-primary)]">
                <X size={20} />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">Full Name</label>
                <input required className="input" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} autoFocus />
              </div>
              <div>
                <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">Login Email</label>
                <input type="email" required className="input" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} />
              </div>
              <div>
                <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">Password</label>
                <input type="password" required className="input" minLength={6} value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} />
              </div>
              <div>
                <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">Access Role</label>
                <select className="select w-full" value={formData.role} onChange={e => setFormData({...formData, role: e.target.value as any})}>
                  <option value="Staff">Counter Staff (Sales & Inventory)</option>
                  <option value="Admin">Admin (Full Access & Reports)</option>
                </select>
              </div>
              <div className="pt-2 flex justify-end gap-2">
                <button type="button" onClick={() => setIsModalOpen(false)} className="btn btn-secondary">Cancel</button>
                <button type="submit" className="btn btn-primary">Create Operator</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
