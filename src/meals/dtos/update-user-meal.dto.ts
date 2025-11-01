import { IsString, IsOptional, IsDateString, IsNumber, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateUserMealDto {
  @ApiProperty({
    example: 'clx123abc',
    description: 'Meal preset ID',
    required: false,
  })
  @IsOptional()
  @IsString()
  mealPresetId?: string;

  @ApiProperty({
    example: 'Custom Salad',
    description: 'Custom meal name',
    required: false,
  })
  @IsOptional()
  @IsString()
  customName?: string;

  @ApiProperty({
    example: '2025-10-31',
    description: 'Date of meal',
    required: false,
  })
  @IsOptional()
  @IsDateString()
  date?: string;

  @ApiProperty({
    example: '12:30',
    description: 'Time of meal (HH:mm format)',
    required: false,
  })
  @IsOptional()
  @IsString()
  time?: string;

  @ApiProperty({
    example: 350,
    description: 'Calories in the meal',
    required: false,
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  calories?: number;

  @ApiProperty({
    example: 'https://example.com/image.jpg',
    description: 'Image URL of meal',
    required: false,
  })
  @IsOptional()
  @IsString()
  image_url?: string;

  @ApiProperty({
    example: 1.5,
    description: 'Servings (default 1)',
    required: false,
  })
  @IsOptional()
  @IsNumber()
  @Min(0.5)
  servings?: number;

  @ApiProperty({
    example: 'High protein meal',
    description: 'Notes about the meal',
    required: false,
  })
  @IsOptional()
  @IsString()
  notes?: string;
}
