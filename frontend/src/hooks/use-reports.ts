import { useQuery } from '@tanstack/react-query';
import { api } from '../lib/api';
import type { SalesSummary } from '../lib/types';

export function useReports(filters: { period?: string; startDate?: string; endDate?: string } = {}) {
  const reportsQuery = useQuery({
    queryKey: ['reports', filters],
    queryFn: () => {
      const params = new URLSearchParams();
      if (filters.period) params.append('period', filters.period);
      if (filters.startDate) params.append('startDate', filters.startDate);
      if (filters.endDate) params.append('endDate', filters.endDate);
      
      return api.get<SalesSummary>(`/reports/sales-summary${params.toString() ? `?${params.toString()}` : ''}`);
    }
  });

  return {
    summary: reportsQuery.data,
    isLoading: reportsQuery.isLoading,
  };
}
