import { useState } from 'react';
import { useUsers } from '../hooks/use-users';
import { ModalForm } from '../components/ui/modal-form';
import { ConfirmationModal } from '../components/ui/confirmation-modal';
import { Skeleton } from '../components/ui/loading-skeleton';
import { EmptyState } from '../components/ui/empty-state';
import { UserPlus, Trash2, Shield, User as UserIcon, Users } from 'lucide-react';
import { useToast } from '../contexts/toast-context';

export function StaffPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'Staff' as 'Admin' | 'Staff',
  });
  const { users, isLoading, registerUser, deleteUser } = useUsers();
  const { success, error } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.password) {
      error('Please fill all fields');
      return;
    }
    try {
      await registerUser(formData);
      setIsModalOpen(false);
      setFormData({ name: '', email: '', password: '', role: 'Staff' });
      success('Staff account created');
    } catch (err: any) {
      error(err.message || 'Failed to create account');
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      await deleteUser(deleteId);
      success('Staff member removed');
      setDeleteId(null);
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
            {isLoading && (
              <>
                {[1, 2].map(i => (
                  <tr key={i}>
                    <td>
                      <Skeleton className="h-8" />
                    </td>
                    <td>
                      <Skeleton className="h-8" />
                    </td>
                    <td>
                      <Skeleton className="h-8" />
                    </td>
                    <td>
                      <Skeleton className="h-8" />
                    </td>
                  </tr>
                ))}
              </>
            )}
            {!isLoading && users && users.length > 0 && (
              users.map(u => (
                <tr key={u._id}>
                  <td>
                    <div className="flex items-center gap-3">
                      <div className="h-8 w-8 rounded-full bg-[var(--bg-table-stripe)] border border-[var(--border-light)] flex items-center justify-center text-[var(--accent)] font-bold text-sm">
                        {u.name[0].toUpperCase()}
                      </div>
                      <span className="font-medium text-[var(--text-primary)]">{u.name}</span>
                    </div>
                  </td>
                  <td className="text-[var(--text-secondary)]">{u.email}</td>
                  <td className="text-center">
                    <span
                      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded border text-xs font-semibold ${
                        u.role === 'Admin'
                          ? 'bg-[var(--color-blue-light)] text-[var(--color-blue)] border-[rgba(37,99,235,0.2)]'
                          : 'bg-[var(--bg-table-stripe)] text-[var(--text-secondary)] border-[var(--border-light)]'
                      }`}
                    >
                      {u.role === 'Admin' ? <Shield size={12} /> : <UserIcon size={12} />}
                      {u.role}
                    </span>
                  </td>
                  <td className="text-center">
                    <button
                      onClick={() => setDeleteId(u._id)}
                      className="p-1.5 text-[var(--color-red)] opacity-50 hover:opacity-100 rounded transition-opacity"
                      title="Delete operator"
                    >
                      <Trash2 size={16} />
                    </button>
                  </td>
                </tr>
              ))
            )}
            {!isLoading && (!users || users.length === 0) && (
              <tr>
                <td colSpan={4} className="p-0">
                  <EmptyState
                    icon={Users}
                    title="No operators added yet"
                    description="Add your first staff member to manage pharmacy operations"
                    action={{
                      label: 'Add Operator',
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
        title="Add New Operator"
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleSubmit}
        submitLabel="Create Operator"
        maxWidth="max-w-md"
      >
        <div className="form-field">
          <label className="form-label">Full Name</label>
          <input
            required
            className="input"
            value={formData.name}
            onChange={e => setFormData({ ...formData, name: e.target.value })}
            autoFocus
          />
        </div>
        <div className="form-field">
          <label className="form-label">Login Email</label>
          <input
            type="email"
            required
            className="input"
            value={formData.email}
            onChange={e => setFormData({ ...formData, email: e.target.value })}
          />
        </div>
        <div className="form-field">
          <label className="form-label">Password</label>
          <input
            type="password"
            required
            className="input"
            minLength={6}
            value={formData.password}
            onChange={e => setFormData({ ...formData, password: e.target.value })}
          />
          <p className="form-hint">Minimum 6 characters</p>
        </div>
        <div className="form-field">
          <label className="form-label">Access Role</label>
          <select
            className="select w-full"
            value={formData.role}
            onChange={e => setFormData({ ...formData, role: e.target.value as any })}
          >
            <option value="Staff">Counter Staff (Sales & Inventory)</option>
            <option value="Admin">Admin (Full Access & Reports)</option>
          </select>
        </div>
      </ModalForm>

      <ConfirmationModal
        isOpen={!!deleteId}
        title="Remove Operator?"
        message="This staff member will no longer have access to the system. This action cannot be undone."
        isDangerous
        onConfirm={handleDelete}
        onCancel={() => setDeleteId(null)}
        confirmLabel="Remove"
      />
    </div>
  );
}
