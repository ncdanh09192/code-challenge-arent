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
  ParseIntPipe,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { BodyRecordsService } from './body-records.service';
import { CreateBodyRecordDto } from './dtos/create-body-record.dto';
import { UpdateBodyRecordDto } from './dtos/update-body-record.dto';

@ApiTags('body-records')
@Controller('body-records')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth('JWT')
export class BodyRecordsController {
  constructor(private bodyRecordsService: BodyRecordsService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a new body record' })
  @ApiResponse({
    status: 201,
    description: 'Body record created successfully',
  })
  async create(
    @CurrentUser('id') userId: string,
    @Body() createDto: CreateBodyRecordDto,
  ) {
    return this.bodyRecordsService.create(userId, createDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all body records for current user' })
  @ApiResponse({
    status: 200,
    description: 'List of body records',
  })
  async findAll(
    @CurrentUser('id') userId: string,
    @Query('skip', new ParseIntPipe({ optional: true })) skip?: number,
    @Query('take', new ParseIntPipe({ optional: true })) take?: number,
  ) {
    return this.bodyRecordsService.findAll(userId, skip || 0, take || 30);
  }

  @Get('latest')
  @ApiOperation({ summary: 'Get latest body record' })
  @ApiResponse({
    status: 200,
    description: 'Latest body record',
  })
  async getLatest(@CurrentUser('id') userId: string) {
    return this.bodyRecordsService.getLatest(userId);
  }

  @Get('trend')
  @ApiOperation({
    summary: 'Get body record trend data for chart (last 6 months)',
  })
  @ApiResponse({
    status: 200,
    description: 'Trend data with dates and metrics',
  })
  async getTrendData(
    @CurrentUser('id') userId: string,
    @Query('days', new ParseIntPipe({ optional: true })) days?: number,
  ) {
    return this.bodyRecordsService.getTrendData(userId, days || 180);
  }

  @Get('stats')
  @ApiOperation({ summary: 'Get body record statistics' })
  @ApiResponse({
    status: 200,
    description: 'Statistics including current, change, and record count',
  })
  async getStats(@CurrentUser('id') userId: string) {
    return this.bodyRecordsService.getStats(userId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get body record by ID' })
  @ApiResponse({
    status: 200,
    description: 'Body record details',
  })
  async findOne(
    @Param('id') id: string,
    @CurrentUser('id') userId: string,
  ) {
    return this.bodyRecordsService.findOne(id, userId);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update body record' })
  @ApiResponse({
    status: 200,
    description: 'Body record updated successfully',
  })
  async update(
    @Param('id') id: string,
    @CurrentUser('id') userId: string,
    @Body() updateDto: UpdateBodyRecordDto,
  ) {
    return this.bodyRecordsService.update(id, userId, updateDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete body record' })
  @ApiResponse({
    status: 204,
    description: 'Body record deleted successfully',
  })
  async delete(
    @Param('id') id: string,
    @CurrentUser('id') userId: string,
  ) {
    return this.bodyRecordsService.delete(id, userId);
  }
}
