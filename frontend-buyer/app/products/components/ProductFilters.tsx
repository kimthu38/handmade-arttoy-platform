'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useCallback, useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useDebounce } from '@/hooks/useDebounce';

export function ProductFilters() {
  const router = useRouter();
  const params = useSearchParams();

  const [search, setSearch] = useState(params.get('q') ?? '');
  const [minPrice, setMinPrice] = useState(params.get('min_price') ?? '');
  const [maxPrice, setMaxPrice] = useState(params.get('max_price') ?? '');
  const debouncedSearch = useDebounce(search, 400);

  const pushParams = useCallback(
    (overrides: Record<string, string>) => {
      const next = new URLSearchParams(params.toString());
      Object.entries(overrides).forEach(([k, v]) => {
        if (v) next.set(k, v);
        else next.delete(k);
      });
      next.set('page', '1');
      router.push(`/products?${next.toString()}`);
    },
    [params, router],
  );

  useEffect(() => {
    pushParams({ q: debouncedSearch });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedSearch]);

  function applyPriceFilter() {
    pushParams({ min_price: minPrice, max_price: maxPrice });
  }

  function togglePreorder() {
    const current = params.get('is_preorder');
    pushParams({ is_preorder: current === 'true' ? '' : 'true' });
  }

  function resetFilters() {
    setSearch('');
    setMinPrice('');
    setMaxPrice('');
    router.push('/products');
  }

  const isPreorder = params.get('is_preorder') === 'true';

  return (
    <aside className="space-y-6 w-full">
      <div className="space-y-2">
        <Label htmlFor="search">Search</Label>
        <Input
          id="search"
          placeholder="Product name..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <div className="space-y-2">
        <p className="text-sm font-medium">Price range</p>
        <div className="flex gap-2 items-center">
          <Input
            type="number"
            placeholder="Min"
            value={minPrice}
            onChange={(e) => setMinPrice(e.target.value)}
            min={0}
            aria-label="Minimum price"
          />
          <span className="text-muted-foreground">–</span>
          <Input
            type="number"
            placeholder="Max"
            value={maxPrice}
            onChange={(e) => setMaxPrice(e.target.value)}
            min={0}
            aria-label="Maximum price"
          />
        </div>
        <Button size="sm" variant="outline" className="w-full" onClick={applyPriceFilter}>
          Apply
        </Button>
      </div>

      <div className="space-y-2">
        <p className="text-sm font-medium">Status</p>
        <Button
          size="sm"
          variant={isPreorder ? 'default' : 'outline'}
          className="w-full"
          onClick={togglePreorder}
        >
          {isPreorder ? '✓ ' : ''}Pre-order only
        </Button>
      </div>

      <Button variant="ghost" size="sm" className="w-full" onClick={resetFilters}>
        Clear filters
      </Button>
    </aside>
  );
}
