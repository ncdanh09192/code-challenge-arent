import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { CreateUserMealDto } from './dtos/create-user-meal.dto';

@Injectable()
export class MealsService {
  constructor(private prisma: PrismaService) {}

  // ============= Meal Presets =============

  async getAllMealPresets(categoryId?: string) {
    return this.prisma.mealPreset.findMany({
      where: categoryId ? { categoryId } : {},
      include: { category: true },
      orderBy: { name: 'asc' },
    });
  }

  async getMealPreset(id: string) {
    const preset = await this.prisma.mealPreset.findUnique({
      where: { id },
      include: { category: true },
    });

    if (!preset) {
      throw new NotFoundException('Meal preset not found');
    }

    return preset;
  }

  async getMealCategories() {
    return this.prisma.mealCategory.findMany({
      orderBy: { name: 'asc' },
    });
  }

  // ============= User Meals =============

  async createUserMeal(userId: string, createDto: CreateUserMealDto) {
    // Validate that either mealPresetId or customName is provided
    if (!createDto.mealPresetId && !createDto.customName) {
      throw new BadRequestException(
        'Either mealPresetId or customName must be provided',
      );
    }

    // If mealPresetId is provided, verify it exists
    if (createDto.mealPresetId) {
      const preset = await this.prisma.mealPreset.findUnique({
        where: { id: createDto.mealPresetId },
      });

      if (!preset) {
        throw new NotFoundException('Meal preset not found');
      }
    }

    return this.prisma.userMeal.create({
      data: {
        userId,
        mealPresetId: createDto.mealPresetId,
        customName: createDto.customName,
        date: new Date(createDto.date),
        time: createDto.time,
        calories: createDto.calories,
        image_url: createDto.image_url,
        servings: createDto.servings || 1,
        notes: createDto.notes,
      },
      include: { mealPreset: { include: { category: true } } },
    });
  }

  async getUserMeals(userId: string, skip = 0, take = 30, date?: string) {
    const where = { userId } as any;

    if (date) {
      const dateObj = new Date(date);
      const nextDay = new Date(dateObj);
      nextDay.setDate(nextDay.getDate() + 1);

      where.date = {
        gte: dateObj,
        lt: nextDay,
      };
    }

    return this.prisma.userMeal.findMany({
      where,
      skip,
      take,
      orderBy: { date: 'desc' },
      include: { mealPreset: { include: { category: true } } },
    });
  }

  async getUserMealsByDate(userId: string, date: string) {
    const dateObj = new Date(date);
    const nextDay = new Date(dateObj);
    nextDay.setDate(nextDay.getDate() + 1);

    return this.prisma.userMeal.findMany({
      where: {
        userId,
        date: {
          gte: dateObj,
          lt: nextDay,
        },
      },
      orderBy: { time: 'asc' },
      include: { mealPreset: { include: { category: true } } },
    });
  }

  async getUserMeal(id: string, userId: string) {
    const meal = await this.prisma.userMeal.findUnique({
      where: { id },
      include: { mealPreset: { include: { category: true } } },
    });

    if (!meal || meal.userId !== userId) {
      throw new NotFoundException('Meal not found');
    }

    return meal;
  }

  async updateUserMeal(id: string, userId: string, updateDto: CreateUserMealDto) {
    const meal = await this.getUserMeal(id, userId);

    // Validate preset if provided
    if (updateDto.mealPresetId && updateDto.mealPresetId !== meal.mealPresetId) {
      const preset = await this.prisma.mealPreset.findUnique({
        where: { id: updateDto.mealPresetId },
      });

      if (!preset) {
        throw new NotFoundException('Meal preset not found');
      }
    }

    return this.prisma.userMeal.update({
      where: { id },
      data: {
        mealPresetId: updateDto.mealPresetId ?? meal.mealPresetId,
        customName: updateDto.customName ?? meal.customName,
        date: updateDto.date ? new Date(updateDto.date) : meal.date,
        time: updateDto.time ?? meal.time,
        calories: updateDto.calories ?? meal.calories,
        image_url: updateDto.image_url ?? meal.image_url,
        servings: updateDto.servings ?? meal.servings,
        notes: updateDto.notes ?? meal.notes,
      },
      include: { mealPreset: { include: { category: true } } },
    });
  }

  async deleteUserMeal(id: string, userId: string) {
    await this.getUserMeal(id, userId);
    return this.prisma.userMeal.delete({ where: { id } });
  }

  async getMealStats(userId: string, date: string) {
    const dateObj = new Date(date);
    const nextDay = new Date(dateObj);
    nextDay.setDate(nextDay.getDate() + 1);

    const meals = await this.prisma.userMeal.findMany({
      where: {
        userId,
        date: {
          gte: dateObj,
          lt: nextDay,
        },
      },
    });

    const totalCalories = meals.reduce((sum, meal) => sum + meal.calories, 0);
    const count = meals.length;

    return {
      date,
      meals: count,
      totalCalories,
      averageCalories: count > 0 ? Math.round(totalCalories / count) : 0,
    };
  }
}
