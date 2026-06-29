import { Transform } from 'class-transformer';
import {
  IsBoolean,
  IsInt,
  IsOptional,
  IsString,
  Max,
  Min,
} from 'class-validator';

export class QueryProductsDto {
  @IsOptional()
  @IsString()
  q?: string;

  @IsOptional()
  @IsString()
  category_id?: string;

  @IsOptional()
  @Transform(({ value }: { value: string }) => parseFloat(value))
  @Min(0)
  min_price?: number;

  @IsOptional()
  @Transform(({ value }: { value: string }) => parseFloat(value))
  @Min(0)
  max_price?: number;

  @IsOptional()
  @IsString()
  materials?: string; // comma-separated

  @IsOptional()
  @Transform(({ value }: { value: string }) => value === 'true')
  @IsBoolean()
  is_preorder?: boolean;

  @IsOptional()
  @Transform(({ value }: { value: string }) => parseInt(value))
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number = 20;

  @IsOptional()
  @Transform(({ value }: { value: string }) => parseInt(value))
  @IsInt()
  @Min(1)
  page?: number = 1;
}
