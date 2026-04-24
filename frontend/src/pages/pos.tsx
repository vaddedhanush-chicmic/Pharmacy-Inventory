import { useState, useMemo } from 'react';
import { useMedicines } from '../hooks/use-medicines';
import { useCart } from '../hooks/use-cart';
import { api } from '../lib/api';
import { useToast } from '../contexts/toast-context';
import type { Sale, CreateSaleDto } from '../lib/types';
import { 
  Search, 
  ShoppingCart, 
  Trash2, 
  Plus, 
  Minus, 
  User, 
  Phone, 
  CreditCard, 
  CheckCircle,
  FileText
} from 'lucide-react';

export function POSPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'Cash' | 'UPI' | 'Card'>('Cash');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [lastSale, setLastSale] = useState<Sale | null>(null);

  const { success, error } = useToast();
  const { medicines, isLoading } = useMedicines(searchTerm);
  const { cartItems, addItem, removeItem, updateQuantity, clearCart, total } = useCart();

  const filteredMedicines = useMemo(() => {
    return (medicines || []).filter(m => m.stock > 0);
  }, [medicines]);

  const handleCheckout = async () => {
    if (cartItems.length === 0) return;
    setIsSubmitting(true);
    
    const dto: CreateSaleDto = {
      customerName: customerName || undefined,
      customerPhone: customerPhone || undefined,
      paymentMethod,
      items: cartItems.map(item => ({
        medicineId: item._id,
        quantity: item.quantity
      }))
    };

    try {
      const sale = await api.post<Sale>('/sales', dto);
      setLastSale(sale);
      success('Sale completed successfully');
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
    <div className="page-container flex flex-col pb-8" style={{ height: 'calc(100vh - 64px)' }}>
      <div className="page-header mb-6">
        <div>
          <h1 className="page-title">Point of Sale</h1>
          <p className="page-subtitle">Search medicines, build cart, and generate invoices</p>
        </div>
      </div>

      <div className="flex-1 flex flex-col lg:flex-row gap-8 min-h-0">
        {/* Left: Product Search & Grid */}
        <div className="flex-[1.6] flex flex-col min-h-0">
          <div className="relative mb-6">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={20} />
            <input 
              type="text" 
              placeholder="Search available medicines..." 
              className="input pl-12 py-3.5 text-base" 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="flex-1 overflow-y-auto pr-2 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5 content-start">
            {isLoading ? (
              [1, 2, 3, 4, 5, 6].map(i => <div key={i} className="h-36 skeleton" />)
            ) : filteredMedicines.length > 0 ? (
              filteredMedicines.map((med) => (
                <button 
                  key={med._id}
                  onClick={() => addItem(med)}
                  className="glass-card p-5 text-left hover:scale-[1.02] transition-transform active:scale-95 h-fit"
                >
                  <div className="flex justify-between items-start mb-3">
                    <h3 className="font-bold text-white leading-tight text-base">{med.name}</h3>
                    <span className="badge badge-teal ml-2 shrink-0">₹{med.sellingPrice}</span>
                  </div>
                  <p className="text-xs text-slate-500 mb-4 truncate">{med.manufacturer}</p>
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-slate-400">
                      Stock: <span className={med.stock <= med.reorderLevel ? 'text-amber-500 font-bold' : 'text-slate-200 font-medium'}>{med.stock}</span>
                    </span>
                    <span className="text-slate-500 text-xs">
                      Exp: {new Date(med.expiryDate).toLocaleDateString(undefined, { month: 'short', year: '2-digit' })}
                    </span>
                  </div>
                </button>
              ))
            ) : (
              <div className="col-span-full flex flex-col items-center justify-center text-slate-500 py-24 opacity-50">
                <Search size={48} className="mb-4" />
                <p className="text-lg">No available medicines found</p>
              </div>
            )}
          </div>
        </div>

        {/* Right: Cart & Checkout */}
        <div className="flex-1 flex flex-col glass-card p-7 min-h-0 min-w-[340px]">
          <div className="flex items-center gap-3 mb-6 border-b border-slate-800 pb-5">
            <ShoppingCart size={24} className="text-teal-500" />
            <h2 className="text-xl font-bold text-white tracking-tight">Shopping Cart</h2>
            <span className="ml-auto badge badge-teal">{cartItems.length} items</span>
          </div>

          {/* Cart Items */}
          <div className="flex-1 overflow-y-auto mb-6 pr-1">
            {cartItems.length > 0 ? (
              <div className="space-y-4">
                {cartItems.map((item) => (
                  <div key={item._id} className="flex items-center gap-4 p-4 rounded-xl bg-slate-900/40 border border-slate-800">
                    <div className="flex-1 min-w-0">
                      <h4 className="text-sm font-bold text-white truncate">{item.name}</h4>
                      <p className="text-xs text-teal-500 font-medium mt-1">₹{item.sellingPrice} / unit</p>
                    </div>
                    <div className="flex items-center gap-2 bg-slate-950 p-1.5 rounded-lg">
                      <button onClick={() => updateQuantity(item._id, -1)} className="p-1.5 text-slate-400 hover:text-white"><Minus size={14} /></button>
                      <span className="w-7 text-center text-sm font-bold text-white">{item.quantity}</span>
                      <button onClick={() => updateQuantity(item._id, 1)} className="p-1.5 text-slate-400 hover:text-white"><Plus size={14} /></button>
                    </div>
                    <div className="w-20 text-right text-sm font-bold text-white">
                      ₹{(item.sellingPrice * item.quantity).toFixed(2)}
                    </div>
                    <button onClick={() => removeItem(item._id)} className="p-1.5 text-red-500/50 hover:text-red-500"><Trash2 size={16} /></button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-slate-500 space-y-3 opacity-40">
                <ShoppingCart size={48} />
                <p className="text-base italic">Your cart is empty</p>
                <p className="text-sm">Click on medicines to add them</p>
              </div>
            )}
          </div>

          {/* Checkout Section */}
          <div className="space-y-5 border-t border-slate-800 pt-6">
            <div className="grid grid-cols-2 gap-3">
              <div className="relative">
                <User size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
                <input 
                  type="text" 
                  placeholder="Customer Name" 
                  className="input pl-10 text-sm" 
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                />
              </div>
              <div className="relative">
                <Phone size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
                <input 
                  type="text" 
                  placeholder="Phone Number" 
                  className="input pl-10 text-sm" 
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(e.target.value)}
                />
              </div>
            </div>

            <div className="flex gap-2 p-1.5 bg-slate-950 rounded-xl">
              {['Cash', 'UPI', 'Card'].map((method) => (
                <button 
                  key={method}
                  onClick={() => setPaymentMethod(method as any)}
                  className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-bold transition-all ${paymentMethod === method ? 'bg-teal-500 text-slate-900' : 'text-slate-400 hover:bg-slate-900'}`}
                >
                  {method === 'Card' ? <CreditCard size={14} /> : method === 'UPI' ? <CheckCircle size={14} /> : <User size={14} />}
                  {method}
                </button>
              ))}
            </div>

            <div className="flex items-center justify-between py-3">
              <span className="text-lg text-slate-400">Total Amount</span>
              <span className="text-3xl font-black text-teal-500 tracking-tighter">₹{total.toFixed(2)}</span>
            </div>

            <button 
              onClick={handleCheckout}
              disabled={cartItems.length === 0 || isSubmitting}
              className="btn btn-primary w-full py-4 text-base"
            >
              {isSubmitting ? 'Processing...' : 'Generate Invoice'}
            </button>
          </div>
        </div>
      </div>

      {/* Success Modal */}
      {lastSale && (
        <div className="modal-overlay">
          <div className="modal-content text-center space-y-6">
            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-green-500/20 text-green-500 mb-4">
              <CheckCircle size={48} />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white">Sale Completed!</h2>
              <p className="text-slate-400 mt-2">Invoice #{lastSale.invoiceNumber} generated</p>
            </div>
            <div className="glass-card-static p-5 text-left space-y-3">
              <div className="flex justify-between text-sm"><span className="text-slate-400">Customer:</span><span className="text-white">{lastSale.customerName || 'Walk-in'}</span></div>
              <div className="flex justify-between text-sm"><span className="text-slate-400">Amount Paid:</span><span className="text-teal-500 font-bold text-lg">₹{lastSale.grandTotal}</span></div>
              <div className="flex justify-between text-sm"><span className="text-slate-400">Method:</span><span className="text-white">{lastSale.paymentMethod}</span></div>
            </div>
            <div className="flex flex-col gap-3 pt-2">
              <button onClick={() => window.print()} className="btn btn-primary">
                <FileText size={18} /> Print Invoice
              </button>
              <button onClick={() => setLastSale(null)} className="btn btn-secondary">
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
