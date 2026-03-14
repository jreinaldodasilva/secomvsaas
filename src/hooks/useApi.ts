import {
  useQuery,
  useMutation,
  useQueryClient,
  type UseQueryOptions,
  type UseMutationOptions,
} from '@tanstack/react-query';
import { http, ApiError } from '../services/http';

export type { ApiError };

export function useApiQuery<T>(
  key: string[],
  path: string,
  params?: Record<string, string | number | boolean | undefined>,
  options?: Omit<UseQueryOptions<T, ApiError>, 'queryKey' | 'queryFn'>,
) {
  return useQuery<T, ApiError>({
    queryKey: key,
    queryFn: () => http.get<T>(path, params),
    ...options,
  });
}

export function useApiMutation<TData = unknown, TBody = unknown>(
  method: 'post' | 'put' | 'patch' | 'delete',
  path: string | ((variables: TBody) => string),
  options?: Omit<UseMutationOptions<TData, ApiError, TBody>, 'mutationFn'> & {
    invalidateKeys?: string[][];
  },
) {
  const queryClient = useQueryClient();
  const { invalidateKeys, ...mutationOptions } = options ?? {};

  return useMutation<TData, ApiError, TBody>({
    mutationFn: (body) => {
      const url = typeof path === 'function' ? path(body) : path;
      return method === 'delete'
        ? http.delete<TData>(url)
        : http[method]<TData>(url, body);
    },
    onSuccess: (...args) => {
      invalidateKeys?.forEach((key) => queryClient.invalidateQueries({ queryKey: key }));
      mutationOptions.onSuccess?.(...args);
    },
    ...mutationOptions,
  });
}
