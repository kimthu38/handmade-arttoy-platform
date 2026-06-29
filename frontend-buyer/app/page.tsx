import type { Metadata } from 'next';
import Link from 'next/link';
import { productsService } from '@/services/products.service';
import { Button } from '@/components/ui/button';
import { ProductCard } from '@/app/products/components/ProductCard';

export const metadata: Metadata = {
  title: 'ArtToy Market — Handmade & Art Toy Marketplace',
};

export default async function HomePage() {
  const [newArrivals, preorders] = await Promise.all([
    productsService.list({ limit: 8 }, { revalidate: 60 }),
    productsService.list({ is_preorder: true, limit: 4 }, { revalidate: 60 }),
  ]);

  return (
    <div className="container mx-auto px-4 py-12 space-y-16">
      {/* Hero */}
      <section className="text-center space-y-6 py-12">
        <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
          Handmade &amp; Art Toy<br />
          <span className="text-muted-foreground font-normal">from independent artists</span>
        </h1>
        <p className="mx-auto max-w-xl text-lg text-muted-foreground">
          Every product is a work of art. Discover unique collections from studios and
          handcraft artisans.
        </p>
        <div className="flex justify-center gap-4">
          <Button size="lg" asChild>
            <Link href="/products">Explore now</Link>
          </Button>
          <Button size="lg" variant="outline" asChild>
            <Link href="/shops/apply">Become a vendor</Link>
          </Button>
        </div>
      </section>

      {/* New Arrivals */}
      <section className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold">New Arrivals</h2>
          <Button variant="ghost" asChild>
            <Link href="/products">View all →</Link>
          </Button>
        </div>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {newArrivals.items.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </section>

      {/* Pre-orders */}
      {preorders.items.length > 0 && (
        <section className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold">Open Pre-orders</h2>
            <Button variant="ghost" asChild>
              <Link href="/products?is_preorder=true">View all →</Link>
            </Button>
          </div>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {preorders.items.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
