import { Module } from '@nestjs/common';
import { PrismaModule } from '../common/modules/prisma.module';
import { BodyRecordsService } from './body-records.service';
import { BodyRecordsController } from './body-records.controller';

@Module({
  imports: [PrismaModule],
  controllers: [BodyRecordsController],
  providers: [BodyRecordsService],
  exports: [BodyRecordsService],
})
export class BodyRecordsModule {}
