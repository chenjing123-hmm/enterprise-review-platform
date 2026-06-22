import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Company } from './company.entity';
import { CompanyService } from './company.service';
import { CompanyController } from './company.controller';

/**
 * 企业模块 - 企业信息 CRUD、企业搜索
 * 提供企业列表搜索、详情查询接口
 * 支持 MySQL LIKE 模糊搜索和 FULLTEXT 全文索引
 */
@Module({
  imports: [TypeOrmModule.forFeature([Company])],
  controllers: [CompanyController],
  providers: [CompanyService],
  exports: [CompanyService, TypeOrmModule],
})
export class CompanyModule {}