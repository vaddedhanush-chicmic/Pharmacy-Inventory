import { useState, Fragment } from 'react';
import { useSales } from '../hooks/use-sales';
import { useAuth } from '../contexts/auth-context';
import { useToast } from '../contexts/toast-context';
import { 
  ChevronDown, 
  ChevronUp, 
  XCircle, 
  History,
  ReceiptText
} from 'lucide-react';

export function SalesHistoryPage() {
  const [filters, setFilters] = useState({ startDate: '', endDate: '', page: 1, limit: 50 });
  const [activeTab, setActiveTab] = useState<'all' | 'cancelled'>('all');
  const [expandedRow, setExpandedRow] = useState<string | null>(null);
  const [cancelReason, setCancelReason] = useState('');
  const [cancellingId, setCancellingId] = useState<string | null>(null);

  const { isAdmin } = useAuth();
  const { success, error } = useToast();
  const { sales, salesError, cancelledSales, isLoading, isCancelledLoading, cancelSale } = useSales(filters);

  const handleCancel = async () => {
    if (!cancellingId || !cancelReason) return;
    try {
      await cancelSale({ id: cancellingId, reason: cancelReason });
      success('Sale cancelled and stock refunded');
      setCancellingId(null);
      setCancelReason('');
    } catch (err: any) {
      error(err.message);
    }
  };

  const toggleRow = (id: string) => setExpandedRow(expandedRow === id ? null : id);

  // Handle both { data: [...] } paginated and plain array responses
  const salesList = Array.isArray(sales) ? sales : (sales?.data ?? []);
  const cancelledList = Array.isArray(cancelledSales) ? cancelledSales : [];

  // Debug logging
  console.log('[SalesHistory] sales raw:', sales, 'salesList:', salesList, 'error:', salesError);

  return (
    <div className="page-container pb-12">
      <div className="page-header">
        <div>
          <h1 className="page-title">Sales History</h1>
          <p className="page-subtitle">Review previous invoices and transactions</p>
        </div>
        {salesError && (
          <div className="text-red-400 text-sm bg-red-500/10 px-4 py-2 rounded-lg border border-red-500/20">
            Error: {(salesError as Error).message}
          </div>
        )}
      </div>

      {/* Filters */}
      <div className="mb-8 space-y-5">
        <div className="glass-card-static p-6">
          <div className="flex flex-wrap gap-6 items-end">
            <div className="flex-1 min-w-[200px]">
              <label className="block text-xs font-bold text-slate-500 uppercase mb-2 tracking-wider">Start Date</label>
              <input 
                type="date" 
                className="input" 
                value={filters.startDate}
                onChange={e => setFilters(f => ({ ...f, startDate: e.target.value }))}
              />
            </div>
            <div className="flex-1 min-w-[200px]">
              <label className="block text-xs font-bold text-slate-500 uppercase mb-2 tracking-wider">End Date</label>
              <input 
                type="date" 
                className="input" 
                value={filters.endDate}
                onChange={e => setFilters(f => ({ ...f, endDate: e.target.value }))}
              />
            </div>
            <button onClick={() => setFilters({ startDate: '', endDate: '', page: 1, limit: 50 })} className="btn btn-secondary">
              Reset Filters
            </button>
          </div>
        </div>

        <div className="flex gap-3">
          {[
            { id: 'all', label: 'Completed Invoices', icon: History },
            { id: 'cancelled', label: 'Cancelled Log', icon: XCircle },
          ].map((tab) => (
            <button 
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold transition-all ${activeTab === tab.id ? 'bg-teal-500/20 text-teal-500 border border-teal-500/30' : 'text-slate-400 hover:text-slate-200 border border-transparent'}`}
            >
              <tab.icon size={16} />
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="table-container glass-card-static">
        <table>
          <thead>
            <tr>
              <th className="w-12"></th>
              <th>Invoice #</th>
              <th>Date</th>
              <th>Customer</th>
              <th>Items</th>
              <th>Total</th>
              <th>Method</th>
              <th className="text-right">Action</th>
            </tr>
          </thead>
          <tbody>
            {isLoading || isCancelledLoading ? (
              [1, 2, 3, 4, 5].map(i => (
                <tr key={i}><td colSpan={8} className="p-5"><div className="h-10 skeleton" /></td></tr>
              ))
            ) : activeTab === 'all' ? (
              salesList.length > 0 ? salesList.map(sale => (
                <Fragment key={sale._id}>
                  <tr className="cursor-pointer hover:bg-slate-900/30 transition-colors" onClick={() => toggleRow(sale._id)}>
                    <td className="text-slate-500">
                      {expandedRow === sale._id ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                    </td>
                    <td className="font-bold text-white">{sale.invoiceNumber}</td>
                    <td className="text-sm text-slate-400">{new Date(sale.createdAt).toLocaleString()}</td>
                    <td>
                      <div className="text-sm font-medium text-slate-300">{sale.customerName || 'Walk-in'}</div>
                      {sale.customerPhone && <div className="text-xs text-slate-500 mt-0.5">{sale.customerPhone}</div>}
                    </td>
                    <td className="text-sm">{sale.items.length} items</td>
                    <td className="font-bold text-teal-500 text-base">₹{sale.grandTotal}</td>
                    <td><span className="badge badge-blue">{sale.paymentMethod}</span></td>
                    <td className="text-right">
                      {isAdmin && (
                        <button 
                          onClick={(e) => { e.stopPropagation(); setCancellingId(sale._id); }}
                          className="p-2 text-red-500/50 hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-colors"
                        >
                          <XCircle size={18} />
                        </button>
                      )}
                    </td>
                  </tr>
                  {expandedRow === sale._id && (
                    <tr className="bg-slate-950/40">
                      <td colSpan={8} className="p-0">
                        <div className="p-8 border-y border-slate-800/50 space-y-5">
                          <h4 className="text-xs font-black text-slate-500 uppercase tracking-widest">Invoice Details</h4>
                          <div className="space-y-2">
                            {sale.items.map((item, idx) => (
                              <div key={idx} className="flex justify-between items-center text-sm p-3 rounded-lg hover:bg-slate-900/50">
                                <div className="flex-1">
                                  <span className="font-bold text-slate-200">{item.name}</span>
                                  <span className="ml-3 text-xs text-slate-500">× {item.quantity}</span>
                                </div>
                                <div className="text-slate-400 mr-8">₹{item.unitPrice}</div>
                                <div className="w-28 text-right font-bold text-white">₹{item.subTotal}</div>
                              </div>
                            ))}
                          </div>
                          <div className="flex justify-end pt-4 border-t border-slate-800">
                            <div className="text-right">
                              <p className="text-xs text-slate-500 mb-1">Grand Total</p>
                              <p className="text-2xl font-black text-teal-500">₹{sale.grandTotal}</p>
                            </div>
                          </div>
                        </div>
                      </td>
                    </tr>
                  )}
                </Fragment>
              )) : (
                <tr>
                  <td colSpan={8} className="p-16 text-center">
                    <ReceiptText size={48} className="mx-auto mb-4 text-slate-700" />
                    <p className="text-slate-500 italic text-lg">No sales found for this period</p>
                    <p className="text-slate-600 text-sm mt-1">Try adjusting the date filters</p>
                  </td>
                </tr>
              )
            ) : (
              cancelledList.length > 0 ? cancelledList.map(sale => (
                <tr key={sale._id} className="opacity-70">
                  <td className="text-slate-700"><XCircle size={16} /></td>
                  <td className="font-bold text-slate-400 line-through">{sale.invoiceNumber}</td>
                  <td className="text-sm text-slate-500">{new Date(sale.cancelledAt).toLocaleString()}</td>
                  <td className="text-sm text-slate-500">{sale.customerName || 'Walk-in'}</td>
                  <td className="text-sm text-slate-600">{sale.items.length} items</td>
                  <td className="font-bold text-slate-600 italic">₹{sale.grandTotal}</td>
                  <td><span className="badge badge-red">Cancelled</span></td>
                  <td className="text-right italic text-xs text-red-500/60 max-w-[180px] truncate">{sale.reason}</td>
                </tr>
              )) : (
                <tr>
                  <td colSpan={8} className="p-16 text-center text-slate-500 italic text-lg">No cancelled sales</td>
                </tr>
              )
            )}
          </tbody>
        </table>
      </div>

      {/* Cancel Modal */}
      {cancellingId && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h2 className="text-xl font-bold text-white mb-2">Cancel Invoice</h2>
            <p className="text-sm text-slate-400 mb-8">Are you sure you want to cancel this sale? Stock will be refunded to inventory.</p>
            <div className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Reason for Cancellation</label>
                <textarea 
                  className="input h-28" 
                  placeholder="e.g. Returned by customer, Incorrect billing..." 
                  value={cancelReason}
                  onChange={e => setCancelReason(e.target.value)}
                  required
                />
              </div>
              <div className="flex justify-end gap-3 pt-4">
                <button onClick={() => { setCancellingId(null); setCancelReason(''); }} className="btn btn-secondary">Dismiss</button>
                <button 
                  onClick={handleCancel} 
                  disabled={!cancelReason}
                  className="btn btn-danger"
                >
                  Confirm Cancellation
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
