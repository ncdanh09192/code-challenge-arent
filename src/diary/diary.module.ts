import { Module } from '@nestjs/common';
import { PrismaModule } from '../common/modules/prisma.module';
import { DiaryService } from './diary.service';
import { DiaryController } from './diary.controller';

@Module({
  imports: [PrismaModule],
  controllers: [DiaryController],
  providers: [DiaryService],
  exports: [DiaryService],
})
export class DiaryModule {}
