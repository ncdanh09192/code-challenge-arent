import { IsString, IsOptional, IsDateString, IsNumber, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateUserExerciseDto {
  @ApiProperty({
    example: 'clx123abc',
    description: 'Exercise preset ID (optional if custom)',
    required: false,
  })
  @IsOptional()
  @IsString()
  exercisePresetId?: string;

  @ApiProperty({
    example: 'Custom HIIT Training',
    description: 'Custom exercise name (required if no preset)',
    required: false,
  })
  @IsOptional()
  @IsString()
  customName?: string;

  @ApiProperty({
    example: '2025-10-31',
    description: 'Date of exercise',
  })
  @IsDateString()
  date: string;

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
  })
  @IsNumber()
  @Min(1)
  duration: number;

  @ApiProperty({
    example: 250,
    description: 'Calories burned (calculated or custom)',
  })
  @IsNumber()
  @Min(0)
  calories_burned: number;

  @ApiProperty({
    example: 'Good pace, felt strong',
    description: 'Notes about the exercise',
    required: false,
  })
  @IsOptional()
  @IsString()
  notes?: string;
}
