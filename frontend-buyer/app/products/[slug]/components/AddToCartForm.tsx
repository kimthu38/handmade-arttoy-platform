'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import type { Product } from '@/types';
import { useAuth } from '@/hooks/useAuth';
import { cartService } from '@/services/cart.service';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useRouter } from 'next/navigation';

const schema = z.object({
  quantity: z.number().int().min(1),
  custom_note: z.string().max(500).optional(),
});

type FormValues = z.infer<typeof schema>;

interface AddToCartFormProps {
  product: Product;
}

export function AddToCartForm({ product }: AddToCartFormProps) {
  const { token, isAuthenticated } = useAuth();
  const router = useRouter();
  const queryClient = useQueryClient();

  const { register, handleSubmit, formState: { errors } } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { quantity: 1 },
  });

  const mutation = useMutation({
    mutationFn: (values: FormValues) => {
      if (!token) throw new Error('Sign in to add items to your cart');
      return cartService.addItem(token, {
        product_id: product.id,
        quantity: values.quantity,
        custom_note: values.custom_note,
      });
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['cart'] });
      toast.success('Added to cart');
    },
    onError: (err: Error) => toast.error(err.message),
  });

  function onSubmit(values: FormValues) {
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }
    mutation.mutate(values);
  }

  const isOutOfStock = !product.is_preorder && product.stock === 0;

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="flex items-center gap-3">
        <Label htmlFor="quantity" className="shrink-0">Quantity</Label>
        <Input
          id="quantity"
          type="number"
          className="w-24"
          min={1}
          max={product.is_preorder ? undefined : product.stock}
          {...register('quantity', { valueAsNumber: true })}
        />
        {errors.quantity && (
          <p className="text-sm text-destructive">{errors.quantity.message}</p>
        )}
      </div>

      {product.allow_custom && (
        <div className="space-y-1">
          <Label htmlFor="custom_note">Custom request</Label>
          <textarea
            id="custom_note"
            rows={3}
            className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-50"
            placeholder="e.g. Engraving text: 'Spring 2026', pastel pink colour..."
            {...register('custom_note')}
          />
        </div>
      )}

      <div className="flex gap-3">
        <Button
          type="submit"
          className="flex-1"
          loading={mutation.isPending}
          disabled={isOutOfStock}
        >
          {isOutOfStock ? 'Out of stock' : 'Add to cart'}
        </Button>
        <Button
          type="button"
          variant="outline"
          className="flex-1"
          disabled={isOutOfStock}
          onClick={() => {
            if (!isAuthenticated) { router.push('/login'); return; }
            mutation.mutate({ quantity: 1 });
            router.push('/checkout');
          }}
        >
          Buy now
        </Button>
      </div>
    </form>
  );
}
