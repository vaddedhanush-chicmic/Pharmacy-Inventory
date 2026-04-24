import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../lib/api';
import type { Medicine, CreateMedicineDto, UpdateMedicineDto } from '../lib/types';

export function useMedicines(name?: string) {
  const queryClient = useQueryClient();

  const medicinesQuery = useQuery({
    queryKey: ['medicines', name],
    queryFn: () => api.get<Medicine[]>(`/medicines${name ? `?name=${name}` : ''}`),
  });

  const lowStockQuery = useQuery({
    queryKey: ['medicines', 'low-stock'],
    queryFn: () => api.get<Medicine[]>('/medicines/low-stock'),
  });

  const expiringQuery = useQuery({
    queryKey: ['medicines', 'expiring'],
    queryFn: () => api.get<Medicine[]>('/medicines/expiring'),
  });

  const expiredQuery = useQuery({
    queryKey: ['medicines', 'expired'],
    queryFn: () => api.get<Medicine[]>('/medicines/expired'),
  });

  const createMutation = useMutation({
    mutationFn: (dto: CreateMedicineDto) => api.post<Medicine>('/medicines', dto),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['medicines'] }),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, dto }: { id: string; dto: UpdateMedicineDto }) => 
      api.patch<Medicine>(`/medicines/${id}`, dto),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['medicines'] }),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.delete<void>(`/medicines/${id}`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['medicines'] }),
  });

  const cleanupMutation = useMutation({
    mutationFn: () => api.delete<void>('/medicines/expired/cleanup'),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['medicines'] }),
  });

  return {
    medicines: medicinesQuery.data,
    lowStock: lowStockQuery.data,
    expiring: expiringQuery.data,
    expired: expiredQuery.data,
    isLoading: medicinesQuery.isLoading,
    createMedicine: createMutation.mutateAsync,
    updateMedicine: updateMutation.mutateAsync,
    deleteMedicine: deleteMutation.mutateAsync,
    cleanupExpired: cleanupMutation.mutateAsync,
  };
}
