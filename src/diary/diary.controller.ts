import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Param,
  Body,
  UseGuards,
  Query,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { DiaryService } from './diary.service';
import { CreateDiaryEntryDto } from './dtos/create-diary-entry.dto';

@ApiTags('diary')
@Controller('diary')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth('JWT')
export class DiaryController {
  constructor(private diaryService: DiaryService) {}

  @Post('entries')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create new diary entry' })
  @ApiResponse({ status: 201, description: 'Diary entry created successfully' })
  async createEntry(
    @CurrentUser('id') userId: string,
    @Body() createDto: CreateDiaryEntryDto,
  ) {
    return this.diaryService.createEntry(userId, createDto);
  }

  @Get('entries')
  @ApiOperation({ summary: 'Get all diary entries for current user' })
  @ApiResponse({ status: 200, description: 'List of diary entries' })
  async findAll(
    @CurrentUser('id') userId: string,
    @Query('skip') skip: number = 0,
    @Query('take') take: number = 30,
  ) {
    return this.diaryService.findAll(userId, skip, take);
  }

  @Get('entries/date/:date')
  @ApiOperation({ summary: 'Get diary entries for specific date' })
  @ApiResponse({ status: 200, description: 'Diary entries for the specified date' })
  async findByDate(
    @CurrentUser('id') userId: string,
    @Param('date') date: string,
  ) {
    return this.diaryService.findByDate(userId, date);
  }

  @Get('entries/:id')
  @ApiOperation({ summary: 'Get diary entry by ID' })
  @ApiResponse({ status: 200, description: 'Diary entry details' })
  async findOne(
    @Param('id') id: string,
    @CurrentUser('id') userId: string,
  ) {
    return this.diaryService.findOne(id, userId);
  }

  @Put('entries/:id')
  @ApiOperation({ summary: 'Update diary entry' })
  @ApiResponse({ status: 200, description: 'Diary entry updated successfully' })
  async update(
    @Param('id') id: string,
    @CurrentUser('id') userId: string,
    @Body() updateDto: CreateDiaryEntryDto,
  ) {
    return this.diaryService.update(id, userId, updateDto);
  }

  @Delete('entries/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete diary entry' })
  @ApiResponse({ status: 204, description: 'Diary entry deleted successfully' })
  async delete(
    @Param('id') id: string,
    @CurrentUser('id') userId: string,
  ) {
    return this.diaryService.delete(id, userId);
  }

  // ============= Daily Goals & Achievement =============

  @Get('goals/date/:date')
  @ApiOperation({ summary: 'Get daily goal for specific date' })
  @ApiResponse({ status: 200, description: 'Daily goal details' })
  async getDailyGoal(
    @CurrentUser('id') userId: string,
    @Param('date') date: string,
  ) {
    return this.diaryService.getDailyGoal(userId, date);
  }

  @Get('achievement/date/:date')
  @ApiOperation({ summary: 'Get achievement rate for specific date' })
  @ApiResponse({ status: 200, description: 'Achievement rate and progress' })
  async getAchievementRate(
    @CurrentUser('id') userId: string,
    @Param('date') date: string,
  ) {
    return this.diaryService.getAchievementRate(userId, date);
  }

  @Get('achievement/stats')
  @ApiOperation({ summary: 'Get achievement statistics for date range' })
  @ApiResponse({
    status: 200,
    description: 'Average achievement rate and statistics',
  })
  async getAchievementStats(
    @CurrentUser('id') userId: string,
    @Query('days') days: number = 30,
  ) {
    return this.diaryService.getAchievementRangeStats(userId, days);
  }
}
