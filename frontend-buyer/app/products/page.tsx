import type { Metadata } from 'next';
import { Suspense } from 'react';
import { productsService, type ProductQuery } from '@/services/products.service';
import { Skeleton } from '@/components/ui/skeleton';
import { ProductCard } from './components/ProductCard';
import { ProductFilters } from './components/ProductFilters';

export const metadata: Metadata = { title: 'Products' };

interface ProductsPageProps {
  searchParams: Promise<Record<string, string>>;
}

function ProductGridSkeleton() {
  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
      {Array.from({ length: 8 }).map((_, i) => (
        <div key={i} className="space-y-2">
          <Skeleton className="aspect-square w-full rounded-lg" />
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-4 w-1/2" />
        </div>
      ))}
    </div>
  );
}

export default async function ProductsPage({ searchParams }: ProductsPageProps) {
  const params = await searchParams;
  const query: ProductQuery = {
    q: params['q'],
    category_id: params['category_id'],
    min_price: params['min_price'] ? Number(params['min_price']) : undefined,
    max_price: params['max_price'] ? Number(params['max_price']) : undefined,
    materials: params['materials'],
    is_preorder: params['is_preorder'] === 'true' ? true : undefined,
    page: params['page'] ? Number(params['page']) : 1,
    limit: 24,
  };

  const { items, total } = await productsService.list(query, { revalidate: 30 });

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">All Products</h1>
      <div className="flex flex-col gap-8 md:flex-row">
        <div className="md:w-56 shrink-0">
          <Suspense>
            <ProductFilters />
          </Suspense>
        </div>
        <div className="flex-1 space-y-6">
          <p className="text-sm text-muted-foreground">{total} products</p>
          {items.length > 0 ? (
            <Suspense fallback={<ProductGridSkeleton />}>
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
                {items.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            </Suspense>
          ) : (
            <div className="py-20 text-center text-muted-foreground">
              <p>No products found.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
