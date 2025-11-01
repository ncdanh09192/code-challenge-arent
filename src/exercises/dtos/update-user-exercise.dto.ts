import { IsString, IsOptional, IsDateString, IsNumber, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateUserExerciseDto {
  @ApiProperty({
    example: 'clx123abc',
    description: 'Exercise preset ID',
    required: false,
  })
  @IsOptional()
  @IsString()
  exercisePresetId?: string;

  @ApiProperty({
    example: 'Custom HIIT Training',
    description: 'Custom exercise name',
    required: false,
  })
  @IsOptional()
  @IsString()
  customName?: string;

  @ApiProperty({
    example: '2025-10-31',
    description: 'Date of exercise',
    required: false,
  })
  @IsOptional()
  @IsDateString()
  date?: string;

  @ApiProperty({
    example: '14:30',
    description: 'Time of exercise (HH:mm format)',
    required: false,
  })
  @IsOptional()
  @IsString()
  time?: string;

  @ApiProperty({
    example: 30,
    description: 'Duration in minutes',
    required: false,
  })
  @IsOptional()
  @IsNumber()
  @Min(1)
  duration?: number;

  @ApiProperty({
    example: 250,
    description: 'Calories burned (calculated or custom)',
    required: false,
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  calories_burned?: number;

  @ApiProperty({
    example: 'Good pace, felt strong',
    description: 'Notes about the exercise',
    required: false,
  })
  @IsOptional()
  @IsString()
  notes?: string;
}
