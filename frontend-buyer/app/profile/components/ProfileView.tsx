'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { z } from 'zod';
import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';
import { authService } from '@/services/auth.service';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

const schema = z.object({
  full_name: z.string().min(2, 'Name must be at least 2 characters').max(100),
});

type FormValues = z.infer<typeof schema>;

export function ProfileView() {
  const { user, token, isAuthenticated, setAuth } = useAuth();

  const { register, handleSubmit, formState: { errors, isSubmitting, isDirty } } = useForm<FormValues>({
    resolver: zodResolver(schema),
    values: { full_name: user?.full_name ?? '' },
  });

  const mutation = useMutation({
    mutationFn: (values: FormValues) => authService.updateProfile(token!, values),
    onSuccess: (updated) => {
      if (token) setAuth(updated, token);
      toast.success('Profile updated');
    },
    onError: () => toast.error('Failed to update profile'),
  });

  if (!isAuthenticated) {
    return (
      <div className="py-20 text-center space-y-4">
        <p className="text-muted-foreground">Sign in to view your profile</p>
        <Button asChild><Link href="/login">Sign in</Link></Button>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <form onSubmit={handleSubmit((v) => mutation.mutate(v))} className="space-y-4">
        <h2 className="text-xl font-semibold">Personal information</h2>
        <div className="space-y-1">
          <Label htmlFor="full_name">Full name</Label>
          <Input id="full_name" {...register('full_name')} />
          {errors.full_name && <p className="text-sm text-destructive">{errors.full_name.message}</p>}
        </div>
        <div className="space-y-1">
          <Label>Email</Label>
          <Input value={user?.email ?? ''} disabled className="bg-muted" />
          <p className="text-xs text-muted-foreground">Email cannot be changed</p>
        </div>
        <Button type="submit" loading={isSubmitting || mutation.isPending} disabled={!isDirty}>
          Save changes
        </Button>
      </form>

      <div className="border-t pt-8 space-y-4">
        <h2 className="text-xl font-semibold">Address book</h2>
        <p className="text-sm text-muted-foreground">
          Manage your saved shipping addresses.
        </p>
        <Button variant="outline" asChild>
          <Link href="/profile/addresses">Manage addresses →</Link>
        </Button>
      </div>
    </div>
  );
}
