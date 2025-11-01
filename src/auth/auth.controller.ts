import {
  Controller,
  Post,
  Get,
  Body,
  UseGuards,
  Request,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { Request as ExpressRequest } from 'express';
import { AuthGuard } from '@nestjs/passport';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiBody,
} from '@nestjs/swagger';
import { AuthService, UserWithoutPassword } from './auth.service';
import { RegisterDto } from './dtos/register.dto';
import { LoginDto } from './dtos/login.dto';

interface AuthenticatedUser {
  id: string;
  email: string;
  username: string;
  role: string;
}

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Register a new user' })
  @ApiResponse({
    status: 201,
    description: 'User registered successfully',
    schema: {
      example: {
        user: {
          id: 'clx123',
          email: 'john@example.com',
          username: 'johndoe',
          firstName: 'John',
          lastName: 'Doe',
          role: 'user',
          createdAt: '2025-10-31T15:00:00Z',
          updatedAt: '2025-10-31T15:00:00Z',
        },
        accessToken: 'eyJhbGc...',
        refreshToken: 'eyJhbGc...',
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Email or username already exists',
  })
  async register(@Body() registerDto: RegisterDto) {
    return this.authService.register(registerDto);
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'User login' })
  @ApiBody({
    description: 'Login credentials (pre-filled with demo account)',
    type: LoginDto,
  })
  @ApiResponse({
    status: 200,
    description: 'Login successful',
    schema: {
      example: {
        user: {
          id: 'clx123',
          email: 'demo@example.com',
          username: 'demouser',
          role: 'user',
        },
        accessToken: 'eyJhbGc...',
        refreshToken: 'eyJhbGc...',
      },
    },
  })
  @ApiResponse({
    status: 401,
    description: 'Invalid email or password',
  })
  async login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto);
  }

  @Post('refresh')
  @UseGuards(AuthGuard('jwt'))
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth('JWT')
  @ApiOperation({ summary: 'Refresh access token' })
  @ApiResponse({
    status: 200,
    description: 'Token refreshed successfully',
  })
  async refreshToken(@Request() req: ExpressRequest) {
    const user = req.user as AuthenticatedUser;
    return this.authService.refreshToken(user.id);
  }

  @Get('me')
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth('JWT')
  @ApiOperation({ summary: 'Get current user information' })
  @ApiResponse({
    status: 200,
    description: 'Current user info',
  })
  async getCurrentUser(@Request() req: ExpressRequest) {
    return req.user;
  }
}
