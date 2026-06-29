import type { Metadata } from 'next';
import { OrdersList } from './components/OrdersList';

export const metadata: Metadata = { title: 'My Orders' };

export default function OrdersPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">My Orders</h1>
      <OrdersList />
    </div>
  );
}
