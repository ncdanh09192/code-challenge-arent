import { NestFactory } from '@nestjs/core';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { ValidationPipe, Logger } from '@nestjs/common';
import { AppModule } from './app.module';

const logger = new Logger('Bootstrap');

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

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
    .addTag('body-records', 'Body measurements and metrics')
    .addTag('meals', 'Meal tracking')
    .addTag('exercises', 'Exercise logging')
    .addTag('diary', 'Diary entries and daily goals')
    .addTag('columns', 'Health articles and blogs')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api-docs', app, document);

  const port = process.env.APP_PORT || 3003;
  await app.listen(port);

  logger.log('');
  logger.log('╔═══════════════════════════════════════════════════════════════╗');
  logger.log('║          🎉 Application Started Successfully! 🎉              ║');
  logger.log('╚═══════════════════════════════════════════════════════════════╝');
  logger.log('');
  logger.log(`🌐 API Server:     http://localhost:${port}`);
  logger.log(`📚 API Docs:       http://localhost:${port}/api-docs`);
  logger.log(`❤️  Health Check:   http://localhost:${port}/health`);
  logger.log('');
  logger.log('📧 Demo Credentials:');
  logger.log('   Email:    demo@example.com');
  logger.log('   Password: demo123456');
  logger.log('');
  logger.log('🔐 Admin Credentials:');
  logger.log('   Email:    admin@example.com');
  logger.log('   Password: demo123456');
  logger.log('');
  logger.log(`💡 Tip: Check http://localhost:${port}/api-docs to test all endpoints`);
  logger.log('');
}

bootstrap().catch((err) => {
  logger.error('Failed to start application:', err);
  process.exit(1);
});

