import { useState, useMemo, useRef, useEffect } from 'react';
import { useMedicines } from '../hooks/use-medicines';
import { useCart } from '../hooks/use-cart';
import { api } from '../lib/api';
import { useToast } from '../contexts/toast-context';
import { EmptyState } from '../components/ui/empty-state';
import type { Sale, CreateSaleDto, Medicine } from '../lib/types';
import {
  Search,
  Trash2,
  User,
  Phone,
  CreditCard,
  Banknote,
  Smartphone,
  CheckCircle,
  Printer,
  X,
  ShoppingCart,
} from 'lucide-react';

export function POSPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'Cash' | 'UPI' | 'Card'>('Cash');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [lastSale, setLastSale] = useState<Sale | null>(null);
  const [showDropdown, setShowDropdown] = useState(false);
  const searchRef = useRef<HTMLInputElement>(null);

  const { success, error } = useToast();
  const { medicines } = useMedicines(searchTerm);
  const { cartItems, addItem, removeItem, updateQuantity, clearCart, total } = useCart();

  const filteredMedicines = useMemo(() => {
    if (!searchTerm.trim()) return [];
    return (medicines || []).filter(m => m.stock > 0).slice(0, 8);
  }, [medicines, searchTerm]);

  // Show/hide dropdown based on search
  useEffect(() => {
    setShowDropdown(filteredMedicines.length > 0 && searchTerm.length > 0);
  }, [filteredMedicines, searchTerm]);

  const handleSelectMedicine = (med: Medicine) => {
    addItem(med);
    setSearchTerm('');
    setShowDropdown(false);
    searchRef.current?.focus();
  };

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'F9' || e.key === 'F10') {
        e.preventDefault();
        handleCheckout();
      }
      if (e.key === 'Escape') {
        setSearchTerm('');
        setShowDropdown(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [cartItems]);

  const handleCheckout = async () => {
    if (cartItems.length === 0) return;
    setIsSubmitting(true);

    const dto: CreateSaleDto = {
      customerName: customerName || undefined,
      customerPhone: customerPhone || undefined,
      paymentMethod,
      items: cartItems.map(item => ({
        medicineId: item._id,
        quantity: item.quantity,
      })),
    };

    try {
      const sale = await api.post<Sale>('/sales', dto);
      setLastSale(sale);
      success('Invoice generated successfully!');
      clearCart();
      setCustomerName('');
      setCustomerPhone('');
    } catch (err: any) {
      error(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="page-container flex flex-col pb-4" style={{ height: 'calc(100vh - 112px)' }}>
      {/* Top Bar: Customer Info */}
      <div className="card p-4 mb-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
          <div className="flex items-center gap-2">
            <User size={16} className="text-[var(--text-muted)] shrink-0" />
            <input
              type="text"
              placeholder="Customer Name"
              className="input input-sm"
              value={customerName}
              onChange={e => setCustomerName(e.target.value)}
            />
          </div>
          <div className="flex items-center gap-2">
            <Phone size={16} className="text-[var(--text-muted)] shrink-0" />
            <input
              type="text"
              placeholder="Phone Number"
              className="input input-sm"
              value={customerPhone}
              onChange={e => setCustomerPhone(e.target.value)}
            />
          </div>
        </div>

        <div className="flex border border-[var(--border-input)] rounded-lg p-0.5 gap-0.5">
          {(
            [
              { val: 'Cash', icon: Banknote },
              { val: 'UPI', icon: Smartphone },
              { val: 'Card', icon: CreditCard },
            ] as const
          ).map(({ val, icon: Icon }) => (
            <button
              key={val}
              onClick={() => setPaymentMethod(val)}
              className={`flex-1 md:flex-initial flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold transition-colors ${
                paymentMethod === val
                  ? 'bg-[var(--accent)] text-white'
                  : 'text-[var(--text-secondary)] hover:bg-[var(--bg-table-stripe)]'
              }`}
            >
              <Icon size={14} />
              <span className="hidden sm:inline">{val}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Main Area: Search + Table + Summary */}
      <div className="flex-1 flex flex-col min-h-0">
        {/* Item Search Bar */}
        <div className="relative mb-3">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" size={16} />
          <input
            ref={searchRef}
            type="text"
            placeholder="Search medicine..."
            className="input pl-10"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            autoFocus
          />

          {/* Search Dropdown */}
          {showDropdown && (
            <div className="absolute z-20 top-full left-0 right-0 mt-1 card border border-[var(--border-medium)] shadow-lg max-h-64 overflow-y-auto">
              {filteredMedicines.map(med => (
                <button
                  key={med._id}
                  onClick={() => handleSelectMedicine(med)}
                  className="w-full flex items-center justify-between px-4 py-2.5 hover:bg-[var(--bg-table-hover)] text-left border-b border-[var(--border-light)] last:border-b-0 transition-colors"
                >
                  <div className="min-w-0 flex-1">
                    <span className="text-sm font-medium text-[var(--text-primary)] block truncate">{med.name}</span>
                    <span className="text-xs text-[var(--text-muted)]">{med.manufacturer}</span>
                  </div>
                  <div className="flex items-center gap-2 ml-2 text-xs whitespace-nowrap">
                    <span className="text-[var(--text-muted)]">
                      Stock: <span className={med.stock <= med.reorderLevel ? 'text-[var(--color-amber)] font-bold' : ''}>{med.stock}</span>
                    </span>
                    <span className="font-bold text-[var(--accent)]">₹{med.sellingPrice}</span>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Billing Table */}
        <div className="flex-1 overflow-auto table-container">
          <table>
            <thead>
              <tr>
                <th className="w-12 text-center">S.No</th>
                <th>Item Name</th>
                <th className="w-24 text-center">MRP</th>
                <th className="w-28 text-center">Qty</th>
                <th className="w-28 text-right">Amount</th>
                <th className="w-14"></th>
              </tr>
            </thead>
            <tbody>
              {cartItems.length > 0 ? (
                cartItems.map((item, idx) => (
                  <tr key={item._id}>
                    <td className="text-center font-medium">{idx + 1}</td>
                    <td>
                      <span className="font-medium text-[var(--text-primary)]">{item.name}</span>
                    </td>
                    <td className="text-center">₹{item.sellingPrice}</td>
                    <td className="text-center">
                      <div className="inline-flex items-center border border-[var(--border-input)] rounded-md overflow-hidden">
                        <button
                          onClick={() => updateQuantity(item._id, -1)}
                          className="px-2 py-1 hover:bg-[var(--bg-table-stripe)] text-[var(--text-muted)] transition-colors"
                        >
                          −
                        </button>
                        <span className="px-3 py-1 min-w-[36px] text-center text-sm font-bold text-[var(--text-primary)] bg-[var(--bg-table-stripe)]">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => updateQuantity(item._id, 1)}
                          className="px-2 py-1 hover:bg-[var(--bg-table-stripe)] text-[var(--text-muted)] transition-colors"
                        >
                          +
                        </button>
                      </div>
                    </td>
                    <td className="text-right font-bold text-[var(--text-primary)]">
                      ₹{(item.sellingPrice * item.quantity).toFixed(2)}
                    </td>
                    <td className="text-center">
                      <button
                        onClick={() => removeItem(item._id)}
                        className="p-1 text-[var(--color-red)] opacity-40 hover:opacity-100 transition-opacity"
                        title="Remove item"
                      >
                        <Trash2 size={14} />
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="p-0">
                    <EmptyState
                      icon={ShoppingCart}
                      title="Cart is empty"
                      description="Search and add medicines to get started"
                    />
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Bottom: Totals + Actions */}
        <div className="mt-3 card p-4">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="flex items-center gap-4 text-sm flex-wrap">
              <span className="text-[var(--text-muted)]">
                Items: <strong className="text-[var(--text-primary)]">{cartItems.length}</strong>
              </span>
              <span className="text-[var(--text-muted)]">
                Qty: <strong className="text-[var(--text-primary)]">{cartItems.reduce((s, i) => s + i.quantity, 0)}</strong>
              </span>
            </div>

            <div className="text-center md:text-right">
              <p className="text-xs text-[var(--text-muted)] uppercase font-medium">Grand Total</p>
              <p className="text-2xl font-bold text-[var(--accent)]">₹{total.toFixed(2)}</p>
            </div>

            <div className="flex items-center gap-2 w-full md:w-auto">
              <button
                onClick={() => {
                  clearCart();
                  setCustomerName('');
                  setCustomerPhone('');
                }}
                className="btn btn-secondary flex-1 md:flex-initial"
                disabled={cartItems.length === 0}
              >
                <X size={14} /> Cancel
              </button>
              <button
                onClick={handleCheckout}
                disabled={cartItems.length === 0 || isSubmitting}
                className="btn btn-primary btn-lg flex-1 md:flex-initial"
              >
                {isSubmitting ? (
                  <>
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                    Processing...
                  </>
                ) : (
                  <>
                    <Printer size={16} /> Save & Print
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Success Modal */}
      {lastSale && (
        <div className="modal-overlay">
          <div className="modal-content max-w-sm text-center">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-[var(--color-green-light)] text-[var(--color-green)] mb-5">
              <CheckCircle size={40} />
            </div>
            <h2 className="text-xl font-bold text-[var(--text-primary)] mb-1">Invoice Generated!</h2>
            <p className="text-sm text-[var(--text-muted)] mb-6">Invoice #{lastSale.invoiceNumber}</p>

            <div className="card p-4 text-left space-y-2 mb-6 bg-[var(--bg-table-stripe)]">
              <div className="flex justify-between text-sm">
                <span className="text-[var(--text-muted)]">Customer</span>
                <span className="font-medium">{lastSale.customerName || 'Walk-in'}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-[var(--text-muted)]">Payment</span>
                <span className="font-medium">{lastSale.paymentMethod}</span>
              </div>
              <div className="flex justify-between text-sm border-t border-[var(--border-light)] pt-2 mt-2">
                <span className="text-[var(--text-muted)]">Total Paid</span>
                <span className="text-lg font-bold text-[var(--accent)]">₹{lastSale.grandTotal}</span>
              </div>
            </div>

            <div className="flex gap-3">
              <button onClick={() => window.print()} className="btn btn-secondary flex-1">
                <Printer size={16} /> Print
              </button>
              <button onClick={() => setLastSale(null)} className="btn btn-primary flex-1">
                New Bill
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
