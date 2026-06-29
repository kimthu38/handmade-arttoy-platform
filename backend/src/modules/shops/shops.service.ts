import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Shop, VendorApplication } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { ApplyVendorDto } from './dto/apply-vendor.dto';
import { UpdateShopDto } from './dto/update-shop.dto';

@Injectable()
export class ShopsService {
  constructor(private readonly prisma: PrismaService) {}

  async applyAsVendor(
    userId: string,
    dto: ApplyVendorDto,
  ): Promise<VendorApplication> {
    const existing = await this.prisma.vendorApplication.findFirst({
      where: { user_id: userId, status: 'pending' },
    });
    if (existing) {
      throw new ConflictException('You already have a pending application');
    }

    return this.prisma.vendorApplication.create({
      data: { ...dto, user_id: userId },
    });
  }

  async getMyShop(userId: string): Promise<Shop> {
    const shop = await this.prisma.shop.findUnique({
      where: { vendor_id: userId },
    });
    if (!shop) throw new NotFoundException('Shop not found');
    return shop;
  }

  async updateMyShop(userId: string, dto: UpdateShopDto): Promise<Shop> {
    const shop = await this.prisma.shop.findUnique({
      where: { vendor_id: userId },
    });
    if (!shop) throw new NotFoundException('Shop not found');

    if (dto.name) {
      const slug = this.toSlug(dto.name);
      const conflict = await this.prisma.shop.findFirst({
        where: { slug, id: { not: shop.id } },
      });
      if (conflict) throw new ConflictException('Shop name already taken');
      return this.prisma.shop.update({
        where: { id: shop.id },
        data: { ...dto, slug },
      });
    }

    return this.prisma.shop.update({
      where: { id: shop.id },
      data: dto,
    });
  }

  async getShopBySlug(slug: string): Promise<Shop> {
    const shop = await this.prisma.shop.findUnique({ where: { slug } });
    if (!shop || !shop.is_approved) throw new NotFoundException('Shop not found');
    return shop;
  }

  // ─── Admin ────────────────────────────────────────────────────────────────

  async listApplications(status?: string): Promise<VendorApplication[]> {
    return this.prisma.vendorApplication.findMany({
      where: status ? { status: status as 'pending' | 'approved' | 'rejected' } : {},
      orderBy: { created_at: 'desc' },
    });
  }

  async reviewApplication(
    applicationId: string,
    adminId: string,
    decision: 'approved' | 'rejected',
    note?: string,
  ): Promise<VendorApplication> {
    const application = await this.prisma.vendorApplication.findUnique({
      where: { id: applicationId },
    });
    if (!application) throw new NotFoundException('Application not found');
    if (application.status !== 'pending') {
      throw new BadRequestException('Application already reviewed');
    }

    const updated = await this.prisma.vendorApplication.update({
      where: { id: applicationId },
      data: {
        status: decision,
        admin_note: note,
        reviewed_at: new Date(),
      },
    });

    if (decision === 'approved') {
      // Promote user to vendor and create their shop
      await this.prisma.$transaction([
        this.prisma.user.update({
          where: { id: application.user_id },
          data: { role: 'vendor' },
        }),
        this.prisma.shop.create({
          data: {
            vendor_id: application.user_id,
            name: application.business_name,
            slug: this.toSlug(application.business_name),
            description: application.description,
            is_approved: true,
          },
        }),
      ]);

      // Create wallet for the new shop
      const shop = await this.prisma.shop.findUnique({
        where: { vendor_id: application.user_id },
      });
      if (shop) {
        await this.prisma.wallet.create({ data: { shop_id: shop.id } });
      }
    }

    return updated;
  }

  private toSlug(name: string): string {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .trim()
      .replace(/\s+/g, '-');
  }
}
