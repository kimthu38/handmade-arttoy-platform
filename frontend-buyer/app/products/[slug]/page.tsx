import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { productsService } from '@/services/products.service';
import { Badge } from '@/components/ui/badge';
import { formatCurrency } from '@/utils/format';
import { AddToCartForm } from './components/AddToCartForm';
import { Clock, Package, Paintbrush } from 'lucide-react';

interface ProductDetailPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: ProductDetailPageProps): Promise<Metadata> {
  const { slug } = await params;
  try {
    const product = await productsService.detail(slug);
    return {
      title: product.name,
      description: product.description ?? undefined,
      openGraph: { images: product.images[0] ? [product.images[0]] : [] },
    };
  } catch {
    return { title: 'Product not found' };
  }
}

export default async function ProductDetailPage({ params }: ProductDetailPageProps) {
  const { slug } = await params;

  let product;
  try {
    product = await productsService.detail(slug);
  } catch {
    notFound();
  }

  const coverImage = product.images[0];

  return (
    <div className="container mx-auto px-4 py-8">
      <nav className="mb-6 text-sm text-muted-foreground">
        <Link href="/" className="hover:text-foreground">Home</Link>
        {' / '}
        <Link href="/products" className="hover:text-foreground">Products</Link>
        {' / '}
        <span>{product.name}</span>
      </nav>

      <div className="grid grid-cols-1 gap-12 lg:grid-cols-2">
        {/* Gallery */}
        <div className="space-y-4">
          <div className="relative aspect-square overflow-hidden rounded-xl bg-muted">
            {coverImage ? (
              <Image
                src={coverImage}
                alt={product.name}
                fill
                priority
                sizes="(max-width: 1024px) 100vw, 50vw"
                className="object-cover"
              />
            ) : (
              <div className="flex h-full items-center justify-center text-muted-foreground">
                No image
              </div>
            )}
          </div>
          {product.images.length > 1 && (
            <div className="flex gap-2 overflow-x-auto">
              {product.images.map((img, i) => (
                <div key={i} className="relative h-20 w-20 shrink-0 overflow-hidden rounded-md border bg-muted">
                  <Image src={img} alt={`${product.name} ${i + 1}`} fill className="object-cover" />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Info */}
        <div className="space-y-6">
          <div className="space-y-2">
            <Link href={`/shops/${product.shop.slug}`} className="text-sm text-muted-foreground hover:text-foreground">
              {product.shop.name}
            </Link>
            <h1 className="text-3xl font-bold">{product.name}</h1>
            <p className="text-3xl font-bold">{formatCurrency(product.price)}</p>
          </div>

          {/* Domain badges */}
          <div className="flex flex-wrap gap-2">
            {product.is_preorder && (
              <Badge variant="secondary" className="flex items-center gap-1">
                <Clock className="h-3 w-3" />
                Pre-order
                {product.estimated_days && ` · ~${product.estimated_days} days`}
              </Badge>
            )}
            {product.allow_custom && (
              <Badge variant="outline" className="flex items-center gap-1">
                <Paintbrush className="h-3 w-3" />
                Custom orders accepted
              </Badge>
            )}
            {!product.is_preorder && (
              <Badge variant="outline" className="flex items-center gap-1">
                <Package className="h-3 w-3" />
                {product.stock} in stock
              </Badge>
            )}
          </div>

          {product.description && (
            <p className="text-muted-foreground leading-relaxed">{product.description}</p>
          )}

          {product.materials.length > 0 && (
            <div className="space-y-1">
              <p className="text-sm font-medium">Materials</p>
              <div className="flex flex-wrap gap-1">
                {product.materials.map((m) => (
                  <Badge key={m} variant="secondary">{m}</Badge>
                ))}
              </div>
            </div>
          )}

          <AddToCartForm product={product} />
        </div>
      </div>
    </div>
  );
}
