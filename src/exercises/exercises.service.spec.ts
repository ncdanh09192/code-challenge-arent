import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { ExercisesService } from './exercises.service';
import { PrismaService } from '../prisma.service';

describe('ExercisesService', () => {
  let service: ExercisesService;
  let prismaService: PrismaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ExercisesService,
        {
          provide: PrismaService,
          useValue: {
            exercisePreset: {
              findMany: jest.fn(),
              findUnique: jest.fn(),
            },
            userExercise: {
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

    service = module.get<ExercisesService>(ExercisesService);
    prismaService = module.get<PrismaService>(PrismaService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getAllExercisePresets', () => {
    it('should return all exercise presets', async () => {
      const mockPresets = [
        { id: '1', name: 'Running' },
        { id: '2', name: 'Swimming' },
      ];

      (prismaService.exercisePreset.findMany as jest.Mock).mockResolvedValueOnce(
        mockPresets,
      );

      const result = await service.getAllExercisePresets();

      expect(result).toEqual(mockPresets);
    });
  });

  describe('getExercisePreset', () => {
    it('should return an exercise preset by id', async () => {
      const mockPreset = { id: '1', name: 'Running' };

      (prismaService.exercisePreset.findUnique as jest.Mock).mockResolvedValueOnce(
        mockPreset,
      );

      const result = await service.getExercisePreset('1');

      expect(result).toEqual(mockPreset);
    });

    it('should throw NotFoundException if preset not found', async () => {
      (prismaService.exercisePreset.findUnique as jest.Mock).mockResolvedValueOnce(
        null,
      );

      await expect(service.getExercisePreset('nonexistent')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('createUserExercise', () => {
    it('should successfully create a user exercise with preset', async () => {
      const userId = 'user123';
      const createDto = {
        exercisePresetId: 'preset123',
        date: '2025-10-31',
        time: '10:00',
        duration: 30,
        calories_burned: 250,
      };

      const mockPreset = { id: 'preset123', name: 'Running' };
      const mockExercise = {
        id: 'exercise123',
        userId,
        ...createDto,
        exercisePreset: mockPreset,
      };

      (prismaService.exercisePreset.findUnique as jest.Mock).mockResolvedValueOnce(
        mockPreset,
      );
      (prismaService.userExercise.create as jest.Mock).mockResolvedValueOnce(
        mockExercise,
      );

      const result = await service.createUserExercise(userId, createDto);

      expect(result).toEqual(mockExercise);
    });

    it('should throw BadRequestException if neither preset nor customName provided', async () => {
      const userId = 'user123';
      const createDto = {
        date: '2025-10-31',
        time: '10:00',
        duration: 30,
        calories_burned: 250,
      };

      await expect(
        service.createUserExercise(userId, createDto),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('getUserExercises', () => {
    it('should return paginated user exercises', async () => {
      const userId = 'user123';
      const mockExercises = [
        { id: '1', userId, duration: 30 },
        { id: '2', userId, duration: 45 },
      ];

      (prismaService.userExercise.findMany as jest.Mock).mockResolvedValueOnce(
        mockExercises,
      );

      const result = await service.getUserExercises(userId, 0, 30);

      expect(result).toEqual(mockExercises);
    });
  });

  describe('getExerciseStats', () => {
    it('should return exercise statistics for a date', async () => {
      const userId = 'user123';
      const mockExercises = [
        { id: '1', userId, duration: 30, calories_burned: 250 },
        { id: '2', userId, duration: 45, calories_burned: 350 },
      ];

      (prismaService.userExercise.findMany as jest.Mock).mockResolvedValueOnce(
        mockExercises,
      );

      const result = await service.getExerciseStats(userId, '2025-10-31');

      expect(result).toHaveProperty('date');
      expect(result).toHaveProperty('exercises');
      expect(result).toHaveProperty('totalDuration');
      expect(result).toHaveProperty('totalCalories');
    });
  });
});
