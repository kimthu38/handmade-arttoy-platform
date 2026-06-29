import { IsOptional, IsString, IsUrl, MaxLength } from 'class-validator';

export class UpdateShopDto {
  @IsOptional()
  @IsString()
  @MaxLength(100)
  name?: string;

  @IsOptional()
  @IsString()
  @MaxLength(2000)
  description?: string;

  @IsOptional()
  @IsUrl()
  logo_url?: string;

  @IsOptional()
  @IsString()
  brand_story?: string;

  @IsOptional()
  @IsUrl()
  process_video_url?: string;
}
