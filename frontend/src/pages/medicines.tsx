import { useState } from 'react';
import { useMedicines } from '../hooks/use-medicines';
import { useAuth } from '../contexts/auth-context';
import { useToast } from '../contexts/toast-context';
import { MedicineForm } from '../components/medicines/medicine-form';
import type { Medicine } from '../lib/types';
import { 
  Search, 
  Plus, 
  Edit3, 
  Trash2,
  AlertTriangle,
  Package
} from 'lucide-react';

type TabFilter = 'all' | 'low' | 'expiring' | 'expired';

export function MedicinesPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState<TabFilter>('all');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingMedicine, setEditingMedicine] = useState<Medicine | null>(null);

  const { isAdmin } = useAuth();
  const { success, error } = useToast();
  const { medicines, isLoading, createMedicine, updateMedicine, deleteMedicine } = useMedicines(
    activeTab === 'all' ? searchTerm : undefined
  );

  const now = new Date();
  const thirtyDays = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);

  const getFilteredMedicines = () => {
    const list = medicines || [];
    switch (activeTab) {
      case 'low':
        return list.filter(m => m.stock <= m.reorderLevel);
      case 'expiring':
        return list.filter(m => {
          const exp = new Date(m.expiryDate);
          return exp > now && exp <= thirtyDays;
        });
      case 'expired':
        return list.filter(m => new Date(m.expiryDate) <= now);
      default:
        return list;
    }
  };

  const filteredMeds = getFilteredMedicines();

  const getRowStatus = (med: Medicine): string => {
    if (new Date(med.expiryDate) <= now) return 'row-danger';
    if (med.stock <= med.reorderLevel) return 'row-warning';
    return '';
  };

  const getStockBadge = (med: Medicine) => {
    if (new Date(med.expiryDate) <= now) return <span className="badge badge-red">Expired</span>;
    if (new Date(med.expiryDate) <= thirtyDays) return <span className="badge badge-amber">Expiring</span>;
    if (med.stock <= med.reorderLevel) return <span className="badge badge-amber">Low Stock</span>;
    if (med.stock === 0) return <span className="badge badge-red">Out</span>;
    return <span className="badge badge-green">In Stock</span>;
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this medicine?')) return;
    try {
      await deleteMedicine(id);
      success('Medicine deleted');
    } catch (err: any) {
      error(err.message);
    }
  };

  const tabs: { id: TabFilter; label: string; icon?: any }[] = [
    { id: 'all', label: 'All Medicines' },
    { id: 'low', label: 'Low Stock', icon: Package },
    { id: 'expiring', label: 'Expiring Soon', icon: AlertTriangle },
    { id: 'expired', label: 'Expired', icon: AlertTriangle },
  ];

  return (
    <div className="page-container pb-8">
      <div className="page-header">
        <div>
          <h1 className="page-title">Medicines Inventory</h1>
          <p className="page-subtitle">Manage stock, track expiry, and monitor reorder levels</p>
        </div>
        {isAdmin && (
          <button onClick={() => { setEditingMedicine(null); setIsFormOpen(true); }} className="btn btn-primary">
            <Plus size={16} /> Add Medicine
          </button>
        )}
      </div>

      {/* Filters Row */}
      <div className="flex flex-wrap items-center gap-4 mb-5">
        {/* Tab Filters */}
        <div className="flex border border-[var(--border-input)] rounded-lg p-0.5 gap-0.5">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold transition-colors ${activeTab === tab.id ? 'bg-[var(--accent)] text-white' : 'text-[var(--text-secondary)] hover:bg-[var(--bg-table-stripe)]'}`}
            >
              {tab.icon && <tab.icon size={12} />}
              {tab.label}
            </button>
          ))}
        </div>
        
        {/* Search */}
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" size={16} />
          <input 
            type="text" 
            placeholder="Search by name..." 
            className="input input-sm pl-9" 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* Data Table */}
      <div className="table-container">
        <table>
          <thead>
            <tr>
              <th>Name</th>
              <th>Manufacturer</th>
              <th className="text-center">Stock</th>
              <th className="text-right">Cost Price</th>
              <th className="text-right">Selling Price</th>
              <th className="text-center">Expiry</th>
              <th className="text-center">Status</th>
              {isAdmin && <th className="text-center w-24">Actions</th>}
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              [1, 2, 3, 4, 5].map(i => (
                <tr key={i}><td colSpan={isAdmin ? 8 : 7}><div className="h-8 skeleton" /></td></tr>
              ))
            ) : filteredMeds.length > 0 ? (
              filteredMeds.map(med => (
                <tr key={med._id} className={getRowStatus(med)}>
                  <td className="font-medium text-[var(--text-primary)]">{med.name}</td>
                  <td>{med.manufacturer}</td>
                  <td className="text-center">
                    <span className={med.stock <= med.reorderLevel ? 'font-bold text-[var(--color-amber)]' : ''}>
                      {med.stock}
                    </span>
                    <span className="text-[var(--text-muted)] text-xs ml-1">/ {med.reorderLevel}</span>
                  </td>
                  <td className="text-right">₹{med.mrp}</td>
                  <td className="text-right font-medium">₹{med.sellingPrice}</td>
                  <td className="text-center text-xs">
                    {new Date(med.expiryDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                  </td>
                  <td className="text-center">{getStockBadge(med)}</td>
                  {isAdmin && (
                    <td className="text-center">
                      <div className="flex items-center justify-center gap-1">
                        <button 
                          onClick={() => { setEditingMedicine(med); setIsFormOpen(true); }}
                          className="p-1.5 text-[var(--color-blue)] opacity-50 hover:opacity-100 rounded"
                        >
                          <Edit3 size={14} />
                        </button>
                        <button 
                          onClick={() => handleDelete(med._id)}
                          className="p-1.5 text-[var(--color-red)] opacity-50 hover:opacity-100 rounded"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  )}
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={isAdmin ? 8 : 7} className="text-center py-12 text-[var(--text-muted)]">
                  No medicines found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Add/Edit Form Modal */}
      {isFormOpen && (
        <div className="modal-overlay">
          <MedicineForm
            medicine={editingMedicine}
            onClose={() => { setIsFormOpen(false); setEditingMedicine(null); }}
            onSubmit={async (data) => {
              try {
                if (editingMedicine) {
                  await updateMedicine({ id: editingMedicine._id, dto: data });
                  success('Medicine updated');
                } else {
                  await createMedicine(data);
                  success('Medicine added');
                }
                setIsFormOpen(false);
                setEditingMedicine(null);
              } catch (err: any) {
                error(err.message);
              }
            }}
          />
        </div>
      )}
    </div>
  );
}
