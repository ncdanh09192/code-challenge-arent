import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaService } from './prisma.service';
import { AuthModule } from './auth/auth.module';
import { BodyRecordsModule } from './body-records/body-records.module';
import { MealsModule } from './meals/meals.module';
import { ExercisesModule } from './exercises/exercises.module';
import { DiaryModule } from './diary/diary.module';
import { ColumnsModule } from './columns/columns.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    AuthModule,
    BodyRecordsModule,
    MealsModule,
    ExercisesModule,
    DiaryModule,
    ColumnsModule,
  ],
  controllers: [AppController],
  providers: [AppService, PrismaService],
  exports: [PrismaService],
})
export class AppModule {}


