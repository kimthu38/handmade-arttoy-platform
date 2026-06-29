import Image from 'next/image';
import Link from 'next/link';
import type { Product } from '@/types';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { formatCurrency } from '@/utils/format';

interface ProductCardProps {
  product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
  const coverImage = product.images[0];

  return (
    <Link href={`/products/${product.slug}`} className="group outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-lg">
      <Card className="overflow-hidden transition-shadow group-hover:shadow-md">
        <div className="relative aspect-square overflow-hidden bg-muted">
          {coverImage ? (
            <Image
              src={coverImage}
              alt={product.name}
              fill
              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
              className="object-cover transition-transform duration-300 group-hover:scale-105"
            />
          ) : (
            <div className="flex h-full items-center justify-center text-muted-foreground text-sm">
              No image
            </div>
          )}
          {product.is_preorder && (
            <Badge className="absolute left-2 top-2" variant="secondary">
              Pre-order
            </Badge>
          )}
        </div>
        <CardContent className="p-3 space-y-1">
          <p className="text-xs text-muted-foreground truncate">{product.shop.name}</p>
          <h3 className="font-medium leading-tight line-clamp-2 text-sm">{product.name}</h3>
          <div className="flex items-center justify-between gap-2">
            <span className="font-bold">{formatCurrency(product.price)}</span>
            {product.is_preorder && product.estimated_days && (
              <span className="text-xs text-muted-foreground whitespace-nowrap">
                ~{product.estimated_days}d
              </span>
            )}
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
