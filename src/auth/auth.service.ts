import {
  Injectable,
  BadRequestException,
  UnauthorizedException,
  Logger,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
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

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
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

    // Generate tokens
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

  async login(loginDto: LoginDto) {
    const { email, password } = loginDto;

    // Find user by email
    const user = await this.prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      throw new UnauthorizedException('Invalid email or password');
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid email or password');
    }

    // Generate tokens
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

  private formatUser(user: any): UserWithoutPassword {
    const { password, ...rest } = user;
    return rest as UserWithoutPassword;
  }
}
