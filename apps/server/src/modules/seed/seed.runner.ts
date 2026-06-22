/**
 * 种子数据导入启动器
 * 用法：npx ts-node src/modules/seed/seed.runner.ts
 */
import { NestFactory } from '@nestjs/core';
import { AppModule } from '../../app.module';
import { SeedService } from './seed.service';

async function bootstrap() {
  const app = await NestFactory.createApplicationContext(AppModule);
  const seedService = app.get(SeedService);

  const csvPath = process.env.SEED_CSV_PATH || '../../kjxb_public_company_reviews_detailed_summary.csv';

  console.log('=== 种子数据导入开始 ===');
  console.log(`CSV 路径: ${csvPath}`);

  try {
    // 1. 导入公司数据
    console.log('\n[1/2] 导入公司数据...');
    const companyResult = await seedService.importCompanies(csvPath);
    console.log(`  新增: ${companyResult.imported}, 已存在: ${companyResult.skipped}, 失败: ${companyResult.errors.length}`);

    // 2. 导入评价数据
    console.log('\n[2/2] 导入评价数据...');
    const reviewResult = await seedService.importReviews(csvPath);
    console.log(`  新增: ${reviewResult.imported}, 跳过: ${reviewResult.skipped}, 失败: ${reviewResult.errors.length}`);

    console.log('\n=== 种子数据导入完成 ===');
  } catch (error) {
    console.error('种子数据导入失败:', error);
    process.exit(1);
  }

  await app.close();
  process.exit(0);
}

bootstrap();