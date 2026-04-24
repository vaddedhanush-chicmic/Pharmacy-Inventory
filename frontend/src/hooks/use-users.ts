import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../lib/api';
import type { User, RegisterDto } from '../lib/types';

export function useUsers() {
  const queryClient = useQueryClient();

  const usersQuery = useQuery({
    queryKey: ['users'],
    queryFn: () => api.get<User[]>('/users'),
  });

  const registerMutation = useMutation({
    mutationFn: (dto: RegisterDto) => api.post<any>('/auth/register', dto),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['users'] }),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.delete<void>(`/users/${id}`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['users'] }),
  });

  return {
    users: usersQuery.data,
    isLoading: usersQuery.isLoading,
    registerUser: registerMutation.mutateAsync,
    deleteUser: deleteMutation.mutateAsync,
  };
}
