import {
  Body,
  Controller,
  Delete,
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
import { CreateProductDto } from './dto/create-product.dto';
import { QueryProductsDto } from './dto/query-products.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { ProductsService } from './products.service';

@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  // Public: browse catalog
  @Get()
  findAll(@Query() query: QueryProductsDto) {
    return this.productsService.findAll(query);
  }

  @Get(':slug')
  findOne(@Param('slug') slug: string) {
    return this.productsService.findOne(slug);
  }

  // Vendor: manage own listings
  @Get('vendor/mine')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.vendor)
  findByVendor(@CurrentUser() user: User) {
    return this.productsService.findByVendor(user.id);
  }

  @Post('vendor')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.vendor)
  create(@CurrentUser() user: User, @Body() dto: CreateProductDto) {
    return this.productsService.create(user.id, dto);
  }

  @Patch('vendor/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.vendor)
  update(
    @CurrentUser() user: User,
    @Param('id') productId: string,
    @Body() dto: UpdateProductDto,
  ) {
    return this.productsService.update(user.id, productId, dto);
  }

  @Delete('vendor/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.vendor)
  remove(@CurrentUser() user: User, @Param('id') productId: string) {
    return this.productsService.remove(user.id, productId);
  }

  // Admin: product moderation
  @Patch('admin/:id/moderate')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.admin)
  moderate(
    @Param('id') productId: string,
    @Body() body: { approved: boolean },
  ) {
    return this.productsService.moderateProduct(productId, body.approved);
  }
}
