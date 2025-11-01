import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { MealsService } from './meals.service';
import { PrismaService } from '../prisma.service';

describe('MealsService', () => {
  let service: MealsService;
  let prismaService: PrismaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MealsService,
        {
          provide: PrismaService,
          useValue: {
            mealPreset: {
              findMany: jest.fn(),
              findUnique: jest.fn(),
            },
            mealCategory: {
              findMany: jest.fn(),
              findUnique: jest.fn(),
            },
            userMeal: {
              create: jest.fn(),
              findMany: jest.fn(),
              findUnique: jest.fn(),
              update: jest.fn(),
              delete: jest.fn(),
            },
          },
        },
      ],
    }).compile();

    service = module.get<MealsService>(MealsService);
    prismaService = module.get<PrismaService>(PrismaService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getAllMealPresets', () => {
    it('should return all meal presets', async () => {
      const mockPresets = [
        { id: '1', name: 'Chicken Salad', categoryId: '1' },
        { id: '2', name: 'Pasta', categoryId: '2' },
      ];

      (prismaService.mealPreset.findMany as jest.Mock).mockResolvedValueOnce(
        mockPresets,
      );

      const result = await service.getAllMealPresets();

      expect(result).toEqual(mockPresets);
      expect(prismaService.mealPreset.findMany).toHaveBeenCalledWith({
        where: {},
        include: { category: true },
        orderBy: { name: 'asc' },
      });
    });
  });

  describe('getMealCategories', () => {
    it('should return all meal categories', async () => {
      const mockCategories = [
        { id: '1', name: 'Salad' },
        { id: '2', name: 'Pasta' },
      ];

      (prismaService.mealCategory.findMany as jest.Mock).mockResolvedValueOnce(
        mockCategories,
      );

      const result = await service.getMealCategories();

      expect(result).toEqual(mockCategories);
    });
  });

  describe('createUserMeal', () => {
    it('should successfully create a user meal with preset', async () => {
      const userId = 'user123';
      const createDto = {
        mealPresetId: 'preset123',
        date: '2025-10-31',
        time: '12:00',
        calories: 350,
      };

      const mockPreset = { id: 'preset123', name: 'Salad' };
      const mockMeal = {
        id: 'meal123',
        userId,
        ...createDto,
        mealPreset: mockPreset,
      };

      (prismaService.mealPreset.findUnique as jest.Mock).mockResolvedValueOnce(
        mockPreset,
      );
      (prismaService.userMeal.create as jest.Mock).mockResolvedValueOnce(
        mockMeal,
      );

      const result = await service.createUserMeal(userId, createDto);

      expect(result).toEqual(mockMeal);
      expect(prismaService.userMeal.create).toHaveBeenCalled();
    });

    it('should throw BadRequestException if neither preset nor customName provided', async () => {
      const userId = 'user123';
      const createDto = {
        date: '2025-10-31',
        time: '12:00',
        calories: 350,
      };

      await expect(service.createUserMeal(userId, createDto)).rejects.toThrow(
        BadRequestException,
      );
    });
  });

  describe('getUserMeals', () => {
    it('should return paginated user meals', async () => {
      const userId = 'user123';
      const mockMeals = [
        { id: '1', userId, calories: 350 },
        { id: '2', userId, calories: 450 },
      ];

      (prismaService.userMeal.findMany as jest.Mock).mockResolvedValueOnce(
        mockMeals,
      );

      const result = await service.getUserMeals(userId, 0, 30);

      expect(result).toEqual(mockMeals);
      expect(prismaService.userMeal.findMany).toHaveBeenCalledWith({
        where: { userId },
        skip: 0,
        take: 30,
        orderBy: { date: 'desc' },
        include: { mealPreset: { include: { category: true } } },
      });
    });
  });
});
