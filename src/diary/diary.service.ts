import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { CreateDiaryEntryDto } from './dtos/create-diary-entry.dto';
import { UpdateDiaryEntryDto } from './dtos/update-diary-entry.dto';

@Injectable()
export class DiaryService {
  constructor(private prisma: PrismaService) {}

  async createEntry(userId: string, createDto: CreateDiaryEntryDto) {
    const dateObj = new Date(createDto.date);

    const entry = await this.prisma.diaryEntry.create({
      data: {
        userId,
        title: createDto.title,
        content: createDto.content,
        mood: createDto.mood,
        image_url: createDto.image_url,
        date: dateObj,
        time: createDto.time,
      },
    });

    // Update daily goal - mark diary as written
    await this.updateDailyGoalDiary(userId, dateObj);

    return entry;
  }

  async findAll(userId: string, skip = 0, take = 30) {
    return this.prisma.diaryEntry.findMany({
      where: { userId },
      skip,
      take,
      orderBy: { date: 'desc' },
    });
  }

  async findByDate(userId: string, date: string) {
    const dateObj = new Date(date);
    const nextDay = new Date(dateObj);
    nextDay.setDate(nextDay.getDate() + 1);

    return this.prisma.diaryEntry.findMany({
      where: {
        userId,
        date: {
          gte: dateObj,
          lt: nextDay,
        },
      },
      orderBy: { time: 'asc' },
    });
  }

  async findOne(id: string, userId: string) {
    const entry = await this.prisma.diaryEntry.findUnique({
      where: { id },
    });

    if (!entry || entry.userId !== userId) {
      throw new NotFoundException('Diary entry not found');
    }

    return entry;
  }

  async update(id: string, userId: string, updateDto: UpdateDiaryEntryDto) {
    const entry = await this.findOne(id, userId);

    return this.prisma.diaryEntry.update({
      where: { id },
      data: {
        title: updateDto.title ?? entry.title,
        content: updateDto.content ?? entry.content,
        mood: updateDto.mood ?? entry.mood,
        image_url: updateDto.image_url ?? entry.image_url,
        date: updateDto.date ? new Date(updateDto.date) : entry.date,
        time: updateDto.time ?? entry.time,
      },
    });
  }

  async delete(id: string, userId: string) {
    await this.findOne(id, userId);
    return this.prisma.diaryEntry.delete({ where: { id } });
  }

  // ============= Daily Goals Management =============

  async getDailyGoal(userId: string, date: string) {
    const dateObj = new Date(date);

    let goal = await this.prisma.dailyGoal.findUnique({
      where: {
        userId_date: {
          userId,
          date: dateObj,
        },
      },
    });

    // Create goal if doesn't exist
    if (!goal) {
      goal = await this.prisma.dailyGoal.create({
        data: {
          userId,
          date: dateObj,
          target_meals: 3,
          target_exercises: 1,
          target_diary: 1,
        },
      });
    }

    return goal;
  }

  async getAchievementRate(userId: string, date: string) {
    const goal = await this.getDailyGoal(userId, date);

    const totalCompleted =
      goal.meals_logged + goal.exercises_logged + goal.diary_written;
    const totalTargets =
      goal.target_meals + goal.target_exercises + goal.target_diary;

    const achievementRate =
      totalTargets > 0 ? Math.round((totalCompleted / totalTargets) * 100) : 0;

    return {
      date,
      achievement_rate: achievementRate,
      completed: {
        meals: goal.meals_logged,
        exercises: goal.exercises_logged,
        diary: goal.diary_written,
      },
      targets: {
        meals: goal.target_meals,
        exercises: goal.target_exercises,
        diary: goal.target_diary,
      },
      progress: `${totalCompleted}/${totalTargets}`,
    };
  }

  async getAchievementRangeStats(userId: string, days = 30) {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const goals = await this.prisma.dailyGoal.findMany({
      where: {
        userId,
        date: { gte: startDate },
      },
      orderBy: { date: 'asc' },
    });

    const totalDays = goals.length;
    const totalCompleted = goals.reduce((sum, goal) => {
      const completed = goal.meals_logged + goal.exercises_logged + goal.diary_written;
      const targets = goal.target_meals + goal.target_exercises + goal.target_diary;
      const rate = targets > 0 ? (completed / targets) * 100 : 0;
      return sum + rate;
    }, 0);

    const averageRate = totalDays > 0 ? Math.round(totalCompleted / totalDays) : 0;

    let bestDay = null;
    if (goals.length > 0) {
      bestDay = goals.reduce((best, current) => {
        const bestCompleted = best.meals_logged + best.exercises_logged + best.diary_written;
        const currentCompleted = current.meals_logged + current.exercises_logged + current.diary_written;
        const bestTargets = best.target_meals + best.target_exercises + best.target_diary;
        const currentTargets = current.target_meals + current.target_exercises + current.target_diary;
        const bestRate = bestTargets > 0 ? (bestCompleted / bestTargets) * 100 : 0;
        const currentRate = currentTargets > 0 ? (currentCompleted / currentTargets) * 100 : 0;
        return currentRate > bestRate ? current : best;
      });
    }

    return {
      days,
      averageAchievementRate: averageRate,
      bestDay,
      totalGoals: totalDays,
    };
  }

  // ============= Helper Methods =============

  async updateDailyGoalDiary(userId: string, date: Date) {
    const goal = await this.getDailyGoal(userId, date.toISOString().split('T')[0]);

    const diaryCount = await this.prisma.diaryEntry.count({
      where: {
        userId,
        date: {
          gte: date,
          lt: new Date(date.getTime() + 24 * 60 * 60 * 1000),
        },
      },
    });

    await this.prisma.dailyGoal.update({
      where: { id: goal.id },
      data: {
        diary_written: Math.min(diaryCount, goal.target_diary),
        achievement_rate: this.calculateAchievementRate(
          Math.min(diaryCount, goal.target_diary),
          goal.meals_logged,
          goal.exercises_logged,
          goal.target_diary,
          goal.target_meals,
          goal.target_exercises,
        ),
      },
    });
  }

  async updateDailyGoalMeals(userId: string, date: Date) {
    const goal = await this.getDailyGoal(userId, date.toISOString().split('T')[0]);

    const mealsCount = await this.prisma.userMeal.count({
      where: {
        userId,
        date: {
          gte: date,
          lt: new Date(date.getTime() + 24 * 60 * 60 * 1000),
        },
      },
    });

    await this.prisma.dailyGoal.update({
      where: { id: goal.id },
      data: {
        meals_logged: Math.min(mealsCount, goal.target_meals),
        achievement_rate: this.calculateAchievementRate(
          goal.diary_written,
          Math.min(mealsCount, goal.target_meals),
          goal.exercises_logged,
          goal.target_diary,
          goal.target_meals,
          goal.target_exercises,
        ),
      },
    });
  }

  async updateDailyGoalExercises(userId: string, date: Date) {
    const goal = await this.getDailyGoal(userId, date.toISOString().split('T')[0]);

    const exercisesCount = await this.prisma.userExercise.count({
      where: {
        userId,
        date: {
          gte: date,
          lt: new Date(date.getTime() + 24 * 60 * 60 * 1000),
        },
      },
    });

    await this.prisma.dailyGoal.update({
      where: { id: goal.id },
      data: {
        exercises_logged: Math.min(exercisesCount, goal.target_exercises),
        achievement_rate: this.calculateAchievementRate(
          goal.diary_written,
          goal.meals_logged,
          Math.min(exercisesCount, goal.target_exercises),
          goal.target_diary,
          goal.target_meals,
          goal.target_exercises,
        ),
      },
    });
  }

  private calculateAchievementRate(
    diaryWritten: number,
    mealsLogged: number,
    exercisesLogged: number,
    targetDiary: number,
    targetMeals: number,
    targetExercises: number,
  ): number {
    const totalCompleted = diaryWritten + mealsLogged + exercisesLogged;
    const totalTargets = targetDiary + targetMeals + targetExercises;

    return totalTargets > 0 ? Math.round((totalCompleted / totalTargets) * 100) : 0;
  }
}
