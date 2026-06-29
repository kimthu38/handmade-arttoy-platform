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
import { OrderStatus, Role, User } from '@prisma/client';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Roles } from '../../common/decorators/roles.decorator';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { AddToCartDto } from './dto/add-to-cart.dto';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateStatusDto } from './dto/update-status.dto';
import { OrdersService } from './orders.service';

@Controller('orders')
@UseGuards(JwtAuthGuard)
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  // ─── Cart ─────────────────────────────────────────────────────────────────

  @Get('cart')
  getCart(@CurrentUser() user: User) {
    return this.ordersService.getCart(user.id);
  }

  @Post('cart')
  addToCart(@CurrentUser() user: User, @Body() dto: AddToCartDto) {
    return this.ordersService.addToCart(user.id, dto);
  }

  @Delete('cart/:productId')
  removeFromCart(@CurrentUser() user: User, @Param('productId') productId: string) {
    return this.ordersService.removeFromCart(user.id, productId);
  }

  // ─── Checkout ─────────────────────────────────────────────────────────────

  @Post('checkout')
  checkout(@CurrentUser() user: User, @Body() dto: CreateOrderDto) {
    return this.ordersService.checkout(user.id, dto);
  }

  // ─── Buyer ────────────────────────────────────────────────────────────────

  @Get('mine')
  getMyOrders(@CurrentUser() user: User) {
    return this.ordersService.getMyOrders(user.id);
  }

  // ─── Vendor ───────────────────────────────────────────────────────────────

  @Get('vendor/sub-orders')
  @UseGuards(RolesGuard)
  @Roles(Role.vendor)
  getVendorSubOrders(
    @CurrentUser() user: User,
    @Query('status') status?: OrderStatus,
  ) {
    return this.ordersService.getVendorSubOrders(user.id, status);
  }

  @Patch('vendor/sub-orders/:id/status')
  @UseGuards(RolesGuard)
  @Roles(Role.vendor)
  updateSubOrderStatus(
    @CurrentUser() user: User,
    @Param('id') subOrderId: string,
    @Body() dto: UpdateStatusDto,
  ) {
    return this.ordersService.updateSubOrderStatus(user.id, subOrderId, dto);
  }
}
