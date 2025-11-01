import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { CreateBodyRecordDto } from './dtos/create-body-record.dto';
import { UpdateBodyRecordDto } from './dtos/update-body-record.dto';

@Injectable()
export class BodyRecordsService {
  constructor(private prisma: PrismaService) {}

  async create(userId: string, createDto: CreateBodyRecordDto) {
    return this.prisma.bodyRecord.create({
      data: {
        userId,
        weight: createDto.weight,
        bodyFatPercentage: createDto.bodyFatPercentage,
        date: new Date(createDto.date),
        notes: createDto.notes,
      },
    });
  }

  async findAll(userId: string, skip = 0, take = 30) {
    return this.prisma.bodyRecord.findMany({
      where: { userId },
      skip,
      take,
      orderBy: { date: 'desc' },
    });
  }

  async findOne(id: string, userId: string) {
    const record = await this.prisma.bodyRecord.findUnique({
      where: { id },
    });

    if (!record || record.userId !== userId) {
      throw new NotFoundException('Body record not found');
    }

    return record;
  }

  async update(id: string, userId: string, updateDto: UpdateBodyRecordDto) {
    const record = await this.findOne(id, userId);

    return this.prisma.bodyRecord.update({
      where: { id },
      data: {
        weight: updateDto.weight ?? record.weight,
        bodyFatPercentage: updateDto.bodyFatPercentage ?? record.bodyFatPercentage,
        date: updateDto.date ? new Date(updateDto.date) : record.date,
        notes: updateDto.notes ?? record.notes,
      },
    });
  }

  async delete(id: string, userId: string) {
    await this.findOne(id, userId);
    return this.prisma.bodyRecord.delete({ where: { id } });
  }

  async getLatest(userId: string) {
    return this.prisma.bodyRecord.findFirst({
      where: { userId },
      orderBy: { date: 'desc' },
    });
  }

  async getTrendData(userId: string, days = 180) {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    return this.prisma.bodyRecord.findMany({
      where: {
        userId,
        date: { gte: startDate },
      },
      orderBy: { date: 'asc' },
      select: {
        date: true,
        weight: true,
        bodyFatPercentage: true,
      },
    });
  }

  async getStats(userId: string) {
    const records = await this.prisma.bodyRecord.findMany({
      where: { userId },
      orderBy: { date: 'desc' },
    });

    if (records.length === 0) {
      return null;
    }

    const latest = records[0];
    const oldest = records[records.length - 1];

    return {
      current: {
        weight: latest.weight,
        bodyFatPercentage: latest.bodyFatPercentage,
        date: latest.date,
      },
      change: {
        weight: latest.weight - oldest.weight,
        bodyFatPercentage: (latest.bodyFatPercentage ?? 0) - (oldest.bodyFatPercentage ?? 0),
      },
      records: records.length,
    };
  }
}
