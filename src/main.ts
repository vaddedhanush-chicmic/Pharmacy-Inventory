import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';
import { TransformInterceptor } from './common/interceptors/transform.interceptor';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const localhostOrigins = [
    'http://localhost:5173',
    'http://localhost:3001',
    'http://localhost:3002',
  ];
  const configuredOrigins = (process.env.FRONTEND_ORIGINS ?? '')
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean);
  const allowedOrigins = new Set([...localhostOrigins, ...configuredOrigins]);

  // Enable CORS for frontend
  app.enableCors({
    origin: (origin, callback) => {
      if (!origin) {
        callback(null, true);
        return;
      }

      const isNgrokOrigin =
        /^https:\/\/[a-z0-9-]+\.ngrok(-free)?\.app$/i.test(origin) ||
        /^https:\/\/[a-z0-9-]+\.ngrok(-free)?\.dev$/i.test(origin) ||
        /^https:\/\/[a-z0-9-]+\.ngrok\.io$/i.test(origin);

      if (allowedOrigins.has(origin) || isNgrokOrigin) {
        callback(null, true);
        return;
      }

      callback(new Error(`Origin ${origin} is not allowed by CORS`), false);
    },
    credentials: true,
  });

  // Set global prefix
  app.setGlobalPrefix('api');

  // Global Exception Filter
  app.useGlobalFilters(new HttpExceptionFilter());

  // Global Transform Interceptor
  app.useGlobalInterceptors(new TransformInterceptor());

  // Global Validation Pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  // Swagger Configuration
  const config = new DocumentBuilder()
    .setTitle('Pharmacy Inventory API')
    .setDescription('The Pharmacy Inventory Management System API description')
    .setVersion('1.0')
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  const port = process.env.PORT ?? 3000;
  await app.listen(port);
  console.log(`Application is running on: http://localhost:${port}/api`);
  console.log(`Swagger Docs available at: http://localhost:${port}/api/docs`);
}
bootstrap();
