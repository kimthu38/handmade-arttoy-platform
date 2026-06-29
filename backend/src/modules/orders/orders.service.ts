import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CartItem, Order, OrderStatus, SubOrder } from '@prisma/client';
import { Decimal } from '@prisma/client/runtime/library';
import { PrismaService } from '../../prisma/prisma.service';
import { AddToCartDto } from './dto/add-to-cart.dto';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateStatusDto } from './dto/update-status.dto';

@Injectable()
export class OrdersService {
  // Default platform commission (can be overridden by CommissionConfig)
  private readonly DEFAULT_COMMISSION_RATE = 0.05;

  constructor(private readonly prisma: PrismaService) {}

  // ─── Cart ──────────────────────────────────────────────────────────────────

  async getCart(userId: string): Promise<CartItem[]> {
    return this.prisma.cartItem.findMany({
      where: { user_id: userId },
      include: {
        product: {
          select: {
            id: true,
            name: true,
            slug: true,
            price: true,
            images: true,
            stock: true,
            is_preorder: true,
            estimated_days: true,
            allow_custom: true,
            shop: { select: { id: true, name: true, slug: true } },
          },
        },
      },
    });
  }

  async addToCart(userId: string, dto: AddToCartDto): Promise<CartItem> {
    const product = await this.prisma.product.findUnique({
      where: { id: dto.product_id },
    });
    if (!product || !product.is_active) {
      throw new NotFoundException('Product not found');
    }
    if (!product.is_preorder && product.stock < dto.quantity) {
      throw new BadRequestException('Insufficient stock');
    }
    if (dto.custom_note && !product.allow_custom) {
      throw new BadRequestException('This product does not accept custom notes');
    }

    return this.prisma.cartItem.upsert({
      where: { user_id_product_id: { user_id: userId, product_id: dto.product_id } },
      create: {
        user_id: userId,
        product_id: dto.product_id,
        quantity: dto.quantity,
        custom_note: dto.custom_note,
      },
      update: {
        quantity: dto.quantity,
        custom_note: dto.custom_note,
      },
    });
  }

  async removeFromCart(userId: string, productId: string): Promise<void> {
    await this.prisma.cartItem.deleteMany({
      where: { user_id: userId, product_id: productId },
    });
  }

  async clearCart(userId: string): Promise<void> {
    await this.prisma.cartItem.deleteMany({ where: { user_id: userId } });
  }

  // ─── Checkout (Multi-vendor split) ────────────────────────────────────────

  async checkout(userId: string, dto: CreateOrderDto): Promise<Order> {
    const cartItems = await this.prisma.cartItem.findMany({
      where: { user_id: userId },
      include: { product: { include: { shop: true } } },
    });

    if (cartItems.length === 0) {
      throw new BadRequestException('Cart is empty');
    }

    const address = await this.prisma.address.findFirst({
      where: { id: dto.address_id, user_id: userId },
    });
    if (!address) throw new NotFoundException('Address not found');

    // Validate stock before committing
    for (const item of cartItems) {
      if (!item.product.is_preorder && item.product.stock < item.quantity) {
        throw new BadRequestException(
          `Product "${item.product.name}" has insufficient stock`,
        );
      }
    }

    // Get current commission rate
    const commissionConfig = await this.prisma.commissionConfig.findFirst({
      orderBy: { effective_from: 'desc' },
      where: { effective_from: { lte: new Date() } },
    });
    const commissionRate = commissionConfig
      ? Number(commissionConfig.rate)
      : this.DEFAULT_COMMISSION_RATE;

    // Group cart items by shop (split-order logic)
    const byShop = cartItems.reduce<
      Record<string, typeof cartItems>
    >((acc, item) => {
      const shopId = item.product.shop_id;
      if (!acc[shopId]) acc[shopId] = [];
      acc[shopId].push(item);
      return acc;
    }, {});

    let totalAmount = new Decimal(0);
    const subOrderData: Array<{
      shopId: string;
      items: typeof cartItems;
      subtotal: Decimal;
      commission: Decimal;
    }> = [];

    for (const [shopId, items] of Object.entries(byShop)) {
      const subtotal = items.reduce(
        (sum, item) => sum.add(new Decimal(item.product.price).mul(item.quantity)),
        new Decimal(0),
      );
      const commission = subtotal.mul(commissionRate);
      totalAmount = totalAmount.add(subtotal);
      subOrderData.push({ shopId, items, subtotal, commission });
    }

    // Persist everything in one transaction
    return this.prisma.$transaction(async (tx) => {
      const order = await tx.order.create({
        data: {
          buyer_id: userId,
          total_amount: totalAmount,
          payment_method: dto.payment_method,
          shipping_address: { ...address },
        },
      });

      for (const { shopId, items, subtotal, commission } of subOrderData) {
        const subOrder = await tx.subOrder.create({
          data: {
            order_id: order.id,
            shop_id: shopId,
            subtotal,
            commission,
          },
        });

        for (const item of items) {
          await tx.orderItem.create({
            data: {
              sub_order_id: subOrder.id,
              product_id: item.product_id,
              product_name: item.product.name,
              unit_price: item.product.price,
              quantity: item.quantity,
              custom_note: item.custom_note,
            },
          });

          // Decrement stock for non-preorder products
          if (!item.product.is_preorder) {
            await tx.product.update({
              where: { id: item.product_id },
              data: { stock: { decrement: item.quantity } },
            });
          }
        }
      }

      // Clear cart after successful checkout
      await tx.cartItem.deleteMany({ where: { user_id: userId } });

      return tx.order.findUniqueOrThrow({
        where: { id: order.id },
        include: { sub_orders: { include: { items: true } } },
      });
    });
  }

  // ─── Buyer: view orders ───────────────────────────────────────────────────

  async getMyOrders(userId: string): Promise<Order[]> {
    return this.prisma.order.findMany({
      where: { buyer_id: userId },
      include: {
        sub_orders: {
          include: {
            shop: { select: { name: true, slug: true } },
            items: true,
          },
        },
      },
      orderBy: { created_at: 'desc' },
    });
  }

  // ─── Vendor: manage sub-orders ────────────────────────────────────────────

  async getVendorSubOrders(
    vendorId: string,
    status?: OrderStatus,
  ): Promise<SubOrder[]> {
    // Always resolve shop from JWT — never trust client-provided shop_id
    const shop = await this.prisma.shop.findUnique({ where: { vendor_id: vendorId } });
    if (!shop) throw new ForbiddenException('You do not have a shop');

    return this.prisma.subOrder.findMany({
      where: { shop_id: shop.id, ...(status && { status }) },
      include: { items: true, order: { select: { payment_method: true, shipping_address: true } } },
      orderBy: { created_at: 'desc' },
    });
  }

  async updateSubOrderStatus(
    vendorId: string,
    subOrderId: string,
    dto: UpdateStatusDto,
  ): Promise<SubOrder> {
    const shop = await this.prisma.shop.findUnique({ where: { vendor_id: vendorId } });
    if (!shop) throw new ForbiddenException('You do not have a shop');

    const subOrder = await this.prisma.subOrder.findFirst({
      where: { id: subOrderId, shop_id: shop.id },
    });
    if (!subOrder) throw new NotFoundException('Sub-order not found');

    const updated = await this.prisma.subOrder.update({
      where: { id: subOrderId },
      data: {
        status: dto.status,
        ...(dto.status === 'shipping' && { shipped_at: new Date() }),
        ...(dto.status === 'delivered' && { delivered_at: new Date() }),
      },
    });

    // When delivered: unlock funds from escrow to vendor wallet
    if (dto.status === 'delivered') {
      await this.releaseEscrow(subOrder.id, shop.id, subOrder.subtotal);
    }

    return updated;
  }

  private async releaseEscrow(
    subOrderId: string,
    shopId: string,
    subtotal: Decimal,
  ): Promise<void> {
    const wallet = await this.prisma.wallet.findUnique({ where: { shop_id: shopId } });
    if (!wallet) return;

    const commissionConfig = await this.prisma.commissionConfig.findFirst({
      orderBy: { effective_from: 'desc' },
      where: { effective_from: { lte: new Date() } },
    });
    const rate = commissionConfig ? Number(commissionConfig.rate) : this.DEFAULT_COMMISSION_RATE;
    const netAmount = new Decimal(subtotal).mul(1 - rate);

    await this.prisma.$transaction([
      this.prisma.wallet.update({
        where: { id: wallet.id },
        data: { balance: { increment: netAmount } },
      }),
      this.prisma.walletTransaction.create({
        data: {
          wallet_id: wallet.id,
          amount: netAmount,
          type: 'credit',
          reference: subOrderId,
          description: 'Order delivered — funds released from escrow',
        },
      }),
    ]);
  }
}
