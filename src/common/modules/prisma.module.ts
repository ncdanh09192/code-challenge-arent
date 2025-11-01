import { Module } from '@nestjs/common';
import { PrismaService } from '../../prisma.service';

/**
 * Global Prisma module that provides and exports PrismaService
 * Import this module in feature modules that need database access
 */
@Module({
  providers: [PrismaService],
  exports: [PrismaService],
})
export class PrismaModule {}
