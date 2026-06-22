import { NestFactory } from '@nestjs/core';
import { ValidationPipe, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import cookieParser from 'cookie-parser';
import helmet from 'helmet';
import { AppModule } from './app.module';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';
import { LoggingInterceptor } from './common/interceptors/logging.interceptor';
import { SensitiveMaskInterceptor } from './common/interceptors/sensitive-mask.interceptor';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    logger: ['error', 'warn', 'log', 'debug'],
  });

  const configService = app.get(ConfigService);
  const port = configService.get('APP_PORT', 4000);
  const frontendUrl = configService.get('FRONTEND_URL', 'http://localhost:3000');
  const adminUrl = configService.get('ADMIN_URL', 'http://localhost:3001');

  // 安全设置: Helmet
  app.use(helmet());

  // CORS: 允许前端和管理后台地址
  app.enableCors({
    origin: [frontendUrl, adminUrl],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  });

  // Cookie-Parser 解析器
  app.use(cookieParser());

  // 设置全局前缀 /api
  app.setGlobalPrefix('api');

  // 全局验证管道
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      disableErrorMessages: process.env.NODE_ENV === 'production',
    })
  );

  // 注册全局异常过滤器
  app.useGlobalFilters(new HttpExceptionFilter());

  // 注册全局拦截器
  app.useGlobalInterceptors(
    new LoggingInterceptor(),
    new SensitiveMaskInterceptor(),
  );

  await app.listen(port);

  Logger.log(`🚀 服务启动成功: http://localhost:${port}/api`, 'Bootstrap');
  Logger.log(`📝 前端地址: ${frontendUrl}`, 'Bootstrap');
  Logger.log(`🔧 管理后台: ${adminUrl}`, 'Bootstrap');
}

bootstrap();