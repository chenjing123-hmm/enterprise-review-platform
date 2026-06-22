import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';
import { AuthModule } from './modules/auth/auth.module';
import { UserModule } from './modules/user/user.module';
import { CompanyModule } from './modules/company/company.module';
import { ReviewModule } from './modules/review/review.module';
import { AuditModule } from './modules/audit/audit.module';
import { SensitiveWordModule } from './modules/sensitive-word/sensitive-word.module';
import { OcrModule } from './modules/ocr/ocr.module';
import { ComplaintModule } from './modules/complaint/complaint.module';
import { UploadModule } from './modules/upload/upload.module';
import { RiskModule } from './modules/risk/risk.module';
import { ExportModule } from './modules/export/export.module';
import { EncryptionModule } from './modules/encryption/encryption.module';
import { DataRetentionModule } from './modules/data-retention/data-retention.module';
import { SeedModule } from './modules/seed/seed.module';

@Module({
  imports: [
    // ─── 环境变量配置 ───
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env', '.env.local'],
    }),

    // ─── 数据库连接 (MySQL) ───
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: 'mysql' as const,
        host: configService.get('DB_HOST', 'localhost'),
        port: configService.get<number>('DB_PORT', 3306),
        username: configService.get('DB_USERNAME', 'root'),
        password: configService.get('DB_PASSWORD', '') as string,
        database: configService.get('DB_DATABASE', 'enterprise_review') as string,
        entities: [__dirname + '/**/*.entity{.ts,.js}'],
        synchronize: configService.get('NODE_ENV') !== 'production',
        logging: configService.get('NODE_ENV') === 'development',
        timezone: '+08:00',
        charset: 'utf8mb4',
      }),
    }),

    // ─── 限流模块 (全局100次/分钟) ───
    ThrottlerModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: () => ({
        throttlers: [
          {
            ttl: 60000,   // 时间窗口: 60秒
            limit: 100,    // 限制: 100次请求
          },
        ],
      }),
    }),

    // ─── 业务模块 ───
    AuthModule,
    UserModule,
    CompanyModule,
    ReviewModule,
    AuditModule,
    SensitiveWordModule,
    OcrModule,
    ComplaintModule,
    UploadModule,
    RiskModule,
    ExportModule,
    EncryptionModule,
    DataRetentionModule,
    SeedModule,
  ],
  providers: [
    // 全局限流守卫
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule {}