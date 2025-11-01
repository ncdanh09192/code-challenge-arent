# Source Code Structure

This directory contains the application's source code organized in a modular, feature-based architecture following NestJS best practices.

## 📁 Directory Organization

```
src/
├── auth/                      # Authentication module
│   ├── auth.service.ts       # User registration, login, token generation
│   ├── auth.controller.ts    # HTTP endpoints for auth operations
│   ├── strategies/           # Passport strategies
│   │   └── jwt.strategy.ts   # JWT validation strategy
│   ├── interfaces/           # TypeScript interfaces
│   │   └── jwt-payload.interface.ts
│   ├── dtos/                 # Data transfer objects
│   │   ├── register.dto.ts   # Registration validation schema
│   │   └── login.dto.ts      # Login validation schema
│   └── auth.module.ts        # Module configuration & DI setup
│
├── body-records/             # Body measurements tracking module
│   ├── body-records.service.ts
│   ├── body-records.controller.ts
│   ├── dtos/
│   │   ├── create-body-record.dto.ts
│   │   └── update-body-record.dto.ts
│   └── body-records.module.ts
│
├── meals/                    # Meal tracking module
│   ├── meals.service.ts
│   ├── meals.controller.ts
│   ├── dtos/
│   │   └── create-user-meal.dto.ts
│   └── meals.module.ts
│
├── exercises/                # Exercise tracking module
│   ├── exercises.service.ts
│   ├── exercises.controller.ts
│   ├── dtos/
│   │   └── create-user-exercise.dto.ts
│   └── exercises.module.ts
│
├── diary/                    # Diary entries & daily goals module
│   ├── diary.service.ts      # Entry management & achievement rate calculation
│   ├── diary.controller.ts
│   ├── dtos/
│   │   └── create-diary-entry.dto.ts
│   └── diary.module.ts
│
├── columns/                  # Health articles/blog module
│   ├── columns.service.ts
│   ├── columns.controller.ts
│   ├── dtos/
│   │   ├── create-column.dto.ts
│   │   └── update-column.dto.ts
│   └── columns.module.ts
│
├── common/                   # Shared utilities & infrastructure
│   ├── guards/               # Authorization & authentication guards
│   │   ├── jwt-auth.guard.ts # JWT token validation guard (applied to protected routes)
│   │   └── roles.guard.ts    # Role-based access control guard (admin-only endpoints)
│   ├── decorators/           # Custom decorators for metadata extraction
│   │   ├── current-user.decorator.ts # Extract user from JWT payload
│   │   └── roles.decorator.ts        # Specify required roles for endpoint
│   ├── pipes/                # Custom data validation & transformation
│   │   └── parse-date.pipe.ts # Validate date format (YYYY-MM-DD)
│   ├── constants/            # Application-wide constants
│   │   └── roles.ts          # User role definitions
│   └── modules/              # Shared modules
│       └── prisma.module.ts  # Centralized Prisma ORM provider
│
├── app.module.ts             # Root module - imports all feature modules
├── app.controller.ts         # Root controller
├── app.service.ts            # Root service
├── prisma.service.ts         # Prisma ORM client wrapper
└── main.ts                   # Application bootstrap entry point
```

## 🏗️ Architectural Patterns

### 1. **Three-Tier Architecture**

The application follows a classic three-tier architecture pattern:

```
HTTP Layer (Controllers)
        ↓
Business Logic Layer (Services)
        ↓
Data Access Layer (Prisma ORM)
        ↓
PostgreSQL Database
```

Each feature module follows this pattern consistently:
- **Controller** - HTTP routing, request handling, response formatting
- **Service** - Business logic, data processing, validation
- **DTO** - Request validation using class-validator decorators
- **Module** - Dependency injection configuration

### 2. **Dependency Injection (DI)**

NestJS built-in DI container manages all dependencies:

```typescript
// Services are automatically injected into controllers
@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}
}

// PrismaService is provided once globally via PrismaModule
// All services depend on it without multiple instances
@Module({
  providers: [PrismaService],
  exports: [PrismaService],
})
export class PrismaModule {}
```

**Key Benefit**: Single PrismaService instance prevents multiple database connections.

### 3. **Guards & Security**

Guards implement cross-cutting authorization logic:

```typescript
// Applied to protected routes
@UseGuards(JwtAuthGuard)
@Get('me')
getCurrentUser(@CurrentUser() userId: string) { ... }

// Applied to admin-only endpoints
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('admin')
@Post()
createColumn(@Body() createColumnDto: CreateColumnDto) { ... }
```

**Components**:
- `JwtAuthGuard` - Validates JWT token, extracts user from payload
- `RolesGuard` - Checks user role against @Roles decorator
- `@CurrentUser()` - Custom decorator that extracts userId from JWT

### 4. **Data Transfer Objects (DTOs)**

DTOs provide request validation using class-validator decorators:

```typescript
export class RegisterDto {
  @IsEmail()
  email: string;

  @IsString()
  @MinLength(3)
  username: string;

  @IsString()
  @MinLength(8)
  password: string;

  @IsString()
  firstName: string;

  @IsString()
  lastName: string;
}
```

**NestJS Features**:
- Automatic validation via `ValidationPipe`
- Type transformation (strings to numbers, dates)
- Whitelist enabled - rejects unknown fields
- Descriptive error messages on validation failures

### 5. **Custom Pipes**

Pipes transform and validate request data:

```typescript
@Injectable()
export class ParseDatePipe implements PipeTransform<string, Date> {
  transform(value: string): Date {
    // Validates YYYY-MM-DD format
    // Returns Date object if valid, throws BadRequestException if not
  }
}

// Applied to route parameters
@Get('user/date/:date')
getMealsByDate(@Param('date', ParseDatePipe) date: Date) { ... }
```

### 6. **Service Pattern with Type Safety**

Services use Prisma for type-safe database operations:

```typescript
@Injectable()
export class AuthService {
  async register(registerDto: RegisterDto) {
    // Prisma provides full type safety and autocomplete
    const user = await this.prisma.user.create({
      data: { ...registerDto }
    });
    return this.formatUser(user);
  }

  private formatUser(user: User): UserWithoutPassword {
    // User interface is fully typed from Prisma
    const { password, ...rest } = user;
    return rest;
  }
}
```

### 7. **Achievement Rate Calculation**

The diary service implements automatic achievement rate calculation:

```typescript
async createEntry(userId: string, createDiaryEntryDto: CreateDiaryEntryDto) {
  // 1. Create the diary entry
  const entry = await this.prisma.diaryEntry.create({ ... });

  // 2. Find or create DailyGoal for today
  const today = new Date().toISOString().split('T')[0];
  const dailyGoal = await this.prisma.dailyGoal.upsert({
    where: { userId_date: { userId, date } },
    create: { userId, date, ... },
    update: { diary_written: { increment: 1 } }
  });

  // 3. Recalculate achievement rate
  const total = dailyGoal.meals_logged +
                dailyGoal.exercises_logged +
                dailyGoal.diary_written;
  const targetTotal = dailyGoal.target_meals +
                      dailyGoal.target_exercises +
                      dailyGoal.target_diary;
  const achievementRate = (total / targetTotal) * 100;

  // 4. Update DailyGoal with new rate
  return this.prisma.dailyGoal.update({ ... });
}
```

## 🔐 Security Implementation

### Password Hashing
- **Library**: bcrypt with 10 salt rounds
- **Location**: `auth.service.ts:register()`, `auth.service.ts:login()`
- **Pattern**: Hash on registration, compare on login

```typescript
// Registration: hash password
const hashedPassword = await bcrypt.hash(password, 10);

// Login: compare password against hash
const isPasswordValid = await bcrypt.compare(password, user.password);
```

### JWT Token Pattern
- **Access Token**: 1 day expiration (configurable via `JWT_EXPIRATION`)
- **Refresh Token**: 7 days expiration (configurable via `JWT_REFRESH_EXPIRATION`)
- **Location**: `auth.service.ts:generateTokens()`

```typescript
const accessToken = this.jwtService.sign(payload, {
  expiresIn: this.configService.get('JWT_EXPIRATION', '1d'),
});

const refreshToken = this.jwtService.sign(payload, {
  expiresIn: this.configService.get('JWT_REFRESH_EXPIRATION', '7d'),
});
```

### Ownership Verification
- All user-specific endpoints filter data by `userId` from JWT
- Users cannot access other users' data
- Admin endpoints protected by `@Roles('admin')` decorator

## 📝 Key Design Decisions

### 1. **PrismaModule for Single Instance**
- **Problem**: 5 feature modules each creating PrismaService instances = multiple DB connections
- **Solution**: Created centralized `PrismaModule` that all features import
- **Result**: Single PrismaService instance, connection pooling efficiency

### 2. **Type Safety Over `any`**
- **Replaced**: `user: any` in formatUser() with `user: User` from @prisma/client
- **Benefit**: Full TypeScript type checking, IDE autocomplete, compile-time error detection

### 3. **Role Constants Instead of Strings**
- **File**: `common/constants/roles.ts`
- **Pattern**: `ROLES.ADMIN`, `ROLES.USER` instead of hardcoded `'admin'`, `'user'`
- **Benefit**: Single source of truth, prevents typos, refactor-safe

### 4. **Custom Date Pipe for Validation**
- **Pattern**: `ParseDatePipe` for YYYY-MM-DD format validation
- **Benefit**: Consistent date handling across endpoints, early validation before service logic

### 5. **Separate Update DTOs**
- **File**: `create-body-record.dto.ts` and `update-body-record.dto.ts`
- **Pattern**: Update DTOs have `@IsOptional()` on all fields for partial updates
- **Benefit**: Strict validation for creation, flexible for updates

## 🧪 Testing Strategy

Each module includes `.spec.ts` files using Jest:

```typescript
describe('AuthService', () => {
  let service: AuthService;
  let prismaService: PrismaService;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [AuthService, PrismaService],
    }).compile();

    service = module.get(AuthService);
    prismaService = module.get(PrismaService);
  });

  it('should register user with hashed password', async () => {
    // Test implementation
  });
});
```

## 📚 Extending the Application

To add a new feature:

1. **Create feature module** `src/new-feature/`
2. **Define database model** in `prisma/schema.prisma`
3. **Create DTO** for request validation
4. **Implement service** with business logic
5. **Create controller** with HTTP endpoints
6. **Add to AppModule** imports
7. **Write tests** in `.spec.ts` files

Example: Adding a workout tracking feature:
```typescript
@Module({
  imports: [PrismaModule],
  controllers: [WorkoutController],
  providers: [WorkoutService],
})
export class WorkoutModule {}
```

## 📖 Related Documentation

- **Main README.md** - Project overview, setup, deployment
- **Diagrams.png** - Complete database schema with all relationships
- **prisma/schema.prisma** - Database model definitions
- **package.json** - Dependencies and scripts
- **.env.example** - Environment variables template

## 🔗 NestJS Core Concepts Used

| Concept | Location | Purpose |
|---------|----------|---------|
| **Modules** | `*.module.ts` | Organize related features, dependency injection |
| **Controllers** | `*.controller.ts` | HTTP routing and request handling |
| **Services** | `*.service.ts` | Business logic and data processing |
| **Guards** | `common/guards/` | Authorization and authentication |
| **Pipes** | `common/pipes/` | Data validation and transformation |
| **Decorators** | `common/decorators/` | Custom metadata and parameter extraction |
| **Providers** | Module configuration | Register services and utilities for DI |
| **Exports** | Module configuration | Share services across modules |

---

**Last Updated**: November 2025
**NestJS Version**: Latest
**TypeScript**: Strict mode enabled
