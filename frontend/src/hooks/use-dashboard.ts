import { useQuery } from '@tanstack/react-query';
import { api } from '../lib/api';
import type { DashboardSummary, TopSelling } from '../lib/types';

export function useDashboard() {
  const summaryQuery = useQuery({
    queryKey: ['dashboard-summary'],
    queryFn: () => api.get<DashboardSummary>('/reports/dashboard'),
    refetchInterval: 30000, // Auto-refresh every 30s
  });

  const topSellingQuery = useQuery({
    queryKey: ['top-selling'],
    queryFn: () => api.get<TopSelling[]>('/reports/top-selling'),
  });

  return {
    summary: summaryQuery.data,
    topSelling: topSellingQuery.data,
    isLoading: summaryQuery.isLoading || topSellingQuery.isLoading,
    isError: summaryQuery.isError || topSellingQuery.isError,
    refetch: () => {
      summaryQuery.refetch();
      topSellingQuery.refetch();
    }
  };
}
