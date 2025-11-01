import { IsNumber, IsOptional, IsDateString, Min, Max, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateBodyRecordDto {
  @ApiProperty({
    example: 75.5,
    description: 'Weight in kg',
    required: false,
  })
  @IsOptional()
  @IsNumber()
  @Min(30)
  @Max(200)
  weight?: number;

  @ApiProperty({
    example: 20.5,
    description: 'Body fat percentage',
    required: false,
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  bodyFatPercentage?: number;

  @ApiProperty({
    example: '2025-10-31',
    description: 'Date of measurement',
    required: false,
  })
  @IsOptional()
  @IsDateString()
  date?: string;

  @ApiProperty({
    example: 'After workout',
    description: 'Optional notes',
    required: false,
  })
  @IsOptional()
  @IsString()
  notes?: string;
}
