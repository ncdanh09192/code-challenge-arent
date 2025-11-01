import {
  Injectable,
  BadRequestException,
  UnauthorizedException,
  Logger,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { User } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../prisma.service';
import { ROLES } from '../common/constants/roles';
import { RegisterDto } from './dtos/register.dto';
import { LoginDto } from './dtos/login.dto';
import { JwtPayload } from './interfaces/jwt-payload.interface';

interface TokenPayload {
  sub: string;
  email: string;
  username: string;
  role: string;
}

export interface UserWithoutPassword {
  id: string;
  email: string;
  username: string;
  firstName: string;
  lastName: string;
  role: string;
  createdAt: Date;
  updatedAt: Date;
}

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {}

  /**
   * Register a new user with email, username, and password
   * Validates that email/username are not already in use, hashes the password,
   * and generates JWT access/refresh tokens for immediate login
   * @param registerDto - User registration details (email, username, password, firstName, lastName)
   * @returns User profile (without password) and JWT tokens
   * @throws BadRequestException if email or username already exists
   */
  async register(registerDto: RegisterDto) {
    const { email, username, password, firstName, lastName } = registerDto;

    // Check if user already exists
    const existingUser = await this.prisma.user.findFirst({
      where: {
        OR: [{ email }, { username }],
      },
    });

    if (existingUser) {
      throw new BadRequestException('Email or username already exists');
    }

    // Hash password with bcrypt (10 salt rounds for security)
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user in database
    const user = await this.prisma.user.create({
      data: {
        email,
        username,
        password: hashedPassword,
        firstName,
        lastName,
        role: ROLES.USER,
      },
    });

    // Generate JWT tokens for immediate authentication
    const tokens = this.generateTokens({
      sub: user.id,
      email: user.email,
      username: user.username,
      role: user.role,
    });

    this.logger.debug(`User registered: ${user.email}`);

    return {
      user: this.formatUser(user),
      ...tokens,
    };
  }

  /**
   * Authenticate user with email and password
   * Verifies credentials and returns JWT tokens if valid
   * @param loginDto - Login credentials (email, password)
   * @returns User profile (without password) and JWT tokens
   * @throws UnauthorizedException if email not found or password is incorrect
   */
  async login(loginDto: LoginDto) {
    const { email, password } = loginDto;

    // Find user by email
    const user = await this.prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      throw new UnauthorizedException('Invalid email or password');
    }

    // Verify password against bcrypt hash
    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid email or password');
    }

    // Generate JWT tokens for authenticated session
    const tokens = this.generateTokens({
      sub: user.id,
      email: user.email,
      username: user.username,
      role: user.role,
    });

    this.logger.debug(`User logged in: ${user.email}`);

    return {
      user: this.formatUser(user),
      ...tokens,
    };
  }

  async refreshToken(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    const tokens = this.generateTokens({
      sub: user.id,
      email: user.email,
      username: user.username,
      role: user.role,
    });

    return tokens;
  }

  /**
   * Generate access and refresh JWT tokens for user authentication
   * Access token expires in 1 day (configurable via JWT_EXPIRATION)
   * Refresh token expires in 7 days (configurable via JWT_REFRESH_EXPIRATION)
   * @param payload - Token payload containing user ID, email, username, and role
   * @returns Object with accessToken and refreshToken
   */
  private generateTokens(payload: TokenPayload) {
    const accessToken = this.jwtService.sign(payload, {
      expiresIn: this.configService.get('JWT_EXPIRATION', '1d'),
    });

    const refreshToken = this.jwtService.sign(payload, {
      expiresIn: this.configService.get(
        'JWT_REFRESH_EXPIRATION',
        '7d',
      ),
    });

    return { accessToken, refreshToken };
  }

  /**
   * Format user object by removing sensitive information (password)
   * Used to return safe user data to client
   * @param user - User object from database (includes password field)
   * @returns User object without password field
   */
  private formatUser(user: User): UserWithoutPassword {
    const { password, ...rest } = user;
    return rest as UserWithoutPassword;
  }
}
