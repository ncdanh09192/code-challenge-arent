import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './common/modules/prisma.module';
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
    PrismaModule,
    AuthModule,
    BodyRecordsModule,
    MealsModule,
    ExercisesModule,
    DiaryModule,
    ColumnsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
  exports: [PrismaModule],
})
export class AppModule {}


