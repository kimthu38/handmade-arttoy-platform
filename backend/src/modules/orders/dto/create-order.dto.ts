import {
  IsEnum,
  IsNotEmpty,
  IsString,
} from 'class-validator';
import { PaymentMethod } from '@prisma/client';

export class CreateOrderDto {
  @IsString()
  @IsNotEmpty()
  address_id: string; // User's saved address id

  @IsEnum(PaymentMethod)
  payment_method: PaymentMethod;
}
