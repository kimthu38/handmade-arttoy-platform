'use client';

import { Suspense, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { toast } from 'sonner';
import { useAuth } from '@/hooks/useAuth';
import { authService } from '@/services/auth.service';

function OAuthCallbackHandler() {
  const params = useSearchParams();
  const router = useRouter();
  const { setAuth } = useAuth();

  useEffect(() => {
    const token = params.get('token');
    if (!token) {
      toast.error('Sign in failed');
      router.replace('/login');
      return;
    }

    authService
      .getMe(token)
      .then((user) => {
        setAuth(user, token);
        toast.success('Signed in successfully');
        router.replace('/');
      })
      .catch(() => {
        toast.error('Could not verify token');
        router.replace('/login');
      });
  }, [params, router, setAuth]);

  return (
    <div className="flex min-h-[calc(100vh-8rem)] items-center justify-center">
      <div className="flex items-center gap-3 text-muted-foreground">
        <span className="h-5 w-5 animate-spin rounded-full border-2 border-current border-t-transparent" />
        Signing you in...
      </div>
    </div>
  );
}

export default function AuthCallbackPage() {
  return (
    <Suspense>
      <OAuthCallbackHandler />
    </Suspense>
  );
}
