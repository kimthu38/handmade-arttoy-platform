import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma, Product } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateProductDto } from './dto/create-product.dto';
import { QueryProductsDto } from './dto/query-products.dto';
import { UpdateProductDto } from './dto/update-product.dto';

@Injectable()
export class ProductsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(vendorId: string, dto: CreateProductDto): Promise<Product> {
    const shop = await this.prisma.shop.findUnique({
      where: { vendor_id: vendorId },
    });
    if (!shop) throw new ForbiddenException('You do not have a shop');

    const slug = await this.generateSlug(dto.name);

    return this.prisma.product.create({
      data: {
        ...dto,
        shop_id: shop.id,
        slug,
        materials: dto.materials ?? [],
        is_moderated: false,
      },
    });
  }

  async findAll(query: QueryProductsDto): Promise<{ items: Product[]; total: number }> {
    const { q, category_id, min_price, max_price, materials, is_preorder, limit = 20, page = 1 } = query;

    const where: Prisma.ProductWhereInput = {
      is_active: true,
      is_moderated: true,
      ...(q && {
        OR: [
          { name: { contains: q, mode: 'insensitive' } },
          { description: { contains: q, mode: 'insensitive' } },
        ],
      }),
      ...(category_id && { category_id }),
      ...(min_price !== undefined || max_price !== undefined
        ? { price: { gte: min_price, lte: max_price } }
        : {}),
      ...(materials && {
        materials: { hasSome: materials.split(',').map((m) => m.trim()) },
      }),
      ...(is_preorder !== undefined && { is_preorder }),
    };

    const [items, total] = await this.prisma.$transaction([
      this.prisma.product.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        include: { shop: { select: { name: true, slug: true } }, category: true },
        orderBy: { created_at: 'desc' },
      }),
      this.prisma.product.count({ where }),
    ]);

    return { items, total };
  }

  async findOne(slug: string): Promise<Product> {
    const product = await this.prisma.product.findUnique({
      where: { slug },
      include: {
        shop: { select: { id: true, name: true, slug: true, logo_url: true } },
        category: true,
      },
    });
    if (!product || !product.is_active) throw new NotFoundException('Product not found');
    return product;
  }

  async update(
    vendorId: string,
    productId: string,
    dto: UpdateProductDto,
  ): Promise<Product> {
    const shop = await this.prisma.shop.findUnique({ where: { vendor_id: vendorId } });
    if (!shop) throw new ForbiddenException('You do not have a shop');

    const product = await this.prisma.product.findFirst({
      where: { id: productId, shop_id: shop.id },
    });
    if (!product) throw new NotFoundException('Product not found');

    return this.prisma.product.update({
      where: { id: productId },
      data: dto,
    });
  }

  async remove(vendorId: string, productId: string): Promise<void> {
    const shop = await this.prisma.shop.findUnique({ where: { vendor_id: vendorId } });
    if (!shop) throw new ForbiddenException('You do not have a shop');

    const product = await this.prisma.product.findFirst({
      where: { id: productId, shop_id: shop.id },
    });
    if (!product) throw new NotFoundException('Product not found');

    // Soft delete
    await this.prisma.product.update({
      where: { id: productId },
      data: { is_active: false },
    });
  }

  // Admin: approve or reject a product listing
  async moderateProduct(
    productId: string,
    decision: boolean,
  ): Promise<Product> {
    const product = await this.prisma.product.findUnique({ where: { id: productId } });
    if (!product) throw new NotFoundException('Product not found');

    return this.prisma.product.update({
      where: { id: productId },
      data: { is_moderated: decision },
    });
  }

  // Vendor: get own shop's product list
  async findByVendor(vendorId: string): Promise<Product[]> {
    const shop = await this.prisma.shop.findUnique({ where: { vendor_id: vendorId } });
    if (!shop) throw new ForbiddenException('You do not have a shop');

    return this.prisma.product.findMany({
      where: { shop_id: shop.id, is_active: true },
      orderBy: { created_at: 'desc' },
    });
  }

  private async generateSlug(name: string): Promise<string> {
    const base = name
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .trim()
      .replace(/\s+/g, '-');

    let slug = base;
    let counter = 1;
    while (await this.prisma.product.findUnique({ where: { slug } })) {
      slug = `${base}-${counter++}`;
    }
    return slug;
  }
}
