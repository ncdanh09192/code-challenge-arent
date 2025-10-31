import { IsString, IsOptional, IsDateString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateDiaryEntryDto {
  @ApiProperty({
    example: 'Today was great!',
    description: 'Diary entry title',
  })
  @IsString()
  title: string;

  @ApiProperty({
    example: 'I had a productive day at work...',
    description: 'Main content of the diary entry',
  })
  @IsString()
  content: string;

  @ApiProperty({
    example: 'happy',
    description: 'Mood: happy, neutral, sad, excited',
    required: false,
  })
  @IsOptional()
  @IsString()
  mood?: string;

  @ApiProperty({
    example: 'https://example.com/image.jpg',
    description: 'Optional image URL',
    required: false,
  })
  @IsOptional()
  @IsString()
  image_url?: string;

  @ApiProperty({
    example: '2025-10-31',
    description: 'Date of diary entry',
  })
  @IsDateString()
  date: string;

  @ApiProperty({
    example: '20:30',
    description: 'Time of diary entry (HH:mm format)',
    required: false,
  })
  @IsOptional()
  @IsString()
  time?: string;
}
