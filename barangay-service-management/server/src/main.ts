import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { ConfigService } from '@nestjs/config';
import { NestExpressApplication } from '@nestjs/platform-express';
import * as helmet from 'helmet';
import { join } from 'path';
import { AppModule } from './app.module';
import { AuthService } from './auth/auth.service';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule, {
    rawBody: true, // Enable raw body for webhook signature verification
  });
  const configService = app.get(ConfigService);

  // Global prefix
  app.setGlobalPrefix('api');

  // Serve static files (certificates)
  app.useStaticAssets(join(__dirname, '..', 'uploads'), {
    prefix: '/',
  });

  // Security - Configure Helmet to allow webhooks
  app.use(
    helmet.default({
      contentSecurityPolicy: false, // Disable CSP for webhooks
    }),
  );

  // CORS - Allow all origins in development for testing
  const nodeEnv = configService.get('nodeEnv');
  app.enableCors({
    origin: nodeEnv === 'development' ? true : configService.get('cors.allowedOrigins'),
    credentials: true,
  });

  // Validation pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  // Swagger documentation
  const config = new DocumentBuilder()
    .setTitle('Barangay Service Management System')
    .setDescription('API documentation for Barangay Service Management System')
    .setVersion('1.0')
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  // Create initial admin if none exists
  const authService = app.get(AuthService);
  await authService.createInitialAdmin();

  const port = configService.get('port');
  await app.listen(port);
  
  // Log startup information including webhook configuration
  const metaVerifyToken = configService.get('meta.verifyToken');
  console.log(`Application is running on: http://localhost:${port}/api`);
  console.log(`Swagger docs available at: http://localhost:${port}/api/docs`);
  console.log(`\n=== MESSENGER WEBHOOK INFO ===`);
  console.log(`Webhook Endpoint: http://localhost:${port}/api/chatbot/webhook`);
  console.log(`Verify Token: ${metaVerifyToken}`);
  console.log(`Test with: curl "http://localhost:${port}/api/chatbot/webhook?hub.mode=subscribe&hub.verify_token=${metaVerifyToken}&hub.challenge=12345"`);
  console.log(`Expected response: 12345`);
  console.log(`==============================\n`);
}
bootstrap();
