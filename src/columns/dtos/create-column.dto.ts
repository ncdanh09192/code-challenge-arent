import { IsString, IsOptional, IsBoolean } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateColumnDto {
  @ApiProperty({
    example: 'Healthy Eating Tips',
    description: 'Column title',
  })
  @IsString()
  title: string;

  @ApiProperty({
    example: 'Here are some tips for healthy eating...',
    description: 'Column content (rich text)',
  })
  @IsString()
  content: string;

  @ApiProperty({
    example: 'clx123abc',
    description: 'Column category ID',
  })
  @IsString()
  categoryId: string;

  @ApiProperty({
    example: 'https://example.com/image.jpg',
    description: 'Banner image URL',
    required: false,
  })
  @IsOptional()
  @IsString()
  image_url?: string;

  @ApiProperty({
    example: true,
    description: 'Whether to publish immediately',
    required: false,
  })
  @IsOptional()
  @IsBoolean()
  published?: boolean;
}
