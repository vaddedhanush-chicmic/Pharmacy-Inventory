import { useState } from 'react';
import { useMedicines } from '../hooks/use-medicines';
import { useAuth } from '../contexts/auth-context';
import { useToast } from '../contexts/toast-context';
import { MedicineForm } from '../components/medicines/medicine-form';
import { TabFilter as TabFilterComponent, FilterBar } from '../components/ui/filter-bar';
import { StockBadge } from '../components/ui/badge';
import { ConfirmationModal } from '../components/ui/confirmation-modal';
import { EmptyState } from '../components/ui/empty-state';
import { TableSkeleton } from '../components/ui/loading-skeleton';
import type { Medicine } from '../lib/types';
import { Search, Plus, Edit3, Trash2, AlertTriangle, Package, Package2 } from 'lucide-react';

type MedicineTab = 'all' | 'low' | 'expiring' | 'expired';

export function MedicinesPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState<MedicineTab>('all');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingMedicine, setEditingMedicine] = useState<Medicine | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);

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

  const getStockStatus = (med: Medicine) => {
    if (new Date(med.expiryDate) <= now) return { expired: true };
    if (new Date(med.expiryDate) <= thirtyDays) return { expiring: true };
    if (med.stock <= med.reorderLevel) return { lowStock: true };
    if (med.stock === 0) return { outOfStock: true };
    return { inStock: true };
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteMedicine(id);
      success('Medicine deleted');
      setDeleteId(null);
    } catch (err: any) {
      error(err.message);
    }
  };

  const tabs: { id: MedicineTab; label: string; icon?: any }[] = [
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
          <button
            onClick={() => {
              setEditingMedicine(null);
              setIsFormOpen(true);
            }}
            className="btn btn-primary"
          >
            <Plus size={16} /> Add Medicine
          </button>
        )}
      </div>

      <FilterBar>
        <TabFilterComponent tabs={tabs} activeTab={activeTab} onChange={(id) => setActiveTab(id as MedicineTab)} />
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" size={16} />
          <input
            type="text"
            placeholder="Search by name..."
            className="input input-sm pl-9"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
          />
        </div>
      </FilterBar>

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
            {isLoading && <TableSkeleton rows={5} columns={isAdmin ? 8 : 7} />}
            {!isLoading && filteredMeds.length > 0 &&
              filteredMeds.map(med => {
                const status = getStockStatus(med);
                return (
                  <tr key={med._id} className={getRowStatus(med)}>
                    <td className="font-medium text-[var(--text-primary)]">{med.name}</td>
                    <td className="text-[var(--text-secondary)]">{med.manufacturer}</td>
                    <td className="text-center">
                      <span className={med.stock <= med.reorderLevel ? 'font-bold text-[var(--color-amber)]' : ''}>
                        {med.stock}
                      </span>
                      <span className="text-[var(--text-muted)] text-xs ml-1">/ {med.reorderLevel}</span>
                    </td>
                    <td className="text-right">₹{med.mrp}</td>
                    <td className="text-right font-medium">₹{med.sellingPrice}</td>
                    <td className="text-center text-xs text-[var(--text-secondary)]">
                      {new Date(med.expiryDate).toLocaleDateString('en-IN', {
                        day: '2-digit',
                        month: 'short',
                        year: 'numeric',
                      })}
                    </td>
                    <td className="text-center">
                      <StockBadge {...status} />
                    </td>
                    {isAdmin && (
                      <td className="text-center">
                        <div className="flex items-center justify-center gap-1">
                          <button
                            onClick={() => {
                              setEditingMedicine(med);
                              setIsFormOpen(true);
                            }}
                            className="p-1.5 text-[var(--color-blue)] opacity-50 hover:opacity-100 rounded transition-opacity"
                            title="Edit medicine"
                          >
                            <Edit3 size={14} />
                          </button>
                          <button
                            onClick={() => setDeleteId(med._id)}
                            className="p-1.5 text-[var(--color-red)] opacity-50 hover:opacity-100 rounded transition-opacity"
                            title="Delete medicine"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>
                    )}
                  </tr>
                );
              })}
            {!isLoading && filteredMeds.length === 0 && (
              <tr>
                <td colSpan={isAdmin ? 8 : 7} className="p-0">
                  <EmptyState
                    icon={Package2}
                    title="No medicines found"
                    description={activeTab === 'all' ? 'Add your first medicine to get started' : 'No medicines match this filter'}
                    action={
                      activeTab === 'all' && isAdmin
                        ? {
                            label: 'Add Medicine',
                            onClick: () => {
                              setEditingMedicine(null);
                              setIsFormOpen(true);
                            },
                          }
                        : undefined
                    }
                  />
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {isFormOpen && (
        <div className="modal-overlay">
          <MedicineForm
            medicine={editingMedicine}
            onClose={() => {
              setIsFormOpen(false);
              setEditingMedicine(null);
            }}
            onSubmit={async data => {
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

      <ConfirmationModal
        isOpen={!!deleteId}
        title="Delete Medicine?"
        message="This action cannot be undone. The medicine will be permanently removed from inventory."
        isDangerous
        onConfirm={() => { if (deleteId) handleDelete(deleteId); }}
        onCancel={() => setDeleteId(null)}
        confirmLabel="Delete"
      />
    </div>
  );
}
