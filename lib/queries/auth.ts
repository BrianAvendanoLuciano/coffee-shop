import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api/endpoints';
import { cartCleared } from '@/store/cart-slice';
import { useAppDispatch } from '@/store/hooks';
import { queryKeys } from './keys';

export function useSession() {
  return useQuery({
    queryKey: queryKeys.session,
    queryFn: ({ signal }) => api.session(signal),
    staleTime: 5 * 60_000,
    select: (session) => session.user,
  });
}

export function useLogin() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: api.login,
    onSuccess: (session) => {
      // Cache isolation: drop anything cached before this user signed in,
      // then seed the session we just received.
      queryClient.clear();
      queryClient.setQueryData(queryKeys.session, session);
    },
  });
}

export function useLogout() {
  const queryClient = useQueryClient();
  const dispatch = useAppDispatch();
  const router = useRouter();

  return useMutation({
    mutationFn: api.logout,
    // onSettled, not onSuccess: even if the request fails, do not leave one
    // user's orders or cart on screen for the next person at the till.
    onSettled: () => {
      queryClient.clear();
      dispatch(cartCleared());
      router.replace('/auth');
    },
  });
}
