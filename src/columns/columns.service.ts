import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { CreateColumnDto } from './dtos/create-column.dto';
import { UpdateColumnDto } from './dtos/update-column.dto';

@Injectable()
export class ColumnsService {
  constructor(private prisma: PrismaService) {}

  // ============= Public Methods (No Auth Required) =============

  async getCategories() {
    return this.prisma.columnCategory.findMany({
      orderBy: { display_order: 'asc' },
    });
  }

  async getAllColumns() {
    return this.prisma.column.findMany({
      where: { published: true },
      include: {
        category: true,
        admin: {
          select: {
            id: true,
            username: true,
            firstName: true,
            lastName: true,
            avatar_url: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async getColumnsByCategory(categoryId: string) {
    const category = await this.prisma.columnCategory.findUnique({
      where: { id: categoryId },
    });

    if (!category) {
      throw new NotFoundException('Category not found');
    }

    return this.prisma.column.findMany({
      where: {
        categoryId,
        published: true,
      },
      include: {
        category: true,
        admin: {
          select: {
            id: true,
            username: true,
            firstName: true,
            lastName: true,
            avatar_url: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async getColumnDetails(id: string) {
    const column = await this.prisma.column.findUnique({
      where: { id },
      include: {
        category: true,
        admin: {
          select: {
            id: true,
            username: true,
            firstName: true,
            lastName: true,
            avatar_url: true,
          },
        },
      },
    });

    if (!column) {
      throw new NotFoundException('Column not found');
    }

    if (!column.published) {
      throw new NotFoundException('Column not found');
    }

    // Increment view count asynchronously
    await this.prisma.column.update({
      where: { id },
      data: { view_count: { increment: 1 } },
    });

    return column;
  }

  // ============= Admin Methods (Auth + Admin Role Required) =============

  async createColumn(adminId: string, createDto: CreateColumnDto) {
    // Validate category exists
    const category = await this.prisma.columnCategory.findUnique({
      where: { id: createDto.categoryId },
    });

    if (!category) {
      throw new BadRequestException('Category does not exist');
    }

    return this.prisma.column.create({
      data: {
        adminId,
        title: createDto.title,
        content: createDto.content,
        categoryId: createDto.categoryId,
        image_url: createDto.image_url,
        published: createDto.published ?? false,
      },
      include: {
        category: true,
        admin: {
          select: {
            id: true,
            username: true,
            firstName: true,
            lastName: true,
            avatar_url: true,
          },
        },
      },
    });
  }

  async updateColumn(
    id: string,
    adminId: string,
    updateDto: UpdateColumnDto,
  ) {
    const column = await this.prisma.column.findUnique({
      where: { id },
    });

    if (!column) {
      throw new NotFoundException('Column not found');
    }

    if (column.adminId !== adminId) {
      throw new ForbiddenException(
        'You do not have permission to update this column',
      );
    }

    // Validate category if it's being changed
    if (updateDto.categoryId) {
      const category = await this.prisma.columnCategory.findUnique({
        where: { id: updateDto.categoryId },
      });

      if (!category) {
        throw new BadRequestException('Category does not exist');
      }
    }

    return this.prisma.column.update({
      where: { id },
      data: {
        title: updateDto.title ?? column.title,
        content: updateDto.content ?? column.content,
        categoryId: updateDto.categoryId ?? column.categoryId,
        image_url: updateDto.image_url ?? column.image_url,
        published: updateDto.published ?? column.published,
      },
      include: {
        category: true,
        admin: {
          select: {
            id: true,
            username: true,
            firstName: true,
            lastName: true,
            avatar_url: true,
          },
        },
      },
    });
  }

  async deleteColumn(id: string, adminId: string) {
    const column = await this.prisma.column.findUnique({
      where: { id },
    });

    if (!column) {
      throw new NotFoundException('Column not found');
    }

    if (column.adminId !== adminId) {
      throw new ForbiddenException(
        'You do not have permission to delete this column',
      );
    }

    return this.prisma.column.delete({
      where: { id },
    });
  }

  async getAdminColumns(adminId: string) {
    return this.prisma.column.findMany({
      where: { adminId },
      include: {
        category: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }
}
