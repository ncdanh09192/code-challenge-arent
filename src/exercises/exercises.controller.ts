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
import { ParseDatePipe } from '../common/pipes/parse-date.pipe';
import { ExercisesService } from './exercises.service';
import { CreateUserExerciseDto } from './dtos/create-user-exercise.dto';
import { UpdateUserExerciseDto } from './dtos/update-user-exercise.dto';

@ApiTags('exercises')
@Controller('exercises')
export class ExercisesController {
  constructor(private exercisesService: ExercisesService) {}

  // ============= Exercise Presets (Public) =============

  @Get('presets')
  @ApiOperation({ summary: 'Get all exercise presets' })
  @ApiResponse({ status: 200, description: 'List of exercise presets' })
  async getExercisePresets() {
    return this.exercisesService.getAllExercisePresets();
  }

  @Get('presets/:id')
  @ApiOperation({ summary: 'Get exercise preset by ID' })
  @ApiResponse({ status: 200, description: 'Exercise preset details' })
  async getExercisePreset(@Param('id') id: string) {
    return this.exercisesService.getExercisePreset(id);
  }

  // ============= User Exercises (Protected) =============

  @Post('user')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Log an exercise' })
  @ApiResponse({ status: 201, description: 'Exercise logged successfully' })
  async createUserExercise(
    @CurrentUser('id') userId: string,
    @Body() createDto: CreateUserExerciseDto,
  ) {
    return this.exercisesService.createUserExercise(userId, createDto);
  }

  @Get('user')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT')
  @ApiOperation({ summary: 'Get exercises for current user' })
  @ApiResponse({ status: 200, description: 'List of user exercises' })
  async getUserExercises(
    @CurrentUser('id') userId: string,
    @Query('skip', new ParseIntPipe({ optional: true })) skip?: number,
    @Query('take', new ParseIntPipe({ optional: true })) take?: number,
    @Query('date') date?: string,
  ) {
    return this.exercisesService.getUserExercises(userId, skip || 0, take || 30, date);
  }

  @Get('user/date/:date')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT')
  @ApiOperation({ summary: 'Get exercises for specific date' })
  @ApiResponse({ status: 200, description: 'Exercises for the specified date' })
  async getUserExercisesByDate(
    @CurrentUser('id') userId: string,
    @Param('date', new ParseDatePipe()) date: Date,
  ) {
    return this.exercisesService.getUserExercisesByDate(userId, date.toISOString().split('T')[0]);
  }

  @Get('user/stats/:date')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT')
  @ApiOperation({ summary: 'Get exercise stats for specific date' })
  @ApiResponse({
    status: 200,
    description: 'Exercise statistics including duration and calories',
  })
  async getExerciseStats(
    @CurrentUser('id') userId: string,
    @Param('date', new ParseDatePipe()) date: Date,
  ) {
    return this.exercisesService.getExerciseStats(userId, date.toISOString().split('T')[0]);
  }

  @Get('user/:id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT')
  @ApiOperation({ summary: 'Get exercise by ID' })
  @ApiResponse({ status: 200, description: 'Exercise details' })
  async getUserExercise(
    @Param('id') id: string,
    @CurrentUser('id') userId: string,
  ) {
    return this.exercisesService.getUserExercise(id, userId);
  }

  @Put('user/:id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT')
  @ApiOperation({ summary: 'Update exercise' })
  @ApiResponse({ status: 200, description: 'Exercise updated successfully' })
  async updateUserExercise(
    @Param('id') id: string,
    @CurrentUser('id') userId: string,
    @Body() updateDto: UpdateUserExerciseDto,
  ) {
    return this.exercisesService.updateUserExercise(id, userId, updateDto);
  }

  @Delete('user/:id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete exercise' })
  @ApiResponse({ status: 204, description: 'Exercise deleted successfully' })
  async deleteUserExercise(
    @Param('id') id: string,
    @CurrentUser('id') userId: string,
  ) {
    return this.exercisesService.deleteUserExercise(id, userId);
  }
}
