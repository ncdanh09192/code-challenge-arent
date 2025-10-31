import { Module } from '@nestjs/common';
import { BodyRecordsService } from './body-records.service';
import { BodyRecordsController } from './body-records.controller';
import { PrismaService } from '../prisma.service';

@Module({
  controllers: [BodyRecordsController],
  providers: [BodyRecordsService, PrismaService],
  exports: [BodyRecordsService],
})
export class BodyRecordsModule {}
