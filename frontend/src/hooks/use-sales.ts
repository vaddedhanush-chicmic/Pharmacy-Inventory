import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../lib/api';
import type { CancelledSale, SalesFilterDto } from '../lib/types';

interface SalesResponse {
  data: any[];
  total: number;
  page: number;
  limit: number;
}

export function useSales(filters: SalesFilterDto = {}) {
  const queryClient = useQueryClient();

  const salesQuery = useQuery({
    queryKey: ['sales', filters],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (filters.startDate) params.append('startDate', filters.startDate);
      if (filters.endDate) params.append('endDate', filters.endDate);
      if (filters.page) params.append('page', filters.page.toString());
      if (filters.limit) params.append('limit', filters.limit.toString());
      
      const url = `/sales${params.toString() ? `?${params.toString()}` : ''}`;
      const result = await api.get<SalesResponse>(url);
      console.log('[useSales] API response:', result);
      return result;
    }
  });

  const cancelledSalesQuery = useQuery({
    queryKey: ['sales', 'cancelled'],
    queryFn: () => api.get<CancelledSale[]>('/sales/cancelled'),
  });

  return {
    sales: salesQuery.data,
    salesError: salesQuery.error,
    cancelledSales: cancelledSalesQuery.data,
    isLoading: salesQuery.isLoading,
    isCancelledLoading: cancelledSalesQuery.isLoading,
    cancelSale: useMutation({
      mutationFn: ({ id, reason }: { id: string; reason: string }) => 
        api.delete<CancelledSale>(`/sales/${id}`, { reason }),
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['sales'] });
        queryClient.invalidateQueries({ queryKey: ['dashboard-summary'] });
      },
    }).mutateAsync,
  };
}
