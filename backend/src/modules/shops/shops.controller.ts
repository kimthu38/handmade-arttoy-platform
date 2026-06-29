import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { Role, User } from '@prisma/client';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Roles } from '../../common/decorators/roles.decorator';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { ApplyVendorDto } from './dto/apply-vendor.dto';
import { UpdateShopDto } from './dto/update-shop.dto';
import { ShopsService } from './shops.service';

@Controller('shops')
export class ShopsController {
  constructor(private readonly shopsService: ShopsService) {}

  // Public: view a shop storefront
  @Get(':slug')
  getShopBySlug(@Param('slug') slug: string) {
    return this.shopsService.getShopBySlug(slug);
  }

  // Buyer: submit vendor application
  @Post('apply')
  @UseGuards(JwtAuthGuard)
  applyAsVendor(@CurrentUser() user: User, @Body() dto: ApplyVendorDto) {
    return this.shopsService.applyAsVendor(user.id, dto);
  }

  // Vendor: manage own shop
  @Get('vendor/me')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.vendor)
  getMyShop(@CurrentUser() user: User) {
    return this.shopsService.getMyShop(user.id);
  }

  @Patch('vendor/me')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.vendor)
  updateMyShop(@CurrentUser() user: User, @Body() dto: UpdateShopDto) {
    return this.shopsService.updateMyShop(user.id, dto);
  }

  // Admin: vendor curation
  @Get('admin/applications')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.admin)
  listApplications(@Query('status') status?: string) {
    return this.shopsService.listApplications(status);
  }

  @Patch('admin/applications/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.admin)
  reviewApplication(
    @Param('id') applicationId: string,
    @CurrentUser() admin: User,
    @Body() body: { decision: 'approved' | 'rejected'; note?: string },
  ) {
    return this.shopsService.reviewApplication(
      applicationId,
      admin.id,
      body.decision,
      body.note,
    );
  }
}
