'use client';

import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';
import { ordersService } from '@/services/orders.service';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { formatCurrency, formatDate, formatOrderStatus, formatPaymentMethod } from '@/utils/format';

const STATUS_VARIANT: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
  awaiting_confirmation: 'outline',
  ready_to_ship: 'secondary',
  shipping: 'default',
  delivered: 'secondary',
  cancelled: 'destructive',
};

export function OrdersList() {
  const { token, isAuthenticated } = useAuth();

  const { data: orders = [], isLoading } = useQuery({
    queryKey: ['orders'],
    queryFn: () => ordersService.getMyOrders(token!),
    enabled: isAuthenticated,
  });

  if (!isAuthenticated) {
    return (
      <div className="py-20 text-center space-y-4">
        <p className="text-muted-foreground">Sign in to view your orders</p>
        <Button asChild><Link href="/login">Sign in</Link></Button>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="space-y-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} className="h-32 w-full rounded-lg" />
        ))}
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="py-20 text-center space-y-4">
        <p className="text-muted-foreground">No orders yet</p>
        <Button asChild><Link href="/products">Start shopping</Link></Button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {orders.map((order) => (
        <div key={order.id} className="rounded-lg border p-6 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="space-y-0.5">
              <p className="text-xs text-muted-foreground font-mono">#{order.id.slice(0, 8).toUpperCase()}</p>
              <p className="text-sm text-muted-foreground">{formatDate(order.created_at)}</p>
            </div>
            <div className="text-right space-y-0.5">
              <p className="font-bold">{formatCurrency(order.total_amount)}</p>
              <p className="text-xs text-muted-foreground">{formatPaymentMethod(order.payment_method)}</p>
            </div>
          </div>

          <div className="space-y-3">
            {order.sub_orders.map((sub) => (
              <div key={sub.id} className="rounded-md bg-muted/50 p-3 space-y-2">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium">{sub.shop.name}</p>
                  <Badge variant={STATUS_VARIANT[sub.status] ?? 'outline'}>
                    {formatOrderStatus(sub.status)}
                  </Badge>
                </div>
                {sub.items.map((item) => (
                  <p key={item.id} className="text-sm text-muted-foreground">
                    {item.product_name} x{item.quantity}
                    {item.custom_note && (
                      <span className="italic"> · {item.custom_note}</span>
                    )}
                  </p>
                ))}
                {sub.tracking_number && (
                  <p className="text-xs text-muted-foreground">
                    Tracking: <span className="font-mono">{sub.tracking_number}</span>
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
