import { Module } from '@nestjs/common';
import { ExercisesService } from './exercises.service';
import { ExercisesController } from './exercises.controller';
import { PrismaService } from '../prisma.service';

@Module({
  controllers: [ExercisesController],
  providers: [ExercisesService, PrismaService],
  exports: [ExercisesService],
})
export class ExercisesModule {}
