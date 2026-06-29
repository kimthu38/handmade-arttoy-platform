import { Injectable, NotFoundException } from '@nestjs/common';
import { Address, User } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateAddressDto } from './dto/create-address.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  async getProfile(userId: string): Promise<Omit<User, 'password_hash'>> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });
    if (!user) throw new NotFoundException('User not found');

    const { password_hash: _, ...safeUser } = user;
    return safeUser;
  }

  async updateProfile(
    userId: string,
    dto: UpdateProfileDto,
  ): Promise<Omit<User, 'password_hash'>> {
    const user = await this.prisma.user.update({
      where: { id: userId },
      data: dto,
    });
    const { password_hash: _, ...safeUser } = user;
    return safeUser;
  }

  async getAddresses(userId: string): Promise<Address[]> {
    return this.prisma.address.findMany({
      where: { user_id: userId },
      orderBy: [{ is_default: 'desc' }, { created_at: 'desc' }],
    });
  }

  async createAddress(
    userId: string,
    dto: CreateAddressDto,
  ): Promise<Address> {
    if (dto.is_default) {
      await this.prisma.address.updateMany({
        where: { user_id: userId },
        data: { is_default: false },
      });
    }

    return this.prisma.address.create({
      data: { ...dto, user_id: userId },
    });
  }

  async updateAddress(
    userId: string,
    addressId: string,
    dto: Partial<CreateAddressDto>,
  ): Promise<Address> {
    const address = await this.prisma.address.findFirst({
      where: { id: addressId, user_id: userId },
    });
    if (!address) throw new NotFoundException('Address not found');

    if (dto.is_default) {
      await this.prisma.address.updateMany({
        where: { user_id: userId, id: { not: addressId } },
        data: { is_default: false },
      });
    }

    return this.prisma.address.update({
      where: { id: addressId },
      data: dto,
    });
  }

  async deleteAddress(userId: string, addressId: string): Promise<void> {
    const address = await this.prisma.address.findFirst({
      where: { id: addressId, user_id: userId },
    });
    if (!address) throw new NotFoundException('Address not found');

    await this.prisma.address.delete({ where: { id: addressId } });
  }
}
