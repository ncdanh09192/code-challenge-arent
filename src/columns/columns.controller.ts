import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Param,
  Body,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { ROLES } from '../common/constants/roles';
import { ColumnsService } from './columns.service';
import { CreateColumnDto } from './dtos/create-column.dto';
import { UpdateColumnDto } from './dtos/update-column.dto';

@ApiTags('columns')
@Controller('columns')
export class ColumnsController {
  constructor(private columnsService: ColumnsService) {}

  // ============= Public Endpoints =============

  @Get('categories')
  @ApiOperation({ summary: 'Get all column categories' })
  @ApiResponse({
    status: 200,
    description: 'List of all column categories',
  })
  async getCategories() {
    return this.columnsService.getCategories();
  }

  @Get()
  @ApiOperation({ summary: 'Get all published columns' })
  @ApiResponse({
    status: 200,
    description: 'List of all published columns',
  })
  async getAllColumns() {
    return this.columnsService.getAllColumns();
  }

  @Get('category/:categoryId')
  @ApiOperation({ summary: 'Get published columns by category' })
  @ApiResponse({
    status: 200,
    description: 'List of columns in the specified category',
  })
  @ApiResponse({ status: 404, description: 'Category not found' })
  async getColumnsByCategory(@Param('categoryId') categoryId: string) {
    return this.columnsService.getColumnsByCategory(categoryId);
  }

  @Get('admin/my-columns')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(ROLES.ADMIN)
  @ApiBearerAuth('JWT')
  @ApiOperation({ summary: 'Get all columns created by current admin' })
  @ApiResponse({
    status: 200,
    description: 'List of admin columns',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - admin role required' })
  async getAdminColumns(@CurrentUser('id') adminId: string) {
    return this.columnsService.getAdminColumns(adminId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get column details by ID (increments view count)' })
  @ApiResponse({
    status: 200,
    description: 'Column details with incremented view count',
  })
  @ApiResponse({ status: 404, description: 'Column not found or not published' })
  async getColumnDetails(@Param('id') id: string) {
    return this.columnsService.getColumnDetails(id);
  }

  // ============= Admin Endpoints =============

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(ROLES.ADMIN)
  @HttpCode(HttpStatus.CREATED)
  @ApiBearerAuth('JWT')
  @ApiOperation({ summary: 'Create new column (admin only)' })
  @ApiResponse({
    status: 201,
    description: 'Column created successfully',
  })
  @ApiResponse({ status: 400, description: 'Invalid category' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - admin role required' })
  async createColumn(
    @CurrentUser('id') adminId: string,
    @Body() createDto: CreateColumnDto,
  ) {
    return this.columnsService.createColumn(adminId, createDto);
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(ROLES.ADMIN)
  @ApiBearerAuth('JWT')
  @ApiOperation({ summary: 'Update column (admin only)' })
  @ApiResponse({
    status: 200,
    description: 'Column updated successfully',
  })
  @ApiResponse({ status: 400, description: 'Invalid category' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - not column author' })
  @ApiResponse({ status: 404, description: 'Column not found' })
  async updateColumn(
    @Param('id') id: string,
    @CurrentUser('id') adminId: string,
    @Body() updateDto: UpdateColumnDto,
  ) {
    return this.columnsService.updateColumn(id, adminId, updateDto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(ROLES.ADMIN)
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiBearerAuth('JWT')
  @ApiOperation({ summary: 'Delete column (admin only)' })
  @ApiResponse({
    status: 204,
    description: 'Column deleted successfully',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - not column author' })
  @ApiResponse({ status: 404, description: 'Column not found' })
  async deleteColumn(
    @Param('id') id: string,
    @CurrentUser('id') adminId: string,
  ) {
    return this.columnsService.deleteColumn(id, adminId);
  }
}
