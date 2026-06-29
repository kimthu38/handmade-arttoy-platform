'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '@/hooks/useAuth';
import { cartService } from '@/services/cart.service';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { formatCurrency } from '@/utils/format';
import type { CartItem } from '@/types';

export function CartView() {
  const { token, isAuthenticated } = useAuth();
  const queryClient = useQueryClient();

  const { data: items = [], isLoading } = useQuery({
    queryKey: ['cart'],
    queryFn: () => cartService.getCart(token!),
    enabled: isAuthenticated,
  });

  const removeMutation = useMutation({
    mutationFn: (productId: string) => cartService.removeItem(token!, productId),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['cart'] });
      toast.success('Item removed from cart');
    },
    onError: () => toast.error('Failed to remove item'),
  });

  if (!isAuthenticated) {
    return (
      <div className="py-20 text-center space-y-4">
        <p className="text-muted-foreground">Sign in to view your cart</p>
        <Button asChild><Link href="/login">Sign in</Link></Button>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="space-y-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="flex gap-4">
            <Skeleton className="h-24 w-24 rounded-md" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-4 w-1/2" />
              <Skeleton className="h-4 w-1/3" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="py-20 text-center space-y-4">
        <p className="text-muted-foreground">Your cart is empty</p>
        <Button variant="outline" asChild><Link href="/products">Start shopping</Link></Button>
      </div>
    );
  }

  const total = items.reduce(
    (sum, item) => sum + Number(item.product.price) * item.quantity,
    0,
  );

  return (
    <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
      <div className="lg:col-span-2 space-y-4">
        {items.map((item) => (
          <CartItemRow
            key={item.id}
            item={item}
            onRemove={() => removeMutation.mutate(item.product_id)}
          />
        ))}
      </div>

      <div className="space-y-4">
        <div className="rounded-lg border p-6 space-y-4">
          <h2 className="font-semibold text-lg">Order summary</h2>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Subtotal ({items.length} items)</span>
            <span className="font-medium">{formatCurrency(total)}</span>
          </div>
          <p className="text-xs text-muted-foreground">Shipping calculated at checkout</p>
          <Button className="w-full" asChild>
            <Link href="/checkout">Proceed to checkout</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}

interface CartItemRowProps {
  item: CartItem;
  onRemove: () => void;
}

function CartItemRow({ item, onRemove }: CartItemRowProps) {
  const cover = item.product.images[0];

  return (
    <div className="flex gap-4 rounded-lg border p-4">
      <div className="relative h-24 w-24 shrink-0 overflow-hidden rounded-md bg-muted">
        {cover && (
          <Image src={cover} alt={item.product.name} fill className="object-cover" />
        )}
      </div>
      <div className="flex flex-1 flex-col justify-between">
        <div className="space-y-1">
          <Link
            href={`/products/${item.product.slug}`}
            className="font-medium hover:underline line-clamp-2"
          >
            {item.product.name}
          </Link>
          <p className="text-sm text-muted-foreground">{item.product.shop.name}</p>
          {item.product.is_preorder && (
            <Badge variant="secondary" className="text-xs">Pre-order</Badge>
          )}
          {item.custom_note && (
            <p className="text-xs text-muted-foreground italic">Custom: {item.custom_note}</p>
          )}
        </div>
        <div className="flex items-center justify-between">
          <span className="font-semibold">
            {formatCurrency(Number(item.product.price) * item.quantity)}
          </span>
          <div className="flex items-center gap-3">
            <span className="text-sm text-muted-foreground">x{item.quantity}</span>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-destructive hover:text-destructive"
              onClick={onRemove}
              aria-label="Remove item"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
