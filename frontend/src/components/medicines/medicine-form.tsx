import { useState } from 'react';
import { type CreateMedicineDto, type Medicine } from '../../lib/types';
import { X } from 'lucide-react';

interface MedicineFormProps {
  medicine?: Medicine | null;
  onSubmit: (dto: CreateMedicineDto) => Promise<void>;
  onClose: () => void;
}

export function MedicineForm({ medicine, onSubmit, onClose }: MedicineFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState<CreateMedicineDto>({
    name: medicine?.name || '',
    description: medicine?.description || '',
    manufacturer: medicine?.manufacturer || '',
    mrp: medicine?.mrp || 0,
    sellingPrice: medicine?.sellingPrice || 0,
    stock: medicine?.stock || 0,
    expiryDate: medicine?.expiryDate ? new Date(medicine.expiryDate).toISOString().split('T')[0] : '',
    reorderLevel: medicine?.reorderLevel || 10,
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    setFormData((prev: CreateMedicineDto) => ({
      ...prev,
      [name]: type === 'number' ? Number(value) : value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await onSubmit(formData);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content max-w-2xl">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-[var(--text-primary)]">
            {medicine ? 'Edit Medicine' : 'Add New Medicine'}
          </h2>
          <button onClick={onClose} className="text-[var(--text-muted)] hover:text-[var(--text-primary)]">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">Medicine Name *</label>
              <input 
                name="name" 
                value={formData.name} 
                onChange={handleChange} 
                className="input" 
                required 
              />
            </div>
            
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">Description</label>
              <textarea 
                name="description" 
                value={formData.description} 
                onChange={handleChange} 
                className="input h-20 resize-none" 
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">Manufacturer</label>
              <input 
                name="manufacturer" 
                value={formData.manufacturer} 
                onChange={handleChange} 
                className="input" 
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">Expiry Date *</label>
              <input 
                type="date" 
                name="expiryDate" 
                value={formData.expiryDate} 
                onChange={handleChange} 
                className="input" 
                required 
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">MRP (₹) *</label>
              <input 
                type="number" 
                name="mrp" 
                value={formData.mrp} 
                onChange={handleChange} 
                className="input" 
                min="0" 
                step="0.01" 
                required 
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">Selling Price (₹) *</label>
              <input 
                type="number" 
                name="sellingPrice" 
                value={formData.sellingPrice} 
                onChange={handleChange} 
                className="input" 
                min="0" 
                step="0.01" 
                required 
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">Current Stock *</label>
              <input 
                type="number" 
                name="stock" 
                value={formData.stock} 
                onChange={handleChange} 
                className="input" 
                min="0" 
                required 
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">Reorder Level</label>
              <input 
                type="number" 
                name="reorderLevel" 
                value={formData.reorderLevel} 
                onChange={handleChange} 
                className="input" 
                min="0" 
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <button type="button" onClick={onClose} className="btn btn-secondary">Cancel</button>
            <button type="submit" disabled={isSubmitting} className="btn btn-primary">
              {isSubmitting ? 'Saving...' : medicine ? 'Update Medicine' : 'Add Medicine'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
