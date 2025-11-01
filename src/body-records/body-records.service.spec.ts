import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { BodyRecordsService } from './body-records.service';
import { PrismaService } from '../prisma.service';

describe('BodyRecordsService', () => {
  let service: BodyRecordsService;
  let prismaService: PrismaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        BodyRecordsService,
        {
          provide: PrismaService,
          useValue: {
            bodyRecord: {
              create: jest.fn(),
              findMany: jest.fn(),
              findUnique: jest.fn(),
              findFirst: jest.fn(),
              update: jest.fn(),
              delete: jest.fn(),
            },
          },
        },
      ],
    }).compile();

    service = module.get<BodyRecordsService>(BodyRecordsService);
    prismaService = module.get<PrismaService>(PrismaService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should successfully create a body record', async () => {
      const userId = 'user123';
      const createDto = {
        weight: 75.5,
        bodyFatPercentage: 20.5,
        date: '2025-10-31',
        notes: 'After workout',
      };

      const mockRecord = {
        id: 'record123',
        userId,
        ...createDto,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      (prismaService.bodyRecord.create as jest.Mock).mockResolvedValueOnce(
        mockRecord,
      );

      const result = await service.create(userId, createDto);

      expect(result).toEqual(mockRecord);
      expect(prismaService.bodyRecord.create).toHaveBeenCalled();
    });
  });

  describe('findAll', () => {
    it('should return paginated body records for user', async () => {
      const userId = 'user123';
      const mockRecords = [
        { id: '1', userId, weight: 75.5 },
        { id: '2', userId, weight: 74.8 },
      ];

      (prismaService.bodyRecord.findMany as jest.Mock).mockResolvedValueOnce(
        mockRecords,
      );

      const result = await service.findAll(userId, 0, 30);

      expect(result).toEqual(mockRecords);
      expect(prismaService.bodyRecord.findMany).toHaveBeenCalledWith({
        where: { userId },
        skip: 0,
        take: 30,
        orderBy: { date: 'desc' },
      });
    });
  });

  describe('findOne', () => {
    it('should return a single body record', async () => {
      const userId = 'user123';
      const recordId = 'record123';
      const mockRecord = {
        id: recordId,
        userId,
        weight: 75.5,
      };

      (prismaService.bodyRecord.findUnique as jest.Mock).mockResolvedValueOnce(
        mockRecord,
      );

      const result = await service.findOne(recordId, userId);

      expect(result).toEqual(mockRecord);
    });

    it('should throw NotFoundException if record not found', async () => {
      (prismaService.bodyRecord.findUnique as jest.Mock).mockResolvedValueOnce(
        null,
      );

      await expect(service.findOne('nonexistent', 'user123')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('update', () => {
    it('should successfully update a body record', async () => {
      const userId = 'user123';
      const recordId = 'record123';
      const updateDto = {
        weight: 74.5,
      };

      const existingRecord = {
        id: recordId,
        userId,
        weight: 75.5,
        bodyFatPercentage: 20.5,
        date: new Date('2025-10-31'),
        notes: 'After workout',
      };

      const updatedRecord = {
        ...existingRecord,
        weight: 74.5,
      };

      (prismaService.bodyRecord.findUnique as jest.Mock).mockResolvedValueOnce(
        existingRecord,
      );
      (prismaService.bodyRecord.update as jest.Mock).mockResolvedValueOnce(
        updatedRecord,
      );

      const result = await service.update(recordId, userId, updateDto);

      expect(result).toEqual(updatedRecord);
    });
  });

  describe('getStats', () => {
    it('should return body record statistics', async () => {
      const userId = 'user123';
      const mockRecords = [
        {
          id: '1',
          userId,
          weight: 76.0,
          bodyFatPercentage: 21.0,
          date: new Date('2025-10-31'),
        },
        {
          id: '2',
          userId,
          weight: 75.0,
          bodyFatPercentage: 20.5,
          date: new Date('2025-10-01'),
        },
      ];

      (prismaService.bodyRecord.findMany as jest.Mock).mockResolvedValueOnce(
        mockRecords,
      );

      const result = await service.getStats(userId);

      expect(result).not.toBeNull();
      expect(result).toHaveProperty('current');
      expect(result).toHaveProperty('change');
      expect(result).toHaveProperty('records');
      if (result) {
        expect(result.records).toBe(2);
      }
    });
  });

  describe('getTrendData', () => {
    it('should return trend data for specified days', async () => {
      const userId = 'user123';
      const mockTrendData = [
        { date: new Date('2025-10-01'), weight: 76.0, bodyFatPercentage: 21.0 },
        { date: new Date('2025-10-31'), weight: 75.0, bodyFatPercentage: 20.5 },
      ];

      (prismaService.bodyRecord.findMany as jest.Mock).mockResolvedValueOnce(
        mockTrendData,
      );

      const result = await service.getTrendData(userId, 30);

      expect(result).toEqual(mockTrendData);
      expect(Array.isArray(result)).toBe(true);
    });
  });
});
