'use client';

import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/auth.store';
import type { User } from '@/types';

interface UseAuthReturn {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  setAuth: (user: User, token: string) => void;
  logout: () => void;
}

export function useAuth(): UseAuthReturn {
  const router = useRouter();
  const { user, token, setAuth, clearAuth } = useAuthStore();

  function logout(): void {
    clearAuth();
    router.push('/');
  }

  return {
    user,
    token,
    isAuthenticated: user !== null && token !== null,
    setAuth,
    logout,
  };
}
