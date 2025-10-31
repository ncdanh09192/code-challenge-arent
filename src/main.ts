import { NestFactory } from '@nestjs/core';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { ValidationPipe, Logger } from '@nestjs/common';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const logger = new Logger('Bootstrap');

  // Enable CORS
  app.enableCors();

  // Global validation pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );

  // Swagger/OpenAPI Documentation
  const config = new DocumentBuilder()
    .setTitle('Health Management API')
    .setDescription('Backend API for health tracking application')
    .setVersion('1.0.0')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
      },
      'JWT',
    )
    .addTag('auth', 'Authentication endpoints')
    .addTag('users', 'User management')
    .addTag('body-records', 'Body measurements and metrics')
    .addTag('meals', 'Meal tracking')
    .addTag('exercises', 'Exercise logging')
    .addTag('diary', 'Diary entries')
    .addTag('daily-goals', 'Daily goals and achievement tracking')
    .addTag('columns', 'Health articles and blogs')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api-docs', app, document);

  const port = process.env.APP_PORT || 3000;
  await app.listen(port, () => {
    logger.log(`🚀 Server running on http://localhost:${port}`);
    logger.log(`📚 Swagger docs available at http://localhost:${port}/api-docs`);
  });
}

bootstrap().catch((err) => {
  console.error('Failed to start application:', err);
  process.exit(1);
});

