import type { Metadata } from 'next';
import { CartView } from './components/CartView';

export const metadata: Metadata = { title: 'Cart' };

export default function CartPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Your Cart</h1>
      <CartView />
    </div>
  );
}
