import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../lib/api';
import type { Expense, CreateExpenseDto } from '../lib/types';

export function useExpenses(filters: { period?: string; startDate?: string; endDate?: string } = {}) {
  const queryClient = useQueryClient();

  const expensesQuery = useQuery({
    queryKey: ['expenses', filters],
    queryFn: () => {
      const params = new URLSearchParams();
      if (filters.period) params.append('period', filters.period);
      if (filters.startDate) params.append('startDate', filters.startDate);
      if (filters.endDate) params.append('endDate', filters.endDate);
      
      return api.get<Expense[]>(`/expenses${params.toString() ? `?${params.toString()}` : ''}`);
    }
  });

  const createMutation = useMutation({
    mutationFn: (dto: CreateExpenseDto) => api.post<Expense>('/expenses', dto),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['expenses'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-summary'] });
    },
  });

  return {
    expenses: expensesQuery.data,
    isLoading: expensesQuery.isLoading,
    createExpense: createMutation.mutateAsync,
  };
}
