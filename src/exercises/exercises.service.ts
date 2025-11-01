import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma.service';
import { CreateUserExerciseDto } from './dtos/create-user-exercise.dto';
import { UpdateUserExerciseDto } from './dtos/update-user-exercise.dto';

@Injectable()
export class ExercisesService {
  constructor(private prisma: PrismaService) {}

  // ============= Exercise Presets =============

  async getAllExercisePresets() {
    return this.prisma.exercisePreset.findMany({
      orderBy: { name: 'asc' },
    });
  }

  async getExercisePreset(id: string) {
    const preset = await this.prisma.exercisePreset.findUnique({
      where: { id },
    });

    if (!preset) {
      throw new NotFoundException('Exercise preset not found');
    }

    return preset;
  }

  // ============= User Exercises =============

  async createUserExercise(userId: string, createDto: CreateUserExerciseDto) {
    // Validate that either exercisePresetId or customName is provided
    if (!createDto.exercisePresetId && !createDto.customName) {
      throw new BadRequestException(
        'Either exercisePresetId or customName must be provided',
      );
    }

    // If exercisePresetId is provided, verify it exists
    if (createDto.exercisePresetId) {
      const preset = await this.prisma.exercisePreset.findUnique({
        where: { id: createDto.exercisePresetId },
      });

      if (!preset) {
        throw new NotFoundException('Exercise preset not found');
      }
    }

    return this.prisma.userExercise.create({
      data: {
        userId,
        exercisePresetId: createDto.exercisePresetId,
        customName: createDto.customName,
        date: new Date(createDto.date),
        time: createDto.time,
        duration: createDto.duration,
        calories_burned: createDto.calories_burned,
        notes: createDto.notes,
      },
      include: { exercisePreset: true },
    });
  }

  async getUserExercises(userId: string, skip = 0, take = 30, date?: string) {
    const where: Prisma.UserExerciseWhereInput = { userId };

    if (date) {
      const dateObj = new Date(date);
      const nextDay = new Date(dateObj);
      nextDay.setDate(nextDay.getDate() + 1);

      where.date = {
        gte: dateObj,
        lt: nextDay,
      };
    }

    return this.prisma.userExercise.findMany({
      where,
      skip,
      take,
      orderBy: { date: 'desc' },
      include: { exercisePreset: true },
    });
  }

  async getUserExercisesByDate(userId: string, date: string) {
    const dateObj = new Date(date);
    const nextDay = new Date(dateObj);
    nextDay.setDate(nextDay.getDate() + 1);

    return this.prisma.userExercise.findMany({
      where: {
        userId,
        date: {
          gte: dateObj,
          lt: nextDay,
        },
      },
      orderBy: { time: 'asc' },
      include: { exercisePreset: true },
    });
  }

  async getUserExercise(id: string, userId: string) {
    const exercise = await this.prisma.userExercise.findUnique({
      where: { id },
      include: { exercisePreset: true },
    });

    if (!exercise || exercise.userId !== userId) {
      throw new NotFoundException('Exercise not found');
    }

    return exercise;
  }

  async updateUserExercise(
    id: string,
    userId: string,
    updateDto: UpdateUserExerciseDto,
  ) {
    const exercise = await this.getUserExercise(id, userId);

    // Validate preset if provided
    if (updateDto.exercisePresetId && updateDto.exercisePresetId !== exercise.exercisePresetId) {
      const preset = await this.prisma.exercisePreset.findUnique({
        where: { id: updateDto.exercisePresetId },
      });

      if (!preset) {
        throw new NotFoundException('Exercise preset not found');
      }
    }

    return this.prisma.userExercise.update({
      where: { id },
      data: {
        exercisePresetId: updateDto.exercisePresetId ?? exercise.exercisePresetId,
        customName: updateDto.customName ?? exercise.customName,
        date: updateDto.date ? new Date(updateDto.date) : exercise.date,
        time: updateDto.time ?? exercise.time,
        duration: updateDto.duration ?? exercise.duration,
        calories_burned: updateDto.calories_burned ?? exercise.calories_burned,
        notes: updateDto.notes ?? exercise.notes,
      },
      include: { exercisePreset: true },
    });
  }

  async deleteUserExercise(id: string, userId: string) {
    await this.getUserExercise(id, userId);
    return this.prisma.userExercise.delete({ where: { id } });
  }

  async getExerciseStats(userId: string, date: string) {
    const dateObj = new Date(date);
    const nextDay = new Date(dateObj);
    nextDay.setDate(nextDay.getDate() + 1);

    const exercises = await this.prisma.userExercise.findMany({
      where: {
        userId,
        date: {
          gte: dateObj,
          lt: nextDay,
        },
      },
    });

    const totalDuration = exercises.reduce((sum, ex) => sum + ex.duration, 0);
    const totalCalories = exercises.reduce((sum, ex) => sum + ex.calories_burned, 0);
    const count = exercises.length;

    return {
      date,
      exercises: count,
      totalDuration,
      totalCalories,
      averageCalories: count > 0 ? Math.round(totalCalories / count) : 0,
    };
  }
}
