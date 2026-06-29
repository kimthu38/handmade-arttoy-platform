import {
  ArrayMinSize,
  IsArray,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUrl,
  MaxLength,
} from 'class-validator';

export class ApplyVendorDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  business_name: string;

  @IsOptional()
  @IsString()
  @MaxLength(1000)
  description?: string;

  @IsArray()
  @ArrayMinSize(1)
  @IsUrl({}, { each: true })
  portfolio_urls: string[];

  @IsOptional()
  @IsUrl()
  process_video_url?: string;
}
