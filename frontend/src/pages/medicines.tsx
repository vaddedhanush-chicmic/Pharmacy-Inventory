import { useState, useMemo } from 'react';
import { useMedicines } from '../hooks/use-medicines';
import { useAuth } from '../contexts/auth-context';
import { useToast } from '../contexts/toast-context';
import { MedicineForm } from '../components/medicines/medicine-form';
import type { Medicine } from '../lib/types';
import { 
  Search, 
  Plus, 
  Trash2, 
  Edit3, 
  AlertCircle, 
  Package,
  Calendar
} from 'lucide-react';

export function MedicinesPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState<'all' | 'low' | 'expiring' | 'expired'>('all');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingMedicine, setEditingMedicine] = useState<Medicine | undefined>();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { isAdmin } = useAuth();
  const { success, error } = useToast();
  const { 
    medicines, 
    lowStock, 
    expiring, 
    expired, 
    isLoading,
    createMedicine,
    updateMedicine,
    deleteMedicine,
    cleanupExpired
  } = useMedicines(searchTerm);

  const displayedMedicines = useMemo(() => {
    switch(filter) {
      case 'low': return lowStock || [];
      case 'expiring': return expiring || [];
      case 'expired': return expired || [];
      default: return medicines || [];
    }
  }, [filter, medicines, lowStock, expiring, expired]);

  const handleAdd = async (dto: any) => {
    setIsSubmitting(true);
    try {
      await createMedicine(dto);
      success('Medicine added successfully');
      setIsFormOpen(false);
    } catch (err: any) {
      error(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdate = async (dto: any) => {
    if (!editingMedicine) return;
    setIsSubmitting(true);
    try {
      await updateMedicine({ id: editingMedicine._id, dto });
      success('Medicine updated successfully');
      setEditingMedicine(undefined);
    } catch (err: any) {
      error(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this medicine?')) return;
    try {
      await deleteMedicine(id);
      success('Medicine deleted successfully');
    } catch (err: any) {
      error(err.message);
    }
  };

  const handleCleanup = async () => {
    if (!confirm('This will zero-out stock for all expired medicines. Continue?')) return;
    try {
      await cleanupExpired();
      success('Expired stock cleaned up');
    } catch (err: any) {
      error(err.message);
    }
  };

  return (
    <div className="page-container pb-12">
      <div className="page-header">
        <div>
          <h1 className="page-title">Inventory Management</h1>
          <p className="page-subtitle">Track and manage your medical stock</p>
        </div>
        <div className="flex gap-3">
          {isAdmin && (
             <button onClick={handleCleanup} className="btn btn-danger btn-sm">
                <Trash2 size={16} />
                Cleanup Expired
             </button>
          )}
          {isAdmin && (
            <button onClick={() => setIsFormOpen(true)} className="btn btn-primary">
              <Plus size={18} />
              Add Medicine
            </button>
          )}
        </div>
      </div>

      <div className="mb-6 flex flex-wrap gap-4 items-center justify-between">
         <div className="flex flex-1 min-w-[300px] items-center relative">
            <Search className="absolute left-3 text-slate-500" size={18} />
            <input 
              type="text" 
              placeholder="Search medicines by name..." 
              className="input pl-10" 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
         </div>
         
         <div className="flex gap-2 bg-slate-900/50 p-1 rounded-xl border border-[rgba(148,163,184,0.1)]">
            {[
              { id: 'all', label: 'All', icon: Package },
              { id: 'low', label: 'Low Stock', icon: AlertCircle },
              { id: 'expiring', label: 'Expiring Soon', icon: Calendar },
              { id: 'expired', label: 'Expired', icon: Trash2 },
            ].map((tab) => (
              <button 
                key={tab.id}
                onClick={() => setFilter(tab.id as any)}
                className={`flex items-center gap-2 px-4 py-1.5 rounded-lg text-sm font-medium transition-all ${filter === tab.id ? 'bg-teal-500/20 text-teal-500' : 'text-slate-400 hover:text-slate-200'}`}
              >
                <tab.icon size={16} />
                {tab.label}
              </button>
            ))}
         </div>
      </div>

      <div className="table-container glass-card-static">
        <table>
          <thead>
            <tr>
              <th>Medicine Name</th>
              <th>Manufacturer</th>
              <th>Stock</th>
              <th>MRP / Selling</th>
              <th>Expiry</th>
              <th className="text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              [1, 2, 3, 4, 5].map(i => (
                <tr key={i}><td colSpan={6} className="p-4"><div className="h-8 skeleton w-full" /></td></tr>
              ))
            ) : displayedMedicines.length > 0 ? (
              displayedMedicines.map((med) => {
                const isLow = med.stock <= med.reorderLevel;
                const isExpired = new Date(med.expiryDate) < new Date();
                const isExpiring = !isExpired && new Date(med.expiryDate) < new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);

                return (
                  <tr key={med._id}>
                    <td>
                      <div className="font-semibold text-white">{med.name}</div>
                      <div className="text-xs text-slate-500 truncate max-w-[200px]">{med.description}</div>
                    </td>
                    <td>{med.manufacturer || '-'}</td>
                    <td>
                      <div className={`flex items-center gap-2 font-bold ${isLow ? 'text-amber-500' : 'text-slate-300'}`}>
                        {med.stock}
                        {isLow && <AlertCircle size={14} />}
                      </div>
                      <div className="text-[10px] text-slate-500">Min: {med.reorderLevel}</div>
                    </td>
                    <td>
                      <div className="text-xs line-through text-slate-600">₹{med.mrp}</div>
                      <div className="font-bold text-teal-500">₹{med.sellingPrice}</div>
                    </td>
                    <td>
                      <div className={`badge ${isExpired ? 'badge-red' : isExpiring ? 'badge-amber' : 'badge-teal'}`}>
                        {new Date(med.expiryDate).toLocaleDateString()}
                      </div>
                    </td>
                    <td className="text-right">
                       <div className="flex justify-end gap-2">
                          {isAdmin && (
                            <button 
                              onClick={() => setEditingMedicine(med)}
                              className="p-2 rounded-lg bg-slate-800 text-slate-400 hover:text-white"
                            >
                              <Edit3 size={16} />
                            </button>
                          )}
                          {isAdmin && (
                            <button 
                              onClick={() => handleDelete(med._id)}
                              className="p-2 rounded-lg bg-red-900/20 text-red-400 hover:bg-red-900/40"
                            >
                              <Trash2 size={16} />
                            </button>
                          )}
                       </div>
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan={6} className="p-12 text-center text-slate-500 italic">
                   No medicines found matching your criteria.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {(isFormOpen || editingMedicine) && (
        <MedicineForm 
          initialData={editingMedicine}
          isSubmitting={isSubmitting}
          onClose={() => {
            setIsFormOpen(false);
            setEditingMedicine(undefined);
          }}
          onSubmit={editingMedicine ? handleUpdate : handleAdd}
        />
      )}
    </div>
  );
}
