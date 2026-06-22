/**
 * 企业相关类型定义
 * 包含企业详细信息响应、搜索结果及搜索参数等
 */

/** 企业详细信息响应 */
export interface CompanyResponse {
  /** 企业唯一标识 */
  id: string;
  /** 企业全称 */
  name: string;
  /** 企业简称 */
  shortName?: string;
  /** 统一社会信用代码 */
  creditCode: string;
  /** 所属行业 */
  industry: string;
  /** 企业规模 */
  scale: string;
  /** 企业 Logo 地址 */
  logo?: string;
  /** 企业官网 */
  website?: string;
  /** 企业简介 */
  description?: string;
  /** 企业地址 */
  address?: string;
  /** 所在城市 */
  city?: string;
  /** 所在省份 */
  province?: string;
  /** 成立日期 */
  establishedDate?: string;
  /** 综合评分（平均值） */
  avgRating: number;
  /** 点评总数 */
  reviewCount: number;
  /** 薪资评分 */
  salaryRating: number;
  /** 环境评分 */
  environmentRating: number;
  /** 发展评分 */
  growthRating: number;
  /** 管理评分 */
  managementRating: number;
  /** 工作生活平衡评分 */
  workLifeBalanceRating: number;
  /** 审核状态 */
  auditStatus: string;
  /** 创建时间 */
  createdAt: string;
  /** 更新时间 */
  updatedAt: string;
}

/** 企业搜索结果项 */
export interface CompanySearchResult {
  /** 企业唯一标识 */
  id: string;
  /** 企业全称 */
  name: string;
  /** 企业简称 */
  shortName?: string;
  /** 所属行业 */
  industry: string;
  /** 企业 Logo 地址 */
  logo?: string;
  /** 企业规模 */
  scale: string;
  /** 所在城市 */
  city?: string;
  /** 综合评分 */
  avgRating: number;
  /** 点评总数 */
  reviewCount: number;
}

/** 企业搜索参数 */
export interface CompanySearchParams {
  /** 搜索关键词（企业名称） */
  keyword?: string;
  /** 所属行业 */
  industry?: string;
  /** 企业规模 */
  scale?: string;
  /** 所在城市 */
  city?: string;
  /** 综合评分最低值 */
  minRating?: number;
  /** 综合评分最高值 */
  maxRating?: number;
  /** 排序字段 */
  sortBy?: 'avgRating' | 'reviewCount' | 'createdAt';
  /** 排序方向 */
  sortOrder?: 'asc' | 'desc';
  /** 当前页码（从 1 开始） */
  page: number;
  /** 每页条数 */
  pageSize: number;
}