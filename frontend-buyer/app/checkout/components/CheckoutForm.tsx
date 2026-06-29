'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { z } from 'zod';
import { useMutation, useQuery } from '@tanstack/react-query';
import { useAuth } from '@/hooks/useAuth';
import { authService } from '@/services/auth.service';
import { ordersService } from '@/services/orders.service';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import type { PaymentMethod } from '@/types';

const schema = z.object({
  address_id: z.string().min(1, 'Select a shipping address'),
  payment_method: z.enum(['cod', 'vnpay', 'momo'] satisfies [PaymentMethod, ...PaymentMethod[]]),
});

type FormValues = z.infer<typeof schema>;

const PAYMENT_LABELS: Record<PaymentMethod, string> = {
  cod: 'Cash on Delivery (COD)',
  vnpay: 'VNPay',
  momo: 'MoMo',
};

export function CheckoutForm() {
  const { token, isAuthenticated } = useAuth();
  const router = useRouter();

  const { data: addresses = [] } = useQuery({
    queryKey: ['addresses'],
    queryFn: () => authService.getAddresses(token!),
    enabled: isAuthenticated,
  });

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      address_id: addresses.find((a) => a.is_default)?.id ?? '',
      payment_method: 'cod',
    },
  });

  const mutation = useMutation({
    mutationFn: (values: FormValues) => ordersService.checkout(token!, values),
    onSuccess: () => {
      toast.success('Order placed successfully!');
      router.push('/orders');
    },
    onError: (err: Error) => toast.error(err.message),
  });

  return (
    <form onSubmit={handleSubmit((v) => mutation.mutate(v))} className="space-y-8">
      {/* Address */}
      <fieldset className="space-y-3">
        <legend className="text-lg font-semibold">Shipping address</legend>
        {addresses.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            No addresses saved.{' '}
            <a href="/profile" className="underline">Add an address</a>
          </p>
        ) : (
          <div className="space-y-2">
            {addresses.map((addr) => (
              <label key={addr.id} className="flex gap-3 items-start rounded-lg border p-4 cursor-pointer has-[:checked]:border-foreground transition-colors">
                <input
                  type="radio"
                  value={addr.id}
                  {...register('address_id')}
                  className="mt-0.5"
                />
                <div className="text-sm">
                  <p className="font-medium">{addr.full_name} · {addr.phone}</p>
                  <p className="text-muted-foreground">
                    {addr.street}{addr.ward ? `, ${addr.ward}` : ''}, {addr.district}, {addr.city}
                  </p>
                  {addr.is_default && <span className="text-xs text-primary">Default</span>}
                </div>
              </label>
            ))}
          </div>
        )}
        {errors.address_id && <p className="text-sm text-destructive">{errors.address_id.message}</p>}
      </fieldset>

      {/* Payment method */}
      <fieldset className="space-y-3">
        <legend className="text-lg font-semibold">Payment method</legend>
        <div className="space-y-2">
          {(['cod', 'vnpay', 'momo'] satisfies PaymentMethod[]).map((method) => (
            <label key={method} className="flex gap-3 items-center rounded-lg border p-4 cursor-pointer has-[:checked]:border-foreground transition-colors">
              <input type="radio" value={method} {...register('payment_method')} />
              <span className="text-sm font-medium">{PAYMENT_LABELS[method]}</span>
            </label>
          ))}
        </div>
        {errors.payment_method && <p className="text-sm text-destructive">{errors.payment_method.message}</p>}
      </fieldset>

      <Button type="submit" className="w-full" size="lg" loading={isSubmitting || mutation.isPending}>
        Place order
      </Button>
    </form>
  );
}
