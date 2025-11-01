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
import { MealsService } from './meals.service';
import { CreateUserMealDto } from './dtos/create-user-meal.dto';
import { UpdateUserMealDto } from './dtos/update-user-meal.dto';

@ApiTags('meals')
@Controller('meals')
export class MealsController {
  constructor(private mealsService: MealsService) {}

  // ============= Meal Presets (Public) =============

  @Get('presets')
  @ApiOperation({ summary: 'Get all meal presets' })
  @ApiResponse({ status: 200, description: 'List of meal presets' })
  async getMealPresets(@Query('categoryId') categoryId?: string) {
    return this.mealsService.getAllMealPresets(categoryId);
  }

  @Get('presets/categories')
  @ApiOperation({ summary: 'Get meal categories' })
  @ApiResponse({ status: 200, description: 'List of meal categories' })
  async getMealCategories() {
    return this.mealsService.getMealCategories();
  }

  @Get('presets/:id')
  @ApiOperation({ summary: 'Get meal preset by ID' })
  @ApiResponse({ status: 200, description: 'Meal preset details' })
  async getMealPreset(@Param('id') id: string) {
    return this.mealsService.getMealPreset(id);
  }

  // ============= User Meals (Protected) =============

  @Post('user')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Log a meal' })
  @ApiResponse({ status: 201, description: 'Meal logged successfully' })
  async createUserMeal(
    @CurrentUser('id') userId: string,
    @Body() createDto: CreateUserMealDto,
  ) {
    return this.mealsService.createUserMeal(userId, createDto);
  }

  @Get('user')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT')
  @ApiOperation({ summary: 'Get meals for current user' })
  @ApiResponse({ status: 200, description: 'List of user meals' })
  async getUserMeals(
    @CurrentUser('id') userId: string,
    @Query('skip', new ParseIntPipe({ optional: true })) skip?: number,
    @Query('take', new ParseIntPipe({ optional: true })) take?: number,
    @Query('date') date?: string,
  ) {
    return this.mealsService.getUserMeals(userId, skip || 0, take || 30, date);
  }

  @Get('user/date/:date')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT')
  @ApiOperation({ summary: 'Get meals for specific date' })
  @ApiResponse({ status: 200, description: 'Meals for the specified date' })
  async getUserMealsByDate(
    @CurrentUser('id') userId: string,
    @Param('date', new ParseDatePipe()) date: Date,
  ) {
    return this.mealsService.getUserMealsByDate(userId, date.toISOString().split('T')[0]);
  }

  @Get('user/stats/:date')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT')
  @ApiOperation({ summary: 'Get meal stats for specific date' })
  @ApiResponse({
    status: 200,
    description: 'Meal statistics including total calories',
  })
  async getMealStats(
    @CurrentUser('id') userId: string,
    @Param('date', new ParseDatePipe()) date: Date,
  ) {
    return this.mealsService.getMealStats(userId, date.toISOString().split('T')[0]);
  }

  @Get('user/:id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT')
  @ApiOperation({ summary: 'Get meal by ID' })
  @ApiResponse({ status: 200, description: 'Meal details' })
  async getUserMeal(
    @Param('id') id: string,
    @CurrentUser('id') userId: string,
  ) {
    return this.mealsService.getUserMeal(id, userId);
  }

  @Put('user/:id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT')
  @ApiOperation({ summary: 'Update meal' })
  @ApiResponse({ status: 200, description: 'Meal updated successfully' })
  async updateUserMeal(
    @Param('id') id: string,
    @CurrentUser('id') userId: string,
    @Body() updateDto: UpdateUserMealDto,
  ) {
    return this.mealsService.updateUserMeal(id, userId, updateDto);
  }

  @Delete('user/:id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete meal' })
  @ApiResponse({ status: 204, description: 'Meal deleted successfully' })
  async deleteUserMeal(
    @Param('id') id: string,
    @CurrentUser('id') userId: string,
  ) {
    return this.mealsService.deleteUserMeal(id, userId);
  }
}
