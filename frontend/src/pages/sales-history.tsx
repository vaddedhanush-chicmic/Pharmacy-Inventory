import { useState, Fragment } from 'react';
import { useSales } from '../hooks/use-sales';
import { useAuth } from '../contexts/auth-context';
import { useToast } from '../contexts/toast-context';
import { ModalForm } from '../components/ui/modal-form';
import { Badge } from '../components/ui/badge';
import { Skeleton } from '../components/ui/loading-skeleton';
import { EmptyState } from '../components/ui/empty-state';
import { ChevronDown, ChevronUp, XCircle, History, AlertCircle, Receipt } from 'lucide-react';

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

  // Handle both { data: [...] } paginated and raw array responses
  const salesList = Array.isArray(sales) ? sales : (sales?.data ?? []);
  const cancelledList = Array.isArray(cancelledSales) ? cancelledSales : [];

  return (
    <div className="page-container pb-8">
      <div className="page-header">
        <div>
          <h1 className="page-title">Sales History</h1>
          <p className="page-subtitle">Review previous invoices and transactions</p>
        </div>
        {salesError && (
          <div className="flex items-center gap-2 text-[var(--color-red)] text-sm bg-[var(--color-red-light)] px-3 py-2 rounded-lg border border-red-200">
            <AlertCircle size={14} />
            {(salesError as Error).message}
          </div>
        )}
      </div>

      {/* Filters */}
      <div className="flex flex-col md:flex-row md:items-end gap-4 mb-5">
        <div className="flex-1 min-w-[160px]">
          <label className="block text-xs font-semibold text-[var(--text-muted)] uppercase mb-1">Start Date</label>
          <input
            type="date"
            className="input input-sm"
            value={filters.startDate}
            onChange={e => setFilters(f => ({ ...f, startDate: e.target.value }))}
          />
        </div>
        <div className="flex-1 min-w-[160px]">
          <label className="block text-xs font-semibold text-[var(--text-muted)] uppercase mb-1">End Date</label>
          <input
            type="date"
            className="input input-sm"
            value={filters.endDate}
            onChange={e => setFilters(f => ({ ...f, endDate: e.target.value }))}
          />
        </div>
        <button
          onClick={() => setFilters({ startDate: '', endDate: '', page: 1, limit: 50 })}
          className="btn btn-secondary btn-sm w-full md:w-auto"
        >
          Reset
        </button>

        <div className="flex border border-[var(--border-input)] rounded-lg p-0.5 gap-0.5 w-full md:w-auto md:ml-auto">
          {[
            { id: 'all' as const, label: 'Invoices', icon: History },
            { id: 'cancelled' as const, label: 'Cancelled', icon: XCircle },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 md:flex-initial flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold transition-colors ${
                activeTab === tab.id
                  ? 'bg-[var(--accent)] text-white'
                  : 'text-[var(--text-secondary)] hover:bg-[var(--bg-table-stripe)]'
              }`}
            >
              <tab.icon size={12} />
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="table-container">
        <table>
          <thead>
            <tr>
              <th className="w-10"></th>
              <th>Invoice #</th>
              <th>Date</th>
              <th>Customer</th>
              <th className="text-center">Items</th>
              <th className="text-right">Total</th>
              <th className="text-center">Method</th>
              {activeTab === 'all' && isAdmin && <th className="text-center w-20">Action</th>}
              {activeTab === 'cancelled' && <th>Reason</th>}
            </tr>
          </thead>
          <tbody>
            {(isLoading || isCancelledLoading) && (
              <>
                {[1, 2, 3, 4, 5].map(i => (
                  <tr key={i}>
                    <td colSpan={8}>
                      <Skeleton className="h-6" />
                    </td>
                  </tr>
                ))}
              </>
            )}
            {!isLoading && !isCancelledLoading && activeTab === 'all' && (
              <>
                {salesList.length > 0 ? (
                  salesList.map((sale: any) => (
                    <Fragment key={sale._id}>
                      <tr className="cursor-pointer hover:bg-[var(--bg-table-hover)]" onClick={() => toggleRow(sale._id)}>
                        <td className="text-[var(--text-muted)]">
                          {expandedRow === sale._id ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                        </td>
                        <td className="font-medium text-[var(--text-primary)]">{sale.invoiceNumber}</td>
                        <td className="text-xs text-[var(--text-secondary)]">
                          {new Date(sale.createdAt).toLocaleString('en-IN')}
                        </td>
                        <td className="text-[var(--text-secondary)]">{sale.customerName || 'Walk-in'}</td>
                        <td className="text-center text-[var(--text-secondary)]">{sale.items.length}</td>
                        <td className="text-right font-bold text-[var(--accent)]">₹{sale.grandTotal}</td>
                        <td className="text-center">
                          <Badge label={sale.paymentMethod} variant="blue" />
                        </td>
                        {isAdmin && (
                          <td className="text-center">
                            <button
                              onClick={e => {
                                e.stopPropagation();
                                setCancellingId(sale._id);
                              }}
                              className="p-1.5 text-[var(--color-red)] opacity-40 hover:opacity-100 rounded transition-opacity"
                              title="Cancel sale"
                            >
                              <XCircle size={14} />
                            </button>
                          </td>
                        )}
                      </tr>
                      {expandedRow === sale._id && (
                        <tr>
                          <td colSpan={8} className="!p-0 !bg-[var(--bg-table-stripe)]">
                            <div className="p-5 space-y-3">
                              <p className="text-xs font-semibold text-[var(--text-muted)] uppercase">Line Items</p>
                              {sale.items.map((item: any, idx: number) => (
                                <div
                                  key={idx}
                                  className="flex justify-between items-center text-sm px-3 py-2 rounded bg-white border border-[var(--border-light)]"
                                >
                                  <div>
                                    <span className="font-medium text-[var(--text-primary)]">{item.name}</span>
                                    <span className="ml-2 text-xs text-[var(--text-muted)]">× {item.quantity}</span>
                                  </div>
                                  <div className="flex gap-6 text-[var(--text-secondary)]">
                                    <span>@ ₹{item.unitPrice}</span>
                                    <span className="font-bold w-20 text-right">₹{item.subTotal}</span>
                                  </div>
                                </div>
                              ))}
                              <div className="flex justify-end pt-2 border-t border-[var(--border-light)]">
                                <div className="text-right">
                                  <p className="text-xs text-[var(--text-muted)]">Grand Total</p>
                                  <p className="text-xl font-bold text-[var(--accent)]">₹{sale.grandTotal}</p>
                                </div>
                              </div>
                            </div>
                          </td>
                        </tr>
                      )}
                    </Fragment>
                  ))
                ) : (
                  <tr>
                    <td colSpan={8} className="p-0">
                      <EmptyState icon={Receipt} title="No sales found" description="Try adjusting your date filters" />
                    </td>
                  </tr>
                )}
              </>
            )}
            {!isCancelledLoading && activeTab === 'cancelled' && (
              <>
                {cancelledList.length > 0 ? (
                  cancelledList.map((sale: any) => (
                    <tr key={sale._id}>
                      <td className="text-[var(--color-red)]">
                        <XCircle size={14} />
                      </td>
                      <td className="font-medium text-[var(--text-muted)] line-through">{sale.invoiceNumber}</td>
                      <td className="text-xs text-[var(--text-secondary)]">
                        {new Date(sale.cancelledAt).toLocaleString('en-IN')}
                      </td>
                      <td className="text-[var(--text-secondary)]">{sale.customerName || 'Walk-in'}</td>
                      <td className="text-center text-[var(--text-secondary)]">{sale.items.length}</td>
                      <td className="text-right text-[var(--text-muted)]">₹{sale.grandTotal}</td>
                      <td className="text-center">
                        <Badge label="Cancelled" variant="red" />
                      </td>
                      <td className="text-xs text-[var(--color-red)] max-w-[200px] truncate">{sale.reason}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={8} className="p-0">
                      <EmptyState icon={Receipt} title="No cancelled sales" description="All invoices are active" />
                    </td>
                  </tr>
                )}
              </>
            )}
          </tbody>
        </table>
      </div>

      {/* Cancel Modal */}
      <ModalForm
        title="Cancel Invoice"
        isOpen={!!cancellingId}
        onClose={() => {
          setCancellingId(null);
          setCancelReason('');
        }}
        onSubmit={handleCancel}
        submitLabel="Confirm Cancellation"
        maxWidth="max-w-md"
      >
        <p className="text-sm text-[var(--text-muted)] mb-4">Stock will be refunded to inventory.</p>
        <div className="form-field">
          <label className="form-label">Reason for cancellation</label>
          <textarea
            className="input"
            placeholder="e.g. Returned by customer..."
            value={cancelReason}
            onChange={e => setCancelReason(e.target.value)}
            required
            autoFocus
            style={{ minHeight: '100px', resize: 'vertical' }}
          />
        </div>
      </ModalForm>
    </div>
  );
}
